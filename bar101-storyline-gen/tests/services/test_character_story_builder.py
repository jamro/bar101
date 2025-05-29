import pytest
from unittest.mock import patch, mock_open, MagicMock
from bar101_storyline.services.character_story_builder.CharacterStoryBuilder import CharacterStoryBuilder
import json

@pytest.fixture
def character_story_builder():
    return CharacterStoryBuilder("test-api-key")


def test_initialization(character_story_builder):
    assert character_story_builder.world_context is None
    assert character_story_builder.chapters == {}

def test_read_context(character_story_builder, mock_world_context):
    mock_json = json.dumps(mock_world_context)
    with patch("builtins.open", mock_open(read_data=mock_json)):
        character_story_builder.read_context("test_path")
        
        assert character_story_builder.world_context == mock_world_context
        assert set(character_story_builder.chapters.keys()) == {"customer1", "customer2"}
        assert character_story_builder.chapters["customer1"] == []
        assert character_story_builder.chapters["customer2"] == []

def test_read_context_file_not_found(character_story_builder):
    with patch("builtins.open", mock_open()) as mock_file:
        mock_file.side_effect = FileNotFoundError()
        with pytest.raises(FileNotFoundError):
            character_story_builder.read_context("test_path")

def test_get_characters(character_story_builder, mock_world_context):
    character_story_builder.world_context = mock_world_context
    characters = character_story_builder.get_characters()
    assert set(characters) == {"customer1", "customer2"}

def test_store_character_chapter(character_story_builder):
    character_story_builder.chapters = {"customer1": []}
    
    # Test storing valid chapter
    chapter = "Test chapter"
    character_story_builder.store_character_chapter("customer1", chapter)
    assert character_story_builder.chapters["customer1"] == [chapter]
    
    # Test storing invalid chapter type
    with pytest.raises(ValueError):
        character_story_builder.store_character_chapter("customer1", 123)

@patch('bar101_storyline.services.character_story_builder.CharacterStoryBuilder.CharacterStoryBuilder.ask_llm_for_function')
def test_create_character_chapter(mock_ask_llm, character_story_builder, mock_world_context):
    character_story_builder.world_context = mock_world_context
    character_story_builder.chapters = {"customer1": []}
    
    mock_ask_llm.return_value = {
        "chapter": "Test chapter",
        "old_bci_score": 50,
        "new_bci_score": 60
    }
    
    character_stats = {
        "bci_score": 50,
        "political_preference": "neutral"
    }
    
    result = character_story_builder.create_character_chapter(
        "customer1",
        character_stats,
        events=["event1"]
    )
    
    assert result["chapter"] == "Test chapter"
    assert result["bci_score"] == 60
    assert result["political_preference"] == "neutral"

@patch('bar101_storyline.services.character_story_builder.CharacterStoryBuilder.CharacterStoryBuilder.ask_llm_for_function')
def test_create_character_chapter_bci_score_mismatch(mock_ask_llm, character_story_builder, mock_world_context):
    character_story_builder.world_context = mock_world_context
    character_story_builder.chapters = {"customer1": []}
    
    mock_ask_llm.return_value = {
        "chapter": "Test chapter",
        "old_bci_score": 30,  # Different from character_stats
        "new_bci_score": 60
    }
    
    character_stats = {
        "bci_score": 50,
        "political_preference": "neutral"
    }
    
    with pytest.raises(Exception) as exc_info:
        character_story_builder.create_character_chapter(
            "customer1",
            character_stats,
            events=["event1"]
        )
    
    assert "BCI score in the response does not match" in str(exc_info.value)

def test_create_all_character_chapters(character_story_builder):
    customers_model = {
        "customer1": {"bci_score": 50, "political_preference": "neutral"},
        "customer2": {"bci_score": 60, "political_preference": "liberal"}
    }
    
    timeline = ["event1", "event2"]
    log_messages = []
    
    def mock_log_callback(message):
        log_messages.append(message)
    
    with patch.object(character_story_builder, 'create_character_chapter') as mock_create:
        mock_create.side_effect = [
            {"chapter": "Chapter 1", "bci_score": 55, "political_preference": "neutral"},
            {"chapter": "Chapter 2", "bci_score": 65, "political_preference": "liberal"}
        ]
        
        result = character_story_builder.create_all_character_chapters(
            customers_model,
            timeline,
            mock_log_callback
        )
        
        assert len(log_messages) == 2
        assert "Creating story for character customer1" in log_messages[0]
        assert "Creating story for character customer2" in log_messages[1]
        assert result["customer1"]["chapter"] == "Chapter 1"
        assert result["customer2"]["chapter"] == "Chapter 2"

@patch('bar101_storyline.services.character_story_builder.CharacterStoryBuilder.CharacterStoryBuilder.ask_llm_for_function')
def test_create_character_chapter_with_dilemma(mock_ask_llm, character_story_builder, mock_world_context):
    character_story_builder.world_context = mock_world_context
    character_story_builder.chapters = {"customer1": []}
    
    mock_ask_llm.return_value = {
        "chapter": "Test dilemma chapter",
        "old_bci_score": 50,
        "new_bci_score": 60
    }
    
    character_stats = {
        "bci_score": 50,
        "political_preference": "neutral"
    }
    
    dilemma = {
        "trigger_event": "event1",
        "dilemma": "Should I help a stranger in need?",
        "reason": "The stranger is in need",
    }
    choice = "a"
    outcome = "The stranger was grateful and the character felt good about helping."
    
    result = character_story_builder.create_character_chapter(
        "customer1",
        character_stats,
        events=["event1"],
        dilemma=dilemma,
        choice=choice,
        outcome=outcome
    )
    
    assert result["chapter"] == "Test dilemma chapter"
    assert result["bci_score"] == 60
    assert result["political_preference"] == "neutral"
    
    # Verify that the dilemma prompt was used
    mock_ask_llm.assert_called_once()
    call_args = mock_ask_llm.call_args[1]
    messages = call_args["messages"]
    assert any("dilemma" in msg.get("content", "").lower() for msg in messages)

@patch('bar101_storyline.services.character_story_builder.CharacterStoryBuilder.CharacterStoryBuilder.ask_llm_for_function')
def test_create_character_chapter_partial_dilemma(mock_ask_llm, character_story_builder, mock_world_context):
    character_story_builder.world_context = mock_world_context
    character_story_builder.chapters = {"customer1": []}
    
    mock_ask_llm.return_value = {
        "chapter": "Test chapter",
        "old_bci_score": 50,
        "new_bci_score": 60
    }
    
    character_stats = {
        "bci_score": 50,
        "political_preference": "neutral"
    }
    
    # Test with only dilemma provided (no choice)
    result = character_story_builder.create_character_chapter(
        "customer1",
        character_stats,
        events=["event1"],
        dilemma="Should I help?",
        choice=None,
        outcome=None
    )
    
    assert result["chapter"] == "Test chapter"
    assert result["bci_score"] == 60
    
    # Verify that the standard prompt was used (not dilemma prompt)
    mock_ask_llm.assert_called_once()
    call_args = mock_ask_llm.call_args[1]
    messages = call_args["messages"]
    assert not any("dilemma" in msg.get("content", "").lower() for msg in messages)
