# MVP Full Stack - Sistema de Reservas e Inventario

Prueba técnica de desarrollo Full Stack implementada con Node.js, Express, PostgreSQL, React y Docker.

## 🚀 Requisitos Previos
* [Docker](https://www.docker.com/) y Docker Compose instalados en tu equipo.
* Node.js (opcional, solo si deseas ejecutar pruebas unitarias localmente sin Docker).

---

## 🛠️ Instrucciones de Ejecución (Docker)

Para levantar toda la solución (Base de datos PostgreSQL y Backend) de manera automática:

1. Clona el repositorio y ubícate en la raíz del proyecto.
2. Ejecuta el siguiente comando para construir y levantar los contenedores en segundo plano:
```bash
   docker-compose up --build -d 
```

# Verifica que los servicios estén corriendo correctamente

```bash
   docker-compose ps
```

# 🔍 Verificación y Diagnóstico (Health Check)

Puedes comprobar que el servidor backend y la conexión a la base de datos se encuentran operativos accediendo a:

Health Check: http://localhost:5000/health

Documentación de la API (Swagger): http://localhost:5000/api-docs

# 🧪 Ejecución de Pruebas Automatizadas

Para validar las reglas de negocio críticas (control de stock, transacciones concurrentes y manejo de idempotencia):

1. Ingresa al contenedor del backend o ejecuta las pruebas mediante npm:
``` bash
    cd backend
    npm install
    npm test
```
2. Las pruebas automatizadas con Jest y Supertest verificarán:

Consulta correcta de productos.

Rechazo estricto de reservas ante inventario insuficiente.

Idempotencia ante reintentos de red usando la cabecera idempotency-key.

# Decisiones Técnicas Destacadas

Concurrencia: Uso de bloqueos a nivel de fila (SELECT ... FOR UPDATE) dentro de transacciones SQL atómicas para evitar race conditions y sobreventa de inventario.

Idempotencia: Implementación de un mecanismo basado en Idempotency-Key para asegurar que solicitudes repetidas por fallos de red no descuenten inventario doblemente ni creen reservas duplicadas.

Seguridad: Autenticación basada en JWT y cifrado seguro de credenciales con bcrypt.
