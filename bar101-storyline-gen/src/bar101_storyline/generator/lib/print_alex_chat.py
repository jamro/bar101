from time import sleep
from rich.panel import Panel
from rich.padding import Padding
from rich.console import Console

console = Console()

def print_alex_chat(text):
    sleep(0.1)
    console.print(Padding(
        Panel(
            f"[magenta]{text}[/magenta]",
            title="[bold]Alex[/bold]",
            border_style="magenta"
        ),
        (0, 0, 0, 10)
    ))