import os
from dotenv import load_dotenv
from openai import OpenAI
from PlotShaper import PlotShaper
from KeyCustomerPicker import KeyCustomerPicker
from TimelineIntegrator import TimelineIntegrator
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
    story_node_path = os.path.join(os.path.dirname(__file__), "../../story_tree")
    story_node_name = "storyline_x"

    plot_shaper = PlotShaper(os.getenv("OPENAI_API_KEY"))
    cusomer_picker = KeyCustomerPicker(os.getenv("OPENAI_API_KEY"))
    timeline_integrator = TimelineIntegrator(os.getenv("OPENAI_API_KEY"))
    
    plot_shaper.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    cusomer_picker.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    timeline_integrator.read_context(os.path.join(os.path.dirname(__file__), "../../context"))

    print_table(plot_shaper.timeline)

    while not plot_shaper.is_complete():

      if os.path.exists(os.path.join(story_node_path, f"{story_node_name}.json")):
          console.print(f"[bold red]File {story_node_name}.json already exists! Reusing it...[/bold red]")
          customer_dilemma = json.load(open(os.path.join(story_node_path, f"{story_node_name}.json")))
      else:
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
          
          console.print(f"[dim]Integrating timeline A...[/dim]")
          events_a = timeline_integrator.integrate_timeline(
              plot_shaper.timeline,
              [*customer_dilemma['transition_events_a'], *bar_night['events_a']],
              customer_dilemma['customer']['id'],
              customer_dilemma['dilemma'],
              customer_dilemma['variant_a'],
              bar_night['branch_a']
          )
          console.print(f"[dim]Integrating timeline B...[/dim]")
          events_b = timeline_integrator.integrate_timeline(
              plot_shaper.timeline,
              [*customer_dilemma['transition_events_b'], *bar_night['events_b']],
              customer_dilemma['customer']['id'],
              customer_dilemma['dilemma'],
              customer_dilemma['variant_b'],
              bar_night['branch_b']
          )
          customer_dilemma['transition_events_a'] = events_a
          customer_dilemma['transition_events_b'] = events_b
          customer_dilemma['outcome_a'] = bar_night['branch_a']
          customer_dilemma['outcome_b'] = bar_night['branch_b']

          with open(os.path.join(story_node_path, f"{story_node_name}.json"), "w") as f:
              json.dump(customer_dilemma, f, indent=2)

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
          events = customer_dilemma['transition_events_a']
          outcome = customer_dilemma['outcome_a']
          story_node_name += "a"
      else:
          events = customer_dilemma['transition_events_b']
          outcome = customer_dilemma['outcome_b']
          story_node_name += "b"

      console.print(f"[dim]Decsion made by[/dim] [yellow bold]{customer_dilemma['customer']['name']}[/yellow bold][dim] leads to[/dim] [yellow bold]{outcome}[/yellow bold]")

      print_table(events)
      plot_shaper.timeline += events

    console.print("[bold green]=========================================[/bold green]")
    console.print("[bold green]PLOT SUMMARY[/bold green]")
    console.print("[bold green]=========================================[/bold green]")
    print_table(plot_shaper.timeline)
