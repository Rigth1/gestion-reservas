import React from 'react';

export default function Navbar({ isAuthenticated, onLogout }) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eaeaea', paddingBottom: '1rem', marginBottom: '2rem' }}>
      <div>
        <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '1.8rem' }}>Gestión de Reservas e Inventario</h1>
        <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Panel de Control MVP - Full Stack</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '4px', 
          fontSize: '0.85rem', 
          backgroundColor: isAuthenticated ? '#d4edda' : '#f8d7da', 
          color: isAuthenticated ? '#155724' : '#721c24' 
        }}>
          {isAuthenticated ? '● Autenticado' : '○ Sin sesión'}
        </span>
        {isAuthenticated && (
          <button 
            onClick={onLogout}
            style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
          >
            Cerrar Sesión
          </button>
        )}
      </div>
    </header>
  );
}