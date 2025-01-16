# City Simulation Overview

This document provides a deep dive into the Reinforcement Learning City Simulation. It describes each component in the city, the step-by-step environment dynamics, and how the government RL agent interacts with the system.

## 1. Introduction

- Purpose: Provide an interactice city environment where a government RL agent can manage policy choices (taxes, infrastructure, budget) to attempt to optimize their personalized objectives. 

**High-Level System Flow**:
1. The RL policy chooses an action: (tax rate, infastructure investment fraction, subsidy fraction).
2. Households earn wages, pay living costs, and update happiness. They may leave if they become too unhappy.
3. Firms (raw materials, manufacturer, retail) produce goods and pay wages. They also earn profits and may go bankrupt. 
4. Government collects taxes, invests in infrastructure, pays subsidies.
5. The simulation repeats until the episode ends (default of 60 days).

## 2. Households
### 2.1 Core Attributes

Each household *h*:
- *W*<sub>h</sub>: Wage (if employed).
- *C*<sub>living,h</sub>: Cost of living.
- *H*<sub>h</sub>: Happiness (0 to 100).
- Employment status (boolean).

### 2.2 Net Pay
When a household is employed, the net pay is calculated as:

$$
\textit{net\_pay}_h = W_h \times (1 - T),
$$

where *T* is the government tax rate (ranging from 0 to 0.75).

In plain text, we’ll refer to `net_pay` with backticks.

### 2.3 Happiness Update

Let *H*<sub>h</sub> be happiness. Each day, we update:

$$
H_h \leftarrow \min\!\bigl(\max\!\bigl(H_h + \alpha \cdot \textit{infrastructure} - \beta \cdot \textit{shortfall}, 0\bigr), 100\bigr).
$$

- *α* is a small weight factor (e.g. 0.02).
- *shortfall* penalizes households that cannot afford essentials.
- *β* is the penalty weight for shortfall.
- *H*<sub>h</sub> is clamped between 0 and 100.

### 2.4 Leaving the City
A household may leave if *H*<sub>h</sub> is too low.

The formula for deciding whether the individual leaves can be written as:

$$
\text{decide\_if\_leave} = 
\begin{cases} 
\text{True}, & \text{if } H_h < 5 \text{ and } \text{random.random()} < 0.3 \\
\text{True}, & \text{if } 5 \leq H_h < 10 \text{ and } \text{random.random()} < 0.1 \\
\text{False}, & \text{otherwise}
\end{cases}
$$

## 3. Firms
### 3.1 Core Attributes
All firms share base logic:

- `base_wage`: Base amount paid to each employee.
- `num_employees`: Current employee count.
- `profitability_factor`: Scales overall revenue.
- `capital`: Removed if it drops below -300.
- Methods for hirong and firing based on profit thresholds.
- A capital account to track if they go bankrupt.

Profit for a generic firm each day:
$$
\pi_f = (\textit{revenue} \times \textit{profitability\_factor}) - \textit{wages} - \textit{material\_costs}.
$$

$$
\textit{wages} = \textit{num\_employees} \times \textit{base\_wage}
$$

### 3.2 Raw Material Firms
- Produce raw materials which start the supply chain $\text{materials\_produced} = \text{num\_employees} \times \text{production\_factor}$

- They sell these raw materials at `material_price`.

Their revenue is calculated:
$$
\text{revenue}_{\text{raw}} = (\text{materials\_produced} \times \text{material\_price}) \times \text{profitability\_factor}
$$

### 3.3 Manufacturer Firms

- Buys raw materials at a cost `material_cost`.
- Produces final goods $\leq \text{num\_employees}$
- Sells final goods at a `sale_price`

Their revenue is calculated:
$$
\text{revenue}_{\text{manu}} = (\text{final\_goods\_produced} \times \text{sale\_price}) \times \text{profitability\_factor}
$$

### 3.4 Retail Firms
- Buys goods from manufacturers at a `wholesale_price`
- Sells at a `retail_price`

