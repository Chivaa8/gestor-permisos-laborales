export type Rol = "admin" | "basic";
export type EstadoPermiso = "pendiente" | "aprobado" | "rechazado";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface ForgotPasswordResponse {
  message: string;
  expiresInMinutes?: number;
  resetUrl?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmarPassword: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  rol: Rol;
}

export interface Empleado {
  _id: string;
  nombre: string;
  apellido: string;
  segundoApellido?: string;
  email: string;
  username: string;
  foto?: string;
  rol: Rol;
}

export interface EmpleadoForm {
  nombre: string;
  apellido: string;
  segundoApellido?: string;
  email: string;
  username: string;
  password?: string;
  foto?: string;
  rol: Rol;
}

export interface PasswordUpdateRequest {
  passwordActual: string;
  passwordNueva: string;
  confirmarPassword: string;
}

export interface TipoPermiso {
  _id: string;
  nombre: string;
}

export interface Permiso {
  _id: string;
  empId: string | Empleado;
  fechaCreacion: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: string | TipoPermiso;
  descripcion: string;
  estado: EstadoPermiso;
  empTramitador?: string | Empleado;
  fechaTramitacion?: string;
}

export interface PermisoForm {
  fechaInicio: string;
  fechaFin: string;
  tipo: string;
  descripcion: string;
}

export type DashboardEstados = Record<EstadoPermiso, number>;
