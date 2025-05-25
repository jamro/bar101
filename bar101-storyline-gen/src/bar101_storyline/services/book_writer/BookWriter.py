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
        chapter_info = f"## CHAPTER {self.chapter_count + 1}\n{outcome}\n\nTimeline:\n"

        for event in new_events:
            chapter_info += f" - {event['timestamp']}: {event['description']}\n"

        chapter_info += "\n\n"
        self.chapter_count += 1

        messages = self.get_messages(
            get_prompt(), 
            get_system_message(self.world_context['background'], self.story_summary, chapter_info)
        )
        response = self.ask_llm(messages)

        self.story_summary += chapter_info

        return response.choices[0].message.content