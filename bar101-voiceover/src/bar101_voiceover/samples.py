from TTS.api import TTS
import os

tts = TTS(model_name="tts_models/en/vctk/vits", progress_bar=True)

for speaker in tts.speakers:
    #remove non-alphabetic or non-numeric characters from speaker name
    speaker_id = ''.join(filter(lambda x: x.isalnum(), speaker))
    print(f"Generating voice for speaker: {speaker_id}")
    file_path = os.path.join(os.path.dirname(__file__), "..", "..", "voiceovers", "samples", f"{speaker_id}.wav")

    tts.tts_to_file(
        text="I'm telling you, this city is changing.",
        speaker=speaker,
        file_path=file_path
    )