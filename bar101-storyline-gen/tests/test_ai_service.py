import pytest
from bar101_storyline.services.AiService import AiService

def test_ai_service():
    # Assert
    assert 1 == 1

def test_ai_service_initialization():
    # Arrange
    api_key = "test-api-key"
    
    # Act
    service = AiService(api_key)
    
    # Assert
    assert service.client is not None

def test_get_messages_without_system_message():
    # Arrange
    service = AiService("test-api-key")
    prompt = "Test prompt"
    
    # Act
    messages = service.get_messages(prompt)
    
    # Assert
    assert len(messages) == 1
    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == prompt

def test_get_messages_with_system_message():
    # Arrange
    service = AiService("test-api-key")
    prompt = "Test prompt"
    system_message = "Test system message"
    
    # Act
    messages = service.get_messages(prompt, system_message)
    
    # Assert
    assert len(messages) == 2
    assert messages[0]["role"] == "system"
    assert messages[0]["content"] == system_message
    assert messages[1]["role"] == "user"
    assert messages[1]["content"] == prompt
