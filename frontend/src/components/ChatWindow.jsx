import React, { useEffect, useRef } from 'react';
import { Database, Zap, ShieldAlert, Code2, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages, onOpenSamples }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat-scroll-area">
        <div className="welcome-hero">
          <div className="welcome-icon-glow">
            <Database size={32} color="#38bdf8" />
          </div>

          <h1>High-Performance SQL Optimization</h1>
          <p>
            Powered by <strong>Google Gemini 2.5 Flash Lite</strong>. Analyze execution plans,
            eliminate full table scans, auto-generate optimal indexes, and convert queries into
            modern ORM builders.
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <Zap size={20} className="feature-card-icon" />
              <h4>Instant Query Rewriting</h4>
              <p>Replaces correlated subqueries, non-SARGable functions, and comma joins.</p>
            </div>

            <div className="feature-card">
              <ShieldAlert size={20} className="feature-card-icon" color="#f59e0b" />
              <h4>Anti-Pattern Detection</h4>
              <p>Detects N+1 bottlenecks, unindexed wildcards, and excessive SELECT * scans.</p>
            </div>

            <div className="feature-card">
              <Code2 size={20} className="feature-card-icon" color="#a855f7" />
              <h4>ORM / Framework Translation</h4>
              <p>Transforms raw SQL into Prisma, Laravel Eloquent, TypeORM, Django & Drizzle.</p>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem' }}>
            <button
              type="button"
              className="nav-btn"
              onClick={onOpenSamples}
              style={{
                margin: '0 auto',
                padding: '0.6rem 1.25rem',
                fontSize: '0.88rem',
                color: '#38bdf8',
                borderColor: 'rgba(56, 189, 248, 0.4)',
                background: 'rgba(56, 189, 248, 0.1)',
              }}
            >
              <Sparkles size={16} />
              <span>Explore Sample Unoptimized Queries</span>
            </button>
          </div>
        </div>
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="chat-scroll-area">
      {messages.map((msg, index) => {
        // Find corresponding user query if this is a bot response
        let originalQuery = null;
        if (msg.role === 'bot' && index > 0 && messages[index - 1].role === 'user') {
          originalQuery = messages[index - 1].content;
        }

        return (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            target={msg.target}
            dialect={msg.dialect}
            originalQuery={originalQuery}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
