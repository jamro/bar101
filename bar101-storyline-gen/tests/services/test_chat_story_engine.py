import pytest
from unittest.mock import Mock, patch
from bar101_storyline.services.chat_story_engine.ChatStoryEngine import ChatStoryEngine

@pytest.fixture
def chat_story_engine():
    return ChatStoryEngine("fake-api-key")

def test_find_customer_by_id(chat_story_engine, mock_world_context):
    chat_story_engine.world_context = mock_world_context
    chat_story_engine.customers = mock_world_context["bar"]["customers"]
    
    # Test finding existing customer
    customer = chat_story_engine.find_customer_by_id("customer1")
    assert customer is not None
    assert customer["name"] == "John"
    assert customer["job_title"] == "Software Engineer"
    
    # Test finding non-existent customer
    customer = chat_story_engine.find_customer_by_id("nonexistent")
    assert customer is None

def test_get_opener(chat_story_engine):
    opener = chat_story_engine.get_opener()
    assert isinstance(opener, str)
    assert len(opener) > 0

@patch('bar101_storyline.services.chat_story_engine.ChatStoryEngine.ChatStoryEngine.ask_llm_for_function')
def test_get_main_conversation(mock_ask_llm, chat_story_engine, mock_world_context, mock_llm_response):
    chat_story_engine.world_context = mock_world_context
    chat_story_engine.customers = mock_world_context["bar"]["customers"]
    
    # Mock LLM response
    mock_response = mock_llm_response(
        function_call={
            "name": "generate_main_monologue_variants",
            "arguments": {
                "very_suspicious": "Very suspicious response",
                "suspicious": "Suspicious response",
                "neutral": "Neutral response",
                "trusting": "Trusting response",
                "very_trusting": "Very trusting response",
                "ending_emotion": "happy"
            }
        }
    )
    mock_ask_llm.return_value = mock_response.choices[0].message.function_call.arguments
    
    result = chat_story_engine.get_main_conversation(
        question="What's your favorite drink?",
        customer_id="customer1",
        character_stats={
            "political_preference": "rebel",
            "bci_score": 50
        },
        recent_story=[],
        outcome_timeline=[],
        events=[]
    )
    
    assert isinstance(result, dict)
    assert "opener" in result
    assert "variants" in result
    assert "emotion" in result
    assert len(result["variants"]) == 5
    assert result["emotion"] == "happy"

@patch('bar101_storyline.services.chat_story_engine.ChatStoryEngine.ChatStoryEngine.ask_llm_for_function')
def test_get_emotional_followup(mock_ask_llm, chat_story_engine, mock_world_context, mock_llm_response):
    chat_story_engine.world_context = mock_world_context
    chat_story_engine.customers = mock_world_context["bar"]["customers"]
    
    # Mock LLM response
    mock_response = mock_llm_response(
        function_call={
            "name": "generate_emotional_monologue_variants",
            "arguments": {
                "alex_phrase": "How are you feeling?",
                "very_suspicious": "Very suspicious emotional response",
                "suspicious": "Suspicious emotional response",
                "neutral": "Neutral emotional response",
                "trusting": "Trusting emotional response",
                "very_trusting": "Very trusting emotional response"
            }
        }
    )
    mock_ask_llm.return_value = mock_response.choices[0].message.function_call.arguments
    
    result = chat_story_engine.get_emotional_followup(
        customer_id="customer1",
        character_stats={
            "political_preference": "rebel",
            "bci_score": 50
        },
        recent_story=[],
        emotion="happy"
    )
    
    assert isinstance(result, dict)
    assert "opener" in result
    assert "variants" in result
    assert len(result["variants"]) == 5

@patch('bar101_storyline.services.chat_story_engine.ChatStoryEngine.ChatStoryEngine.ask_llm_for_function')
def test_get_factual_followup(mock_ask_llm, chat_story_engine, mock_world_context, mock_llm_response):
    chat_story_engine.world_context = mock_world_context
    chat_story_engine.customers = mock_world_context["bar"]["customers"]
    
    # Mock LLM response
    mock_response = mock_llm_response(
        function_call={
            "name": "generate_factual_monologue_variants",
            "arguments": {
                "alex_phrase": "Let me tell you something interesting",
                "very_suspicious": "Very suspicious factual response",
                "suspicious": "Suspicious factual response",
                "neutral": "Neutral factual response",
                "trusting": "Trusting factual response",
                "very_trusting": "Very trusting factual response"
            }
        }
    )
    mock_ask_llm.return_value = mock_response.choices[0].message.function_call.arguments
    
    result = chat_story_engine.get_factual_followup(
        customer_id="customer1",
        character_stats={
            "political_preference": "rebel",
            "bci_score": 50
        },
        recent_story=[],
        emotion="happy",
        main_variants=["test"],
        outcome_timeline=[],
        events=[]
    )
    
    assert isinstance(result, dict)
    assert "opener" in result
    assert "variants" in result
    assert len(result["variants"]) == 5

def test_read_context(chat_story_engine, tmp_path):
    # Create a temporary world.json file
    world_data = {
        "background": "Test background",
        "bar": {
            "customers": [
                {
                    "id": "test_customer",
                    "name": "Test Customer"
                }
            ]
        }
    }
    
    world_file = tmp_path / "world.json"
    world_file.write_text('{"background": "Test background", "bar": {"customers": [{"id": "test_customer", "name": "Test Customer"}]}}')
    
    chat_story_engine.read_context(str(tmp_path))
    
    assert chat_story_engine.world_context is not None
    assert chat_story_engine.world_context["background"] == "Test background"
    assert len(chat_story_engine.customers) == 1
    assert chat_story_engine.customers[0]["id"] == "test_customer"
