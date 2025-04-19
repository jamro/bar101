import React, { useState, useEffect, useRef } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

const MSG_DELAY = 100

export default function GoodbyeLayout({ customer, drink, onClose }) {
 
  const chatWindowRef = useRef(null);

  useEffect(() => {
    const run = async () => {
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
      await chatWindowRef.current.print(randomGoodbye, customer.name, 1)
      await chatWindowRef.current.print("See you around!", "Alex", 0)

      onClose()
    }
    run()

  }, [customer.id, drink])
  
  return <div className="container">
    <CustomerPreview id={customer.id} name={customer.name} trust={customer.trust} drink={drink}>
      <ChatWindow ref={chatWindowRef} />
    </CustomerPreview>
  </div>
}
