const reservationService = require('../services/reservation.service');
// Controller para manejar las solicitudes HTTP relacionadas con reservas
class ReservationController {
    // obtener todos los productos
  async getProducts(req, res, next) {
    try {
      const products = await reservationService.getProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
  // obtener todas las reservas con toda la informacion de los productos
  async getReservations(req, res, next) {
    try {
      const userId = req.user.userId;
      const reservations = await reservationService.getReservations(userId);
      res.json(reservations);
    } catch (error) {
      next(error);
    }
  }
  // crear una nueva reserva con manejo de idempotencia y control de stock
  // crear una nueva reserva con manejo de idempotencia y control de stock
  async create(req, res, next) {
    try {
      const userId = req.user.userId;
      const { productId, product_id, quantity } = req.body;
      const resolvedProductId = productId || product_id; // Soporta ambos formatos
      const idempotencyKey = req.headers['idempotency-key'];

      if (!resolvedProductId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Datos de entrada inválidos.' });
      }
      
      // llama al servicio con el ID de producto resuelto
      const result = await reservationService.createReservation({
        userId, 
        product_id: resolvedProductId, 
        quantity: Number(quantity), 
        idempotencyKey
      });
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'INSUFFICIENT_STOCK') {
        return res.status(400).json({ error: 'No existe inventario suficiente para la reserva.' });
      }
      if (error.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({ error: 'El producto no existe.' });
      }
      next(error);
    }
  }
 // cancelar una reserva y devolver stock al inventario con manejo de idempotencia
  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      // llama al servicio para cancelar la reserva y manejar la lógica de idempotencia y control de stock
      const result = await reservationService.cancelReservation(id, userId);
      res.json(result);
    } catch (error) {
      if (error.message === 'RESERVATION_NOT_FOUND') {
        return res.status(404).json({ error: 'La reserva no fue encontrada.' });
      }
      next(error);
    }
  }
}

module.exports = new ReservationController();