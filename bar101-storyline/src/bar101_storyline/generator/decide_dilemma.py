import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
import questionary


console = Console()

def decide_dilemma(customer, dilemma, plot_a, plot_b):
    console.print(f"[bold yellow]{customer['name']}: [/bold yellow][white]{dilemma['preceding']}[/white]")
    console.print(f"[bold yellow]{customer['name']}[/bold yellow] [dim]is in a dilemma[/dim] [yellow]{dilemma['dilemma']}[/yellow]")
    decision = questionary.select(
        message=f"What's next?",
        choices=[
            f"1: {dilemma['choice_a']}",
            f"2: {dilemma['choice_b']}",
        ]
    ).ask()

    outcome = plot_a["outcome"] if decision.startswith("1") else plot_b["outcome"]
    console.print(f"[dim]Decsion made by[/dim] [yellow bold]{customer['name']}[/yellow bold][dim] leads to[/dim] [yellow bold]{outcome}[/yellow bold]")
    return "a" if decision.startswith("1") else "b"
