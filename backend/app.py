# new_app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CITY_SIM_DIR = os.path.join(BASE_DIR, "city_sim")
sys.path.append(CITY_SIM_DIR)

from city_env import CityEnv
from government_rl import train_advanced_rl

app = Flask(__name__)
CORS(app)

@app.route('/run_sim', methods=['POST'])
def run_sim():
    data = request.get_json()

    # Pull config from request, with fallback defaults
    gov_mode        = data.get("reward_mode", "basic_happiness")
    episode_length  = data.get("episode_length", 60)
    training_steps  = data.get("training_steps", 20000)

    cost_of_living    = data.get("household_cost_of_living", 7.0)
    wage_min          = data.get("household_wage_min", 13)
    wage_max          = data.get("household_wage_max", 17)
    essential_demand  = data.get("essential_goods_demand", 1.0)
    demand_sensitivity= data.get("demand_sensitivity", 0.35)
    shock_prob        = data.get("shock_probability", 0.0)
    inflation         = data.get("inflation_rate", 0.0)

    # Firm params
    raw_params = data.get("raw_firm_params", {})
    raw_params.setdefault("base_wage", 7.0)
    raw_params.setdefault("production_factor", 2.0)
    raw_params.setdefault("material_price", 3.8)
    raw_params.setdefault("min_employees", 2)
    raw_params.setdefault("max_capacity", 50)

    manu_params = data.get("manu_firm_params", {})
    manu_params.setdefault("base_wage", 9.0)
    manu_params.setdefault("sale_price", 20.0)
    manu_params.setdefault("material_cost", 3.5)
    manu_params.setdefault("min_employees", 2)
    manu_params.setdefault("max_capacity", 50)

    retail_params = data.get("retail_firm_params", {})
    retail_params.setdefault("base_wage", 5.0)
    retail_params.setdefault("wholesale_price", 8.0)
    retail_params.setdefault("retail_price", 18.0)
    retail_params.setdefault("max_capacity", 50)

    # Build final param_config for CityEnv
    param_config = {
        "num_households":    data.get("num_households", 50),
        "num_raw_firms":     data.get("num_raw_firms", 2),
        "num_manu_firms":    data.get("num_manu_firms", 1),
        "num_retail_firms":  data.get("num_retail_firms", 1),
        "num_generic_firms": data.get("num_generic_firms", 0),
        "episode_length":    episode_length,

        "infra_decay_rate":  data.get("infra_decay_rate", 0.01),
        "shock_probability": shock_prob,
        "shock_type":        data.get("shock_type", "raw_cut"),
        "demand_sensitivity":demand_sensitivity,
        "inflation_rate":    inflation,

        "household_cost_of_living": cost_of_living,
        "household_wage_min":       wage_min,
        "household_wage_max":       wage_max,
        "essential_goods_demand":   essential_demand,

        "reward_mode": gov_mode,

        "raw_firm_params":     raw_params,
        "manu_firm_params":    manu_params,
        "retail_firm_params":  retail_params,
        "generic_firm_params": data.get("generic_firm_params", {}),
    }

    print("[DEBUG] param_config used by website:", param_config)

    # Train RL
    model = train_advanced_rl(param_config, total_timesteps=training_steps)

    # Final rollout
    env = CityEnv(**param_config)
    obs = env.reset()

    done = False
    step = 0

    # Prepare arrays to store timeseries data
    time_steps            = []
    happiness_series      = []
    population_series     = []
    budget_series         = []
    leftover_spend_series = []
    profit_series         = []

    # ---------------------------
    #  1) Record "Day 0" data
    # ---------------------------
    time_steps.append(step)  # day 0
    happiness_series.append(env._get_avg_happiness())
    population_series.append(len(env.households))
    budget_series.append(env.gov.budget)
    leftover_spend_series.append(0.0)  # no leftover spending before the first step
    profit_series.append(0.0)         # no daily profit before the first step

    # -----------------------------------------
    # 2) Step through the environment as usual
    # -----------------------------------------
    while not done:
        action, _states = model.predict(obs, deterministic=True)
        obs, reward, done, info = env.step(action)
        step += 1  # now it's day 1, 2, etc.

        time_steps.append(step)
        happiness_series.append(info["avg_happiness"])
        population_series.append(len(env.households))
        budget_series.append(env.gov.budget)
        leftover_spend_series.append(info["leftover_spend"])
        profit_series.append(info["daily_profits"])

        if step >= episode_length or done:
            break

    # Final stats
    final_hap = happiness_series[-1] if happiness_series else 0.0
    final_pop = population_series[-1] if population_series else 0
    final_bud = budget_series[-1]     if budget_series else 0.0
    final_pro = profit_series[-1]     if profit_series else 0.0

    response_data = {
        "time_steps": time_steps,
        "happiness_series": happiness_series,
        "population_series": population_series,
        "budget_series": budget_series,
        "leftover_spend_series": leftover_spend_series,
        "profit_series": profit_series,
        "final_stats": {
            "final_happiness": final_hap,
            "final_population": final_pop,
            "final_budget": final_bud,
            "final_profit": final_pro
        },
        "chosen_gov_mode": gov_mode,
        "debug_steps": env.debug_step_data
    }

    return jsonify(response_data)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5003, debug=True)
