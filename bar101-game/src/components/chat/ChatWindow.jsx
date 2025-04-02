import * as styles from './ChatWindow.module.css';
import ChatInput from './ChatInput';
import ChatSubmitButton from './ChatSubmitButton';
import ChatMessage from './ChatMessage';
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function ChatWindow({messages, onSubmit}) {
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

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatContent} ref={chatContentRef}>
        {chatMessages}
      </div>
      <div className={styles.chatFooter}>
        <ChatInput >
          <ChatSubmitButton onClick={onSubmit} />
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
};
ChatWindow.defaultProps = {
  messages: [],
  onSubmit: () => {},
};

export default ChatWindow;