import React, { useState } from 'react';
import {
  User,
  Bot,
  AlertTriangle,
  Zap,
  Clock,
  Database,
  Layers,
  Check,
  Copy,
  TrendingUp,
  FileCode,
  Columns,
  Cpu
} from 'lucide-react';
import CodeSnippet from './CodeSnippet';

const MessageBubble = ({ role, content, target, dialect, originalQuery }) => {
  const isUser = role === 'user';
  const [activeTab, setActiveTab] = useState('optimized'); // 'optimized', 'converted', 'diff'
  const [copiedIndex, setCopiedIndex] = useState(null);

  // 1. User Message
  if (isUser) {
    return (
      <div className="bubble-row">
        <div className="user-query-card">
          <div className="query-meta-header">
            <div className="badge-group">
              <span className="badge badge-dialect">{dialect || 'SQL'}</span>
              <span className="badge badge-target">Convert: {target || 'SQL'}</span>
            </div>
            <span>Original Query</span>
          </div>
          <CodeSnippet code={content} language="sql" showHeader={false} />
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (content === 'loading') {
    return (
      <div className="bubble-row">
        <div className="bot-response-card">
          <div className="loading-box">
            <div className="gemini-loader"></div>
            <div className="loading-text">Analyzing & Optimizing with Gemini 2.5 Flash Lite...</div>
            <div className="loading-subtext">
              Evaluating table scan costs, missing indexes, SARGability, and ORM translations
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (content.error) {
    return (
      <div className="bubble-row">
        <div className="bot-response-card" style={{ borderColor: 'var(--danger-border)' }}>
          <div className="bot-card-header" style={{ background: 'var(--danger-bg)' }}>
            <div className="bot-card-title" style={{ color: '#fda4af' }}>
              <AlertTriangle size={18} color="var(--danger)" />
              Optimization Error
            </div>
          </div>
          <div className="bot-card-body">
            <p style={{ color: '#fda4af', fontSize: '0.9rem' }}>{content.error}</p>
            {content.details && (
              <div className="explanation-card" style={{ borderColor: 'var(--danger-border)' }}>
                {content.details}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Success Bot Response
  const {
    optimized_query,
    converted_query,
    explain_summary,
    explanation,
    performance_impact,
    issues = [],
    indexes = [],
    source,
    model = 'gemini-2.5-flash-lite',
    latency_ms,
  } = content;

  const handleCopyIndex = async (idxText, idxId) => {
    try {
      await navigator.clipboard.writeText(idxText);
      setCopiedIndex(idxId);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy index:', err);
    }
  };

  const isCached = source === 'cache';

  return (
    <div className="bubble-row">
      <div className="bot-response-card">
        {/* Card Header with Metadata */}
        <div className="bot-card-header">
          <div className="bot-card-title">
            <div className={`source-tag ${isCached ? 'cache' : 'ai'}`}>
              {isCached ? (
                <>
                  <Zap size={12} />
                  <span>⚡ Served from Cache</span>
                </>
              ) : (
                <>
                  <Cpu size={12} />
                  <span>🤖 {model}</span>
                </>
              )}
            </div>

            {latency_ms && (
              <span className="latency-tag">
                <Clock size={12} />
                {latency_ms}ms
              </span>
            )}
          </div>

          {performance_impact && (
            <div className="performance-banner" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}>
              <TrendingUp size={13} className="performance-banner-icon" />
              <span>{performance_impact}</span>
            </div>
          )}
        </div>

        <div className="bot-card-body">
          {/* Tab Switcher */}
          <div className="tab-bar">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'optimized' ? 'active' : ''}`}
              onClick={() => setActiveTab('optimized')}
            >
              <Zap size={13} />
              <span>Optimized SQL</span>
            </button>

            {converted_query && (
              <button
                type="button"
                className={`tab-btn ${activeTab === 'converted' ? 'active' : ''}`}
                onClick={() => setActiveTab('converted')}
              >
                <Layers size={13} />
                <span>Converted Code ({target || 'Target'})</span>
              </button>
            )}

            {originalQuery && (
              <button
                type="button"
                className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
                onClick={() => setActiveTab('diff')}
              >
                <Columns size={13} />
                <span>Side-by-Side Compare</span>
              </button>
            )}
          </div>

          {/* Tab Content 1: Optimized SQL */}
          {activeTab === 'optimized' && optimized_query && (
            <div>
              <CodeSnippet code={optimized_query} language="sql" />
            </div>
          )}

          {/* Tab Content 2: Converted Query */}
          {activeTab === 'converted' && converted_query && (
            <div>
              <CodeSnippet
                code={converted_query}
                language={
                  target === 'laravel' || target === 'django'
                    ? 'php'
                    : target === 'prisma' || target === 'typeorm' || target === 'drizzle' || target === 'kysely'
                    ? 'typescript'
                    : 'sql'
                }
              />
            </div>
          )}

          {/* Tab Content 3: Side-by-Side Diff */}
          {activeTab === 'diff' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
              <div>
                <div className="section-title">Original (Unoptimized)</div>
                <CodeSnippet code={originalQuery} language="sql" />
              </div>
              <div>
                <div className="section-title">Optimized with Gemini</div>
                <CodeSnippet code={optimized_query} language="sql" />
              </div>
            </div>
          )}

          {/* Issues / Anti-patterns Detected */}
          {issues && issues.length > 0 && (
            <div>
              <div className="section-title">
                <AlertTriangle size={14} color="var(--danger)" />
                <span>Detected Bottlenecks & Anti-Patterns ({issues.length})</span>
              </div>
              <div className="issues-container">
                {issues.map((issue, idx) => {
                  const isHigh = issue.includes('[CRITICAL]') || issue.includes('[HIGH]');
                  return (
                    <div
                      key={idx}
                      className={`issue-item ${isHigh ? '' : 'warning'}`}
                    >
                      <span style={{ fontWeight: 600 }}>#{idx + 1}</span>
                      <span>{issue}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested Indexes */}
          {indexes && indexes.length > 0 && (
            <div>
              <div className="section-title">
                <Database size={14} color="var(--accent-cyan)" />
                <span>Recommended Index Strategy (DDL)</span>
              </div>
              <div className="indexes-grid">
                {indexes.map((idxSql, idx) => (
                  <div key={idx} className="index-item-card">
                    <span className="index-sql-code">{idxSql}</span>
                    <button
                      type="button"
                      className="copy-mini-btn"
                      onClick={() => handleCopyIndex(idxSql, idx)}
                      title="Copy index DDL statement"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={12} color="#34d399" />
                          <span style={{ color: '#34d399' }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy DDL</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explain Summary & Execution Plan Analysis */}
          {explain_summary && (
            <div>
              <div className="section-title">
                <FileCode size={14} color="#a855f7" />
                <span>Execution Plan Analysis</span>
              </div>
              <div className="explanation-card">
                {explain_summary}
              </div>
            </div>
          )}

          {/* Detailed Walkthrough / Explanation */}
          {explanation && (
            <div>
              <div className="section-title">
                <Zap size={14} color="var(--accent-cyan)" />
                <span>Optimization Breakdown</span>
              </div>
              <div className="explanation-card">
                {explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
