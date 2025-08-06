import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'support-family/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'medicines/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'profile-patient/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender // Las demás rutas se prerenderizan
  }
];
