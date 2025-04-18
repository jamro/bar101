import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
from rich.panel import Panel

console = Console()

def print_news(news):
    console.print(Panel(
        f"[blue][bold]{news['official']['anchor_line']}[/bold]\n{news['official']['contextual_reframing']}[/blue]",
        title=f"📣 [bold]{news['official']['headline']}[/bold]",
        subtitle="",
        border_style="blue"
    ))
    console.print(Panel(
        f"[red][bold]{news['underground']['anchor_line']}[/bold]\n{news['underground']['contextual_reframing']}[/red]",
        title=f"☠️ [bold]{news['underground']['headline']}[/bold]",
        subtitle="",
        border_style="red"
    ))

def get_news_spot(news_writter, events, outcome, variants_chain):
  console.print(f"[dim]Preparing news segments...[/dim]")
  story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
  story_path = os.path.join(story_root, *variants_chain, "news.json")

  if os.path.exists(story_path):
      news = json.load(open(story_path))
      print_news(news)
      return news

  news = news_writter.write_news(events, outcome)
  with open(story_path, "w") as f:
      json.dump(news, f, indent=2)
  print_news(news)
  return news