const pool = require('../config/db');
const logger = require('../utils/logger');

// Service para manejar la lógica de reservas
class ReservationService {
    // Obtener todos los productos
  async getProducts() {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    return result.rows;
  }
  // Obtener todas las reservas con información del producto
  async getReservations() {
    const result = await pool.query(`
      r.id, r.quantity, r.status, r.created_at, p.name as product_name
      FROM reservations r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  }
  // Crear una nueva reserva con manejo de idempotencia y control de stock
  async createReservation(productId, quantity, idempotencyKey) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Validar idempotencia si se provee la llave
      if (idempotencyKey) {
        const existingRes = await client.query(
          'SELECT * FROM reservations WHERE idempotency_key = $1',
          [idempotencyKey]
        );
        // Si ya existe una reserva con la misma llave, retornar la reserva existente
        if (existingRes.rows.length > 0) {
          await client.query('COMMIT');
          logger.info('RESERVATION_IDEMPOTENT_HIT', { idempotencyKey, reservationId: existingRes.rows[0].id });
          return { reservation: existingRes.rows[0], idempotentHit: true };
        }
      }

      // 2. Bloquear y consultar producto con FOR UPDATE para prevenir race conditions
      const productRes = await client.query(
        'SELECT * FROM products WHERE id = $1 FOR UPDATE',
        [productId]
      );

      if (productRes.rows.length === 0) {
        logger.error('RESERVATION_REJECTED', new Error('PRODUCT_NOT_FOUND'), { productId, quantity, idempotencyKey });
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const product = productRes.rows[0];

      // 3. Validar inventario suficiente
      if (product.available_stock < quantity) {
        logger.error('RESERVATION_REJECTED', new Error('INSUFFICIENT_STOCK'), { productId, quantity, idempotencyKey });
        throw new Error('INSUFFICIENT_STOCK');
      }

      // 4. Descontar stock
      const newAvailable = product.available_stock - quantity;
      await client.query(
        'UPDATE products SET available_stock = $1 WHERE id = $2',
        [newAvailable, productId]
      );

      // 5. Crear la reserva
      const insertRes = await client.query(
        `INSERT INTO reservations (product_id, quantity, status, idempotency_key) 
         VALUES ($1, $2, 'ACTIVE', $3) RETURNING *`,
        [productId, quantity, idempotencyKey]
      );
    // commit de la transaccion si todo fue exitosos y en caso de error hacer rollback para mantener la consistencia de la base de datos
      await client.query('COMMIT');
      logger.info('RESERVATION_ACCEPTED', { reservationId: insertRes.rows[0].id, productId, quantity, idempotencyKey });
      return { reservation: insertRes.rows[0], idempotentHit: false };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Cancelar una reserva y devolver stock al inventario con manejo de idempotencia
  async cancelReservation(reservationId) {
    const client = await pool.connect();
    try {
    // iniciar transaccion para asegurar que todas las operaciones se realicen de manera atomica y consistente
      await client.query('BEGIN');

      // Buscar reserva con bloqueo
      const resQuery = await client.query(
        'SELECT * FROM reservations WHERE id = $1 FOR UPDATE',
        [reservationId]
      );

      if (resQuery.rows.length === 0) {
        logger.error('CANCELLATION_FAILED', new Error('RESERVATION_NOT_FOUND'), { reservationId });
        throw new Error('RESERVATION_NOT_FOUND');
      }

      const reservation = resQuery.rows[0];

      // Si ya está cancelada, mantener estado consistente sin re-sumar stock (idempotencia en cancelación)
      if (reservation.status === 'CANCELLED') {
        await client.query('COMMIT');
        logger.info('CANCELLATION_ALREADY_PROCESSED', { reservationId });
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
      // commit de la transaccion si todo fue exitosos y en caso de error hacer rollback para mantener la consistencia de la base de datos
      await client.query('COMMIT');
      logger.info('RESERVATION_CANCELLED', { reservationId, restoredStock: reservation.quantity, productId: reservation.product_id });
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