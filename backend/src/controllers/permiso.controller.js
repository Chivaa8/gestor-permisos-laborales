import mongoose from "mongoose";
import Permiso from "../schemas/permiso.schema.js"
import "../models/tipoPermiso.model.js"; // para que mongoDB funcione

class permisoController {
  //constructor() {}

  crearPermiso = async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.body;
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const hoy = new Date();

      hoy.setHours(0, 0, 0, 0);
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(0, 0, 0, 0);

      if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
        return res.status(400).json({ error: "Las fechas no son validas" });
      }

      if (inicio < hoy) {
        return res.status(400).json({ error: "La fecha de inicio no puede ser anterior a hoy" });
      }

      if (fin < hoy) {
        return res.status(400).json({ error: "La fecha final no puede ser anterior a hoy" });
      }

      if (fin < inicio) {
        return res.status(400).json({ error: "La fecha final no puede ser anterior a la fecha de inicio" });
      }

      const nuevoPermiso = {
        // para que mande esto especificamente sino mandaría cualquier cosa
        ...req.body,
        empId: req.user.id,
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
      const { estado, empId, empTramitador} = req.query;

      const filtros = {};

      if (estado){
        filtros.estado = estado;
      }

      if(empId){
        filtros.empId = empId;
      }

      if(empTramitador){
        filtros.empTramitador = empTramitador;
      }
      
      const permisos = await Permiso.find(filtros)
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

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no valido" });
      }

      const permiso = await Permiso.findById(id)
        .populate("empId")
        .populate("tipo")
        .populate("empTramitador");

      if (!permiso) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }

      const empId = permiso.empId?._id?.toString() || permiso.empId?.toString();

      if (req.user.rol !== "admin" && empId !== req.user.id) {
        return res.status(403).json({ error: "No autorizado" });
      }

      res.json(permiso);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  retirarPermisos = async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "ID no valido" });
      }

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

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no valido" });
      }

      if (req.user.rol !== "admin" && req.user.id !== id) {
        return res.status(403).json({ error: "No autorizado" });
      }

      const permisos = await Permiso.find({ empId: id })
        .populate("empId")
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

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no valido" });
      }

      const permiso = await Permiso.findById(id);

      if (!permiso) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }

      permiso.estado = "aprobado";
      permiso.empTramitador = req.user.id
      permiso.fechaTramitacion = new Date();

      await permiso.save();

      res.json(permiso);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  rechazarPermiso = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no valido" });
      }

      const permiso = await Permiso.findById(id);

      if (!permiso) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }

      permiso.estado = "rechazado";
      permiso.empTramitador = req.user.id
      permiso.fechaTramitacion = new Date();

      await permiso.save();

      res.json(permiso);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  dashboardEstados = async (req, res) => {
    try {
      const estados = ["pendiente", "aprobado", "rechazado"];
      const resultados = await Permiso.aggregate([
        {
          $group: {
            _id: "$estado",
            total: { $sum: 1 },
          },
        },
      ]);

      const resumen = estados.reduce((acc, estado) => {
        acc[estado] = 0;
        return acc;
      }, {});

      resultados.forEach((item) => {
        resumen[item._id] = item.total;
      });

      res.status(200).json(resumen);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export default new permisoController();
