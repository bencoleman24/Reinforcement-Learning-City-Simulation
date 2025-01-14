import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv

from city_env import CityEnv

def train_advanced_rl(param_config, total_timesteps = 20000):
    def _make_env():
        return CityEnv(**param_config)

    vec_env = DummyVecEnv([_make_env])

    model = PPO(
        "MlpPolicy",
        vec_env,
        verbose = 1,
        n_steps = 1024,
        batch_size = 128,
        learning_rate = 1e-4,
        gamma = 0.99
    )

    model.learn(total_timesteps = total_timesteps)
    return model

def run_final_demo(model, param_config, n_steps = 60, minimal_logging = False):
    env = CityEnv(**param_config)
    obs = env.reset()
    done = False
    step = 0
    total_rew = 0.0
    final_hap = 0.0

    print("\n=== Final Demonstration Run ===")
    while not done:
        action, _states = model.predict(obs, deterministic = True)
        obs, reward, done, info = env.step(action)
        step += 1
        total_rew += reward
        final_hap = info["avg_happiness"]

        if minimal_logging and step % 5 == 0:
            print(
                f"Step = {step}, Rew = {reward:.2f}, Hap = {final_hap:.2f}, "
                f"Profit = {info['daily_profits']:.2f}, Leftover = {info['leftover_spend']:.2f}"
            )
        elif not minimal_logging:
            print(
                f"Step = {step}, Reward = {reward:.2f}, Info = {info}"
            )

        if step >= n_steps:
            break

    print(
        f"Final Demo ended after {step} steps, totalReward = {total_rew:.2f}, "
        f"finalHap = {final_hap:.2f}"
    )
