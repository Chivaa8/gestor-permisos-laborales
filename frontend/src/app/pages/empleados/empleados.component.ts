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
    this.form = { ...empleado, password: "" };
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
}
