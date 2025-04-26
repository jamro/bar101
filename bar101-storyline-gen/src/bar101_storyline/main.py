import os
from dotenv import load_dotenv
from PlotShaper import PlotShaper
from KeyCustomerPicker import KeyCustomerPicker
from TimelineIntegrator import TimelineIntegrator
from CharacterStoryBuilder import CharacterStoryBuilder
from ChatOpenerEngine import ChatOpenerEngine
from ChatStoryEngine import ChatStoryEngine
from DecisionMaker import DecisionMaker
from NewsWriter import NewsWriter
from TreePacker import TreePacker
import json
import random
from lib import get_global_llm_cost
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
    const_snapshop = 0

    tree_packer = TreePacker()
    plot_shaper = PlotShaper(os.getenv("OPENAI_API_KEY"))
    cusomer_picker = KeyCustomerPicker(os.getenv("OPENAI_API_KEY"))
    timeline_integrator = TimelineIntegrator(os.getenv("OPENAI_API_KEY"))
    character_story_builder = CharacterStoryBuilder(os.getenv("OPENAI_API_KEY"))
    news_writter = NewsWriter(os.getenv("OPENAI_API_KEY"))
    chat_opener_engine = ChatOpenerEngine(os.getenv("OPENAI_API_KEY"))
    chat_story_engine = ChatStoryEngine(os.getenv("OPENAI_API_KEY"))
    decision_maker = DecisionMaker(os.getenv("OPENAI_API_KEY"))
    
    plot_shaper.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    cusomer_picker.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    timeline_integrator.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    character_story_builder.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    news_writter.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    chat_opener_engine.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    chat_story_engine.read_context(os.path.join(os.path.dirname(__file__), "../../context"))
    decision_maker.read_context(os.path.join(os.path.dirname(__file__), "../../context"))

    all_characters = character_story_builder.get_characters()
    customers_model = {}
    for character_id in all_characters:
        customers_model[character_id] = { 
            "political_preference": get_customer_by_id(character_id)["political_preference"],
            "bci_score": get_customer_by_id(character_id)["bci_score"],
        }

    # initial timeline
    with open(os.path.join(story_root, "timeline.json"), "w") as f:
        json.dump(plot_shaper.timeline, f, indent=2)

    # initial character story
    characters_story_path = os.path.join(story_root, "characters.json")
    chapter = None
    if not os.path.exists(characters_story_path):
        characters_story = {}
        for character_id in all_characters:
            console.print(f"[dim]Creating story for character {character_id}...[/dim]")
            characters_story[character_id] = character_story_builder.create_character_chapter(
                character_id,
                customers_model[character_id],
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
            characters_story[character_id]["chapter"]
        )
        customers_model[character_id]["bci_score"] = characters_story[character_id]["bci_score"]

    new_events = plot_shaper.timeline
    outcome = "Marek Halden is found dead"
    outcome_timeline = [outcome]
    prev_key_customer = None

    while not plot_shaper.is_complete():
        create_variant_dirs(variants_chain)
        
        get_news_spot(
            news_writter, 
            new_events, 
            outcome, 
            variants_chain, 
            3, 
            "IMPORTANT: Use news to reveal and explain key concept from background context provide neccesary introduction to the world. Explain all the acronyms and terms used in the world context."
          )

        plot_a, plot_b = fork_plot(plot_shaper, variants_chain)
        dilemma, transition_a, transition_b = create_dilemma(cusomer_picker, customers_model, plot_a, plot_b, plot_shaper.timeline, outcome_timeline, variants_chain)
        key_customer = get_customer_by_id(dilemma["customer_id"])

        patrons = get_bar_visitors(cusomer_picker, key_customer['id'], prev_key_customer, variants_chain)
        prev_key_customer = key_customer['id']
        decision = 'a'
        for patron_id in patrons:
            serve_customer(
                chat_opener_engine, 
                chat_story_engine, 
                patron_id, 
                customers_model, 
                characters_story[patron_id]["chapter"], 
                outcome_timeline, 
                new_events, 
                variants_chain
            )
            if patron_id == key_customer['id']:
                console.print(f"[bold white]Story path: {' > '.join(variants_chain) if len(variants_chain) > 0 else 'x'}[/bold white]")
                decision = decide_dilemma(decision_maker, key_customer, customers_model, dilemma, plot_a, plot_b, plot_shaper.timeline, variants_chain)

        # pack the story node
        node_path = os.path.join(story_root, *variants_chain, "node.json")
        node = tree_packer.pack_node(os.path.join(story_root, *variants_chain))
        json.dump(node, open(node_path, "w"), indent=2)

        # track costs
        total_cost = get_global_llm_cost()
        cost = total_cost - const_snapshop
        const_snapshop = total_cost
        console.print(f"[bold yellow]----------------------------[/bold yellow]")
        console.print(f"[bold yellow]STORY NODE COST: ${cost:.2f}[/bold yellow]")
        console.print(f"[bold yellow]----------------------------[/bold yellow]")
        cost_path = os.path.join(story_root, *variants_chain, "cost.json")
        cost_info = { "node_cost": cost }
        if not os.path.exists(cost_path):
            json.dump(cost_info, open(cost_path, "w"), indent=2)

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

        plot_shaper.timeline += new_events
        plot_shaper.move_to_next_stage()

        characters_story = develop_character_story(
            character_story_builder, 
            key_customer, 
            customers_model,
            dilemma, 
            choice, 
            outcome,
            new_events, 
            variants_chain
        )

        # iteracte over keys in characters_story dict
        for character_id in characters_story:
            customers_model[character_id]["bci_score"] = characters_story[character_id]["bci_score"]

    news_segment_count = 3 if len(variants_chain) == 7 else 1
    get_news_spot(news_writter, new_events, outcome, variants_chain, news_segment_count)

    # pack the story node
    node_path = os.path.join(story_root, *variants_chain, "node.json")
    node = tree_packer.pack_node(os.path.join(story_root, *variants_chain))
    json.dump(node, open(node_path, "w"), indent=2)
  


