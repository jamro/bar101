import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console

console = Console()

def develop_character_story(character_story_builder, customer, dilemma, choice, events, variants_chain):
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
                characters_story[character_id]
            )
        return characters_story

    characters_story = {}
    for character_id in all_characters:
        console.print(f"[dim]Creating story for character {character_id}...[/dim]")
        extra_context = ""
        if character_id == customer["id"]:
            extra_context = f""" # DILEMMA
            Before RECENT GLOBAL EVENTS The character faced a dilemma: {dilemma['dilemma']}
            The dilema is caused by: {dilemma['reason']}
            The character decides to: {choice}
            """
        characters_story[character_id] = character_story_builder.create_character_chapter(
            character_id,
            events,
            extra_context
        )
    
    for character_id in all_characters:
        character_story_builder.store_character_chapter(
            character_id,
            characters_story[character_id]
        )

    with open(characters_story_path, "w") as f:
        json.dump(characters_story, f, indent=2)

    return characters_story

