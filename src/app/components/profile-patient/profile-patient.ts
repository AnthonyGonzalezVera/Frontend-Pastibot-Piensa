import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PacientesService, Paciente } from '../../services/pacientes.service';
import { AuthService } from '../../services/auth.service';
import { MedicinesService, Medicine } from '../../services/medicines.service';
import { SupportFamilyService, SupportFamily } from '../../services/support-family.service';

@Component({
  selector: 'app-profile-patient',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-patient.html',
  styleUrl: './profile-patient.css'
})
export class ProfilePatient implements OnInit {
  patient: Paciente | null = null;
  patientName: string = 'Cargando...';
  patientStatus: string = '';
  
  compliancePercentage: number = 0;
  dosesRemaining: number = 0;
  chatBotUsagePercentage: number = 0;

  medicamentosProgress: number = 0;
  rachaDiaProgress: number = 0;
  horariosProgress: number = 0;

  supportFamilies: SupportFamily[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pacientesService: PacientesService,
    private authService: AuthService,
    private medicinesService: MedicinesService,
    private supportFamilyService: SupportFamilyService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const patientIdParam = params.get('id');
      if (patientIdParam) {
        const patientId = +patientIdParam;
        this.loadPatientDetails(patientId);
        this.loadSupportFamilies(patientId);
      } else {
        this.patientName = 'ID de paciente no proporcionado';
        this.patientStatus = 'Por favor, selecciona un paciente de la lista.';
        this.router.navigate(['/patient-list']);
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/patient-list']);
  }

  loadPatientDetails(patientId: number): void {
    this.pacientesService.getPaciente(patientId).subscribe({
      next: (patient: Paciente) => {
        this.patient = patient;
        this.patientName = this.patient.nombre;
        this.patientStatus = `Edad: ${this.patient.edad} años, Sexo: ${this.patient.sexo}, Enfermedades: ${this.patient.enfermedades}`;

        this.medicinesService.getMedicines().subscribe({
          next: (allMedicines: Medicine[]) => {
            const patientMedicines = allMedicines.filter(med => med.pacienteId === this.patient?.id);
            this.calculateMetrics(patientMedicines);
          },
          error: (err: any) => {
            console.error('Error loading medicines for patient:', err);
            this.patientStatus = 'Error al cargar medicamentos.';
          }
        });
      },
      error: (err: any) => {
        console.error('Error loading patient data:', err);
        this.patientName = 'Paciente no encontrado';
        this.patientStatus = 'Verifica el ID del paciente.';
      }
    });
  }

  private loadSupportFamilies(patientId: number): void {
    this.supportFamilyService.getSupportFamily(patientId).subscribe({
      next: (supportFamilies: SupportFamily[]) => {
        this.supportFamilies = supportFamilies;
      },
      error: (err: any) => {
        console.error('Error loading support families:', err);
        this.supportFamilies = [];
      }
    });
  }

  private calculateMetrics(medicines: Medicine[]): void {
    if (medicines.length === 0) {
      this.resetMetrics();
      return;
    }

    let totalDosesProgrammed = 0;
    let totalDosesTaken = 0;
    let chatbotCreatedMedicines = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let onTimeDoses = 0;
    let totalDoses = 0;

    // Ordenar medicamentos por fecha
    const sortedMedicines = [...medicines].sort((a, b) => 
      new Date(a.horaFecha).getTime() - new Date(b.horaFecha).getTime()
    );

    console.log('Medicines for calculation:', medicines);
    console.log('Sorted Medicines for calculation:', sortedMedicines);

    // Calcular métricas básicas y racha
    sortedMedicines.forEach(med => {
      console.log('Processing medicine:', med.nombre, 'totalDoses:', med.totalDoses, 'dosesTaken:', med.dosesTaken);
      if (med.totalDoses) {
        totalDosesProgrammed += med.totalDoses;
      }
      if (med.dosesTaken) {
        totalDosesTaken += med.dosesTaken;
      }

      if (med.createdBy === 'chatbot') {
        chatbotCreatedMedicines++;
      }

      // Calcular racha
      if (med.taken) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }

      // Calcular horarios
      if (med.horaFecha) {
        totalDoses++;
        const scheduledTime = new Date(med.horaFecha);
        const takenTime = med.taken ? new Date(med.createdAt || '') : null;
        
        if (takenTime) {
          const timeDiff = Math.abs(takenTime.getTime() - scheduledTime.getTime());
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          // Considerar "a tiempo" si se tomó dentro de 1 hora antes o después
          if (hoursDiff <= 1) {
            onTimeDoses++;
          }
        }
      }
    });

    console.log('Total Doses Programmed:', totalDosesProgrammed);
    console.log('Total Doses Taken:', totalDosesTaken);

    // Calcular porcentajes
    this.compliancePercentage = totalDosesProgrammed > 0 
      ? Math.round((totalDosesTaken / totalDosesProgrammed) * 100)
      : 0;
    
    this.medicamentosProgress = this.compliancePercentage;

    this.dosesRemaining = totalDosesProgrammed - totalDosesTaken;
    if (this.dosesRemaining < 0) this.dosesRemaining = 0;

    this.chatBotUsagePercentage = medicines.length > 0 
      ? Math.round((chatbotCreatedMedicines / medicines.length) * 100)
      : 0;

    // Calcular racha de día (porcentaje basado en la racha máxima)
    const maxPossibleStreak = 7; // Asumimos una semana como máximo
    this.rachaDiaProgress = Math.round((maxStreak / maxPossibleStreak) * 100);

    // Calcular horarios (porcentaje de dosis tomadas a tiempo)
    this.horariosProgress = totalDoses > 0 
      ? Math.round((onTimeDoses / totalDoses) * 100)
      : 0;
  }

  private resetMetrics(): void {
    this.compliancePercentage = 0;
    this.dosesRemaining = 0;
    this.chatBotUsagePercentage = 0;
    this.medicamentosProgress = 0;
    this.rachaDiaProgress = 0;
    this.horariosProgress = 0;
  }
}
