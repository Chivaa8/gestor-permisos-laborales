import Notificacion from "../schemas/notificacion.schema.js";

export function crearNotificacion({ empId, tipo = "sistema", titulo, mensaje }) {
  return Notificacion.create({ empId, tipo, titulo, mensaje });
}
