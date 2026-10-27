import React from 'react';
import { Database, Sparkles, Download, Trash2, Cpu } from 'lucide-react';

const Navbar = ({
  showSamples,
  setShowSamples,
  onClearMessages,
  onExportSession,
  hasMessages
}) => {
  return (
    <header className="navbar glass-panel">
      <div className="brand-section">
        <div className="brand-logo-container">
          <Database size={22} color="#38bdf8" />
        </div>
        <div className="brand-info">
          <div className="brand-title">
            AI SQL Optimizer Studio
          </div>
          <div className="brand-subtitle">
            <span className="model-badge">
              <span className="pulse-dot"></span>
              <Cpu size={12} style={{ display: 'inline' }} />
              gemini-2.5-flash-lite
            </span>
          </div>
        </div>
      </div>

      <div className="nav-actions">
        <button
          type="button"
          className={`nav-btn ${showSamples ? 'active' : ''}`}
          onClick={() => setShowSamples((prev) => !prev)}
          title="Toggle sample query library"
        >
          <Sparkles size={14} color="#38bdf8" />
          <span>Sample Queries</span>
        </button>

        {hasMessages && (
          <>
            <button
              type="button"
              className="nav-btn"
              onClick={onExportSession}
              title="Download report of optimized queries"
            >
              <Download size={14} />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="nav-btn"
              onClick={onClearMessages}
              title="Clear chat and start fresh"
              style={{ color: '#fda4af' }}
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
