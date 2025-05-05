from openai import OpenAI
import os
import json
import base64
from lib import ask_llm
from diffusers import StableDiffusionPipeline
import torch
import random

NEWS_IMAGES = json.load(open("assets/news_images.json"))

get_system_message = lambda background, events, outcome: f"""# BACKGROUND
{background}

# TIMELINE
{json.dumps(events, indent=2)}

# NEWS
{outcome}

# NEWS_IMAGES
{json.dumps(NEWS_IMAGES, indent=2)}
"""

get_official_prompt = lambda segment_count, extra_context: f"""Write and `publish_news` as a brief news segments (5-10 seconds) as broadcast on Stenograd State Broadcast (SSB) 
the official propaganda channel in a technocratic dictatorship. Use the following:
- Use NEWS as the core update that must be announced
- Use the background from the TIMELINE that provides context for the event
- Pick {segment_count} events from the TIMELINE to create {segment_count} news segments. (if there is no event, in the TIMELINE, generate a new one)

Rules:
1. Use only publicly available information. If an internal or semi-public fact is important, you may only refer to its public effects or visible outcomes, never the internal mechanisms or leaked details.
2. The tone should frame the news in a positive, stabilizing, or rational light, consistent with Stenograd's technocratic narrative.
3. Never lie or contradict the truth — instead, use framing, omission, or emphasis to guide public interpretation.
4. Use punchy language: one headline and 1-2 short lines from the anchor. Make sure it is easy to read and understand. Avoid jargon or overly complex language.
5. Be specific and avoid vague or generic statements. Use concrete details and examples to illustrate your points.
6. Structure the news spot as:
 - Image (on-screen) - The image should be a visual representation of the news segment. The id MUST be in the list of NEWS_IMAGES.
 - Headline (on-screen + voice-over) - Use title case or sentence case only (not all caps)
 - Anchor Line (calm, controlled tone) - 1 sentence stating the event — framed positively or neutrally
 - Contextual Reframing - Short sentence that emphasizes systemic efficiency, resilience, or progress

{extra_context}
"""

get_underground_prompt = lambda segment_count, extra_context: f"""Write and `publish_news` as a brief underground news segments (5-10 seconds) for a pirate broadcast 
in Stenograd — operating outside the control of official state media.
- Use the same NEWS and TIMELINE as the propaganda spot.
- Generate {segment_count} news segments, each focusing on a different issue or event.
- Present a sharper, more emotional, or skeptical tone — the voice of those living under the system, sharing what's really happening.
- Mix verifiable truths with semi-public knowledge, suppressed facts, or well-sourced rumors and leaks.
- Format it like a scrappy, quickly edited cutscene seen on a hacked feed or darknet stream.
- Make sure it is easy to read and understand. Avoid jargon or overly complex language.
- The segemnt should clearly communicatte the NEWS through segments that are punchy and engaging.

Structure the news spot as:
 - Image (on-screen) - The image should be a visual representation of the news segment. The id MUST be in the list of NEWS_IMAGES.
 - Headline (on-screen + voice-over) - Use title case or sentence case only (not all caps)
 - Anchor Line (calm, controlled tone) - 1 sentence stating the event - framed negatively or with sarcasm
 - Contextual Reframing - 1-2 sentences that emphasizes systemic efficiency, resilience, or progress

{extra_context}

Constraints:
	1.	Tone may be urgent, ironic, bitter, sarcastic, raw, or emotional — reflect the resistance.
	2.	You may reference internal mechanisms if they are semi-public or leaked — as long as it reflects the kind of info that could circulate in the underground.
	3.	Use short, punchy lines — think pirate radio, activist voice, or citizen journalist.
	4.	Highlight contradictions in the official narrative or connect dots the state won’t.
"""

