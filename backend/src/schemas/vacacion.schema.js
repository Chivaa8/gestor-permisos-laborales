import mongoose from "mongoose";

const vacacionSchema = new mongoose.Schema({
  empId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empleado",
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
    required: true,
  },
  fechaInicio: {
    type: Date,
    required: true,
  },
  fechaFin: {
    type: Date,
    required: true,
  },
  tipo: {
    type: String,
    enum: ["vacaciones", "personales", "no_retribuidos"],
    required: true,
  },
  dias: {
    type: Number,
    min: 1,
    required: true,
  },
  comentario: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  estado: {
    type: String,
    enum: ["pendiente", "aprobado", "rechazado"],
    default: "pendiente",
    required: true,
  },
  empTramitador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empleado",
  },
  fechaTramitacion: Date,
});

vacacionSchema.index({ empId: 1, fechaInicio: 1, fechaFin: 1 });

export default mongoose.model("Vacacion", vacacionSchema);
