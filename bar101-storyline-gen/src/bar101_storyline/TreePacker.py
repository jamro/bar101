import os
import json

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
   
    def pack_node(self, path):
        characters = self._read_file(path, "characters.json")
        dilemma = self._read_file(path, "dilemma.json", no_error=True)
        visitors = self._read_file(path, "visitors.json", no_error=True) or []
        visitors_chat = {}
        for visitor in visitors:
            visitors_chat[visitor] = {
                "opener": self._read_file(path, f"chat_{visitor}_opener.json"),
                "main": self._read_file(path, f"chat_{visitor}_main.json"),
            }
        if dilemma:
            visitors_chat[dilemma["customer_id"]]['decision'] = self._read_file(path, f"chat_{dilemma['customer_id']}_decision.json")

        character_stats = {}
        for character in characters:
            character_stats[character] = {
                "bci_score": characters[character]["bci_score"],
                "political_preference": characters[character]["political_preference"],
            }

        raw_result = {
            "news": self._read_file(path, "news.json"),
            "visitors": visitors,
            "character_stats": character_stats,
            "chats": visitors_chat,
        }

        return self._clean(raw_result)
        