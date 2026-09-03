// logger para registrar la informacion de las acciones y errores en la aplicacion
const logger = {
    // log de informacion con toda la informacion de acciones realizadas y detalles adicionales
  info: (action, details) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      action,
      ...details
    }));
  },
  // log de error con toda la informacion de errores ocurridos y detalles adicionales
  error: (action, err, details = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      action,
      message: err.message,
      ...details
    }));
  }
};

module.exports = logger;