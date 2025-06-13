import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PacientesService, Paciente } from '../../services/pacientes.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.css'
})
export class PatientList implements OnInit {
  patients: Paciente[] = [];

  constructor(
    private router: Router,
    private pacientesService: PacientesService
  ) { }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.pacientesService.getPacientes().subscribe({
      next: (data: Paciente[]) => {
        this.patients = data;
      },
      error: (error: any) => {
        console.error('Error loading patients:', error);
      }
    });
  }

  navigateToProfile(patientId: number | undefined): void {
    if (patientId) {
      this.router.navigate(['/profile-patient', patientId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/caregiver']);
  }
}
