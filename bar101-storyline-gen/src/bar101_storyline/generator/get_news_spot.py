import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
from rich.panel import Panel

console = Console()

def get_news_spot(news_writter, events, outcome, variants_chain, news_segment_count, extra_context=None):
  console.print(f"[dim]Preparing news segments...[/dim]")
  story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
  story_path = os.path.join(story_root, *variants_chain, "news.json")

  if os.path.exists(story_path):
      news = json.load(open(story_path))
  else:
      news = news_writter.write_news(events, outcome, news_segment_count, extra_context)
      with open(story_path, "w") as f:
          json.dump(news, f, indent=2)


  # iterate over news segments with index
  for i, segment in enumerate(news["official"]):
      image_path = os.path.join(story_root, *variants_chain, f"news_img_{i+1}.png")
      if not os.path.exists(image_path):
          console.print(f"[dim]creating image for news segment {i+1}...[/dim]")
          image_bytes = news_writter.create_news_image(
              segment["headline"],
              segment["anchor_line"],
              segment["contextual_reframing"],
          )
          with open(image_path, "wb") as f:
              f.write(image_bytes)
  
  return news