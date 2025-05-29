import pytest
import json
import os
from unittest.mock import Mock, patch
from bar101_storyline.services.timeline_integrator.TimelineIntegrator import TimelineIntegrator

@pytest.fixture
def timeline_integrator(mock_llm_response):
    with patch('openai.ChatCompletion.create', return_value=mock_llm_response(
        function_call={
            "name": "refine_events",
            "arguments": json.dumps({
                "events": [
                    {"timestamp": "2024-03-20 10:00", "description": "Test event 1", "visibility": "public"},
                    {"timestamp": "2024-03-20 11:00", "description": "Test event 2", "visibility": "private"}
                ]
            })
        }
    )):
        integrator = TimelineIntegrator("fake-api-key")
        yield integrator

@pytest.fixture
def test_data_dir(tmp_path):
    # Create test data directory structure
    data_dir = tmp_path / "test_data"
    data_dir.mkdir()
    
    # Create timeline.json
    timeline_data = [
        {"timestamp": "2024-03-20 09:00", "description": "Initial event", "visibility": "public"}
    ]
    with open(data_dir / "timeline.json", "w") as f:
        json.dump(timeline_data, f)
    
    # Create world.json
    world_data = {
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
                    "details": "Test details",
                    "political_preference": "rebel",
                    "hobby": "reading",
                    "communication": "direct",
                    "wrong_opener": "Test opener"
                }
            ]
        }
    }
    with open(data_dir / "world.json", "w") as f:
        json.dump(world_data, f)
    
    return data_dir

def test_init():
    integrator = TimelineIntegrator("fake-api-key")
    assert integrator.world_context is None
    assert integrator.timeline is None

def test_read_context(timeline_integrator, test_data_dir):
    timeline_integrator.read_context(test_data_dir)
    
    assert timeline_integrator.timeline is not None
    assert timeline_integrator.world_context is not None
    assert len(timeline_integrator.timeline) == 1
    assert timeline_integrator.world_context["background"] == "Test background"

def test_read_context_file_not_found(timeline_integrator, tmp_path):
    with pytest.raises(FileNotFoundError):
        timeline_integrator.read_context(tmp_path)

@patch('bar101_storyline.services.timeline_integrator.TimelineIntegrator.TimelineIntegrator.ask_llm_for_function')
def test_integrate_timeline(mock_ask_llm_for_function, timeline_integrator, test_data_dir):
    timeline_integrator.read_context(test_data_dir)
    
    timeline = [
        {"timestamp": "2024-03-20 09:00", "description": "Initial event", "visibility": "public"}
    ]
    events = [
        {"timestamp": "2024-03-20 10:00", "description": "New event", "visibility": "public"}
    ]
    
    # Mock the LLM response
    mock_ask_llm_for_function.return_value = {
        "events": [
            {"timestamp": "2024-03-20 09:00", "description": "Initial event", "visibility": "public"},
            {"timestamp": "2024-03-20 10:00", "description": "New event", "visibility": "public"}
        ]
    }
    
    result = timeline_integrator.integrate_timeline(
        timeline=timeline,
        events=events,
        customer_id="customer1",
        dilemma="Test dilemma",
        choice="Test choice",
        outcome="Test outcome"
    )
    
    assert isinstance(result, list)
    assert len(result) == 2
    assert all(isinstance(event, dict) for event in result)
    assert all("timestamp" in event for event in result)
    assert all("description" in event for event in result)
    assert all("visibility" in event for event in result)
    
    # Verify the mock was called
    mock_ask_llm_for_function.assert_called_once()

def test_integrate_timeline_invalid_customer(timeline_integrator, test_data_dir):
    timeline_integrator.read_context(test_data_dir)
    
    with pytest.raises(Exception, match="Customer with ID invalid_id not found in world context"):
        timeline_integrator.integrate_timeline(
            timeline=[],
            events=[],
            customer_id="invalid_id",
            dilemma="Test dilemma",
            choice="Test choice",
            outcome="Test outcome"
        )
