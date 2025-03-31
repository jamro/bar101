import os
from dotenv import load_dotenv
from openai import OpenAI
from PlotShaper import PlotShaper
from KeyCustomerPicker import KeyCustomerPicker
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
    cusomer_picker = KeyCustomerPicker(os.getenv("OPENAI_API_KEY"))
    plot_shaper.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    cusomer_picker.read_context(os.path.join(os.path.dirname(__file__), "../../context"))

    """
    key_customer = cusomer_picker.pick_customer_dilemma(
        plot_shaper.timeline,
        "Unseen Sabotage",
        "Internal Power Struggle",
        [
            {
              "timestamp": "2025-03-28T04:30:00",
              "visibility": "semi-public",
              "description": "Citywide power outages disrupt Stenograd, causing chaos and confusion."
            },
            {
              "timestamp": "2025-03-28T06:45:00",
              "visibility": "internal",
              "description": "Emergency response systems malfunction, leading to false alarms and mass evacuations."
            },
            {
              "timestamp": "2025-03-28T10:20:00",
              "visibility": "public",
              "description": "Public transportation halts as automated control systems crash, stranding thousands."
            },
            {
              "timestamp": "2025-03-28T14:00:00",
              "visibility": "internal",
              "description": "Anomalies in data flow are detected, hinting at coordinated system sabotage."
            },
            {
              "timestamp": "2025-03-29T11:30:00",
              "visibility": "private",
              "description": "A hidden network of compromised nodes is discovered, amplifying suspicions of external interference."
            }
        ],
        [
            {
              "timestamp": "2025-03-28T07:00:00",
              "visibility": "internal",
              "description": "Chaos in decision-making arises as government interface systems are inaccessible."
            },
            {
              "timestamp": "2025-03-28T09:00:00",
              "visibility": "public",
              "description": "The public is confused and anxious as mixed messages are broadcasted."
            },
            {
              "timestamp": "2025-03-28T13:15:00",
              "visibility": "internal",
              "description": "Interim leaders within the Council are appointed, but factions disagree on direction."
            },
            {
              "timestamp": "2025-03-28T16:40:00",
              "visibility": "internal",
              "description": "Discovery of encrypted communications between technocrats ignites espionage fears."
            },
            {
              "timestamp": "2025-03-29T12:00:00",
              "visibility": "semi-public",
              "description": "Technocratic advisers hold a secretive meeting to regain control, but outcomes remain uncertain."
            }
        ],
        log_callback=lambda message: console.print(f"[dim]{message}[/dim]")
    )

    print(key_customer)
    """


    print_table(plot_shaper.timeline)

    while not plot_shaper.is_complete():
      console.print(f"[dim]Forking plot - {plot_shaper.get_plot_stage()['name']}...[/dim]")
      bar_night = plot_shaper.fork_plot()
      customer_dilemma = cusomer_picker.pick_customer_dilemma(
          plot_shaper.timeline,
          bar_night['branch_a'],
          bar_night['branch_b'],
          bar_night['events_a'],
          bar_night['events_b'],
          log_callback=lambda message: console.print(f"[dim]{message}[/dim]")
      )

      console.print(f"[bold yellow]{customer_dilemma['customer']['name']}: [/bold yellow][white]{customer_dilemma['preceding']}[/white]")
      console.print(f"[bold yellow]{customer_dilemma['customer']['name']}[/bold yellow] [dim]is in a dilemma[/dim] [yellow]{customer_dilemma['dilemma']}[/yellow]")

      decision = questionary.select(
          message=f"What's next?",
          choices=[
              f"1: {customer_dilemma['variant_a']}",
              f"2: {customer_dilemma['variant_b']}"
          ]
      ).ask()

      if decision.startswith("1"):
          events = [*customer_dilemma['transition_events_a'], *bar_night['events_a']]
          branch = bar_night['branch_a']
      else:
          events = [*customer_dilemma['transition_events_b'], *bar_night['events_b']]
          branch = bar_night['branch_b']

      console.print(f"[dim]Decsion made by[/dim] [yellow bold]{customer_dilemma['customer']['name']}[/yellow bold][dim] leads to[/dim] [yellow bold]{branch}[/yellow bold]")

      print_table(events)
      plot_shaper.timeline += events

    console.print("[bold green]=========================================[/bold green]")
    console.print("[bold green]PLOT SUMMARY[/bold green]")
    console.print("[bold green]=========================================[/bold green]")
    print_table(plot_shaper.timeline)
