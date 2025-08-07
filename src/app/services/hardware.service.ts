import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HardwareService {
  // ✅ Esta es la URL de ngrok que apunta a tu ESP32 público
  private esp32Url = 'https://685baeb94ef9.ngrok-free.app'; // <--- cambia si ngrok se reinicia

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getMedicamentosDesdeBackend() {
    return this.http.get<any[]>(`http://localhost:3000/medicines`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Enviar programación directamente al ESP32 por ngrok
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
