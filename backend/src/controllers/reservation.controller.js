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
      const reservations = await reservationService.getReservations();
      res.json(reservations);
    } catch (error) {
      next(error);
    }
  }
  // crear una nueva reserva con manejo de idempotencia y control de stock
  async create(req, res, next) {
    try {
      const { product_id, quantity } = req.body;
      const idempotencyKey = req.headers['idempotency-key'];

      if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Datos de entrada inválidos.' });
      }
      // llama al servicio para crear la reserva y manejar la lógica de idempotencia y control de stock
      const result = await reservationService.createReservation(product_id, Number(quantity), idempotencyKey);
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
      // llama al servicio para cancelar la reserva y manejar la lógica de idempotencia y control de stock
      const result = await reservationService.cancelReservation(id);
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