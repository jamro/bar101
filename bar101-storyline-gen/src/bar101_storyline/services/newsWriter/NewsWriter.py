from openai import OpenAI
import os
import json
import base64
from utils import ask_llm
from utils import retry_on_error
import random
from .prompts import get_system_message, get_official_prompt, get_underground_prompt, get_image_prompt, NEWS_IMAGES

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

    @retry_on_error(max_attempts=3)
    def write_news(self, events, outcome, news_segment_count, extra_context=None):
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
        image_path = os.path.join(os.path.dirname(__file__), "../../../../assets/news", f"{image_id}.png")
        image_path = os.path.abspath(image_path)

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
            
    

