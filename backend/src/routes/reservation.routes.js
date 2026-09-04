const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const reservationController = require('../controllers/reservation.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica un usuario y retorna un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticación exitosa con token JWT
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/auth/login', authController.login);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Consulta la lista de productos disponibles e inventario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente
 */
router.get('/products', verifyToken, reservationController.getProducts);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Consulta todas las reservas realizadas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas obtenida correctamente
 *   post:
 *     summary: Crea una nueva reserva de producto (con manejo de concurrencia e idempotencia)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: idempotency-key
 *         schema:
 *           type: string
 *         required: false
 *         description: Llave única para prevenir duplicados por reintentos de red
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Inventario insuficiente o datos inválidos
 */
router.get('/reservations', verifyToken, reservationController.getReservations);
router.post('/reservations', verifyToken, (req, res, next) => {
  // Inyectamos el userId decodificado del token JWT hacia el controlador
  req.body.userId = req.user.userId;
  reservationController.create(req, res, next);
});

/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   post:
 *     summary: Cancela una reserva activa y restaura el inventario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *       404:
 *         description: Reserva no encontrada
 */
router.post('/reservations/:id/cancel', verifyToken, (req, res, next) => {
  req.body.userId = req.user.userId;
  reservationController.cancel(req, res, next);
});

module.exports = router;