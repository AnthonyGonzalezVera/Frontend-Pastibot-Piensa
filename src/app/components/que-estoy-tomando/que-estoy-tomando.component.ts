import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-que-estoy-tomando',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './que-estoy-tomando.html',
  styleUrls: ['./que-estoy-tomando.css']
})
export class QueEstoyTomandoComponent implements OnInit {
  medicamentos: any[] = [];

  ngOnInit() {
    this.medicamentos = [
      {
        nombre: 'Paracetamol',
        descripcion: 'Alivia el dolor y la fiebre.',
        imagen: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png'
      },
      {
        nombre: 'Ibuprofeno',
        descripcion: 'Reduce inflamación, fiebre y dolor.',
        imagen: 'https://cdn-icons-png.flaticon.com/512/3361/3361951.png'
      },
      {
        nombre: 'Amoxicilina',
        descripcion: 'Antibiótico para infecciones bacterianas.',
        imagen: 'https://cdn-icons-png.flaticon.com/512/4576/4576925.png'
      }
    ];
  }
}
