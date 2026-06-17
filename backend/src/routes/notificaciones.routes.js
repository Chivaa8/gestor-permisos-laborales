import express from "express";
import notificacionesController from "../controllers/notificaciones.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const route = express.Router();

route.get("/mias", authMiddleware, notificacionesController.obtenerMias);
route.put("/leidas", authMiddleware, notificacionesController.marcarLeidas);

export default route;
