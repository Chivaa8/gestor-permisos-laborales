import mongoose from "mongoose";

const tipoPermisoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  }
});

export default tipoPermisoSchema;