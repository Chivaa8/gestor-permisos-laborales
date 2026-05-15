import express from "express";
import tipoPermisoController from "../controllers/tipoPermiso.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const route = express.Router();

/**
 * @swagger
 * /api/tipos-permiso:
 *   get:
 *     summary: Obtener tipos de permiso
 *     tags: [TiposPermiso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de permiso
 */
route.get("/", authMiddleware, tipoPermisoController.getAll);

export default route;
