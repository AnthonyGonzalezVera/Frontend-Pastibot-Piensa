import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HardwareService {
  // ✅ Tu backend local (opcional, no se toca)
  private backendUrl = 'http://localhost:3000';

  // ✅ Reemplazamos el proxy local con la URL pública del ESP32
  private esp32Url = 'https://685baeb94ef9.ngrok-free.app'; // ⚠️ Usa siempre la URL actual de ngrok

  constructor(private http: HttpClient) {}

  // ✅ Backend con token (no se modifica)
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ✅ Obtener medicamentos desde el backend
  getMedicamentosDesdeBackend() {
    return this.http.get<any[]>(`${this.backendUrl}/medicines`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Enviar programación al ESP32 usando la URL de ngrok
  programarMedicamentoDirecto(data: {
    nombre: string;
    dispensador: number;
    cantidad: number;
  }) {
    return this.http.post(`${this.esp32Url}/programar`, data, {
      responseType: 'text'
    });
  }
}
