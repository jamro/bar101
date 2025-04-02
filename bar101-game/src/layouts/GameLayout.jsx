import React, { useState } from 'react';
import ChatWindow from '../components/chat/ChatWindow';

function GameLayout() {

  const [messages, setMessages] = useState([])

  const sendMessage = () => {

    const messagePacks = [
      [
        {
          text: 'Hello!',
          from: 'Alex',
          userIndex: 0,
        },
        {
          text: 'Hi!',
          from: 'Kate',
          userIndex: 1,
        },
      ],
      [
        {
          text: 'How are you?',
          from: 'Alex',
          userIndex: 0,
        },
        {
          text: 'I am fine, thanks!',
          from: 'Kate',
          userIndex: 1,
        },
      ],
      [
        {
          text: 'What about you?',
          from: 'Kate',
          userIndex: 1,
        },
        {
          text: 'I am fine too!',
          from: 'Alex',
          userIndex: 0,
        },
      ],
      [
        {
          text: 'What are you doing?',
          from: 'Kate',
          userIndex: 1,
        },
        {
          text: 'I am playing a game!',
          from: 'Alex',
          userIndex: 0,
        },
      ],
      [
        {
          text: 'What game?',
          from: 'Kate',
          userIndex: 1,
        },
        {
          text: 'It is a secret!',
          from: 'Alex',
          userIndex: 0,
        },
      ],
      [
        {
          text: 'Can you tell me?',
          from: 'Kate',
          userIndex: 1,
        },
        {
          text: 'No, I can\'t!',
          from: 'Alex',
          userIndex: 0,
        },
      ],
      [
        {
          text: 'Why not?',
          from: 'Kate',
          userIndex: 1,
        },
        {
          text: 'Because it is a secret!',
          from: 'Alex',
          userIndex: 0,
        },
      ],
      [
        {
          text: 'Can you give me a hint?',
          from: 'Kate',
          userIndex: 1,
        },
        {
          text: 'No, I can\'t!',
          from: 'Alex',
          userIndex: 0,
        },
      ],
      [
        {
          text: 'Please!',
          from: 'Kate',
          userIndex: 1,
        },
        {
          text: 'Okay, it is a puzzle game!',
          from: 'Alex',
          userIndex: 0,
        },
      ],
      [
        {
          text: 'I love puzzle games!',
          from: 'Kate',
          userIndex: 1,
        },
        {
          text: 'Me too!',
          from: 'Alex',
          userIndex: 0,
        },
      ],
    ]

    const randomIndex = Math.floor(Math.random() * messagePacks.length);
    const selectedMessages = messagePacks[randomIndex];


    setMessages((prevMessages) => [
      ...prevMessages,
      ...selectedMessages,
    ]);
  }

  return (
    <ChatWindow 
      messages={messages}
      onSubmit={() => sendMessage()}
    />
  );
}

export default GameLayout;