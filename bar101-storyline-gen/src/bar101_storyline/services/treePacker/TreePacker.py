import os
import json
from datetime import datetime, timedelta
import random

class TreePacker:

    def _read_file(self, path, filename, no_error=False):
        file_path = os.path.join(path, filename)
        if not os.path.exists(file_path):
            if no_error:
                return None
            else:
                raise FileNotFoundError(f"File not found at {file_path}")
        with open(file_path, "r") as f:
            return json.load(f)
        
    def _clean(self, data):
        if isinstance(data, str):
            data = data.replace("\u002d", "-")
            data = data.replace("\u2011", "-")
            data = data.replace("\u2013", "-")
            data = data.replace("\u2014", " - ")
            data = data.replace("\u2019", "'")
            data = data.replace("\u2026", "...")
            data = data.replace("\u2018", "'")
            data = data.replace("\u201c", "'")
            data = data.replace("\u201d", "'")
            data = data.replace("\u0019", "'")
            data = data.replace("\u00e9", "e")
            data = data.replace("\u0014", " ")
            data = data.replace("\u202f", " ")
            data = data.replace("\"", "'")
            if data.startswith("'") and data.endswith("'"):
                data = data[1:-1]

            return data
        
        if isinstance(data, list):
            return [self._clean(item) for item in data]
        
        if isinstance(data, dict):
            cleaned_data = {}
            for key, value in data.items():
                cleaned_value = self._clean(value)
                cleaned_data[key] = cleaned_value
            return cleaned_data
        
        return data
   
    def pack_node(self, path, variants_chain):
        # get next branches
        branch_a_path = os.path.join(path, "a")
        branch_b_path = os.path.join(path, "b")
        branch_a = self._read_file(branch_a_path, "_plot.json", no_error=True)
        branch_b = self._read_file(branch_b_path, "_plot.json", no_error=True)
        branch_a_title = branch_a["title"] if branch_a else "Unknown"
        branch_b_title = branch_b["title"] if branch_b else "Unknown"

        # get parent node from parent dir of path
        if len(variants_chain) > 0:
            parent_dir = os.path.dirname(path)
            parent_node = self._read_file(parent_dir, "node.json")
        else:
            parent_node = None

        # get node title
        if len(variants_chain) > 0:
            _plot = self._read_file(path, "_plot.json")
            title = _plot["title"]
        else:
            title = "Halden's Death"
        characters = self._read_file(path, "characters.json")
        dilemma = self._read_file(path, "dilemma.json", no_error=True)
        visitors = self._read_file(path, "visitors.json", no_error=True) or []
        timeline = self._read_file(path, "timeline.json", no_error=True) or []
        visitors_chat = {}
        for visitor in visitors:
            visitors_chat[visitor] = {
                "opener": self._read_file(path, f"chat_{visitor}_opener.json"),
                "main": self._read_file(path, f"chat_{visitor}_main.json"),
            }
        if dilemma:
            visitors_chat[dilemma["customer_id"]]['decision'] = self._read_file(path, f"chat_{dilemma['customer_id']}_decision.json")
            visitors_chat[dilemma["customer_id"]]['decision']['title_a'] = branch_a_title
            visitors_chat[dilemma["customer_id"]]['decision']['title_b'] = branch_b_title

        character_stats = {}
        for character in characters:
            bci_history = []
            if not parent_node:
                bci_history = [characters[character]["bci_score"]]
                for _ in range(10):
                    bci_history.insert(0, max(0, min(100, bci_history[0] + random.randint(-5, 5))))
            else:
                bci_history = parent_node["character_stats"][character]["bci_history"] + [characters[character]["bci_score"]]
            character_stats[character] = {
                "bci_score": characters[character]["bci_score"],
                "political_preference": characters[character]["political_preference"],
                "bci_history": bci_history,
            }

        timestamp = timeline[-1]['timestamp']
        next_day = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S") + timedelta(days=1)
        next_day = next_day.replace(hour=random.randint(19, 20), minute=random.randint(0, 59), second=0)

        raw_result = {
            "title": title,
            "timestamp": next_day.isoformat(),
            "news": self._read_file(path, "news.json"),
            "visitors": visitors,
            "character_stats": character_stats,
            "chats": visitors_chat,
        }

        return self._clean(raw_result)
        