import random
import os
import json
from .openers import all_openers
from .prompts import get_system_message, get_main_prompt, get_emotional_prompt, get_factual_prompt
from utils import retry_on_error
from .functions import generate_main_monologue_variants, generate_emotional_monologue_variants, generate_factual_monologue_variants
from services.AiService import AiService

class ChatStoryEngine(AiService):
    def __init__(self, openai_api_key):
        super().__init__(openai_api_key)
        self.world_context = None

    def get_opener(self):
        return random.choice(all_openers)
    
    def find_customer_by_id(self, customer_id):
        for customer in self.customers:
            if customer["id"] == customer_id:
                return customer
        return None
    
    def get_conversation(self, question, customer_id, character_stats, recent_story, outcome_timeline, events, log_callback=None):
        log_callback(f"[dim]Generating main conversation of {customer_id}...[/dim]") if log_callback else None
        main = self.get_main_conversation(question, customer_id, character_stats, recent_story, outcome_timeline, events)
        log_callback(f"[dim]Generating emotional followup of {customer_id}...[/dim]") if log_callback else None
        emotional = self.get_emotional_followup(customer_id, character_stats, recent_story, main["emotion"])
        log_callback(f"[dim]Generating factual followup of {customer_id}...[/dim]") if log_callback else None
        factual = self.get_factual_followup(customer_id, character_stats, recent_story, main["emotion"], main["variants"], outcome_timeline, events)
        
        return {
            "main": main,
            "emotional": emotional,
            "factual": factual
        }
    
    @retry_on_error(max_attempts=3)
    def get_emotional_followup(self, customer_id, character_stats, recent_story, emotion):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            character_stats,
            recent_story
        )
        prompt = get_emotional_prompt(customer, emotion)
        
        messages = self.get_messages(prompt, system_message)
        params = self.ask_llm_for_function(messages, [generate_emotional_monologue_variants])

        return {
            "opener": params["alex_phrase"],
            "variants": [
              params["very_suspicious"],
              params["suspicious"],
              params["neutral"],
              params["trusting"],
              params["very_trusting"],
          ]
        }
    
    @retry_on_error(max_attempts=3)
    def get_factual_followup(self, customer_id, character_stats, recent_story, emotion, main_variants, outcome_timeline, events):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            character_stats,
            recent_story,
            outcome_timeline,
            events
        )
        prompt = get_factual_prompt(customer, emotion, main_variants)

        messages = self.get_messages(prompt, system_message)
        params = self.ask_llm_for_function(messages, [generate_factual_monologue_variants])

        return {
            "opener": params["alex_phrase"],
            "variants": [
              params["very_suspicious"],
              params["suspicious"],
              params["neutral"],
              params["trusting"],
              params["very_trusting"],
          ]
        }
    
    @retry_on_error(max_attempts=3)
    def get_main_conversation(self, question, customer_id, character_stats, recent_story, outcome_timeline, events):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            character_stats,
            recent_story, 
            outcome_timeline,
            events
        )
        prompt = get_main_prompt(customer, question)
        
        messages = self.get_messages(prompt, system_message)
        params = self.ask_llm_for_function(messages, [generate_main_monologue_variants])

        return {
            "opener": question,
            "variants": [
              params["very_suspicious"],
              params["suspicious"],
              params["neutral"],
              params["trusting"],
              params["very_trusting"],
          ],
          "emotion": params["ending_emotion"],
        }
    
    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))
        self.customers = self.world_context["bar"]["customers"]