const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET;
const logger = require('../utils/logger');

// Controlador para manejar la autenticación segura de usuarios
class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
      }

      // Buscar al usuario en la base de datos
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      const user = result.rows[0]; 

      // Validación segura de contraseña usando bcrypt de forma asíncrona
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        logger.error('LOGIN_FAILED', new Error('Invalid password'), { username });
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      // Generar token JWT con el ID y nombre del usuario
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

      logger.info('LOGIN_SUCCESS', { userId: user.id, username });
      res.json({ token, username: user.username });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();