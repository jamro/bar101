import hashlib
from TTS.api import TTS
import os
import json
from lib import voice_bank
from pydub import AudioSegment
from pydub.silence import detect_nonsilent

def generate_voiceover(group, character, text, model=None, log=[]):
  # create md5 hash
  key = f"{character}|{text}"
  md5 = hashlib.md5()
  md5.update(key.encode('utf-8'))
  hash = md5.hexdigest()
  log.append({
      "hash": hash,
      "group": group,
      "character": character,
      "text": text
  })

  # create target direcrory
  target_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "voiceovers", "storytree")
  target_file_wav = os.path.join(target_dir, f"{hash}.wav")
  target_file_mp3 = os.path.join(target_dir, f"{hash}.mp3")
  if not os.path.exists(target_dir):
    os.makedirs(target_dir)

  if os.path.exists(target_file_mp3):
    return

  # get voice
  voice = voice_bank[character]
  if not voice:
    raise ValueError(f"Voice {character} not found in voice bank")

  # generate voiceover
  model = model if model else TTS(model_name="tts_models/en/vctk/vits", progress_bar=True)
  model.tts_to_file(
      text=text,
      speaker=voice["speaker"],
      file_path=target_file_wav,
  )

  # convert to mp3
  audio = AudioSegment.from_wav(target_file_wav)
  audio.set_channels(1)
  audio = audio.set_frame_rate(16000)
  nonsilent = detect_nonsilent(audio, min_silence_len=300, silence_thresh=-40)
  if nonsilent:
    start, end = nonsilent[0][0], nonsilent[-1][1]
    audio = audio[start:end]
  audio.export(target_file_mp3, format="mp3", bitrate="32k", parameters=["-ac", "1", "-ar", "16000", "-q:a", "5"])

  # remove wav file
  os.remove(target_file_wav)