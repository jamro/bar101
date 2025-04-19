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



    # opening line
    opener_path = os.path.join(story_root, *variants_chain, f"chat_{customer['id']}_opener.json")
    console.print(f"[dim]Generating opening dialogue...[/dim]")
    if not os.path.exists(opener_path):
        opener = chat_opener_engine.get_opener(customer_id, recent_story, outcome_timeline, events, log_callback=console.print)
        with open(opener_path, "w") as f:
            json.dump(opener, f, indent=2)
    else:
        opener = json.load(open(opener_path, "r"))


    # Continue the conversation
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



    