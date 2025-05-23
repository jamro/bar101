variant_props = {
    "very_suspicious": {
        "description": "List of monologue messages for very suspicious level. Each message should be a short phrase.",
        "items": {
            "type": "string"
        },
    },
    "suspicious": {
        "description": "List of monologue messages for suspicious level. Each message should be a short phrase.",
        "items": {
            "type": "string"
        },
    },
    "neutral": {
        "description": "List of monologue messages for neutral level. Each message should be a short phrase.",
        "items": {
            "type": "string"
        },
    },
    "trusting": {
        "description": "List of monologue messages for trusting level. Each message should be a short phrase.",
        "items": {
            "type": "string"
        },
    },
    "very_trusting": {
        "description": "List of monologue messages for very trusting level. Each message should be a short phrase.",
        "items": {
            "type": "string"
        },
    }
}

generate_dilemma_monologue_variants = {
  "name": "generate_monologue_variants",
  "description": "Generates 5 monologue variants based on trust levels for a given character to reveal that they are in a dilemma.",
  "parameters": {
    "type": "object",
    "properties": {
        **variant_props
    },
    "required": [ "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
  }
}

monologue_structure = {
    "type": "object",
    "properties": {
        "belief": {
            "type": "string",
            "description": "Rewritten belief - keep the original form"
        },
        "monologue": {
            "description": "Monologue message of the customer related to the belief",
            "type": "array",
            "items": {
                "type": "string",
                "description": "Monologue line"
            }
        },
        "supportive_response": {
            "description": "Supportive response of the bartender Alex",
            "type": "array",
            "items": {
                "description": "Supportive response line",
                "type": "string"
            }
        },
        "challenging_response": {
            "description": "Challenging response of the bartender Alex",
            "type": "array",
            "items": {
                "description": "Challenging response line",
                "type": "string"
            }
        }
    },
}

generate_beliefs_monologue_variants = {
  "name": "generate_monologue_variants",
  "description": "Generate THREE monologue variants for each belief. Make sure the number of monologues must match the number of beliefs.",
  "parameters": {
    "type": "object",
    "properties": {
        "monologue_1": {
            "description": "Monologue for the first belief",
            **monologue_structure
        },
        "monologue_2": {
            "description": "Monologue for the second belief",
            **monologue_structure
        },
        "monologue_3": {
            "description": "Monologue for the third belief",
            **monologue_structure
        },
    },
    "required": ["monologue_1", "monologue_2", "monologue_3"]
  }
}

generate_decision_monologue_variants = {
  "name": "generate_monologue_variants",
  "description": "Generate 3 monologues sharing the decision made by the customer. One is choice A influenced by Alex, one is choice B influenced by Alex, and one is the decision made by the customer itself. For each monologue, create 5 variants based on trust levels for a given character.",
  "parameters": {
    "type": "object",
    "properties": {
        "monologue_a": {
            "type": "object",
            "description": "5 variants of monologue where the customer shares the decision made to go with choice A influenced by Alex. Expresses gratitude to Alex.",
            "properties": {
                **variant_props
            }
        },
        "monologue_b": {
            "type": "object",
            "description": "5 variants of monologue where the customer shares the decision made to go with choice B influenced by Alex. Expresses gratitude to Alex.",
            "properties": {
                **variant_props
            }
        },
        "monologue_self": {
            "type": "object",
            "description": "5 variants of monologue where the customer shares the decision to go prefered path made by itself as discussion with Alex was not helpful.",
            "properties": {
                **variant_props
            }
        }
            
    },
    "required": [ "monologue_a", "monologue_b", "monologue_self"]
  }
}