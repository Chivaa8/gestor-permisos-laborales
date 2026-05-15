import { Component, effect, inject } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "./services/auth/auth.service";
import { Empleado, EmpleadoForm, PasswordUpdateRequest } from "./models/api.models";
import { EmpleadosService } from "./services/empleados/empleados.service";
import { AppLanguage, LanguageService } from "./services/language/language.service";
import { filter } from "rxjs";

const emptyProfile = (): EmpleadoForm => ({
  nombre: "",
  apellido: "",
  segundoApellido: "",
  email: "",
  username: "",
  foto: "",
  rol: "basic",
});

const emptyPasswordForm = (): PasswordUpdateRequest => ({
  passwordActual: "",
  passwordNueva: "",
  confirmarPassword: "",
});

@Component({
  selector: "app-root",
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class AppComponent {
  readonly auth = inject(AuthService);
  readonly language = inject(LanguageService);
  private readonly empleadosService = inject(EmpleadosService);
  private readonly router = inject(Router);

  profileOpen = false;
  profileAction: "edit" | "add" | "photo" | "password" | "" = "";
  profileError = "";
  profileSuccess = "";
  profile?: Empleado;
  profileForm = emptyProfile();
  passwordForm = emptyPasswordForm();
  isPublicPage = false;
  private loadedProfileId = "";

  constructor() {
    effect(() => {
      const currentUser = this.auth.currentUser();
      if (!currentUser) {
        this.loadedProfileId = "";
        this.profile = undefined;
        this.profileOpen = false;
        return;
      }

      if (this.loadedProfileId !== currentUser.id) {
        this.loadedProfileId = currentUser.id;
        this.loadProfile(currentUser.id);
      }
    });

    this.updatePublicPage(this.router.url);
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.updatePublicPage(event.urlAfterRedirects);
    });
  }

  initials(): string {
    if (!this.profile) {
      return this.auth.currentUser()?.username.charAt(0).toUpperCase() || "U";
    }

    return `${this.profile.nombre.charAt(0)}${this.profile.apellido.charAt(0)}`.toUpperCase();
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
    this.profileError = "";
    this.profileSuccess = "";
  }

  startEditProfile(): void {
    this.startProfileAction("edit");
  }

  startProfileAction(action: "edit" | "add" | "photo" | "password"): void {
    if (!this.profile) {
      return;
    }

    this.profileAction = action;
    this.profileForm = { ...this.profile, password: "" };
    this.passwordForm = emptyPasswordForm();
    this.profileError = "";
    this.profileSuccess = "";
  }

  cancelProfileEdit(): void {
    this.profileAction = "";
    this.profileForm = emptyProfile();
    this.passwordForm = emptyPasswordForm();
    this.profileError = "";
    this.profileSuccess = "";
  }

  saveProfile(): void {
    const id = this.auth.currentUser()?.id;
    if (!id) {
      return;
    }

    this.profileError = "";
    this.profileSuccess = "";

    this.empleadosService.update(id, this.profileForm).subscribe({
      next: (empleado) => {
        this.profile = empleado;
        this.profileForm = { ...empleado, password: "" };
        this.profileSuccess = this.t("profileUpdated");
        this.profileAction = "";
      },
      error: () => (this.profileError = this.t("profileUpdateError")),
    });
  }

  savePassword(): void {
    const id = this.auth.currentUser()?.id;
    if (!id) {
      return;
    }

    this.profileError = "";
    this.profileSuccess = "";

    if (this.passwordForm.passwordNueva !== this.passwordForm.confirmarPassword) {
      this.profileError = this.t("passwordsDontMatch");
      return;
    }

    if (this.passwordForm.passwordActual === this.passwordForm.passwordNueva) {
      this.profileError = this.t("passwordSameAsOld");
      return;
    }

    if (this.passwordForm.passwordNueva.length < 8) {
      this.profileError = this.t("passwordTooShort");
      return;
    }

    this.empleadosService.updatePassword(id, this.passwordForm).subscribe({
      next: () => {
        this.passwordForm = emptyPasswordForm();
        this.profileSuccess = this.t("passwordUpdated");
        this.profileAction = "";
      },
      error: (error: HttpErrorResponse) => {
        this.profileError = error.error?.error || this.t("passwordUpdateError");
      },
    });
  }

  canAddInfo(): boolean {
    return !this.profile?.segundoApellido;
  }

  selectLanguage(language: AppLanguage): void {
    this.language.setLanguage(language);
  }

  t(key: string): string {
    return this.language.t(key);
  }

  logout(): void {
    this.auth.logout();
  }

  showPrivateLayout(): boolean {
    return this.auth.isLoggedIn() && !this.isPublicPage;
  }

  private loadProfile(id: string): void {
    this.empleadosService.getOne(id).subscribe({
      next: (empleado) => {
        this.profile = empleado;
        this.profileForm = { ...empleado, password: "" };
      },
      error: () => (this.profileError = this.t("profileLoadError")),
    });
  }

  private updatePublicPage(url: string): void {
    this.isPublicPage = url.startsWith("/login") || url.startsWith("/reset-password");
  }
}
