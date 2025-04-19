import React from 'react';
import * as styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <h1>Loading...</h1>
      <p>Please wait while we load the game.</p>
    </div>
  );
}