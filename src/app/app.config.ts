import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { PacienteService } from './services/paciente.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Comentamos la hidratación por ahora
    // provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    PacienteService
  ]
};
