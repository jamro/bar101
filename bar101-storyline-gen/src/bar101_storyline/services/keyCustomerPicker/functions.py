get_refine_customer_dilemma = lambda key_customer: {
  "name": "refine_customer_dilemma",
  "description": "Get the customer's dilemma",
  "parameters": {
      "type": "object",
      "properties": {
          "trigger_event": {
              "type": "string",
              "description": f"One sentence description of the event that lead {key_customer['name']} to face the dilemma. Style: concise, clear, and easy to understand."
          },
          "dilemma": {
              "type": "string",
              "description": "1-2 sentence summary of the dilemma. Style: concise, clear, and easy to understand."
          },
          "reason": {
              "type": "string",
              "description": "The reason why the customer is unsure about the decision. Style: concise, clear, and easy to understand."
          },
          "variant_a": {
              "type": "string",
              "description": "The choice that leads to VARIANT A. Style: concise, clear, and easy to understand."
          },
          "political_support_a": {
              "type": "string",
              "description": "The political faction which is supported by the VARIANT A. Possible values: 'harmonists', 'innovators', 'directorate' or 'rebel'."
          },
          "sub_beliefs_driver_a": {
              "type": "array",
              "description": f"List of 3 distinct sub beliefs of {key_customer['name']} that leads to choose VARIANT A. All must be components of the main belief driver A and they must be opposite of the sub beliefs driver B",
              "items": {
                  "type": "string",
                  "description": f"A sub belief of {key_customer['name']} that leads to choose VARIANT A and is part of the main belief driver A. Format: compact, single sentence."
              }
          },
          "transition_events_a": {
              "type": "array",
              "description": f"The events related to {key_customer['name']}'s decision that ensures smooth transition from the TIMELINE to VARIANT A.",
              "items": {
                  "type": "object",
                  "properties": {
                      "timestamp": {"type": "string", "description": "The date of the event in YYYY-MM-DDTHH:mm:SS format. It MUST be between the last event in the TIMELINE and the first event in VARIANT A."},
                      "visibility": {"type": "string", "description": "The visibility level of the event (e.g., public, semi-public, internal, private)."},
                      "description": {"type": "string", "description": f"A brief description of the event. Style: clear, compact and easy to understand. Do NOT include {key_customer['name']} name in the event description. focus on outcomes"}
                  },
                  "required": ["timestamp", "visibility", "description"]
              }
          },
          "variant_b": {
              "type": "string",
              "description": "The choice that leads to VARIANT B. Style: concise, clear, and easy to understand."
          },
          "political_support_b": {
              "type": "string",
              "description": "The political faction which is supported by the VARIANT B. Possible values: 'harmonists', 'innovators', 'directorate' or 'rebel'."
          },
          "sub_beliefs_driver_b": {
              "type": "array",
              "description": f"List of 3 distinct sub beliefs of {key_customer['name']} that leads to choose VARIANT B. All must be components of the main belief driver B and they must be opposite of the sub beliefs driver A.",
              "items": {
                  "type": "string",
                  "description": f"A sub belief of {key_customer['name']} that leads to choose VARIANT B and is part of the main belief driver N. Format: compact, single sentence."
              }
          },
          "transition_events_b": {
              "type": "array",
              "description": f"The events related to {key_customer['name']}'s decision that ensures smooth transition from the TIMELINE to VARIANT B.",
              "items": {
                  "type": "object",
                  "properties": {
                      "timestamp": {"type": "string", "description": "The date of the event in YYYY-MM-DDTHH:mm:SS format. It MUST be between the last event in the TIMELINE and the first event in VARIANT B."},
                      "visibility": {"type": "string", "description": "The visibility level of the event (e.g., public, semi-public, internal, private)."},
                      "description": {"type": "string", "description": f"A brief description of the event. Style: clear, compact and easy to understand. Do NOT include {key_customer['name']} name in the event description. focus on outcomes"}
                  },
                  "required": ["timestamp", "visibility", "description"]
              }
          },
          "preference": {
              "type": "string",
              "description": f"The variant that {key_customer['name']} prefers. It must be aligned with character profile and backstory. Allowed values: A or B."
          }
      },
      "required": ["customer_id", "dilemma", "reason", "variant_a", "belief_driver_a", "transition_events_a", "variant_b", "belief_driver_b", "transition_events_b", "preference"]
  }
}