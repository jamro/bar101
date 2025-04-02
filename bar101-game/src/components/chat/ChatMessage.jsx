import React from 'react';
import PropTypes from 'prop-types';
import * as styles from './ChatMessage.module.css';

function ChatMessage({
  children, 
  from="Unknown",
  userIndex=0,
}) {

  const cloudStyleNames = Object.keys(styles).filter((key) => key.startsWith('user'))
  const cloudStyleName = cloudStyleNames[userIndex % cloudStyleNames.length];

  const boxStyle = userIndex == 0 ? styles.messageBoxLeft : styles.messageBoxRight;

  return (
    <div className={[styles.messageBox, boxStyle].join(' ')}>
      <div className={styles.messageHeader}>{from}</div>
      <div className={[styles.messageCloud, styles[cloudStyleName]].join(' ')}>
        {children}
      </div>
    </div>
  );
}

ChatMessage.propTypes = {
  children: PropTypes.node.isRequired,
  from: PropTypes.string,
  userIndex: PropTypes.number,
};
ChatMessage.defaultProps = {
  from: 'Unknown',
  userIndex: 0,
};

export default ChatMessage;