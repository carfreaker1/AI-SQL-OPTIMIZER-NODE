import React, { useRef } from 'react';
import { Send, Zap, RotateCcw, AlignLeft, Layers, Database } from 'lucide-react';

const TARGET_OPTIONS = [
  { value: 'sql', label: 'Raw SQL' },
  { value: 'prisma', label: 'Prisma' },
  { value: 'laravel', label: 'Laravel (Eloquent)' },
  { value: 'typeorm', label: 'TypeORM' },
  { value: 'django', label: 'Django ORM' },
  { value: 'drizzle', label: 'Drizzle ORM' },
  { value: 'mongoose', label: 'Mongoose' },
  { value: 'kysely', label: 'Kysely' },
];

const DIALECT_OPTIONS = [
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'MySQL', label: 'MySQL' },
  { value: 'SQLite', label: 'SQLite' },
  { value: 'SQL Server', label: 'SQL Server (MSSQL)' },
  { value: 'Oracle', label: 'Oracle SQL' },
];

const SQL_KEYWORDS = [
  'select', 'from', 'where', 'and', 'or', 'join', 'inner join', 'left join',
  'right join', 'group by', 'order by', 'having', 'limit', 'offset', 'as',
  'on', 'in', 'not in', 'distinct', 'count', 'max', 'min', 'avg', 'sum',
  'create index', 'union', 'union all', 'exists', 'not exists', 'is null', 'is not null'
];

const ChatInput = ({
  query,
  setQuery,
  target,
  setTarget,
  dialect,
  setDialect,
  onSend,
  loading,
}) => {
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!query.trim() || loading) return;
    onSend(query.trim(), target, dialect);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple quick SQL formatter to capitalize keywords
  const handleQuickFormat = () => {
    if (!query.trim()) return;
    let formatted = query;
    SQL_KEYWORDS.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, keyword.toUpperCase());
    });
    setQuery(formatted);
  };

  return (
    <div className="console-dock">
      <div className="console-editor-wrap">
        <textarea
          ref={textareaRef}
          className="console-textarea"
          placeholder="Paste or write your unoptimized SQL query here... (e.g. SELECT * FROM users WHERE YEAR(created_at) = 2024)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="console-controls-bar">
        <div className="selectors-group">
          {/* Dialect Selector */}
          <div className="control-pill-select" title="Target SQL Dialect">
            <Database size={13} color="var(--accent-cyan)" />
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              disabled={loading}
            >
              {DIALECT_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target ORM Selector */}
          <div className="control-pill-select" title="Target Framework / ORM Converter">
            <Layers size={13} color="#a855f7" />
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={loading}
            >
              {TARGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Format & Clear */}
          {query.trim().length > 0 && !loading && (
            <>
              <button
                type="button"
                className="nav-btn"
                onClick={handleQuickFormat}
                title="Format SQL keywords to uppercase"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                <AlignLeft size={12} />
                <span>Format</span>
              </button>

              <button
                type="button"
                className="nav-btn"
                onClick={() => setQuery('')}
                title="Clear query input"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </>
          )}
        </div>

        <div className="cta-actions-group">
          <span className="shortcut-tip">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> ↵
          </span>

          <button
            type="button"
            className="optimize-btn"
            onClick={handleSend}
            disabled={!query.trim() || loading}
            title="Analyze and optimize with Gemini 2.5 Flash Lite"
          >
            {loading ? (
              <>
                <Zap size={15} className="spin-icon" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <Zap size={15} />
                <span>Optimize Query</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
