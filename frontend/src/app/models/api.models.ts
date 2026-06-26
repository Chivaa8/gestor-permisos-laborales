export type Rol = "admin" | "basic";
export type EstadoPermiso = "pendiente" | "aprobado" | "rechazado";
export type TipoVacacion = "vacaciones" | "personales" | "no_retribuidos";

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
  sueldo?: number;
  contratoHasta?: string;
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
  sueldo?: number;
  contratoHasta?: string;
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

export interface Vacacion {
  _id: string;
  empId: string | Empleado;
  fechaCreacion: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: TipoVacacion;
  dias: number;
  comentario?: string;
  estado: EstadoPermiso;
  empTramitador?: string | Empleado;
  fechaTramitacion?: string;
}

export interface VacacionForm {
  fechaInicio: string;
  fechaFin: string;
  tipo: TipoVacacion | "";
  comentario: string;
}

export interface SaldoVacacionTipo {
  total: number;
  aprobados: number;
  pendientes: number;
  disponibles: number;
}

export type SaldoVacaciones = Record<TipoVacacion, SaldoVacacionTipo>;

export interface SaldoVacacionesResponse {
  year: number;
  saldo: SaldoVacaciones;
}

export interface DashboardVacaciones {
  year: number;
  empleados: number;
  estados: DashboardEstados;
  saldo: SaldoVacaciones;
}

export type TipoNotificacion = "vacaciones" | "sueldo" | "sistema";

export interface Notificacion {
  _id: string;
  empId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
}

export interface ChatMensaje {
  _id: string;
  emisor: string;
  receptor?: string;
  grupo?: string;
  mensaje: string;
  leidoPor?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatGrupo {
  _id: string;
  nombre: string;
  participantes: string[];
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
}

export type ChatRealtimeEvent =
  | { type: "mensaje"; data: ChatMensaje }
  | { type: "grupo"; data: ChatGrupo }
  | { type: "grupo-salida"; data: { grupo: string } }
  | { type: "visto"; data: { lector: string; grupo?: string; messageIds: string[] } }
  | { type: "escribiendo"; data: { emisor: string; receptor: string } }
  | { type: "conectado"; data: Record<string, never> };
