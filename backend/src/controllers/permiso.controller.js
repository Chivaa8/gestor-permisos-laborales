import Permiso from "../models/tipoPermiso.model";

export const crearPermiso = async (req, res) => {
  try {
    const nuevoPermiso = { // para que mande esto especificamente sino mandaría cualquier cosa
      ...req.body,
      estado: "pendiente",
      fechaCreacion: new Date()
    };


    const permiso = await Permiso.create(nuevoPermiso);
    res.status(201).json(permiso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerPermisos = async (req, res) => {
  try {
    const permisos = await Permiso.find()
      .populate("empId")
      .populate("tipo")
      .populate("empTramitador");

    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const retirarPermisos = async (req, res) => {
  try {
    await Permiso.findByIdAndDelete(req.params.id);
    res.json({message: "Permiso eliminado"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
