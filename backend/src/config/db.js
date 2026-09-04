const { Pool } = require('pg');

// Configuración de la conexión a la base de datos PostgreSQL usando variables de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Conectado a la base de datos PostgreSQL');
});

module.exports = pool;