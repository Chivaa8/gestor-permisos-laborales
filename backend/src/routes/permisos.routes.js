import express from "express";
import permisoController from "../controllers/permiso.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const route = express.Router(); // debemos gestionar las rutas

route.post("/crear", authMiddleware, permisoController.crearPermiso);
route.get("/", authMiddleware, adminMiddleware, permisoController.obtenerPermisos);
route.get("/:id/misPermisos", authMiddleware, permisoController.mirarPermisos);
route.get("/:id", authMiddleware, permisoController.obtenerPermisoPorId);
route.delete("/:id", authMiddleware, adminMiddleware, permisoController.retirarPermisos);
route.delete("/", authMiddleware, adminMiddleware, permisoController.eliminarTodosPermisos);
route.put("/:id/aprobado", authMiddleware, adminMiddleware, permisoController.aprobarPermiso);
route.put("/:id/rechazado", authMiddleware, adminMiddleware, permisoController.rechazarPermiso);

export default route;
