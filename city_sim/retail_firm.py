import random
from firm import Firm

class RetailFirm(Firm):
    def __init__(self, base_wage = 8.0, num_employees = 5, profitability_factor = 1.0, 
                 max_capacity = 50, wholesale_price = 8.0, retail_price = 12.0, 
                 min_employees = 2):
        super().__init__(
            base_wage = base_wage,
            num_employees = num_employees,
            profitability_factor = profitability_factor,
            max_capacity = max_capacity
        )
        self.wholesale_price = wholesale_price
        self.retail_price = retail_price
        self.inventory = 0.0

        self.goods_bought_this_step = 0.0
        self.wholesale_cost_this_step = 0.0
        self.goods_sold_this_step = 0.0
        self.min_employees = min_employees

    def buy_final_goods(self, available_goods: float) -> float:
        self.goods_bought_this_step = available_goods
        self.wholesale_cost_this_step = available_goods * self.wholesale_price
        self.inventory += available_goods
        return available_goods

    def sell_to_households(self, units_demanded: float) -> float:
        sold = min(self.inventory, units_demanded)
        self.inventory -= sold
        self.goods_sold_this_step = sold
        return sold

    def compute_revenue(self) -> float:
        base_revenue = self.goods_sold_this_step * self.retail_price
        return base_revenue * self.profitability_factor

    def compute_profit(self) -> float:
        revenue = self.compute_revenue()
        wages = self.compute_wages_paid()
        return revenue - wages - self.wholesale_cost_this_step

    def adjust_employment(self):
        p = self.compute_profit()
        if p > 8.0 and self.num_employees < self.max_capacity:
            if random.random() < 0.4:
                self.num_employees += 1
        elif p < -8.0 and self.num_employees > self.min_employees:
            if random.random() < 0.3:
                self.num_employees -= 1
