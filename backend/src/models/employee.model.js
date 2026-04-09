import mongoose from "mongoose";
import employeeSchema from "../schemas/employee.schema.js";

const Empleado = mongoose.model("Empleado", employeeSchema);

export default Empleado;
