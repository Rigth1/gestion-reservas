const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('UNEXPECTED_SERVER_ERROR', err, { path: req.path, method: req.method });
  
  // No exponer detalles internos del stack trace al cliente
  res.status(500).json({
    error: 'Ocurrió un error interno en el procesamiento de la solicitud.',
  });
};

module.exports = errorHandler;