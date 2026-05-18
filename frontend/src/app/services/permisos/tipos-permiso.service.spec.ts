import { describe, expect, it, vi } from "vitest";
import { TiposPermisoService } from "./tipos-permiso.service";

describe("TiposPermisoService", () => {
  it("pide la lista de tipos de permiso al backend", () => {
    const http = { get: vi.fn() };
    const service = new TiposPermisoService(http as never);

    service.getAll();

    expect(http.get).toHaveBeenCalledWith("http://localhost:3001/api/tipos-permiso");
  });
});