Profit is calculated:
$$
\text{profit} = (\text{retail\_price} - \text{wholesale\_price}) \times \text{goods\_sold} - \text{wages}
$$

## 4. Government
### 4.1 Tax Rate
A value $\text{tax\_rate} \in [0, 0.75]$
 which is applied to both household wages and firm profits each day:
 $$
\text{total\_tax} = \text{tax\_rate} \times (\text{total\_wages} + \text{total\_profits})
$$

Then:

$$
\text{gov\_budget} \leftarrow \text{gov\_budget} + \text{total\_tax}
$$

In plain text, we’ll refer to `gov_budget`.

### 4.2 Infastructure Budget 
When the government chooses a fraction $\beta_{\text{infra}} \in [0, 0.2]$ (for instance):

$$
\text{infrastructure\_investment} = \beta_{\text{infra}} \times \text{gov\_budget}
$$

Then:

$$
\text{gov\_budget} \leftarrow \text{gov\_budget} - \text{infrastructure\_investment}
$$

$$
\text{infrastructure} \leftarrow \text{infrastructure} + \alpha_{\text{infra}} \times \text{infrastructure\_investment}
$$

where $\alpha_{\text{infra}}$ is some multiplier.

### 4.3 Subsidies 
If $\beta_{\text{subsidy}} \in [0, 0.15]$ is chosen (for instance):

$$
\text{total\_subsidy} = \beta_{\text{subsidy}} \times \text{gov\_budget}
$$

Then:

$$
\text{gov\_budget} \leftarrow \text{gov\_budget} - \text{total\_subsidy}
$$

That total subsidy can be distributed to households. Each household might get a fraction of that. This can increase happiness slightly.

# 5 Step Function *(env.step(action))*
The function which triggers the actions needed to step through the simulation.

1. Parse action: $(\text{tax\_rate}, \beta_{\text{infra}}, \beta_{\text{subsidy}})$.
2. Update Government:
   - Collect taxes.
   - Subset of budget to infrastructure, to subsidies.
3. Firms:
   - Produce goods, pay wages, compute profits, possibly go bankrupt.
   - Adjust (hire/fire) employees.
4. Households:
   - Compute leftover money: $\text{leftover\_money} = \text{net\_pay} - \text{cost\_of\_living}$.
   - Update happiness with infrastructure boost, shortfall penalty, etc.
   - Possibly leave if happiness is too low.
5. Shock (stochastic event).
6. Immigration:
   - If average happiness is high, a new household might appear.
7. Compute reward for the RL agent, based on the chosen reward mode.
8. Return next observation $o_{t+1}$, reward $r_t$, done flag, and info dict.

In plain text, we refer to `leftover_money` and `cost_of_living` with backticks.

# 6. Action & Observation Space

### 6.1 Action Space
- 3D discrete (ex: $[0..0.75] \times [0..0.2] \times [0..0.15]$ in step increments).
- Total possible actions = $|\text{tax\_rate\_values}| \times |\text{infra\_fraction\_values}| \times |\text{subsidy\_fraction\_values}|$.

### 6.2 Observations 
For each step the environment returns a 4D continuous vector like:

$$
\bigl[\tfrac{b}{200.0}, \tfrac{\text{infrastructure}}{50.0}, \tfrac{\text{avg\_happiness}}{100.0}, \tfrac{\text{population}}{200.0}\bigr].
$$

- `b` = government budget
- `infrastructure`
- `avg_happiness` in [0..100]
- `population` in [0..∞]

# 7 Government Reward Modes
The government's reward is computed differently depending on the chosen *reward_mode*:

1. *basic_happiness*:
   $$
   R = 2.0 \times \text{avg\_happiness} 
       - \gamma_{\text{budget}} \times \max(0, -\text{budget})
       - \gamma_{\text{profit}} \times \max(0, -\text{daily\_profit})
   $$

2. *growth*:
   $$
   R = 0.3 \times \text{avg\_happiness} 
       + 2.0 \times \text{population} 
       + 0.03 \times \text{GDP} - \dots
   $$

3. *strict\_budget*:
   $$
   R = 0.8 \times \text{avg\_happiness} + F(\text{budget}) - \text{profit\_penalty}
   $$

