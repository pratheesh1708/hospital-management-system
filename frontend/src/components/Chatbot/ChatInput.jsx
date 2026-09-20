import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled }) {
  const [input, setInput] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
  }

  return (
    <form onSubmit={handleSubmit} className="chat-input-area">
      <input
        type="text"
        placeholder="Ask about doctors, availability, visiting hours..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        style={{
          flex: 1,
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '13px',
          outline: 'none'
        }}
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        style={{
          background: 'linear-gradient(135deg, #00A896, #028090)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: !input.trim() || disabled ? 'not-allowed' : 'pointer',
          opacity: !input.trim() || disabled ? 0.6 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        <Send size={16} />
      </button>
    </form>
  );
}
