from openai import OpenAI
import os
import json
import random
from utils import ask_llm
from utils import retry_on_error
from .prompts import get_system_message, get_dilemma_prompt, get_refine_prompt

class KeyCustomerPicker:

    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
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
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]

        log_callback(f"Brainstorming {key_customer['name']} dilemma...") if log_callback else None
        response = ask_llm(self.client, messages)
        messages.append({"role": "assistant", "content": response.choices[0].message.content})
        
        log_callback("Refining the dilemma...") if log_callback else None
        messages.append({"role": "user", "content": get_refine_prompt()})
        response = ask_llm(
            self.client, 
            messages,
            functions=[
                {
                    "name": "refine_customer_dilemma",
                    "description": "Get the customer's dilemma",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "trigger_event": {
                                "type": "string",
                                "description": f"One sentence description of the event that lead {key_customer['name']} to face the dilemma. Style: concise, clear, and easy to understand."
                            },
                            "dilemma": {
                                "type": "string",
                                "description": "1-2 sentence summary of the dilemma. Style: concise, clear, and easy to understand."
                            },
                            "reason": {
                                "type": "string",
                                "description": "The reason why the customer is unsure about the decision. Style: concise, clear, and easy to understand."
                            },
                            "variant_a": {
                                "type": "string",
                                "description": "The choice that leads to VARIANT A. Style: concise, clear, and easy to understand."
                            },
                            "political_support_a": {
                                "type": "string",
                                "description": "The political faction which is supported by the VARIANT A. Possible values: 'harmonists', 'innovators', 'directorate' or 'rebel'."
                            },
                            "sub_beliefs_driver_a": {
                                "type": "array",
                                "description": f"List of 3 distinct sub beliefs of {key_customer['name']} that leads to choose VARIANT A. All must be components of the main belief driver A and they must be opposite of the sub beliefs driver B",
                                "items": {
                                    "type": "string",
                                    "description": f"A sub belief of {key_customer['name']} that leads to choose VARIANT A and is part of the main belief driver A. Format: compact, single sentence."
                                }
                            },
                            "transition_events_a": {
                                "type": "array",
                                "description": f"The events related to {key_customer['name']}'s decision that ensures smooth transition from the TIMELINE to VARIANT A.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "timestamp": {"type": "string", "description": "The date of the event in YYYY-MM-DDTHH:mm:SS format. It MUST be between the last event in the TIMELINE and the first event in VARIANT A."},
                                        "visibility": {"type": "string", "description": "The visibility level of the event (e.g., public, semi-public, internal, private)."},
                                        "description": {"type": "string", "description": f"A brief description of the event. Style: clear, compact and easy to understand. Do NOT include {key_customer['name']} name in the event description. focus on outcomes"}
                                    },
                                    "required": ["timestamp", "visibility", "description"]
                                }
                            },
                            "variant_b": {
                                "type": "string",
                                "description": "The choice that leads to VARIANT B. Style: concise, clear, and easy to understand."
                            },
                            "political_support_b": {
                                "type": "string",
                                "description": "The political faction which is supported by the VARIANT B. Possible values: 'harmonists', 'innovators', 'directorate' or 'rebel'."
                            },
                            "sub_beliefs_driver_b": {
                                "type": "array",
                                "description": f"List of 3 distinct sub beliefs of {key_customer['name']} that leads to choose VARIANT B. All must be components of the main belief driver B and they must be opposite of the sub beliefs driver A.",
                                "items": {
                                    "type": "string",
                                    "description": f"A sub belief of {key_customer['name']} that leads to choose VARIANT B and is part of the main belief driver N. Format: compact, single sentence."
                                }
                            },
                            "transition_events_b": {
                                "type": "array",
                                "description": f"The events related to {key_customer['name']}'s decision that ensures smooth transition from the TIMELINE to VARIANT B.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "timestamp": {"type": "string", "description": "The date of the event in YYYY-MM-DDTHH:mm:SS format. It MUST be between the last event in the TIMELINE and the first event in VARIANT B."},
                                        "visibility": {"type": "string", "description": "The visibility level of the event (e.g., public, semi-public, internal, private)."},
                                        "description": {"type": "string", "description": f"A brief description of the event. Style: clear, compact and easy to understand. Do NOT include {key_customer['name']} name in the event description. focus on outcomes"}
                                    },
                                    "required": ["timestamp", "visibility", "description"]
                                }
                            },
                            "preference": {
                                "type": "string",
                                "description": f"The variant that {key_customer['name']} prefers. It must be aligned with character profile and backstory. Allowed values: A or B."
                            }
                        },
                        "required": ["customer_id", "dilemma", "reason", "variant_a", "belief_driver_a", "transition_events_a", "variant_b", "belief_driver_b", "transition_events_b", "preference"]
                    }
                }
            ]
        )

        if response.choices[0].finish_reason == "function_call":
            function_call = response.choices[0].message.function_call
            if function_call.name == "refine_customer_dilemma":
                params = json.loads(function_call.arguments)

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

                response = {
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
                return response

        raise ValueError("Function call not found in the response.")

