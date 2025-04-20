import React, { useState, useEffect, useRef } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

export default function MainChatLayout({ customer, chat, onTrustChange, drink, onClose }) {
 
  const [chatOptions, setChatOptions] = useState([]);
  const [phase, setPhase] = useState("serve");
  const chatWindowRef = useRef(null);
 
  const getTrustIndex = (trust) => {
    return Math.round((trust + 1) * 2)
  }

  useEffect(() => {
    const run = async () => {
      await chatWindowRef.current.print(chat.main.main.opener, "Alex", 1)
      const mainVariant = chat.main.main.variants[getTrustIndex(customer.trust)]
      for (let i = 0; i < mainVariant.length; i++) {
        await chatWindowRef.current.print(mainVariant[i], customer.name, 0, i === mainVariant.length - 1)
      }
      setChatOptions([
        "Be empathetic",
        "Push for info",
      ])
      setPhase("followup")
    }
    run()
  }, [customer.id])

  const sendMessage = async (index) => {
    switch(phase) {
      case "followup":
        setChatOptions([])
        if (index === 0) { // Be empathetic
          onTrustChange(+0.1)
          await chatWindowRef.current.print(chat.main.emotional.opener, "Alex", 1)
          const emotionalVariant = chat.main.emotional.variants[getTrustIndex(customer.trust)]
          for (let i = 0; i < emotionalVariant.length; i++) {
            await chatWindowRef.current.print(emotionalVariant[i], customer.name, 0, i === emotionalVariant.length - 1)
          }
          setChatOptions(["Continue"])
          setPhase("exit")
        } else if (index === 1) { // Push for info
          const trustThreshold = 0.75
          const maxtrustPenalty = 0.2
          if(customer.trust < maxtrustPenalty) {
            const trustChange = -maxtrustPenalty*(1-(customer.trust+1)/(trustThreshold+1))
            onTrustChange(trustChange)
          }
          await chatWindowRef.current.print(chat.main.factual.opener, "Alex", 1)
          const informationalVariant = chat.main.factual.variants[getTrustIndex(customer.trust)]
          for (let i = 0; i < informationalVariant.length; i++) {
            await chatWindowRef.current.print(informationalVariant[i], customer.name, 0, i === informationalVariant.length - 1)
          }
          setChatOptions(["Continue"])
          setPhase("exit")
        }

        break;
      case "exit":
        setChatOptions([])
        onClose()
        break;

      default:
        console.error("Unknown phase", phase)
  }}
  
  return <div className="container">
    <CustomerPreview customer={customer} drink={drink}>
      <ChatWindow ref={chatWindowRef} options={chatOptions} onSubmit={(index) => sendMessage(index)} />
    </CustomerPreview>
  </div>
}
