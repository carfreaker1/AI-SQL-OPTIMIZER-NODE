import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import SampleQueriesBar from './components/SampleQueriesBar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import './App.css';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api/sql/optimize'
    : 'https://ai-sql-optimizer-node.onrender.com/api/sql/optimize');

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState('prisma');
  const [dialect, setDialect] = useState('PostgreSQL');
  const [showSamples, setShowSamples] = useState(false);

  const handleSend = async (sendQuery, sendTarget, sendDialect) => {
    const q = sendQuery || query;
    const t = sendTarget || target;
    const d = sendDialect || dialect;

    if (!q.trim() || loading) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: q.trim(),
      target: t,
      dialect: d,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add bot loading state
    const loadingMsgId = (Date.now() + 1).toString();
    const loadingMsg = {
      id: loadingMsgId,
      role: 'bot',
      content: 'loading',
      target: t,
      dialect: d,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setLoading(true);
    setQuery('');

    try {
      const response = await axios.post(API_URL, {
        query: q.trim(),
        target: t,
        dialect: d,
      });

      // Update loading placeholder with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMsgId
            ? {
                id: loadingMsgId,
                role: 'bot',
                content: response.data,
                target: t,
                dialect: d,
              }
            : msg
        )
      );
    } catch (err) {
      console.error('Optimization request failed:', err);
      const errorPayload = {
        error: 'Failed to optimize query with Gemini',
        details:
          err.response?.data?.details ||
          err.response?.data?.error ||
          err.message ||
          'Check that backend server is running on port 5000',
      };

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMsgId
            ? {
                id: loadingMsgId,
                role: 'bot',
                content: errorPayload,
                target: t,
                dialect: d,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setQuery(sample.query);
    if (sample.target) setTarget(sample.target);
    if (sample.dialect) setDialect(sample.dialect);
  };

  const handleClearMessages = () => {
    if (window.confirm('Clear all conversation messages?')) {
      setMessages([]);
    }
  };

  const handleExportSession = () => {
    if (messages.length === 0) return;

    let markdown = `# AI SQL Optimizer Session Report\n`;
    markdown += `Generated on: ${new Date().toLocaleString()}\n`;
    markdown += `AI Model: Google Gemini 2.5 Flash Lite\n\n`;

    messages.forEach((msg, idx) => {
      if (msg.role === 'user') {
        markdown += `## Query #${Math.floor(idx / 2) + 1}\n`;
        markdown += `**Dialect:** ${msg.dialect || 'SQL'} | **Target:** ${msg.target || 'SQL'}\n\n`;
        markdown += `### Original SQL:\n\`\`\`sql\n${msg.content}\n\`\`\`\n\n`;
      } else if (msg.role === 'bot' && typeof msg.content === 'object' && !msg.content.error) {
        const c = msg.content;
        markdown += `### Optimized SQL:\n\`\`\`sql\n${c.optimized_query || ''}\n\`\`\`\n\n`;
        if (c.performance_impact) {
          markdown += `**Performance Impact:** ${c.performance_impact}\n\n`;
        }
        if (c.issues && c.issues.length) {
          markdown += `### Detected Issues:\n`;
          c.issues.forEach((issue) => {
            markdown += `- ${issue}\n`;
          });
          markdown += `\n`;
        }
        if (c.indexes && c.indexes.length) {
          markdown += `### Recommended Indexes:\n\`\`\`sql\n${c.indexes.join('\n')}\n\`\`\`\n\n`;
        }
        if (c.converted_query) {
          markdown += `### Converted (${msg.target}):\n\`\`\`\n${c.converted_query}\n\`\`\`\n\n`;
        }
        if (c.explain_summary) {
          markdown += `### Execution Plan Analysis:\n${c.explain_summary}\n\n`;
        }
        markdown += `---\n\n`;
      }
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SQL_Optimization_Report_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <Navbar
        showSamples={showSamples}
        setShowSamples={setShowSamples}
        onClearMessages={handleClearMessages}
        onExportSession={handleExportSession}
        hasMessages={messages.length > 0}
      />

      {showSamples && (
        <SampleQueriesBar
          onSelectSample={handleSelectSample}
          onClose={() => setShowSamples(false)}
        />
      )}

      <main className="workspace-container glass-panel">
        <ChatWindow
          messages={messages}
          onOpenSamples={() => setShowSamples(true)}
        />

        <ChatInput
          query={query}
          setQuery={setQuery}
          target={target}
          setTarget={setTarget}
          dialect={dialect}
          setDialect={setDialect}
          onSend={handleSend}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default App;
