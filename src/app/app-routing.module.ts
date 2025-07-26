import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { CaregiverComponent } from './components/caregiver/caregiver.component';
import { MedicineHistoryComponent } from './components/medicine-history/medicine-history.component';
import { AddMedicineComponent } from './components/add-medicine/add-medicine.component';
import { MedicineDetailComponent } from './components/medicine-detail/medicine-detail.component';
import { PatientList } from './components/patient-list/patient-list';
import { PacienteFormComponent } from './components/paciente-form/paciente-form.component';
import { SupportFamilyComponent } from './components/support-family/support-family.component';
import { ActivarDispensadorComponent } from './components/activar-dispensador/activar-dispensador.component';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'caregiver', component: CaregiverComponent, canActivate: [AuthGuard] },
  { path: 'medicine-history', component: MedicineHistoryComponent, canActivate: [AuthGuard] },
  { path: 'add-medicine', component: AddMedicineComponent, canActivate: [AuthGuard] },
  { path: 'medicine-details/:id', component: MedicineDetailComponent, canActivate: [AuthGuard] },
  { path: 'pacientes', component: PatientList, canActivate: [AuthGuard] },
  { path: 'pacientes/nuevo', component: PacienteFormComponent, canActivate: [AuthGuard] },
  { path: 'apoyo', component: SupportFamilyComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' },
  { path: 'activar-dispensador', component: ActivarDispensadorComponent, canActivate: [AuthGuard] }

]; 