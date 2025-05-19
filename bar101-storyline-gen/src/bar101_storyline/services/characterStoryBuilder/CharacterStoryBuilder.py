from openai import OpenAI
import os
import json
from utils import retry_on_error
from services.AiService import AiService
from .prompts import get_system_message, get_standard_prompt, get_dilemma_prompt

class CharacterStoryBuilder(AiService):

    def __init__(self, openai_api_key):
        super().__init__(openai_api_key)
        self.world_context = None
        self.chapters = {}

        self.store_character_chapter_func = {
          "name": "store_character_chapter",
          "description": "Store character chapter showing how related external events have directly affected the character's daily life",
          "parameters": {
            "type": "object",
            "properties": {
              "chapter": {
                  "description": "The paragraph containing the character's story based on recent events",
                  "items": {
                    "type": "string"
                  },
              },
              "old_bci_score": {
                  "description": "The initial character's BCI score before the chapter.",
                  "type": "number",
                  "minimum": 0,
                  "maximum": 100
              },
              "new_bci_score": {
                  "description": "The new character's BCI score after the chapter.",
                  "type": "number",
                  "minimum": 0,
                  "maximum": 100
              },
            },
            "required": ["chapter", "bci_score"]
          }
        }

    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))

        all_characters = self.get_characters()

        for character_id in all_characters:
            self.chapters[character_id] = []

    def get_characters(self):
        all_customers = self.world_context["bar"]["customers"]
        return [customer["id"] for customer in all_customers ]
    
    def store_character_chapter(self, character_id, chapter):
        if not isinstance(chapter, str):
            print(f"Chapter must be a string, but got {type(chapter)}", chapter)
            raise ValueError("Chapter must be a string.")
        self.chapters[character_id].append(chapter)
        
    def create_all_character_chapters(self, customers_model, timeline, log_callback=None):
        characters_story = {}
        all_characters = customers_model.keys()
        for character_id in all_characters:
            log_callback(f"Creating story for character {character_id}...") if log_callback else None
            characters_story[character_id] = self.create_character_chapter(
                character_id,
                customers_model[character_id],
                timeline
            )
        return characters_story
    
    @retry_on_error(max_attempts=3)
    def create_character_chapter(self, character_id, character_stats, events, outcome=None, dilemma=None, choice=None):
        character = None

        for customer in self.world_context["bar"]["customers"]:
            if customer["id"] == character_id:
                character = customer
                break
            
        character_story = self.chapters[character_id]
        character_story = '\n\n'.join(character_story) if len(character_story) > 0 else 'No recent events related the character.'
        system_message = get_system_message(self.world_context['background'], character, character_stats, events, character_story)
        if dilemma is not None and choice is not None:
            prompt = get_dilemma_prompt(character_stats, dilemma, choice, outcome)
        else:
            prompt = get_standard_prompt(character_stats)

        params = self.ask_llm_for_function(
            messages=self.get_messages(prompt, system_message), 
            functions=[self.store_character_chapter_func]
        )

        if abs(params["old_bci_score"] - character_stats["bci_score"]) > 5:
            raise Exception(f"The BCI score in the response does not match the character's current BCI score. Expected {character_stats['bci_score']} but got {params['old_bci_score']}")

        return {
            "chapter": params["chapter"],
            "bci_score": max(0, min(100, params["new_bci_score"])),
            "political_preference": character_stats["political_preference"],
        }
        