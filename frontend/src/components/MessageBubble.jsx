import React from 'react';
import { User, Bot, AlertTriangle, Database } from 'lucide-react';
import CodeSnippet from './CodeSnippet';

const MessageBubble = ({ role, content, target }) => {
  const isUser = role === 'user';
  
  if (isUser) {
    return (
      <div className="message-bubble user">
        <div className="avatar">
          <User size={20} color="white" />
        </div>
        <div className="content-box">
          <div className="query-header">
            <span>Query</span>
            <span className="target-badge">{target}</span>
          </div>
          <CodeSnippet code={content} language="sql" />
        </div>
      </div>
    );
  }

  // Handle Bot loading
  if (content === 'loading') {
    return (
      <div className="message-bubble bot">
        <div className="avatar">
          <Bot size={20} color="white" />
        </div>
        <div className="content-box">
           <div className="typing-indicator">
              <span></span><span></span><span></span>
           </div>
        </div>
      </div>
    );
  }

  // Handle Bot Error
  if (content.error) {
    return (
      <div className="message-bubble bot">
        <div className="avatar">
          <Bot size={20} color="#fca5a5" />
        </div>
        <div className="content-box" style={{ background: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.3)' }}>
           <p style={{ color: '#fca5a5' }}>
             <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px' }}/>
             {content.error}
           </p>
           {content.details && <p style={{ fontSize: '0.85rem', marginTop: '4px', opacity: 0.8 }}>{content.details}</p>}
        </div>
      </div>
    );
  }

  // Handle Bot success response
  const {
    optimized_query,
    converted_query,
    explain_summary,
    explanation,
    issues,
    indexes,
    source
  } = content;

  return (
    <div className="message-bubble bot">
      <div className="avatar">
        <Bot size={20} color="white" />
      </div>
      <div className="content-box">
        {source === "cache" && (
           <div className="query-header" style={{ color: "var(--success-color)", marginBottom: "1rem" }}>
             ⚡ Served from Cache
           </div>
        )}

        {optimized_query && (
          <div className="result-section">
            <h4>Optimized SQL</h4>
            <CodeSnippet code={optimized_query} language="sql" />
          </div>
        )}

        {converted_query && (
          <div className="result-section">
            <h4>Converted Query ({target})</h4>
            <CodeSnippet code={converted_query} language="javascript" />
          </div>
        )}

        {explain_summary && (
          <div className="result-section">
            <h4>Explain Summary</h4>
            <p>{explain_summary}</p>
          </div>
        )}

        {explanation && (
          <div className="result-section">
            <h4>Explanation</h4>
            <p>{explanation}</p>
          </div>
        )}

        {(issues && issues.length > 0) && (
          <div className="result-section">
            <h4><AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px' }}/> Issues Detected</h4>
            <div className="chip-list">
              {issues.map((issue, idx) => (
                 <span key={idx} className="chip issue">{issue}</span>
              ))}
            </div>
          </div>
        )}

        {(indexes && indexes.length > 0) && (
          <div className="result-section">
             <h4><Database size={14} style={{ display: 'inline', marginRight: '4px' }}/> Suggested Indexes</h4>
             <div className="chip-list">
               {indexes.map((idxItem, idx) => (
                  <span key={idx} className="chip">{idxItem}</span>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
