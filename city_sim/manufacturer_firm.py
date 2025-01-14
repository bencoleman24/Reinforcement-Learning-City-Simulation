import random
from firm import Firm

class ManufacturerFirm(Firm):
    def __init__(self, base_wage = 10.0, num_employees = 5, profitability_factor = 1.2, 
                 max_capacity = 50, sale_price = 16.0, material_cost = 3.5, 
                 min_employees = 2):
        super().__init__(
            base_wage = base_wage,
            num_employees = num_employees,
            profitability_factor = profitability_factor,
            max_capacity = max_capacity
        )
        self.sale_price = sale_price
        self.material_cost = material_cost
        self.min_employees = min_employees

        self.inventory = 0.0
        self.materials_bought_this_step = 0.0
        self.material_cost_this_step = 0.0
        self.last_produced = 0.0

    def buy_materials(self, share):
        self.materials_bought_this_step = share
        self.material_cost_this_step = share * self.material_cost
        self.inventory += share

    def produce_final_goods(self):
        max_output = self.num_employees
        goods_produced = min(self.inventory, max_output)
        self.inventory -= goods_produced
        self.last_produced = goods_produced
        return goods_produced

    def compute_revenue(self):
        if self.materials_bought_this_step <= 0:
            return 0.0
        produced = self.produce_final_goods()
        return (produced * self.sale_price) * self.profitability_factor

    def compute_profit(self):
        revenue = self.compute_revenue()
        wages = self.compute_wages_paid()
        return revenue - wages - self.material_cost_this_step

    def adjust_employment(self):
        p = self.compute_profit()
        if p > 12.0 and self.num_employees < self.max_capacity:
            if random.random() < 0.5:
                self.num_employees += 1
        elif p < -12.0 and self.num_employees > self.min_employees:
            if random.random() < 0.5:
                self.num_employees -= 1
