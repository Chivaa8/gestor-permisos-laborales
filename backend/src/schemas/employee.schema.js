import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    apellido: {
        type: String,
        required: true,
    },
    segundoApellido: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    foto: {
        type: String
    
    },
    rol: {
        type: String, 
        enum: ["admin", "basic"],
        default: "basic",
        required: true,
    },
});

export default mongoose.model("Empleado", employeeSchema)