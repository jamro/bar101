import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import * as styles from './ChatSubmitButton.module.css';

function ChatSubmitButton({onClick, label}) {
  return (
    <div className={styles.chatButtonContainer}>
      <button type="button" className={["btn btn-primary", styles.submitButton].join(' ')} onClick={onClick}>
        {label} <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </div>
  );
}

ChatSubmitButton.propTypes = {
  onClick: PropTypes.func,
  label: PropTypes.string,
};
ChatSubmitButton.defaultProps = {
  onClick: () => {},
  label: 'Send',
};

export default ChatSubmitButton;