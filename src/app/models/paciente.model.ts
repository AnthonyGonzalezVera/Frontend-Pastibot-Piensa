export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  genero: string;

  email: string;
  direccion: string;
  createdAt: Date;
  updatedAt: Date;
} 