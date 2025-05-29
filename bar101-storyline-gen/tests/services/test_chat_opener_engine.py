import pytest
from unittest.mock import Mock, patch
from bar101_storyline.services.chat_opener_engine.ChatOpenerEngine import ChatOpenerEngine

@pytest.fixture
def chat_opener_engine():
    return ChatOpenerEngine("fake-api-key")

def test_get_neutral_opener(chat_opener_engine):
    opener = chat_opener_engine.get_neutral_opener()
    assert isinstance(opener, str)
    assert len(opener) > 0

def test_find_customer_by_id(chat_opener_engine, mock_world_context):
    chat_opener_engine.world_context = mock_world_context
    chat_opener_engine.customers = mock_world_context["bar"]["customers"]
    
    # Test finding existing customer
    customer = chat_opener_engine.find_customer_by_id("customer1")
    assert customer is not None
    assert customer["name"] == "John"
    
    # Test finding non-existent customer
    customer = chat_opener_engine.find_customer_by_id("nonexistent")
    assert customer is None

@patch('bar101_storyline.services.chat_opener_engine.ChatOpenerEngine.ChatOpenerEngine.ask_llm')
def test_get_opener_story(mock_ask_llm, chat_opener_engine, mock_world_context, mock_llm_response):
    chat_opener_engine.world_context = mock_world_context
    chat_opener_engine.customers = mock_world_context["bar"]["customers"]
    
    mock_ask_llm.return_value = mock_llm_response(content="Test story")
    
    story = chat_opener_engine.get_opener_story(
        customer_id="customer1",
        character_stats={
            "political_preference": "rebel",
            "bci_score": 50
        },
        recent_story="",
        outcome_timeline=[],
        events=[]
    )
    
    assert story == "Test story"
    mock_ask_llm.assert_called_once()

@patch('bar101_storyline.services.chat_opener_engine.ChatOpenerEngine.ChatOpenerEngine.ask_llm_for_function')
def test_get_neutral_conversation(mock_ask_llm_for_function, chat_opener_engine, mock_world_context, mock_llm_response):
    chat_opener_engine.world_context = mock_world_context
    chat_opener_engine.customers = mock_world_context["bar"]["customers"]
    
    mock_ask_llm_for_function.return_value = {
        "very_suspicious": "vs",
        "suspicious": "s",
        "neutral": "n",
        "trusting": "t",
        "very_trusting": "vt"
    }
    
    responses = chat_opener_engine.get_neutral_conversation(
        question="Test question",
        customer_id="customer1",
        character_stats={
            "political_preference": "rebel",
            "bci_score": 50
        },
        recent_story="",
        outcome_timeline=[],
        events=[],
        hobby_story="Test story"
    )
    
    assert len(responses) == 5
    assert responses == ["vs", "s", "n", "t", "vt"]
    mock_ask_llm_for_function.assert_called_once()

def test_read_context(chat_opener_engine, tmp_path):
    # Create a temporary world.json file
    world_data = {
        "background": "Test background",
        "bar": {
            "customers": [
                {
                    "id": "test1",
                    "name": "Test Customer"
                }
            ]
        }
    }
    
    world_file = tmp_path / "world.json"
    world_file.write_text('{"background": "Test background", "bar": {"customers": [{"id": "test1", "name": "Test Customer"}]}}')
    
    chat_opener_engine.read_context(str(tmp_path))
    
    assert chat_opener_engine.world_context == world_data
    assert len(chat_opener_engine.customers) == 1
    assert chat_opener_engine.customers[0]["id"] == "test1"

def test_get_hobby_opener(chat_opener_engine, mock_world_context):
    chat_opener_engine.world_context = mock_world_context
    chat_opener_engine.customers = mock_world_context["bar"]["customers"]
    
    # Add openers to test customers
    chat_opener_engine.customers[0]["openers"] = ["Opener 1", "Opener 2"]
    chat_opener_engine.customers[1]["openers"] = ["Opener 3", "Opener 4"]
    
    openers = chat_opener_engine.get_hobby_opener("customer1", count=2)
    
    assert len(openers) == 2
    assert any(opener["correct"] for opener in openers)
    assert all(isinstance(opener["message"], str) for opener in openers)

