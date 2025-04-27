import React, { useState, useEffect, useRef } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

export default function DilemmaLayout({ customer, chat, onTrustChange, drink, onClose, onDecision }) {
  const [chatOptions, setChatOptions] = useState([]);
  const [phase, setPhase] = useState("serve");
  const [beliefsA, setBeliefsA] = useState(chat.decision.belief_a)
  const [beliefsB, setBeliefsB] = useState(chat.decision.belief_b)
  const [currentBelief, setCurrentBelief] = useState(null)
  const [lastChoice, setLastChoice] = useState(chat.decision.preference)
  const [beliefScoreA, setBeliefScoreA] = useState(0)
  const [beliefScoreB, setBeliefScoreB] = useState(0)
  const chatWindowRef = useRef(null);

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

  useEffect(() => {
    const run = async () => {
      await chatWindowRef.current.print(chat.decision.dilemma.opener, "Alex", "aradan", 1)
      const mainVariant = chat.decision.dilemma.variants[getTrustIndex(customer.trust)]

      console.log({chat})
      const initBelief = popRandomBelief(chat.decision.preference)
      setLastChoice(chat.decision.preference)
      setCurrentBelief(initBelief)

      for (let i = 0; i < mainVariant.length; i++) {
        await chatWindowRef.current.print(mainVariant[i], customer.name, customer.id, 0)
      }
      for (let i = 0; i < initBelief.monologue.length; i++) {
        await chatWindowRef.current.print(initBelief.monologue[i], customer.name, customer.id, 0, i === initBelief.monologue.length - 1)
      }
      setChatOptions(["Support", "Doubt"])
      setPhase("followup")
    }
    run()

  }, [customer.id])

  const sendMessage = async (index) => {
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
          for (let i = 0; i < dilemmaResponse.length; i++) {
            await chatWindowRef.current.print(dilemmaResponse[i], "Alex", "aradan", 1, i === dilemmaResponse.length - 1)
          }
          setChatOptions(["Continue"])
          setPhase("decision")
          return
        }

        setLastChoice(nextChoice)
        setCurrentBelief(nextBeleif)

        for (let i = 0; i < dilemmaResponse.length; i++) {
          await chatWindowRef.current.print(dilemmaResponse[i], "Alex", "aradan", 1)
        }
        for (let i = 0; i < nextBeleif.monologue.length; i++) {
          await chatWindowRef.current.print(nextBeleif.monologue[i], customer.name, customer.id, 0, i === nextBeleif.monologue.length - 1)
        }

        setChatOptions(["Support", "Doubt"])
        setPhase("followup")

        break;
      case "decision":
        const trustLevel = getTrustIndex(customer.trust)
        const scoreDiff = Math.abs(beliefScoreA - beliefScoreB)
        let influenced = false
        let decision = chat.decision.preference

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
        for (let i = 0; i < decision_monologue_variant.length; i++) {
          await chatWindowRef.current.print(decision_monologue_variant[i], customer.name, customer.id, 0, i === decision_monologue_variant.length - 1)
        }
        setChatOptions(["Continue"])
        setPhase("exit")

        break;
      case "exit":
        setChatOptions([])
        onClose()
        break;

      default:
        console.error("Unknown phase", phase)
  }}
  
  return <CustomerPreview customer={customer} drink={drink}>
      <ChatWindow ref={chatWindowRef} options={chatOptions} onSubmit={(index) => sendMessage(index)} />
    </CustomerPreview>
}
