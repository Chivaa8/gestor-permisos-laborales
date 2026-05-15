import { Empleado, Permiso, TipoPermiso } from "./api.models";

export function empleadoNombre(value: string | Empleado | undefined): string {
  if (!value || typeof value === "string") {
    return "-";
  }

  return [value.nombre, value.apellido, value.segundoApellido].filter(Boolean).join(" ");
}

export function tipoNombre(value: string | TipoPermiso | undefined): string {
  if (!value || typeof value === "string") {
    return "-";
  }

  return value.nombre;
}

export function permisoEstadoClass(permiso: Permiso): string {
  return `status status-${permiso.estado}`;
}
