import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicinesService, Medicine } from '../../services/medicines.service';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-medicine-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, ConfirmModalComponent],
  templateUrl: './medicine-detail.component.html',
  styleUrls: ['./medicine-detail.component.scss']
})
export class MedicineDetailComponent implements OnInit {
  medicines: Medicine[] = [];
  isLoading = true;
  errorMessage = '';
  takenStatus: { [id: number]: boolean } = {};
  showConfirmModal = false;
  selectedMedicineId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private medicinesService: MedicinesService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.loadMedicinesForPatient(+patientId);
    }
  }

  loadMedicinesForPatient(patientId: number): void {
    this.isLoading = true;
    this.medicinesService.getMedicines().subscribe({
      next: (allMedicines) => {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        this.medicines = allMedicines.filter(med => 
          med.pacienteId === patientId && med.horaFecha.startsWith(todayString)
        );

        this.medicines.forEach(med => {
          if (med.id) {
            this.takenStatus[med.id] = med.taken || false;
          }
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading medicines for patient:', err);
        this.errorMessage = 'Error al cargar los medicamentos del paciente.';
        this.isLoading = false;
        this.toastService.show('Error al cargar los medicamentos', 'error');
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/medicines']);
  }

  onCheckboxChange(medicineId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.takenStatus[medicineId] = isChecked;

    const medicineToUpdate = this.medicines.find(med => med.id === medicineId);
    if (medicineToUpdate) {
      const updatedDosesTaken = isChecked ? (medicineToUpdate.dosesTaken || 0) + 1 : (medicineToUpdate.dosesTaken || 0) - 1;
      this.medicinesService.updateMedicine(medicineId, { taken: isChecked, dosesTaken: updatedDosesTaken }).subscribe({
        next: () => {
          if (medicineToUpdate) {
            medicineToUpdate.taken = isChecked;
            medicineToUpdate.dosesTaken = updatedDosesTaken;
          }
          this.toastService.show('Estado del medicamento actualizado', 'success');
        },
        error: (err) => {
          console.error(`Error updating medicine ID ${medicineId}:`, err);
          this.takenStatus[medicineId] = !isChecked;
          this.toastService.show('Error al actualizar el estado del medicamento', 'error');
        }
      });
    }
  }

  openDeleteConfirmation(medicineId: number): void {
    this.selectedMedicineId = medicineId;
    this.showConfirmModal = true;
  }

  onConfirmDelete(): void {
    if (!this.selectedMedicineId) return;

    this.medicinesService.deleteMedicine(this.selectedMedicineId).subscribe({
      next: () => {
        this.medicines = this.medicines.filter(med => med.id !== this.selectedMedicineId);
        this.toastService.show('Medicamento eliminado exitosamente', 'success');
      },
      error: (err) => {
        console.error('Error deleting medicine:', err);
        this.toastService.show('Error al eliminar el medicamento', 'error');
      },
      complete: () => {
        this.showConfirmModal = false;
        this.selectedMedicineId = null;
      }
    });
  }

  onCancelDelete(): void {
    this.showConfirmModal = false;
    this.selectedMedicineId = null;
  }
} 