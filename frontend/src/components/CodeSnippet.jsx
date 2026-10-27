import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeSnippet = ({ code, language }) => {
  return (
    <div className="code-wrapper">
      <SyntaxHighlighter 
        language={language} 
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.9rem',
          borderRadius: '8px'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeSnippet;
