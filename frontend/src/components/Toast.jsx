import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, duration = 4000, type = 'info' }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {type === 'success' && <span className="toast-icon">✅</span>}
        {type === 'info' && <span className="toast-icon">ℹ️</span>}
        {type === 'warning' && <span className="toast-icon">⚠️</span>}
        {type === 'error' && <span className="toast-icon">❌</span>}
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
