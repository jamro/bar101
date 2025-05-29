import pytest
from unittest.mock import Mock, patch
from bar101_storyline.services.decision_maker.DecisionMaker import DecisionMaker
import json

@pytest.fixture
def decision_maker():
    return DecisionMaker("fake-api-key")

@pytest.fixture
def mock_dilemma():
    return {
        "trigger_event": "A mysterious package arrives",
        "dilemma": "Should I open it?",
        "reason": "It might be dangerous",
        "choice_a": "Open the package",
        "choice_b": "Leave it unopened",
        "preference": "choice_a",
        "belief_a": "Opening packages is safe",
        "belief_b": "Unknown packages are dangerous"
    }

@pytest.fixture
def mock_character_stats():
    return {
        "political_preference": "rebel",
        "bci_score": 50
    }

@pytest.fixture
def mock_timeline():
    return {
        "current_time": "2024-03-20 15:00:00",
        "events": []
    }

def test_expose_dilemma(decision_maker, mock_world_context, mock_dilemma, mock_character_stats, mock_timeline, mock_llm_response):
    # Setup
    decision_maker.world_context = mock_world_context
    customer = mock_world_context["bar"]["customers"][0]
    
    expected_response = {
        "very_suspicious": "Test suspicious response",
        "suspicious": "Test suspicious response",
        "neutral": "Test neutral response",
        "trusting": "Test trusting response",
        "very_trusting": "Test very trusting response"
    }
    
    mock_response = mock_llm_response(
        function_call={
            "name": "generate_dilemma_monologue_variants",
            "arguments": json.dumps(expected_response)
        }
    )
    
    with patch.object(decision_maker, 'ask_llm_for_function', return_value=expected_response):
        result = decision_maker.expose_dilemma(customer, mock_character_stats, mock_dilemma, mock_timeline)
        
        assert "opener" in result
        assert len(result["variants"]) == 5
        assert all(isinstance(variant, str) for variant in result["variants"])

def test_share_beliefs(decision_maker, mock_world_context, mock_dilemma, mock_character_stats, mock_timeline, mock_llm_response):
    # Setup
    decision_maker.world_context = mock_world_context
    customer = mock_world_context["bar"]["customers"][0]
    
    expected_response = {
        "monologue_1": "Test monologue 1",
        "monologue_2": "Test monologue 2",
        "monologue_3": "Test monologue 3"
    }
    
    with patch.object(decision_maker, 'ask_llm_for_function', return_value=expected_response):
        result = decision_maker.share_beliefs(
            customer,
            mock_character_stats,
            mock_dilemma,
            mock_timeline,
            mock_dilemma["choice_a"],
            mock_dilemma["choice_b"],
            mock_dilemma["belief_a"]
        )
        
        assert len(result) == 3
        assert all(isinstance(monologue, str) for monologue in result)

def test_share_decision(decision_maker, mock_world_context, mock_dilemma, mock_character_stats, mock_timeline, mock_llm_response):
    # Setup
    decision_maker.world_context = mock_world_context
    customer = mock_world_context["bar"]["customers"][0]
    
    expected_response = {
        "monologue_a": {
            "very_suspicious": "Test A very suspicious",
            "suspicious": "Test A suspicious",
            "neutral": "Test A neutral",
            "trusting": "Test A trusting",
            "very_trusting": "Test A very trusting"
        },
        "monologue_b": {
            "very_suspicious": "Test B very suspicious",
            "suspicious": "Test B suspicious",
            "neutral": "Test B neutral",
            "trusting": "Test B trusting",
            "very_trusting": "Test B very trusting"
        },
        "monologue_self": {
            "very_suspicious": "Test self very suspicious",
            "suspicious": "Test self suspicious",
            "neutral": "Test self neutral",
            "trusting": "Test self trusting",
            "very_trusting": "Test self very trusting"
        }
    }
    
    with patch.object(decision_maker, 'ask_llm_for_function', return_value=expected_response):
        result = decision_maker.share_decision(
            customer,
            mock_character_stats,
            mock_dilemma,
            mock_timeline,
            mock_dilemma["choice_a"],
            mock_dilemma["choice_b"]
        )
        
        assert "monologue_a" in result
        assert "monologue_b" in result
        assert "monologue_self" in result
        assert all(len(variants) == 5 for variants in result.values())

def test_get_dilemma_convo(decision_maker, mock_world_context, mock_dilemma, mock_character_stats, mock_timeline):
    # Setup
    decision_maker.world_context = mock_world_context
    customer = mock_world_context["bar"]["customers"][0]
    
    # Mock the individual method calls
    with patch.object(decision_maker, 'expose_dilemma') as mock_expose, \
         patch.object(decision_maker, 'share_beliefs') as mock_beliefs, \
         patch.object(decision_maker, 'share_decision') as mock_decision:
        
        mock_expose.return_value = {"opener": "Test opener", "variants": ["Test variant"] * 5}
        mock_beliefs.return_value = ["Test belief"] * 3
        mock_decision.return_value = {
            "monologue_a": ["Test A"] * 5,
            "monologue_b": ["Test B"] * 5,
            "monologue_self": ["Test self"] * 5
        }
        
        result = decision_maker.get_dilemma_convo(
            customer,
            mock_character_stats,
            mock_dilemma,
            mock_timeline
        )
        
        assert "preference" in result
        assert "dilemma" in result
        assert "belief_a" in result
        assert "belief_b" in result
        assert "decision" in result
        
        # Verify all methods were called
        assert mock_expose.called
        assert mock_beliefs.call_count == 2  # Called twice for belief_a and belief_b
        assert mock_decision.called

def test_read_context(decision_maker, tmp_path):
    # Create a temporary world.json file
    world_data = {"background": "Test background", "bar": {"customers": []}}
    world_file = tmp_path / "world.json"
    world_file.write_text(json.dumps(world_data))
    
    # Test reading the context
    decision_maker.read_context(str(tmp_path))
    assert decision_maker.world_context == world_data

def test_read_context_file_not_found(decision_maker, tmp_path):
    # Test reading from non-existent file
    with pytest.raises(FileNotFoundError):
        decision_maker.read_context(str(tmp_path))
