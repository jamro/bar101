import os
from dotenv import load_dotenv
from openai import OpenAI
from PlotShaper import PlotShaper
from KeyCustomerPicker import KeyCustomerPicker
from TimelineIntegrator import TimelineIntegrator
from CharacterStoryBuilder import CharacterStoryBuilder
import json
from time import sleep
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
import questionary

# Load environment variables
load_dotenv()

console = Console()

def print_table(timeline):
    table = Table(title="Timeline Events", show_lines=True)
    table.add_column("Timestamp", style="yellow bold", no_wrap=True)
    table.add_column("Visibility", style="red bold")
    table.add_column("Description", style="white")

    for event in timeline:
        table.add_row(event["timestamp"].replace("T", "\n "), event["visibility"], event["description"])

    console.print(table)


def create_variant_dirs(variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../story_tree")
    
    vairaint_a_path = os.path.join(story_root, *variants_chain, "a")
    vairaint_b_path = os.path.join(story_root, *variants_chain, "b")
    if not os.path.exists(vairaint_a_path):
        os.makedirs(vairaint_a_path)
    if not os.path.exists(vairaint_b_path):
        os.makedirs(vairaint_b_path)

def fork_plot(plot_shaper, variants_chain):
    console.print(f"[dim]Forking plot - {plot_shaper.get_plot_stage()['name']}...[/dim]")
    story_root = os.path.join(os.path.dirname(__file__), "../../story_tree")
    plot_a_path = os.path.join(story_root, *variants_chain, "a", "_plot.json")
    plot_b_path = os.path.join(story_root, *variants_chain, "b", "_plot.json")
    if os.path.exists(plot_a_path) and os.path.exists(plot_b_path):
        plot_a = json.load(open(plot_a_path))
        plot_b = json.load(open(plot_b_path))
        return plot_a, plot_b
    
    bar_night = plot_shaper.fork_plot()

    plot_a = { "outcome": bar_night["branch_a"], "events": bar_night["events_a"]}
    plot_b = { "outcome": bar_night["branch_b"], "events": bar_night["events_b"]}

    with open(plot_a_path, "w") as f:
        json.dump(plot_a, f, indent=2)
    with open(plot_b_path, "w") as f:
        json.dump(plot_b, f, indent=2)

    return plot_a, plot_b

def create_dilemma(cusomer_picker, plot_a, plot_b, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../story_tree")
    dilemma_path = os.path.join(story_root, *variants_chain, "dilemma.json")
    transition_a_path = os.path.join(story_root, *variants_chain, "a", "_transition.json")
    transition_b_path = os.path.join(story_root, *variants_chain, "b", "_transition.json")

    if os.path.exists(dilemma_path) and os.path.exists(transition_a_path) and os.path.exists(transition_b_path):
        dilemma = json.load(open(dilemma_path))
        transition_a = json.load(open(transition_a_path))
        transition_b = json.load(open(transition_b_path))
        return dilemma, transition_a, transition_b

    customer_dilemma = cusomer_picker.pick_customer_dilemma(
        plot_shaper.timeline,
        plot_a['outcome'],
        plot_b['outcome'],
        plot_a['events'],
        plot_b['events'],
        log_callback=lambda message: console.print(f"[dim]{message}[/dim]")
    )

    dilemma = {
        "customer_id": customer_dilemma["customer"]["id"],
        "preceding": customer_dilemma["preceding"],
        "dilemma": customer_dilemma["dilemma"],
        "reason": customer_dilemma["reason"],
        "choice_a": customer_dilemma["variant_a"],
        "choice_b": customer_dilemma["variant_b"],
    }
    transition_a = customer_dilemma['transition_events_a']
    transition_b = customer_dilemma['transition_events_b']
    with open(dilemma_path, "w") as f:
        json.dump(dilemma, f, indent=2)
    with open(transition_a_path, "w") as f:
        json.dump(transition_a, f, indent=2)
    with open(transition_b_path, "w") as f:
        json.dump(transition_b, f, indent=2)

    return dilemma, transition_a, transition_b

def get_customer_by_id(customer_id):
    context_path = os.path.join(os.path.dirname(__file__), "../../context/world.json")
    with open(context_path, "r") as f:
        context = json.load(f)

    customers = context["bar"]["customers"]
    return next((c for c in customers if c['id'] == dilemma["customer_id"]), None)
    

def integrate_timeline(timeline_integrator, customer, dilemma, choice, outcome, events, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../story_tree")
    timeline_path = os.path.join(story_root, *variants_chain, "timeline.json")
    if os.path.exists(timeline_path):
        timeline = json.load(open(timeline_path))
        return timeline
    
    console.print(f"[dim]Integrating timeline...[/dim]")
    events = timeline_integrator.integrate_timeline(
        plot_shaper.timeline,
        events,
        customer["id"],
        dilemma["dilemma"],
        choice,
        outcome
    )
    with open(timeline_path, "w") as f:
        json.dump(events, f, indent=2)

    return events

def decide_dilemma(customer, dilemma):
    console.print(f"[bold yellow]{customer['name']}: [/bold yellow][white]{dilemma['preceding']}[/white]")
    console.print(f"[bold yellow]{customer['name']}[/bold yellow] [dim]is in a dilemma[/dim] [yellow]{dilemma['dilemma']}[/yellow]")
    decision = questionary.select(
        message=f"What's next?",
        choices=[
            f"1: {dilemma['choice_a']}",
            f"2: {dilemma['choice_b']}",
        ]
    ).ask()

    outcome = plot_a["outcome"] if decision.startswith("1") else plot_b["outcome"]
    console.print(f"[dim]Decsion made by[/dim] [yellow bold]{customer['name']}[/yellow bold][dim] leads to[/dim] [yellow bold]{outcome}[/yellow bold]")
    return "a" if decision.startswith("1") else "b"

def develop_character_story(character_story_builder, customer, dilemma, choice, events, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../story_tree")
    characters_story_path = os.path.join(story_root, *variants_chain, "characters.json")
    all_characters = character_story_builder.get_characters()

    if os.path.exists(characters_story_path):
        with open(characters_story_path, "r") as f:
            characters_story = json.load(f)
        for character_id in all_characters:
            character_story_builder.store_character_chapter(
                character_id,
                characters_story[character_id]
            )
        return characters_story

    characters_story = {}
    for character_id in all_characters:
        console.print(f"[dim]Creating story for character {character_id}...[/dim]")
        extra_context = ""
        if character_id == customer["id"]:
            extra_context = f"""
            The character face a dilemma: {dilemma['dilemma']}
            The dilema is caused by: {dilemma['reason']}
            The character decides to: {choice}
            """
        characters_story[character_id] = character_story_builder.create_character_chapter(
            character_id,
            events,
            extra_context
        )
    
    for character_id in all_characters:
        character_story_builder.store_character_chapter(
            character_id,
            characters_story[character_id]
        )

    with open(characters_story_path, "w") as f:
        json.dump(characters_story, f, indent=2)

    return characters_story


if __name__ == "__main__":

    story_root = os.path.join(os.path.dirname(__file__), "../../story_tree")
    variants_chain = []

    plot_shaper = PlotShaper(os.getenv("OPENAI_API_KEY"))
    cusomer_picker = KeyCustomerPicker(os.getenv("OPENAI_API_KEY"))
    timeline_integrator = TimelineIntegrator(os.getenv("OPENAI_API_KEY"))
    character_story_builder = CharacterStoryBuilder(os.getenv("OPENAI_API_KEY"))
    
    plot_shaper.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    cusomer_picker.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    timeline_integrator.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    character_story_builder.read_context(os.path.join(os.path.dirname(__file__), "../../context"))

    all_characters = character_story_builder.get_characters()

    # initial timeline
    print_table(plot_shaper.timeline)
    with open(os.path.join(story_root, "timeline.json"), "w") as f:
        json.dump(plot_shaper.timeline, f, indent=2)

    # initial character story
    characters_story_path = os.path.join(story_root, "characters.json")
    if not os.path.exists(characters_story_path):
        characters_story = {}
        for character_id in all_characters:
            console.print(f"[dim]Creating story for character {character_id}...[/dim]")
            characters_story[character_id] = character_story_builder.create_character_chapter(
                character_id,
                plot_shaper.timeline
            )
        with open(os.path.join(story_root, "characters.json"), "w") as f:
            json.dump(characters_story, f, indent=2)
    else:
        with open(characters_story_path, "r") as f:
            characters_story = json.load(f)
    for character_id in all_characters:
        character_story_builder.store_character_chapter(
            character_id,
            characters_story[character_id]
        )

    while not plot_shaper.is_complete():
        create_variant_dirs(variants_chain)
        plot_a, plot_b = fork_plot(plot_shaper, variants_chain)
        dilemma, transition_a, transition_b = create_dilemma(cusomer_picker, plot_a, plot_b, variants_chain)
        customer = get_customer_by_id(dilemma["customer_id"])
        decision = decide_dilemma(customer, dilemma)

        if decision == "a":
            variants_chain.append("a")
            choice = dilemma["choice_a"]
            outcome = plot_a["outcome"]
            events = [*transition_a, *plot_a['events']],
        else:
            variants_chain.append("b")
            choice = dilemma["choice_b"]
            outcome = plot_b["outcome"]
            events = [*transition_b, *plot_b['events']]

        new_events = integrate_timeline(timeline_integrator, customer, dilemma, choice, outcome, events, variants_chain)
        print_table(new_events)

        plot_shaper.timeline += new_events
        plot_shaper.move_to_next_stage()

        develop_character_story(character_story_builder, customer, dilemma, choice, new_events, variants_chain)


