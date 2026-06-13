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
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/, "El correo electrónico no es válido"],
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    foto: {
        type: String
    
    },
    sueldo: {
        type: Number,
        default: 0,
        min: 0,
    },
    contratoHasta: {
        type: Date,
    },
    rol: {
        type: String, 
        enum: ["admin", "basic"],
        default: "basic",
        required: true,
    },
    resetPasswordToken: {
        type: String,
        select: false,
    },
    resetPasswordExpires: {
        type: Date,
        select: false,
    },
});

export default employeeSchema
