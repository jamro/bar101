import pytest
import json
import os
from unittest.mock import Mock, patch
from bar101_storyline.services.news_writer.NewsWriter import NewsWriter

@pytest.fixture
def mock_openai():
    with patch('bar101_storyline.services.AiService.OpenAI') as mock:
        mock_client = Mock()
        mock.return_value = mock_client
        mock_client.images.generate.return_value = Mock(
            data=[Mock(b64_json="fake_base64")]
        )
        yield mock

@pytest.fixture
def mock_ask_llm():
    with patch('bar101_storyline.services.AiService.ask_llm') as mock:
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "Test image description"
        mock.return_value = mock_response
        yield mock

@pytest.fixture
def news_writer(mock_world_context, mock_openai, mock_ask_llm):
    writer = NewsWriter("fake_api_key")
    writer.world_context = mock_world_context
    return writer

def test_read_context(news_writer, tmp_path):
    # Create a temporary world.json file
    world_data = {
        "background": "Test background",
        "bar": {
            "customers": [
                {
                    "id": "customer1",
                    "name": "John",
                    "age": 30
                }
            ]
        }
    }
    
    world_file = tmp_path / "world.json"
    with open(world_file, "w") as f:
        json.dump(world_data, f)
    
    # Test reading context
    news_writer.read_context(str(tmp_path))
    assert news_writer.world_context == world_data
    assert news_writer.customers == world_data["bar"]["customers"]

def test_read_context_file_not_found(news_writer, tmp_path):
    with pytest.raises(FileNotFoundError):
        news_writer.read_context(str(tmp_path))

@patch('bar101_storyline.services.news_writer.NewsWriter.AiService.ask_llm_for_function')
def test_write_news(mock_ask_llm, news_writer):
    # Mock the LLM response for official news
    mock_ask_llm.return_value = {
        "news_segments": [
            {
                "image_id": "image1",
                "headline": "Test Headline",
                "anchor_line": "Test Anchor",
                "contextual_reframing": "Test Context"
            }
        ]
    }
    
    events = ["Test Event"]
    outcome = "Test Outcome"
    news_segment_count = 1
    
    # Mock log callback
    log_callback = Mock()
    
    result = news_writer.write_news(events, outcome, news_segment_count, log_callback=log_callback)
    
    assert "official" in result
    assert "underground" in result
    assert len(result["official"]) == 1
    assert len(result["underground"]) == 1
    assert result["official"][0]["headline"] == "Test Headline"
    assert result["underground"][0]["headline"] == "Test Headline"

@patch('bar101_storyline.services.news_writer.NewsWriter.AiService.ask_llm')
def test_match_image_id(mock_ask_llm, news_writer):
    # Mock the LLM response
    mock_response = Mock()
    mock_response.choices = [Mock()]
    mock_response.choices[0].message.content = "network_tangle"
    mock_ask_llm.return_value = mock_response
    
    image_id = news_writer.match_image_id("Test news", ["Test Event"], "Test Outcome")
    assert image_id == "network_tangle"
