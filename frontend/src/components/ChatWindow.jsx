import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div style={{ margin: 'auto', color: 'var(--text-secondary)', textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI SQL Optimizer</p>
          <p>Paste a query and choose your target ORM/Framework below.</p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            role={msg.role} 
            content={msg.content} 
            target={msg.target} 
          />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
