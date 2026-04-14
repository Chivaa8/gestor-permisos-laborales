import express from "express";
const route = express.Router();

import empleadosController from "../controllers/empleados.controller.js"

// contratar empleado
route.post("/", empleadosController.create);

// coger uno empleado
route.get("/:id", empleadosController.getOne)

// coger todos los empleados
route.get("/", empleadosController.getAll);

// actualizar
route.put("/:id/", empleadosController.update);

// despedir
route.delete("/:id/", empleadosController.delete);

export default route;