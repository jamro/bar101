import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import SparkMD5 from "spark-md5";

const hash = SparkMD5.hash("aradan|What can I get you?");
console.log(hash);

const root = createRoot(document.getElementById('root'));
root.render(<App 
  initStoryPath={window.location.hash.substring(1).split('')}
  onStoryPathChange={(path) => { window.location.hash = path.join(''); }}
/>);