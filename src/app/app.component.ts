import { Component, HostListener } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, CommonModule, RouterModule],
  template: `
    <div class="desktop-account-button" *ngIf="!isMobile && isCaregiverRoute">
      <button class="account-button" (click)="toggleAccountMenu()">
        <img src="assets/images/cuenta.jpg" alt="Account">
      </button>
      <div class="account-dropdown-menu" *ngIf="showAccountMenu">
        <div class="dropdown-option" (click)="navigateToPatientList(); $event.stopPropagation();">
          Ver perfiles de pacientes
        </div>
        <div class="dropdown-option logout" (click)="logout(); $event.stopPropagation();">
          Cerrar sesión
        </div>
      </div>
    </div>

    <router-outlet ngSkipHydration></router-outlet>
    <app-toast></app-toast>

    <footer class="navigation-footer" *ngIf="isMobile && !isAuthRoute">
      <div class="footer-item" *ngFor="let item of footerItems" (click)="navigateTo(item.route)">
        <img [src]="item.icon" [alt]="item.route">
        <div class="account-dropdown-menu" *ngIf="item.isAccount && showAccountMenu">
          <div class="dropdown-option" (click)="navigateToPatientList(); $event.stopPropagation();">
            Ver perfiles de pacientes
          </div>
          <div class="dropdown-option logout" (click)="logout(); $event.stopPropagation();">
            Cerrar sesión
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
      padding-bottom: 60px;
    }

    .desktop-account-button {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }

    .account-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .account-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .account-button img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .account-dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 8px 0;
      margin-top: 10px;
      min-width: 200px;
      z-index: 1001;
    }

    .dropdown-option {
      padding: 10px 15px;
      cursor: pointer;
      transition: background-color 0.2s;
      white-space: nowrap;
      text-align: left;
    }

    .dropdown-option:hover {
      background-color: #f5f5f5;
    }

    .dropdown-option.logout {
      color: #ff4444;
    }

    .navigation-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      display: flex;
      justify-content: space-around;
      padding: 10px 0;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    .footer-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      position: relative;
      padding: 5px;
      width: 60px;
    }

    .footer-item img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    .footer-item .account-dropdown-menu {
      bottom: 100%;
      top: auto;
      margin-top: 0;
      margin-bottom: 10px;
    }

    @media (min-width: 701px) {
      :host {
        padding-bottom: 0;
      }
    }
  `]
})
export class AppComponent {
  title = 'PastibotFronted';
  isMobile = window.innerWidth <= 700;
  isCaregiverRoute = false;
  isAuthRoute = false;

  footerItems = [
    { icon: 'assets/images/medicacion.jpg', route: '/medicines' },
    { icon: 'assets/images/home.jpg', route: '/caregiver' },
    { icon: 'assets/images/cuenta.jpg', route: '/cuenta', isAccount: true }
  ];

  showAccountMenu = false;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 700;
  }

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe(() => {
      this.isCaregiverRoute = this.router.url === '/caregiver';
      this.isAuthRoute = this.router.url === '/login' || this.router.url === '/register';
    });
  }

  toggleAccountMenu(): void {
    this.showAccountMenu = !this.showAccountMenu;
  }

  navigateTo(route: string): void {
    if (route === '/cuenta') {
      this.showAccountMenu = !this.showAccountMenu;
    } else {
      this.router.navigate([route]);
      this.showAccountMenu = false;
    }
  }

  navigateToPatientList(): void {
    this.showAccountMenu = false;
    this.router.navigate(['/patient-list']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showAccountMenu = false;
  }
} 