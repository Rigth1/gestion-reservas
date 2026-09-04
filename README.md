# MVP Full Stack - Sistema de Reservas e Inventario

Prueba técnica de desarrollo Full Stack implementada con Node.js, Express, PostgreSQL, React y Docker.

## 🚀 Requisitos Previos
* [Docker](https://www.docker.com/) y Docker Compose instalados en tu equipo.
* Node.js (opcional, solo si deseas ejecutar pruebas unitarias localmente sin Docker).

---

## 🛠️ Instrucciones de Ejecución (Docker)

Para levantar toda la solución (Base de datos PostgreSQL, Backend y Frontend) de manera automática:

1. Clona el repositorio y ubícate en la raíz del proyecto.
2. Ejecuta el siguiente comando para construir y levantar los contenedores en segundo plano:
```bash
   docker-compose up --build -d 
```
3. En caso de ser necesario reajustar el Stock sin ingresar a base de datos se puede bajar el servicio, eliminando las instancias y
   volviendo a ejecutar el comando anterior para volver a comenzar desde cero:
```bash
   docker-compose down -v
   docker-compose up --build -d
```

### Verificación de servicios
Puedes comprobar que los servicios estén corriendo correctamente ejecutando:

```bash
   docker-compose ps
```

# 🔍 Verificación y Diagnóstico (Health Check)

Puedes comprobar que el servidor backend y la conexión a la base de datos se encuentran operativos accediendo a:

Health Check: http://localhost:5000/health

Documentación de la API (Swagger): http://localhost:5000/api-docs

# 🧪 Ejecución de Pruebas Automatizadas

Para validar las reglas de negocio críticas (control de stock, transacciones concurrentes y manejo de idempotencia):

Importante: Hacer el test con stock disponible (despues de iniciar contenedor) o fallara la creacion y marcara como error 1 por falta de stock
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

# 💡 Decisiones Técnicas Destacadas
### 1.Control de Concurrencia para Prevención de Sobreventa
Problema / Contexto: Campañas de alta demanda donde múltiples usuarios intentan reservar unidades simultáneamente, arriesgándose a condiciones de carrera e inventario negativo.  

Alternativa seleccionada: Uso de bloqueos pesimistas a nivel de fila mediante transacciones SQL atómicas (SELECT ... FOR UPDATE en PostgreSQL).

Alternativas consideradas: Bloqueo optimista con versión de registro. Se descartó porque bajo alta concurrencia masiva genera demasiados reintentos fallidos, mientras que FOR UPDATE serializa de forma segura el acceso por producto garantizando consistencia estricta en el inventario.

Trade-offs / Riesgos: Ligero aumento en la latencia bajo contención extrema debido a la espera de liberación de bloqueos de fila, aceptable para mantener la consistencia financiera/de stock.

Cómo se verificó: Mediante pruebas automatizadas de integración en paralelo usando Jest y Supertest disparando peticiones concurrentes simultáneas.

### 2. Idempotencia ante Reintentos de Red
Problema / Contexto: Clientes con conexiones inestables que reenvían solicitudes de reserva duplicadas, lo que en sistemas tradicionales descuenta stock múltiple por error.

Alternativa seleccionada: Implementación de un mecanismo basado en una cabecera personalizada (idempotency-key) enviada desde el cliente, validando en base de datos si la transacción ya fue procesada previamente para retornar el mismo resultado sin reejecutar el descuento.

Alternativas consideradas: Deduplicación basada en el payload completo y timestamp en memoria. Se descartó porque un servidor con múltiples réplicas perdería estado y los timestamps son susceptibles a colisiones por retrasos de red.

Cómo se verificó: Pruebas automatizadas enviando peticiones duplicadas consecutivas con el mismo header y validando que el stock solo disminuyera una vez.

### 3. Arquitectura y Stack Tecnológico (Docker & MVP)
Problema / Contexto: Necesidad de entregar un MVP funcional, robusto y fácil de desplegar por cualquier evaluador en menos de 3 horas.  

Alternativa seleccionada: Contenedorización monolítica/orquestada mediante Docker Compose uniendo un backend en Node.js/Express, frontend desacoplado y PostgreSQL.

Trade-offs / Riesgos: Un entorno dockerizado simplifica drásticamente la ejecución local, cumpliendo con la exigencia de que no sea necesario configurar bases de datos manualmente.

# 🧩 Resolución de Ambigüedad de Negocio
### 1. Independencia y Ciclo de Vida de las Reservas
* **Situación identificada:** El requerimiento funcional indicaba que un cliente puede reservar varias veces el mismo producto, pero no especificaba si múltiples reservas independientes debían consolidarse en una sola o permanecer separadas.
* **Decisión tomada:** Se decidió permitir **reservas independientes**. Cada solicitud genera un registro autónomo con su propio identificador y ciclo de vida.
* **Consecuencias:** Facilita la trazabilidad individual y simplifica la lógica transaccional de cancelación, permitiendo que el usuario devuelva unidades específicas sin afectar otras reservas del mismo producto.

### 2. Pertenencia y Trazabilidad por Usuario
* **Situación identificada:** El enunciado original mencionaba que "un cliente" realiza reservas y las consulta, pero no detallaba cómo el backend debía asociar y filtrar los registros para garantizar que un usuario solo gestione sus propias reservas.
* **Decisión tomada:** Se incorporó una relación explícita mediante una clave foránea (`user_id`) en la tabla de reservas de la base de datos, vinculando cada operación al usuario autenticado vía JWT.
* **Consecuencias:** Garantiza un aislamiento adecuado de los datos a nivel de sesión y simplifica el endpoint de consulta (`GET /reservations`), permitiendo filtrar o auditar de forma precisa qué cliente posee cada reserva activa.

### 3. Mecanismo de Deduplicación por Red (Idempotencia)
* **Situación identificada:** El cliente podía reenviar solicitudes por problemas de conectividad, pero no se especificaba cómo identificar de forma unívoca la operación lógica.
* **Decisión tomada:** Se adoptó el uso de la cabecera `idempotency-key`. Si el cliente reintenta con la misma llave, el sistema no duplica la reserva ni descuenta stock de nuevo.
* **Consecuencias:** Mayor resiliencia ante fallos de red del cliente sin comprometer la integridad del inventario.

### 4. Consistencia ante Cancelaciones Concurrente o Repetidas
* **Situación identificada:** Una reserva cancelada podía recibir múltiples peticiones de anulación posteriores.
* **Decisión tomada:** Se validó el estado actual de la reserva dentro de una transacción; si ya está inactiva, se bloquea la reejecución de devolución de stock.
* **Consecuencias:** Se evita inflar artificialmente el inventario disponible por reintentos duplicados de cancelación.

# 🤖 Registro de Uso de Inteligencia Artificial
Herramienta: Gemini (Google)
   1. Asistencia en el desarrollo del BackEnd y pruebas funcionales (indicando la estructura del proyecto mediante prompts).
   2. Asistencia en el desarrollo de componentes React, separación de estilos CSS limpios.
   3. Asistencia para generar los archivos de docker rapidamente.
   4. Depuración de errores generados durante las ejecuciones.

Herramienta: GitHub Copilot (Visual Studio Code)
   1. Completacion de codigo en VS para generar funciones rapidamente
   2. Documentacion de funcionalidades
   3. integracion de swagger

# Documentación de la API - MVP Gestión de Inventario y Reservas

## 1. Autenticación y Seguridad
* **Mecanismo:** JSON Web Tokens (JWT).
* **Cabecera requerida para rutas protegidas:** `Authorization: Bearer <TOKEN>`
* **Cabecera opcional para control de concurrencia/idempotencia:** `idempotency-key: <STRING_UNICO>`

---

## 2. Endpoints Disponibles

### A. Autenticación
* **POST /auth/login**
  * **Descripción:** Autentica a un usuario y genera un token JWT de acceso.
  * **Cuerpo de la petición (Request Body):**
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  * **Respuestas exitosas:**
    * `200 OK`: Retorna el token de sesión.
      ```json
      {
        "token": "eyJhbGciOiJIUzI1Ni..."
      }
      ```
  * **Errores comunes:**
    * `401 Unauthorized`: Credenciales inválidas.

---

### B. Productos
* **GET /products**
  * **Descripción:** Consulta el catálogo general de productos y su inventario disponible en tiempo real. *(Ruta protegida por JWT)*
  * **Cuerpo de la petición:** Ninguno (Método GET).
  * **Respuestas exitosas:**
    * `200 OK`: Retorna un arreglo con los productos.
      ```json
      [
        {
          "id": 1,
          "name": "Consola portátil",
          "initial_stock": 5,
          "available_stock": 5
        }
      ]
      ```

---

### C. Reservas
* **GET /reservations**
  * **Descripción:** Lista todas las reservas registradas en el sistema (activas e historiales). *(Ruta protegida)*
  * **Respuestas exitosas:**
    * `200 OK`: Arreglo de reservas.
      ```json
      [
        {
          "id": 12,
          "product_id": 1,
          "product_name": "Consola portátil",
          "quantity": 2,
          "status": "active"
        }
      ]
      ```

* **POST /reservations**
  * **Descripción:** Crea una nueva reserva asegurando control transaccional (bloqueo `FOR UPDATE`) y soporte de idempotencia mediante la cabecera `idempotency-key`. *(Ruta protegida)*
  * **Cabeceras opcionales:** 
    * `idempotency-key`: Clave única generada por el cliente para evitar duplicados por reintentos de red.
  * **Cuerpo de la petición:**
    ```json
    {
      "productId": 1,
      "quantity": 2
    }
    ```
  * **Respuestas exitosas:**
    * `201 Created`: Reserva procesada e inventario descontado con éxito.
  * **Errores que el consumidor debe conocer:**
    * `400 Bad Request`: Datos de entrada inválidos o **inventario insuficiente** (no hay stock disponible para la cantidad solicitada).
    * `401 Unauthorized`: Token ausente o inválido.

* **POST /reservations/:id/cancel**
  * **Descripción:** Cancela una reserva activa específica y restaura automáticamente las unidades al stock del producto. Mantiene consistencia lógica ante peticiones repetidas de cancelación. *(Ruta protegida)*
  * **Parámetros de ruta:** `id` (ID numérico de la reserva).
  * **Respuestas exitosas:**
    * `200 OK`: Reserva cancelada y stock restaurado correctamente.
  * **Errores comunes:**
    * `404 Not Found`: La reserva no existe.
    * `400 Bad Request`: La reserva ya se encontraba cancelada previamente.

---

### 3. Manejo Global de Errores y Middleware (`error.middleware`)
El sistema cuenta con un middleware centralizado de manejo de errores ubicado en el backend que intercepta cualquier excepción no controlada o error de validación de negocio.

* **Formato de respuesta estándar ante errores:**
  Siempre que ocurra una falla (por ejemplo, falta de stock, credenciales inválidas, error de sintaxis JSON o fallo interno), el middleware responderá con un código HTTP acorde (`400`, `401`, `404`, `500`) y una estructura JSON uniforme:
  ```json
  {
     "error": "Descripción clara del error para que el cliente o la interfaz la pueda mostrar."
  }
  ```
### Ejemplos comunes manejados por el middleware:

Inventario Insuficiente / Stock agotado:

Código HTTP: 400 Bad Request

Respuesta: 
```json
   {"error": "Stock insuficiente para completar la reserva."}
```

Idempotencia duplicada / Conflicto:

Código HTTP: 400 Bad Request o 409 Conflict (según implementación)

Respuesta: 
```json
   {"error": "La clave de idempotencia ya fue procesada previamente."}
```

Errores de validación o sintaxis:

Código HTTP: 400 Bad Request

Respuesta: 
```json
   {"error": "Estructura de petición inválida o faltan campos obligatorios."}
```
Errores internos no controlados (Catch-all):

Código HTTP: 500 Internal Server Error

Respuesta: 
```json
   {"error": "Ocurrió un error interno en el servidor."}
```
