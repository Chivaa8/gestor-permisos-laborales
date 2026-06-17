import mongoose from "mongoose";

const notificacionSchema = new mongoose.Schema({
  empId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empleado",
    required: true,
    index: true,
  },
  tipo: {
    type: String,
    enum: ["vacaciones", "sueldo", "sistema"],
    default: "sistema",
    required: true,
  },
  titulo: {
    type: String,
    required: true,
    trim: true,
  },
  mensaje: {
    type: String,
    required: true,
    trim: true,
  },
  leida: {
    type: Boolean,
    default: false,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

export default mongoose.model("Notificacion", notificacionSchema);
