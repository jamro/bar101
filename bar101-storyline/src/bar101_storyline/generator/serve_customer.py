import os
from dotenv import load_dotenv
from openai import OpenAI
from time import sleep
import json
from rich.console import Console
from rich.panel import Panel
from rich.padding import Padding
from rich.table import Table
from rich.prompt import Prompt
from .get_customer_by_id import get_customer_by_id
import questionary

console = Console()


def print_customer_chat(customer, text, customers=None):
    sleep(0.5)
    console.print(Padding(
        Panel(
            text,
            title=f"[bold]{customer['name']}[/bold] ({customers[customer['id']]['trust'] if customers else '?'})",
        ),
        (0, 10, 0, 0)
    ))

def print_alex_chat(text):
    sleep(0.5)
    console.print(Padding(
        Panel(
            f"[magenta]{text}[/magenta]",
            title="[bold]Alex[/bold]",
            border_style="magenta"
        ),
        (0, 0, 0, 10)
    ))

def get_trust_level(customer_id, customers):
    trust = customers[customer_id]["trust"]
    level = round(trust / 2.0) + 2
    level = min(level, 4)
    level = max(level, 0)

    return level

def print_customer_enter(customer):
    console.print(f"""[yellow]
      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀⢀⣀⡠⠤⠴⠚⣿⠃
      ⠀⠸⣿⡭⣭⣿⣽⣿⣿⣿⣿⣿⣿⣿⣽⣿⡿⠓⠚⠉⣉⣀⣤⡤⣴⠀⣿⠀
      ⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⢰⠞⢩⠀⢻⡏⠀⡏⠀⣿⠄
      ⠀⢠⣟⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⢸⠀⢸⠀⢸⡇⠀⠃⠀⣿⠂    
      ⠀⢘⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⢸⠀⢸⠀⢸⡇⠀⡇⠀⣿⡇
      ⠀⠈⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⢸⠀⢸⠀⢸⡇⠀⣷⠀⣿⡇
      ⠀⣠⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⢸⠀⢸⠀⢸⡇⠀⣿⣼⣿⡇
      ⠀⡃⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠘⠛⠛⠒⠛⠓⠛⠛⣿⣿⡇       [bold]{customer['name']}[/bold] [dim white]enters the bar...[/dim white]
      ⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⢰⠦⢠⠀⢤⣤⣤⣄⠋⣿⡇
      ⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⢸⠀⢸⠀⢸⡇⠈⣿⠀⣿⡇
      ⠀⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⢸⠀⢸⠀⢸⡇⠀⣿⠀⣿⡇
      ⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⢸⣄⢸⠠⣼⡇⠀⣿⠀⣿⡇
      ⠀⣸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠉⠉⠀⠛⠚⠯⠿⠀⣿⡇
      ⠠⢿⣿⣷⣶⣶⣶⠶⢶⡶⢶⣶⣶⣶⣶⢿⣶⣤⣄⣀⣀⠀⠀⠀⢨⠀⣿⡇
      ⠀⠀⠀⠈⠀⠐⠒⠒⠀⠀⠀⠘⠁⠈⠀⠀⠀⠀⠉⠉⢛⠉⠑⠒⠠⠤⢿⠇

                 [/yellow]""")
    
def print_serve_drink(customer):
    console.print(f"""[yellow]
  
    ..--\"\"````\"\"--.._
  (_                _)
  \ ```\"\"\"----\"\"\"``` /  
   '-.            .-'
      `\        /`
        '-.__.-'
           ||                  [dim white]Alex serves[/dim white] [yellow bold]{customer['drink']}[/yellow bold] [dim white]to[/dim white] [yellow bold]{customer['name']}[/yellow bold]
           ||
           ||
           ||
      _..--||--.._
     (_          _)
       ```\"\"\"\"```
                  [/yellow]""")

def serve_customer(chat_opener_engine, customer_id, customers, recent_story, outcome_timeline, events, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    customer = get_customer_by_id(customer_id)

    print_customer_enter(customer)

    # serve drink
    decision = questionary.select(message=f"Alex:", choices=["1: What can I get you?", "2: The usual?"]).ask()
    print_alex_chat(decision[3:])
    trust_bonus = False
    if decision.startswith("1"):
        print_customer_chat(customer, f"I would like {customer['drink']}, please.", customers)
    else:
        print_customer_chat(customer, f"yes, the usual", customers)
        trust_bonus = True
    print_serve_drink(customer)
    print_alex_chat(f"Here is your {customer['drink']}.")
    if trust_bonus:
        customers[customer_id]["trust"] += 1
        console.print(f"[green]{customer['name']} Trust +1[/green]")

    # opening line
    opener_path = os.path.join(story_root, *variants_chain, f"chat_{customer['id']}_opener.json")
    console.print(f"[dim]Generating opening dialogue...[/dim]")
    if not os.path.exists(opener_path):
        opener = chat_opener_engine.get_opener(customer_id, recent_story, outcome_timeline, events, log_callback=console.print)
        with open(opener_path, "w") as f:
            json.dump(opener, f, indent=2)
    else:
        opener = json.load(open(opener_path, "r"))

    choices = [f"0: {opener['questions']['neutral']}"]
    for i, item in enumerate(opener['questions']['hobby']):
        choices.append(f"{i+1}: {item['message']}")
    decision = questionary.select(
        message=f"Alex:", 
        choices=choices
    ).ask()
    decision = int(decision[0])

    if decision == 0:
        monologue = opener['neutral_answer'][get_trust_level(customer_id, customers)]
        print_alex_chat(opener['questions']['neutral'])
        for msg in monologue:
            print_customer_chat(customer, msg, customers)
    else:
        index = decision - 1
        opener_message = opener['questions']['hobby'][index]
        if opener_message["correct"]:
            customers[customer_id]["trust"] += 1
            console.print(f"[green]{customer['name']} Trust +1[/green]")
            monologue = opener['hobby_answer'][get_trust_level(customer_id, customers)]
            print_alex_chat(opener_message['message'])
            for msg in monologue:
                print_customer_chat(customer, msg, customers)
        else:
            customers[customer_id]["trust"] -= 1
            console.print(f"[red]{customer['name']} Trust -1[/red]")
            print_customer_chat(customer, opener['wrong_hobby_answer'], customers)
