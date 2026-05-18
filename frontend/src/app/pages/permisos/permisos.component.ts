import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePipe, NgFor, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "../../services/auth/auth.service";
import { Empleado, EstadoPermiso, Permiso, PermisoForm, TipoPermiso } from "../../models/api.models";
import { EmpleadosService } from "../../services/empleados/empleados.service";
import { PermisosService } from "../../services/permisos/permisos.service";
import { TiposPermisoService } from "../../services/permisos/tipos-permiso.service";
import { empleadoNombre, permisoEstadoClass, tipoNombre } from "../../models/formatters";
import { LanguageService } from "../../services/language/language.service";

@Component({
  selector: "app-permisos",
  standalone: true,
  imports: [DatePipe, FormsModule, NgFor, NgIf],
  templateUrl: "./permisos.component.html",
  styleUrl: "./permisos.component.css",
})
export class PermisosComponent implements OnInit {
  permisos: Permiso[] = [];
  empleados: Empleado[] = [];
  tipos: TipoPermiso[] = [];
  form: PermisoForm = { fechaInicio: "", fechaFin: "", tipo: "", descripcion: "" };
  filters: { estado: EstadoPermiso | ""; empId: string; empTramitador: string } = {
    estado: "",
    empId: "",
    empTramitador: "",
  };
  error = "";
  success = "";
  readonly empleadoNombre = empleadoNombre;
  readonly tipoNombre = tipoNombre;
  readonly permisoEstadoClass = permisoEstadoClass;
  readonly today = new Date().toISOString().slice(0, 10);

  constructor(
    readonly auth: AuthService,
    private readonly permisosService: PermisosService,
    private readonly empleadosService: EmpleadosService,
    private readonly tiposPermisoService: TiposPermisoService,
    public readonly language: LanguageService,
  ) {}

  t(key: string): string {
    return this.language.t(key);
  }

  estadoTexto(estado: EstadoPermiso): string {
    const keys: Record<EstadoPermiso, string> = {
      pendiente: "pending",
      aprobado: "approved",
      rechazado: "rejected",
    };

    return this.t(keys[estado]);
  }

  ngOnInit(): void {
    this.tiposPermisoService.getAll().subscribe({
      next: (data) => (this.tipos = data),
      error: () => (this.error = "No se han podido cargar los tipos de permiso"),
    });

    if (this.auth.isAdmin()) {
      this.empleadosService.getAll().subscribe((data) => (this.empleados = data));
    }
    this.load();
  }

  load(): void {
    const user = this.auth.currentUser();
    if (!user) {
      return;
    }

    const request = this.auth.isAdmin()
      ? this.permisosService.getAll(this.filters)
      : this.permisosService.getMine(user.id);

    request.subscribe({
      next: (data) => (this.permisos = data),
      error: () => (this.error = "No se han podido cargar los permisos"),
    });
  }

  create(): void {
    this.error = "";
    this.success = "";

    const validationError = this.validateDates();
    if (validationError) {
      this.error = validationError;
      return;
    }

    this.permisosService.create(this.form).subscribe({
      next: () => {
        this.success = "Permiso creado";
        this.form = { fechaInicio: "", fechaFin: "", tipo: "", descripcion: "" };
        this.load();
      },
      error: (error: unknown) => (this.error = this.errorMessage(error, "No se ha podido crear el permiso")),
    });
  }

  approve(id: string): void {
    this.permisosService.approve(id).subscribe(() => this.load());
  }

  reject(id: string): void {
    this.permisosService.reject(id).subscribe(() => this.load());
  }

  delete(id: string): void {
    this.permisosService.delete(id).subscribe(() => this.load());
  }

  private validateDates(): string {
    if (!this.form.fechaInicio || !this.form.fechaFin) {
      return "Debes indicar fecha de inicio y fecha final";
    }

    if (this.form.fechaInicio < this.today) {
      return "La fecha de inicio no puede ser anterior a hoy";
    }

    if (this.form.fechaFin < this.today) {
      return "La fecha final no puede ser anterior a hoy";
    }

    if (this.form.fechaFin < this.form.fechaInicio) {
      return "La fecha final no puede ser anterior a la fecha de inicio";
    }

    return "";
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const serverError = error.error as { error?: string; message?: string } | null;
      return serverError?.error || serverError?.message || fallback;
    }

    return fallback;
  }
}
