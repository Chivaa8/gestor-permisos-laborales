# Gestor de permisos laborales de TravelConnect

Aplicación web para gestionar permisos laborales de empleados. El proyecto esta dividido en frontend Angular, backend Node.js/Express y base de datos MongoDB. Incluye autenticación con JWT, roles de usuario, gestion de empleados, gestion de permisos, dashboard con graficos, recuperación de contrasena por email, documentacion Swagger y dockerizacion completa.

## Tecnologias

- Frontend: Angular 20, TypeScript, CSS responsive, Vitest y Playwright.
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Nodemailer.
- Documentacion API: Swagger/OpenAPI.
- Base de datos: MongoDB.
- Despliegue local: Docker Compose con tres servicios: frontend, backend y MongoDB.

## Funcionalidades principales

La aplicación gestiona permisos laborales, vacaciones y ausencias mediante paneles diferenciados para administradores y usuarios.

### Autenticacion

- Login con usuario y password.
- Registro publico de usuarios con rol `basic`.
- Recuperacion de contrasena por email con token temporal de 5 minutos.
- Cambio de contrasena desde el perfil, validando password actual, repetición y que la nueva no sea igual a la anterior.
- Protección de rutas con JWT.

### Rol admin

- Dashboard con resumen visual de permisos por estado.
- Graficos de roles y actividad de empleados.
- CRUD de empleados:
  - Contratar empleados.
  - Editar empleados.
  - Listar plantilla activa.
  - Despedir empleados.
  - Gestionar sueldo y fecha de finalizacion de contrato.
  - Subir o bajar sueldo desde el panel de administracion.
- Al despedir un empleado se eliminan automáticamente sus permisos asociados.
- CRUD de permisos:
  - Crear permisos.
  - Listar todos los permisos.
  - Filtrar por estado, creador o tramitador.
  - Aprobar o rechazar permisos pendientes.
  - Eliminar permisos.
- Gestión de vacaciones: consulta, filtros, aprobación, rechazo, eliminación y saldo anual por tipo.
- Calendario general de vacaciones y permisos de toda la plantilla.
- Agrupación de días con más de dos empleados ausentes y detalle al pulsar.
- Gestión de perfil propio:
  - Editar datos existentes.
  - Anadir informacion pendiente.
  - Cambiar foto.
  - Cambiar contrasena.
  - Cerrar sesion.

### Rol basic

- Crear permisos propios.
- Ver el historial de permisos creados por el usuario.
- Los permisos se crean automáticamente en estado `pendiente`.
- La fecha de creación se asigna desde el sistema.
- No se permite crear permisos con fechas anteriores al dia actual.
- Solicitar vacaciones, días personales y días no retribuidos.
- Consultar su saldo anual y ver sus ausencias en el calendario.

### Interfaz

- Marca TravelConnect con logo propio.
- Selector de idioma: castellano, catalan e ingles.
- Selector de modo dia y modo noche (el modo noche necesita todavia bastantes mejoras visuales en algunas secciones).
- Dashboard visual con graficos.
- Panel de perfil desplegable.
- Vista diferenciada para usuarios `admin` y `basic`.
- Calendario mensual general de vacaciones y permisos.
- Calendario grande de disponibilidad: verde disponible, amarillo difícil y rojo no laborable.
- Los sábados, domingos y festivos oficiales de España, Cataluña y Barcelona no descuentan días.
- Calendario laboral 2026 con los festivos locales de Barcelona del 25 de mayo y 24 de septiembre.

## Estructura del proyecto

```text
gestor-permisos-laborales/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── server.js
│   ├── test/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── models/
│   │       ├── pages/
│   │       └── services/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Instalación local

### Requisitos

- Node.js 22 o superior.
- MongoDB local o Docker.
- npm.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Por defecto el backend se levanta en:

```text
http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Por defecto el frontend se levanta en:

```text
http://localhost:4200
```

## Variables de entorno

El backend usa un archivo `.env`. Hay un ejemplo disponible en:

```text
backend/.env.example
```

Variables principales:

```env
PORT=3001
MONGO_DB_URI=mongodb://127.0.0.1:27017/gestorPermisosLaborables
JWT_SECRET=cambia-este-secreto-en-produccion
BCRYPT_ROUNDS=10
FRONTEND_URL=http://localhost:4200
```

