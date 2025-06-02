import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ConversationText from '../components/chat/ConversationText';
import TV from '../components/TV'
import * as styles from './NewsLayout.module.css';

export default function NewsLayout({storyNode, inventory, onClose=() => {}}) {
  const [tvReady, setTvReady] = useState(false);
  const [segmentName, setSegmentName] = useState('official');
  const [segmentIndex, setSegmentIndex] = useState(-1);
  const [newsImage, setNewsImage ] = useState('');
  const [completed, setCompleted] = useState(false);

  const newsSubtitlesRef = useRef(null);
  const tvRef = useRef(null);

  useEffect(() => {
    const run = async () => {
      if (newsSubtitlesRef.current) {
        newsSubtitlesRef.current.clear();
      }

      if(segmentIndex === -1) {
        if (tvRef.current) {
          await tvRef.current.playIntro();
        }
        setCompleted(true)
      } else {
        if (tvRef.current) {
          await tvRef.current.hideIntro();
        }
        if (newsSubtitlesRef.current) {
          await newsSubtitlesRef.current.print(storyNode.news[segmentName][segmentIndex].headline, "news_"+segmentName);
        }
        if (newsSubtitlesRef.current) {
          await newsSubtitlesRef.current.print(storyNode.news[segmentName][segmentIndex].anchor_line, "news_"+segmentName);
        }
        if (newsSubtitlesRef.current) {
          await newsSubtitlesRef.current.print(storyNode.news[segmentName][segmentIndex].contextual_reframing, "news_"+segmentName);
        }
        setCompleted(true)
      }
    }
    run()
    setNewsImage(segmentIndex >= 0 ? storyNode.news[segmentName][segmentIndex].image : null);
    setCompleted(false)

  }
  , [segmentName, segmentIndex]);

  const skip = () => {
    if (newsSubtitlesRef.current) {
      newsSubtitlesRef.current.skip();
    }
  }

  const close = () => {
    if (segmentIndex < storyNode.news[segmentName].length - 1) {
      setSegmentIndex(prev => prev + 1);
      return 
    }

    if (segmentName === 'official' && inventory.antenna) {
      setSegmentName('underground');
      setSegmentIndex(-1);
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
        headline={segmentIndex >= 0 ? storyNode.news[segmentName][segmentIndex].headline : ""} 
        mode={segmentName}
        pipUrl={(segmentIndex >= 0 && newsImage) ? `/story/${newsImage}` : null}
        onReady={() => setTvReady(true)}
        ref={tvRef}
      />
      <div className={styles.subtitlesContainer} style={{display: tvReady ? "none" : "block"}}>
        Loading...
      </div>
      <div className={styles.subtitlesContainer} style={{display: tvReady ? "block" : "none"}}>
        <div className={styles.subtitlesBody}>
          <ConversationText ref={newsSubtitlesRef} placeholder="" />
        </div>
        <div className={styles.subtitlesControls}>
          <button onClick={() => completed ? close() : skip()}>{completed ? "Continue" : "Skip"}</button>
        </div>
      </div>
    </div>
  );
}

NewsLayout.propTypes = {
  storyNode: PropTypes.object.isRequired,
  inventory: PropTypes.object.isRequired,
  onClose: PropTypes.func
};

NewsLayout.defaultProps = {
  onClose: () => {}
};