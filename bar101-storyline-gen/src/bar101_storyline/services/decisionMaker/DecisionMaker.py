from openai import OpenAI
import os
import json
import random
from utils import ask_llm
from .openers import all_openers
from .prompts import get_system_message, get_dilemma_prompt, get_beliefs_prompt, get_decision_prompt
from utils import retry_on_error

class DecisionMaker:

    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None

        self.variant_props = {
            "very_suspicious": {
                "description": "List of monologue messages for very suspicious level. Each message should be a short phrase.",
                "items": {
                    "type": "string"
                },
            },
            "suspicious": {
                "description": "List of monologue messages for suspicious level. Each message should be a short phrase.",
                "items": {
                    "type": "string"
                },
            },
            "neutral": {
                "description": "List of monologue messages for neutral level. Each message should be a short phrase.",
                "items": {
                    "type": "string"
                },
            },
            "trusting": {
                "description": "List of monologue messages for trusting level. Each message should be a short phrase.",
                "items": {
                    "type": "string"
                },
            },
            "very_trusting": {
                "description": "List of monologue messages for very trusting level. Each message should be a short phrase.",
                "items": {
                    "type": "string"
                },
            }
        }

        self.generate_dilemma_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generates 5 monologue variants based on trust levels for a given character to reveal that they are in a dilemma.",
          "parameters": {
            "type": "object",
            "properties": {
                **self.variant_props
            },
            "required": [ "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
          }
        }

        monologue_structure = {
            "type": "object",
            "properties": {
                "belief": {
                    "type": "string",
                    "description": "Rewritten belief - keep the original form"
                },
                "monologue": {
                    "description": "Monologue message of the customer related to the belief",
                    "type": "array",
                    "items": {
                        "type": "string",
                        "description": "Monologue line"
                    }
                },
                "supportive_response": {
                    "description": "Supportive response of the bartender Alex",
                    "type": "array",
                    "items": {
                        "description": "Supportive response line",
                        "type": "string"
                    }
                },
                "challenging_response": {
                    "description": "Challenging response of the bartender Alex",
                    "type": "array",
                    "items": {
                        "description": "Challenging response line",
                        "type": "string"
                    }
                }
            },
        }

        self.generate_beliefs_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generate THREE monologue variants for each belief. Make sure the number of monologues must match the number of beliefs.",
          "parameters": {
            "type": "object",
            "properties": {
                "monologue_1": {
                    "description": "Monologue for the first belief",
                    **monologue_structure
                },
                "monologue_2": {
                    "description": "Monologue for the second belief",
                    **monologue_structure
                },
                "monologue_3": {
                    "description": "Monologue for the third belief",
                    **monologue_structure
                },
            },
            "required": ["monologue_1", "monologue_2", "monologue_3"]
          }
        }


        self.generate_decision_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generate 3 monologues sharing the decision made by the customer. One is choice A influenced by Alex, one is choice B influenced by Alex, and one is the decision made by the customer itself. For each monologue, create 5 variants based on trust levels for a given character.",
          "parameters": {
            "type": "object",
            "properties": {
                "monologue_a": {
                    "type": "object",
                    "description": "5 variants of monologue where the customer shares the decision made to go with choice A influenced by Alex. Expresses gratitude to Alex.",
                    "properties": {
                        **self.variant_props
                    }
                },
                "monologue_b": {
                    "type": "object",
                    "description": "5 variants of monologue where the customer shares the decision made to go with choice B influenced by Alex. Expresses gratitude to Alex.",
                    "properties": {
                        **self.variant_props
                    }
                },
                "monologue_self": {
                    "type": "object",
                    "description": "5 variants of monologue where the customer shares the decision to go prefered path made by itself as discussion with Alex was not helpful.",
                    "properties": {
                        **self.variant_props
                    }
                }
                    
            },
            "required": [ "monologue_a", "monologue_b", "monologue_self"]
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

    @retry_on_error(max_attempts=3)
    def expose_dilemma(self, customer, character_stats, dilemma, timeline):
        opener = random.choice(all_openers)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            character_stats,
            timeline
        )
        prompt = get_dilemma_prompt(
            customer,
            dilemma["trigger_event"],
            dilemma["dilemma"],
            dilemma["reason"],
            opener,
            dilemma["choice_a"],
            dilemma["choice_b"]
        )
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = ask_llm(
            self.client,
            messages,
            functions=[self.generate_dilemma_monologue_variants_func]
        )
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        return {
            "opener": opener,
            "variants": [
              params["very_suspicious"],
              params["suspicious"],
              params["neutral"],
              params["trusting"],
              params["very_trusting"],
          ]
        }
    
    @retry_on_error(max_attempts=3)
    def share_beliefs(self, customer, character_stats, dilemma, timeline, choice_a, choice_b, beliefs):
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            character_stats,
            timeline
        )
        prompt = get_beliefs_prompt(
            customer,
            dilemma["trigger_event"],
            dilemma["dilemma"],
            dilemma["reason"],
            choice_a,
            choice_b,
            beliefs
        )
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = ask_llm(
            self.client,
            messages,
            functions=[self.generate_beliefs_monologue_variants_func]
        )
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        monologues = [
            params["monologue_1"],
            params["monologue_2"],
            params["monologue_3"]
        ]

        return monologues
    
    @retry_on_error(max_attempts=3)
    def share_decision(self, customer, character_stats, dilemma, timeline, choice_a, choice_b):
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            character_stats,
            timeline
        )
        prompt = get_decision_prompt(
            customer,
            dilemma["trigger_event"],
            dilemma["dilemma"],
            dilemma["reason"],
            choice_a,
            choice_b,
            dilemma["preference"]
        )
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = ask_llm(
            self.client,
            messages,
            functions=[self.generate_decision_monologue_variants_func]
        )
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        return {
            "monologue_a": [
                params["monologue_a"]["very_suspicious"],
                params["monologue_a"]["suspicious"],
                params["monologue_a"]["neutral"],
                params["monologue_a"]["trusting"],
                params["monologue_a"]["very_trusting"],
            ],
            "monologue_b": [
                params["monologue_b"]["very_suspicious"],
                params["monologue_b"]["suspicious"],
                params["monologue_b"]["neutral"],
                params["monologue_b"]["trusting"],
                params["monologue_b"]["very_trusting"],
            ],
            "monologue_self": [
                params["monologue_self"]["very_suspicious"],
                params["monologue_self"]["suspicious"],
                params["monologue_self"]["neutral"],
                params["monologue_self"]["trusting"],
                params["monologue_self"]["very_trusting"],
            ]
        }
    
    def get_dilemma_convo(self, customer, character_stats, dilemma, timeline, log_callback=None):
        log_callback(f"[dim]{customer['id']} share the dilemma...[/dim]") if log_callback else None
        dilemma_chat = self.expose_dilemma(customer, character_stats, dilemma, timeline)
        log_callback(f"[dim]{customer['id']} share the beliefs A...[/dim]") if log_callback else None
        belief_a_chat = self.share_beliefs(
            customer, 
            character_stats,
            dilemma, 
            timeline, 
            dilemma["choice_a"], 
            dilemma["choice_b"], 
            dilemma["belief_a"]
          )
        log_callback(f"[dim]{customer['id']} share the beliefs B...[/dim]") if log_callback else None
        belief_b_chat = self.share_beliefs(
            customer, 
            character_stats,
            dilemma, 
            timeline, 
            dilemma["choice_b"], 
            dilemma["choice_a"], 
            dilemma["belief_b"]
          )
        log_callback(f"[dim]{customer['id']} share the decision...[/dim]") if log_callback else None
        decision_chat = self.share_decision(
            customer, 
            character_stats,
            dilemma, 
            timeline, 
            dilemma["choice_a"], 
            dilemma["choice_b"], 
        )
        return {
            "preference": dilemma["preference"],
            "dilemma": dilemma_chat,
            "belief_a": belief_a_chat,
            "belief_b": belief_b_chat,
            "decision": decision_chat
        }
