import pytest
import json
import os
from unittest.mock import Mock, patch
from bar101_storyline.services.plot_shaper.PlotShaper import PlotShaper

@pytest.fixture
def plot_shaper(mock_llm_response):
    with patch('bar101_storyline.services.plot_shaper.PlotShaper.AiService') as mock_ai_service:
        plot_shaper = PlotShaper("fake_api_key")
        plot_shaper.ask_llm = Mock()
        plot_shaper.ask_llm_for_function = Mock()
        return plot_shaper

@pytest.fixture
def mock_context_files(tmp_path):
    # Create mock timeline.json
    timeline = [
        {"event": "Event 1", "timestamp": "2024-01-01"},
        {"event": "Event 2", "timestamp": "2024-01-02"}
    ]
    
    # Create mock world.json
    world = {
        "background": "Test background",
        "bar": {
            "name": "Test Bar",
            "location": "Test Location"
        }
    }
    
    # Create mock plot_structure.json
    plot_structure = [
        {
            "stage": "Act 1",
            "name": "Setup",
            "purpose": "Introduce the characters and the setting",
            "description": "Setup",
            "core": "core_setup",
            "examples": ["Example 1", "Example 2", "Example 3", "Example 4", "Example 5", "Example 6", "Example 7", "Example 8", "Example 9", "Example 10", "Example 11", "Example 12", "Example 13", "Example 14", "Example 15", "Example 16", "Example 17", "Example 18", "Example 19", "Example 20"]
        },
        {
            "stage": "Act 2",
            "name": "Confrontation",
            "purpose": "Confront the characters and the setting",
            "description": "Confrontation",
            "core": "core_confrontation",
            "examples": ["Example A", "Example B", "Example C", "Example D", "Example E", "Example F", "Example G", "Example H", "Example I", "Example J", "Example K", "Example L", "Example M", "Example N", "Example O", "Example P", "Example Q", "Example R", "Example S", "Example T"]
        }
    ]
    
    # Write files to temporary directory
    with open(tmp_path / "timeline.json", "w") as f:
        json.dump(timeline, f)
    with open(tmp_path / "world.json", "w") as f:
        json.dump(world, f)
    with open(tmp_path / "plot_structure.json", "w") as f:
        json.dump(plot_structure, f)
    
    return tmp_path

def test_initialization(plot_shaper):
    assert plot_shaper.timeline == []
    assert plot_shaper.world_context is None
    assert plot_shaper.plot_structure is None
    assert plot_shaper.plot_stage_index == 0

def test_read_context(plot_shaper, mock_context_files):
    plot_shaper.read_context(mock_context_files)
    
    assert len(plot_shaper.timeline) == 2
    assert plot_shaper.world_context["background"] == "Test background"
    assert len(plot_shaper.plot_structure) == 2
    assert plot_shaper.plot_structure[0]["stage"] == "Act 1"

def test_read_context_file_not_found(plot_shaper, tmp_path):
    with pytest.raises(FileNotFoundError):
        plot_shaper.read_context(tmp_path)

def test_get_plot_stage(plot_shaper, mock_context_files):
    plot_shaper.read_context(mock_context_files)
    
    # Test first stage
    assert plot_shaper.get_plot_stage()["stage"] == "Act 1"
    
    # Test moving to next stage
    plot_shaper.move_to_next_stage()
    assert plot_shaper.get_plot_stage()["stage"] == "Act 2"
    
    # Test getting last stage when index is beyond structure
    plot_shaper.move_to_next_stage()
    assert plot_shaper.get_plot_stage()["stage"] == "Act 2"

def test_is_complete(plot_shaper, mock_context_files):
    plot_shaper.read_context(mock_context_files)
    
    assert not plot_shaper.is_complete()
    
    plot_shaper.move_to_next_stage()
    assert not plot_shaper.is_complete()
    
    plot_shaper.move_to_next_stage()
    assert plot_shaper.is_complete()

def test_fork_plot(plot_shaper, mock_context_files, mock_llm_response):
    plot_shaper.read_context(mock_context_files)
    
    # Mock LLM responses
    mock_brainstorm_response = mock_llm_response(
        content="Brainstormed ideas for the next chapter"
    )
    mock_fork_response = mock_llm_response(
        function_call={
            "name": "fork_storyline",
            "arguments": {
                "branch_a": "Branch A description",
                "branch_b": "Branch B description",
                "branch_a_title": "Branch A Title",
                "branch_b_title": "Branch B Title",
                "events_a": ["Event A1", "Event A2"],
                "events_b": ["Event B1", "Event B2"]
            }
        }
    )
    
    plot_shaper.ask_llm.return_value = mock_brainstorm_response
    plot_shaper.ask_llm_for_function.return_value = mock_fork_response.choices[0].message.function_call.arguments
    
    result = plot_shaper.fork_plot()
    
    assert "branch_a" in result
    assert "branch_b" in result
    assert "branch_a_title" in result
    assert "branch_b_title" in result
    assert "events_a" in result
    assert "events_b" in result
    assert "plot_stage" in result
    
    # Verify the plot stage is correct
    assert result["plot_stage"]["stage"] == "Act 1"
