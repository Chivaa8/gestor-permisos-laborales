import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Empleado from "../models/employee.model.js";
import Permiso from "../schemas/permiso.schema.js";

class empleadosController {
  async create(req, res) {
    try {
      const { password, ...resto } = req.body;

      const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 10;
      const passwordHasheada = await bcrypt.hash(password, saltRounds);

      const data = await Empleado.create({
        ...resto,
        password: passwordHasheada,
      });

      const empleado = await Empleado.findById(data._id).select("-password");

      res.status(201).json(empleado);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async getAll(req, res) {
    try {
      const data = await Empleado.find().select("-password");
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no válido" });
      }

      const data = await Empleado.findById(id).select("-password");

      if (!data) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      if (req.user.rol !== "admin" && req.user.id !== id) {
        return res.status(403).json({ error: "No autorizado" });
      }

      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no válido" });
      }

      const { password, ...datosActualizables } = req.body;
      const esPerfilPropio = req.user.id === id;

      if (req.user.rol !== "admin" && !esPerfilPropio) {
        return res.status(403).json({ error: "No autorizado" });
      }

      if (req.user.rol !== "admin") {
        delete datosActualizables.rol;
      }

      const data = await Empleado.findByIdAndUpdate(id, datosActualizables, {
        returnDocument: "after",
        runValidators: true,
      }).select("-password");

      if (!data) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { passwordActual, passwordNueva, confirmarPassword } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID no válido" });
      }

      if (req.user.id !== id && req.user.rol !== "admin") {
        return res.status(403).json({ error: "No autorizado" });
      }

      if (!passwordActual || !passwordNueva || !confirmarPassword) {
        return res.status(400).json({
          error: "Debes enviar passwordActual, passwordNueva y confirmarPassword",
        });
      }

      if (passwordNueva !== confirmarPassword) {
        return res.status(400).json({
          error: "Las passwords no coinciden",
        });
      }

      if (passwordNueva.length < 8) {
        return res.status(400).json({
          error: "La password debe tener mínimo 8 caracteres",
        });
      }

      const empleado = await Empleado.findById(id).select("+password");

      if (!empleado) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      const passwordActualValida = await bcrypt.compare(
        passwordActual,
        empleado.password
      );

      if (!passwordActualValida) {
        return res.status(400).json({
          error: "Password actual incorrecta",
        });
      }

      const mismaPassword = await bcrypt.compare(passwordNueva, empleado.password);

      if (mismaPassword) {
        return res.status(400).json({
          error: "La nueva password no puede ser igual a la anterior",
        });
      }

      const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 10;

      empleado.password = await bcrypt.hash(passwordNueva, saltRounds);

      await empleado.save();

      res.status(200).json({
        message: "Password actualizada correctamente",
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
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

      const permisosEliminados = await Permiso.deleteMany({ empId: id });

      res.status(200).json({
        message: "Empleado despedido",
        permisosEliminados: permisosEliminados.deletedCount,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

export default new empleadosController();
