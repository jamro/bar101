import React, { useState, useRef, useEffect } from 'react';
import CustomerPreview from '../components/CustomerPreview';
import ChatWindow from '../components/chat/ChatWindow';
import PropTypes from 'prop-types';
import TradingWindow from '../components/trade/TradingWindow';

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

  const tradingWindow = <TradingWindow inventory={bartender.inventory} onBuy={onBuy} onClose={endTrading} balance={balance} trader={trader} />

  return <CustomerPreview customer={trader} customerAnim={true} balance={balance} bartender={bartender} >
      {phase !== "trade" ? chat : tradingWindow}
    </CustomerPreview>
}
