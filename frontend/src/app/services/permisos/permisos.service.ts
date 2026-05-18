import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { DashboardEstados, EstadoPermiso, Permiso, PermisoForm } from "../../models/api.models";

export interface PermisoFilters {
  estado?: EstadoPermiso | "";
  empId?: string;
  empTramitador?: string;
}

@Injectable({ providedIn: "root" })
export class PermisosService {
  private readonly apiUrl = "http://localhost:3001/api/permisos";

  constructor(private readonly http: HttpClient) {}

  getAll(filters: PermisoFilters = {}): Observable<Permiso[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http.get<Permiso[]>(this.apiUrl, { params });
  }

  getMine(employeeId: string): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.apiUrl}/${employeeId}/misPermisos`);
  }

  create(data: PermisoForm): Observable<Permiso> {
    return this.http.post<Permiso>(`${this.apiUrl}/crear`, data);
  }

  approve(id: string): Observable<Permiso> {
    return this.http.put<Permiso>(`${this.apiUrl}/${id}/aprobado`, {});
  }

  reject(id: string): Observable<Permiso> {
    return this.http.put<Permiso>(`${this.apiUrl}/${id}/rechazado`, {});
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  dashboard(): Observable<DashboardEstados> {
    return this.http.get<DashboardEstados>(`${this.apiUrl}/dashboard/estados`);
  }
}
