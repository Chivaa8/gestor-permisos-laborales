import { NgFor, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { forkJoin } from "rxjs";
import { Permiso, Vacacion } from "../../models/api.models";
import { empleadoNombre, tipoNombre } from "../../models/formatters";
import { AuthService } from "../../services/auth/auth.service";
import { LanguageService } from "../../services/language/language.service";
import { PermisosService } from "../../services/permisos/permisos.service";
import { VacacionesService } from "../../services/vacaciones/vacaciones.service";

export type CalendarEvent = {
  id: string;
  date: string;
  employee: string;
  kind: "vacaciones" | "permiso";
  type: string;
  status: "pendiente" | "aprobado";
};

type CalendarDay = {
  date: string;
  number: number;
  events: CalendarEvent[];
};

function dateOnly(value: string): string {
  return value.slice(0, 10);
}

export function expandCalendarEvents(permisos: Permiso[], vacaciones: Vacacion[]): CalendarEvent[] {
  const rows = [
    ...permisos
      .filter(({ estado }) => estado !== "rechazado")
      .map((item) => ({
        id: item._id,
        start: dateOnly(item.fechaInicio),
        end: dateOnly(item.fechaFin),
        employee: empleadoNombre(item.empId),
        kind: "permiso" as const,
        type: tipoNombre(item.tipo),
        status: item.estado as "pendiente" | "aprobado",
      })),
    ...vacaciones
      .filter(({ estado }) => estado !== "rechazado")
      .map((item) => ({
        id: item._id,
        start: dateOnly(item.fechaInicio),
        end: dateOnly(item.fechaFin),
        employee: empleadoNombre(item.empId),
        kind: "vacaciones" as const,
        type: item.tipo,
        status: item.estado as "pendiente" | "aprobado",
      })),
  ];

  return rows.flatMap(({ start, end, ...event }) => {
    const dates: CalendarEvent[] = [];
    for (const day = new Date(`${start}T00:00:00Z`); day <= new Date(`${end}T00:00:00Z`); day.setUTCDate(day.getUTCDate() + 1)) {
      dates.push({ ...event, date: day.toISOString().slice(0, 10) });
    }
    return dates;
  });
}

@Component({
  selector: "app-calendario",
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: "./calendario.component.html",
  styleUrl: "./calendario.component.css",
})
export class CalendarioComponent implements OnInit {
  visibleMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  events: CalendarEvent[] = [];
  selectedDay: CalendarDay | null = null;
  error = "";

  constructor(
    readonly auth: AuthService,
    private readonly permisosService: PermisosService,
    private readonly vacacionesService: VacacionesService,
    public readonly language: LanguageService,
  ) {}

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    forkJoin({
      permisos: this.auth.isAdmin() ? this.permisosService.getAll() : this.permisosService.getMine(userId),
      vacaciones: this.auth.isAdmin() ? this.vacacionesService.getAll() : this.vacacionesService.getMine(),
    }).subscribe({
      next: ({ permisos, vacaciones }) => (this.events = expandCalendarEvents(permisos, vacaciones)),
      error: () => (this.error = this.t("calendarLoadError")),
    });
  }

  monthTitle(): string {
    return this.visibleMonth.toLocaleDateString(this.language.current(), { month: "long", year: "numeric" });
  }

  days(): Array<CalendarDay | null> {
    const year = this.visibleMonth.getFullYear();
    const month = this.visibleMonth.getMonth();
    const leading = (new Date(year, month, 1).getDay() + 6) % 7;
    const result: Array<CalendarDay | null> = Array.from({ length: leading }, () => null);

    // ponytail: filtrado lineal suficiente para una plantilla pequeña; indexar por fecha si el volumen crece.
    for (let number = 1; number <= new Date(year, month + 1, 0).getDate(); number++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(number).padStart(2, "0")}`;
      result.push({ date, number, events: this.events.filter((event) => event.date === date) });
    }
    return result;
  }

  moveMonth(delta: number): void {
    this.visibleMonth = new Date(this.visibleMonth.getFullYear(), this.visibleMonth.getMonth() + delta, 1);
    this.selectedDay = null;
  }

  open(day: CalendarDay): void {
    if (day.events.length) this.selectedDay = day;
  }

  close(): void {
    this.selectedDay = null;
  }

  uniquePeople(day: CalendarDay): number {
    return new Set(day.events.map(({ employee }) => employee)).size;
  }

  dayClass(day: CalendarDay): string {
    const kinds = new Set(day.events.map(({ kind }) => kind));
    if (kinds.size > 1) return "calendar-day mixed-day";
    if (kinds.has("vacaciones")) return "calendar-day vacation-day";
    if (kinds.has("permiso")) return "calendar-day permit-day";
    return "calendar-day";
  }

  eventLabel(event: CalendarEvent): string {
    return event.kind === "vacaciones"
      ? this.t({ vacaciones: "annualLeave", personales: "personalDays", no_retribuidos: "unpaidLeave" }[event.type] || "vacations")
      : event.type;
  }

  t(key: string): string {
    return this.language.t(key);
  }
}
