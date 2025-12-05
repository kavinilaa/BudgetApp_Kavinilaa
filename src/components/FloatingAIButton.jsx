import React from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingAIButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/ai-assistant')}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #A084E8, #8B6FDE)',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(160, 132, 232, 0.4)',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseOver={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 12px 30px rgba(160, 132, 232, 0.6)';
      }}
      onMouseOut={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 8px 20px rgba(160, 132, 232, 0.4)';
      }}
      title="AI Assistant"
    >
      🤖
    </button>
  );
};

export default FloatingAIButton;