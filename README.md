# TravelConnect - Gestor de permisos laborales

Aplicación web para gestionar permisos laborales de empleados. El proyecto esta dividido en frontend Angular, backend Node.js/Express y base de datos MongoDB. Incluye autenticación con JWT, roles de usuario, gestion de empleados, gestion de permisos, dashboard con graficos, recuperación de contrasena por email, documentacion Swagger y dockerizacion completa.

## Tecnologias

- Frontend: Angular 20, TypeScript, CSS responsive, Vitest.
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Nodemailer.
- Documentacion API: Swagger/OpenAPI.
- Base de datos: MongoDB.
- Despliegue local: Docker Compose con tres servicios: frontend, backend y MongoDB.

## Funcionalidades principales

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
- Al despedir un empleado se eliminan automáticamente sus permisos asociados.
- CRUD de permisos:
  - Crear permisos.
  - Listar todos los permisos.
  - Filtrar por estado, creador o tramitador.
  - Aprobar o rechazar permisos pendientes.
  - Eliminar permisos.
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

### Interfaz

- Marca TravelConnect con logo propio.
- Selector de idioma: castellano, catalan e ingles.
- Dashboard visual con graficos.
- Panel de perfil desplegable.
- Vista diferenciada para usuarios `admin` y `basic`.

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

El proyecto incluye `docker-compose.yml` con tres servicios:

- `mongodb`: base de datos MongoDB.
- `backend`: API Node.js/Express.
- `frontend`: aplicacion Angular servida con Nginx.

Arrancar todo:

```bash
docker compose up --build
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
5. Un usuario admin puede contratar/despedir empleados, aprobar/rechazar permisos y ver el dashboard.

## Seguridad

- Las passwords se guardan hasheadas con bcrypt.
- Las rutas privadas usan JWT.
- Los usuarios `basic` solo pueden acceder a sus propios datos y permisos.
- Las acciones de administración estan protegidas por rol `admin`.
- Los tokens de recuperación de contraseña caducan a los 5 minutos.
- El archivo `.env` no debe subirse al repositorio.

## Autores

Proyecto desarrollado como trabajo final de DAW/DAM para la gestión de permisos laborales.
