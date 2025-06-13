import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicinesService, Medicine } from '../../services/medicines.service';
import { PacientesService, Paciente } from '../../services/pacientes.service';

@Component({
  selector: 'app-add-medicine',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-medicine.component.html',
  styleUrls: ['./add-medicine.component.scss']
})
export class AddMedicineComponent implements OnInit {
  medicineForm: FormGroup;
  toastMessage = '';
  isSaving = false;
  pacientes: Paciente[] = [];
  useDuration = true; // true para usar duración, false para usar dosis totales

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private medicinesService: MedicinesService,
    private pacientesService: PacientesService
  ) {
    this.medicineForm = this.fb.group({
      nombre: ['', Validators.required],
      dosis: ['', Validators.required],
      frecuencia: ['', Validators.required],
      horaFecha: ['', Validators.required],
      durationInDays: [null],
      totalDoses: [null],
      pacienteId: [null, Validators.required]
    });

    // Suscribirse a cambios en la frecuencia para recalcular
    this.medicineForm.get('frecuencia')?.valueChanges.subscribe(() => {
      this.recalculateValues();
    });

    // Suscribirse a cambios en durationInDays
    this.medicineForm.get('durationInDays')?.valueChanges.subscribe(() => {
      if (this.useDuration) {
        this.recalculateValues();
      }
    });

    // Suscribirse a cambios en totalDoses
    this.medicineForm.get('totalDoses')?.valueChanges.subscribe(() => {
      if (!this.useDuration) {
        this.recalculateValues();
      }
    });
  }

  ngOnInit(): void {
    this.loadPacientes();
  }

  loadPacientes(): void {
    this.pacientesService.getPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
        console.log('Pacientes loaded:', this.pacientes);
      },
      error: (err) => {
        console.error('Error loading pacientes:', err);
        // Handle error, e.g., show a message to the user
      }
    });
  }

  toggleInputType() {
    this.useDuration = !this.useDuration;
    this.recalculateValues();
  }

  recalculateValues() {
    const frecuencia = this.medicineForm.get('frecuencia')?.value;
    if (!frecuencia) return;

    const frequencyMap: { [key: string]: number } = {
      'cada 4 horas': 6,    // 6 veces al día
      'cada 6 horas': 4,    // 4 veces al día
      'cada 8 horas': 3,    // 3 veces al día
      'cada 12 horas': 2,   // 2 veces al día
      'cada 24 horas': 1,   // 1 vez al día
      'cada 48 horas': 0.5, // 1 vez cada 2 días
      'cada 72 horas': 0.33 // 1 vez cada 3 días
    };

    const dosesPerDay = frequencyMap[frecuencia.toLowerCase()] || 1;

    if (this.useDuration) {
      const duration = this.medicineForm.get('durationInDays')?.value;
      if (duration) {
        const totalDoses = Math.ceil(duration * dosesPerDay);
        this.medicineForm.patchValue({ totalDoses }, { emitEvent: false });
      }
    } else {
      const totalDoses = this.medicineForm.get('totalDoses')?.value;
      if (totalDoses) {
        const duration = Math.ceil(totalDoses / dosesPerDay);
        this.medicineForm.patchValue({ durationInDays: duration }, { emitEvent: false });
      }
    }
  }

  onSubmit() {
    if (this.medicineForm.valid) {
      this.isSaving = true;
      this.toastMessage = '';

      const { nombre, dosis, frecuencia, horaFecha, durationInDays, totalDoses, pacienteId } = this.medicineForm.value;

      const medicine: Medicine = {
        nombre,
        dosis,
        frecuencia,
        horaFecha,
        durationInDays: durationInDays ? Number(durationInDays) : undefined,
        totalDoses: totalDoses ? Number(totalDoses) : undefined,
        pacienteId: Number(pacienteId),
        createdBy: 'manual'
      };

      const startTime = Date.now();
      const minProgressDisplayTime = 2000;

      this.medicinesService.createMedicine(medicine).subscribe({
        next: () => {
          const actualProcessingTime = Date.now() - startTime;
          const delayBeforeFinalMessage = Math.max(0, minProgressDisplayTime - actualProcessingTime);

          setTimeout(() => {
            this.toastMessage = 'Medicamento guardado exitosamente!';

            setTimeout(() => {
              this.isSaving = false;
              this.router.navigate(['/caregiver']);
            }, 2000);
          }, delayBeforeFinalMessage);
        },
        error: (error) => {
          console.error('Error al guardar medicamento:', error);
          const actualProcessingTime = Date.now() - startTime;
          const delayBeforeFinalMessage = Math.max(0, minProgressDisplayTime - actualProcessingTime);

          setTimeout(() => {
            this.toastMessage = 'Error al guardar medicamento';

            setTimeout(() => {
              this.isSaving = false;
            }, 2500);
          }, delayBeforeFinalMessage);
        }
      });
    } else {
      this.medicineForm.markAllAsTouched();
    }
  }

  navigateBack() {
    this.router.navigate(['/caregiver']);
  }
} 