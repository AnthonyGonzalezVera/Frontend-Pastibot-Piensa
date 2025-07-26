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

  constructor(private hardwareService: HardwareService) {}

  ngOnInit(): void {
    this.obtenerMedicamentosDesdeBackend();
  }

  obtenerMedicamentosDesdeBackend(): void {
    this.hardwareService.getMedicamentosDesdeBackend().subscribe({
      next: (data: any[]) => {
        // ✅ Resetear antes de cargar para evitar acumulación
        this.medicamentos = [];

        // ✅ Eliminar duplicados por ID
        const unicos = data.filter(
          (med, index, self) =>
            index === self.findIndex((m) => m.id === med.id)
        );

        this.medicamentos = unicos;

        // ✅ Seleccionar el primero si existe
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
    this.hardwareService.activarDispensador().subscribe({
      next: () => {
        alert('✅ Dispensador listo. Toca el sensor físico.');
      },
      error: () => {
        alert('⚠️ No se pudo activar el dispensador.');
      }
    });
  }

  programar(): void {
    this.hardwareService.programarMedicamento(this.med, this.cant).subscribe({
      next: () => {
        alert('✅ Medicamento programado correctamente.');
      },
      error: () => {
        alert('⚠️ No se pudo programar el medicamento.');
      }
    });
  }
}
