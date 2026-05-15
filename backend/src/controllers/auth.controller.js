import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import Empleado from "../models/employee.model.js";
import { sendPasswordResetEmail } from "../services/mail.service.js";

class authController {
  async register(req, res) {
    try {
      const { nombre, apellido, segundoApellido, email, username, password, foto } = req.body;

      if (!nombre || !apellido || !email || !username || !password) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const existente = await Empleado.findOne({ $or: [{ email }, { username }] });

      if (existente) {
        return res.status(400).json({ error: "Email o usuario ya registrado" });
      }

      const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 10;
      const passwordHasheada = await bcrypt.hash(password, saltRounds);

      const data = await Empleado.create({
        nombre,
        apellido,
        segundoApellido,
        email,
        username,
        password: passwordHasheada,
        foto,
        rol: "basic",
      });

      const empleado = await Empleado.findById(data._id).select("-password");
      res.status(201).json(empleado);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      const empleado = await Empleado.findOne({ username }).select("+password");

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
      res.status(500).json({ error: e.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Debes indicar el email" });
      }

      const empleado = await Empleado.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");

      // Respuesta generica para no revelar si un email existe o no.
      if (!empleado) {
        return res.status(200).json({
          message: "Si el email existe, recibiras un enlace de recuperacion",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const expires = new Date(Date.now() + 5 * 60 * 1000);

      empleado.resetPasswordToken = hashedToken;
      empleado.resetPasswordExpires = expires;
      await empleado.save();

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";
      const resetUrl = `${frontendUrl}/reset-password/${token}`;
      const mailResult = await sendPasswordResetEmail({ to: empleado.email, resetUrl });

      res.status(200).json({
        message: "Si el email existe, recibiras un enlace de recuperacion",
        expiresInMinutes: 5,
        ...(mailResult.sent ? {} : { resetUrl }),
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, password, confirmarPassword } = req.body;

      if (!token || !password || !confirmarPassword) {
        return res.status(400).json({ error: "Debes enviar token, password y confirmarPassword" });
      }

      if (password !== confirmarPassword) {
        return res.status(400).json({ error: "Las passwords no coinciden" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "La password debe tener minimo 8 caracteres" });
      }

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const empleado = await Empleado.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      }).select("+password +resetPasswordToken +resetPasswordExpires");

      if (!empleado) {
        return res.status(400).json({ error: "Token invalido o caducado" });
      }

      const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 10;
      empleado.password = await bcrypt.hash(password, saltRounds);
      empleado.resetPasswordToken = undefined;
      empleado.resetPasswordExpires = undefined;
      await empleado.save();

      res.status(200).json({ message: "Password actualizada correctamente" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

export default new authController();
