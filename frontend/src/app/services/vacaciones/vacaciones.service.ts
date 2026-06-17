import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  DashboardVacaciones,
  EstadoPermiso,
  SaldoVacaciones,
  SaldoVacacionesResponse,
  TipoVacacion,
  Vacacion,
  VacacionForm,
} from "../../models/api.models";

export interface VacacionesFilters {
  estado?: EstadoPermiso | "";
  tipo?: TipoVacacion | "";
  empId?: string;
  year?: number;
}

@Injectable({ providedIn: "root" })
export class VacacionesService {
  private readonly apiUrl = "http://localhost:3001/api/vacaciones";

  constructor(private readonly http: HttpClient) {}

  create(data: VacacionForm): Observable<Vacacion> {
    return this.http.post<Vacacion>(this.apiUrl, data);
  }

  getAll(filters: VacacionesFilters = {}): Observable<Vacacion[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined) params = params.set(key, String(value));
    });
    return this.http.get<Vacacion[]>(this.apiUrl, { params });
  }

  getMine(): Observable<Vacacion[]> {
    return this.http.get<Vacacion[]>(`${this.apiUrl}/mias`);
  }

  getBalance(employeeId: string, year = new Date().getFullYear()): Observable<SaldoVacacionesResponse> {
    return this.http.get<SaldoVacacionesResponse>(`${this.apiUrl}/saldo/${employeeId}`, {
      params: { year },
    });
  }

  approve(id: string): Observable<{ vacacion: Vacacion; saldo: SaldoVacaciones; emailEnviado: boolean }> {
    return this.http.put<{ vacacion: Vacacion; saldo: SaldoVacaciones; emailEnviado: boolean }>(
      `${this.apiUrl}/${id}/aprobar`,
      {},
    );
  }

  reject(id: string): Observable<Vacacion> {
    return this.http.put<Vacacion>(`${this.apiUrl}/${id}/rechazar`, {});
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  dashboard(year = new Date().getFullYear()): Observable<DashboardVacaciones> {
    return this.http.get<DashboardVacaciones>(`${this.apiUrl}/dashboard/resumen`, { params: { year } });
  }
}
