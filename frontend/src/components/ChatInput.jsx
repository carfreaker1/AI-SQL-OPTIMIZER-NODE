import React, { useState } from 'react';
import { Send } from 'lucide-react';

const TARGET_OPTIONS = [
  { value: 'laravel', label: 'Laravel' },
  { value: 'prisma', label: 'Prisma' },
  { value: 'typeorm', label: 'TypeORM' },
  { value: 'mongoose', label: 'Mongoose' },
  { value: 'django', label: 'Django ORM' },
  { value: 'sql', label: 'Raw SQL' }
];

const ChatInput = ({ onSend, loading }) => {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState('laravel');

  const handleSend = () => {
    if (!query.trim() || loading) return;
    onSend(query, target);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input glass-panel">
      <textarea
        className="input-area"
        placeholder="Paste your SQL query here... (Press Enter to send)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />
      <div className="chat-input-controls">
        <select 
          className="target-select"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={loading}
        >
          {TARGET_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button 
          className="send-btn" 
          onClick={handleSend}
          disabled={!query.trim() || loading}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
