import React, { useState } from 'react';
import client from '../api/client';
import AlertMessage from './AlertMessage';
import './Login.css'; // Importamos los estilos independientes

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await client.post('/auth/login', { username, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      onLoginSuccess(token);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Credenciales inválidas o error de conexión con el servidor.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Control de Acceso</h2>
          <p>MVP - Gestión de Inventario y Reservas</p>
        </div>
        
        <AlertMessage message={error} type="error" />
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Validando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}