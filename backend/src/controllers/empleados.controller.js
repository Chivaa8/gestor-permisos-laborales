import Empleado from "../models/employee.model.js";

class empleadosController {
  async create(req, res) {
    try {
      const data = await Empleado.create(req.body);
      res.status(201).json(data);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async getAll(req, res) {
    try {
      const data = await Empleado.find();
      res.status(200).json(data);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const data = await Empleado.findById(id);

      if (!data) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      res.status(200).json(data);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      const data = await Empleado.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );

      if (!data) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      res.status(200).json(data);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const data = await Empleado.findByIdAndDelete(id);

      if (!data) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      res.status(200).json({ message: "Empleado eliminado" });
    } catch (e) {
      res.status(500).send(e);
    }
  }
}

export default new empleadosController();