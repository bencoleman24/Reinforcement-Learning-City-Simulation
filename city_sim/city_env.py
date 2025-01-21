import random
import numpy as np
import gym
from gym import spaces

from government import Government
from household import Household
from raw_material_firm import RawMaterialFirm
from manufacturer_firm import ManufacturerFirm
from retail_firm import RetailFirm
from firm import Firm

class CityEnv(gym.Env):
  
    def __init__(
        self,
        num_households=50,
        num_raw_firms=2,
        num_manu_firms=1,
        num_retail_firms=1,
        num_generic_firms=0,
        episode_length=60,
        infra_decay_rate=0.01,
        shock_probability=0.0,
        shock_type="raw_cut",
        demand_sensitivity=0.35,
        inflation_rate=0.0,
        household_cost_of_living=7.0,
        household_wage_min=13,
        household_wage_max=17,
        essential_goods_demand=1.0,
        reward_mode="basic_happiness",
        custom_weights=None,
        raw_firm_params=None,
        manu_firm_params=None,
        retail_firm_params=None,
        generic_firm_params=None,
        tax_rate_values=None,
        infra_fraction_values=None,
        subsidy_fraction_values=None
    ):
        super().__init__()

        self.num_households       = num_households
        self.num_raw_firms        = num_raw_firms
        self.num_manu_firms       = num_manu_firms
        self.num_retail_firms     = num_retail_firms
        self.num_generic_firms    = num_generic_firms
        self.episode_length       = episode_length

        self.infra_decay_rate     = infra_decay_rate
        self.shock_probability    = shock_probability
        self.shock_type           = shock_type
        self.demand_sensitivity   = demand_sensitivity
        self.inflation_rate       = inflation_rate

        self.household_cost_of_living = household_cost_of_living
        self.household_wage_min       = household_wage_min
        self.household_wage_max       = household_wage_max
        self.essential_goods_demand   = essential_goods_demand

        self.reward_mode      = reward_mode
        self.custom_weights   = custom_weights or {}

        self.raw_firm_params     = raw_firm_params or {}
        self.manu_firm_params    = manu_firm_params or {}
        self.retail_firm_params  = retail_firm_params or {}
        self.generic_firm_params = generic_firm_params or {}

        # Build 3D action
        if tax_rate_values is None:
            self.tax_rate_values = [round(i * 0.02, 2) for i in range(38)] + [0.75]
        else:
            self.tax_rate_values = tax_rate_values

        if infra_fraction_values is None:
            self.infra_fraction_values = [0.0, 0.05, 0.1, 0.15, 0.2]
        else:
            self.infra_fraction_values = infra_fraction_values

        if subsidy_fraction_values is None:
            self.subsidy_fraction_values = [0.0, 0.05, 0.1, 0.15]
        else:
            self.subsidy_fraction_values = subsidy_fraction_values

        self.actions = []
        for t in self.tax_rate_values:
            for f in self.infra_fraction_values:
                for s in self.subsidy_fraction_values:
                    self.actions.append((t, f, s))

        self.action_space_size = len(self.actions)
        self.action_space = spaces.Discrete(self.action_space_size)

        self.observation_space = spaces.Box(
            low=-9999,
            high=9999,
            shape=(4,),
            dtype=float
        )

        self.gov = None
        self.households = []
        self.raw_firms_list = []
        self.manu_firms_list = []
        self.retail_firms_list= []
        self.generic_firms_list= []

        self.current_step = 0
        self.shock_triggered = False
        self.goods_bought_this_step = 0.0
        self.cumulative_profit = 0.0
        self.debug_step_data = []

        self.shortfall_base_penalty = -0.5

    def reset(self):
        if self.household_wage_min > self.household_wage_max:
            self.household_wage_min, self.household_wage_max = \
                self.household_wage_max, self.household_wage_min

        self.current_step = 0
        self.cumulative_profit = 0.0
        self.debug_step_data = []

        # Create government
        self.gov = Government(tax_rate=0.0, possible_tax_rates=self.tax_rate_values)
        self.gov.budget = 0.0
        self.gov.infrastructure = 0.0

        # Households
        self.households = []
        for _ in range(self.num_households):
            wage = random.randint(self.household_wage_min, self.household_wage_max)
            hh = Household(
                wage=wage,
                employed=True,
                cost_of_living=self.household_cost_of_living,
                mode=self.reward_mode
            )
            self.households.append(hh)

        starting_capital = 100.0

        for _ in range(self.num_raw_firms):
            rf = RawMaterialFirm(**self.raw_firm_params)
            rf.capital = starting_capital
            self.raw_firms_list.append(rf)

        for _ in range(self.num_manu_firms):
            mf = ManufacturerFirm(**self.manu_firm_params)
            mf.capital = starting_capital
            self.manu_firms_list.append(mf)

        for _ in range(self.num_retail_firms):
            rf = RetailFirm(**self.retail_firm_params)
            rf.capital = starting_capital
            self.retail_firms_list.append(rf)

        for _ in range(self.num_generic_firms):
            gf = Firm(**self.generic_firm_params)
            gf.capital = starting_capital
            self.generic_firms_list.append(gf)

        return self._get_observation()

    def step(self, action_idx):
        (tax_rate, infra_fraction, subsidy_fraction) = self.actions[action_idx]
        self.gov.set_tax_rate(tax_rate)

        step_log = {
            "raw_profits": [],
            "manu_profits": [],
            "retail_profits": [],
            "generic_profits": [],
            "chosen_tax": tax_rate,
            "chosen_infra": infra_fraction,
            "chosen_subsidy": subsidy_fraction,
            "bankrupt_count": 0,
            "shock_triggered": False,
        }

        total_wages = 0.0
        total_profits = 0.0
        bankrupt_count = 0

        # Raw daily fluctuation ±1%
        for rf in self.raw_firms_list:
            fluct = random.uniform(0.99, 1.01)
            rf.material_price *= fluct
            if rf.material_price < 0.5:
                rf.material_price = 0.5
            elif rf.material_price > 20.0:
                rf.material_price = 20.0

        total_raw_materials = 0.0
        raw_to_remove = []
        for rf in self.raw_firms_list:
            produced = rf.materials_produced()
            total_raw_materials += produced

            rf.adjust_employment()
            w = rf.compute_wages_paid()
            p = rf.compute_profit()

            total_wages += w
            total_profits += p
            rf.capital += p

            if rf.capital < -300:
                raw_to_remove.append(rf)
            step_log["raw_profits"].append(p)

        for rf in raw_to_remove:
            self.raw_firms_list.remove(rf)
        bankrupt_count += len(raw_to_remove)

        # MANUFACTURER step
        manu_to_remove = []
        if self.manu_firms_list and total_raw_materials > 0:
            share = total_raw_materials / len(self.manu_firms_list)
            for mf in self.manu_firms_list:
                mf.buy_materials(share)

        for mf in self.manu_firms_list:
            mf.adjust_employment()
            w = mf.compute_wages_paid()
            p = mf.compute_profit()

            total_wages += w
            total_profits += p
            mf.capital += p

            if mf.capital < -300:
                manu_to_remove.append(mf)
            step_log["manu_profits"].append(p)

        for mf in manu_to_remove:
            self.manu_firms_list.remove(mf)
        bankrupt_count += len(manu_to_remove)

        # RETAIL step
        retail_to_remove = []
        for rf in self.retail_firms_list:
            # buy_final_goods(0) or incorporate final-goods logic if needed
            rf.buy_final_goods(0)
            rf.adjust_employment()

            w = rf.compute_wages_paid()
            total_wages += w

        for rf in self.retail_firms_list:
            p = rf.compute_profit()
            total_profits += p
            rf.capital += p

            if rf.capital < -300:
                retail_to_remove.append(rf)
            step_log["retail_profits"].append(p)

        for rf in retail_to_remove:
            self.retail_firms_list.remove(rf)
        bankrupt_count += len(retail_to_remove)

        # GENERIC step
        generic_to_remove = []
        for gf in self.generic_firms_list:
            gf.adjust_employment()
            w = gf.compute_wages_paid()
            p = gf.compute_profit()

            total_wages += w
            total_profits += p
            gf.capital += p

            if gf.capital < -300:
                generic_to_remove.append(gf)
            step_log["generic_profits"].append(p)

        for gf in generic_to_remove:
            self.generic_firms_list.remove(gf)
        bankrupt_count += len(generic_to_remove)

        # Government
        self.gov.collect_taxes(total_wages, total_profits)

        # Infrastructure
        if self.gov.budget > 0 and infra_fraction > 0:
            invest_amt = infra_fraction * self.gov.budget
            self.gov.budget -= invest_amt
            self.gov.infrastructure += 0.07 * invest_amt

        # Subsidy
        if subsidy_fraction > 0 and self.gov.budget > 0:
            total_subsidy = subsidy_fraction * self.gov.budget
            self.gov.budget -= total_subsidy
            portion = total_subsidy / (len(self.households) + 1e-6)
            for hh in self.households:
                hh.happiness += 0.02 * portion

        # Inflation
        if self.inflation_rate > 0:
            self.household_cost_of_living *= (1 + self.inflation_rate)
            for hh in self.households:
                hh.cost_of_living = self.household_cost_of_living

        # Infrastructure decay
        self._apply_infra_decay()

        # Possibly trigger shock
        self.shock_triggered = False
        if random.random() < self.shock_probability:
            self.shock_triggered = True
            if self.shock_type == "raw_cut":
                for rf in self.raw_firms_list:
                    rf.production_factor *= 0.5
                    if rf.production_factor < 0.5:
                        rf.production_factor = 0.5
        if self.shock_triggered:
            step_log["shock_triggered"] = True

        # leftover/spend
        leftover_money_list = []
        for hh in self.households:
            net_pay = hh.wage * (1 - self.gov.tax_rate) if hh.employed else 0.0
            leftover_money_list.append(max(0.0, net_pay - hh.cost_of_living))

        total_leftover = sum(leftover_money_list)

        
        goods_per_household = 0.0
        shortfall_fraction = 1.0 - min(1.0, goods_per_household / (self.essential_goods_demand + 1e-6))
        shortfall_penalty = self.shortfall_base_penalty * shortfall_fraction

        # Households
        alive_households = []
        for hh in self.households:
            hh.update_happiness(self.gov.infrastructure, self.gov.tax_rate)
            hh.happiness += shortfall_penalty
            if hh.happiness < 0:
                hh.happiness = 0.0
            elif hh.happiness > 100:
                hh.happiness = 100.0

            if not hh.decide_if_leave():
                alive_households.append(hh)

        self.households = alive_households

        # Immigration
        avg_hap = self._get_avg_happiness()

        if self.reward_mode == "dark_lord":
            imm_chance = 0.0
        elif self.reward_mode == "growth":
            imm_chance = 0.5
        else:
            imm_chance = 0.3

        if avg_hap > 50 and random.random() < imm_chance:
            from_wage = random.randint(self.household_wage_min, self.household_wage_max)
            new_hh = Household(
                wage=from_wage,
                happiness=50.0,
                employed=False,
                cost_of_living=self.household_cost_of_living,
                mode=self.reward_mode
            )
            self.households.append(new_hh)

        self.current_step += 1
        done = (self.current_step >= self.episode_length)

        daily_profits = total_profits
        self.cumulative_profit += daily_profits

        # Reward
        reward = self._compute_reward(avg_hap, self.gov.budget, len(self.households),
                                      daily_profits, total_wages)

        # step_log
        step_log["bankrupt_count"]        = bankrupt_count
        step_log["daily_profits_sum"]     = daily_profits
        step_log["gov_budget"]            = self.gov.budget
        step_log["infrastructure"]        = self.gov.infrastructure
        step_log["avg_happiness"]         = avg_hap
        step_log["population"]            = len(self.households)
        step_log["reward"]                = reward

        self.debug_step_data.append(step_log)

        obs = self._get_observation()
        info = {
            "avg_happiness": avg_hap,
            "daily_profits": daily_profits,
            "cumulative_profits": self.cumulative_profit,
            "leftover_spend": total_leftover
        }
        return obs, reward, done, info

    def _apply_infra_decay(self):
        if self.infra_decay_rate > 0:
            self.gov.infrastructure *= (1 - self.infra_decay_rate)
            if self.gov.infrastructure < 0:
                self.gov.infrastructure = 0.0

    def _get_avg_happiness(self):
        if not self.households:
            return 0.0
        return sum(hh.happiness for hh in self.households) / len(self.households)

    def _maybe_apply_shock(self):
        pass

    def _compute_reward(self, avg_hap, budget, population, total_profits, total_wages):
        profit_penalty = 0.05 * max(0, -total_profits)

        if self.reward_mode == "basic_happiness":
            rew = 2.0 * avg_hap
            if budget < 0:
                rew -= 0.05 * abs(budget)
            rew -= profit_penalty
            return rew

        elif self.reward_mode == "growth":
            gdp = total_wages + total_profits
            rew = 0.3 * avg_hap + 2.0 * population + 0.03 * gdp
            if budget < 0:
                rew -= 0.05 * abs(budget)
            rew -= profit_penalty
            return rew

        elif self.reward_mode == "strict_budget":
            rew = 0.8 * avg_hap
            if budget < 0:
                rew -= 0.3 * (abs(budget) ** 1.1)
            else:
                rew += 0.20 * (budget ** 0.5)  
            rew -= profit_penalty
            return rew

        elif self.reward_mode == "dark_lord":
            rew = -5.0 * avg_hap
            if budget < 0:
                rew += 0.3 * abs(budget)
            rew += 0.1 * population
            if total_profits < 0:
                rew += 0.2 * abs(total_profits)
            return rew

        elif self.reward_mode == "custom" and self.custom_weights:
            w_hap  = self.custom_weights.get("hap", 1.0)
            w_pop  = self.custom_weights.get("pop", 0.0)
            w_inf  = self.custom_weights.get("infra", 0.0)
            w_prf  = self.custom_weights.get("profit", 0.0)
            w_def  = self.custom_weights.get("deficit", 0.0)

            rew = (w_hap * avg_hap
                   + w_pop * population
                   + w_inf * self.gov.infrastructure
                   + w_prf * total_profits)
            if budget < 0 and w_def > 0:
                rew -= w_def * abs(budget)
            rew -= profit_penalty
            return rew

        else:
            return avg_hap - profit_penalty

    def _get_observation(self):
        b   = self.gov.budget
        inf = self.gov.infrastructure
        hap = self._get_avg_happiness()
        pop = len(self.households)
        return [b/200.0, inf/50.0, hap/100.0, pop/200.0]

    def get_action_space_size(self):
        return self.action_space_size
