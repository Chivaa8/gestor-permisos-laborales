import "@angular/compiler";
import { describe, expect, it } from "vitest";
import { of } from "rxjs";
import { DashboardComponent } from "./dashboard.component";

describe("DashboardComponent", () => {
  it("calcula el total y porcentajes de permisos", () => {
    const auth = { isAdmin: () => true };
    const permisos = { dashboard: () => of({ pendiente: 2, aprobado: 1, rechazado: 1 }) };
    const component = new DashboardComponent(auth as never, permisos as never);

    component.estados = { pendiente: 2, aprobado: 1, rechazado: 1 };

    expect(component.total()).toBe(4);
    expect(component.percentage("pendiente")).toBe(50);
    expect(component.percentage("aprobado")).toBe(25);
  });
});
