import * as styles from './ChatWindow.module.css';
import ChatInput from './ChatInput';
import ChatSubmitButton from './ChatSubmitButton';
import ChatMessage from './ChatMessage';
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import PropTypes from 'prop-types';
import ConversationText from './ConversationText';

const ChatWindow = forwardRef(({
    options, 
    onSubmit,
    children,
    inputHeader
  }, ref) => {
  const [from, setFrom] = useState("");
  const [userIndex, setUserIndex] = useState(0);
  const [promptContinue, setPromptContinue] = useState(false);
  const convoRef = useRef(null);
  const chatCompleteResolver = useRef(null);

  let buttons = options.map((option, key) => (
    <ChatSubmitButton key={key} onClick={() => onSubmit(key)} label={option} />
  ));

  if (children) {
    buttons = children
  }

  if (inputHeader) {
    buttons = <div>
      <div className={styles.headerTitle}>{inputHeader}</div>
      <div class={styles.buttonsJustify} >{buttons}</div>
    </div>
  }

  const handleComplete = () => {
    if (convoRef.current && convoRef.current.isPrinting()) {
      convoRef.current.skip();
    } else if (chatCompleteResolver.current) {
      chatCompleteResolver.current();
      chatCompleteResolver.current = null;
    }
  }

  const print = async (text, fromName, fromId, userIndex, autoComplete=false) => {
    setFrom(fromName);
    setUserIndex(userIndex);
    setPromptContinue(false);
    if (!convoRef.current) {
      console.error("convoRef is not set");
      return;
    }
    if (autoComplete) {
      await convoRef.current.print(text, fromId)
    } else {
      const chatCompletePromise = new Promise((resolve) => {
        chatCompleteResolver.current = resolve;
      });
      const chatPrintPromise = new Promise(async (resolve) => { 
        await convoRef.current.print(text, fromId)
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
  inputHeader: PropTypes.string,
};
ChatWindow.defaultProps = {
  onSubmit: () => {},
  options: [],
  inputHeader: "",
};

export default ChatWindow;