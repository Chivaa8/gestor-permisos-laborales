import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ChatGrupo, ChatMensaje, ChatRealtimeEvent, Empleado } from "../../models/api.models";

@Injectable({ providedIn: "root" })
export class ChatService {
  private readonly apiUrl = "http://localhost:3001/api/chat";

  constructor(private readonly http: HttpClient) {}

  contactos(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.apiUrl}/contactos`);
  }

  conversacion(id: string): Observable<ChatMensaje[]> {
    return this.http.get<ChatMensaje[]>(`${this.apiUrl}/${id}`);
  }

  enviar(id: string, mensaje: string): Observable<ChatMensaje> {
    return this.http.post<ChatMensaje>(`${this.apiUrl}/${id}`, { mensaje });
  }

  markRead(id: string): Observable<{ leidos: number }> {
    return this.http.put<{ leidos: number }>(`${this.apiUrl}/${id}/leidas`, {});
  }

  grupos(): Observable<ChatGrupo[]> {
    return this.http.get<ChatGrupo[]>(`${this.apiUrl}/grupos`);
  }

  crearGrupo(nombre: string, participantes: string[]): Observable<ChatGrupo> {
    return this.http.post<ChatGrupo>(`${this.apiUrl}/grupos`, { nombre, participantes });
  }

  agregarParticipantes(id: string, participantes: string[]): Observable<ChatGrupo> {
    return this.http.put<ChatGrupo>(`${this.apiUrl}/grupos/${id}/participantes`, { participantes });
  }

  salirGrupo(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/grupos/${id}/salir`);
  }

  conversacionGrupo(id: string): Observable<ChatMensaje[]> {
    return this.http.get<ChatMensaje[]>(`${this.apiUrl}/grupos/${id}`);
  }

  enviarGrupo(id: string, mensaje: string): Observable<ChatMensaje> {
    return this.http.post<ChatMensaje>(`${this.apiUrl}/grupos/${id}`, { mensaje });
  }

  markGroupRead(id: string): Observable<{ leidos: number }> {
    return this.http.put<{ leidos: number }>(`${this.apiUrl}/grupos/${id}/leidas`, {});
  }

  escribiendo(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/escribiendo`, {});
  }

  subscribe(token: string, onEvent: (event: ChatRealtimeEvent) => void, onError: () => void): AbortController {
    const controller = new AbortController();

    fetch(`${this.apiUrl}/eventos`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok || !response.body) {
        throw new Error("chat stream failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const event = block.match(/^event: (.+)$/m)?.[1];
          const data = block.match(/^data: (.+)$/m)?.[1];
          if (event && data) {
            onEvent({ type: event, data: JSON.parse(data) } as ChatRealtimeEvent);
          }
        }
      }
    }).catch((error) => {
      if (error.name !== "AbortError") {
        onError();
      }
    });

    return controller;
  }
}
