import os
import json

class TreePacker:

    def _read_file(self, path, filename):
        file_path = os.path.join(path, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found at {file_path}")
        with open(file_path, "r") as f:
            return json.load(f)
   
    def pack_node(self, path):
        characters = self._read_file(path, "characters.json")
        dilemma = self._read_file(path, "dilemma.json")
        visitors = self._read_file(path, "visitors.json")
        visitors_chat = {}
        for visitor in visitors:
            visitors_chat[visitor] = {
                "opener": self._read_file(path, f"chat_{visitor}_opener.json"),
                "main": self._read_file(path, f"chat_{visitor}_main.json"),
            }
          
        visitors_chat[dilemma["customer_id"]]['decision'] = self._read_file(path, f"chat_{dilemma['customer_id']}_decision.json")

        character_stats = {}
        for character in characters:
            character_stats[character] = {
                "bci_score": characters[character]["bci_score"],
                "political_preference": characters[character]["political_preference"],
            }

        return {
            "news": self._read_file(path, "news.json"),
            "visitors": visitors,
            "character_stats": character_stats,
            "chats": visitors_chat,
            
        }
        