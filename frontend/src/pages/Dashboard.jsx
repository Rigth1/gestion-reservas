import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import AlertMessage from '../components/AlertMessage';
import ProductList from '../components/ProductList';
import ReservationList from '../components/ReservationList';
import '../css/Dashboard.css'; // Importación de estilos independientes

/**
 * Componente Dashboard
 * Contenedor principal de la aplicación post-login. Se encarga de gestionar
 * el estado global de productos y reservas, sincronizar con la API, y manejar
 * las acciones críticas de creación y cancelación de reservas con claves de idempotencia.
 */
export default function Dashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Carga inicial de datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Sincroniza el catálogo de productos y la lista de reservas activas desde el backend.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, resRes] = await Promise.all([
        client.get('/products'),
        client.get('/reservations')
      ]);
      setProducts(prodRes.data);
      setReservations(resRes.data);
    } catch (err) {
      setMessage({ text: 'Error al sincronizar datos con el servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la creación de una reserva enviando una clave de idempotencia única
   * para prevenir cobros o descuentos duplicados ante reintentos de red.
   */
  const handleCreateReservation = async (productId, quantity) => {
    if (!quantity || quantity <= 0) {
      setMessage({ text: 'Por favor ingresa una cantidad válida mayor a 0.', type: 'error' });
      return;
    }

    try {
      setMessage({ text: '', type: '' });
      // Generación de clave de idempotencia para garantizar consistencia lógica
      const idempotencyKey = 'web-client-' + Date.now() + '-' + Math.random();

      await client.post('/reservations', {
        productId: Number(productId),
        quantity: Number(quantity)
      }, {
        headers: { 'idempotency-key': idempotencyKey }
      });

      setMessage({ text: '¡Reserva creada exitosamente!', type: 'success' });
      loadData(); // Recarga la información para actualizar el inventario y las reservas
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Ocurrió un error inesperado al procesar la reserva.';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  /**
   * Solicita la cancelación de una reserva activa y la restauración automática del stock.
   */
  const handleCancelReservation = async (reservationId) => {
    try {
      setMessage({ text: '', type: '' });
      await client.post(`/reservations/${reservationId}/cancel`);
      setMessage({ text: `Reserva #${reservationId} cancelada y stock restaurado.`, type: 'success' });
      loadData(); // Actualiza los listados
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'No se pudo cancelar la reserva.';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-container">
        <Navbar isAuthenticated={true} onLogout={onLogout} />
        
        {/* Componente centralizado de alertas/notificaciones */}
        <AlertMessage message={message.text} type={message.type} />
        
        {/* Catálogo de productos disponibles con acciones de reserva */}
        <ProductList products={products} onReserve={handleCreateReservation} loading={loading} />
        
        {/* Listado de reservas activas e historial */}
        <ReservationList reservations={reservations} onCancel={handleCancelReservation} />
      </div>
    </div>
  );
}