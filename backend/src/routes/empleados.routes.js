import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import empleadosController from "../controllers/empleados.controller.js"

const route = express.Router();


// contratar empleado
route.post("/", authMiddleware, adminMiddleware, empleadosController.create);

// coger uno empleado
route.get("/:id", authMiddleware, adminMiddleware, empleadosController.getOne)

// coger todos los empleados
route.get("/", authMiddleware, adminMiddleware, empleadosController.getAll);

// actualizar
route.put("/:id/", authMiddleware, adminMiddleware, empleadosController.update);

// despedir
route.delete("/:id/", authMiddleware, adminMiddleware, empleadosController.delete);

export default route;