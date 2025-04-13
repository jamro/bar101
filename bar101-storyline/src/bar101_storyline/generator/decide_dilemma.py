import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
import questionary


console = Console()

def decide_dilemma(decision_maker, customer, dilemma, plot_a, plot_b, timeline, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    decision_path = os.path.join(story_root, *variants_chain, f"chat_{customer['id']}_decision.json")

    chat = None
    if os.path.exists(decision_path):
        with open(decision_path, "r") as f:
            chat = json.load(f)
    else:
        chat = decision_maker.get_dilemma_convo(customer, dilemma, timeline, log_callback=console.print)
        with open(decision_path, "w") as f:
            json.dump(chat, f, indent=2)

    console.print(f"[bold yellow]{customer['name']}: [/bold yellow][white]{dilemma['trigger_event']}[/white]")
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
