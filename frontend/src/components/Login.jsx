import React, { useState } from 'react';
import client from '../api/client';
import AlertMessage from './AlertMessage';
import '../css/Login.css'; // Importamos los estilos independientes
// Componente Login
// Maneja la autenticación del usuario, captura de credenciales y comunicación con el backend.
// Muestra mensajes de error en caso de credenciales inválidas o problemas de conexión.
export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
// Maneja el envío del formulario de login, realiza la petición al backend y gestiona el estado de carga y errores
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
    // Petición POST al endpoint de autenticación del backend
      const res = await client.post('/auth/login', { username, password });
      const { token } = res.data;
      // Guardamos el token en localStorage para mantener la sesión del usuario
      localStorage.setItem('token', token);
      // Llamamos a la función de callback para notificar al componente padre que el login fue exitoso
      onLoginSuccess(token);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Credenciales inválidas o error de conexión con el servidor.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
// Renderiza el formulario de login con campos para usuario y contraseña, y muestra mensajes de error si los hay
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Control de Acceso</h2>
          <p>MVP - Gestión de Inventario y Reservas</p>
        </div>
        
        <AlertMessage message={error} type="error" />
        {/* Formulario de login con campos controlados y botón de envío */}
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