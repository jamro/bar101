import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console

console = Console()

def develop_character_story(character_story_builder, customer, customers_model, dilemma, choice, outcome, events, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    characters_story_path = os.path.join(story_root, *variants_chain, "characters.json")
    all_characters = character_story_builder.get_characters()

    if os.path.exists(characters_story_path):
        with open(characters_story_path, "r") as f:
            characters_story = json.load(f)
        for character_id in all_characters:
            console.print(f"[dim]Creating story for character {character_id}...[/dim]")
            character_story_builder.store_character_chapter(
                character_id,
                characters_story[character_id]['chapter']
            )
        return characters_story

    characters_story = {}
    for character_id in all_characters:
        console.print(f"[dim]Creating story for character {character_id}...[/dim]")
        characters_story[character_id] = character_story_builder.create_character_chapter(
            character_id,
            customers_model[character_id],
            events,
            outcome if character_id == dilemma["customer_id"] else None,
            dilemma if character_id == dilemma["customer_id"] else None,
            choice if character_id == dilemma["customer_id"] else None,
        )
    
    for character_id in all_characters:
        character_story_builder.store_character_chapter(
            character_id,
            characters_story[character_id]['chapter']
        )

    with open(characters_story_path, "w") as f:
        json.dump(characters_story, f, indent=2)

    return characters_story

