import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportFamilyService, SupportFamily } from '../../services/support-family.service';
import { PacienteService, Paciente } from '../../services/paciente.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support-family',
  templateUrl: './support-family.component.html',
  styleUrls: ['./support-family.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SupportFamilyComponent implements OnInit {
  activeCard: number = 0; // 0 for 'Apoyo Familiar', 1 for 'Vincular Familiar', 2 for 'Vinculado'
  phoneNumber: string = '';
  selectedPacienteId: number = 0;
  pacientes: Paciente[] = [];
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private supportFamilyService: SupportFamilyService,
    private pacienteService: PacienteService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPacientes();
  }

  private loadPacientes() {
    this.pacienteService.getPacientes().subscribe({
      next: (pacientes: Paciente[]) => {
        this.pacientes = pacientes;
      },
      error: (error: Error) => {
        console.error('Error al cargar pacientes:', error);
      }
    });
  }

  goToCard(index: number) {
    this.activeCard = index;
  }

  async save() {
    if (this.activeCard === 0) {
      this.goToCard(1);
    } else if (this.activeCard === 1) {
      if (!this.phoneNumber || this.selectedPacienteId === 0) {
        this.error = 'Por favor, complete todos los campos';
        return;
      }

      this.isLoading = true;
      this.error = '';

      try {
        // Primero, verificar si ya existe un familiar de apoyo para este paciente
        const existingSupportFamilies = await this.supportFamilyService.getSupportFamily(this.selectedPacienteId).toPromise();
        
        // Si se encuentra al menos un familiar de apoyo, mostrar error
        if (existingSupportFamilies && existingSupportFamilies.length > 0) {
          this.error = 'Ya existe un familiar de apoyo vinculado a este paciente.';
          this.isLoading = false;
          return;
        }

        // Si no existe, proceder con la creación
        await this.supportFamilyService.createSupportFamily(
          this.selectedPacienteId,
          this.phoneNumber
        ).toPromise();
        this.isLoading = false;
        this.goToCard(2);

        // Redirigir automáticamente después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/profile-patient', this.selectedPacienteId]);
        }, 2000); // 2 segundos

      } catch (error: any) {
        this.isLoading = false;
        // Manejar el error específico si el familiar de apoyo ya existe (código P2002 de Prisma)
        // aunque esto ya debería ser manejado por la verificación previa en el frontend.
        if (error.error?.code === 'P2002') {
          this.error = 'Ya existe un familiar de apoyo vinculado a este paciente.';
        } else {
          this.error = 'Error al vincular familiar de apoyo';
        }
        console.error('Error al vincular familiar de apoyo:', error);
      }
    }
  }
} 