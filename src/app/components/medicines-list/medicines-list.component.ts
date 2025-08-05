import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MedicinesService, Medicine } from '../../services/medicines.service';
import { PacientesService } from '../../services/pacientes.service';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

interface GroupedMedicine {
  patientName: string;
  patientId: number | null;
  medicines: Medicine[];
}

@Component({
  selector: 'app-medicines-list',
  standalone: true,
  imports: [CommonModule, DatePipe, ConfirmModalComponent],
  templateUrl: './medicines-list.component.html',
  styleUrls: ['./medicines-list.component.scss']
})
export class MedicinesListComponent implements OnInit {
  activeTab: 'all' | 'daily' | 'weekly' | 'monthly' = 'all';
  groupedMedicines: GroupedMedicine[] = [];
  isLoading = false;
  showConfirmModal = false;
  selectedPatientId: number | null = null;

  constructor(
    private router: Router,
    private medicinesService: MedicinesService,
    private pacientesService: PacientesService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  setActiveTab(tab: 'all' | 'daily' | 'weekly' | 'monthly'): void {
    this.activeTab = tab;
    this.loadMedicines();
  }

  isToday(dateString: string): boolean {
    const now = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  getLabelForDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();

    if (this.isToday(dateStr)) return 'HOY';
    if (this.isInThisWeek(date, today)) return 'Esta semana';
    if (this.isInThisMonth(date, today)) return 'Este mes';
    return date.toLocaleDateString();
  }

  navigateBack(): void {
    this.router.navigate(['/caregiver']);
  }

  navigateToMedicineDetail(patientId: number | null): void {
    if (patientId) {
      this.router.navigate(['/medicines', patientId]);
    }
  }

  loadMedicines(): void {
    this.isLoading = true;
    this.medicinesService.getMedicines().subscribe({
      next: (medicines) => {
        const allMedicines: Medicine[] = [];

        medicines.forEach(med => {
          const expanded = this.expandMedicineAgenda(med);
          allMedicines.push(...expanded);
        });

        const filteredMedicines = allMedicines.filter(medicine => {
          const dateLocal = new Date(medicine.horaFecha);
          switch (this.activeTab) {
            case 'daily':
              return this.isToday(dateLocal.toISOString());
            case 'weekly':
              return this.isInThisWeek(dateLocal, new Date());
            case 'monthly':
              return this.isInThisMonth(dateLocal, new Date());
            case 'all':
            default:
              return true;
          }
        });

        this.groupedMedicines = this.groupMedicinesByPatient(filteredMedicines);
        this.isLoading = false;
      },
      error: () => {
        this.toastService.show('Error al cargar los medicamentos', 'error');
        this.isLoading = false;
      }
    });
  }

  private expandMedicineAgenda(medicine: Medicine): Medicine[] {
    const frequencyMap: { [key: string]: number } = {
      'cada 4 horas': 4 * 60 * 60 * 1000,
      'cada 6 horas': 6 * 60 * 60 * 1000,
      'cada 8 horas': 8 * 60 * 60 * 1000,
      'cada 12 horas': 12 * 60 * 60 * 1000,
      'cada 24 horas': 24 * 60 * 60 * 1000,
      'cada 48 horas': 48 * 60 * 60 * 1000,
      'cada 72 horas': 72 * 60 * 60 * 1000
    };

    const freq = medicine.frecuencia?.toLowerCase();
    const interval = frequencyMap[freq] || 24 * 60 * 60 * 1000;

    const baseDate = new Date(medicine.horaFecha);
    const totalDoses = medicine.totalDoses || 1;

    const expanded: Medicine[] = [];
    for (let i = 0; i < totalDoses; i++) {
      const newMed = { ...medicine };
      newMed.horaFecha = new Date(baseDate.getTime() + i * interval).toISOString();
      expanded.push(newMed);
    }

    return expanded;
  }

  private isInThisWeek(date: Date, today: Date): boolean {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return date >= start && date <= end;
  }

  private isInThisMonth(date: Date, today: Date): boolean {
    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private groupMedicinesByPatient(medicines: Medicine[]): GroupedMedicine[] {
    const groups: { [key: string]: GroupedMedicine } = {};

    medicines.forEach(medicine => {
      const patientId = medicine.pacienteId || 'no-patient';
      const patientName = medicine.paciente?.nombre || 'Sin paciente asignado';

      if (!groups[patientId]) {
        groups[patientId] = {
          patientName,
          patientId: medicine.pacienteId || null,
          medicines: []
        };
      }

      groups[patientId].medicines.push(medicine);
    });

    return Object.values(groups);
  }

  openDeleteConfirmation(patientId: number | null, event: Event): void {
    event.stopPropagation();
    if (!patientId) return;
    this.selectedPatientId = patientId;
    this.showConfirmModal = true;
  }

  onConfirmDelete(): void {
    if (!this.selectedPatientId) return;

    this.medicinesService.getMedicines().subscribe({
      next: (medicines) => {
        const today = new Date();
        const patientMedicines = medicines.filter(medicine =>
          medicine.pacienteId === this.selectedPatientId &&
          this.isToday(medicine.horaFecha)
        );

        const deletePromises = patientMedicines.map(medicine =>
          medicine.id ? this.medicinesService.deleteMedicine(medicine.id).toPromise() : Promise.resolve()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.loadMedicines();
            this.toastService.show('Medicamentos eliminados exitosamente', 'success');
          })
          .catch(() => {
            this.toastService.show('Error al eliminar los medicamentos', 'error');
          })
          .finally(() => {
            this.showConfirmModal = false;
            this.selectedPatientId = null;
          });
      },
      error: () => {
        this.toastService.show('Error al cargar los medicamentos', 'error');
        this.showConfirmModal = false;
        this.selectedPatientId = null;
      }
    });
  }

  onCancelDelete(): void {
    this.showConfirmModal = false;
    this.selectedPatientId = null;
  }
}
