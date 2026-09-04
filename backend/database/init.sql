-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Almacenaremos un hash simple o texto plano para el MVP
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar un usuario de prueba inicial (password: 123456)
-- Para producción usaríamos bcrypt, para el MVP con texto plano o hash básico es suficiente
INSERT INTO users (username, password) VALUES 
('cliente_prueba', '$2b$10$8Q6Ff.FwJtVd9yP3W2vF5xQ6L7rYm8sZ7T9m6KIXV8tq4l5YyW7gq8'),
('cliente_prueba2', '$2b$10$9vK3cR1z8yZ6Bw4vT5kY4J7qW9N2p0jL6X7vH7E1L5u2V12345678'),
('admin', '$2b$10$5p0jL6X7vH7E1L5u2V123456789uK3cR1z8yZ6Bw4vT5kY4J7qW9N2')
ON CONFLICT (username) DO NOTHING;

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    initial_stock INT NOT NULL CHECK (initial_stock >= 0),
    available_stock INT NOT NULL CHECK (available_stock >= 0)
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CANCELLED
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de prueba iniciales de productos
INSERT INTO products (name, initial_stock, available_stock) VALUES
('Consola portátil', 5, 5),
('Audífonos inalámbricos', 10, 10),
('Teclado mecánico', 8, 8)
ON CONFLICT DO NOTHING;