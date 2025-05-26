import React, { useState, useEffect, useRef } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';
import DilemmaWidget from '../../components/chat/DilemmaWidget';

export default function DilemmaLayout({ customer, chat, balance, drink, onClose, onDecision, onExit, bartender }) {
  const [showWidget, setShowWidget] = useState(false);
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  const [chatOptions, setChatOptions] = useState([]);
  const [dilemmaProgress, setDilemmaProgress] = useState()

  const [phase, setPhase] = useState("serve");
  const [beliefsA, setBeliefsA] = useState(chat.decision.belief_a)
  const [beliefsB, setBeliefsB] = useState(chat.decision.belief_b)
  const [currentBelief, setCurrentBelief] = useState(null)
  const [lastChoice, setLastChoice] = useState(chat.decision.preference)
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
      if(chat.decision.preference === "a") {
        setDilemmaProgress(0.95 - Math.random() * 0.25)
      } else {
        setDilemmaProgress(0.05 + Math.random() * 0.25)
      }

      for (let i = 0; i < mainVariant.length; i++) {
        await chatWindowRef.current.print(mainVariant[i], customer.name, customer.id, 0)
      }
      for (let i = 0; i < initBelief.monologue.length; i++) {
        await chatWindowRef.current.print(initBelief.monologue[i], customer.name, customer.id, 0, i === initBelief.monologue.length - 1)
      }
      setShowWidget(true)
      setWidgetEnabled(true)
      setChatOptions([])
      setPhase("followup")
    }
    run()

  }, [customer.id])

  const sendMessage = async (index) => {
    switch(phase) {
      case "followup":
        const alternativeChoice = (lastChoice === "a") ? "b" : "a"
        let multiplier = (lastChoice === "a") ? +1 : -1
        multiplier *= (0.05 + Math.random() * 0.1 + (customer.trust*0.7 + 0.3)*0.85)
        setShowWidget(true)
        setWidgetEnabled(false)
        setChatOptions([])

        let nextChoice
        let dilemmaResponse
        if (index === 0) { // Support
          console.log("Support")
          setDilemmaProgress(prev => Math.max(0, Math.min(1, prev + multiplier * 0.2)))
          nextChoice = lastChoice
          dilemmaResponse = currentBelief.supportive_response
        } else { // Doubt
          console.log("Doubt")
          setDilemmaProgress(prev => Math.max(0, Math.min(1, prev - multiplier * 0.2)))
          nextChoice = alternativeChoice
          dilemmaResponse = currentBelief.challenging_response
        }
        const nextBeleif = popRandomBelief(nextChoice)
        if (nextBeleif === null) {
          for (let i = 0; i < dilemmaResponse.length; i++) {
            await chatWindowRef.current.print(dilemmaResponse[i], "Alex", "aradan", 1, i === dilemmaResponse.length - 1)
          }
          setChatOptions(["Continue"])
          setShowWidget(false)
          setWidgetEnabled(false)
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

        setShowWidget(true)
        setWidgetEnabled(true)
        setChatOptions([])
        setPhase("followup")

        break;
      case "decision":
        let decision = dilemmaProgress > 0.5 ? "a" : "b"
        const influenced = (customer.trust > 0) || (decision !== chat.decision.preference)
        console.log({influenced, decision})
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

        setShowWidget(false)
        setWidgetEnabled(false)
        setChatOptions([])
        for (let i = 0; i < decision_monologue_variant.length; i++) {
          await chatWindowRef.current.print(decision_monologue_variant[i], customer.name, customer.id, 0, i === decision_monologue_variant.length - 1)
        }
        setShowWidget(false)
        setWidgetEnabled(false)
        setChatOptions(["Continue"])
        setPhase("exit")

        break;
      case "exit":
        setShowWidget(false)
        setWidgetEnabled(false)
        setChatOptions([])
        onClose()
        break;

      default:
        console.error("Unknown phase", phase)
  }}

  let dilemmaWidget = null
  if (showWidget) {
    dilemmaWidget = <DilemmaWidget
      dilemmaTitleA={chat.decision.title_a}
      dilemmaTitleB={chat.decision.title_b}
      dilemmaPreference={dilemmaProgress}
      buttonLabelA={lastChoice === "b" ? "Doubt" : "Support"}
      buttonLabelB={lastChoice === "b" ? "Support" : "Doubt"}
      onButtonAClick={() => sendMessage(lastChoice === "a" ? 0 : 1)}
      onButtonBClick={() => sendMessage(lastChoice === "a" ? 1 : 0)}
      enabled={widgetEnabled}
    />
  }
  return <CustomerPreview customer={customer} drink={drink} balance={balance} bartender={bartender} onExit={onExit}>
      <ChatWindow ref={chatWindowRef} options={chatOptions} onSubmit={(index) => sendMessage(index)} >
        {dilemmaWidget}
      </ChatWindow>
    </CustomerPreview>
}
