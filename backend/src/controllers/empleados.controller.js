import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Empleado from "../models/employee.model.js";

class empleadosController {
  async create(req, res) {
    try {
      const { password, ...resto } = req.body;

      const passwordHasheada = await bcrypt.hash(password, 10);

      const data = await Empleado.create({
        ...resto,
        password: passwordHasheada
      });

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

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no válido" });
      }

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

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no válido" });
      }

      const data = await Empleado.findByIdAndUpdate(id, req.body, { new: true });

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

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no válido" });
      }

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