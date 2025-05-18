import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import AudioManager from './audio/AudioManager';

const audioManager = new AudioManager();

const setBarNoiseVolume = (volume) => {
  audioManager.barBackgroundVolume = volume;
}

const root = createRoot(document.getElementById('root'));
root.render(<App onBarNoiseVolumeChange={setBarNoiseVolume} />);