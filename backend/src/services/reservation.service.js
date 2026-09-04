const pool = require('../config/db');
const logger = require('../utils/logger');

// Service para manejar la lógica de reservas e inventario de forma transaccional y segura
class ReservationService {
  
  // Obtener todos los productos disponibles
  async getProducts() {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    return result.rows;
  }

  // Obtener todas las reservas con información detallada del producto y usuario asociado
  async getReservations(user_id) {
    const result = await pool.query(`
      SELECT r.id, r.quantity, r.status, r.created_at, p.name as product_name, r.user_id
      FROM reservations r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [user_id]);
    return result.rows;
  }

  // Crear una nueva reserva con manejo de idempotencia, transacciones y control estricto de stock por usuario
  async createReservation({ product_id, quantity, idempotencyKey, userId }) {
    const client = await pool.connect();
    try {
      // Iniciar transacción para asegurar atomicidad y consistencia
      await client.query('BEGIN');

      // 1. Validar idempotencia si se provee la llave para evitar duplicados por reintentos de red
      if (idempotencyKey) {
        const existingRes = await client.query(
          'SELECT * FROM reservations WHERE idempotency_key = $1',
          [idempotencyKey]
        );
        if (existingRes.rows.length > 0) {
          await client.query('COMMIT');
          logger.info('RESERVATION_IDEMPOTENT_HIT', { idempotencyKey, reservationId: existingRes.rows[0].id });
          return { reservation: existingRes.rows[0], idempotentHit: true };
        }
      }

      // 2. Bloquear y consultar producto con FOR UPDATE para prevenir race conditions ante solicitudes simultáneas
      const productRes = await client.query(
        'SELECT * FROM products WHERE id = $1 FOR UPDATE',
        [product_id]
      );

      if (productRes.rows.length === 0) {
        logger.error('RESERVATION_REJECTED', new Error('PRODUCT_NOT_FOUND'), { productId: product_id, quantity, userId });
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const product = productRes.rows[0];

      // 3. Validar inventario suficiente (nunca permitir valores negativos)
      if (product.available_stock < quantity) {
        logger.error('RESERVATION_REJECTED', new Error('INSUFFICIENT_STOCK'), { productId: product_id, quantity, available: product.available_stock, userId });
        throw new Error('INSUFFICIENT_STOCK');
      }

      // 4. Descontar stock de forma segura
      const newAvailable = product.available_stock - quantity;
      await client.query(
        'UPDATE products SET available_stock = $1 WHERE id = $2',
        [newAvailable, product_id]
      );

      // 5. Crear la reserva asociada al usuario autenticado
      const insertRes = await client.query(
        `INSERT INTO reservations (user_id, product_id, quantity, status, idempotency_key) 
         VALUES ($1, $2, $3, 'ACTIVE', $4) RETURNING *`,
        [userId, product_id, quantity, idempotencyKey]
      );

      // Commit de la transacción si todo fue exitoso
      await client.query('COMMIT');
      logger.info('RESERVATION_ACCEPTED', { reservationId: insertRes.rows[0].id, userId, productId: product_id, quantity });
      return { reservation: insertRes.rows[0], idempotentHit: false };
    } catch (error) {
      // Rollback en caso de error para mantener la consistencia de la base de datos
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Cancelar una reserva activa y devolver el stock al inventario
  async cancelReservation(reservationId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Buscar reserva con bloqueo para evitar condiciones de carrera concurrentes
      const resQuery = await client.query(
        'SELECT * FROM reservations WHERE id = $1 FOR UPDATE',
        [reservationId]
      );

      if (resQuery.rows.length === 0) {
        logger.error('CANCELLATION_FAILED', new Error('RESERVATION_NOT_FOUND'), { reservationId, userId });
        throw new Error('RESERVATION_NOT_FOUND');
      }

      const reservation = resQuery.rows[0];

      // Si ya está cancelada, mantener estado consistente sin re-sumar stock (idempotencia en cancelación)
      if (reservation.status === 'CANCELLED') {
        await client.query('COMMIT');
        logger.info('CANCELLATION_ALREADY_PROCESSED', { reservationId, userId });
        return { message: 'La reserva ya se encontraba cancelada.', reservation };
      }

      // Marcar como cancelada
      await client.query(
        "UPDATE reservations SET status = 'CANCELLED' WHERE id = $1",
        [reservationId]
      );

      // Devolver unidades al inventario del producto
      await client.query(
        'UPDATE products SET available_stock = available_stock + $1 WHERE id = $2',
        [reservation.quantity, reservation.product_id]
      );
      // Commit de la transacción si todo fue exitoso
      await client.query('COMMIT');
      // Log de auditoría para seguimiento de cancelaciones y restauración de stock
      logger.info('RESERVATION_CANCELLED', { reservationId, userId, restoredStock: reservation.quantity, productId: reservation.product_id });
      return { message: 'Reserva cancelada exitosamente y stock devuelto.' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ReservationService();