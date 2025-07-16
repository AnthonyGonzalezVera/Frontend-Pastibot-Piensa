import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PacientesService, Paciente } from '../../services/pacientes.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './paciente-form.component.html',
  styleUrls: ['./paciente-form.component.scss']
})
export class PacienteFormComponent {
  pacienteForm: FormGroup;
  toastMessage = '';
  isSaving = false;

  sexos = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Otro', label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private pacientesService: PacientesService,
    private router: Router
  ) {
    this.pacienteForm = this.fb.group({
      nombre: ['', Validators.required],
      sexo: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0)]],
      enfermedades: ['', Validators.required],
   
    });
  }

  onSubmit() {
    if (this.pacienteForm.invalid) return;

    this.isSaving = true;
    this.toastMessage = '';

    const paciente: Paciente = this.pacienteForm.value;
    const startTime = Date.now();
    const minProgressDisplayTime = 2000;

    this.pacientesService.crearPaciente(paciente).subscribe({
      next: () => {
        const actualProcessingTime = Date.now() - startTime;
        const delayBeforeFinalMessage = Math.max(0, minProgressDisplayTime - actualProcessingTime);

        setTimeout(() => {
          this.toastMessage = 'Guardado exitosamente!';

          setTimeout(() => {
            this.isSaving = false;
            this.router.navigate(['/caregiver']);
          }, 2000);
        }, delayBeforeFinalMessage);
      },
      error: () => {
        const actualProcessingTime = Date.now() - startTime;
        const delayBeforeFinalMessage = Math.max(0, minProgressDisplayTime - actualProcessingTime);

        setTimeout(() => {
          this.toastMessage = 'Error al guardar paciente';

          setTimeout(() => {
            this.isSaving = false;
          }, 2500);
        }, delayBeforeFinalMessage);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/caregiver']);
  }
} 