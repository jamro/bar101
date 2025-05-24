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
      news = news_writter.write_news(events, outcome, news_segment_count, extra_context, log_callback=lambda message: console.print(f"[dim]{message}[/dim]"))
      with open(story_path, "w") as f:
          json.dump(news, f, indent=2)
  
  return news