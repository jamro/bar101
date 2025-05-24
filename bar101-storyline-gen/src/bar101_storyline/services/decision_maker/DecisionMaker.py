import os
import json
import random
from .openers import all_openers
from .prompts import get_system_message, get_dilemma_prompt, get_beliefs_prompt, get_decision_prompt
from utils import retry_on_error
from .functions import generate_dilemma_monologue_variants, generate_beliefs_monologue_variants, generate_decision_monologue_variants
from services.AiService import AiService

class DecisionMaker(AiService):
    def __init__(self, openai_api_key):
        super().__init__(openai_api_key)
        self.world_context = None

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
        messages = self.get_messages(prompt, system_message)
        params = self.ask_llm_for_function(messages, [generate_dilemma_monologue_variants])

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
        messages = self.get_messages(prompt, system_message)
        params = self.ask_llm_for_function(messages, [generate_beliefs_monologue_variants])

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
        messages = self.get_messages(prompt, system_message)
        params = self.ask_llm_for_function(messages, [generate_decision_monologue_variants])

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
