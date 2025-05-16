import React from 'react';
import * as styles from './DilemmaWidget.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const DilemmaWidget = ({ 
  dilemmaTitleA,
  dilemmaTitleB,
  buttonLabelA,
  buttonLabelB,
  dilemmaPreference,
  enabled=true,
  onButtonAClick = () => {},
  onButtonBClick = () => {}
}) => {

  let nextChapter = null
  if(dilemmaPreference > 0.5) {
    nextChapter = <div className={styles.dilemmaTitleA}><small>DECISION WILL LEADS TO:</small> {dilemmaTitleA}</div>
  } else {
    nextChapter = <div className={styles.dilemmaTitleB}><small>DECISION WILL LEAD TO:</small> {dilemmaTitleB}</div>
  }
  return <div className={styles.dilemmaWidget}>
    {nextChapter}
    <div className={"progress " + styles.dilemmaProgress} style={{ backgroundColor: '#a83300', height: '0.2em' }}>
      <div 
        className="progress-bar" 
        role="progressbar" 
        style={{
          width: `${dilemmaPreference * 100}%`,
          backgroundColor: '#dec583'
        }}
        aria-valuenow={dilemmaPreference * 100} 
        aria-valuemin="0" 
        aria-valuemax="100"
      />
    </div>
    <div className={styles.buttons}>
      <button className={styles.buttonA} disabled={!enabled} onClick={onButtonAClick}>{buttonLabelA} <FontAwesomeIcon icon={faPaperPlane} /></button>
      <button className={styles.buttonB} disabled={!enabled} onClick={onButtonBClick}>{buttonLabelB} <FontAwesomeIcon icon={faPaperPlane} /></button>
    </div>
  </div>
}

export default DilemmaWidget;