4. *dark\_lord*:
   $$
   R = -5.0 \times \text{avg\_happiness} 
       + 0.3 \times \max(0, -\text{budget}) 
       + 0.1 \times \text{population} 
       + \dots
   $$

5. *custom* (set by user):
   $$
   R = w_{\text{hap}} \times \text{avg\_happiness}
       + w_{\text{pop}} \times \text{population}
       + w_{\text{infra}} \times \text{infrastructure}
       + w_{\text{profit}} \times \text{daily\_profits}
       - w_{\text{deficit}} \times \max(0, -\text{budget})
   $$

# 8. **Shock Events (Optional Configuration)**

The probability of a shock each step is `shock_probability`. If a shock is triggered, certain firm production is halved, or other negative events occur.

$$
\text{shock\_triggered} \sim \text{Bernoulli}(\text{shock\_probability})
$$

For example if triggered, raw material production factor may be shocked as so:

$$
\text{production\_factor} \times = 0.5
$$
# 9 . Infrastructure Decay
Each step, a small fraction of infastructure decays:
$$
\text{infrastructure} \leftarrow \text{infrastructure} \times (1 - \delta),
$$
with $\delta \approx 0.01$.

# 10. Bankruptcies
A firm is removed if:

$$
\text{capital} < -300.
$$

Once it is removed it cannot produce nor hire.

# 11. RL Training

The environment is wrapped via `DummyVecEnv` from [Stable Baselines3](https://github.com/DLR-RM/stable-baselines3). An RL algorithm (*PPO*) is used:

1. Create Environment: `env = CityEnv(...)`
2. Wrap: `vec_env = DummyVecEnv([lambda: env])`
3. Train with chosen timesteps (Currently set at 15,000) and hyperparameters (*learning_rate*, *n_steps*, ect.).
4. The agent learns to pick an action (*tax_rate*, *infra_fraction*, *subsidy_fraction*) that maximizes their reward function.

We use this snippet to train:

```python
model = PPO("MlpPolicy", vec_env, n_steps=1024, batch_size=128, learning_rate=1e-4, gamma=0.99, verbose=1)
model.learn(total_timesteps=15000)
```

## 12 Final Simulation Rolout

Once training is finished a new environment is created with the same configuration and the RL agent is ran in it in *deterministic* mode for the specified amount of days (default of 60). We record daily metrics - household happiness, budget, population, spending, and profit. 

### 12.1 Re-Initializing the Environment

The environment is re-initalized as follows:
```python
env = CityEnv(**param_config)
obs = env.reset()
done = False
step = 0
```

We end up with a fresh enviornmen where no prior knowledge or state is carried over. The RL agent now uses the *trained policy* to make decisions.



### 12.2 Rollout with the Learned Policy:

We repeatedly do 
```python
action, _states = model.predict(obs, deterministic=True)
obs, reward, done, info = env.step(action)
step += 1
```

- `deterministic = True` makes the policy pick the best known action rather than sampling a distribution.
- Each `info` dictionary includes useful metrics for that timestamp.
- This loop continues until the episode length is reached.

### 12.3 Storing Time-Series Data
As the environment steps forward we store arrays of data:
- *time_steps*: The day index.
- *happiness_series*: The day's average household happiness.
- *population_series*: The current city population.
- *budget_series*: The current government budget.
- *profit_series*: The aggregated profit from firms that day.
- *leftover_spend_series*: The sum of leftover money after cost of living.

## 13. Conclusion

This simulation shows a simplified example of how a government RL agent can adapt policy decisions to influence an urban economy. 

### Potential Future Extensions
There is a lot of room for potential improvements in this sim as the complexities of a real society environment are difficult to replicate.

Below are some potential future directions:

- **Increased System Complexity**: more households/firms/types of firms/ additional cities interacting with each other.
- **Expanding # of RL agents**: Making the households or firms act as agents with their own reward functions is a logical expansion making the system feel more alive. The system would need to be extremely balanced and fine-tuned first. 



