import React from 'react';

export default function AlertMessage({ message, type }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? '#d4edda' : '#f8d7da';
  const textColor = isSuccess ? '#155724' : '#721c24';
  const borderColor = isSuccess ? '#c3e6cb' : '#f5c6cb';

  return (
    <div style={{
      padding: '12px 16px',
      marginBottom: '1.5rem',
      borderRadius: '6px',
      backgroundColor: bgColor,
      color: textColor,
      border: `1px solid ${borderColor}`,
      fontSize: '0.95rem'
    }}>
      {message}
    </div>
  );
}