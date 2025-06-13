import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', loadComponent: () => import('./components/welcome/welcome.component').then(m => m.WelcomeComponent) },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
  { 
    path: 'caregiver', 
    loadComponent: () => import('./components/caregiver/caregiver.component').then(m => m.CaregiverComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'support-family',
    loadComponent: () => import('./components/support-family/support-family.component').then(m => m.SupportFamilyComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'support-family/:id',
    loadComponent: () => import('./components/support-family/support-family.component').then(m => m.SupportFamilyComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'pacientes/nuevo',
    loadComponent: () => import('./components/paciente-form/paciente-form.component').then(m => m.PacienteFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-medicine',
    loadComponent: () => import('./components/add-medicine/add-medicine.component').then(m => m.AddMedicineComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'medicines',
    loadComponent: () => import('./components/medicines-list/medicines-list.component').then(m => m.MedicinesListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'medicines/:id',
    loadComponent: () => import('./components/medicine-detail/medicine-detail.component').then(m => m.MedicineDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'medicine-history',
    loadComponent: () => import('./components/medicine-history/medicine-history.component').then(m => m.MedicineHistoryComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./components/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile-patient/:id',
    loadComponent: () => import('./components/profile-patient/profile-patient').then(m => m.ProfilePatient),
    canActivate: [AuthGuard]
  },
  {
    path: 'patient-list',
    loadComponent: () => import('./components/patient-list/patient-list').then(m => m.PatientList),
    canActivate: [AuthGuard]
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
