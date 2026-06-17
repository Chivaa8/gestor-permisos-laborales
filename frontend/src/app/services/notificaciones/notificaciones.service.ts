import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Notificacion } from "../../models/api.models";

@Injectable({ providedIn: "root" })
export class NotificacionesService {
  private readonly apiUrl = "http://localhost:3001/api/notificaciones";

  constructor(private readonly http: HttpClient) {}

  getMine(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/mias`);
  }

  markRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/leidas`, {});
  }
}
