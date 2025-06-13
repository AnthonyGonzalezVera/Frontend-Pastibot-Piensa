import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type MedicineCreatedBy = 'manual' | 'chatbot' | 'system';

export interface Medicine {
  id?: number;
  nombre: string;
  dosis: string;
  frecuencia: string;
  horaFecha: string;
  createdAt?: string;
  taken?: boolean;
  durationInDays?: number;
  totalDoses?: number;
  dosesTaken?: number;
  recurrenceType?: string;
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  pacienteId?: number;
  createdBy?: MedicineCreatedBy;
  paciente?: {
    id: number;
    nombre: string;
  };
}

@Injectable({ providedIn: 'root' })
export class MedicinesService {
  private apiUrl = environment.apiUrl + '/medicines';

  constructor(private http: HttpClient) {}

  getMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(this.apiUrl);
  }

  getMedicine(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
  }

  createMedicine(medicine: Medicine): Observable<Medicine> {
    return this.http.post<Medicine>(this.apiUrl, medicine);
  }

  updateMedicine(id: number, medicine: Partial<Medicine>): Observable<Medicine> {
    return this.http.patch<Medicine>(`${this.apiUrl}/${id}`, medicine);
  }

  deleteMedicine(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 