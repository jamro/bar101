from rich.console import Console
import os
import json

console = Console()

def summarize_book(book_writer, new_events, outcome, variants_chain):
    story_root = os.path.join(os.path.dirname(__file__), "../../../story_tree")
    book_path = os.path.join(story_root, *variants_chain, "book.json")

    if os.path.exists(book_path):
        book = json.load(open(book_path))
    else:
        console.print(f"[dim]Summarizing the story as a book...[/dim]")
        book = {
            "content": book_writer.write_book(new_events, outcome)
        }
        with open(book_path, "w") as f:
            json.dump(book, f, indent=2)

    return book


    


    