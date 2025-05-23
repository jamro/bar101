from openai import OpenAI
import os
import json
from utils import ask_llm
from .prompts import get_system_message, get_prompt
from utils import retry_on_error

class TimelineIntegrator:

    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None
        self.plot_structure = None

    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.timeline = read_context_file(os.path.join(base_path, "timeline.json"))
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))

    @retry_on_error(max_attempts=3)
    def integrate_timeline(self, timeline, events, customer_id, dilemma, choice, outcome):
        all_customers = self.world_context['bar']['customers']
        customer = next((c for c in all_customers if c['id'] == customer_id), None)
        if customer is None:
            raise ValueError(f"Customer with ID {customer_id} not found in world context.")
        
        timeline_info = ""
        for event in timeline:
            timeline_info += f" - {event['timestamp']} ({event['visibility']}) - {event['description']}\n"

        system_message = get_system_message(self.world_context, customer, timeline_info)
        prompt = get_prompt(customer['name'], dilemma, choice, outcome, events)
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        functions = [
                {
                    "name": "refine_events",
                    "description": "Refine the events that occurred as a result of the choice made by the customer.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "events": {
                                "type": "array",
                                "description": "Timeline events caused by branch A.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "timestamp": {"type": "string", "description": "The date of the event in YYYY-MM-DDTHH:mm:SS format."},
                                        "visibility": {"type": "string", "description": "The visibility level of the event (e.g., public, semi-public, internal, private)."},
                                        "description": {"type": "string", "description": "A brief description of the event. Style: clear, compact and easy to understand."}
                                    },
                                    "required": ["timestamp", "visibility", "description"]
                                }
                            },
                        },
                        "required": ["events"]
                    }
                }
            ]
        response = ask_llm(self.client, messages, functions)

        # Handle function call
        if response.choices[0].finish_reason == "function_call":
            function_call = response.choices[0].message.function_call
            if function_call.name == "refine_events":
                params = json.loads(function_call.arguments)
                return params["events"]

        raise Exception("Failed to parse function call response")
