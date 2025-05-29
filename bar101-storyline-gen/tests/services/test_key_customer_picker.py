import pytest
import json
import os
from unittest.mock import Mock, patch
from bar101_storyline.services.key_customer_picker.KeyCustomerPicker import KeyCustomerPicker

@pytest.fixture
def key_customer_picker():
    return KeyCustomerPicker("fake-api-key")

@pytest.fixture
def temp_world_file(tmp_path):
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
                },
                {
                    "id": "customer2",
                    "name": "Jane",
                    "age": 25,
                    "sex": "female",
                    "job_title": "Marketing Manager",
                    "access": "public",
                    "bci_score": 60,
                    "details": "Test details",
                    "political_preference": "innovators",
                    "hobby": "painting",
                    "communication": "polite",
                    "wrong_opener": "Test opener"
                }
            ]
        }
    }
    
    world_file = tmp_path / "world.json"
    with open(world_file, "w") as f:
        json.dump(world_data, f)
    
    return str(tmp_path)

def test_initialization(key_customer_picker):
    assert key_customer_picker.world_context is None
    assert key_customer_picker.customers is None

def test_read_context(key_customer_picker, temp_world_file):
    key_customer_picker.read_context(temp_world_file)
    assert key_customer_picker.world_context is not None
    assert key_customer_picker.customers is not None
    assert len(key_customer_picker.customers) == 2
    assert key_customer_picker.customers[0]["name"] == "John"
    assert key_customer_picker.customers[1]["name"] == "Jane"

def test_read_context_file_not_found(key_customer_picker):
    with pytest.raises(FileNotFoundError):
        key_customer_picker.read_context("/nonexistent/path")

def test_get_random_customer_without_context(key_customer_picker):
    with pytest.raises(ValueError, match="Customers not loaded"):
        key_customer_picker.get_random_customer()

def test_get_random_customer(key_customer_picker, temp_world_file):
    key_customer_picker.read_context(temp_world_file)
    customer = key_customer_picker.get_random_customer()
    assert customer in key_customer_picker.customers

def test_get_random_patrons_without_context(key_customer_picker):
    with pytest.raises(ValueError, match="Customers not loaded"):
        key_customer_picker.get_random_patrons(["customer1"])

def test_get_random_patrons(key_customer_picker, temp_world_file):
    key_customer_picker.read_context(temp_world_file)
    patrons = key_customer_picker.get_random_patrons(["customer1"], num_patrons=3)
    assert len(patrons) == 2  # Only 2 customers available
    assert "customer1" in patrons
    assert "customer2" in patrons

def test_get_random_patrons_with_none_ids(key_customer_picker, temp_world_file):
    key_customer_picker.read_context(temp_world_file)
    patrons = key_customer_picker.get_random_patrons([None, "customer1"], num_patrons=3)
    assert len(patrons) == 2
    assert "customer1" in patrons
    assert "customer2" in patrons

@patch('bar101_storyline.services.key_customer_picker.KeyCustomerPicker.AiService.ask_llm')
@patch('bar101_storyline.services.key_customer_picker.KeyCustomerPicker.AiService.ask_llm_for_function')
def test_pick_customer_dilemma(mock_ask_llm_for_function, mock_ask_llm, key_customer_picker, temp_world_file, mock_llm_response):
    # Setup mocks
    mock_ask_llm.return_value = mock_llm_response(content="Test dilemma")
    mock_ask_llm_for_function.return_value = {
        "trigger_event": "Test trigger",
        "dilemma": "Test dilemma",
        "reason": "Test reason",
        "variant_a": "Test variant A",
        "political_support_a": "harmonists",
        "sub_beliefs_driver_a": ["belief1", "belief2", "belief3"],
        "transition_events_a": ["event1", "event2"],
        "variant_b": "Test variant B",
        "political_support_b": "innovators",
        "sub_beliefs_driver_b": ["belief4", "belief5", "belief6"],
        "transition_events_b": ["event3", "event4"],
        "preference": "A"
    }

    key_customer_picker.read_context(temp_world_file)
    
    outcome_timeline = ["Event 1", "Event 2"]
    timeline = [{"timestamp": "2024-01-01", "visibility": "public", "description": "Test event"}]
    branch_a = "Branch A"
    branch_b = "Branch B"
    events_a = [{"timestamp": "2024-01-01", "description": "Event A"}]
    events_b = [{"timestamp": "2024-01-01", "description": "Event B"}]
    customers_model = {
        "customer1": {"test": "data", "political_preference": "rebel", "bci_score": 50},
        "customer2": {"test": "data", "political_preference": "innovators", "bci_score": 60}
    }

    result = key_customer_picker.pick_customer_dilemma(
        outcome_timeline,
        timeline,
        branch_a,
        branch_b,
        events_a,
        events_b,
        customers_model
    )

    assert result["customer"] in key_customer_picker.customers
    assert result["trigger_event"] == "Test trigger"
    assert result["dilemma"] == "Test dilemma"
    assert result["political_support_a"] == "harmonists"
    assert result["political_support_b"] == "innovators"
    assert result["preference"] == "a"
    assert len(result["belief_driver_a"]) == 3
    assert len(result["belief_driver_b"]) == 3
