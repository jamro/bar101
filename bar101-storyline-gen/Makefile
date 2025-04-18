.PHONY: run format lint test

install:
	poetry install

# Run the app
run:
	poetry run python src/bar101_storyline/main.py

extract-nodes:
	poetry run python src/bar101_storyline/extract-nodes.py

# Format code with black
format:
	poetry run black .

# Lint code with flake8 (install it if you use it)
lint:
	poetry run flake8 .

# Run tests with pytest
test:
	poetry run pytest