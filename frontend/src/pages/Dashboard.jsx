import React, { useState, useEffect } from 'react';
import client from '../api/client';
import Navbar from '../components/Navbar';
import AlertMessage from '../components/AlertMessage';
import ProductList from '../components/ProductList';
import ReservationList from '../components/ReservationList';

export default function Dashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadData();
  }, []);

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

  const handleCreateReservation = async (productId, quantity) => {
    if (!quantity || quantity <= 0) {
      setMessage({ text: 'Por favor ingresa una cantidad válida mayor a 0.', type: 'error' });
      return;
    }

    try {
      setMessage({ text: '', type: '' });
      const idempotencyKey = 'web-client-' + Date.now() + '-' + Math.random();

      await client.post('/reservations', {
        productId: Number(productId),
        quantity: Number(quantity)
      }, {
        headers: { 'idempotency-key': idempotencyKey }
      });

      setMessage({ text: '¡Reserva creada exitosamente!', type: 'success' });
      loadData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Ocurrió un error inesperado al procesar la reserva.';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      setMessage({ text: '', type: '' });
      await client.post(`/reservations/${reservationId}/cancel`);
      setMessage({ text: `Reserva #${reservationId} cancelada y stock restaurado.`, type: 'success' });
      loadData();
    } catch (err) {
      setMessage({ text: 'No se pudo cancelar la reserva.', type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '2rem', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', background: '#fdfdfd', minHeight: '100vh' }}>
      <Navbar isAuthenticated={true} onLogout={onLogout} />
      <AlertMessage message={message.text} type={message.type} />
      <ProductList products={products} onReserve={handleCreateReservation} loading={loading} />
      <ReservationList reservations={reservations} onCancel={handleCancelReservation} />
    </div>
  );
}