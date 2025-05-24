import os
import json
import random
from utils import retry_on_error
from .prompts import get_system_message, get_dilemma_prompt, get_refine_prompt
from .functions import get_refine_customer_dilemma
from services.AiService import AiService

class KeyCustomerPicker(AiService):
    def __init__(self, openai_api_key):
        super().__init__(openai_api_key)
        self.world_context = None
        self.customers = None

    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))
        self.customers = self.world_context['bar']['customers']

    def get_random_customer(self):
        if self.customers is None:
            raise ValueError("Customers not loaded. Please call read_context() first.")
        
        return random.choice(self.customers)
    
    def get_random_patrons(self, required_customer_ids, num_patrons=4):
        if self.customers is None:
            raise ValueError("Customers not loaded. Please call read_context() first.")
        
        all_customer_ids = [customer['id'] for customer in self.customers]
        
        required_customer_ids = [x for x in required_customer_ids if x is not None]
        required_customer_ids = list(set(required_customer_ids))

        patrons = [*required_customer_ids]
        while len(patrons) < num_patrons and len(patrons) < len(all_customer_ids):
            random_customer = random.choice(all_customer_ids)
            if random_customer not in patrons:
                patrons.append(random_customer)
        
        random.shuffle(patrons)
        return patrons

    @retry_on_error(max_attempts=3)
    def pick_customer_dilemma(self, outcome_timeline, timeline, branch_a, branch_b, events_a, events_b, customers_model, log_callback=None):
        timeline = timeline[-8:] # last events
        key_customer = self.get_random_customer()

        character_stats = customers_model[key_customer['id']]

        timeline_info = ""
        for event in timeline:
            timeline_info += f" - {event['timestamp']} ({event['visibility']}) - {event['description']}\n"

        outcome_info = "\n".join([f" - {event}" for event in outcome_timeline])
        system_message = get_system_message(self.world_context, key_customer, character_stats, outcome_info, timeline_info)
        events_a_text = "\n".join([f" - {event['timestamp']} - {event['description']}" for event in events_a])
        events_b_text = "\n".join([f" - {event['timestamp']} - {event['description']}" for event in events_b])
        prompt = get_dilemma_prompt(key_customer['name'], branch_a, branch_b, events_a_text, events_b_text)
        messages = self.get_messages(prompt, system_message)

        log_callback(f"Brainstorming {key_customer['name']} dilemma...") if log_callback else None
        response = self.ask_llm(messages)
        messages.append({"role": "assistant", "content": response.choices[0].message.content})
        
        log_callback("Refining the dilemma...") if log_callback else None
        messages.append({"role": "user", "content": get_refine_prompt()})
        params = self.ask_llm_for_function(messages, [get_refine_customer_dilemma(key_customer)])

        if params["political_support_a"] not in ["harmonists", "innovators", "directorate", "rebel"]:
            raise ValueError(f"Political support A is invalid value: {params['political_support_a']}. Allowed values: 'harmonists', 'innovators', 'directorate' or 'rebel'.")
        if params["political_support_b"] not in ["harmonists", "innovators", "directorate", "rebel"]:
            raise ValueError(f"Political support B is invalid value: {params['political_support_b']}. Allowed values: 'harmonists', 'innovators', 'directorate' or 'rebel'.")
        if params["preference"].lower() not in ["a", "b"]:
            raise ValueError(f"Preference is invalid value: {params['preference']}. Allowed values: A or B.")
        if len(params["sub_beliefs_driver_a"]) != 3:
            raise ValueError(f"Sub beliefs driver A must be a list of 3 distinct beliefs. Found: {len(params['sub_beliefs_driver_a'])}")
        if len(params["sub_beliefs_driver_b"]) != 3:
            raise ValueError(f"Sub beliefs driver B must be a list of 3 distinct beliefs. Found: {len(params['sub_beliefs_driver_b'])}")
        if params["sub_beliefs_driver_a"] == params["sub_beliefs_driver_b"]:
            raise ValueError(f"Sub beliefs driver A and B must be distinct. Found: {params['sub_beliefs_driver_a']}")
        if params["sub_beliefs_driver_a"][0] == params["sub_beliefs_driver_b"][0]:
            raise ValueError(f"Sub beliefs driver A and B must be distinct. Found: {params['sub_beliefs_driver_a'][0]}")

        return {
            "customer": key_customer,
            "trigger_event": params["trigger_event"],
            "dilemma": params["dilemma"],
            "reason": params["reason"],
            "variant_a": params["variant_a"],
            "political_support_a": params["political_support_a"],
            "belief_driver_a": params["sub_beliefs_driver_a"],
            "transition_events_a": params["transition_events_a"],
            "variant_b": params["variant_b"],
            "political_support_b": params["political_support_b"],
            "belief_driver_b": params["sub_beliefs_driver_b"],
            "transition_events_b": params["transition_events_b"],
            "preference": "a" if params["preference"].lower() == "a" else "b",
        }

