import React, { useState, useEffect } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

const MSG_DELAY = 100

export default function OpenerLayout({ customer, allCustomers, chat, drink, onGoBack, onTrustChange, onClose }) {
 
  const [chatOptions, setChatOptions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("serve");
  const [openerQuestions, setOpenerQuestions] = useState([]);

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

    let openers = []

    openers.push({
      id: customer.hobby_id,
      label: "Ask about hobby: " + customer.hobby_id,
      text: customer.openers[Math.floor(Math.random() * customer.openers.length)]
    })

    let safty = 100
    while (openers.length < 3) {
      if (--safty < 0) {
        throw new Error("Infinite loop detected")
      }
      const allCustomersArray = Object.values(allCustomers)
      const randomCustomer = allCustomersArray[Math.floor(Math.random() * allCustomersArray.length)]
      if (randomCustomer.id === customer.id) {
        continue;
      }
      if(openers.find(o => o.id === randomCustomer.hobby_id)) {
        continue;
      }
      openers.push({
        id: randomCustomer.hobby_id,
        label: "Ask about hobby: " + randomCustomer.hobby_id,
        text: randomCustomer.openers[Math.floor(Math.random() * randomCustomer.openers.length)]
      })
    }

    // shuffle the openers
    openers = openers.sort(() => Math.random() - 0.5)

    openers.unshift({
      id: "neutral",
      label: "Tak about something neutral",
      text: chat.opener.questions.neutral
    })
    setOpenerQuestions(openers)

    scheduleMessage(`Here you go, enjoy!`, "Alex", 1, MSG_DELAY)
    if (drink.id == customer.drink) {
      scheduleMessage('Thanks!', customer.name, 0, 2*MSG_DELAY)
      onTrustChange(+0.1)
      setTimeout(() => {
        setChatOptions(openers.map(o => o.label))
        setPhase("opener")
      }, 3*MSG_DELAY)
    } else {
      scheduleMessage(`Sorry, this isn't what I ordered.`, customer.name, 0, 2*MSG_DELAY)
      scheduleMessage(`I asked for ${customer.drink}.`, customer.name, 0, 3*MSG_DELAY)
      setTimeout(() => onTrustChange(-0.1), 3*MSG_DELAY)
      scheduleMessage(`could you fix it?`, customer.name, 0, 4*MSG_DELAY)
      setTimeout(() => {
        setChatOptions(["Fix it"])
        setPhase("goBack")
      }, 5*MSG_DELAY)
    }
  }, [customer.id, drink])

  const sendMessage = (index) => {
    switch(phase) {

      case "goBack":
        setChatOptions([])
        scheduleMessage(`Oops, my bad - one ${customer.drink} coming up!`, "Alex", 1, 1)
        setTimeout(() => {
          onGoBack()
        }, 1300)
        break;

      case "opener":
        const question = openerQuestions[index]
        setChatOptions([])
        scheduleMessage(`${question.text}`, "Alex", 1, 1)
        if (question.id !== "neutral" && question.id !== customer.hobby_id) {
          scheduleMessage(chat.opener.wrong_hobby_answer, customer.name, 0, MSG_DELAY)
          setTimeout(() => {
            onTrustChange(-0.1)
          }, MSG_DELAY)
          setPhase("exit")
          setChatOptions(["Continue", "Skip"])
          return;
        }
        if (question.id === "neutral") {
          const neutralAnswer = chat.opener.neutral_answer[getTrustIndex(customer.trust)]
          scheduleMessageSeries(neutralAnswer, customer.name, 0, MSG_DELAY, () => {
            setPhase("exit")
            setChatOptions(["Continue", "Skip"])
          })
          return
        }
        if (question.id === customer.hobby_id) {
          const hobbyAnswer = chat.opener.hobby_answer[getTrustIndex(customer.trust)]
          onTrustChange(+0.1)
          scheduleMessageSeries(hobbyAnswer, customer.name, 0, MSG_DELAY, () => {
            setPhase("exit")
            setChatOptions(["Continue", "Skip"])
          })
          return
        }

        break;

      case "exit":
        setChatOptions([])
        scheduleMessage(`...`, customer.name, 0, 1)
        setTimeout(() => onClose(index === 1), 700)
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
