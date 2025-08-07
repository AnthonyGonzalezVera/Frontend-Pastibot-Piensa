import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HardwareService {
  // 🌐 Backend local (solo si usas NestJS en local)
  private backendUrl = 'http://localhost:3000';

  // 🌍 URL pública del ESP32 a través de ngrok
  private esp32Url = 'https://685baeb94ef9.ngrok-free.app'; // ⚠️ cambia si ngrok se reinicia

  constructor(private http: HttpClient) {}

  // ✅ Cabeceras con token para llamadas al backend
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ✅ Obtener medicamentos desde el backend NestJS
  getMedicamentosDesdeBackend() {
    return this.http.get<any[]>(`${this.backendUrl}/medicines`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Enviar programación al ESP32 vía ngrok (desde Vercel o local)
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
