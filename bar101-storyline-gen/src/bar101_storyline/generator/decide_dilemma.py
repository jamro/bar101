import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
import questionary
from .lib import (
    get_trust_level,
    print_alex_chat,
    print_customer_chat,
    print_serve_drink,
    print_customer_enter,
)
import random

console = Console()

def pick_belief(beliefs, preference):
    if len(beliefs[preference]) == 0:
        return None
    prefered_beliefs = beliefs[preference]
    random_belief = random.choice(prefered_beliefs)
    prefered_beliefs.remove(random_belief)
    return random_belief
    

def decide_dilemma(decision_maker, customer, all_customers, dilemma, plot_a, plot_b, timeline, variants_chain):
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

    # intro to dilemma
    dilemma_intro = chat['dilemma']['variants'][get_trust_level(customer['id'], all_customers)]
    print_alex_chat(chat['dilemma']['opener'])
    for line in dilemma_intro:
        print_customer_chat(customer, line, all_customers)
    print_customer_chat(customer, "...", all_customers)

    # beliefs
    beliefs = {
        # object deep copy of chat['belief_a']
        "a": chat['belief_a'].copy(),
        "b": chat['belief_b'].copy(),
    }
    belief_preference = dilemma['preference'].lower()
    scores = { "a": 0, "b": 0 }
    while(len(beliefs[belief_preference]) > 0):
      random_belief = pick_belief(beliefs, belief_preference)
      for line in random_belief['monologue']:
          print_customer_chat(customer, line, all_customers)

      decision = questionary.select(message=f"Alex:", choices=[
        f"1: Support",
        f"2: Challenge",
      ]).ask()

      decision = int(decision[0])
      if decision == 1:
          scores[belief_preference] += 1
          for linne in random_belief['supportive_response']:
              print_alex_chat(linne)
      else:
          scores[belief_preference] -= 1
          for linne in random_belief['challenging_response']:
              print_alex_chat(linne)
          belief_preference = "a" if belief_preference == "b" else "b"


    decision = dilemma['preference'].lower()
    influenced = False
    score_diff = abs(scores['a'] - scores['b'])
    trust_level = get_trust_level(customer['id'], all_customers)
    console.print(f"[dim]Decision score:[/dim] [yellow]{scores['a']} vs {scores['b']}. Score difference: {score_diff}. Trust level: {trust_level}[/yellow]")
    if trust_level == 0 and score_diff >= 5:
        decision = "a" if scores['a'] > scores['b'] else "b"
        influenced = True
    elif trust_level == 1 and score_diff >= 4:
        decision = "a" if scores['a'] > scores['b'] else "b"
        influenced = True
    elif trust_level == 2 and score_diff >=3:
        decision = "a" if scores['a'] > scores['b'] else "b"
        influenced = True
    elif trust_level == 3 and score_diff >= 2:
        decision = "a" if scores['a'] > scores['b'] else "b"
        influenced = True
    elif trust_level == 4 and score_diff >= 1:
        decision = "a" if scores['a'] > scores['b'] else "b"
        influenced = True

    console.print(f"[dim]Decision made by[/dim] [yellow bold]{customer['name']}[/yellow bold][dim] leads to[/dim] [yellow bold]{decision.upper()}. It was {'influenced' if influenced else 'not influenced'} by Alex.[/yellow bold]")
    
    # share decision
    decision_monologue = None
    if not influenced:
        decision_monologue = chat['decision']['monologue_self']
    elif decision == "a":
        decision_monologue = chat['decision']['monologue_a']
    else:
        decision_monologue = chat['decision']['monologue_b']

    decision_monologue_variant = decision_monologue[get_trust_level(customer['id'], all_customers)]
    
    for line in decision_monologue_variant:
        print_customer_chat(customer, line, all_customers)
    print_customer_chat(customer, "...", all_customers)
    

    return decision
