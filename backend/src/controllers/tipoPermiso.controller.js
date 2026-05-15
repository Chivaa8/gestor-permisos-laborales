import TipoPermiso from "../models/tipoPermiso.model.js";

class tipoPermisoController {
  async getAll(req, res) {
    try {
      const tipos = await TipoPermiso.find().sort({ nombre: 1 });
      res.status(200).json(tipos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new tipoPermisoController();
