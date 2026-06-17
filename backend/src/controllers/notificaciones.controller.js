import Notificacion from "../schemas/notificacion.schema.js";

class NotificacionesController {
  obtenerMias = async (req, res) => {
    try {
      const notificaciones = await Notificacion.find({ empId: req.user.id })
        .sort({ fechaCreacion: -1 })
        .limit(50)
        .lean();
      res.json(notificaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  marcarLeidas = async (req, res) => {
    try {
      await Notificacion.updateMany({ empId: req.user.id, leida: false }, { leida: true });
      res.json({ message: "Notificaciones leidas" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export default new NotificacionesController();
