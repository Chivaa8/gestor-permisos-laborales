import express from "express";
import vacacionesController from "../controllers/vacaciones.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const route = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Vacacion:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         empId: { type: string }
 *         fechaInicio: { type: string, format: date }
 *         fechaFin: { type: string, format: date }
 *         tipo:
 *           type: string
 *           enum: [vacaciones, personales, no_retribuidos]
 *         dias: { type: integer }
 *         comentario: { type: string }
 *         estado:
 *           type: string
 *           enum: [pendiente, aprobado, rechazado]
 *         empTramitador: { type: string }
 *         fechaTramitacion: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/vacaciones:
 *   post:
 *     summary: Solicitar vacaciones, dias personales o dias no retribuidos
 *     tags: [Vacaciones]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fechaInicio, fechaFin, tipo]
 *             properties:
 *               fechaInicio: { type: string, format: date, example: 2026-08-03 }
 *               fechaFin: { type: string, format: date, example: 2026-08-07 }
 *               tipo:
 *                 type: string
 *                 enum: [vacaciones, personales, no_retribuidos]
 *               comentario: { type: string, example: Viaje familiar }
 *     responses:
 *       201: { description: Solicitud creada }
 *       400: { description: Fechas o saldo incorrectos }
 *       409: { description: Fechas solapadas }
 *   get:
 *     summary: Listar todas las solicitudes con filtros (solo admin)
 *     tags: [Vacaciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: estado, schema: { type: string } }
 *       - { in: query, name: tipo, schema: { type: string } }
 *       - { in: query, name: empId, schema: { type: string } }
 *       - { in: query, name: year, schema: { type: integer } }
 *     responses:
 *       200: { description: Lista de solicitudes }
 */
route.post("/", authMiddleware, vacacionesController.crear);
route.get("/", authMiddleware, adminMiddleware, vacacionesController.obtenerTodas);

/**
 * @swagger
 * /api/vacaciones/mias:
 *   get:
 *     summary: Listar las solicitudes del usuario autenticado
 *     tags: [Vacaciones]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Solicitudes del usuario }
 */
route.get("/mias", authMiddleware, vacacionesController.obtenerMias);

/**
 * @swagger
 * /api/vacaciones/saldo/{id}:
 *   get:
 *     summary: Consultar saldo anual de un empleado
 *     tags: [Vacaciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *       - { in: query, name: year, schema: { type: integer } }
 *     responses:
 *       200: { description: Saldo por tipo }
 */
route.get("/saldo/:id", authMiddleware, vacacionesController.obtenerSaldo);

/**
 * @swagger
 * /api/vacaciones/dashboard/resumen:
 *   get:
 *     summary: Resumen anual de vacaciones de toda la plantilla (solo admin)
 *     tags: [Vacaciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: year, schema: { type: integer } }
 *     responses:
 *       200: { description: Resumen global }
 */
route.get("/dashboard/resumen", authMiddleware, adminMiddleware, vacacionesController.dashboard);

/**
 * @swagger
 * /api/vacaciones/{id}/aprobar:
 *   put:
 *     summary: Aprobar una solicitud y enviar correo al empleado (solo admin)
 *     tags: [Vacaciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Solicitud aprobada }
 * /api/vacaciones/{id}/rechazar:
 *   put:
 *     summary: Rechazar una solicitud (solo admin)
 *     tags: [Vacaciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Solicitud rechazada }
 */
route.put("/:id/aprobar", authMiddleware, adminMiddleware, vacacionesController.aprobar);
route.put("/:id/rechazar", authMiddleware, adminMiddleware, vacacionesController.rechazar);

/**
 * @swagger
 * /api/vacaciones/{id}:
 *   delete:
 *     summary: Eliminar una solicitud (solo admin)
 *     tags: [Vacaciones]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Solicitud eliminada }
 */
route.delete("/:id", authMiddleware, adminMiddleware, vacacionesController.eliminar);

export default route;
