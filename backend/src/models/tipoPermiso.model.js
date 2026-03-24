import mongoose from "mongoose";
import tipoPermisoSchema from "../schemas/tipoPermiso.schema.js";

const TipoPermiso = mongoose.model("TipoPermiso", tipoPermisoSchema);

export default TipoPermiso;