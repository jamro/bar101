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

const preloadImage = (url) => {
  const img = new Image();
  img.src = url;
};

preloadImage('/img/time_machine_product_emblem.jpg');
preloadImage('/img/bci_scanner_product_emblem.jpg');
preloadImage('/img/tv_product_emblem.jpg');
preloadImage('/img/absinthe_product_emblem.jpg');
preloadImage('/img/dtomenko_product_emblem.jpg');
preloadImage('/img/lkova_product_emblem.jpg');
preloadImage('/img/npetrak_product_emblem.jpg');
preloadImage('/img/olintz_product_emblem.jpg');
preloadImage('/img/shalek_product_emblem.jpg');
preloadImage('/img/rmiskovic_product_emblem.jpg');

const root = createRoot(document.getElementById('root'));
root.render(<App onBarNoiseVolumeChange={setBarNoiseVolume} />);