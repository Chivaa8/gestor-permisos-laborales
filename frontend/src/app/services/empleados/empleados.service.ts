import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Empleado, EmpleadoForm, PasswordUpdateRequest } from "../../models/api.models";

@Injectable({ providedIn: "root" })
export class EmpleadosService {
  private readonly apiUrl = "http://localhost:3001/api/empleados";

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl);
  }

  getOne(id: string): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.apiUrl}/${id}`);
  }

  create(data: EmpleadoForm): Observable<Empleado> {
    return this.http.post<Empleado>(this.apiUrl, data);
  }

  update(id: string, data: Partial<EmpleadoForm>): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.apiUrl}/${id}`, data);
  }

  updatePassword(id: string, data: PasswordUpdateRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/password`, data);
  }

  subirSueldo(id: string, cantidad: number): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.apiUrl}/${id}/subir-sueldo`, { cantidad });
  }

  bajarSueldo(id: string, cantidad: number): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.apiUrl}/${id}/bajar-sueldo`, { cantidad });
  }

  delete(id: string): Observable<{ message: string; permisosEliminados?: number }> {
    return this.http.delete<{ message: string; permisosEliminados?: number }>(`${this.apiUrl}/${id}`);
  }
}
