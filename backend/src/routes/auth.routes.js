import express from "express";
import authController from "../controllers/auth.controller.js";

const route = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: juan_login
 *               password:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Login correcto
 *       400:
 *         description: Usuario o password incorrectos
 */
route.post("/login", authController.login);

export default route;
