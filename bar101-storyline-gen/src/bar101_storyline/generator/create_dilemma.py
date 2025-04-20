import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console

console = Console()

def create_dilemma(cusomer_picker, customers_model, plot_a, plot_b, timeline, outcome_timeline, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    dilemma_path = os.path.join(story_root, *variants_chain, "dilemma.json")
    transition_a_path = os.path.join(story_root, *variants_chain, "a", "_transition.json")
    transition_b_path = os.path.join(story_root, *variants_chain, "b", "_transition.json")

    if os.path.exists(dilemma_path) and os.path.exists(transition_a_path) and os.path.exists(transition_b_path):
        dilemma = json.load(open(dilemma_path))
        transition_a = json.load(open(transition_a_path))
        transition_b = json.load(open(transition_b_path))
        return dilemma, transition_a, transition_b

    customer_dilemma = cusomer_picker.pick_customer_dilemma(
        outcome_timeline,
        timeline,
        plot_a['outcome'],
        plot_b['outcome'],
        plot_a['events'],
        plot_b['events'],
        customers_model, 
        log_callback=lambda message: console.print(f"[dim]{message}[/dim]")
    )

    dilemma = {
        "customer_id": customer_dilemma["customer"]["id"],
        "trigger_event": customer_dilemma["trigger_event"],
        "dilemma": customer_dilemma["dilemma"],
        "reason": customer_dilemma["reason"],
        "choice_a": customer_dilemma["variant_a"],
        "belief_a": customer_dilemma["belief_driver_a"],
        "choice_b": customer_dilemma["variant_b"],
        "belief_b": customer_dilemma["belief_driver_b"],
        "political_a": customer_dilemma["political_support_a"],
        "political_b": customer_dilemma["political_support_b"],
        "preference": customer_dilemma["preference"].lower(),
    }
    transition_a = customer_dilemma['transition_events_a']
    transition_b = customer_dilemma['transition_events_b']
    with open(dilemma_path, "w") as f:
        json.dump(dilemma, f, indent=2)
    with open(transition_a_path, "w") as f:
        json.dump(transition_a, f, indent=2)
    with open(transition_b_path, "w") as f:
        json.dump(transition_b, f, indent=2)

    return dilemma, transition_a, transition_b