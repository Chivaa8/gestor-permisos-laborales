import mongoose from "mongoose";

const permisoSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "TipoPermiso",
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
  },
  estado: {
    type: String,
    required: true,
    enum: ["pendiente", "aprobado", "rechazado"],
    default: "pendiente",
  },
  empTramitador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empleado"
  },
  fechaTramitacion: {
    type: Date
  },
});

export default mongoose.model("Permiso", permisoSchema);
