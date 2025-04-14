from rich.console import Console

console = Console()

def get_trust_level(customer_id, customers):
    trust = customers[customer_id]["trust"]
    level = round(trust / 2.0) + 2
    level = min(level, 4)
    level = max(level, 0)

    return level