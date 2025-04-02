import React from 'react';
import PropTypes from 'prop-types';
import * as styles from './ChatInput.module.css';

function ChatInput({children}) {
  return (
    <div className={styles.chatInput}>
      {children}
    </div>
  );
}

ChatInput.propTypes = {
  children: PropTypes.node.isRequired,
};
ChatInput.defaultProps = {
  children: null,
};

export default ChatInput;