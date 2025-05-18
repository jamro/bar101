import React, { useState, useEffect } from 'react';
import * as styles from './DateLayout.module.css';

export default function DateLayout({storyNode, onClose=() => {}}) {

  const [showInstructions, setShowInstructions] = useState(false);
  const [showDate, setShowDate] = useState(false);
 
  const now = new Date(storyNode.timestamp)
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const weekday = now.getDay()

  const minutesText = minutes < 10 ? `0${minutes}` : minutes

  const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const allWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  let dateName
  if (day === 1 || day === 21 || day === 31) {
    dateName = `${day}st`
  } else if (day === 2 || day === 22) {
    dateName = `${day}nd`
  } else if (day === 3 || day === 23) {
    dateName = `${day}rd`
  } else {
    dateName = `${day}th`
  }
  const monthName = allMonths[month]
  const weekdayName = allWeekdays[weekday]

  useEffect(() => {
    const loop1 = setTimeout(() => {
      setShowDate(true)
    }, 200)
    const loop2 = setTimeout(() => {
      setShowInstructions(true)
    }, 1500)
    return () => {
      clearTimeout(loop1)
      clearTimeout(loop2)
    }
  }, [])

  let instructions = <div className={styles.instructionsPlaceholder}>&nbsp;</div>
  if(showInstructions) {
    instructions = <div className={styles.instructions}>(Tap to continue)</div>
  }

  let dateText = <div className={styles.dateTextPlaceholder}>&nbsp;</div>
  if(showDate) {
    dateText = <div className={styles.dateText}>{dateName} of {monthName}, {year}</div>
  }
  return (
    <div className={styles.fullCentered} onClick={showInstructions ? onClose : null}>
      <div>
        {dateText}
        <div className={styles.locationText} >STENOGRAD</div>
        {instructions}
      </div>
    </div>
  );
}