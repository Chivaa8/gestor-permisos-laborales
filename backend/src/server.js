import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { fileURLToPath } from "node:url";
import permisosRoutes from "./routes/permisos.routes.js";
import empleadosRoutes from "./routes/empleados.routes.js";
import authRoutes from "./routes/auth.routes.js";
import tiposPermisoRoutes from "./routes/tiposPermiso.routes.js";
import TipoPermiso from "./models/tipoPermiso.model.js";
import Empleado from "./models/employee.model.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/permisos", permisosRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tipos-permiso", tiposPermisoRoutes);

const defaultTiposPermiso = [
  "hospitalizacion",
  "matrimonio",
  "traslado",
  "malaltia",
  "naixement",
];

async function seedTiposPermiso() {
  await Promise.all(
    defaultTiposPermiso.map((nombre) =>
      TipoPermiso.updateOne({ nombre }, { $setOnInsert: { nombre } }, { upsert: true }),
    ),
  );
}

async function seedAdminInicial() {
  const username = process.env.ADMIN_USERNAME || "admin2";
  const existeAdmin = await Empleado.findOne({ username });

  if (existeAdmin) {
    return;
  }

  const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 10;
  const password = process.env.ADMIN_PASSWORD || "Admin12345";
  const passwordHasheada = await bcrypt.hash(password, saltRounds);

  await Empleado.create({
    nombre: process.env.ADMIN_NOMBRE || "Oriol",
    apellido: process.env.ADMIN_APELLIDO || "Chiva",
    email: process.env.ADMIN_EMAIL || "oriolchiva8@gmail.com",
    username,
    password: passwordHasheada,
    rol: "admin",
    sueldo: 2200,
    contratoHasta: new Date("2027-12-31"),
  });
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  return mongoose.connect(process.env.MONGO_DB_URI);
}

async function startServer() {
  try {
    await connectDB();
    await seedTiposPermiso();
    await seedAdminInicial();
    console.log("Conectado correctamente a MongoDB");

    const PORT = process.env.PORT || 3000;
    return app.listen(PORT, () => {
      console.log(`Servidor levantado en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer();
}

export { app, connectDB, seedAdminInicial, seedTiposPermiso, startServer };
