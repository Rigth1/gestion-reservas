import React from 'react';
import '../css/ReservationList.css'; // Importación de estilos independientes

/**
 * Componente ReservationList
 * Muestra el historial y estado actual de las reservas realizadas por los usuarios,
 * permitiendo ejecutar la acción de cancelación en aquellas que se encuentren activas.
 */
export default function ReservationList({ reservations, onCancel }) {
  return (
    <section className="reservation-section">
      <h2 className="section-title">Mis Reservas Activas e Historial</h2>

      {/* Validación si no hay reservas registradas */}
      {reservations.length === 0 ? (
        <div className="reservation-empty-state">
          <p>No hay reservas registradas actualmente en el sistema.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="reservation-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
                {/* Renderiza cada fila de reserva con su información y controles de acción según el estado */}
              {reservations.map((res) => {
                const status = res.status || 'active';
                const isActive = status.toLowerCase() === 'active'; 
                return (
                  <tr key={res.id} className={!isActive ? 'row-inactive' : ''}>
                    <td className="font-medium">#{res.id}</td>
                    <td>{res.product_name || `Producto #${res.product_id}`}</td>
                    <td><strong>{res.quantity}</strong></td>
                    <td>
                      <span className={`status-badge ${isActive ? 'badge-active' : 'badge-cancelled'}`}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-center">
                      {/* Permite cancelar únicamente si la reserva se encuentra activa */}
                      {isActive && (
                        <button 
                          onClick={() => onCancel(res.id)}
                          className="cancel-btn"
                          title="Cancelar esta reserva y restaurar inventario"
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