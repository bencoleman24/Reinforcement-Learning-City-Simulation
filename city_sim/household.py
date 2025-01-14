import random

class Household:
    def __init__(self, wage, happiness = 50.0, employed = True, cost_of_living = 8.0,
                 mode = "basic_happiness"):
        self.wage = wage
        self.happiness = happiness
        self.employed = employed
        self.cost_of_living = cost_of_living
        self.mode = mode

    def update_happiness(self, infrastructure, tax_rate):
        if self.employed:
            net_pay = self.wage * (1 - tax_rate)
        else:
            net_pay = 0.0

        budget_diff = net_pay - self.cost_of_living

        leftover_multiplier = 0.02
        infra_multiplier = 0.03

        if self.mode == "basic_happiness":
            leftover_multiplier = 0.06
            infra_multiplier = 0.08
        elif self.mode == "dark_lord":
            infra_multiplier = 0.0

        self.happiness += leftover_multiplier * budget_diff

        if self.mode != "dark_lord":
            infra_effect = min(infrastructure, 60.0)
            self.happiness += infra_multiplier * infra_effect

        if self.happiness < 0:
            self.happiness = 0.0
        elif self.happiness > 100:
            self.happiness = 100.0

    def decide_if_leave(self):
        if self.happiness < 5:
            return (
                random.random() < 0.3
            )
        elif self.happiness < 10:
            return (
                random.random() < 0.1
            )
        return False
