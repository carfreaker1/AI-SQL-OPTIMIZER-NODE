import React, { useState } from 'react';
import axios from 'axios';
import { Database } from 'lucide-react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import './App.css';

const API_URL = 'http://localhost:5000/api/sql/optimize';

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (query, target) => {
    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      target: target
    };
    
    // Add bot loading state
    const loadingMsgId = (Date.now() + 1).toString();
    const loadingMsg = {
      id: loadingMsgId,
      role: 'bot',
      content: 'loading'
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    try {
      const response = await axios.post(API_URL, { query, target });
      
      // Update the loading message with the real result
      setMessages((prev) => prev.map((msg) => 
        msg.id === loadingMsgId 
          ? { id: loadingMsgId, role: 'bot', content: response.data }
          : msg
      ));
    } catch (err) {
      console.error(err);
      const errorPayload = { 
        error: "Failed to connect to backend or process query.", 
        details: err.response?.data?.error || err.message 
      };
      
      setMessages((prev) => prev.map((msg) => 
        msg.id === loadingMsgId 
          ? { id: loadingMsgId, role: 'bot', content: errorPayload }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header glass-panel" style={{ borderRadius: '16px 16px 0 0', borderBottom: 'none' }}>
        <div className="header-title">
          <Database size={24} color="var(--accent-color)" />
          AI SQL Optimizer Chat
        </div>
      </header>
      
      <div className="glass-panel" style={{ flex: 1, borderRadius: '0', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <ChatWindow messages={messages} />
      </div>

      <div style={{ borderRadius: '0 0 16px 16px', overflow: 'hidden', flexShrink: 0 }}>
        <ChatInput onSend={handleSend} loading={loading} />
      </div>
    </div>
  );
}

export default App;