def test_get_wrong_opener_response(chat_opener_engine, mock_world_context):
    chat_opener_engine.world_context = mock_world_context
    chat_opener_engine.customers = mock_world_context["bar"]["customers"]
    
    # Add wrong opener to test customer
    chat_opener_engine.customers[0]["wrong_opener"] = "Wrong response"
    
    response = chat_opener_engine.get_wrong_opener_response("customer1")
    assert response == "Wrong response"
    
    # Test with non-existent customer
    with pytest.raises(ValueError):
        chat_opener_engine.get_wrong_opener_response("nonexistent")

@patch('bar101_storyline.services.chat_opener_engine.ChatOpenerEngine.ChatOpenerEngine.ask_llm_for_function')
def test_get_hobby_conversation(mock_ask_llm_for_function, chat_opener_engine, mock_world_context):
    chat_opener_engine.world_context = mock_world_context
    chat_opener_engine.customers = mock_world_context["bar"]["customers"]
    
    mock_ask_llm_for_function.return_value = {
        "very_suspicious": "vs",
        "suspicious": "s",
        "neutral": "n",
        "trusting": "t",
        "very_trusting": "vt"
    }
    
    responses = chat_opener_engine.get_hobby_conversation(
        question="Test hobby question",
        customer_id="customer1",
        character_stats={
            "political_preference": "rebel",
            "bci_score": 50
        },
        recent_story="",
        outcome_timeline=[],
        events=[],
        hobby_story="Test story"
    )
    
    assert len(responses) == 5
    assert responses == ["vs", "s", "n", "t", "vt"]
    mock_ask_llm_for_function.assert_called_once()

@patch('bar101_storyline.services.chat_opener_engine.ChatOpenerEngine.ChatOpenerEngine.get_neutral_opener')
@patch('bar101_storyline.services.chat_opener_engine.ChatOpenerEngine.ChatOpenerEngine.get_opener_story')
@patch('bar101_storyline.services.chat_opener_engine.ChatOpenerEngine.ChatOpenerEngine.get_neutral_conversation')
@patch('bar101_storyline.services.chat_opener_engine.ChatOpenerEngine.ChatOpenerEngine.get_hobby_conversation')
@patch('bar101_storyline.services.chat_opener_engine.ChatOpenerEngine.ChatOpenerEngine.get_hobby_opener')
@patch('bar101_storyline.services.chat_opener_engine.ChatOpenerEngine.ChatOpenerEngine.get_wrong_opener_response')
def test_get_opener(mock_wrong_opener, mock_hobby_opener, mock_hobby_conv, 
                   mock_neutral_conv, mock_story, mock_neutral_opener, 
                   chat_opener_engine, mock_world_context):
    chat_opener_engine.world_context = mock_world_context
    chat_opener_engine.customers = mock_world_context["bar"]["customers"]
    
    # Setup mocks
    mock_neutral_opener.return_value = "Test neutral question"
    mock_story.return_value = "Test story"
    mock_neutral_conv.return_value = ["n1", "n2", "n3", "n4", "n5"]
    mock_hobby_opener.return_value = "Test hobby question"
    mock_hobby_conv.return_value = ["h1", "h2", "h3", "h4", "h5"]
    mock_wrong_opener.return_value = "Wrong response"
    
    # Mock log callback
    log_callback = Mock()
    
    response = chat_opener_engine.get_opener(
        customer_id="customer1",
        character_stats={
            "political_preference": "rebel",
            "bci_score": 50
        },
        recent_story="",
        outcome_timeline=[],
        events=[],
        log_callback=log_callback
    )
    
    assert response["customer_id"] == "customer1"
    assert response["questions"]["neutral"] == "Test neutral question"
    assert response["questions"]["hobby"] == "Test hobby question"
    assert response["wrong_hobby_answer"] == "Wrong response"
    assert response["neutral_answer"] == ["n1", "n2", "n3", "n4", "n5"]
    assert response["hobby_answer"] == ["h1", "h2", "h3", "h4", "h5"]
    
    # Verify log callback was called
    assert log_callback.call_count == 3
