import os
from dotenv import load_dotenv
from PlotShaper import PlotShaper
from KeyCustomerPicker import KeyCustomerPicker
from TimelineIntegrator import TimelineIntegrator
from CharacterStoryBuilder import CharacterStoryBuilder
from ChatOpenerEngine import ChatOpenerEngine
from ChatStoryEngine import ChatStoryEngine
from NewsWriter import NewsWriter
import json
import random
from rich.panel import Panel
from rich.console import Console
from generator import (
    print_table,
    create_variant_dirs,
    fork_plot,
    create_dilemma,
    get_customer_by_id,
    decide_dilemma,
    integrate_timeline,
    develop_character_story,
    get_news_spot,
    serve_customer,
    get_bar_visitors
)

# Load environment variables
load_dotenv()

console = Console()

if __name__ == "__main__":

    story_root = os.path.join(os.path.dirname(__file__), "../../story_tree")
    variants_chain = []

    plot_shaper = PlotShaper(os.getenv("OPENAI_API_KEY"))
    cusomer_picker = KeyCustomerPicker(os.getenv("OPENAI_API_KEY"))
    timeline_integrator = TimelineIntegrator(os.getenv("OPENAI_API_KEY"))
    character_story_builder = CharacterStoryBuilder(os.getenv("OPENAI_API_KEY"))
    news_writter = NewsWriter(os.getenv("OPENAI_API_KEY"))
    chat_opener_engine = ChatOpenerEngine(os.getenv("OPENAI_API_KEY"))
    chat_story_engine = ChatStoryEngine(os.getenv("OPENAI_API_KEY"))
    
    plot_shaper.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    cusomer_picker.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    timeline_integrator.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    character_story_builder.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    news_writter.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    chat_opener_engine.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    chat_story_engine.read_context(os.path.join(os.path.dirname(__file__), "../../context"))

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

    new_events = plot_shaper.timeline
    outcome = "Marek Halden is found dead"
    outcome_timeline = [outcome]

    customers_model = {}
    for character_id in all_characters:
        customers_model[character_id] = { "trust": -2 + int(5 * random.random()) }

    while not plot_shaper.is_complete():
        create_variant_dirs(variants_chain)
        
        get_news_spot(news_writter, new_events, outcome, variants_chain)

        console.print("\n[bold cyan]Press Enter to continue...[/bold cyan]")
        input()

        plot_a, plot_b = fork_plot(plot_shaper, variants_chain)
        dilemma, transition_a, transition_b = create_dilemma(cusomer_picker, plot_a, plot_b, plot_shaper.timeline, outcome_timeline, variants_chain)
        key_customer = get_customer_by_id(dilemma["customer_id"])

        patrons = get_bar_visitors(cusomer_picker, key_customer['id'], variants_chain)
        decision = 'a'
        for patron_id in patrons:
            serve_customer(
                chat_opener_engine, 
                chat_story_engine, 
                patron_id, 
                customers_model, 
                characters_story[patron_id], 
                outcome_timeline, 
                new_events, 
                variants_chain
            )
            if patron_id == key_customer['id']:
                decision = decide_dilemma(key_customer, dilemma, plot_a, plot_b)

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

        outcome_timeline.append(outcome)
        new_events = integrate_timeline(timeline_integrator, key_customer, dilemma, choice, outcome, plot_shaper.timeline, events, variants_chain)
        print_table(new_events)

        plot_shaper.timeline += new_events
        plot_shaper.move_to_next_stage()

        characters_story = develop_character_story(character_story_builder, key_customer, dilemma, choice, new_events, variants_chain)

    get_news_spot(news_writter, new_events, outcome, variants_chain)


