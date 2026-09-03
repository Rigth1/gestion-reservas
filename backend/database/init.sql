CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    initial_stock INT NOT NULL CHECK (initial_stock >= 0),
    available_stock INT NOT NULL CHECK (available_stock >= 0)
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CANCELLED
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de prueba iniciales solicitados en la prueba
INSERT INTO products (name, initial_stock, available_stock) VALUES
('Consola portátil', 5, 5),
('Audífonos inalámbricos', 10, 10),
('Teclado mecánico', 8, 8)
ON CONFLICT DO NOTHING;