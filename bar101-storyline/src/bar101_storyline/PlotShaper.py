from openai import OpenAI
import os
import json

class PlotShaper:

    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.timeline = []
        self.world_context = None
        self.plot_structure = None
        self.plot_stage_index = 0

    def get_plot_stage(self):
        if self.plot_stage_index >= len(self.plot_structure):
            return self.plot_structure[-1]
        return self.plot_structure[self.plot_stage_index]
    
    def is_complete(self):
        if self.plot_stage_index >= len(self.plot_structure):
            return True
        return False

    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.timeline = read_context_file(os.path.join(base_path, "timeline.json"))
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))
        self.plot_structure = read_context_file(os.path.join(base_path, "plot_structure.json"))
        self.customers = self.world_context['bar']['customers']

    def fork_plot(self):
        last_error = None
        for i in range(3):
            try:
                response = self._fork_plot()
                if response is not None:
                    return response
            except Exception as e:
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to fork plot after 3 attempts: {last_error}")
        
    def _fork_plot(self):
        system_message = f"""# BACKGROUND
{self.world_context['background']}
"""
            
        timeline_info = ""
        for event in self.timeline:
            timeline_info += f" - {event['timestamp']} ({event['visibility']}) - {event['description']}\n"
            
        plot_stage = self.get_plot_stage()
        chapter_examples = "\n   * ".join(plot_stage['examples'])
        event_count = "between 3 and 5"

        prompt = f"""
# TIMELINE
{timeline_info}

-----
Fork the storyline described by creating two two distinct version of the next chapter.
Make sure each version is distinct and push the story in a different direction.
Be specific and detailed about sotry elements, characters, and events.
For each of the branched chapter, create series of {event_count} events that happened between end of the current timeline and the end of the branched chapter.
Events should provide additional context and details to the chapter.
The events should be clear, compact and easy to understand.

# Next Chapter: {plot_stage['name']}
- Purpose: {plot_stage['purpose']}
- Core Idea: {plot_stage['core']}
- Examples: {chapter_examples}

"""

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]

        functions = [
                {
                    "name": "fork_storyline",
                    "description": "Fork storyline by adding events based on Alex's decision.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "branch_a": {"type": "string", "description": "One sentence summary of the branch A. Style: clear, compact and easy to understand."},
                            "branch_b": {"type": "string", "description": "One sentence summary of the branch B. Style: clear, compact and easy to understand."},
                            "events_a": {
                                "type": "array",
                                "description": "Timeline events caused by branch A.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "timestamp": {"type": "string", "description": "The date of the event in YYYY-MM-DD format."},
                                        "visibility": {"type": "string", "description": "The visibility level of the event (e.g., public, semi-public, internal, private)."},
                                        "description": {"type": "string", "description": "A brief description of the event. Style: clear, compact and easy to understand."}
                                    },
                                    "required": ["timestamp", "visibility", "description"]
                                }
                            },
                            "events_b": {
                                "type": "array",
                                "description": "Timeline events caused by branch B.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "timestamp": {"type": "string", "description": "The date of the event in YYYY-MM-DD format."},
                                        "visibility": {"type": "string", "description": "The visibility level of the event (e.g., public, semi-public, internal, private)."},
                                        "description": {"type": "string", "description": "A brief description of the event. Style: clear, compact and easy to understand."}
                                    },
                                    "required": ["timestamp", "visibility", "description"]
                                }
                            }
                        },
                        "required": ["response_a", "response_b", "events_a", "events_b"]
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
            if function_call.name == "fork_storyline":
                params = json.loads(function_call.arguments)
                response = {
                    "branch_a": params["branch_a"],
                    "branch_b": params["branch_b"],
                    "events_a": params["events_a"],
                    "events_b": params["events_b"],
                    "plot_stage": plot_stage
                }
                self.plot_stage_index += 1
                return response

        return None