import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { Permiso, Vacacion } from "../../models/api.models";
import { esLaborableBarcelona } from "../../models/festivos-barcelona";
import { expandCalendarEvents } from "./calendario.component";

describe("expandCalendarEvents", () => {
  it("expande rangos e ignora solicitudes rechazadas", () => {
    const employee = { _id: "1", nombre: "Ana", apellido: "López", email: "", username: "", rol: "basic" as const };
    const permiso = {
      _id: "p1", empId: employee, fechaCreacion: "", fechaInicio: "2026-06-19",
      fechaFin: "2026-06-20", tipo: { _id: "t1", nombre: "Médico" }, descripcion: "", estado: "aprobado",
    } as Permiso;
    const rechazada = {
      _id: "v1", empId: employee, fechaCreacion: "", fechaInicio: "2026-06-19",
      fechaFin: "2026-06-21", tipo: "vacaciones", dias: 3, estado: "rechazado",
    } as Vacacion;

    expect(expandCalendarEvents([permiso], [rechazada]).map(({ date }) => date))
      .toEqual(["2026-06-19", "2026-06-20"]);
  });

  it("no cuenta fines de semana ni festivos de Barcelona", () => {
    expect(esLaborableBarcelona("2026-06-20")).toBe(false);
    expect(esLaborableBarcelona("2026-09-24")).toBe(false);
    expect(esLaborableBarcelona("2026-09-25")).toBe(true);
  });
});
