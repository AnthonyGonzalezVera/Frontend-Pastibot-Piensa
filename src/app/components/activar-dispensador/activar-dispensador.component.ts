import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HardwareService } from '../../services/hardware.service';

@Component({
  selector: 'app-activar-dispensador',
  standalone: true,
  templateUrl: './activar-dispensador.component.html',
  styleUrls: ['./activar-dispensador.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ActivarDispensadorComponent implements OnInit {
  medicamentos: any[] = [];
  med: number = 1;
  cant: number = 1;
  dispensador: number = 1;

  // 🟢 Toast
  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' = 'exito';
  mostrandoMensaje = false;

  constructor(private hardwareService: HardwareService) {}

  ngOnInit(): void {
    this.obtenerMedicamentosDesdeBackend();
  }

  obtenerMedicamentosDesdeBackend(): void {
    this.hardwareService.getMedicamentosDesdeBackend().subscribe({
      next: (data: any[]) => {
        const unicos = data.filter(
          (med, index, self) =>
            index === self.findIndex((m) => m.nombre === med.nombre)
        );
        this.medicamentos = unicos;
        if (this.medicamentos.length > 0) {
          this.med = this.medicamentos[0].id;
        }
      },
      error: (error: any) => {
        console.error('Error al obtener medicamentos desde el backend', error);
      }
    });
  }

  activarDispensador(): void {
    const seleccionado = this.medicamentos.find(m => m.id === this.med);
    const nombre = seleccionado ? seleccionado.nombre : '';

    const body = {
      nombre,
      dispensador: this.dispensador,
      cantidad: this.cant
    };

    this.hardwareService.programarMedicamentoDirecto(body).subscribe({
      next: () => {
        this.mostrarToast('✅ Medicamento programado correctamente.', 'exito');
      },
      error: () => {
        this.mostrarToast('⚠️ No se pudo comunicar con el dispensador.', 'error');
      }
    });
  }

  mostrarToast(mensaje: string, tipo: 'exito' | 'error') {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    this.mostrandoMensaje = true;

    setTimeout(() => {
      this.mostrandoMensaje = false;
    }, 3000);
  }
}