get_image_prompt = lambda image_description: f"""
Create a stylized, ominous illustration in a vintage propaganda or graphic novel style reminiscent of mid-20th-century dystopian art.
Use a limited, muted color palette dominated by deep browns, desaturated reds, dark beiges, and near-black tones, with selective red accents for emotional emphasis.
All characters should have black skin, circular light-filled eyes, and bright red noses for immediate, symbolic readability.
Figures must be minimal and geometric with simplified anatomy, strong silhouettes, and heavy shadows.
Set the scene in a cracked, decaying environment with worn textures, minimal background detail, and flat but dramatic lighting.
The composition should evoke a feeling of isolation, control, and post-apocalyptic tension.
Use strong symmetry or framing to reinforce themes of surveillance, conformity, or unease.

Scene focus: An abstract, symbolic visualization of a news story:
---
{image_description}
---

Instructions:
-	Do not include any text in the image.
-	Do not show the TV, the news interface, or graphics — only the visual metaphor.
-	Prioritize bold, readable composition suitable for small-scale viewing.
-	Avoid small details or intricate patterns.
"""

class NewsWriter:
   
    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None

    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))
        self.customers = self.world_context['bar']['customers']

    def write_news(self, events, outcome, news_segment_count, extra_context=None):
        last_error = None
        for i in range(5):
            try:
                response = self._write_news(events, outcome, news_segment_count, extra_context)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
              
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to fork plot after 5 attempts: {last_error}")

    def _write_news(self, events, outcome, news_segment_count, extra_context=None):
        system_message = get_system_message(self.world_context['background'], events, outcome)
        prompt = get_official_prompt(news_segment_count, extra_context)
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
                            "news_segmenrs": {
                                "type": "array",
                                "description": f"List of EXACTY {news_segment_count} news segments.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "image_id": {
                                            "type": "string",
                                            "description": "The id of the image to use for the news segment. The image should be a visual representation of the news segment. The id MUST be in the list of NEWS_IMAGES."
                                        },
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
                        },
                        "required": ["news_segmenrs"]
                    }
                }
            ]
        response = ask_llm(self.client, messages, functions)
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "publish_news":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        official_news = []
        for item in params['news_segmenrs']:
            image_id = item["image_id"]
            if image_id not in [i["id"] for i in NEWS_IMAGES]:
                image_id = random.choice([i["id"] for i in NEWS_IMAGES])
                print(f"WARNING: Image id {image_id} not found in NEWS_IMAGES. Picking random one.")

            official_news.append({
                "image_id": image_id,
                "headline": item["headline"],
                "anchor_line": item["anchor_line"],
                "contextual_reframing": item["contextual_reframing"]
            })
        messages.append({"role": "assistant", "content": json.dumps(official_news, indent=2)})

        prompt = get_underground_prompt(news_segment_count, extra_context)
        messages.append({"role": "user", "content": prompt})
        response = ask_llm(self.client, messages, functions)
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "publish_news":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)
        underground_news = []
        for item in params['news_segmenrs']:
            image_id = item["image_id"]
            if image_id not in [i["id"] for i in NEWS_IMAGES]:
              image_id = random.choice([i["id"] for i in NEWS_IMAGES])
              print(f"WARNING: Image id {image_id} not found in NEWS_IMAGES. Picking random one.")

            underground_news.append(
                {
                    "image_id": image_id,
                    "headline": item["headline"],
                    "anchor_line": item["anchor_line"],
                    "contextual_reframing": item["contextual_reframing"]
                }
            )
            
        # iterate trhough official and underground to get image_id and create image
        for news in official_news + underground_news:
            image_id = news["image_id"]
            self.create_news_image(image_id)

        return {
            "official": official_news,
            "underground": underground_news
        }
    
    def create_news_image(self, image_id):
        image_path = os.path.join(os.path.dirname(__file__), "../../assets/news", f"{image_id}.png")

        if os.path.exists(image_path):
            return

        image_description = next((i["description"] for i in NEWS_IMAGES if i["id"] == image_id), None)

        prompt = get_image_prompt(image_description)

        result = self.client.images.generate(
            model="gpt-image-1",
            quality="low",
            size="1024x1024",
            prompt=prompt
        )

        image_base64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)
        with open(image_path, "wb") as f:
            f.write(image_bytes)
            
    

