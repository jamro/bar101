fork_storyline = {
  "name": "fork_storyline",
  "description": "Fork storyline by adding events based on Alex's decision.",
  "parameters": {
      "type": "object",
      "properties": {
          "branch_a": {"type": "string", "description": "Short summary of the branch A. Be specific and include all important details. Style: clear, compact and easy to understand. Length: 20-40 words."},
          "branch_b": {"type": "string", "description": "Short summary of summary of the branch B. Be specific and include all important details. Style: clear, compact and easy to understand. Length: 20-40 words."},
          "branch_a_title": {"type": "string", "description": "Title of the branch A. Be descriptive and compact. Style: clear, short and easy to understand. Length: 3-5 words at most."},
          "branch_b_title": {"type": "string", "description": "Title of the branch B. Be descriptive and compact. Style: clear, short and easy to understand. Length: 3-5 words at most."},
          "events_a": {
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
          "events_b": {
              "type": "array",
              "description": "Timeline events caused by branch B.",
              "items": {
                  "type": "object",
                  "properties": {
                      "timestamp": {"type": "string", "description": "The date of the event in YYYY-MM-DDTHH:mm:SS format."},
                      "visibility": {"type": "string", "description": "The visibility level of the event (e.g., public, semi-public, internal, private)."},
                      "description": {"type": "string", "description": "A brief description of the event. Style: clear, compact and easy to understand."}
                  },
                  "required": ["timestamp", "visibility", "description"]
              }
          }
      },
      "required": ["response_a", "response_b", "events_a", "events_b"]
  }
}