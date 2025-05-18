import { Howl } from 'howler';

class AudioManager {
  constructor() {

    this._targetBarBackgroundVolume = 0;
    this._barNoise = new Howl({
      src: ['/audio/bar_noise.mp3'],
      loop: true,
      volume: 0,
      autoplay: true
    });
    this._barNoise.play();

    this._barMusic = new Howl({
      src: ['/audio/bg.mp3'],
      loop: true,
      volume: 0,
      autoplay: true
    });
    this._barMusic.play();

    this.volumeTransitionInterval = setInterval(() => {
      this.update();
    }, 16); // ~60fps

  }

  get barBackgroundVolume() {
    return this._targetBarBackgroundVolume;
  }

  set barBackgroundVolume(volume) {
    this._targetBarBackgroundVolume = volume;
  }

  update() {
    const updateVolume = (audio, targetVolume) => {
      const currentVolume = audio.volume();
      const delta = targetVolume - currentVolume;
      
      if (Math.abs(delta) < 0.05) {
        if (delta !== 0) {
          audio.volume(targetVolume);
        }
      } else {
        const step = Math.sign(delta) * 0.05;
        audio.volume(currentVolume + step);
      }
    }

    updateVolume(this._barNoise, this._targetBarBackgroundVolume);
    updateVolume(this._barMusic, this._targetBarBackgroundVolume*0.2);
  }
}

export default AudioManager; 