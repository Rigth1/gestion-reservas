import React from 'react';
import '../css/Navbar.css'; // Importación de estilos independientes

/**
 * Componente Navbar
 * Encabezado principal de la aplicación que muestra el título del MVP,
 * el estado actual de la sesión del usuario y la opción de cerrar sesión.
 */
export default function Navbar({ isAuthenticated, onLogout }) {
  return (
    <header className="navbar-header">
      {/* Título e información general del panel */}
      <div className="navbar-titles">
        <h1 className="navbar-title">Gestión de Reservas e Inventario</h1>
        <p className="navbar-subtitle">Panel de Control MVP - Full Stack</p>
      </div>

      {/* Acciones de usuario y estado de autenticación */}
      <div className="navbar-actions">
        <span className={`navbar-status-badge ${isAuthenticated ? 'status-active' : 'status-inactive'}`}>
          {isAuthenticated ? '● Autenticado' : '○ Sin sesión'}
        </span>

        {/* Muestra el botón de cerrar sesión únicamente si el usuario está autenticado */}
        {isAuthenticated && (
          <button 
            onClick={onLogout}
            className="navbar-logout-btn"
            title="Finalizar sesión actual"
          >
            Cerrar Sesión
          </button>
        )}
      </div>
    </header>
  );
}