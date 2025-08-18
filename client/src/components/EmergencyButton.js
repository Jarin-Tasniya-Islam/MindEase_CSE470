// client/src/components/EmergencyButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmergencyButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/sos')}
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        padding: '12px 16px',
        borderRadius: 999,
        border: 'none',
        background: '#d32f2f',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
        zIndex: 1000
      }}
      aria-label="Open SOS"
      title="Open SOS"
    >
      SOS
    </button>
  );
};

export default EmergencyButton;
