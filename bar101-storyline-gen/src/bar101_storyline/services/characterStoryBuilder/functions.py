store_character_chapter = {
  "name": "store_character_chapter",
  "description": "Store character chapter showing how related external events have directly affected the character's daily life",
  "parameters": {
    "type": "object",
    "properties": {
      "chapter": {
          "description": "The paragraph containing the character's story based on recent events",
          "items": {
            "type": "string"
          },
      },
      "old_bci_score": {
          "description": "The initial character's BCI score before the chapter.",
          "type": "number",
          "minimum": 0,
          "maximum": 100
      },
      "new_bci_score": {
          "description": "The new character's BCI score after the chapter.",
          "type": "number",
          "minimum": 0,
          "maximum": 100
      },
    },
    "required": ["chapter", "bci_score"]
  }
}