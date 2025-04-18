from rich.console import Console
console = Console()

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
