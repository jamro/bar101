refine_events = {
    "name": "refine_events",
    "description": "Refine the events that occurred as a result of the choice made by the customer.",
    "parameters": {
        "type": "object",
        "properties": {
            "events": {
                "type": "array",
                "description": "Timeline events caused by branch A.",
                "items": {
                    "type": "object",
                    "properties": {
                        "timestamp": {"type": "string", "description": "The date of the event in YYYY-MM-DDTHH:mm:SS format."},
                        "visibility": {"type": "string", "description": "The visibility level of the event (e.g., public, semi-public, internal, private)."},
                        "description": {"type": "string", "description": "A brief description of the event. Style: clear, compact and easy to understand."}
                    },
                    "required": ["timestamp", "visibility", "description"]
                }
            },
        },
        "required": ["events"]
    }
}