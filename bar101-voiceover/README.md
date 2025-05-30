# Bar101 Voiceover Generator

A Python-based tool for generating voiceovers for the Bar 101 game's dialogues and TV news segments. This project handles the text-to-speech conversion of all in-game conversations and news content, creating immersive audio experiences for character interactions, official news broadcasts, and rebel TV segments.

## Overview

The voiceover generator is an integral part of the Bar 101 game's narrative system, working in conjunction with the storyline generator to create engaging TV news segments. Each news segment includes both visual content and voiceover narration, providing players with multiple ways to experience the story.

## Features

- Text-to-speech conversion for news segments
- Support for multiple voice styles
- Integration with the storyline generator's output
- High-quality voice synthesis
- Batch processing capabilities

## Technical Details

The voiceover generator is designed to handle a large-scale text-to-speech conversion process:

- **Scale**: The script generates approximately 100,000 voiceover files, resulting in about 2GB of audio data. Due to this large volume, execution can be time-consuming.
- **File Organization**: 
  - Each voiceover file is named using an MD5 hash generated from the text content and its source (either a person's name or news type)
  - Files are organized in the `voiceovers/` directory with subdirectories for storytree and samples
- **Storage**: 
  - Due to the large number of files, voiceover data is not stored in the Git repository
  - Files are distributed separately through the game's asset delivery system
- **Compression**: 
  - All voiceover files are heavily compressed to MP3 format
  - Speech audio is particularly well-suited for compression, allowing for efficient storage while maintaining quality

## Text-to-Speech Technology

The project uses Coqui TTS with the VITS model trained on the VCTK dataset for voice synthesis. This choice was made for several key reasons:

- **Quality**: VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) provides high-quality, natural-sounding speech synthesis that's crucial for immersive game dialogue
- **Multi-speaker Support**: The VCTK dataset includes multiple speakers, allowing us to assign distinct voices to different characters and news types
- **Open Source**: As an open-source solution, it provides full control over the voice generation process and no usage limitations

The voice synthesis process includes post-processing steps to ensure optimal audio quality and file size:
- Conversion to mono channel for consistent playback
- Standardized sample rate (16kHz) for speech clarity
- Silence trimming for natural-sounding dialogue
- MP3 compression to balance quality and storage requirements

## Prerequisites

- Python 3.11 or higher
- Git
- Make (for using Makefile commands)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/jamro/bar101.git
cd bar101-voiceover
```

2. Install dependencies using Poetry:
```bash
make install
```

## Usage

### Generating Voiceovers

```bash
make run
```

This command processes the news segments from the storyline generator and creates corresponding voiceover files. The output is saved in the `/bar101-voiceover/voiceovers/storytree` directory.

### Creating Sample Voiceovers

```bash
make samples
```

This command generates sample voiceover files for testing purposes. It creates a small set of voiceovers with different voice styles to help verify the quality and characteristics of the generated audio. The output is saved in the `/bar101-voiceover/voiceovers/samples` directory.

### Uploading Voiceovers

```bash
make upload
```

This command uploads the generated voiceover files to the game's asset storage. It ensures that all voiceover files are properly organized and accessible for the game engine.

### Development

- Format code:
```bash
make format
```

- Run linter:
```bash
make lint
```

- Run tests:
```bash
make test
```

## Project Structure

```
bar101-voiceover/
├── src/                  # Source code
├── voiceovers/            
│   ├── storytree/        # Voiceovers for storytree
│   └── samples/          # Sample voiceovers for testing
├── pyproject.toml        # Project configuration
└── Makefile              # Build commands
```

## Integration with Storyline Generator

The voiceover generator works in tandem with the storyline generator (`bar101-storyline-gen`). Before running the voiceover generator, you must first run the storyline generator and extract all nodes (see [Storyline Generator Documentation](../bar101-storyline-gen/README.md) for details). The voiceover generator then processes both dialogues and news segments from the extracted nodes to create corresponding voiceover files. The integration ensures that:

1. Each news segment has a matching voiceover with appropriate voice styles (official vs. rebel TV)
2. All dialogue lines have corresponding voiceovers with character-specific voices
3. Audio files are properly named, organized and compressed for game integration