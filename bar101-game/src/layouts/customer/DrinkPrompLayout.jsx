import React, { useState, useRef } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

export default function DrinkPrompLayout({ bartender, customer, onClose }) {
  const drinkQuestions = ['What can I get you?', 'The usual?'] 
  const [chatOptions, setChatOptions] = useState([...drinkQuestions]);
  const [phase, setPhase] = useState("ask");
  const chatWindowRef = useRef(null);
  const [serveUsual, setServeUsual] = useState(false);
    

  const getTrustIndex = (trust) => {
    return Math.round((trust + 1) * 2)
  }

  const arrRnd = (arr) => {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  const arrTrust = (arr, customer) => {
    const trustIndex = getTrustIndex(customer.trust)
    return arr[trustIndex]
  }

  const sendMessage = async (index) => {
    if (phase === "exit") {
      setChatOptions([])
      await chatWindowRef.current.print(arrRnd(bartender.phrases.confirm_drink), "Alex", 1)
      onClose(serveUsual)
      return
    }

    setChatOptions([])

    if (index === 0) { // "What can I get you?"
      await chatWindowRef.current.print(arrRnd(bartender.phrases.ask_for_drink), "Alex", 1) 
      await chatWindowRef.current.print(arrTrust(customer.phrases.drink, customer), customer.name, 0, true)
      setServeUsual(false)
    } else { // "The usual?"
      await chatWindowRef.current.print(arrRnd(bartender.phrases.ask_for_the_usual), "Alex", 1)
      await chatWindowRef.current.print(arrTrust(customer.phrases.the_usual, customer), customer.name, 0, true)
      setServeUsual(true)
    }

    setChatOptions(["OK"])
    setPhase("exit")
  }

  return <div className="container">
    <CustomerPreview id={customer.id} name={customer.name} jobTitle={customer.job_title} trust={customer.trust}>
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