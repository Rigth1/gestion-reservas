import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
// Componente principal de la aplicación que gestiona la autenticación del usuario y la navegación entre el login y el dashboard.
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  // Función de callback que se pasa al componente Login para actualizar el estado del token al iniciar sesión correctamente
  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };
  // Función de callback que se pasa al componente Dashboard para manejar el cierre de sesión y limpiar el token del estado y del almacenamiento local
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  // Renderiza el componente Dashboard si el usuario está autenticado, pasando la función de cierre de sesión como prop
  return <Dashboard onLogout={handleLogout} />;
}

export default App;