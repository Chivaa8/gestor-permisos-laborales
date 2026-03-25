import express from "express";
const route = express.Router(); // debemos gestionar las rutas
import permisoController from "../controllers/permiso.controller";

// creamos permiso
route.post("/crear", permisoController.crearPermiso);

// damos todos los permisos
route.post("/", permisoController.obtenerPermisos);

// damos un permiso
route.post("/:id", permisoController.obtenerPermisoPorId);

// eliminamos un permiso
route.delete("/:id", permisoController.retirarPermisos);

// eliminamos todos los permisos
route.delete("/", permisoController.eliminarTodosPermisos); // en un futuro esto solo lo podrá hacer el admin

// permisos del usuario
route.get("/:id/misPermisos", permisoController.obtenerPermisos);

// aprobar permiso

route.put("/:id/aprobado", permisoController.aprobarPermiso);

// rechar permiso

route.put("/:id/rechazado", permisoController.rechazarPermiso);

export default route;
