from time import sleep
from rich.console import Console
from rich.panel import Panel
from rich.padding import Padding

console = Console()

def print_customer_chat(customer, text, customers=None):
    sleep(0.1)
    console.print(Padding(
        Panel(
            text,
            title=f"[bold]{customer['name']}[/bold] ({customers[customer['id']]['trust'] if customers else '?'})",
        ),
        (0, 10, 0, 0)
    ))