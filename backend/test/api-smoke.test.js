import assert from "node:assert/strict";
import test from "node:test";
import authMiddleware from "../src/middlewares/auth.middleware.js";
import adminMiddleware from "../src/middlewares/admin.middleware.js";
import permisosRoutes from "../src/routes/permisos.routes.js";
import empleadosRoutes from "../src/routes/empleados.routes.js";
import vacacionesRoutes from "../src/routes/vacaciones.routes.js";
import notificacionesRoutes from "../src/routes/notificaciones.routes.js";
import { app } from "../src/server.js";

test("rutas principales se importan sin romper Express", () => {
  assert.ok(permisosRoutes);
  assert.ok(empleadosRoutes);
  assert.ok(vacacionesRoutes);
  assert.ok(notificacionesRoutes);
  assert.ok(app);
});

test("adminMiddleware permite admins y bloquea usuarios basic", () => {
  let nextCalled = false;
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  adminMiddleware({ user: { rol: "admin" } }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);

  nextCalled = false;
  adminMiddleware({ user: { rol: "basic" } }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

test("authMiddleware exige cabecera Authorization Bearer", () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  authMiddleware({ headers: {} }, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: "Token no proporcionado" });
});
