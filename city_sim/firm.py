import random

class Firm:
    def __init__(self, base_wage = 10.0, num_employees = 5, profitability_factor = 1.0, 
                 max_capacity = 50):
        self.base_wage = base_wage
        self.num_employees = num_employees
        self.profitability_factor = profitability_factor
        self.max_capacity = max_capacity

    def compute_wages_paid(self):
        return self.base_wage * self.num_employees

    def compute_revenue(self):
        return self.profitability_factor * self.num_employees * 20.0

    def compute_profit(self):
        return self.compute_revenue() - self.compute_wages_paid()

    def adjust_employment(self):
        profit = self.compute_profit()

        if profit > 10.0 and self.num_employees < self.max_capacity:
            if random.random() < 0.5:
                self.num_employees += 1
        elif profit < 0.0 and self.num_employees > 0:
            if random.random() < 0.5:
                self.num_employees -= 1
