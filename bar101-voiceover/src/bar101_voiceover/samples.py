from TTS.api import TTS
import os
from lib import voice_bank

tts = TTS(model_name="tts_models/en/vctk/vits", progress_bar=True)

for speaker in tts.speakers:
    speaker_id = ''.join(filter(lambda x: x.isalnum(), speaker))
    print(f"Generating voice for speaker: {speaker_id}")
    file_path = os.path.join(os.path.dirname(__file__), "..", "..", "voiceovers", "samples", "voices", f"{speaker_id}.wav")
    if not os.path.exists(file_path):
        tts.tts_to_file(
            text="I'm telling you, this city is changing.",
            speaker=speaker,
            file_path=file_path,
        )


for voice in voice_bank.values():
    for index, sample in enumerate(voice["samples"]):
        speaker_id = voice["id"]
        file_path = os.path.join(os.path.dirname(__file__), "..", "..", "voiceovers", "samples", "characters", f"{speaker_id}_{index+1}.wav")
        if not os.path.exists(file_path):
            tts.tts_to_file(
                text=sample,
                speaker=voice["speaker"],
                file_path=file_path,
            )