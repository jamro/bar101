.PHONY: run format lint test

install:
	poetry install --no-root

# Run the app
run:
	poetry run python src/bar101_voiceover/main.py

samples:
	poetry run python src/bar101_voiceover/samples.py

clean-local:
	rm -rf ./voiceovers/storytree
	rm -rf ./voiceovers/samples

clean-aws:
  aws s3 rm s3://cdn-bar101.jmrlab.com --recursive

upload:
	aws s3 sync ./voiceovers/storytree  s3://cdn-bar101.jmrlab.com/storytree --exact-timestamps

# Format code with black
format:
	poetry run black .

# Lint code with flake8 (install it if you use it)
lint:
	poetry run flake8 .

# Run tests with pytest
test:
	poetry run pytest