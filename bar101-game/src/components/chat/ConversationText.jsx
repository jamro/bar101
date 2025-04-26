import { func, number, string } from "prop-types";
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import SparkMD5 from "spark-md5";
import { Howl } from "howler";

const ConversationText = forwardRef(({ onComplete, placeholder, delayMs }, ref) => {
  const [displayedText, setDisplayedText] = useState("");
  const [fullText, setFullText] = useState("");
  const displayLoop = useRef(null);
  const skipPromiseResolver = useRef(null);
  const printPromiseResolver = useRef(null);
  const voicePromiseResolver = useRef(null);
  const voiceRef = useRef(null);

  const skip = () => {
    if(skipPromiseResolver.current) {
      skipPromiseResolver.current();
      skipPromiseResolver.current = null;
    }
    setDisplayedText(fullText);
    if(voiceRef.current) {
      voiceRef.current.stop();
      voiceRef.current = null;
    }
    if (displayLoop.current) {
      clearInterval(displayLoop.current);
      displayLoop.current = null;
    }
  };

  const print = async (text, from) => {
    if(!text || !from) {
      console.error("text and from must be defined");
    }
    setDisplayedText("");
    const hash = SparkMD5.hash(from + "|" + text);
    const voiceoverUrl = "https://cdn-bar101.jmrlab.com/storytree/" + hash + ".mp3";
    if(typeof text !== "string") {
      console.error("text must be a string, got " + typeof text, text);
      throw new Error("text must be a string, got " + typeof text);
    }
    
    const sound = await new Promise((resolve) => {
      const s = new Howl({
        src: [voiceoverUrl],
        format: ['mp3'],
        volume: 1.0,
        onload: () => {
          resolve(s);
        },
        onend: () => {
          console.log("Voiceover ended");
          if (voiceRef.current) {
            voicePromiseResolver.current();
            voiceRef.current = null;
          }
        },
        onloaderror: (id, err) => {
          console.error("Error loading voiceover", err);
          resolve(null);
        },
      })
    })
    

    if (voiceRef.current) {
      voiceRef.current.stop();
    }

    if (skipPromiseResolver.current) {
      skipPromiseResolver.current();
      skipPromiseResolver.current = null;
    }
    if (printPromiseResolver.current) {
      printPromiseResolver.current();
      printPromiseResolver.current = null;
    }
    if (voicePromiseResolver.current) {
      voicePromiseResolver.current();
      voicePromiseResolver.current = null;
    }

    let isSkipResolved = false;
    let isPrintResolved = false;
    let isVoiceResolved = false;
    const skipPromise = new Promise((resolve) => {
      skipPromiseResolver.current = () => {
        isSkipResolved = true;
        resolve();
        skipPromiseResolver.current = null;
      }
    });
    const voicePromise = new Promise((resolve) => {
        voicePromiseResolver.current = () => {
          if(voiceRef.current) {
            voiceRef.current.stop();
            voiceRef.current = null;
          }
          isVoiceResolved = true;
          resolve();
          voicePromiseResolver.current = null;
        }
        voiceRef.current = sound;
        if(voiceRef.current) {
          voiceRef.current.play();
        } else {
          voicePromiseResolver.current();
          voiceRef.current = null;
        }
    });
    const printPromise = new Promise((resolve) => {
      setFullText(text);
      setDisplayedText("");
      let currentIndex = 0;
  
      if (text.substring(0, displayedText.length) === displayedText) {
        currentIndex = displayedText.length;
      }

      printPromiseResolver.current = () => {
        if (displayLoop.current) {
          clearInterval(displayLoop.current);
          displayLoop.current = null;
        }
        isPrintResolved = true;
        resolve();
        printPromiseResolver.current = null;
      }
  
      displayLoop.current = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText((prevText) => {
            const result = prevText + text[currentIndex];
            currentIndex += 1;
            return result;
          });
        } else {
          printPromiseResolver.current();
        }
      }, delayMs);
    });

    await Promise.race([Promise.all([printPromise, voicePromise]), skipPromise]);
    if(!isSkipResolved && skipPromiseResolver.current) {
      skipPromiseResolver.current();
      skipPromiseResolver.current = null;
    }
    if (!isPrintResolved && displayLoop.current) {
      clearInterval(displayLoop.current);
      displayLoop.current = null;
      printPromiseResolver.current();
    }
    if (!isVoiceResolved && voicePromiseResolver.current) {
      if(voiceRef.current) {
        voiceRef.current.stop();
        voiceRef.current = null;
      }
      voicePromiseResolver.current();
      voicePromiseResolver.current = null;
    }
  }

  const isPrinting = () => {
    return displayLoop.current !== null || voiceRef.current !== null;
  }

  useImperativeHandle(ref, () => ({
    skip,
    print,
    isPrinting,
  }));

  return <span>{displayedText || placeholder}</span>;
});

ConversationText.propTypes = {
  text: string,
  onComplete: func,
  delayMs: number,
  placeholder: string,
};

ConversationText.defaultProps = {
  text: "",
  onComplete: () => {},
  delayMs: 45,
  placeholder: "...",
};

export default ConversationText;