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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Crear usuario basic
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - email
 *               - username
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Maria
 *               apellido:
 *                 type: string
 *                 example: Garcia
 *               segundoApellido:
 *                 type: string
 *                 example: Lopez
 *               email:
 *                 type: string
 *                 example: maria@test.com
 *               username:
 *                 type: string
 *                 example: maria_login
 *               password:
 *                 type: string
 *                 example: Password123
 *               foto:
 *                 type: string
 *                 example: https://example.com/foto.jpg
 *     responses:
 *       201:
 *         description: Usuario basic creado
 *       400:
 *         description: Datos incorrectos o usuario duplicado
 */
route.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperacion de password por email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: maria@test.com
 *     responses:
 *       200:
 *         description: Email enviado si el usuario existe
 *       400:
 *         description: Datos incorrectos
 */
route.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Cambiar password usando token temporal
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - confirmarPassword
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 example: NuevaPassword123
 *               confirmarPassword:
 *                 type: string
 *                 example: NuevaPassword123
 *     responses:
 *       200:
 *         description: Password actualizada correctamente
 *       400:
 *         description: Token invalido, caducado o datos incorrectos
 */
route.post("/reset-password", authController.resetPassword);

export default route;
