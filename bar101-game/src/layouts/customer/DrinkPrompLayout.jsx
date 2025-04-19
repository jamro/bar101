import React, { useState } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

const MSG_DELAY = 100

export default function DrinkPrompLayout({ customer, onClose }) {
  const drinkQuestions = ['What can I get you?', 'The usual?']

  const [chatOptions, setChatOptions] = useState([...drinkQuestions]);
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("ask");

  const scheduleMessage = (text, from, userIndex, ms) => setTimeout(() => {
    setMessages((prevMessages) => ([
      ...prevMessages,
      { text, from, userIndex},
    ]))
  }, ms)
    
  
  const sendMessage = (index) => {
    if (phase === "exit") {
      setChatOptions([])
      setMessages((prevMessages) => ([
        ...prevMessages,
        { text: "You got it - one moment.", from: "Alex", userIndex: 1 },
      ]))
      setTimeout(() => onClose(), 2*MSG_DELAY)
      return
    }

    setChatOptions([])
    setMessages((prevMessages) => ([
      ...prevMessages,
      { text: drinkQuestions[index], from: "Alex", userIndex: 1 },
    ]))

    if (index === 0) {
      scheduleMessage(`I would like ${customer['drink']}, please.`, customer.name, 0, MSG_DELAY)
    } else {
      scheduleMessage("Yes, the usual.", customer.name, 0, MSG_DELAY)
    }

    setTimeout(() => {
      setChatOptions(["OK"])
      setPhase("exit")
    }, 2*MSG_DELAY)

  }

  return <div className="container">
    <CustomerPreview id={customer.id} name={customer.name} trust={customer.trust}>
      <ChatWindow options={chatOptions} messages={messages} onSubmit={(index) => sendMessage(index)} />
    </CustomerPreview>
  </div>
}

DrinkPrompLayout.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    trust: PropTypes.number.isRequired,
    drink: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func,
};
DrinkPrompLayout.defaultProps = {
  onClose: () => {},
};