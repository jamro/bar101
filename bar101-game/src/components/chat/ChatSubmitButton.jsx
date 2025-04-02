import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import * as styles from './ChatSubmitButton.module.css';

function ChatSubmitButton({onClick}) {
  return (
    <button type="button" className={["btn btn-primary", styles.submitButton].join(' ')} onClick={onClick}>
      Submit <FontAwesomeIcon icon={faPaperPlane} />
    </button>

  );
}

ChatSubmitButton.propTypes = {
  onClick: PropTypes.func,
};
ChatSubmitButton.defaultProps = {
  onClick: () => {},
};

export default ChatSubmitButton;