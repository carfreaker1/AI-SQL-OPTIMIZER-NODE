import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const CodeSnippet = ({ code, language = 'sql', showHeader = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-block-card">
      {showHeader && (
        <div className="code-block-header">
          <span className="code-lang-tag">{language}</span>
          <button 
            type="button" 
            className={`code-copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check size={13} color="#34d399" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '0.85rem 1rem',
          background: 'transparent',
          fontSize: '0.85rem',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineHeight: 1.5,
        }}
      >
        {code || ''}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeSnippet;
