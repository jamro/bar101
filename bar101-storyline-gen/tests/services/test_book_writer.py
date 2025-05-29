import pytest
from unittest.mock import patch, mock_open, MagicMock
from bar101_storyline.services.book_writer.BookWriter import BookWriter
import json
import os

@pytest.fixture
def book_writer():
    return BookWriter("test-api-key")

def test_initialization(book_writer):
    assert book_writer.world_context is None
    assert book_writer.story_summary == ""
    assert book_writer.chapter_count == 0

def test_read_context(book_writer, mock_world_context):
    mock_file = mock_open(read_data=json.dumps(mock_world_context))
    
    with patch("builtins.open", mock_file):
        book_writer.read_context("test/path")
        
    assert book_writer.world_context == mock_world_context

def test_read_context_file_not_found(book_writer):
    with patch("builtins.open", mock_open()) as mock_file:
        mock_file.side_effect = FileNotFoundError()
        with pytest.raises(FileNotFoundError):
            book_writer.read_context("test/path")

@patch("bar101_storyline.services.book_writer.BookWriter.BookWriter.ask_llm")
def test_write_book(mock_ask_llm, book_writer, mock_world_context):
    # Setup
    book_writer.world_context = mock_world_context
    book_writer.story_summary = "Previous chapters summary"
    
    new_events = [
        {"timestamp": "2024-03-20T10:00:00", "description": "Test event 1"},
        {"timestamp": "2024-03-20T11:00:00", "description": "Test event 2"}
    ]
    outcome = "Test outcome"
    
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Test chapter content"
    mock_ask_llm.return_value = mock_response
    
    # Execute
    result = book_writer.write_book(new_events, outcome)
    
    # Assert
    assert result == "Test chapter content"
    assert book_writer.chapter_count == 1
    assert "CHAPTER 1" in book_writer.story_summary
    assert "Test event 1" in book_writer.story_summary
    assert "Test event 2" in book_writer.story_summary
    assert "Test outcome" in book_writer.story_summary
    
    # Verify LLM was called with correct messages
    mock_ask_llm.assert_called_once()
    messages = mock_ask_llm.call_args[0][0]
    assert len(messages) == 2  # System message and user prompt
    assert "Test background" in messages[0]["content"]
    assert "Previous chapters summary" in messages[0]["content"]

