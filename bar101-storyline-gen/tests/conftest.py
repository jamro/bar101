import pytest
from unittest.mock import Mock
import json

@pytest.fixture
def mock_llm_response():
    """Factory function to create mock LLM responses with different configurations."""
    def _create_mock_response(content="Test response", finish_reason="stop", function_call=None):
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].finish_reason = finish_reason
        mock_response.choices[0].message = Mock()
        mock_response.choices[0].message.content = content
        if function_call:
            mock_response.choices[0].message.function_call = Mock()
            mock_response.choices[0].message.function_call.name = function_call["name"]
            mock_response.choices[0].message.function_call.arguments = json.dumps(function_call["arguments"])
        return mock_response
    return _create_mock_response 