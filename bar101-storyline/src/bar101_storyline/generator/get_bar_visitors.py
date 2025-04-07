import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt

def get_bar_visitors(cusomer_picker, key_customer_id, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    visitors_path = os.path.join(story_root, *variants_chain, "visitors.json")
    if os.path.exists(visitors_path):
        with open(visitors_path, "r") as f:
            visitors = json.load(f)
    else:
        visitors = cusomer_picker.get_random_patrons(key_customer_id)
        json.dump(visitors, open(visitors_path, "w"), indent=2)
     
    return visitors