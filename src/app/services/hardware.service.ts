import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HardwareService {
  // 🌐 Backend NestJS (para obtener medicamentos guardados con autenticación)
  private backendUrl = 'http://localhost:3000';

  // ✅ Ya no usamos la IP directamente. Usamos el proxy definido como "/esp32"
  private esp32ProxyUrl = '/esp32';

  constructor(private http: HttpClient) {}

  // 👉 Headers con token para proteger rutas del backend
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ✅ Obtener medicamentos desde backend con token (NestJS)
  getMedicamentosDesdeBackend() {
    return this.http.get<any[]>(`${this.backendUrl}/medicines`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Activar dispensador desde el ESP32 (vía proxy)
  activarDispensador() {
    return this.http.get(`${this.esp32ProxyUrl}/listo`, {
      responseType: 'text'
    });
  }

  // ✅ Programar medicamento en el ESP32 (vía proxy)
  programarMedicamento(med: number, cant: number) {
    return this.http.get(`${this.esp32ProxyUrl}/programar?med=${med}&cant=${cant}`, {
      responseType: 'text'
    });
  }

  // ✅ Guardar nombre en el ESP32 (vía proxy)
  guardarNombre(med: number, nombre: string) {
    return this.http.get(`${this.esp32ProxyUrl}/guardar?med=${med}&nombre=${nombre}`, {
      responseType: 'text'
    });
  }
}
