import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HardwareService {
  private backendUrl = 'http://localhost:3000';
  private esp32ProxyUrl = '/esp32';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ✅ Backend con token
  getMedicamentosDesdeBackend() {
    return this.http.get<any[]>(`${this.backendUrl}/medicines`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ POST al ESP32
  programarMedicamentoDirecto(data: any) {
    return this.http.post(`${this.esp32ProxyUrl}/programar`, data, {
      responseType: 'text'
    });
  }
}
