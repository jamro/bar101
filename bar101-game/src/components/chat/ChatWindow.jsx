import * as styles from './ChatWindow.module.css';
import ChatInput from './ChatInput';
import ChatSubmitButton from './ChatSubmitButton';
import ChatMessage from './ChatMessage';
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function ChatWindow({messages, options, onSubmit}) {
  const chatContentRef = useRef(null);
  const chatMessages = messages.map((msg, key) => (
    <ChatMessage key={key} userIndex={msg.userIndex} from={msg.from}>{msg.text}</ChatMessage>
  ))

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }
  , [messages]);


  const buttons = options.map((option, key) => (
    <ChatSubmitButton key={key} onClick={() => onSubmit(key)} label={option} />
  ));

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatContent} ref={chatContentRef}>
        {chatMessages}
      </div>
      <div className={styles.chatFooter}>
        <ChatInput >
          {buttons}
        </ChatInput>
      </div>
    </div>
  );
}

ChatWindow.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      from: PropTypes.string.isRequired,
      unserIndex: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
    })
  ),
  onSubmit: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.string),
};
ChatWindow.defaultProps = {
  messages: [],
  onSubmit: () => {},
  options: [],
};

export default ChatWindow;