import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MedicinesService, Medicine } from '../../services/medicines.service';
import { PacientesService, Paciente } from '../../services/pacientes.service';
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
  activeTab: 'daily' | 'weekly' | 'monthly' = 'daily';
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

  isToday(dateString: string): boolean {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  }

  isDailyFrequency(frecuencia: string): boolean {
    const dailyFrequencies = [
      'cada 4 horas',
      'cada 6 horas',
      'cada 8 horas',
      'cada 12 horas',
      'cada 24 horas'
    ];
    return dailyFrequencies.includes(frecuencia.toLowerCase());
  }

  setActiveTab(tab: 'daily' | 'weekly' | 'monthly'): void {
    this.activeTab = tab;
    this.loadMedicines();
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
        const today = new Date();
        const filteredMedicines = medicines.filter(medicine => {
          const medicineDate = new Date(medicine.horaFecha);
          switch (this.activeTab) {
            case 'daily':
              return medicineDate.toDateString() === today.toDateString();
            case 'weekly':
              const weekStart = new Date(today);
              weekStart.setDate(today.getDate() - today.getDay());
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              return medicineDate >= weekStart && medicineDate <= weekEnd;
            case 'monthly':
              return medicineDate.getMonth() === today.getMonth() && 
                     medicineDate.getFullYear() === today.getFullYear();
            default:
              return false;
          }
        });
        this.groupedMedicines = this.groupMedicinesByPatient(filteredMedicines);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading medicines:', error);
        this.isLoading = false;
        this.toastService.show('Error al cargar los medicamentos', 'error');
      }
    });
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
          new Date(medicine.horaFecha).toDateString() === today.toDateString()
        );

        const deletePromises = patientMedicines.map(medicine => 
          medicine.id ? this.medicinesService.deleteMedicine(medicine.id).toPromise() : Promise.resolve()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.loadMedicines();
            this.toastService.show('Medicamentos eliminados exitosamente', 'success');
          })
          .catch(error => {
            console.error('Error deleting medicines:', error);
            this.toastService.show('Error al eliminar los medicamentos', 'error');
          })
          .finally(() => {
            this.showConfirmModal = false;
            this.selectedPatientId = null;
          });
      },
      error: (error) => {
        console.error('Error loading medicines for deletion:', error);
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
} 