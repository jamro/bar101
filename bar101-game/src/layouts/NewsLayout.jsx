import React, { useState, useRef, useEffect } from 'react';
import ConversationText from '../components/chat/ConversationText';
import TV from '../components/tv';
import * as styles from './NewsLayout.module.css';

export default function NewsLayout({data, inventory, onClose=() => {}}) {
  const [tvReady, setTvReady] = useState(false);
  const [segmentName, setSegmentName] = useState('official');
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [newsImage, setNewsImage ] = useState('');
  const [completed, setCompleted] = useState(false);

  const newsSubtitlesRef = useRef(null);

  useEffect(() => {
    const run = async () => {
      if (newsSubtitlesRef.current) {
        newsSubtitlesRef.current.clear();
      }
      if (newsSubtitlesRef.current) {
        await newsSubtitlesRef.current.print(data[segmentName][segmentIndex].headline, "news_"+segmentName);
      }
      if (newsSubtitlesRef.current) {
        await newsSubtitlesRef.current.print(data[segmentName][segmentIndex].anchor_line, "news_"+segmentName);
      }
      if (newsSubtitlesRef.current) {
        await newsSubtitlesRef.current.print(data[segmentName][segmentIndex].contextual_reframing, "news_"+segmentName);
      }
      setCompleted(true)
    }
    run()
    setNewsImage(data[segmentName][segmentIndex].image);
    setCompleted(false)

  }
  , [segmentName, segmentIndex]);

  const skip = () => {
    if (newsSubtitlesRef.current) {
      newsSubtitlesRef.current.skip();
    }
  }

  const close = () => {
    if (segmentIndex < data[segmentName].length - 1) {
      setSegmentIndex(prev => prev + 1);
      return 
    }

    if (segmentName === 'official' && inventory.antenna) {
      setSegmentName('underground');
      setSegmentIndex(0);
    } else {
      onClose();
    }
  }

  let segmentClass = ""
  switch (segmentName) {  
    case 'official':
      segmentClass = "bg-light";
      break;
    case 'underground':
      segmentClass = "bg-danger text-white";
      break;
    default:
      segmentClass = "bg-light";
  }

  useEffect(() => {
    return () => {
      if (newsSubtitlesRef.current) {
        newsSubtitlesRef.current.skip();
      }
    }
  }, []);

  return (
    <div style={{width: "100%", height: "100%"}}>
      <TV 
        headline={data[segmentName][segmentIndex].headline} 
        mode={segmentName}
        pipUrl={newsImage ? `/story/${newsImage}` : null}
        onReady={() => setTvReady(true)}
      />
      <div className={styles.subtitlesContainer} style={{display: tvReady ? "none" : "block"}}>
        Loading...
      </div>
      <div className={styles.subtitlesContainer} style={{display: tvReady ? "block" : "none"}}>
        <div className={styles.subtitlesBody}>
          <ConversationText ref={newsSubtitlesRef} />
        </div>
        <div className={styles.subtitlesControls}>
          <button onClick={() => completed ? close() : skip()}>{completed ? "Continue" : "Skip"}</button>
        </div>
      </div>
    </div>
  );
}