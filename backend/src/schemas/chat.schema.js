import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  emisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empleado",
    required: true,
    index: true,
  },
  receptor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empleado",
    index: true,
  },
  grupo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatGrupo",
    index: true,
  },
  mensaje: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  leidoPor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empleado",
    index: true,
  }],
}, { timestamps: true });

export default mongoose.model("MensajeChat", chatSchema);
