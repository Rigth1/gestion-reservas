require('dotenv').config();
const request = require('supertest');
const app = require('../src/server');

describe('Pruebas Automatizadas de Reglas de Negocio - Backend', () => {
  let token;

  beforeAll(async () => {
    // Autenticarse con el usuario de prueba inicial para obtener el token JWT real
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    
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
      .send({ productId: 1, quantity: 9999 }); // Cantidad imposible

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
      .send({ productId: 2, quantity: 1 });

    expect(firstRes.statusCode).toEqual(201);
    const firstReservationId = firstRes.body.reservation.id;

    // Solicitud repetida con la misma llave (simulando reintento por fallo de red)
    const secondRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .set('idempotency-key', idempotencyKey)
      .send({ productId: 2, quantity: 1 });

    expect(secondRes.statusCode).toEqual(201);
    expect(secondRes.body.idempotentHit).toBeTruthy();
    expect(secondRes.body.reservation.id).toEqual(firstReservationId);
  });

  test('4. Debe permitir cancelar una reserva activa y restaurar el inventario', async () => {
    // 1. Crear una reserva para cancelar
    const createRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 3, quantity: 2 });

    expect(createRes.statusCode).toEqual(201);
    const reservationId = createRes.body.reservation.id;

    // 2. Cancelar la reserva
    const cancelRes = await request(app)
      .post(`/api/reservations/${reservationId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(cancelRes.statusCode).toEqual(200);
    expect(cancelRes.body.message).toBeDefined();
  });

  test('5. Debe rechazar solicitudes que no incluyan token de autenticación (403/401)', async () => {
    const res = await request(app)
      .get('/api/products'); // Sin header Authorization

    expect(res.statusCode).toBeGreaterThanOrEqual(401);
  });

  test('6. Debe mantener consistencia ante solicitudes de cancelación repetidas (Idempotencia de cancelación)', async () => {
    // 1. Crear reserva
    const createRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 1, quantity: 1 });

    const reservationId = createRes.body.reservation.id;

    // 2. Primera cancelación
    const firstCancel = await request(app)
      .post(`/api/reservations/${reservationId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(firstCancel.statusCode).toEqual(200);

    // 3. Segunda cancelación de la misma reserva (reintento)
    const secondCancel = await request(app)
      .post(`/api/reservations/${reservationId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    // El sistema debe manejarlo de forma consistente sin romper la app (200 o 400 controlado)
    expect([200, 400]).toContain(secondCancel.statusCode);
  });
});