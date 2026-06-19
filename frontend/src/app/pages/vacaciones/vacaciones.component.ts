import { DatePipe, NgFor, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import {
  Empleado,
  EstadoPermiso,
  SaldoVacaciones,
  TipoVacacion,
  Vacacion,
  VacacionForm,
} from "../../models/api.models";
import { empleadoNombre } from "../../models/formatters";
import { esFestivoBarcelona, esLaborableBarcelona } from "../../models/festivos-barcelona";
import { AuthService } from "../../services/auth/auth.service";
import { EmpleadosService } from "../../services/empleados/empleados.service";
import { LanguageService } from "../../services/language/language.service";
import { VacacionesService } from "../../services/vacaciones/vacaciones.service";

type DisponibilidadDia = "disponible" | "dificil" | "no_disponible";
type CalendarCell = {
  date: string;
  day: number;
  status: DisponibilidadDia;
  selected: boolean;
  inRange: boolean;
  past: boolean;
};

const emptyBalance = (): SaldoVacaciones => ({
  vacaciones: { total: 25, aprobados: 0, pendientes: 0, disponibles: 25 },
  personales: { total: 3, aprobados: 0, pendientes: 0, disponibles: 3 },
  no_retribuidos: { total: 7, aprobados: 0, pendientes: 0, disponibles: 7 },
});

@Component({
  selector: "app-vacaciones",
  standalone: true,
  imports: [DatePipe, FormsModule, NgFor, NgIf, RouterLink],
  templateUrl: "./vacaciones.component.html",
  styleUrl: "./vacaciones.component.css",
})
export class VacacionesComponent implements OnInit {
  readonly tipos: TipoVacacion[] = ["vacaciones", "personales", "no_retribuidos"];
  readonly currentYear = new Date().getFullYear();
  readonly today = new Date().toISOString().slice(0, 10);
  readonly empleadoNombre = empleadoNombre;
  solicitudes: Vacacion[] = [];
  empleados: Empleado[] = [];
  saldo = emptyBalance();
  form: VacacionForm = { fechaInicio: "", fechaFin: "", tipo: "", comentario: "" };
  filters: { estado: EstadoPermiso | ""; tipo: TipoVacacion | ""; empId: string } = {
    estado: "",
    tipo: "",
    empId: "",
  };
  error = "";
  success = "";
  calendarMonth = new Date().getMonth();

  constructor(
    readonly auth: AuthService,
    private readonly vacacionesService: VacacionesService,
    private readonly empleadosService: EmpleadosService,
    public readonly language: LanguageService,
  ) {}

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      this.empleadosService.getAll().subscribe({ next: (data) => (this.empleados = data) });
    }
    this.load();
    this.loadBalance();
  }

  load(): void {
    const request = this.auth.isAdmin()
      ? this.vacacionesService.getAll({ ...this.filters, year: this.currentYear })
      : this.vacacionesService.getMine();
    request.subscribe({
      next: (data) => (this.solicitudes = data),
      error: (error) => (this.error = this.errorMessage(error, this.t("vacationsLoadError"))),
    });
  }

  loadBalance(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.vacacionesService.getBalance(userId, this.currentYear).subscribe({
      next: (data) => (this.saldo = data.saldo),
      error: (error) => (this.error = this.errorMessage(error, this.t("vacationsBalanceError"))),
    });
  }

  create(): void {
    this.error = "";
    this.success = "";
    const validation = this.validate();
    if (validation) {
      this.error = validation;
      return;
    }

    this.vacacionesService.create(this.form).subscribe({
      next: () => {
        this.success = this.t("vacationCreated");
        this.form = { fechaInicio: "", fechaFin: "", tipo: "", comentario: "" };
        this.load();
        this.loadBalance();
      },
      error: (error) => (this.error = this.errorMessage(error, this.t("vacationCreateError"))),
    });
  }

  approve(id: string): void {
    this.error = "";
    this.success = "";
    this.vacacionesService.approve(id).subscribe({
      next: (result) => {
        this.success = result.emailEnviado
          ? this.t("vacationApprovedEmail")
          : this.t("vacationApprovedNoEmail");
        this.load();
        this.loadBalance();
      },
      error: (error) => (this.error = this.errorMessage(error, this.t("vacationProcessError"))),
    });
  }

  reject(id: string): void {
    this.error = "";
    this.success = "";
    this.vacacionesService.reject(id).subscribe({
      next: () => {
        this.success = this.t("vacationRejected");
        this.load();
        this.loadBalance();
      },
      error: (error) => (this.error = this.errorMessage(error, this.t("vacationProcessError"))),
    });
  }

  delete(id: string): void {
    this.vacacionesService.delete(id).subscribe({
      next: () => {
        this.load();
        this.loadBalance();
      },
      error: (error) => (this.error = this.errorMessage(error, this.t("vacationDeleteError"))),
    });
  }

  requestedDays(): number {
    if (!this.form.fechaInicio || !this.form.fechaFin || this.form.fechaFin < this.form.fechaInicio) return 0;
    let days = 0;
    for (const date = new Date(`${this.form.fechaInicio}T00:00:00Z`); date <= new Date(`${this.form.fechaFin}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + 1)) {
      if (esLaborableBarcelona(date.toISOString().slice(0, 10))) days += 1;
    }
    return days;
  }

  calendarTitle(): string {
    return new Date(this.currentYear, this.calendarMonth, 1).toLocaleDateString(this.language.current(), {
      month: "long",
      year: "numeric",
    });
  }

  calendarCells(): Array<CalendarCell | null> {
    const first = new Date(Date.UTC(this.currentYear, this.calendarMonth, 1));
    const daysInMonth = new Date(Date.UTC(this.currentYear, this.calendarMonth + 1, 0)).getUTCDate();
    const leading = (first.getUTCDay() + 6) % 7;
    const cells: Array<CalendarCell | null> = Array.from({ length: leading }, () => null);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${this.currentYear}-${String(this.calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({
        date,
        day,
        status: this.disponibilidad(date),
        selected: date === this.form.fechaInicio || date === this.form.fechaFin,
        inRange: Boolean(this.form.fechaInicio && this.form.fechaFin && date > this.form.fechaInicio && date < this.form.fechaFin),
        past: date < this.today,
      });
    }

    return cells;
  }

  moveMonth(delta: number): void {
    this.calendarMonth = Math.min(Math.max(this.calendarMonth + delta, 0), 11);
  }

  selectCalendarDate(date: string): void {
    if (date < this.today) return;
    if (!this.form.fechaInicio || this.form.fechaFin) {
      this.form.fechaInicio = date;
      this.form.fechaFin = "";
      return;
    }
    if (date < this.form.fechaInicio) {
      this.form.fechaFin = this.form.fechaInicio;
      this.form.fechaInicio = date;
      return;
    }
    this.form.fechaFin = date;
  }

  availabilityLabel(status: DisponibilidadDia): string {
    return this.t({ disponible: "available", dificil: "difficult", no_disponible: "unavailable" }[status]);
  }

  calendarDayClass(cell: CalendarCell): string {
    return `calendar-day ${cell.status} ${cell.selected ? "selected" : ""} ${cell.inRange ? "in-range" : ""}`;
  }

  typeLabel(tipo: TipoVacacion): string {
    return this.t({ vacaciones: "annualLeave", personales: "personalDays", no_retribuidos: "unpaidLeave" }[tipo]);
  }

  statusLabel(estado: EstadoPermiso): string {
    return this.t({ pendiente: "pending", aprobado: "approved", rechazado: "rejected" }[estado]);
  }

  statusClass(estado: EstadoPermiso): string {
    return `status status-${estado}`;
  }

  usage(tipo: TipoVacacion): number {
    const balance = this.saldo[tipo];
    return balance.total ? Math.round(((balance.aprobados + balance.pendientes) / balance.total) * 100) : 0;
  }

  t(key: string): string {
    return this.language.t(key);
  }

  private validate(): string {
    if (!this.form.fechaInicio || !this.form.fechaFin || !this.form.tipo) return this.t("vacationRequired");
    if (this.form.fechaInicio < this.today || this.form.fechaFin < this.today) return this.t("vacationPastDate");
    if (this.form.fechaFin < this.form.fechaInicio) return this.t("vacationEndBeforeStart");
    if (new Date(this.form.fechaInicio).getUTCFullYear() !== new Date(this.form.fechaFin).getUTCFullYear()) {
      return this.t("vacationSameYear");
    }
    if (this.hasJoinedIncompatibleLeave()) return this.t("incompatibleLeaveTypes");
    return "";
  }

  private disponibilidad(date: string): DisponibilidadDia {
    const [, month] = date.split("-").map(Number);
    if (!esLaborableBarcelona(date) || esFestivoBarcelona(date)) return "no_disponible";
    if (month >= 6 && month <= 8) return "dificil";
    return "disponible";
  }

  private hasJoinedIncompatibleLeave(): boolean {
    if (!["vacaciones", "no_retribuidos"].includes(this.form.tipo)) return false;
    const other = this.form.tipo === "vacaciones" ? "no_retribuidos" : "vacaciones";
    const start = this.addDays(this.form.fechaInicio, -1);
    const end = this.addDays(this.form.fechaFin, 1);
    return this.solicitudes.some((solicitud) =>
      solicitud.tipo === other
      && ["pendiente", "aprobado"].includes(solicitud.estado)
      && solicitud.fechaInicio.slice(0, 10) <= end
      && solicitud.fechaFin.slice(0, 10) >= start
    );
  }

  private addDays(date: string, days: number): string {
    const value = new Date(`${date}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) return error.error?.error || fallback;
    return fallback;
  }
}
