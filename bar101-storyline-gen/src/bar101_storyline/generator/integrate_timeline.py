import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console
console = Console()

def integrate_timeline(timeline_integrator, customer, dilemma, choice, outcome, timeline, events, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    timeline_path = os.path.join(story_root, *variants_chain, "timeline.json")
    if os.path.exists(timeline_path):
        timeline = json.load(open(timeline_path))
        return timeline
    
    console.print(f"[dim]Integrating timeline...[/dim]")
    events = timeline_integrator.integrate_timeline(
        timeline,
        events,
        customer["id"],
        dilemma["dilemma"],
        choice,
        outcome
    )
    with open(timeline_path, "w") as f:
        json.dump(events, f, indent=2)

    return events
