import Permiso from "../models/tipoPermiso.model.js";

class permisoController {
  //constructor() {}

  crearPermiso = async (req, res) => {
    try {
      const nuevoPermiso = {
        // para que mande esto especificamente sino mandaría cualquier cosa
        ...req.body,
        estado: "pendiente",
        fechaCreacion: new Date(),
      };

      const permiso = await Permiso.create(nuevoPermiso);
      res.status(201).json(permiso);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  obtenerPermisos = async (req, res) => {
    try {
      const permisos = await Permiso.find()
        .populate("empId") // populate reemplaza el id por el documento entero por eso antes usamos Permiso.find()
        .populate("tipo")
        .populate("empTramitador");

      res.json(permisos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  obtenerPermisoPorId = async (req, res) => {
    try {
      const { id } = req.params;

      const permiso = await Permiso.findById(req.params.id)
        .populate("empId")
        .populate("tipo")
        .populate("empTramitador");

      if (!permiso) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }

      res.json(permiso);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  retirarPermisos = async (req, res) => {
    try {
      await Permiso.findByIdAndDelete(req.params.id);
      res.json({ message: "Permiso eliminado" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  eliminarTodosPermisos = async (req, res) => {
    // esto solo lo podra hacer el admin
    try {
      await Permiso.deleteMany({});
      res.json({ message: "Todos los permisos eliminados" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  mirarPermisos = async (req, res) => {
    try {
      const { id } = req.params;

      const permisos = await Permiso.find({ empId: id })
        .populate("tipo")
        .populate("empTramitador");

      res.status(200).json(permisos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  aprobarPermiso = async (req, res) => {
    try {
      const { id } = req.params;
      const { adminId } = req.body;

      const permiso = await Permiso.findById(id);

      if (!permiso) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }

      permiso.estado = "aprobado";
      permiso.empTramitador = adminId;
      permiso.fechaTramintacion = new Date();

      await permiso.save();

      res.json(permiso);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  rechazarPermiso = async (req, res) => {
    try {
      const { id } = req.params;
      const { adminId } = req.body;

      const permiso = await Permiso.findById(id);

      if (!permiso) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }

      permiso.estado = "rechazado";
      permiso.empTramitador = adminId;
      permiso.fechaTramintacion = new Date();

      await permiso.save();

      res.json(permiso);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export default new permisoController();
