.PHONY: run format lint test

install:
	poetry install

# Run the app
samples:
	poetry run python src/bar101_voiceover/samples.py

# Format code with black
format:
	poetry run black .

# Lint code with flake8 (install it if you use it)
lint:
	poetry run flake8 .

# Run tests with pytest
test:
	poetry run pytest