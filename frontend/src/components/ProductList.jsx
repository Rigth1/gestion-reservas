import React, { useState } from 'react';

export default function ProductList({ products, onReserve, loading }) {
  const [quantities, setQuantities] = useState({});

  const handleInputChange = (productId, value) => {
    setQuantities({ ...quantities, [productId]: value });
  };

  const handleAction = (productId) => {
    const qty = quantities[productId];
    onReserve(productId, qty);
  };

  if (loading && products.length === 0) {
    return <p>Cargando productos...</p>;
  }

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Productos Disponibles</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {products.map((product) => {
          const available = product.available_stock !== undefined ? product.available_stock : product.cantidad_actual;
          const initial = product.initial_stock || product.cantidad_inicial;

          return (
            <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.2rem', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{product.name}</h3>
              <p style={{ margin: '4px 0', color: '#666', fontSize: '0.9rem' }}>Inventario Inicial: <strong>{initial}</strong></p>
              <p style={{ margin: '4px 0 12px 0', color: '#27ae60', fontSize: '0.95rem' }}>Disponibles: <strong>{available}</strong></p>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  min="1" 
                  placeholder="Cant."
                  value={quantities[product.id] || ''}
                  onChange={(e) => handleInputChange(product.id, e.target.value)}
                  style={{ width: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                  onClick={() => handleAction(product.id)}
                  style={{ background: '#3498db', color: 'white', border: 'none', padding: '7px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}
                >
                  Reservar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}