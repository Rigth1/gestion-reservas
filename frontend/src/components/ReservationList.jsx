import React from 'react';

export default function ReservationList({ reservations, onCancel }) {
  return (
    <section>
      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Mis Reservas Activas</h2>
      {reservations.length === 0 ? (
        <p style={{ color: '#7f8c8d' }}>No hay reservas registradas actualmente.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Producto</th>
                <th style={{ padding: '12px' }}>Cantidad</th>
                <th style={{ padding: '12px' }}>Estado</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => {
                const status = res.status || 'active';
                const isActive = status.toLowerCase() === 'active';

                return (
                  <tr key={res.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>#{res.id}</td>
                    <td style={{ padding: '12px' }}>{res.product_name || `Producto #${res.product_id}`}</td>
                    <td style={{ padding: '12px' }}>{res.quantity}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '3px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem',
                        background: isActive ? '#e2f0d9' : '#fce8e6',
                        color: isActive ? '#385723' : '#a51d24',
                        fontWeight: 'bold'
                      }}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {isActive && (
                        <button 
                          onClick={() => onCancel(res.id)}
                          style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}