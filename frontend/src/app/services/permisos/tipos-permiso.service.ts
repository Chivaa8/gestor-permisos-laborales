import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { TipoPermiso } from "../../models/api.models";

@Injectable({ providedIn: "root" })
export class TiposPermisoService {
  private readonly apiUrl = "http://localhost:3001/api/tipos-permiso";

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<TipoPermiso[]> {
    return this.http.get<TipoPermiso[]>(this.apiUrl);
  }
}
