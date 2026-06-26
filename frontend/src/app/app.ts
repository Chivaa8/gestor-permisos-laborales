import { Component, HostListener, effect, inject } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { DatePipe, NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "./services/auth/auth.service";
import { ChatGrupo, ChatMensaje, ChatRealtimeEvent, Empleado, EmpleadoForm, Notificacion, PasswordUpdateRequest } from "./models/api.models";
import { EmpleadosService } from "./services/empleados/empleados.service";
import { NotificacionesService } from "./services/notificaciones/notificaciones.service";
import { ChatService } from "./services/chat/chat.service";
import { AppLanguage, LanguageService } from "./services/language/language.service";
import { filter } from "rxjs";
import { normalizePhotoUrl } from "./models/photo-url";

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
  imports: [DatePipe, FormsModule, NgFor, NgIf, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class AppComponent {
  readonly auth = inject(AuthService);
  readonly language = inject(LanguageService);
  private readonly empleadosService = inject(EmpleadosService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly chatService = inject(ChatService);
  private readonly router = inject(Router);

  profileOpen = false;
  messagesOpen = false;
  chatOpen = false;
  chatMinimized = false;
  profileAction: "edit" | "add" | "photo" | "password" | "" = "";
  profileError = "";
  profileSuccess = "";
  profile?: Empleado;
  profileForm = emptyProfile();
  passwordForm = emptyPasswordForm();
  isPublicPage = false;
  isDarkMode = localStorage.getItem("travelconnect_theme") === "dark";
  profilePhotoFailed = false;
  photoPreviewFailed = false;
  notificaciones: Notificacion[] = [];
  chatContacts: Empleado[] = [];
  chatGroups: ChatGrupo[] = [];
  selectedChat?: Empleado;
  selectedGroup?: ChatGrupo;
  chatMessages: ChatMensaje[] = [];
  chatText = "";
  chatError = "";
  creatingGroup = false;
  addingPeople = false;
  groupName = "";
  groupParticipantIds = new Set<string>();
  addParticipantIds = new Set<string>();
  unreadChatIds = new Set<string>();
  typingContactId = "";
  private loadedProfileId = "";
  private chatEvents?: AbortController;
  private typingClearTimer?: number;
  private lastTypingSentAt = 0;

  constructor() {
    this.applyTheme();

    effect(() => {
      const currentUser = this.auth.currentUser();
      if (!currentUser) {
        this.loadedProfileId = "";
        this.profile = undefined;
        this.profileOpen = false;
        this.messagesOpen = false;
        this.chatOpen = false;
        this.chatMinimized = false;
        this.notificaciones = [];
        this.chatContacts = [];
        this.chatGroups = [];
        this.chatMessages = [];
        this.selectedChat = undefined;
        this.selectedGroup = undefined;
        this.unreadChatIds = new Set<string>();
        this.typingContactId = "";
        this.chatEvents?.abort();
        this.chatEvents = undefined;
        return;
      }

      if (this.loadedProfileId !== currentUser.id) {
        this.loadedProfileId = currentUser.id;
        this.loadProfile(currentUser.id);
        this.loadNotifications();
        this.startChatEvents();
      }
    });

    this.updatePublicPage(this.router.url);
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.updatePublicPage(event.urlAfterRedirects);
      this.closeProfile();
      this.messagesOpen = false;
      this.chatOpen = false;
      this.chatMinimized = false;
    });
  }

  @HostListener("document:click", ["$event"])
  closeProfileOnOutsideClick(event: MouseEvent): void {
    if ((!this.profileOpen && !this.messagesOpen && !this.chatOpen) || !(event.target instanceof Element)) {
      return;
    }

    const clickedInsideProfile = event.target.closest(".profile-area, .profile-menu");
    const clickedInsideMessages = event.target.closest(".messages-trigger, .messages-menu");
    const clickedInsideChat = event.target.closest(".chat-trigger, .chat-menu, .chat-minimized");
    if (!clickedInsideProfile && !clickedInsideMessages && !clickedInsideChat) {
      this.closeProfile();
      this.messagesOpen = false;
      this.chatOpen = false;
    }
  }

  initials(): string {
    if (!this.profile) {
      return this.auth.currentUser()?.username.charAt(0).toUpperCase() || "U";
    }

    return `${this.profile.nombre.charAt(0)}${this.profile.apellido.charAt(0)}`.toUpperCase();
  }

  toggleProfile(): void {
    const shouldOpen = !this.profileOpen;
    if (!shouldOpen) {
      this.closeProfile();
      return;
    }

    this.profileOpen = true;
    this.messagesOpen = false;
    this.chatOpen = false;
    this.profileError = "";
    this.profileSuccess = "";
  }

  toggleMessages(): void {
    this.messagesOpen = !this.messagesOpen;
    this.profileOpen = false;
    this.chatOpen = false;
    if (this.messagesOpen) {
      this.loadNotifications();
      if (this.unreadNotifications() > 0) {
        this.notificacionesService.markRead().subscribe({
          next: () => this.notificaciones = this.notificaciones.map((item) => ({ ...item, leida: true })),
        });
      }
    }
  }

  unreadNotifications(): number {
    return this.notificaciones.filter((item) => !item.leida).length;
  }

  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
    this.chatMinimized = false;
    this.profileOpen = false;
    this.messagesOpen = false;
    if (!this.chatOpen) {
      return;
    }

    if (this.chatContacts.length === 0) {
      this.loadChatContacts();
      this.loadChatGroups();
    } else if (!this.selectedChat) {
      this.selectChat(this.chatContacts[0]);
    }
  }

  minimizeChat(): void {
    this.chatOpen = false;
    this.chatMinimized = true;
  }

  closeChat(): void {
    this.chatOpen = false;
    this.chatMinimized = false;
  }

  selectChat(contact: Empleado): void {
    this.selectedChat = contact;
    this.selectedGroup = undefined;
    this.chatError = "";
    this.unreadChatIds.delete(`u:${contact._id}`);
    this.chatService.conversacion(contact._id).subscribe({
      next: (mensajes) => {
        this.chatMessages = mensajes;
        this.markSelectedChatRead();
      },
      error: () => (this.chatError = this.t("chatLoadError")),
    });
  }

  selectGroup(group: ChatGrupo): void {
    this.selectedGroup = group;
    this.selectedChat = undefined;
    this.chatError = "";
    this.unreadChatIds.delete(`g:${group._id}`);
    this.chatService.conversacionGrupo(group._id).subscribe({
      next: (mensajes) => {
        this.chatMessages = mensajes;
        this.markSelectedChatRead();
      },
      error: () => (this.chatError = this.t("chatLoadError")),
    });
  }

  sendChat(): void {
    const text = this.chatText.trim();
    if (!text || (!this.selectedChat && !this.selectedGroup)) {
      return;
    }

    const request = this.selectedGroup
      ? this.chatService.enviarGrupo(this.selectedGroup._id, text)
      : this.chatService.enviar(this.selectedChat!._id, text);

    request.subscribe({
      next: (mensaje) => {
        if (!this.chatMessages.some((item) => item._id === mensaje._id)) {
          this.chatMessages = [...this.chatMessages, mensaje];
        }
        this.chatText = "";
      },
      error: () => (this.chatError = this.t("chatSendError")),
    });
  }

  chatName(contact?: Empleado): string {
    return contact ? `${contact.nombre} ${contact.apellido}`.trim() || contact.username : "";
  }

  unreadChatCount(): number {
    return this.unreadChatIds.size;
  }

  currentChatTitle(): string {
    return this.selectedGroup?.nombre || this.chatName(this.selectedChat);
  }

  toggleGroupParticipant(id: string): void {
    const next = new Set(this.groupParticipantIds);
    next.has(id) ? next.delete(id) : next.add(id);
    this.groupParticipantIds = next;
  }

  toggleAddParticipant(id: string): void {
    const next = new Set(this.addParticipantIds);
    next.has(id) ? next.delete(id) : next.add(id);
    this.addParticipantIds = next;
  }

  availableGroupContacts(): Empleado[] {
    return this.selectedGroup
      ? this.chatContacts.filter((contact) => !this.selectedGroup!.participantes.includes(contact._id))
      : [];
  }

  createGroup(): void {
    if (!this.groupName.trim() || this.groupParticipantIds.size === 0) {
      return;
    }

    this.chatService.crearGrupo(this.groupName.trim(), [...this.groupParticipantIds]).subscribe({
      next: (group) => {
        this.chatGroups = [group, ...this.chatGroups.filter((item) => item._id !== group._id)];
        this.groupName = "";
        this.groupParticipantIds = new Set<string>();
        this.creatingGroup = false;
        this.selectGroup(group);
      },
      error: () => (this.chatError = this.t("chatGroupError")),
    });
  }

  addPeopleToGroup(): void {
    if (!this.selectedGroup || this.addParticipantIds.size === 0) {
      return;
    }

    this.chatService.agregarParticipantes(this.selectedGroup._id, [...this.addParticipantIds]).subscribe({
      next: (group) => {
        this.chatGroups = this.chatGroups.map((item) => item._id === group._id ? group : item);
        this.selectedGroup = group;
        this.addParticipantIds = new Set<string>();
        this.addingPeople = false;
      },
      error: () => (this.chatError = this.t("chatGroupError")),
    });
  }

  leaveGroup(): void {
    if (!this.selectedGroup) {
      return;
    }

    const groupId = this.selectedGroup._id;
    this.chatService.salirGrupo(groupId).subscribe({
      next: () => {
        this.chatGroups = this.chatGroups.filter((group) => group._id !== groupId);
        this.selectedGroup = undefined;
        this.chatMessages = [];
        this.addingPeople = false;
        this.addParticipantIds = new Set<string>();
        if (this.chatContacts[0]) {
          this.selectChat(this.chatContacts[0]);
        }
      },
      error: () => (this.chatError = this.t("chatGroupError")),
    });
  }

  notifyTyping(): void {
    const now = Date.now();
    if (!this.selectedChat || this.selectedGroup || now - this.lastTypingSentAt < 1600) {
      return;
    }

    this.lastTypingSentAt = now;
    this.chatService.escribiendo(this.selectedChat._id).subscribe();
  }

  isTyping(contact?: Empleado): boolean {
    return Boolean(contact && this.typingContactId === contact._id);
  }

  messageStatus(message: ChatMensaje): string {
    if (message.emisor !== this.auth.currentUser()?.id) {
      return "";
    }

    if (this.selectedChat?._id === this.auth.currentUser()?.id) {
      return "✓✓";
    }

    const seen = (message.leidoPor || []).some((id) => id !== this.auth.currentUser()?.id);
    return seen ? "✓✓" : "✓";
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
    this.photoPreviewFailed = false;
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

  private closeProfile(): void {
    this.profileOpen = false;
    this.profileAction = "";
    this.profileForm = emptyProfile();
    this.passwordForm = emptyPasswordForm();
    this.profileError = "";
    this.profileSuccess = "";
    this.photoPreviewFailed = false;
  }

  saveProfile(): void {
    const id = this.auth.currentUser()?.id;
    if (!id) {
      return;
    }

    this.profileError = "";
    this.profileSuccess = "";

    if (this.profileAction === "photo") {
      this.profileForm.foto = normalizePhotoUrl(this.profileForm.foto);
      if (this.profileForm.foto && this.photoPreviewFailed) {
        this.profileError = "La URL no contiene una imagen accesible. Usa el enlace directo de la imagen.";
        return;
      }
    }

    this.empleadosService.update(id, this.profileForm).subscribe({
      next: (empleado) => {
        this.profile = empleado;
        this.profilePhotoFailed = false;
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

  updatePhotoPreview(): void {
    this.profileForm.foto = normalizePhotoUrl(this.profileForm.foto);
    this.photoPreviewFailed = false;
  }

  markProfilePhotoFailed(): void {
    this.profilePhotoFailed = true;
  }

  markPhotoPreviewFailed(): void {
    this.photoPreviewFailed = true;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem("travelconnect_theme", this.isDarkMode ? "dark" : "light");
    this.applyTheme();
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
        this.profilePhotoFailed = false;
        this.profileForm = { ...empleado, password: "" };
      },
      error: () => (this.profileError = this.t("profileLoadError")),
    });
  }

  private loadNotifications(): void {
    this.notificacionesService.getMine().subscribe({
      next: (data) => (this.notificaciones = data),
      error: () => (this.notificaciones = []),
    });
  }

  private loadChatContacts(): void {
    this.chatService.contactos().subscribe({
      next: (contactos) => {
        this.chatContacts = contactos;
        if ((!this.selectedChat || !contactos.some((contacto) => contacto._id === this.selectedChat?._id)) && contactos[0]) {
          this.selectChat(contactos[0]);
        }
      },
      error: () => (this.chatError = this.t("chatLoadError")),
    });
  }

  private loadChatGroups(): void {
    this.chatService.grupos().subscribe({
      next: (groups) => (this.chatGroups = groups),
      error: () => (this.chatError = this.t("chatLoadError")),
    });
  }

  private markSelectedChatRead(): void {
    if (this.selectedGroup) {
      this.chatService.markGroupRead(this.selectedGroup._id).subscribe({
        next: () => {},
      });
      return;
    }

    if (this.selectedChat) {
      this.chatService.markRead(this.selectedChat._id).subscribe({
        next: () => {},
      });
    }
  }

  private startChatEvents(): void {
    const token = this.auth.getToken();
    if (!token) {
      return;
    }

    this.chatEvents?.abort();
    this.chatEvents = this.chatService.subscribe(
      token,
      (event) => this.handleChatEvent(event),
      () => (this.chatError = this.t("chatLoadError")),
    );
  }

  private handleChatEvent(event: ChatRealtimeEvent): void {
    if (event.type === "mensaje") {
      const currentUserId = this.auth.currentUser()?.id;
      const otherId = event.data.emisor === currentUserId ? event.data.receptor : event.data.emisor;

      if (event.data.grupo) {
        if (this.chatOpen && this.selectedGroup?._id === event.data.grupo) {
          if (!this.chatMessages.some((message) => message._id === event.data._id)) {
            this.chatMessages = [...this.chatMessages, event.data];
          }
          this.markSelectedChatRead();
        } else {
          this.unreadChatIds = new Set(this.unreadChatIds).add(`g:${event.data.grupo}`);
        }
        this.loadChatGroups();
        return;
      }

      if (this.chatOpen && this.selectedChat?._id === otherId) {
        if (!this.chatMessages.some((message) => message._id === event.data._id)) {
          this.chatMessages = [...this.chatMessages, event.data];
        }
        this.markSelectedChatRead();
      } else {
        this.unreadChatIds = new Set(this.unreadChatIds).add(`u:${otherId}`);
      }

      if (this.chatContacts.length === 0) {
        this.loadChatContacts();
      }
    }

    if (event.type === "grupo") {
      this.chatGroups = [event.data, ...this.chatGroups.filter((group) => group._id !== event.data._id)];
      if (this.selectedGroup?._id === event.data._id) {
        this.selectedGroup = event.data;
      }
    }

    if (event.type === "grupo-salida") {
      this.chatGroups = this.chatGroups.filter((group) => group._id !== event.data.grupo);
      if (this.selectedGroup?._id === event.data.grupo) {
        this.selectedGroup = undefined;
        this.chatMessages = [];
      }
    }

    if (event.type === "visto") {
      this.chatMessages = this.chatMessages.map((message) =>
        event.data.messageIds.includes(message._id)
          ? { ...message, leidoPor: [...new Set([...(message.leidoPor || []), event.data.lector])] }
          : message,
      );
    }

    if (event.type === "escribiendo" && this.selectedChat?._id === event.data.emisor) {
      this.typingContactId = event.data.emisor;
      clearTimeout(this.typingClearTimer);
      this.typingClearTimer = window.setTimeout(() => (this.typingContactId = ""), 2200);
    }
  }

  private updatePublicPage(url: string): void {
    this.isPublicPage = url.startsWith("/login") || url.startsWith("/reset-password");
  }

  private applyTheme(): void {
    document.documentElement.classList.toggle("dark-theme", this.isDarkMode);
  }
}
