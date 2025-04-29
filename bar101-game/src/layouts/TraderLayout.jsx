import React, { useState, useRef, useEffect } from 'react';
import CustomerPreview from '../components/CustomerPreview';
import ChatWindow from '../components/chat/ChatWindow';
import PropTypes from 'prop-types';

export default function TraderLayout({ bartender, trader, balance, onClose, onBuy }) {
  
  const chatWindowRef = useRef(null); 
  const [chatOptions, setChatOptions] = useState([]);
  const [phase, setPhase] = useState("welcome");

  const arrRnd = (arr) => {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }
  
  useEffect(() => {
    const run = async () => {
      await chatWindowRef.current.print(arrRnd(trader.phrases.opener), "Unknown", "trader", 0);
      await chatWindowRef.current.print(arrRnd(bartender.phrases.trade), "Alex", "aradan", 1, true);
      setChatOptions(["Buy some stuff"])
    }
    run()
  }, [])

  useEffect(() => {
    const run = async () => {
      if (phase === "bye") {
        await chatWindowRef.current.print(arrRnd(trader.phrases.goodbye), "Unknown", "trader", 0);
        await chatWindowRef.current.print(arrRnd(bartender.phrases.goodbye), "Alex", "aradan", 1, true);
        onClose();
      }
    }
    run()
  }, [phase])

  const sendMessage = async (index) => {
    setPhase("trade")
    setChatOptions([])
  }

  const endTrading = async () => {
    setPhase("bye")
  }

  const chat = <ChatWindow ref={chatWindowRef} options={chatOptions} onSubmit={(index) => sendMessage(index)} />

  const tradingWindow = <div>
    <button className='btn btn-primary m-3' onClick={() => onBuy("special", 7.00)}>
      Special $7.00<br/>
      <small>(inventory: {bartender.inventory.special})</small>
    </button>
    <button className='btn btn-primary m-3' onClick={() => endTrading()}>Close</button>
  </div>

  return <CustomerPreview customer={trader} customerAnim={true} balance={balance} >
      {phase !== "trade" ? chat : tradingWindow}
    </CustomerPreview>
}
