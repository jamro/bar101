import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt

console = Console()

def fork_plot(plot_shaper, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    plot_a_path = os.path.join(story_root, *variants_chain, "a", "_plot.json")
    plot_b_path = os.path.join(story_root, *variants_chain, "b", "_plot.json")
    if os.path.exists(plot_a_path) and os.path.exists(plot_b_path):
        plot_a = json.load(open(plot_a_path))
        plot_b = json.load(open(plot_b_path))
        return plot_a, plot_b
    
    bar_night = plot_shaper.fork_plot(log_callback=console.print)

    plot_a = { "outcome": bar_night["branch_a"], "events": bar_night["events_a"]}
    plot_b = { "outcome": bar_night["branch_b"], "events": bar_night["events_b"]}

    with open(plot_a_path, "w") as f:
        json.dump(plot_a, f, indent=2)
    with open(plot_b_path, "w") as f:
        json.dump(plot_b, f, indent=2)

    return plot_a, plot_b
