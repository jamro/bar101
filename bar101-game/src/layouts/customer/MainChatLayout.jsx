import React, { useState, useEffect } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

const MSG_DELAY = 100

export default function MainChatLayout({ customer, chat, onTrustChange, drink, onClose }) {
 
  const [chatOptions, setChatOptions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("serve");
 
  const getTrustIndex = (trust) => {
    return Math.round((trust + 1) * 2)
  }

  const scheduleMessage = (text, from, userIndex, ms) => setTimeout(() => {
    setMessages((prevMessages) => ([ ...prevMessages, { text, from, userIndex} ]))
  }, ms)

  const scheduleMessageSeries = (textList, from, userIndex, ms, onEnd=()=>{}) => {
    textList.forEach((text, index) => {
      scheduleMessage(text, from, userIndex, ms * (index+1))
    })
    setTimeout(() => {
      onEnd()
    }, ms * (textList.length + 1))
  }

  useEffect(() => {
    scheduleMessage(chat.main.main.opener, "Alex", 1, 1)
    const mainVariant = chat.main.main.variants[getTrustIndex(customer.trust)]
    scheduleMessageSeries(mainVariant, customer.name, 0, MSG_DELAY, () => {
      setChatOptions([
        "Be empathetic",
        "Push for info",
      ])
    })
    setPhase("followup")

  }, [customer.id])

  const sendMessage = (index) => {
    switch(phase) {
      case "followup":
        setChatOptions([])
        if (index === 0) { // Be empathetic
          scheduleMessage(chat.main.emotional.opener, "Alex", 1, 1)
          onTrustChange(+0.1)
          const emotionalVariant = chat.main.emotional.variants[getTrustIndex(customer.trust)]
          scheduleMessageSeries(emotionalVariant, customer.name, 0, MSG_DELAY, () => {
            setChatOptions(["Continue"])
            setPhase("exit")
          })
        } else if (index === 1) { // Push for info
          onTrustChange(-0.1)
          scheduleMessage(chat.main.factual.opener, "Alex", 1, 1)
          const informationalVariant = chat.main.factual.variants[getTrustIndex(customer.trust)]
          scheduleMessageSeries(informationalVariant, customer.name, 0, MSG_DELAY, () => {
            setChatOptions(["Continue"])
            setPhase("exit")
          })
        }

        break;
      case "exit":
        setChatOptions([])
        scheduleMessage(`...`, customer.name, 0, 1)
        setTimeout(() => onClose(), 700)
        break;

      default:
        console.error("Unknown phase", phase)
  }}
  
  return <div className="container">
    <CustomerPreview id={customer.id} name={customer.name} trust={customer.trust} drink={drink}>
      <ChatWindow options={chatOptions} messages={messages} onSubmit={(index) => sendMessage(index)} />
    </CustomerPreview>
  </div>
}
