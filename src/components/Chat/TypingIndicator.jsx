import React from 'react';
import { useSelector } from 'react-redux';

const TypingIndicator = ({ userId }) => {
  const { typingUsers } = useSelector((state) => state.chat);
  
  const isTyping = typingUsers[userId];

  if (!isTyping) {
    return null;
  }

  return (
    <div className="typing-indicator">
      <i className="bi bi-person me-2"></i>
      typing
      <span className="typing-dots ms-2">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </div>
  );
};

export default TypingIndicator;