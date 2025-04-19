import React, { useState, useRef } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

export default function DrinkPrompLayout({ customer, onClose }) {
  const drinkQuestions = ['What can I get you?', 'The usual?']
  const [chatOptions, setChatOptions] = useState([...drinkQuestions]);
  const [phase, setPhase] = useState("ask");
  const chatWindowRef = useRef(null);
  const [serveUsual, setServeUsual] = useState(false);
    
  const sendMessage = async (index) => {
    if (phase === "exit") {
      setChatOptions([])
      await chatWindowRef.current.print("You got it - one moment.", "Alex", 1)
      onClose(serveUsual)
      return
    }

    setChatOptions([])

    if (index === 0) {
      await chatWindowRef.current.print(drinkQuestions[index], "Alex", 1)
      await chatWindowRef.current.print(`I would like ${customer['drink']}, please.`, customer.name, 0, true)
      setServeUsual(false)
    } else {
      await chatWindowRef.current.print(drinkQuestions[index], "Alex", 1)
      await chatWindowRef.current.print("Yes, the usual.", customer.name, 0, true)
      setServeUsual(true)
    }

    setChatOptions(["OK"])
    setPhase("exit")
  }

  return <div className="container">
    <CustomerPreview id={customer.id} name={customer.name} trust={customer.trust}>
      <ChatWindow ref={chatWindowRef} options={chatOptions} onSubmit={(index) => sendMessage(index)} />
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