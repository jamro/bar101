from openai import OpenAI
import os
import json

get_system_message = lambda background, events, outcome: f"""# BACKGROUND
{background}

# TIMELINE
{json.dumps(events, indent=2)}

# NEWS
{outcome}
"""

get_official_prompt = lambda: f"""Write and `publish_news` as a brief news segment (5-10 seconds) as broadcast on Stenograd State Broadcast (SSB) 
the official propaganda channel in a technocratic dictatorship. Use the following:
- Use NEWS as the core update that must be announced
- Use the background from the TIMELINE that provides context for the event

Rules:
1. Use only publicly available information. If an internal or semi-public fact is important, you may only refer to its public effects or visible outcomes, never the internal mechanisms or leaked details.
2. The tone should frame the news in a positive, stabilizing, or rational light, consistent with Stenograd's technocratic narrative.
3. Never lie or contradict the truth — instead, use framing, omission, or emphasis to guide public interpretation.
4. Use punchy language: one headline and 1-2 short lines from the anchor. Make sure it is easy to read and understand. Avoid jargon or overly complex language.
5. Be specific and avoid vague or generic statements. Use concrete details and examples to illustrate your points.
6. Structure the news spot as:
 - Headline (on-screen + voice-over) - Use title case or sentence case only (not all caps
 - Anchor Line (calm, controlled tone) - 1 sentence stating the event — framed positively or neutrally
 - Contextual Reframing - Short sentence that emphasizes systemic efficiency, resilience, or progress
"""

get_underground_prompt = lambda: f"""Write and `publish_news` as a brief underground news segment (5-10 seconds) for a pirate broadcast 
in Stenograd — operating outside the control of official state media.
- Use the same [NEWS] and [TIMELINE] as the propaganda spot.
- Present a sharper, more emotional, or skeptical tone — the voice of those living under the system, sharing what's really happening.
- Mix verifiable truths with semi-public knowledge, suppressed facts, or well-sourced rumors and leaks.
- Format it like a scrappy, quickly edited cutscene seen on a hacked feed or darknet stream.
- Make sure it is easy to read and understand. Avoid jargon or overly complex language.

Constraints:
	1.	Tone may be urgent, ironic, bitter, sarcastic, raw, or emotional — reflect the resistance.
	2.	You may reference internal mechanisms if they are semi-public or leaked — as long as it reflects the kind of info that could circulate in the underground.
	3.	Use short, punchy lines — think pirate radio, activist voice, or citizen journalist.
	4.	Highlight contradictions in the official narrative or connect dots the state won’t.
"""


class NewsWriter:
   
    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None
        self.model = "gpt-4o"

    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))
        self.customers = self.world_context['bar']['customers']

    def write_news(self, events, outcome):
        last_error = None
        for i in range(5):
            try:
                response = self._write_news(events, outcome)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
              
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to fork plot after 5 attempts: {last_error}")

    def _write_news(self, events, outcome):
        system_message = get_system_message(self.world_context['background'], events, outcome)
        prompt = get_official_prompt()
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]

        functions = [
                {
                    "name": "publish_news",
                    "description": "Write a news segment",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "headline": {
                                "type": "string",
                                "description": "The headline of the news segment. This should be a short, punchy statement that captures the essence of the news. 2-3 words long."
                            },
                            "anchor_line": {
                                "type": "string",
                                "description": "The anchor line of the news segment. One sentence stating the event"
                            },
                            "contextual_reframing": {
                                "type": "string",
                                "description": "The contextual reframing of the news segment adjusted to official or underground news. 1-2 sentences long."
                            }
                        },
                        "required": ["headline", "anchor_line", "contextual_reframing"]
                    }
                }
            ]

        response = self.client.chat.completions.create(model=self.model, messages=messages, functions=functions)
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "publish_news":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)
        official_news = {
            "headline": params["headline"],
            "anchor_line": params["anchor_line"],
            "contextual_reframing": params["contextual_reframing"]
        }
        messages.append({"role": "assistant", "content": json.dumps(official_news, indent=2)})

        prompt = get_underground_prompt()
        messages.append({"role": "user", "content": prompt})
        response = self.client.chat.completions.create(model=self.model, messages=messages, functions=functions)
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "publish_news":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)
        underground_news = {
            "headline": params["headline"],
            "anchor_line": params["anchor_line"],
            "contextual_reframing": params["contextual_reframing"]
        }

        return {
            "official": official_news,
            "underground": underground_news
        }