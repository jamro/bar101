generate_monologue_variants = {
  "name": "generate_monologue_variants",
  "description": "Generates 5 monologue variants based on trust levels for a given character and stores them",
  "parameters": {
    "type": "object",
    "properties": {
        "very_suspicious": {
            "description": "List of monologue messages for very suspicious level",
            "items": {
                "type": "string"
            },
        },
        "suspicious": {
            "description": "List of monologue messages for suspicious level",
            "items": {
                "type": "string"
            },
        },
        "neutral": {
            "description": "List of monologue messages for neutral level",
            "items": {
                "type": "string"
            },
        },
        "trusting": {
            "description": "List of monologue messages for trusting level",
            "items": {
                "type": "string"
            },
        },
        "very_trusting": {
            "description": "List of monologue messages for very trusting level",
            "items": {
                "type": "string"
            },
        }
    },
    "required": ["very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
  }
}