import pytest
import os
import json
from datetime import datetime
from unittest.mock import patch, mock_open
from bar101_storyline.services.tree_packer.TreePacker import TreePacker

@pytest.fixture
def sample_data():
    return {
        "title": "Test Title",
        "content": "Test Content",
        "characters": {
            "character1": {
                "bci_score": 75,
                "political_preference": "rebel"
            }
        }
    }

@pytest.fixture
def tree_packer():
    return TreePacker()

def test_clean_string(tree_packer):
    # Test cleaning of special characters
    test_string = "\u2019test\u201c\u201d\u00e9"
    cleaned = tree_packer._clean(test_string)
    assert cleaned == "'test''e"

def test_clean_dict(tree_packer):
    # Test cleaning of dictionary
    test_dict = {
        "title": "\u2019Test\u201d",
        "content": "Content\u00e9"
    }
    cleaned = tree_packer._clean(test_dict)
    print(cleaned)
    assert cleaned == {
        "title": "Test",
        "content": "Contente"
    }

def test_read_file(tree_packer):
    # Test reading file with mock
    mock_data = {"test": "data"}
    mock_json = json.dumps(mock_data)
    
    with patch("os.path.exists", return_value=True), \
         patch("builtins.open", mock_open(read_data=mock_json)):
        result = tree_packer._read_file("/fake/path", "test.json")
        assert result == mock_data

def test_read_file_not_found(tree_packer):
    # Test reading non-existent file
    with pytest.raises(FileNotFoundError):
        tree_packer._read_file("/fake/path", "nonexistent.json")

def test_read_file_no_error(tree_packer):
    # Test reading file with no_error=True
    result = tree_packer._read_file("/fake/path", "nonexistent.json", no_error=True)
    assert result is None

