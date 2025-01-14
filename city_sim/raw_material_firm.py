import random
from firm import Firm

class RawMaterialFirm(Firm):
    def __init__(self, base_wage = 8.0, num_employees = 5, profitability_factor = 1.0, 
                 max_capacity = 50, production_factor = 2.0, material_price = 4.0, 
                 min_employees = 2):
        super().__init__(
            base_wage = base_wage,
            num_employees = num_employees,
            profitability_factor = profitability_factor,
            max_capacity = max_capacity
        )
        self.production_factor = production_factor
        self.material_price = material_price
        self.min_employees = min_employees

    def materials_produced(self):
        return self.num_employees * self.production_factor

    def compute_revenue(self):
        units = self.materials_produced()
        base_revenue = units * self.material_price
        return base_revenue * self.profitability_factor

    def compute_profit(self):
        revenue = self.compute_revenue()
        wages = self.compute_wages_paid()
        return revenue - wages

    def adjust_employment(self):
        profit = self.compute_profit()
        if profit > 8.0 and self.num_employees < self.max_capacity:
            if random.random() < 0.4:
                delta = 1 if random.random() < 0.7 else 2
                self.num_employees = min(self.num_employees + delta, self.max_capacity)
        elif profit < -8.0 and self.num_employees > self.min_employees:
            if random.random() < 0.4:
                self.num_employees = max(self.min_employees, self.num_employees - 1)
