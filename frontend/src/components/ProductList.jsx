import React, { useState } from 'react';
import '../css/ProductList.css'; // Importación de estilos independientes

/**
 * Componente ProductList
 * Muestra el catálogo de productos disponibles en tarjetas en formato de cuadrícula,
 * permitiendo al usuario ingresar la cantidad deseada y enviar la solicitud de reserva.
 */
export default function ProductList({ products, onReserve, loading }) {
  // Estado local para almacenar dinámicamente la cantidad escrita por cada producto (keyed por product.id)
  const [quantities, setQuantities] = useState({});

  // Maneja el cambio de valor en el input de cantidad para un producto específico
  const handleInputChange = (productId, value) => {
    setQuantities({ ...quantities, [productId]: value });
  };

  // Dispara la acción de reserva enviando el ID del producto y la cantidad seleccionada
  const handleAction = (productId) => {
    const qty = quantities[productId];
    onReserve(productId, qty);
  };

  // Pantalla de carga inicial si aún no hay productos en memoria
  if (loading && products.length === 0) {
    return (
      <div className="product-loading-container">
        <div className="spinner"></div>
        <p>Cargando catálogo de productos...</p>
      </div>
    );
  }

  return (
    <section className="product-section">
      <h2 className="section-title">Productos Disponibles</h2>
      
      {/* Cuadrícula de tarjetas de productos */}
      <div className="product-grid">
        {products.map((product) => {
          // Soporta distintas nomenclaturas de propiedades que pueda enviar el backend
          const available = product.available_stock !== undefined ? product.available_stock : product.cantidad_actual;
          const initial = product.initial_stock || product.cantidad_inicial;
          const isOutOfStock = available <= 0;
        // Renderiza cada tarjeta de producto con su información y controles de acción
          return (
            <div key={product.id} className={`product-card ${isOutOfStock ? 'card-out-of-stock' : ''}`}>
              <div className="product-card-header">
                <h3 className="product-name">{product.name}</h3>
                {isOutOfStock && <span className="badge-agotado">Agotado</span>}
              </div>

              {/* Información de inventario */}
              <div className="product-info">
                <p>Inventario Inicial: <strong>{initial}</strong></p>
                <p className={`stock-available ${isOutOfStock ? 'text-danger' : 'text-success'}`}>
                  Disponibles: <strong>{available}</strong>
                </p>
              </div>
              
              {/* Controles de entrada de cantidad y botón de reserva */}
              <div className="product-action-container">
                <input 
                  type="number" 
                  min="1" 
                  max={available}
                  placeholder="Cant."
                  value={quantities[product.id] || ''}
                  onChange={(e) => handleInputChange(product.id, e.target.value)}
                  disabled={isOutOfStock}
                  className="product-input-qty"
                />
                {/* Botón de reserva que se desactiva si no hay stock disponible */}
                <button 
                  onClick={() => handleAction(product.id)}
                  disabled={isOutOfStock}
                  className={`product-reserve-btn ${isOutOfStock ? 'btn-disabled' : ''}`}
                >
                  {isOutOfStock ? 'Sin Stock' : 'Reservar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}