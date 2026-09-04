const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Reservas e Inventario - MVP Full Stack',
      version: '1.0.0',
      description: 'Documentación de la API para gestión de productos, reservas con control de concurrencia e idempotencia, y autenticación segura con JWT.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de Desarrollo / Docker',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce tu token JWT obtenido en /api/auth/login con el formato: Bearer <token>',
        },
      },
    },
    // Seguridad global opcional o por defecto si se requiere, 
    // pero cada ruta en los comentarios JSDoc ya incluye su tag security: - bearerAuth: []
  },
  apis: ['./src/routes/*.routes.js'], // Ruta donde lee los comentarios JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;