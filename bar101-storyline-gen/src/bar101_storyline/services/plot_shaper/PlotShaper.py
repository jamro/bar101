import os
import json
import random
from .prompts import get_system_message, get_brainstorm_prompt, get_fork_prompt
from utils import retry_on_error
from .functions import fork_storyline
from services.AiService import AiService

class PlotShaper(AiService):

    def __init__(self, openai_api_key):
        super().__init__(openai_api_key)
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

    def move_to_next_stage(self):
        self.plot_stage_index += 1

    @retry_on_error(max_attempts=3)
    def fork_plot(self, log_callback=None):
        system_message = get_system_message(self.world_context['background'], self.timeline)
            
        plot_stage = self.get_plot_stage()
        chapter_examples = "\n   * ".join(random.sample(plot_stage['examples'], 10))

        brainstorm_prompt = get_brainstorm_prompt(plot_stage, chapter_examples)
        messages = self.get_messages(brainstorm_prompt, system_message)

        log_callback("[dim]Brainstorming ideas for the next chapter...[/dim]") if log_callback else None
        response = self.ask_llm(messages)

        fork_prompt = get_fork_prompt(plot_stage, chapter_examples)

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": brainstorm_prompt},
            {"role": "assistant", "content": response.choices[0].message.content},
            {"role": "user", "content": fork_prompt}
        ]

        log_callback("[dim]Forking the storyline...[/dim]") if log_callback else None
        params = self.ask_llm_for_function(messages, [fork_storyline])

        return {
            "branch_a": params["branch_a"],
            "branch_b": params["branch_b"],
            "branch_a_title": params["branch_a_title"],
            "branch_b_title": params["branch_b_title"],
            "events_a": params["events_a"],
            "events_b": params["events_b"],
            "plot_stage": plot_stage
        }