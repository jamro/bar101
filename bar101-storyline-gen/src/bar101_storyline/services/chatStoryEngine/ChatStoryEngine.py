import random
from openai import OpenAI
import os
import json
from utils import ask_llm
from .openers import all_openers
from .prompts import get_system_message, get_main_prompt, get_emotional_prompt, get_factual_prompt
from utils import retry_on_error

class ChatStoryEngine:
    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None

        self.variant_props = {
            "very_suspicious": {
                "description": "List of monologue messages for very suspicious level",
                "items": {
                    "type": "string"
                },
            },
            "suspicious": {
                "description": "List of monologue messages for suspicious level",
                "items": {
                    "type": "string"
                },
            },
            "neutral": {
                "description": "List of monologue messages for neutral level",
                "items": {
                    "type": "string"
                },
            },
            "trusting": {
                "description": "List of monologue messages for trusting level",
                "items": {
                    "type": "string"
                },
            },
            "very_trusting": {
                "description": "List of monologue messages for very trusting level",
                "items": {
                    "type": "string"
                },
            }
        }

        self.generate_main_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generates 5 monologue variants based on trust levels for a given character and stores them. Each variant ends with the same emotional state.",
          "parameters": {
            "type": "object",
            "properties": {
                "ending_emotion": {
                    "description": "Emotion of the at the end of the monologue",
                    "type": "string"
                },
                **self.variant_props
            },
            "required": ["ending_emotion", "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
          }
        }

        self.generate_emotional_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generates 5 monologue variants based on trust levels for a given character and stores them. Include emphatical Alex's phrase that triggered the conversation.",
          "parameters": {
            "type": "object",
            "properties": {
                "alex_phrase": {
                    "description": "Alex's phrase that is highly emphatical and triggered the conversation",
                    "type": "string"
                },
                **self.variant_props
            },
            "required": ["alex_phrase", "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
          }
        }

        self.generate_factual_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generates 5 monologue variants based on trust levels for a given character and stores them. Include Alex's phrase that pushed you to share more details.",
          "parameters": {
            "type": "object",
            "properties": {
                "alex_phrase": {
                    "description": "Alex's phrase that is highly emphatical and triggered the conversation",
                    "type": "string"
                },
                **self.variant_props
            },
            "required": ["alex_phrase", "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
          }
        }

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
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = ask_llm(self.client, messages, functions=[self.generate_emotional_monologue_variants_func])
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

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

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = ask_llm(self.client, messages, functions=[self.generate_factual_monologue_variants_func])
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

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
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = ask_llm(self.client, messages, functions=[self.generate_main_monologue_variants_func])
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

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