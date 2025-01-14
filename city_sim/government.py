import random

class Government:
    def __init__(self, tax_rate = 0.1, budget = 0.0, infrastructure = 0.0,
                 possible_tax_rates = None):
        self.tax_rate = tax_rate
        self.budget = budget
        self.infrastructure = infrastructure
        if possible_tax_rates is None:
            self.possible_tax_rates = [0.0, 0.05, 0.1]
        else:
            self.possible_tax_rates = possible_tax_rates

    def collect_taxes(self, total_wages, total_profit):
        wage_tax = total_wages * self.tax_rate
        profit_tax = total_profit * self.tax_rate
        total_tax = wage_tax + profit_tax
        self.budget += total_tax
        return total_tax

    def set_tax_rate(self, new_rate):
        self.tax_rate = new_rate

    def invest_in_infrastructure(self, fraction = 0.2):
        amt = fraction * self.budget
        self.budget -= amt
        self.infrastructure += 0.1 * amt
