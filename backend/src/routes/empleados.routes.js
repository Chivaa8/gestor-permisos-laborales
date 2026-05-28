import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import empleadosController from "../controllers/empleados.controller.js"

const route = express.Router();

// crear empleado
/**
 * @swagger
 * /api/empleados:
 *   post:
 *     summary: Contratar empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Perez
 *               email:
 *                 type: string
 *                 example: juan@test.com
 *               username:
 *                 type: string
 *                 example: juan_login
 *               password:
 *                 type: string
 *                 example: 1234
 *               rol:
 *                 type: string
 *                 example: admin
 *               sueldo:
 *                 type: number
 *                 example: 1800
 *               contratoHasta:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-31
 *     responses:
 *       201:
 *         description: Empleado contratado
 */
route.post("/", authMiddleware, adminMiddleware, empleadosController.create);

// coger un empleado
/**
 * @swagger
 * /api/empleados/{id}:
 *   get:
 *     summary: Obtener un empleado por ID
 *     tags: [Empleados]
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
 *         description: Empleado encontrado
 *       404:
 *         description: Empleado no encontrado
 */
route.get("/:id", authMiddleware, empleadosController.getOne);

//todos los empleados 
/**
 * @swagger
 * /api/empleados:
 *   get:
 *     summary: Obtener todos los empleados
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empleados
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: No autorizado
 */
route.get("/", authMiddleware, adminMiddleware, empleadosController.getAll);

// actualizar
/**
 * @swagger
 * /api/empleados/{id}:
 *   put:
 *     summary: Actualizar empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan actualizado
 *               apellido:
 *                 type: string
 *                 example: Perez
 *               email:
 *                 type: string
 *                 example: juan@test.com
 *               username:
 *                 type: string
 *                 example: juan123
 *               rol:
 *                 type: string
 *                 example: basic
 *               sueldo:
 *                 type: number
 *                 example: 1950
 *               contratoHasta:
 *                 type: string
 *                 format: date
 *                 example: 2027-06-30
 *     responses:
 *       200:
 *         description: Empleado actualizado
 *       404:
 *         description: Empleado no encontrado
 */
route.put("/:id/", authMiddleware, empleadosController.update);

// despedir
/**
 * @swagger
 * /api/empleados/{id}:
 *   delete:
 *     summary: Despedir empleado
 *     tags: [Empleados]
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
 *         description: Empleado despedido
 *       404:
 *         description: Empleado no encontrado
 */
route.delete("/:id/", authMiddleware, adminMiddleware, empleadosController.delete);

/**
 * @swagger
 * /api/empleados/{id}/password:
 *   put:
 *     summary: Actualizar password de un empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordActual
 *               - passwordNueva
 *               - confirmarPassword
 *             properties:
 *               passwordActual:
 *                 type: string
 *                 example: passwordActual123
 *               passwordNueva:
 *                 type: string
 *                 example: passwordNova123
 *               confirmarPassword:
 *                 type: string
 *                 example: passwordNova123
 *     responses:
 *       200:
 *         description: Password actualizada correctamente
 *       400:
 *         description: Datos incorrectos
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Empleado no encontrado
 */
route.put("/:id/password", authMiddleware, empleadosController.updatePassword);

/**
 * @swagger
 * /api/empleados/{id}/subir-sueldo:
 *   put:
 *     summary: Subir sueldo de un empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *             properties:
 *               cantidad:
 *                 type: number
 *                 example: 150
 *     responses:
 *       200:
 *         description: Sueldo actualizado
 */
route.put("/:id/subir-sueldo", authMiddleware, adminMiddleware, empleadosController.ajustarSueldo);

/**
 * @swagger
 * /api/empleados/{id}/bajar-sueldo:
 *   put:
 *     summary: Bajar sueldo de un empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *             properties:
 *               cantidad:
 *                 type: number
 *                 example: 150
 *     responses:
 *       200:
 *         description: Sueldo actualizado
 *       400:
 *         description: Cantidad incorrecta o sueldo negativo
 */
route.put("/:id/bajar-sueldo", authMiddleware, adminMiddleware, empleadosController.ajustarSueldo);

export default route;
