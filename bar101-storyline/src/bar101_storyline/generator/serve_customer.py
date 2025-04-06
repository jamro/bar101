import os
from dotenv import load_dotenv
from openai import OpenAI
from time import sleep
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
from .get_customer_by_id import get_customer_by_id
import questionary

console = Console()

def serve_customer(customer_id, customers):
    customer = get_customer_by_id(customer_id)
    log_customer = lambda x: console.print(f"[yellow bold]{customer['name']} ({customers[customer_id]['trust']})[/yellow bold]: [dim]{x}[/dim]")

    console.print(f"\n")
    log_customer("enters the bar...")

    # serve drink
    decision = questionary.select(message=f"Alex:", choices=["1: What can I get you?", "2: The usual?"]).ask()
    trust_bonus = False
    if decision.startswith("1"):
        log_customer(customer['drink'])
    else:
        log_customer("yes, the usual")
        trust_bonus = True
    sleep(0.1)
    console.print(f"[dim]Alex serves[/dim] [yellow bold]{customer['drink']}[/yellow bold][dim]")
    if trust_bonus:
        customers[customer_id]["trust"] += 1
        console.print(f"[green]{customer['name']} Trust +1[/green]")