Para activar la recuperacion real de contraseña por correo:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM=TravelConnect <tu_correo@gmail.com>
```

Importante: `.env` esta ignorado por Git para no subir secretos al repositorio.

## Docker

El proyecto está preparado para ejecutarse completo con Docker Compose. La configuración levanta la aplicación en tres servicios independientes:

- `frontend`: aplicación Angular compilada y servida con Nginx.
- `backend`: API REST desarrollada con Node.js y Express.
- `mongodb`: base de datos MongoDB con persistencia en volumen.

Las imágenes propias del proyecto están publicadas en Docker Hub:

```text
chivaa8/travelconnect-frontend:1.0
chivaa8/travelconnect-backend:1.0
```

La imagen de MongoDB utiliza la imagen oficial:

```text
mongo:7
```

El archivo `docker-compose.yml` también define:

- Red personalizada `travelconnect-net` para aislar la comunicación entre contenedores.
- Volumen `mongodb_data` para conservar los datos de MongoDB aunque se reinicien los contenedores.
- Variables de entorno para configurar backend, conexión con MongoDB, JWT y correo SMTP.

Arrancar todo construyendo las imágenes localmente:

```bash
docker compose up --build
```

Arrancar usando las imágenes ya publicadas en Docker Hub:

```bash
docker compose up
```

URLs:

```text
Frontend: http://localhost:4200
Backend:  http://localhost:3001
Swagger:  http://localhost:3001/api-docs
MongoDB:  mongodb://localhost:27017
```

Parar los contenedores:

```bash
docker compose down
```

Parar y eliminar también el volumen de MongoDB:

```bash
docker compose down -v
```

Comandos usados para publicar las imágenes:

```bash
docker compose build
docker tag gestor-permisos-laborales-backend:latest chivaa8/travelconnect-backend:1.0
docker tag gestor-permisos-laborales-frontend:latest chivaa8/travelconnect-frontend:1.0
docker push chivaa8/travelconnect-backend:1.0
docker push chivaa8/travelconnect-frontend:1.0
```

## Documentación Swagger

La API esta documentada con Swagger y se puede consultar con el backend arrancado:

```text
http://localhost:3001/api-docs
```

Incluye documentacion para:

- Auth.
- Empleados.
- Permisos.
- Tipos de permiso.
- Vacaciones.
- Notificaciones.

## Endpoints principales

### Auth

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/api/auth/login` | Iniciar sesion |
| POST | `/api/auth/register` | Crear usuario basic |
| POST | `/api/auth/forgot-password` | Solicitar email de recuperacion |
| POST | `/api/auth/reset-password` | Cambiar contrasena con token |

### Empleados

| Metodo | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/empleados` | Listar empleados |
| GET | `/api/empleados/:id` | Ver empleado |
| POST | `/api/empleados` | Contratar empleado |
| PUT | `/api/empleados/:id` | Editar empleado |
| PUT | `/api/empleados/:id/password` | Cambiar contrasena |
| PUT | `/api/empleados/:id/subir-sueldo` | Subir sueldo |
| PUT | `/api/empleados/:id/bajar-sueldo` | Bajar sueldo |
| DELETE | `/api/empleados/:id` | Despedir empleado |

### Permisos

| Metodo | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/permisos/crear` | Crear permiso |
| GET | `/api/permisos` | Listar permisos con filtros |
| GET | `/api/permisos/:id` | Ver permiso |
| GET | `/api/permisos/:id/misPermisos` | Ver permisos de un usuario |
| PUT | `/api/permisos/:id/aprobado` | Aprobar permiso |
| PUT | `/api/permisos/:id/rechazado` | Rechazar permiso |
| DELETE | `/api/permisos/:id` | Eliminar permiso |
| GET | `/api/permisos/dashboard/estados` | Datos del dashboard |

### Tipos de permiso

| Metodo | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/tipos-permiso` | Listar tipos de permiso |

### Vacaciones

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/api/vacaciones` | Crear una solicitud |
| GET | `/api/vacaciones` | Listar todas las solicitudes como admin |
| GET | `/api/vacaciones/mias` | Consultar las solicitudes propias |
| GET | `/api/vacaciones/saldo/:id` | Consultar el saldo anual |
| PUT | `/api/vacaciones/:id/aprobar` | Aprobar una solicitud |
| PUT | `/api/vacaciones/:id/rechazar` | Rechazar una solicitud |
| DELETE | `/api/vacaciones/:id` | Eliminar una solicitud |
| GET | `/api/vacaciones/dashboard/resumen` | Resumen anual de la plantilla |

Los tipos de permiso se crean automáticamente al arrancar el backend si no existen.

## Pruebas

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

### Pruebas E2E con Playwright

La prueba E2E automatiza un flujo completo desde la interfaz: registra a `Oriol Tester`, inicia sesion, comprueba la proteccion de rutas y crea un permiso. Al terminar, elimina automaticamente el usuario y sus datos de prueba.

Antes de ejecutarla, los tres servicios de Docker deben estar funcionando:

```bash
docker compose up -d
```

Ejecucion normal en segundo plano:

```bash
cd frontend
npm run e2e
```

Ejecucion mostrando el navegador:

```bash
cd frontend
npx playwright test --headed
```

Modo interactivo de Playwright, recomendado para una demostracion:

```bash
cd frontend
npx playwright test --ui
```

La prueba se encuentra en `frontend/e2e/login-create-permit.spec.ts`.

### Build frontend

```bash
cd frontend
npm run build
```

## Flujo basico de uso

1. Arrancar MongoDB, backend y frontend.
2. Entrar en `http://localhost:4200`.
3. Crear un usuario basic desde la pantalla de login o iniciar sesion con un usuario existente.
4. Un usuario basic puede crear permisos y consultar su historial.
5. Desde Vacaciones se seleccionan las fechas en el calendario grande.
6. El sistema descuenta únicamente días laborables de Barcelona.
7. Cada usuario ve sus ausencias en Calendario; el admin ve las de toda la plantilla.
8. Un usuario admin puede contratar/despedir empleados, aprobar/rechazar solicitudes y ver el dashboard.

## Seguridad

- Las passwords se guardan hasheadas con bcrypt.
- Las rutas privadas usan JWT.
- Los usuarios `basic` solo pueden acceder a sus propios datos y permisos.
- Las acciones de administración estan protegidas por rol `admin`.
- Los tokens de recuperación de contraseña caducan a los 5 minutos.
- El archivo `.env` no debe subirse al repositorio.

---

# Autor y creador del proyecto

## Oriol Chiva Hidalgo

Diseño, desarrollo e implementación completa del Gestor de Permisos Laborales de TravelConnect.

**© 2026 Oriol Chiva Hidalgo. Todos los derechos reservados.**
