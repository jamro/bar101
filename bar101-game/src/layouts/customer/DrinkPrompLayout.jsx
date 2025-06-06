import React, { useState, useRef } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

export default function DrinkPrompLayout({ bartender, customer, balance, onClose, onExit }) {
  const drinkQuestions = ['What can I get you?', 'The usual?'] 
  const [chatOptions, setChatOptions] = useState([...drinkQuestions]);
  const [chatInputHeader, setChatInputHeader] = useState("ASK FOR ORDER");
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
      setChatInputHeader("")
      await chatWindowRef.current.print(arrRnd(bartender.phrases.confirm_drink), "Alex", "aradan", 1)
      onClose(serveUsual)
      return
    }
    setChatInputHeader("")
    setChatOptions([])

    if (index === 0) { // "What can I get you?"
      await chatWindowRef.current.print(arrRnd(bartender.phrases.ask_for_drink), "Alex", "aradan", 1) 
      await chatWindowRef.current.print(arrTrust(customer.phrases.drink, customer), customer.name, customer.id, 0, true)
      setServeUsual(false)
    } else { // "The usual?"
      await chatWindowRef.current.print(arrRnd(bartender.phrases.ask_for_the_usual), "Alex", "aradan", 1)
      await chatWindowRef.current.print(arrTrust(customer.phrases.the_usual, customer), customer.name, customer.id, 0, true)
      setServeUsual(true)
    }

    setChatInputHeader("PREPARE DRINK")
    setChatOptions(["OK, I'll get it ready"])
    setPhase("exit")
  }

  return <CustomerPreview customer={customer} customerAnim={true} balance={balance} bartender={bartender} onExit={onExit} >
      <ChatWindow ref={chatWindowRef} options={chatOptions} onSubmit={(index) => sendMessage(index)} inputHeader={chatInputHeader} />
    </CustomerPreview>
}

DrinkPrompLayout.propTypes = {
  bartender: PropTypes.object.isRequired,
  customer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    trust: PropTypes.number.isRequired,
    drink: PropTypes.string.isRequired,
  }).isRequired,
  balance: PropTypes.number.isRequired,
  onClose: PropTypes.func,
  onExit: PropTypes.func
};

DrinkPrompLayout.defaultProps = {
  onClose: () => {},
  onExit: () => {}
};