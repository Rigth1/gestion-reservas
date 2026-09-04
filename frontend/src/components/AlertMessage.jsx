import React from 'react';
import '../css/AlertMessage.css'; 

// Componente AlertMessage
// Muestra mensajes de alerta al usuario, diferenciando entre errores y éxitos.
// Se puede reutilizar en diferentes partes de la aplicación para notificaciones consistentes.
export default function AlertMessage({ message, type = 'error' }) {
  if (!message) return null;
// Determina si el mensaje es de éxito o error para aplicar estilos y iconografía adecuada
  const isSuccess = type === 'success';
// Renderiza el mensaje de alerta con estilos y contenido dinámico según el tipo
  return (
    <div className={`alert-message ${isSuccess ? 'alert-success' : 'alert-error'}`}>
      <span className="alert-icon">
        {isSuccess ? '✓' : '⚠️'}
      </span>
      <div className="alert-content">
        {message}
      </div>
    </div>
  );
}