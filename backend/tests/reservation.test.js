const request = require('supertest');
const app = require('../src/server');

describe('Pruebas Automatizadas de Reglas de Negocio - Backend', () => {
  let token;

  beforeAll(async () => {
    // Autenticarse con el usuario de prueba inicial para obtener el token JWT real
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'cliente_prueba', password: '123456' });
    
    token = res.body.token;
  });

  test('1. Debe consultar los productos disponibles correctamente', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('2. Debe rechazar una reserva si no existe inventario suficiente', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: 1, quantity: 9999 }); // Cantidad imposible

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBeDefined();
  });

  test('3. Debe garantizar la idempotencia ante solicitudes repetidas con la misma llave', async () => {
    const idempotencyKey = 'test-uuid-key-12345';
    
    // Primera solicitud de reserva
    const firstRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .set('idempotency-key', idempotencyKey)
      .send({ product_id: 2, quantity: 1 });

    expect(firstRes.statusCode).toEqual(201);
    const firstReservationId = firstRes.body.reservation.id;

    // Solicitud repetida con la misma llave (simulando reintento por fallo de red)
    const secondRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .set('idempotency-key', idempotencyKey)
      .send({ product_id: 2, quantity: 1 });

    expect(secondRes.statusCode).toEqual(201);
    expect(secondRes.body.idempotentHit).toBeTruthy();
    expect(secondRes.body.reservation.id).toEqual(firstReservationId);
  });
});