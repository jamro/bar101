import pytest
from unittest.mock import patch
from bar101_storyline.services.AiService import AiService

@pytest.fixture
def service():
    """Creates an AiService instance for testing."""
    return AiService("test-api-key")

@pytest.mark.parametrize("system_message,expected_length", [
    (None, 1),
    ("Test system message", 2)
])
def test_get_messages(service, system_message, expected_length):
    # Arrange
    prompt = "Test prompt"
    
    # Act
    messages = service.get_messages(prompt, system_message)
    
    # Assert
    assert len(messages) == expected_length
    assert messages[-1]["role"] == "user"
    assert messages[-1]["content"] == prompt
    if system_message:
        assert messages[0]["role"] == "system"
        assert messages[0]["content"] == system_message

def test_ask_llm(service, mock_llm_response):
    # Arrange
    messages = [{"role": "user", "content": "Test prompt"}]
    mock_response = mock_llm_response()
    
    with patch('bar101_storyline.services.AiService.ask_llm') as mock_ask_llm:
        mock_ask_llm.return_value = mock_response
        
        # Act
        response = service.ask_llm(messages)
        
        # Assert
        mock_ask_llm.assert_called_once_with(service.client, messages, None, "gpt-4.1")
        assert response == mock_response

def test_ask_llm_with_functions(service, mock_llm_response):
    # Arrange
    messages = [{"role": "user", "content": "Test prompt"}]
    functions = [{"name": "test_function", "parameters": {}}]
    mock_response = mock_llm_response()
    
    with patch('bar101_storyline.services.AiService.ask_llm') as mock_ask_llm:
        mock_ask_llm.return_value = mock_response
        
        # Act
        response = service.ask_llm(messages, functions)
        
        # Assert
        mock_ask_llm.assert_called_once_with(service.client, messages, functions, "gpt-4.1")
        assert response == mock_response

@pytest.mark.parametrize("function_call,should_raise", [
    ({"name": "test_function", "arguments": {"param1": "value1"}}, False),
    ({"name": "wrong_function", "arguments": {"param1": "value1"}}, True),
    (None, True)
])
def test_ask_llm_for_function(service, mock_llm_response, function_call, should_raise):
    # Arrange
    messages = [{"role": "user", "content": "Test prompt"}]
    functions = [{"name": "test_function", "parameters": {}}]
    mock_response = mock_llm_response(
        finish_reason="function_call" if function_call else "stop",
        function_call=function_call
    )
    
    with patch('bar101_storyline.services.AiService.ask_llm') as mock_ask_llm:
        mock_ask_llm.return_value = mock_response
        
        if should_raise:
            # Act & Assert
            with pytest.raises(Exception) as exc_info:
                service.ask_llm_for_function(messages, functions)
            assert str(exc_info.value) == "The model did not return a function call."
        else:
            # Act
            params = service.ask_llm_for_function(messages, functions)
            
            # Assert
            mock_ask_llm.assert_called_once_with(service.client, messages, functions, "gpt-4.1")
            assert params == function_call["arguments"]
