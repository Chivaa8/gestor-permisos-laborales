import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Empleado from "../models/employee.model.js";

class authController {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      const empleado = await Empleado.findOne({ username });

      if (!empleado) {
        return res.status(400).json({ error: "Usuario no encontrado" });
      }

      const passwordValida = await bcrypt.compare(password, empleado.password);

      if (!passwordValida) {
        return res.status(400).json({ error: "Password incorrecta" });
      }

      const token = jwt.sign(
        {
          id: empleado._id,
          username: empleado.username,
          rol: empleado.rol,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      res.status(200).json({
        message: "Login correcto",
        token,
      });
    } catch (e) {
      res.status(500).send(e);
      res.status(500).json({ error: e.message });
    }
  }
}

export default new authController();
