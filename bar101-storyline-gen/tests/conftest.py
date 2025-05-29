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
            mock_response.choices[0].message.function_call.arguments = function_call["arguments"]
        return mock_response
    return _create_mock_response 



@pytest.fixture
def mock_world_context():
    return {
        "background": "Test background",
        "bar": {
            "customers": [
                {
                    "id": "customer1",
                    "name": "John",
                    "age": 30,
                    "sex": "male",
                    "job_title": "Software Engineer",
                    "access": "private",
                    "bci_score": 50,
                    "details": "John is a software engineer who works at a tech company. He is married and has two children.",
                    "political_preference": "rebel",
                    "hobby": "reading",
                    "communication": "direct and straightforward",
                    "wrong_opener": "I'm not sure I understand your question."
                },
                {
                    "id": "customer2",
                    "name": "Jane",
                    "age": 25,
                    "sex": "female",
                    "job_title": "Marketing Manager",
                    "access": "public",
                    "bci_score": 60,
                    "details": "Jane is a marketing manager who works at a marketing company. She is married and has two children.",
                    "political_preference": "innovators",
                    "hobby": "painting",
                    "communication": "polite and indirect",
                    "wrong_opener": "I'm not sure I understand your question."
                }
            ]
        }
    }