from openai import OpenAI
import os
import json
import random

get_system_message = lambda world_context, customers_info, timeline_info: f"""# BACKGROUND
{world_context['background']}

# BAR 101
{world_context['bar']['details']}

# BAR 101 CUSTOMERS
{customers_info}

# TIMELINE
{timeline_info}
"""

get_dilemma_prompt = lambda customer_name, branch_a, branch_b, events_a, events_b: f"""
# NEXT CHAPTER (VARIANT A)
**{branch_a}**
Events: {"; ".join([event['description'] for event in events_a])}

# NEXT CHAPTER (VARIANT B)
**{branch_b}**
Events: {"; ".join([event['description'] for event in events_b])}

-----
Describe how actions or decisions of {customer_name} influenced the story's transition from the TIMELINE to the NEXT CHAPTER. 
{customer_name} faced a binary, mutually exclusive choice — leading the story down the path of either VARIANT A or VARIANT B.
Their influence may be direct or indirect, shaped in part by their conversations with Alex, the bartender (do not mention Alex directly in the events or variants).
Both paths were viable and probable, but {customer_name} ultimately made a decision that steered the story forward.
Make sure that actions are inline with the character's personality, background, and motivations.

As a result provide:
  - Cause: The event or situation that lead the customer's make face the dilemma. Exmplain why it is plausible and inline with the character's profile.
	-	Dilemma: The key conflict or decision they faced
  - Reason: Why the customer is unsure about the decision
	-	Variant A: The choice that leads to VARIANT A from the TIMELINE
  - Transition Events A: 2-3 events that are between the TIMELINE and VARIANT A ensuring the story's transition. It icludes preceding events, customer's actions, and their consequences that leads to VARIANT A. Be specific and provide all necessary details.
	-	Variant B: The choice that leads to VARIANT B from the TIMELINE
  - Transition Events B: 2-3 events that are between the TIMELINE and VARIANT B ensuring the story's transition. It icludes preceding events, customer's actions, and their consequences that leads to VARIANT B. Be specific and provide all necessary details.
"""

get_refine_prompt = lambda: f"""
`refine_customer_dilemma` to make it more vivid, emotionally engaging, and clearly binary, ensuring both choices are mutually exclusive and lead to distinct story outcomes (VARIANT A or VARIANT B).
Maintain the customer's connection to Alex, the bartender, as a key influence on their thought process.
Make sure a smooth and logical transition from the TIMELINE to the VARIANT A and VARIANT B.
Include in transition events the preceding events, customer's actions, and their consequences that leads to VARIANT A and VARIANT B.
Keep minimal number of events that ensures smooth and logical story transition.
Avoid overuse of technical jargon when it could lead to confusion or lack of understanding.
"""

class KeyCustomerPicker:

    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None
        self.model = "gpt-4o"
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


    def pick_customer_dilemma(self, timeline, branch_a, branch_b, events_a, events_b, log_callback=None):
        last_error = None
        for i in range(3):
            try:
                response = self._pick_customer_dilemma(timeline, branch_a, branch_b, events_a, events_b, log_callback)
                if response is not None:
                    return response
            except Exception as e:
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to fork plot after 3 attempts: {last_error}")

    def _pick_customer_dilemma(self, timeline, branch_a, branch_b, events_a, events_b, log_callback=None):
        timeline = timeline[-10:] # last events
        key_customer = self.get_random_customer()

        timeline_info = ""
        for event in timeline:
            timeline_info += f" - {event['timestamp']} ({event['visibility']}) - {event['description']}\n"

        customers_info = ""
        for customer in self.customers:
            customers_info += f"## {customer['name']} (ID: {customer['id']})\n"
            customers_info += f" - Age: {customer['age']}\n"
            customers_info += f" - Sex: {customer['sex']}\n"
            customers_info += f" - Information access level: {customer['access']}\n"
            customers_info += f"{customer['details']}\n"
            customers_info += "\n"

        system_message = get_system_message(self.world_context, customers_info, timeline_info)
        prompt = get_dilemma_prompt(key_customer['name'], branch_a, branch_b, events_a, events_b)

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]

        log_callback(f"Brainstorming {key_customer['name']} dilemma...") if log_callback else None
        response = self.client.chat.completions.create(model=self.model, messages=messages)
        messages.append({"role": "assistant", "content": response.choices[0].message.content})
        
        log_callback("Refining the dilemma...") if log_callback else None
        messages.append({"role": "user", "content": get_refine_prompt()})
        response = self.client.chat.completions.create(
            model=self.model, 
            messages=messages,
            functions=[
                {
                    "name": "refine_customer_dilemma",
                    "description": "Get the customer's dilemma",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "preceding": {
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
                        },
                        "required": ["customer_id", "dilemma", "reason", "variant_a", "transition_events_a", "variant_b", "transition_events_b"]
                    }
                }
            ]
        )

        if response.choices[0].finish_reason == "function_call":
            function_call = response.choices[0].message.function_call
            if function_call.name == "refine_customer_dilemma":
                params = json.loads(function_call.arguments)

                response = {
                    "customer": key_customer,
                    "preceding": params["preceding"],
                    "dilemma": params["dilemma"],
                    "reason": params["reason"],
                    "variant_a": params["variant_a"],
                    "transition_events_a": params["transition_events_a"],
                    "variant_b": params["variant_b"],
                    "transition_events_b": params["transition_events_b"],
                }
                return response

        raise ValueError("Function call not found in the response.")

