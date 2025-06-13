import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MedicinesService, Medicine } from '../../services/medicines.service';
import { PacientesService, Paciente } from '../../services/pacientes.service';

interface MedicineHistoryItem {
  id: number;
  name: string;
  date: string;
  status: 'Tomado' | 'Omitido';
  patientName?: string;
}

@Component({
  selector: 'app-medicine-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicine-history.component.html',
  styleUrls: ['./medicine-history.component.scss']
})
export class MedicineHistoryComponent implements OnInit {
  compliancePercentage: number = 85; // Example value
  omittedDays: number = 0; // Initialize to 0
  medicineHistory: MedicineHistoryItem[] = [];
  pacientes: Paciente[] = [];

  constructor(
    private router: Router,
    private medicinesService: MedicinesService,
    private pacientesService: PacientesService
  ) { }

  ngOnInit(): void {
    this.loadMedicineHistory();
    this.loadPacientes();
  }

  loadMedicineHistory(): void {
    this.medicinesService.getMedicines().subscribe({
      next: (medicines) => {
        let totalMedicines = 0;
        let takenMedicines = 0;
        const omittedDates: Set<string> = new Set();

        this.medicineHistory = medicines.map(med => {
          const status: 'Tomado' | 'Omitido' = med.taken ? 'Tomado' : 'Omitido';
          totalMedicines++;
          if (med.taken) {
            takenMedicines++;
          } else {
            const dateOnly = new Date(med.horaFecha).toISOString().split('T')[0];
            omittedDates.add(dateOnly);
          }

          const patient = this.pacientes.find(p => p.id === med.pacienteId);
          const patientName = patient ? patient.nombre : 'Sin asignar';

          return {
            id: med.id!,
            name: med.nombre,
            date: new Date(med.horaFecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' + new Date(med.horaFecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
            status: status,
            patientName: patientName
          };
        });

        this.medicineHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        this.compliancePercentage = totalMedicines > 0 ? Math.round((takenMedicines / totalMedicines) * 100) : 0;
        this.omittedDays = omittedDates.size;
      },
      error: (err) => {
        console.error('Error loading medicine history:', err);
      }
    });
  }

  loadPacientes(): void {
    this.pacientesService.getPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
        console.log('Pacientes loaded:', this.pacientes);
      },
      error: (err) => {
        console.error('Error loading pacientes:', err);
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/caregiver']);
  }
} 