import mongoose from "mongoose";
import Empleado from "../models/employee.model.js";
import MensajeChat from "../schemas/chat.schema.js";
import ChatGrupo from "../schemas/chat-grupo.schema.js";
import { conectarChat, emitirChat } from "../services/chat-events.service.js";

class chatController {
  async contactos(req, res) {
    try {
      const empleados = await Empleado.find()
        .select("nombre apellido username foto rol")
        .sort({ nombre: 1, apellido: 1 });

      res.json(empleados);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async conversacion(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no válido" });
      }

      const mensajes = await MensajeChat.find({
        $or: [
          { emisor: req.user.id, receptor: id },
          { emisor: id, receptor: req.user.id },
        ],
      }).sort({ createdAt: 1 });

      res.json(mensajes);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async enviar(req, res) {
    try {
      const { id } = req.params;
      const mensaje = String(req.body.mensaje || "").trim();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no válido" });
      }

      if (!mensaje) {
        return res.status(400).json({ error: "El mensaje no puede estar vacío" });
      }

      const existe = await Empleado.exists({ _id: id });
      if (!existe) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      const creado = await MensajeChat.create({ emisor: req.user.id, receptor: id, mensaje });
      emitirChat(id, "mensaje", creado);
      emitirChat(req.user.id, "mensaje", creado);
      res.status(201).json(creado);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async marcarLeida(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no válido" });
      }

      const result = await MensajeChat.updateMany(
        { emisor: id, receptor: req.user.id, leidoPor: { $ne: req.user.id } },
        { $addToSet: { leidoPor: req.user.id } },
      );
      const mensajes = await MensajeChat.find({ emisor: id, receptor: req.user.id, leidoPor: req.user.id }).select("_id emisor receptor leidoPor");
      const data = { lector: req.user.id, messageIds: mensajes.map((mensaje) => mensaje._id) };

      emitirChat(id, "visto", data);
      emitirChat(req.user.id, "visto", data);
      res.json({ leidos: result.modifiedCount });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  eventos(req, res) {
    conectarChat(req.user.id, res);
  }

  async grupos(req, res) {
    try {
      const grupos = await ChatGrupo.find({ participantes: req.user.id }).sort({ updatedAt: -1 });
      res.json(grupos);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async crearGrupo(req, res) {
    try {
      const nombre = String(req.body.nombre || "").trim();
      const participantes = [...new Set([req.user.id, ...(req.body.participantes || [])].map(String))]
        .filter((id) => mongoose.Types.ObjectId.isValid(id));

      if (!nombre || participantes.length < 2) {
        return res.status(400).json({ error: "Indica nombre y al menos otra persona" });
      }

      const existentes = await Empleado.countDocuments({ _id: { $in: participantes } });
      if (existentes !== participantes.length) {
        return res.status(400).json({ error: "Hay participantes no válidos" });
      }

      const grupo = await ChatGrupo.create({ nombre, participantes, creadoPor: req.user.id });
      for (const participante of participantes) {
        emitirChat(participante, "grupo", grupo);
      }
      res.status(201).json(grupo);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async agregarParticipantes(req, res) {
    try {
      const { id } = req.params;
      const nuevos = [...new Set((req.body.participantes || []).map(String))]
        .filter((participante) => mongoose.Types.ObjectId.isValid(participante));
      const grupo = await ChatGrupo.findOne({ _id: id, participantes: req.user.id });

      if (!grupo) {
        return res.status(404).json({ error: "Grupo no encontrado" });
      }

      if (nuevos.length === 0) {
        return res.status(400).json({ error: "Indica al menos una persona" });
      }

      const existentes = await Empleado.countDocuments({ _id: { $in: nuevos } });
      if (existentes !== nuevos.length) {
        return res.status(400).json({ error: "Hay participantes no válidos" });
      }

      grupo.participantes = [...new Set([...grupo.participantes.map(String), ...nuevos])];
      await grupo.save();

      for (const participante of grupo.participantes) {
        emitirChat(participante, "grupo", grupo);
      }
      res.json(grupo);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async salirGrupo(req, res) {
    try {
      const { id } = req.params;
      const grupo = await ChatGrupo.findOne({ _id: id, participantes: req.user.id });

      if (!grupo) {
        return res.status(404).json({ error: "Grupo no encontrado" });
      }

      grupo.participantes = grupo.participantes.filter((participante) => String(participante) !== req.user.id);
      if (grupo.participantes.length === 0) {
        await MensajeChat.deleteMany({ grupo: id });
        await grupo.deleteOne();
        emitirChat(req.user.id, "grupo-salida", { grupo: id });
        return res.json({ message: "Has salido del grupo" });
      }

      await grupo.save();
      emitirChat(req.user.id, "grupo-salida", { grupo: id });
      for (const participante of grupo.participantes) {
        emitirChat(participante, "grupo", grupo);
      }
      res.json({ message: "Has salido del grupo" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async conversacionGrupo(req, res) {
    try {
      const { id } = req.params;
      const grupo = await ChatGrupo.findOne({ _id: id, participantes: req.user.id });
      if (!grupo) {
        return res.status(404).json({ error: "Grupo no encontrado" });
      }

      const mensajes = await MensajeChat.find({ grupo: id }).sort({ createdAt: 1 });
      res.json(mensajes);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async enviarGrupo(req, res) {
    try {
      const { id } = req.params;
      const mensaje = String(req.body.mensaje || "").trim();
      const grupo = await ChatGrupo.findOne({ _id: id, participantes: req.user.id });

      if (!grupo) {
        return res.status(404).json({ error: "Grupo no encontrado" });
      }

      if (!mensaje) {
        return res.status(400).json({ error: "El mensaje no puede estar vacío" });
      }

      const creado = await MensajeChat.create({ emisor: req.user.id, grupo: id, mensaje });
      for (const participante of grupo.participantes) {
        emitirChat(participante, "mensaje", creado);
      }
      res.status(201).json(creado);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async marcarGrupoLeido(req, res) {
    try {
      const { id } = req.params;
      const grupo = await ChatGrupo.findOne({ _id: id, participantes: req.user.id });

      if (!grupo) {
        return res.status(404).json({ error: "Grupo no encontrado" });
      }

      const result = await MensajeChat.updateMany(
        { grupo: id, emisor: { $ne: req.user.id }, leidoPor: { $ne: req.user.id } },
        { $addToSet: { leidoPor: req.user.id } },
      );
      const mensajes = await MensajeChat.find({ grupo: id, leidoPor: req.user.id }).select("_id");
      const data = { lector: req.user.id, grupo: id, messageIds: mensajes.map((mensaje) => mensaje._id) };

      for (const participante of grupo.participantes) {
        emitirChat(participante, "visto", data);
      }
      res.json({ leidos: result.modifiedCount });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  escribiendo(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    emitirChat(id, "escribiendo", { emisor: req.user.id, receptor: id });
    res.sendStatus(204);
  }
}

export default new chatController();
