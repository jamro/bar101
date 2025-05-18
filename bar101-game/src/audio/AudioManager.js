import { Howl } from 'howler';

class AudioManager {
  constructor() {

    this._targetBarNoiseVolume = 0;
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

  get barNoiseVolume() {
    return this._targetBarNoiseVolume;
  }

  set barNoiseVolume(volume) {
    this._targetBarNoiseVolume = volume;
  }

  update() {
    const currentVolume = this._barNoise.volume();
    const targetVolume = this._targetBarNoiseVolume;
    const delta = targetVolume - currentVolume;
    
    if (Math.abs(delta) < 0.05) {
      if (delta !== 0) {
        this._barNoise.volume(targetVolume);
        this._barMusic.volume(targetVolume*0.25);
      }
    } else {
      const step = Math.sign(delta) * 0.05;
      this._barNoise.volume(currentVolume + step);
      this._barMusic.volume((currentVolume + step)*0.25);
    }
  }
}

export default AudioManager; 