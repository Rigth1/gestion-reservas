const reservationService = require('../services/reservation.service');

// Controller para manejar las solicitudes HTTP relacionadas con reservas
class ReservationController {
  
  // Obtener todos los productos disponibles
  async getProducts(req, res, next) {
    try {
      const products = await reservationService.getProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las reservas del usuario autenticado con toda la información de los productos
  async getReservations(req, res, next) {
    try {
      const userId = req.user.userId;
      const reservations = await reservationService.getReservations(userId);
      res.json(reservations);
    } catch (error) {
      next(error);
    }
  }

  // Crear una nueva reserva con manejo de idempotencia, control de stock y filtros estrictos de seguridad
  async create(req, res, next) {
    try {
      const userId = req.user.userId;
      const { productId, product_id, quantity } = req.body;
      const resolvedProductId = productId || product_id; // Soporta ambos formatos de entrada
      const idempotencyKey = req.headers['idempotency-key'];

      // --- FILTROS DE SEGURIDAD Y VALIDACIÓN DE ENTRADA (Anti-vulnerabilidades / Anti-manipulación) ---

      // 1. Validar existencia y tipo del ID del producto (debe ser un número entero positivo)
      if (!resolvedProductId || isNaN(Number(resolvedProductId)) || Number(resolvedProductId) <= 0) {
        return res.status(400).json({ error: 'Identificador de producto inválido o no proporcionado.' });
      }

      // 2. Validar que la cantidad exista, sea un número finito y un entero estricto
      if (quantity === undefined || quantity === null || typeof quantity === 'boolean') {
        return res.status(400).json({ error: 'La cantidad es obligatoria.' });
      }

      const parsedQuantity = Number(quantity);

      // 3. Evitar valores negativos, cero, números flotantes maliciosos o desbordamientos (ej. cantidades absurdas > 100,000)
      if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0 || parsedQuantity > 100000) {
        return res.status(400).json({ error: 'La cantidad a reservar debe ser un número entero válido mayor a 0.' });
      }

      // ------------------------------------------------------------------------------------------

      // Llama al servicio con los datos ya saneados y validados
      const result = await reservationService.createReservation({
        userId, 
        product_id: Number(resolvedProductId), 
        quantity: parsedQuantity, 
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

  // Cancelar una reserva y devolver stock al inventario con manejo de idempotencia y validación de ID
  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Validar que el ID de la reserva en los parámetros sea un número válido
      if (!id || isNaN(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({ error: 'ID de reserva inválido.' });
      }

      // Llama al servicio para cancelar la reserva y manejar la lógica de idempotencia y control de stock
      const result = await reservationService.cancelReservation(Number(id), userId);
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