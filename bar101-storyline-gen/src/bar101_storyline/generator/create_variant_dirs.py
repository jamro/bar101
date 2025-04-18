import os
from dotenv import load_dotenv
from openai import OpenAI
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt

console = Console()

def create_variant_dirs(variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    
    vairaint_a_path = os.path.join(story_root, *variants_chain, "a")
    vairaint_b_path = os.path.join(story_root, *variants_chain, "b")
    if not os.path.exists(vairaint_a_path):
        os.makedirs(vairaint_a_path)
    if not os.path.exists(vairaint_b_path):
        os.makedirs(vairaint_b_path)
