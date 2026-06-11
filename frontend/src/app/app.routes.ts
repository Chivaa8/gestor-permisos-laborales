import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { EmpleadosComponent } from "./pages/empleados/empleados.component";
import { PermisosComponent } from "./pages/permisos/permisos.component";
import { ResetPasswordComponent } from "./pages/reset-password/reset-password.component";
import { authGuard } from "./services/auth/auth.guard";
import { adminGuard } from "./services/auth/admin.guard";
import { guestGuard } from "./services/auth/guest.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent, canActivate: [guestGuard] },
  { path: "reset-password/:token", component: ResetPasswordComponent, canActivate: [guestGuard] },
  { path: "dashboard", component: DashboardComponent, canActivate: [authGuard] },
  { path: "empleados", component: EmpleadosComponent, canActivate: [authGuard, adminGuard] },
  { path: "permisos", component: PermisosComponent, canActivate: [authGuard] },
  { path: "", pathMatch: "full", redirectTo: "login" },
  { path: "**", redirectTo: "login" },
];
