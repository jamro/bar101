from openai import OpenAI
import os
import json

get_system_message = lambda world_context, customer, timeline_info: f"""# BACKGROUND
{world_context['background']}

# BAR 101
{world_context['bar']['details']}

# DECISION MAKER: {customer['name']}
- Age: {customer['age']}
- Sex: {customer['sex']}
- Information access level: {customer['access']}
{customer['details']}

# TIMELINE
{timeline_info}
"""

get_prompt = lambda customer_name, dilemma, choice, outcome, events: f"""
**{customer_name}** faced a dilemma: **{dilemma}**.
**{customer_name}** make a choice: **{choice}**.
The choice leads to the outcome: **{outcome}**.

Events triggered by the choice made by **{customer_name}**:
{json.dumps(events, indent=2)}

# INSTRUCTIONS
`refine_events` that occurred as a result of the choice made by **{customer_name}**.
- Events must ensure smooth transition from the previous events in the TIMELINE.
- Events must be consistent with the world context and the decision maker's profile.
- Make sure events are plausible and realistic.
- Add neccessary details to the events to make them more logical and meaningful.
- When neccesary merge or remove events to ensure smooth transition.
- Adjust time of events to make them more realistic and logical. Make sure the events are in chronological order.
- Avoid overuse of technical jargon when it could lead to confusion or lack of understanding.
- Ensure cause and effect relationships are clear and logical.
- When referring to system failures, limit to BCI (Behavioral Compliance Index) and it's impact on lifes of citizens.
- Style: compact, informative, easy to understand
"""


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


    def integrate_timeline(self, timeline, events, customer_id, dilemma, choice, outcome):
        last_error = None
        for i in range(3):
            try:
                response = self._integrate_timeline(timeline, events, customer_id, dilemma, choice, outcome)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to integrate timeline after 3 attempts: {last_error}")
        

    def _integrate_timeline(self, timeline, events, customer_id, dilemma, choice, outcome):
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
        
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            functions=functions
        )

        # Handle function call
        if response.choices[0].finish_reason == "function_call":
            function_call = response.choices[0].message.function_call
            if function_call.name == "refine_events":
                params = json.loads(function_call.arguments)
                return params["events"]

        raise Exception("Failed to parse function call response")
