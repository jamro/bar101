import React, { useState, useEffect, useRef } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

const hobbyNames = {
  origami: "Origami",
  typewriter: "Old Typewriters",
  fpv_drone: "FPV Drones",
  urban_exploration: "Urban Exploration",
  political_literature: "Literature",
  analog_photography: "Photography",
}

const DRINK_PRICE = 16

export default function OpenerLayout({ bartender, customer, allCustomers, chat, drink, balance, serveUsual, onBalanceChange, onGoBack, onTrustChange, onClose }) {
  const [chatOptions, setChatOptions] = useState([]);
  const [phase, setPhase] = useState("serve");
  const [openerQuestions, setOpenerQuestions] = useState([]);
  const chatWindowRef = useRef(null);

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

  useEffect(() => {
    const run = async () => {
      if(drink.special) {
        await chatWindowRef.current.print(arrRnd(bartender.phrases.enjoy_special), "Alex", "aradan", 1)
      } else {
        await chatWindowRef.current.print(arrRnd(bartender.phrases.enjoy), "Alex", "aradan", 1)
      }

      if (drink.id == customer.drink && drink.quality > 0) {
        let trustBump = 0
        if(serveUsual) {
          trustBump += 0.2
        }
        if(drink.special) {
          trustBump += 0.2
        }
        onTrustChange(trustBump)
        if(drink.special) {
          await chatWindowRef.current.print(arrRnd(customer.phrases.thanks_special, customer), customer.name, customer.id, 0, true)
        } else {
          await chatWindowRef.current.print(arrRnd(customer.phrases.thanks, customer), customer.name, customer.id, 0, true)
        }
        setChatOptions([`That'll be $${DRINK_PRICE.toFixed(2)}`, "On the house."])
        setPhase("charge")
      } else {
        onTrustChange(-0.2)
        await chatWindowRef.current.print(arrRnd(customer.phrases.wrong_drink, customer), customer.name, customer.id, 0)
        setChatOptions(["Fix it"])
        setPhase("goBack")
      }
    };
    run()
  }, [customer.id, drink])

  const sendMessage = async (index) => {
    switch(phase) {

      case "charge":
        setChatOptions([])
        if(index === 0) { // charge
          await chatWindowRef.current.print(arrRnd(bartender.phrases.charge), "Alex", "aradan", 1)
          onBalanceChange(DRINK_PRICE + 1 + Math.round(DRINK_PRICE*0.3*drink.quality))
          await chatWindowRef.current.print(arrRnd(customer.phrases.charge_tip, customer), customer.name, customer.id, 0, true)
        } else { // on the house
          await chatWindowRef.current.print(arrRnd(bartender.phrases.on_house), "Alex", "aradan", 1)
          onTrustChange(+0.2)
          await chatWindowRef.current.print(arrRnd(customer.phrases.charge_free, customer), customer.name, customer.id, 0, true)
        }

        let openers = []

        openers.push({
          id: customer.hobby_id,
          label: hobbyNames[customer.hobby_id],
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
            label: hobbyNames[randomCustomer.hobby_id],
            text: randomCustomer.openers[Math.floor(Math.random() * randomCustomer.openers.length)]
          })
        }
    
        // shuffle the openers
        openers = openers.sort(() => Math.random() - 0.5)
    
        openers.unshift({
          id: "neutral",
          label: "Neutral Topic",
          text: chat.opener.questions.neutral
        })
        setOpenerQuestions(openers)
        
        setChatOptions(openers.map(o => o.label))
        setPhase("opener")
        break;

      case "goBack":
        setChatOptions([])
        await chatWindowRef.current.print(arrRnd(bartender.phrases.fix_drink), "Alex", "aradan", 1) 
        onGoBack()
        break;

      case "opener":
        const question = openerQuestions[index]
        setChatOptions([])
        await chatWindowRef.current.print(`${question.text}`, "Alex", "aradan", 1)
        if (question.id !== "neutral" && question.id !== customer.hobby_id) {
          onTrustChange(-0.2)
          await chatWindowRef.current.print(chat.opener.wrong_hobby_answer, customer.name, customer.id, 0, true)
          setPhase("exit")
          setChatOptions(["Continue", "Stay quiet"])
          return;
        }
        if (question.id === "neutral") {
          const neutralAnswer = chat.opener.neutral_answer[getTrustIndex(customer.trust)]
          for (let i = 0; i < neutralAnswer.length; i++) {
            await chatWindowRef.current.print(neutralAnswer[i], customer.name, customer.id, 0, i === neutralAnswer.length - 1)
          }
          setPhase("exit")
          setChatOptions(["Continue", "Stay quiet"])
          return
        }
        if (question.id === customer.hobby_id) {
          const hobbyAnswer = chat.opener.hobby_answer[getTrustIndex(customer.trust)]
          onTrustChange(+0.2)
          for (let i = 0; i < hobbyAnswer.length; i++) {
            await chatWindowRef.current.print(hobbyAnswer[i], customer.name, customer.id, 0, i === hobbyAnswer.length - 1)
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
  
  return <CustomerPreview customer={customer} drink={drink} drinkAnim={true} balance={balance} bartender={bartender} >
      <ChatWindow ref={chatWindowRef} options={chatOptions} onSubmit={(index) => sendMessage(index)} />
    </CustomerPreview>
}
