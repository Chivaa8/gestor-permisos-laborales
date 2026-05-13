import express from "express";
import permisoController from "../controllers/permiso.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const route = express.Router(); // debemos gestionar las rutas

/**
 * @swagger
 * /api/permisos/crear:
 *   post:
 *     summary: Crear un permiso
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaInicio:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-20
 *               fechaFin:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-22
 *               tipo:
 *                 type: string
 *                 example: 69d7760b2314b11b2aacf57a
 *               descripcion:
 *                 type: string
 *                 example: Permiso de prueba
 *     responses:
 *       201:
 *         description: Permiso creado
 */
route.post("/crear", authMiddleware, permisoController.crearPermiso);

/**
 * @swagger
 * /api/permisos:
 *   get:
 *     summary: Obtener permisos con filtros opcionales
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: empId
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: empTramitador
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de permisos
 */
route.get("/", authMiddleware, adminMiddleware, permisoController.obtenerPermisos);

/**
 * @swagger
 * /api/permisos/{id}/misPermisos:
 *   get:
 *     summary: Obtener permisos de un usuario
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de permisos del usuario
 */
route.get("/:id/misPermisos", authMiddleware, permisoController.mirarPermisos);

/**
 * @swagger
 * /api/permisos/{id}:
 *   get:
 *     summary: Obtener un permiso por ID
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permiso encontrado
 */
route.get("/:id", authMiddleware, permisoController.obtenerPermisoPorId);

/**
 * @swagger
 * /api/permisos/{id}:
 *   delete:
 *     summary: Eliminar un permiso
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permiso eliminado
 */
route.delete("/:id", authMiddleware, adminMiddleware, permisoController.retirarPermisos);

/**
 * @swagger
 * /api/permisos/{id}/aprobado:
 *   put:
 *     summary: Aprobar un permiso
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permiso aprobado
 */
route.put("/:id/aprobado", authMiddleware, adminMiddleware, permisoController.aprobarPermiso);

/**
 * @swagger
 * /api/permisos/{id}/rechazado:
 *   put:
 *     summary: Rechazar un permiso
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permiso rechazado
 */
route.put("/:id/rechazado", authMiddleware, adminMiddleware, permisoController.rechazarPermiso);

/**
 * @swagger
 * /api/permisos:
 *   delete:
 *     summary: Eliminar todos los permisos
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todos los permisos eliminados
 */
route.delete("/", authMiddleware, adminMiddleware, permisoController.eliminarTodosPermisos);

export default route;
