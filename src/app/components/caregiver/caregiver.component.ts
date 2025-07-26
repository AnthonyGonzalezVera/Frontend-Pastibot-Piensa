import { Component, OnDestroy, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PacienteService, Paciente } from '../../services/paciente.service';

@Component({
  selector: 'app-caregiver',
  templateUrl: './caregiver.component.html',
  styleUrls: ['./caregiver.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CaregiverComponent implements OnInit, OnDestroy {
  isMobile = false;
  activeCard = 0;
  private autoCarouselInterval: any;

  menuItems = [
    {
      title: 'Agenda',
      icon: 'assets/images/calendario.jpg',
      route: '/medicines'
    },
   {
  title: 'Activar dispensador',
  icon: 'assets/images/recordatorio.jpg',
  route: '/activar-dispensador'   // ✅ Ruta correcta
},

    {
      title: 'Historial de medicamento',
      icon: 'assets/images/historial.jpg',
      route: '/medicine-history'
    },
    {
      title: 'Asistente Chatbot',
      icon: 'assets/images/asistente.jpg',
      route: '/chatbot'
    }
  ];

  mainFunctions = [
    { title: 'Medicación', icon: 'assets/images/medicacion.jpg', route: '/medicines' },
    { title: 'Pacientes', icon: 'assets/images/pacientes.jpg', route: '/pacientes' }
  ];

  otherFunctions = [
    {
      title: 'Vincular cuidador',
      icon: 'assets/images/apoyo.jpg',
      route: '/support-family'
    },
    {
      title: '¿Que estoy tomando?',
      icon: 'assets/images/educativo.jpg',
      route: '/educativo'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private pacienteService: PacienteService
  ) {
    this.isMobile = window.innerWidth <= 700;
    window.addEventListener('resize', this.handleResize);
    this.setupAutoCarousel();
  }

  ngOnInit() {
    this.checkMobile();
  }

  handleResize = () => {
    this.isMobile = window.innerWidth <= 700;
    this.setupAutoCarousel();
  };

  setupAutoCarousel() {
    if (this.autoCarouselInterval) {
      clearInterval(this.autoCarouselInterval);
    }
    if (this.isMobile) {
      this.autoCarouselInterval = setInterval(() => {
        this.nextCard();
      }, 4000);
    }
  }

  resetAutoCarousel() {
    if (this.isMobile) {
      clearInterval(this.autoCarouselInterval);
      this.setupAutoCarousel();
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.autoCarouselInterval) {
      clearInterval(this.autoCarouselInterval);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  startMedication(): void {
    this.router.navigate(['/add-medicine']);
  }

  addPaciente(): void {
    this.router.navigate(['/pacientes/nuevo']);
  }

  prevCard(): void {
    this.activeCard = (this.activeCard - 1 + 2) % 2;
    this.resetAutoCarousel();
  }

  nextCard(): void {
    this.activeCard = (this.activeCard + 1) % 2;
    this.resetAutoCarousel();
  }

  @HostListener('swipeleft')
  onSwipeLeft(): void {
    if (this.isMobile) {
      this.nextCard();
    }
  }

  @HostListener('swiperight')
  onSwipeRight(): void {
    if (this.isMobile) {
      this.prevCard();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private checkMobile() {
    this.isMobile = window.innerWidth <= 700;
  }
} 