import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgFor, NgIf } from "@angular/common";
import { Empleado, EmpleadoForm } from "../../models/api.models";
import { EmpleadosService } from "../../services/empleados/empleados.service";
import { LanguageService } from "../../services/language/language.service";

const emptyForm = (): EmpleadoForm => ({
  nombre: "",
  apellido: "",
  segundoApellido: "",
  email: "",
  username: "",
  password: "",
  foto: "",
  sueldo: 0,
  contratoHasta: "",
  rol: "basic",
});

@Component({
  selector: "app-empleados",
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: "./empleados.component.html",
  styleUrl: "./empleados.component.css",
})
export class EmpleadosComponent implements OnInit {
  empleados: Empleado[] = [];
  form = emptyForm();
  editingId = "";
  error = "";
  success = "";
  salaryAmount: Record<string, number> = {};

  constructor(
    private readonly empleadosService: EmpleadosService,
    public readonly language: LanguageService,
  ) {}

  t(key: string): string {
    return this.language.t(key);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.empleadosService.getAll().subscribe({
      next: (data) => (this.empleados = data),
      error: () => (this.error = "No se han podido cargar los empleados"),
    });
  }

  edit(empleado: Empleado): void {
    this.editingId = empleado._id;
    this.form = {
      ...empleado,
      contratoHasta: empleado.contratoHasta ? empleado.contratoHasta.slice(0, 10) : "",
      password: "",
    };
  }

  cancel(): void {
    this.editingId = "";
    this.form = emptyForm();
  }

  save(): void {
    this.error = "";
    this.success = "";

    const request = this.editingId
      ? this.empleadosService.update(this.editingId, this.form)
      : this.empleadosService.create(this.form);

    request.subscribe({
      next: () => {
        this.success = this.editingId ? "Empleado actualizado" : "Empleado contratado";
        this.cancel();
        this.load();
      },
      error: () => (this.error = "No se ha podido guardar el empleado"),
    });
  }

  delete(id: string): void {
    this.empleadosService.delete(id).subscribe({
      next: (response) => {
        const permisos = response.permisosEliminados || 0;
        this.success = `Empleado despedido. Permisos eliminados: ${permisos}`;
        this.load();
      },
      error: () => (this.error = "No se ha podido eliminar el empleado"),
    });
  }

  formatSalary(sueldo?: number): string {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(sueldo || 0);
  }

  formatContractDate(fecha?: string): string {
    return fecha ? new Intl.DateTimeFormat("es-ES").format(new Date(fecha)) : "Sin fecha";
  }

  adjustSalary(id: string, direction: "up" | "down"): void {
    const cantidad = Number(this.salaryAmount[id]);

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      this.error = "Indica una cantidad mayor que 0";
      return;
    }

    this.error = "";
    this.success = "";

    const request = direction === "up"
      ? this.empleadosService.subirSueldo(id, cantidad)
      : this.empleadosService.bajarSueldo(id, cantidad);

    request.subscribe({
      next: () => {
        this.salaryAmount[id] = 0;
        this.success = direction === "up" ? "Sueldo subido correctamente" : "Sueldo bajado correctamente";
        this.load();
      },
      error: (response) => (this.error = response.error?.error || "No se ha podido actualizar el sueldo"),
    });
  }
}
