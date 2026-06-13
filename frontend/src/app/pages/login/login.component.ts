import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "../../services/auth/auth.service";
import { LanguageService } from "../../services/language/language.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  mode: "login" | "register" | "forgot" = "login";
  username = "";
  password = "";
  recoveryEmail = "";
  resetUrl = "";
  nombre = "";
  apellido = "";
  segundoApellido = "";
  email = "";
  confirmPassword = "";
  error = "";
  info = "";
  loading = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    public readonly language: LanguageService,
  ) {}

  t(key: string): string {
    return this.language.t(key);
  }

  submit(): void {
    this.error = "";
    this.info = "";
    this.loading = true;

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl("/dashboard"),
      error: (error: unknown) => {
        this.error = this.errorMessage(error, "Usuario o contraseña incorrectos");
        this.loading = false;
      },
    });
  }

  register(): void {
    this.error = "";
    this.info = "";

    if (this.password !== this.confirmPassword) {
      this.error = "Las contraseñas no coinciden";
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.error = "Introduce un correo electrónico válido, por ejemplo nombre@dominio.com";
      return;
    }

    this.loading = true;
    this.auth
      .register({
        nombre: this.nombre,
        apellido: this.apellido,
        segundoApellido: this.segundoApellido,
        email: this.email,
        username: this.username,
        password: this.password,
        rol: "basic",
      })
      .subscribe({
        next: () => {
          this.info = "Usuario creado. Ya puedes iniciar sesión.";
          this.mode = "login";
          this.confirmPassword = "";
          this.loading = false;
        },
        error: (error: unknown) => {
          this.error = this.errorMessage(error, "No se ha podido crear el usuario");
          this.loading = false;
        },
      });
  }

  showForgotPassword(): void {
    this.error = "";
    this.info = "";
    this.mode = "forgot";
  }

  requestPasswordReset(): void {
    this.error = "";
    this.info = "";
    this.resetUrl = "";

    if (!this.isValidEmail(this.recoveryEmail)) {
      this.error = "Introduce un correo electrónico válido, por ejemplo nombre@dominio.com";
      return;
    }

    this.loading = true;

    this.auth.forgotPassword(this.recoveryEmail).subscribe({
      next: (response) => {
        this.info = response.message;
        this.resetUrl = response.resetUrl || "";
        this.loading = false;
      },
      error: (error: unknown) => {
        this.error = this.errorMessage(error, "No se ha podido enviar el correo de recuperacion");
        this.loading = false;
      },
    });
  }

  switchMode(mode: "login" | "register" | "forgot"): void {
    this.mode = mode;
    this.error = "";
    this.info = "";
    this.resetUrl = "";
    this.loading = false;
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const serverError = error.error as { error?: string; message?: string } | null;
      return serverError?.error || serverError?.message || fallback;
    }

    return fallback;
  }

  isValidEmail(value: string): boolean {
    return this.emailRegex.test(value.trim());
  }
}
