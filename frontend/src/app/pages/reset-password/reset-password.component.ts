import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "../../services/auth/auth.service";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: "./reset-password.component.html",
  styleUrl: "./reset-password.component.css",
})
export class ResetPasswordComponent {
  password = "";
  confirmarPassword = "";
  error = "";
  success = "";
  loading = false;
  private readonly token: string;

  constructor(private readonly auth: AuthService, private readonly route: ActivatedRoute) {
    this.token = this.route.snapshot.paramMap.get("token") || "";
  }

  reset(): void {
    this.error = "";
    this.success = "";

    if (this.password !== this.confirmarPassword) {
      this.error = "Las contraseñas no coinciden";
      return;
    }

    this.loading = true;
    this.auth
      .resetPassword({
        token: this.token,
        password: this.password,
        confirmarPassword: this.confirmarPassword,
      })
      .subscribe({
        next: (response) => {
          this.success = response.message;
          this.loading = false;
        },
        error: (error: unknown) => {
          this.error = this.errorMessage(error, "No se ha podido cambiar la contraseña");
          this.loading = false;
        },
      });
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const serverError = error.error as { error?: string; message?: string } | null;
      return serverError?.error || serverError?.message || fallback;
    }

    return fallback;
  }
}
