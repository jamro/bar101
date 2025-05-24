import os
import json
from .prompts import get_system_message, get_prompt
from utils import retry_on_error
from .functions import refine_events
from services.AiService import AiService

class TimelineIntegrator(AiService):

    def __init__(self, openai_api_key):
        super().__init__(openai_api_key)
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
        messages = self.get_messages(prompt, system_message)
        
        params = self.ask_llm_for_function(messages, [refine_events])
        return params["events"]
