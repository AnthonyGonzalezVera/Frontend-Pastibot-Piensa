import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'; // 👈 Asegúrate de importar esto

@Injectable({ providedIn: 'root' })
export class HardwareService {
  // 🌐 URL del backend NestJS (se adapta al entorno automáticamente)
  private backendUrl = environment.apiUrl;

  // ✅ Proxy para ESP32
  private esp32ProxyUrl = '/esp32';

  constructor(private http: HttpClient) {}

  // 👉 Headers con token JWT
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ✅ Obtener medicamentos del backend (NestJS)
  getMedicamentosDesdeBackend() {
    return this.http.get<any[]>(`${this.backendUrl}/medicines`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Activar dispensador físico vía ESP32
  activarDispensador() {
    return this.http.get(`${this.esp32ProxyUrl}/listo`, {
      responseType: 'text'
    });
  }

  // ✅ Programar dispensación vía ESP32
  programarMedicamento(med: number, cant: number) {
    return this.http.get(`${this.esp32ProxyUrl}/programar?med=${med}&cant=${cant}`, {
      responseType: 'text'
    });
  }

  // ✅ Guardar nombre de medicamento en ESP32
  guardarNombre(med: number, nombre: string) {
    return this.http.get(`${this.esp32ProxyUrl}/guardar?med=${med}&nombre=${nombre}`, {
      responseType: 'text'
    });
  }
}
