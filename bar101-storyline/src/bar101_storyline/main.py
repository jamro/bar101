import os
from dotenv import load_dotenv
from openai import OpenAI
from PlotShaper import PlotShaper
import json
from time import sleep
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
import questionary

# Load environment variables
load_dotenv()


def print_table(timeline):
    table = Table(title="Timeline Events", show_lines=True)
    table.add_column("Timestamp", style="yellow bold", no_wrap=True)
    table.add_column("Visibility", style="red bold")
    table.add_column("Description", style="white")

    for event in timeline:
        table.add_row(event["timestamp"].replace("T", "\n "), event["visibility"], event["description"])

    console.print(table)

if __name__ == "__main__":
    console = Console()

    plot_shaper = PlotShaper(os.getenv("OPENAI_API_KEY"))
    plot_shaper.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
   
    print_table(plot_shaper.timeline)

    while not plot_shaper.is_complete():
      console.print(f"[dim]Forking plot - {plot_shaper.get_plot_stage()['name']}...[/dim]")
      bar_night = plot_shaper.fork_plot()

      decision = questionary.select(
          message="What's next?",
          choices=[
              f"1: {bar_night['branch_a']}",
              f"2: {bar_night['branch_b']}"
          ]
      ).ask()

      events = bar_night['events_a'] if decision.startswith("1") else bar_night['events_b']

      print_table(events)
      plot_shaper.timeline += events

    console.print("[bold green]=========================================[/bold green]")
    console.print("[bold green]PLOT SUMMARY[/bold green]")
    console.print("[bold green]=========================================[/bold green]")
    print_table(plot_shaper.timeline)