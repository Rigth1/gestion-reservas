const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// middleware para verificar el token JWT en las solicitudes que entran para verificar la autenticidad y que el usuario esta loggeado
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado. Token faltante o inválido.' });
  }
  // extraer el token del encabezado
  const token = authHeader.split(' ')[1];
  try {
    // verificar el token usando la clave secreta y decodificarlo para obtener la informacion del usuario
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

const generateTokenMock = (req, res) => {
  // Endpoint de utilidad para obtener un token de prueba para el cliente/frontend
  const token = jwt.sign({ clientId: req.body.clientId || 1, role: 'client' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
};

module.exports = { verifyToken, generateTokenMock };