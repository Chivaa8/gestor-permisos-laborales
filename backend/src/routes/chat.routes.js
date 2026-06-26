import express from "express";
import chatController from "../controllers/chat.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const route = express.Router();

route.get("/contactos", authMiddleware, chatController.contactos);
route.get("/eventos", authMiddleware, chatController.eventos);
route.get("/grupos", authMiddleware, chatController.grupos);
route.post("/grupos", authMiddleware, chatController.crearGrupo);
route.put("/grupos/:id/participantes", authMiddleware, chatController.agregarParticipantes);
route.delete("/grupos/:id/salir", authMiddleware, chatController.salirGrupo);
route.put("/grupos/:id/leidas", authMiddleware, chatController.marcarGrupoLeido);
route.get("/grupos/:id", authMiddleware, chatController.conversacionGrupo);
route.post("/grupos/:id", authMiddleware, chatController.enviarGrupo);
route.post("/:id/escribiendo", authMiddleware, chatController.escribiendo);
route.put("/:id/leidas", authMiddleware, chatController.marcarLeida);
route.get("/:id", authMiddleware, chatController.conversacion);
route.post("/:id", authMiddleware, chatController.enviar);

export default route;
