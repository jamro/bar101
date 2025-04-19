import React, { useState, useEffect } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

const MSG_DELAY = 100

export default function DilemmaLayout({ customer, chat, onTrustChange, drink, onClose, onDecision }) {
 
  const [chatOptions, setChatOptions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("serve");
  const [beliefsA, setBeliefsA] = useState(chat.decision.belief_a)
  const [beliefsB, setBeliefsB] = useState(chat.decision.belief_b)
  const [currentBelief, setCurrentBelief] = useState(null)
  const [lastChoice, setLastChoice] = useState(chat.decision.dilemma.preference)
  const [beliefScoreA, setBeliefScoreA] = useState(0)
  const [beliefScoreB, setBeliefScoreB] = useState(0)

  const popRandomBelief = (variant) => {
    let beliefs, setBeliefs
    if (variant.toLowerCase() === 'a') {
      beliefs = beliefsA
      setBeliefs = setBeliefsA
    } else {
      beliefs = beliefsB
      setBeliefs = setBeliefsB
    }

    if (beliefs.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * beliefs.length)
    const belief = beliefs[randomIndex]
    setBeliefs(beliefs.filter(b => b !== belief))
    return belief
  }
 
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
    scheduleMessage(chat.decision.dilemma.opener, "Alex", 1, 1)
    const mainVariant = chat.decision.dilemma.variants[getTrustIndex(customer.trust)]

    const initBelief = popRandomBelief(chat.decision.dilemma.preference)
    setLastChoice(chat.decision.dilemma.preference)
    setCurrentBelief(initBelief)

    scheduleMessageSeries([...mainVariant, "...", ...initBelief.monologue], customer.name, 0, MSG_DELAY, () => {
      setChatOptions(["Support", "Doubt"])
      setPhase("followup")
    })

  }, [customer.id])

  const sendMessage = (index) => {
    switch(phase) {
      case "followup":
        const setBeliefScore = (lastChoice === "a") ? setBeliefScoreA : setBeliefScoreB
        const alternativeChoice = (lastChoice === "a") ? "b" : "a"
        setChatOptions([])

        let nextChoice
        let dilemmaResponse
        if (index === 0) { // Support
          setBeliefScore(prev => prev + 1)
          nextChoice = lastChoice
          dilemmaResponse = currentBelief.supportive_response
        } else { // Doubt
          setBeliefScore(prev => prev - 1)
          nextChoice = alternativeChoice
          dilemmaResponse = currentBelief.challenging_response
        }
        const nextBeleif = popRandomBelief(nextChoice)
        if (nextBeleif === null) {
          scheduleMessageSeries([...dilemmaResponse], "Alex", 1, MSG_DELAY, () => {
            setChatOptions(["Continue"])
            setPhase("decision")
          })
          return
        }

        setLastChoice(nextChoice)
        setCurrentBelief(nextBeleif)

        scheduleMessageSeries([...dilemmaResponse], "Alex", 1, MSG_DELAY, () => {
          scheduleMessageSeries([...nextBeleif.monologue], customer.name, 0, MSG_DELAY, () => {
            setChatOptions(["Support", "Doubt"])
            setPhase("followup")
          })
        })
        break;
      case "decision":
        const trustLevel = getTrustIndex(customer.trust)
        const scoreDiff = Math.abs(beliefScoreA - beliefScoreB)
        let influenced = false
        let decision = chat.decision.dilemma.preference

        if (trustLevel === 0 && scoreDiff >= 5) {
          decision = (beliefScoreA > beliefScoreB) ? "a" : "b"
          influenced = true
        } else if (trustLevel === 1 && scoreDiff >= 4) {
          decision = (beliefScoreA > beliefScoreB) ? "a" : "b"
          influenced = true
        } else if (trustLevel === 2 && scoreDiff >= 3) {
          decision = (beliefScoreA > beliefScoreB) ? "a" : "b"
          influenced = true
        } else if (trustLevel === 3 && scoreDiff >= 2) {
          decision = (beliefScoreA > beliefScoreB) ? "a" : "b"
          influenced = true
        } else if (trustLevel === 4 && scoreDiff >= 1) {
          decision = (beliefScoreA > beliefScoreB) ? "a" : "b"
          influenced = true
        }
        onDecision(decision)
        let decision_monologue
        if (!influenced) {
          decision_monologue = chat.decision.decision.monologue_self
        } else if (decision === "a") {
          decision_monologue = chat.decision.decision.monologue_a
        } else {
          decision_monologue = chat.decision.decision.monologue_b
        }

        const decision_monologue_variant = decision_monologue[getTrustIndex(customer.trust)]

        setChatOptions([])
        scheduleMessageSeries([...decision_monologue_variant], customer.name, 0, MSG_DELAY, () => {
          setChatOptions(["Continue"])
          setPhase("exit")
        });

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
