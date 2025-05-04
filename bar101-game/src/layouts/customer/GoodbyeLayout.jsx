import React, { useState, useEffect, useRef } from 'react';
import CustomerPreview from '../../components/CustomerPreview';
import ChatWindow from '../../components/chat/ChatWindow';
import PropTypes from 'prop-types';

const MSG_DELAY = 100

export default function GoodbyeLayout({ bartender, customer, drink, balance, onClose }) {
 
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

      await chatWindowRef.current.print(arrTrust(customer.phrases.goodbye, customer), customer.name, customer.id, 1)
      await chatWindowRef.current.print(arrRnd(bartender.phrases.goodbye), "Alex", "aradan", 0)

      onClose()
    }
    run()

  }, [customer.id, drink])
  
  return <CustomerPreview customer={customer} drink={drink} balance={balance} bartender={bartender}>
      <ChatWindow ref={chatWindowRef} />
    </CustomerPreview>
}
