import React from 'react';
import PropTypes from 'prop-types';
import * as styles from './ChatMessage.module.css';

function ChatMessage({
  children, 
  from,
  footer,
  userIndex,
  onClick,
  visible,
}) {

  const cloudStyleNames = Object.keys(styles).filter((key) => key.startsWith('user'))
  const cloudStyleName = cloudStyleNames[userIndex % cloudStyleNames.length];

  const boxStyle = userIndex == 0 ? styles.messageBoxLeft : styles.messageBoxRight;

  return (
    <div className={[styles.messageBox, boxStyle].join(' ')} onClick={onClick} style={{ display: visible ? 'block' : 'none' }}>
      <div className={styles.messageHeader}>{from}</div>
      <div className={[styles.messageCloud, styles[cloudStyleName]].join(' ')}>
        {children}
      </div>
      <div className={styles.messageFooter}>{footer}</div>
    </div>
  );
}

ChatMessage.propTypes = {
  children: PropTypes.node.isRequired,
  from: PropTypes.string,
  userIndex: PropTypes.number,
  onClick: PropTypes.func,
  visible: PropTypes.bool,
  footer: PropTypes.string,
};
ChatMessage.defaultProps = {
  from: 'Unknown',
  userIndex: 0,
  onClick: () => {},
  visible: true,
  footer: '',
};

export default ChatMessage;