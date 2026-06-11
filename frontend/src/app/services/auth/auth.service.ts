import { Injectable, computed, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import {
  CurrentUser,
  Empleado,
  EmpleadoForm,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
} from "../../models/api.models";

const TOKEN_KEY = "gestor_permisos_token";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly apiUrl = "http://localhost:3001/api";
  private readonly userSignal = signal<CurrentUser | null>(this.decodeToken(this.getToken()));
  readonly currentUser = computed(() => this.userSignal());

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    localStorage.removeItem(TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        sessionStorage.setItem(TOKEN_KEY, response.token);
        this.userSignal.set(this.decodeToken(response.token));
      }),
    );
  }

  register(data: EmpleadoForm): Observable<Empleado> {
    return this.http.post<Empleado>(`${this.apiUrl}/auth/register`, { ...data, rol: "basic" });
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(data: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, data);
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this.userSignal.set(null);
    this.router.navigateByUrl("/login");
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return Boolean(this.currentUser());
  }

  isAdmin(): boolean {
    return this.currentUser()?.rol === "admin";
  }

  private decodeToken(token: string | null): CurrentUser | null {
    if (!token) {
      return null;
    }

    try {
      const payload = token.split(".")[1];
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(normalized)) as CurrentUser;
    } catch {
      return null;
    }
  }
}
