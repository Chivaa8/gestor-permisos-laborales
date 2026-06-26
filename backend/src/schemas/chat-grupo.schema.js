import mongoose from "mongoose";

const chatGrupoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  participantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empleado",
    required: true,
    index: true,
  }],
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empleado",
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("ChatGrupo", chatGrupoSchema);
