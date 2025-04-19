import React, { useState, useEffect, useRef } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

export default function OpenerLayout({ customer, allCustomers, chat, drink, serveUsual, onGoBack, onTrustChange, onClose }) {
  const [chatOptions, setChatOptions] = useState([]);
  const [phase, setPhase] = useState("serve");
  const [openerQuestions, setOpenerQuestions] = useState([]);
  const chatWindowRef = useRef(null);

  const getTrustIndex = (trust) => {
    return Math.round((trust + 1) * 2)
  }

  useEffect(() => {
    const run = async () => {
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
      
      await chatWindowRef.current.print(`Here you go, enjoy!`, "Alex", 1)
      if (drink.id == customer.drink) {
        if(serveUsual) {
          onTrustChange(+0.1)
        }
        await chatWindowRef.current.print(`Thanks!`, customer.name, 0, true)

        setChatOptions(openers.map(o => o.label))
        setPhase("opener")
      } else {
        onTrustChange(-0.1)
        await chatWindowRef.current.print(`Sorry, this isn't what I wanted. Can I get ${customer.drink} please?`, customer.name, 0)
        setChatOptions(["Fix it"])
        setPhase("goBack")
      }
    };
    run()
  }, [customer.id, drink])

  const sendMessage = async (index) => {
    switch(phase) {

      case "goBack":
        setChatOptions([])
        await chatWindowRef.current.print(`Oops, my bad - one ${customer.drink} coming up!`, "Alex", 1)
        onGoBack()
        break;

      case "opener":
        const question = openerQuestions[index]
        setChatOptions([])
        await chatWindowRef.current.print(`${question.text}`, "Alex", 1)
        if (question.id !== "neutral" && question.id !== customer.hobby_id) {
          onTrustChange(-0.1)
          await chatWindowRef.current.print(chat.opener.wrong_hobby_answer, customer.name, 0, true)
          setPhase("exit")
          setChatOptions(["Continue", "Stay quiet"])
          return;
        }
        if (question.id === "neutral") {
          const neutralAnswer = chat.opener.neutral_answer[getTrustIndex(customer.trust)]
          for (let i = 0; i < neutralAnswer.length; i++) {
            await chatWindowRef.current.print(neutralAnswer[i], customer.name, 0, i === neutralAnswer.length - 1)
          }
          setPhase("exit")
          setChatOptions(["Continue", "Stay quiet"])
          return
        }
        if (question.id === customer.hobby_id) {
          const hobbyAnswer = chat.opener.hobby_answer[getTrustIndex(customer.trust)]
          onTrustChange(+0.1)
          for (let i = 0; i < hobbyAnswer.length; i++) {
            await chatWindowRef.current.print(hobbyAnswer[i], customer.name, 0, i === hobbyAnswer.length - 1)
          }
          setPhase("exit")
          setChatOptions(["Continue", "Stay quiet"])
          return
        }

        break;

      case "exit":
        setChatOptions([])
        onClose(index === 1)
        break;

      default:
        console.error("Unknown phase", phase)
  }}
  
  return <div className="container">
    <CustomerPreview id={customer.id} name={customer.name} jobTitle={customer.job_title} trust={customer.trust} drink={drink}>
      <ChatWindow ref={chatWindowRef} options={chatOptions} onSubmit={(index) => sendMessage(index)} />
    </CustomerPreview>
  </div>
}
