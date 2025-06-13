import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SupportFamily {
  id?: number;
  phoneNumber: string;
  pacienteId: number;
  status?: 'pending' | 'active';
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SupportFamilyService {
  private apiUrl = `${environment.apiUrl}/support-family`;

  constructor(private http: HttpClient) {}

  createSupportFamily(pacienteId: number, phoneNumber: string): Observable<SupportFamily> {
    return this.http.post<SupportFamily>(`${this.apiUrl}/${pacienteId}`, { phoneNumber });
  }

  getSupportFamily(pacienteId: number): Observable<SupportFamily[]> {
    return this.http.get<SupportFamily[]>(`${this.apiUrl}/${pacienteId}`);
  }

  updateSupportFamily(pacienteId: number, data: Partial<SupportFamily>): Observable<SupportFamily> {
    return this.http.patch<SupportFamily>(`${this.apiUrl}/${pacienteId}`, data);
  }

  deleteSupportFamily(pacienteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${pacienteId}`);
  }
} 