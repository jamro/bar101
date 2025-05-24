from utils import retry_on_error
from services.AiService import AiService
import os
import json
from .prompts import get_system_message, get_prompt

class BookWriter(AiService):
   
    def __init__(self, openai_api_key):
        super().__init__(openai_api_key)
        self.world_context = None
        self.story_summary = ""
        self.chapter_count = 0

    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))

    def write_book(self, new_events, outcome):
        self.story_summary += f"## CHAPTER {self.chapter_count + 1}\n{outcome}\n\nTimeline:\n"

        for event in new_events:
            self.story_summary += f" - {event['timestamp']}: {event['description']}\n"

        self.story_summary += "\n\n"
        self.chapter_count += 1

        messages = self.get_messages(
            get_prompt(self.chapter_count*20+60), 
            get_system_message(self.world_context['background'], self.story_summary)
        )
        response = self.ask_llm(messages)
        return response.choices[0].message.content