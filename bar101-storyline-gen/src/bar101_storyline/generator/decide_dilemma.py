import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
import questionary
import random

console = Console()

def pick_belief(beliefs, preference):
    if len(beliefs[preference]) == 0:
        return None
    prefered_beliefs = beliefs[preference]
    random_belief = random.choice(prefered_beliefs)
    prefered_beliefs.remove(random_belief)
    return random_belief

def decide_dilemma(decision_maker, customer, customers_model, dilemma, plot_a, plot_b, timeline, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    decision_path = os.path.join(story_root, *variants_chain, f"chat_{customer['id']}_decision.json")

    chat = None
    if os.path.exists(decision_path):
        with open(decision_path, "r") as f:
            chat = json.load(f)
    else:
        chat = decision_maker.get_dilemma_convo(customer, customers_model[customer['id']], dilemma, timeline, log_callback=console.print)
        with open(decision_path, "w") as f:
            json.dump(chat, f, indent=2)

    decision = questionary.select(message=f"{customer['name']} leads to:", choices=[
        f"A: {plot_a['outcome']}",
        f"B: {plot_b['outcome']}",
      ], 
      default=f"A: {plot_a['outcome']}" if dilemma['preference'] == 'a' else f"B: {plot_b['outcome']}",
    ).ask()

    decision = "a" if decision[0] == "A" else "b"

    new_political_preference = dilemma['political_a'] if decision == "a" else dilemma['political_b']

    customers_model[customer['id']]['political_preference'] = new_political_preference

    return decision
