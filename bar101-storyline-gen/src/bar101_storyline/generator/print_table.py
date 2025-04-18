import os
from dotenv import load_dotenv
from openai import OpenAI
from time import sleep
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt

console = Console()

def print_table(timeline):
    table = Table(title="Timeline Events", show_lines=True)
    table.add_column("Timestamp", style="yellow bold", no_wrap=True)
    table.add_column("Visibility", style="red bold")
    table.add_column("Description", style="white")

    for event in timeline:
        table.add_row(event["timestamp"].replace("T", "\n "), event["visibility"], event["description"])

    console.print(table)
