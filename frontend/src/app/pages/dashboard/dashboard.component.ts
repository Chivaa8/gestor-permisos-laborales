import { Component, OnInit } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { AuthService } from "../../services/auth/auth.service";
import { DashboardEstados, Empleado, EstadoPermiso, Permiso } from "../../models/api.models";
import { EmpleadosService } from "../../services/empleados/empleados.service";
import { PermisosService } from "../../services/permisos/permisos.service";
import { LanguageService } from "../../services/language/language.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent implements OnInit {
  estados: DashboardEstados = { pendiente: 0, aprobado: 0, rechazado: 0 };
  empleados: Empleado[] = [];
  permisos: Permiso[] = [];
  readonly orden: EstadoPermiso[] = ["pendiente", "aprobado", "rechazado"];
  readonly labelKeys: Record<EstadoPermiso, string> = {
    pendiente: "pending",
    aprobado: "approved",
    rechazado: "rejected",
  };
  readonly colors: Record<EstadoPermiso, string> = {
    pendiente: "#f5b84b",
    aprobado: "#36b37e",
    rechazado: "#e05252",
  };
  error = "";

  constructor(
    readonly auth: AuthService,
    private readonly permisosService: PermisosService,
    private readonly empleadosService: EmpleadosService,
    public readonly language: LanguageService,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin()) {
      const userId = this.auth.currentUser()?.id;
      if (!userId) {
        return;
      }

      this.permisosService.getMine(userId).subscribe({
        next: (data) => {
          this.permisos = data;
          this.estados = data.reduce<DashboardEstados>(
            (counts, permiso) => {
              counts[permiso.estado] += 1;
              return counts;
            },
            { pendiente: 0, aprobado: 0, rechazado: 0 },
          );
        },
        error: () => (this.error = "No se han podido cargar tus permisos"),
      });
      return;
    }

    this.permisosService.dashboard().subscribe({
      next: (data) => (this.estados = data),
      error: () => (this.error = "No se ha podido cargar el dashboard"),
    });

    this.empleadosService.getAll().subscribe({
      next: (data) => (this.empleados = data),
      error: () => (this.error = "No se han podido cargar los empleados"),
    });

    this.permisosService.getAll().subscribe({
      next: (data) => (this.permisos = data),
      error: () => (this.error = "No se han podido cargar los permisos"),
    });
  }

  total(): number {
    return this.orden.reduce((sum, estado) => sum + this.estados[estado], 0);
  }

  percentage(estado: EstadoPermiso): number {
    const total = this.total();
    return total ? Math.round((this.estados[estado] / total) * 100) : 0;
  }

  label(estado: EstadoPermiso): string {
    return this.t(this.labelKeys[estado]);
  }

  t(key: string): string {
    return this.language.t(key);
  }

  pieChart(): string {
    const total = this.total();
    if (!total) {
      return "conic-gradient(#d8e1ec 0deg 360deg)";
    }

    let start = 0;
    const segments = this.orden.map((estado) => {
      const degrees = (this.estados[estado] / total) * 360;
      const end = start + degrees;
      const segment = `${this.colors[estado]} ${start}deg ${end}deg`;
      start = end;
      return segment;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }

  totalEmpleados(): number {
    return this.empleados.length;
  }

  admins(): number {
    return this.empleados.filter((empleado) => empleado.rol === "admin").length;
  }

  basics(): number {
    return this.empleados.filter((empleado) => empleado.rol === "basic").length;
  }

  empleadosConPermisos(): number {
    return this.empleadosConPermisosIds().size;
  }

  empleadosSinPermisos(): number {
    return Math.max(this.totalEmpleados() - this.empleadosConPermisos(), 0);
  }

  roleBar(rol: "admin" | "basic"): number {
    const total = this.totalEmpleados();
    if (!total) {
      return 0;
    }

    return Math.round(((rol === "admin" ? this.admins() : this.basics()) / total) * 100);
  }

  permisosBar(tipo: "con" | "sin"): number {
    const total = this.totalEmpleados();
    if (!total) {
      return 0;
    }

    const value = tipo === "con" ? this.empleadosConPermisos() : this.empleadosSinPermisos();
    return Math.round((value / total) * 100);
  }

  barHeight(estado: EstadoPermiso): number {
    return Math.max(this.percentage(estado), this.estados[estado] ? 10 : 0);
  }

  private empleadosConPermisosIds(): Set<string> {
    return new Set(
      this.permisos
        .map((permiso) => (typeof permiso.empId === "string" ? permiso.empId : permiso.empId?._id))
        .filter((id): id is string => Boolean(id)),
    );
  }
}
