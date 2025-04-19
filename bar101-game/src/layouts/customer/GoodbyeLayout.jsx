import React, { useState, useEffect } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

const MSG_DELAY = 100

export default function GoodbyeLayout({ customer, drink, onClose }) {
 
  const [chatOptions, setChatOptions] = useState([]);
  const [messages, setMessages] = useState([]);

  const scheduleMessage = (text, from, userIndex, ms) => setTimeout(() => {
    setMessages((prevMessages) => ([ ...prevMessages, { text, from, userIndex} ]))
  }, ms)
  
  useEffect(() => {
    const goodbyeMessages = [
      "Alright, I should get going. Thanks for the chat!",
      "Time for me to head out - take care!",
      "Gotta run, but it was good talking with you.",
	    "Thanks for the drink and the company. Catch you next time!",
      "I have to run, but I had a great time. See you around!",
      "I should probably get going. Thanks for the drink!",
      "Thanks for the chat! I had a great time.",
      "I should get going now. Thanks for the drink!",
      "Thanks for the drink! I should get going now.",
      "Thanks for the chat! I had a great time.",
    ]
    const randomGoodbye = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)]
    scheduleMessage(randomGoodbye, customer.name, 1, MSG_DELAY)
    scheduleMessage("See you around!", "Alex", 0, 2*MSG_DELAY)
    setTimeout(() => {
      onClose()
    }, 2000)

  }, [customer.id, drink])
  

  const sendMessage = (index) => {
    
    
  }
  
  return <div className="container">
    <CustomerPreview id={customer.id} name={customer.name} trust={customer.trust} drink={drink}>
      <ChatWindow options={chatOptions} messages={messages} onSubmit={(index) => sendMessage(index)} />
    </CustomerPreview>
  </div>
}
