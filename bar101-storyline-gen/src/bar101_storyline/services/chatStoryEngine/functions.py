
variant_props = {
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
}

generate_main_monologue_variants = {
  "name": "generate_monologue_variants",
  "description": "Generates 5 monologue variants based on trust levels for a given character and stores them. Each variant ends with the same emotional state.",
  "parameters": {
    "type": "object",
    "properties": {
        "ending_emotion": {
            "description": "Emotion of the at the end of the monologue",
            "type": "string"
        },
        **variant_props
    },
    "required": ["ending_emotion", "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
  }
}

generate_emotional_monologue_variants = {
  "name": "generate_monologue_variants",
  "description": "Generates 5 monologue variants based on trust levels for a given character and stores them. Include emphatical Alex's phrase that triggered the conversation.",
  "parameters": {
    "type": "object",
    "properties": {
        "alex_phrase": {
            "description": "Alex's phrase that is highly emphatical and triggered the conversation",
            "type": "string"
        },
        **variant_props
    },
    "required": ["alex_phrase", "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
  }
}

generate_factual_monologue_variants = {
  "name": "generate_monologue_variants",
  "description": "Generates 5 monologue variants based on trust levels for a given character and stores them. Include Alex's phrase that pushed you to share more details.",
  "parameters": {
    "type": "object",
    "properties": {
        "alex_phrase": {
            "description": "Alex's phrase that is highly emphatical and triggered the conversation",
            "type": "string"
        },
        **variant_props
    },
    "required": ["alex_phrase", "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
  }
}