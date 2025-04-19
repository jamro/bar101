import { func, number, string } from "prop-types";
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";

const ConversationText = forwardRef(({ onComplete, placeholder, delayMs }, ref) => {
  const [displayedText, setDisplayedText] = useState("");
  const [fullText, setFullText] = useState("");
  const displayLoop = useRef(null);
  const skipPromiseResolver = useRef(null);
  const printPromiseResolver = useRef(null);

  const skip = () => {
    if(skipPromiseResolver.current) {
      skipPromiseResolver.current();
      skipPromiseResolver.current = null;
    }
    setDisplayedText(fullText);
  };

  const print = async (text) => {
    if(typeof text !== "string") {
      console.error("text must be a string, got " + typeof text, text);
      throw new Error("text must be a string, got " + typeof text);
    }

    if (skipPromiseResolver.current) {
      skipPromiseResolver.current();
      skipPromiseResolver.current = null;
    }
    if (printPromiseResolver.current) {
      printPromiseResolver.current();
      printPromiseResolver.current = null;
    }

    let isSkipResolved = false;
    let isPrintResolved = false;
    const skipPromise = new Promise((resolve) => {
      skipPromiseResolver.current = () => {
        isSkipResolved = true;
        resolve();
        skipPromiseResolver.current = null;
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

    await Promise.race([printPromise, skipPromise]);
    if(!isSkipResolved && skipPromiseResolver.current) {
      skipPromiseResolver.current();
      skipPromiseResolver.current = null;
    }
    if (!isPrintResolved && displayLoop.current) {
      clearInterval(displayLoop.current);
      displayLoop.current = null;
      printPromiseResolver.current();
    }
  }

  const isPrinting = () => {
    return displayLoop.current !== null;
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
  delayMs: 30,
  placeholder: "...",
};

export default ConversationText;