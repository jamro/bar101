import os
from dotenv import load_dotenv
from openai import OpenAI
from time import sleep
import json
from rich.console import Console
from rich.panel import Panel
from rich.padding import Padding
from rich.table import Table
from rich.prompt import Prompt
from .get_customer_by_id import get_customer_by_id
from .lib import (
    get_trust_level,
    print_alex_chat,
    print_customer_chat,
    print_serve_drink,
    print_customer_enter,
)
import questionary

console = Console()

def serve_customer(chat_opener_engine, chat_story_engine, customer_id, customers, recent_story, outcome_timeline, events, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    customer = get_customer_by_id(customer_id)

    print_customer_enter(customer)

    # serve drink
    decision = questionary.select(message=f"Alex:", choices=["1: What can I get you?", "2: The usual?"]).ask()
    print_alex_chat(decision[3:])
    trust_bonus = False
    if decision.startswith("1"):
        print_customer_chat(customer, f"I would like {customer['drink']}, please.", customers)
    else:
        print_customer_chat(customer, f"yes, the usual", customers)
        trust_bonus = True
    print_serve_drink(customer)
    print_alex_chat(f"Here is your {customer['drink']}.")
    if trust_bonus:
        customers[customer_id]["trust"] += 1
        console.print(f"[green]{customer['name']} Trust +1[/green]")

    # opening line
    opener_path = os.path.join(story_root, *variants_chain, f"chat_{customer['id']}_opener.json")
    console.print(f"[dim]Generating opening dialogue...[/dim]")
    if not os.path.exists(opener_path):
        opener = chat_opener_engine.get_opener(customer_id, recent_story, outcome_timeline, events, log_callback=console.print)
        with open(opener_path, "w") as f:
            json.dump(opener, f, indent=2)
    else:
        opener = json.load(open(opener_path, "r"))

    choices = [f"0: {opener['questions']['neutral']}"]
    for i, item in enumerate(opener['questions']['hobby']):
        choices.append(f"{i+1}: {item['message']}")
    decision = questionary.select(
        message=f"Alex:", 
        choices=choices
    ).ask()
    decision = int(decision[0])

    if decision == 0:
        monologue = opener['neutral_answer'][get_trust_level(customer_id, customers)]
        print_alex_chat(opener['questions']['neutral'])
        for msg in monologue:
            print_customer_chat(customer, msg, customers)
    else:
        index = decision - 1
        opener_message = opener['questions']['hobby'][index]
        if opener_message["correct"]:
            customers[customer_id]["trust"] += 1
            console.print(f"[green]{customer['name']} Trust +1[/green]")
            monologue = opener['hobby_answer'][get_trust_level(customer_id, customers)]
            print_alex_chat(opener_message['message'])
            for msg in monologue:
                print_customer_chat(customer, msg, customers)
        else:
            customers[customer_id]["trust"] -= 1
            console.print(f"[red]{customer['name']} Trust -1[/red]")
            print_customer_chat(customer, opener['wrong_hobby_answer'], customers)
    print_customer_chat(customer, "...", customers)

    # Continue the conversation
    console.print("\n[bold cyan]Press Enter to continue...[/bold cyan]")
    input()
    main_convo_path = os.path.join(story_root, *variants_chain, f"chat_{customer['id']}_main.json")
    console.print(f"[dim]Generating main dialogue...[/dim]")
    if not os.path.exists(main_convo_path):
        opener = chat_story_engine.get_opener()
        conversation = chat_story_engine.get_conversation(
            opener, 
            customer_id, 
            recent_story, 
            outcome_timeline, 
            events, 
            log_callback=console.print
        )
        with open(main_convo_path, "w") as f:
            json.dump(conversation, f, indent=2)
    else:
        conversation = json.load(open(main_convo_path, "r"))
        opener = conversation['main']['opener']

    print_alex_chat(opener)
    monologue = conversation['main']['variants'][get_trust_level(customer_id, customers)]
    for msg in monologue:
        print_customer_chat(customer, msg, customers)

    decision = questionary.select(message=f"Alex:", choices=[
        f"1: Emotional support",
        f"2: Push for more information",
    ]).ask()

    decision = int(decision[0])
    if decision == 1:
        print_alex_chat(conversation['emotional']['opener'])
        customers[customer_id]["trust"] += 1
        console.print(f"[green]{customer['name']} Trust +1[/green]")
        monologue = conversation['emotional']['variants'][get_trust_level(customer_id, customers)]
        for msg in monologue:
            print_customer_chat(customer, msg, customers)
    else:
        print_alex_chat(conversation['factual']['opener'])
        monologue = conversation['factual']['variants'][get_trust_level(customer_id, customers)]
        for msg in monologue:
            print_customer_chat(customer, msg, customers)

        customers[customer_id]["trust"] -= 1
        console.print(f"[red]{customer['name']} Trust -1[/red]")

    