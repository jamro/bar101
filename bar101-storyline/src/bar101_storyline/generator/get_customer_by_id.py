from rich.console import Console
import os
import json

console = Console()

def get_customer_by_id(customer_id):
    context_path = os.path.join(os.path.dirname(__file__), "../../../context/world.json")
    with open(context_path, "r") as f:
        context = json.load(f)

    customers = context["bar"]["customers"]
    return next((c for c in customers if c['id'] == customer_id), None)
    