import express from "express";
import mongoose from "mongoose";
import permisosRoutes from "./routes/permisos.routes.js"
import empleadosRoutes from "./routes/empleados.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dotenv from 'dotenv';



dotenv.config();

const app = express();

// middleware
app.use(express.json());

// rutas
app.use("/api/permisos", permisosRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/auth", authRoutes);


// conexión a MongoDB
mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => console.log("Conectado"))
    .catch(err => console.log(err));

// escuchar servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor levantado en http://localhost:${PORT}`)
});

