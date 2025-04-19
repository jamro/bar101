import * as styles from './ChatWindow.module.css';
import ChatInput from './ChatInput';
import ChatSubmitButton from './ChatSubmitButton';
import ChatMessage from './ChatMessage';
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import PropTypes from 'prop-types';
import ConversationText from './ConversationText';

const ChatWindow = forwardRef(({options, onSubmit}, ref) => {
  const [from, setFrom] = useState("");
  const [userIndex, setUserIndex] = useState(0);
  const [promptContinue, setPromptContinue] = useState(false);
  const convoRef = useRef(null);
  const chatCompleteResolver = useRef(null);

  const buttons = options.map((option, key) => (
    <ChatSubmitButton key={key} onClick={() => onSubmit(key)} label={option} />
  ));

  const handleComplete = () => {
    if (convoRef.current && convoRef.current.isPrinting()) {
      convoRef.current.skip();
    } else if (chatCompleteResolver.current) {
      chatCompleteResolver.current();
      chatCompleteResolver.current = null;
    }
  }

  const print = async (text, from, userIndex, autoComplete=false) => {
    setFrom(from);
    setUserIndex(userIndex);
    setPromptContinue(false);
    if (!convoRef.current) {
      console.error("convoRef is not set");
      return;
    }
    if (autoComplete) {
      await convoRef.current.print(text)
    } else {
      const chatCompletePromise = new Promise((resolve) => {
        chatCompleteResolver.current = resolve;
      });
      const chatPrintPromise = new Promise(async (resolve) => { 
        await convoRef.current.print(text)
        setPromptContinue(true);
        resolve();
      });
      await Promise.all([chatPrintPromise, chatCompletePromise]);
    }
  }

  useImperativeHandle(ref, () => ({
    print
  }));

  return (
    <div className={styles.chatWindow}>
      <ChatMessage userIndex={userIndex} from={from} onClick={() => handleComplete()} visible={from} footer={(promptContinue && chatCompleteResolver) ? "(Tap to continue)" : ""}>
        <ConversationText ref={convoRef} />
      </ChatMessage>
      <ChatInput >
        {buttons}
      </ChatInput>
    </div>
  );
})

ChatWindow.propTypes = {
  onSubmit: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.string),
};
ChatWindow.defaultProps = {
  onSubmit: () => {},
  options: [],
};

export default ChatWindow;