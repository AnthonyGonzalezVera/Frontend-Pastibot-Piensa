import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedicinesService, Medicine } from '../../services/medicines.service';
import { PacientesService, Paciente } from '../../services/pacientes.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

interface MedicationData {
  nombre?: string;
  dosis?: string;
  frecuencia?: string;
  horaFecha?: string;
  durationInDays?: number;
  totalDoses?: number;
  pacienteId?: number;
}

interface PacienteData {
  nombre?: string;
  sexo?: string;
  edad?: number;
  enfermedades?: string;
  telefonoCuidador?: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container">
      <div class="header">
        <button class="back-button" (click)="navigateBack()">
          <img src="assets/images/arrow.svg" alt="Back">
        </button>
        <img src="assets/images/welcome-image.svg" alt="Bot" class="header-bot-image">
        <span class="header-title">Pastibot AI</span>
        <span class="header-subtitle">con ChatGPT4</span>
      </div>

      <div class="chat-messages">
        <div *ngFor="let message of messages" class="message-bubble" [class.user]="message.sender === 'user'" [class.bot]="message.sender === 'bot'">
          <span>{{ message.text }}</span>
          <span class="message-time">{{ message.time }}</span>
        </div>
      </div>

      <div class="chat-input-area">
        <input type="text" [(ngModel)]="userMessage" placeholder="Escribe un mensaje..." (keyup.enter)="sendMessage()">
        <button (click)="sendMessage()">Enviar</button>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f0f2f5;
    }

    .header {
      display: flex;
      align-items: center;
      padding: 15px;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 10;
    }

    .back-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-right: 15px;
    }

    .back-button img {
      width: 24px;
      height: 24px;
    }

    .header-bot-image {
      width: 40px;
      height: 40px;
      margin-right: 10px;
    }

    .header-title {
      font-size: 1.2rem;
      font-weight: bold;
      color: #333;
      flex-grow: 1;
    }

    .header-subtitle {
      font-size: 0.8rem;
      color: #777;
    }

    .chat-messages {
      flex-grow: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .message-bubble {
      max-width: 70%;
      padding: 10px 15px;
      border-radius: 20px;
      font-size: 0.95rem;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .message-bubble.user {
      background-color: #31A8FF;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 5px;
    }

    .message-bubble.bot {
      background-color: #e0e0e0;
      color: #333;
      align-self: flex-start;
      border-bottom-left-radius: 5px;
    }

    .message-time {
      font-size: 0.7rem;
      margin-top: 5px;
      align-self: flex-end;
      color: rgba(255, 255, 255, 0.8);
    }

    .message-bubble.bot .message-time {
      color: rgba(0, 0, 0, 0.5);
    }

    .chat-input-area {
      display: flex;
      padding: 15px;
      background-color: #fff;
      border-top: 1px solid #eee;
    }

    .chat-input-area input {
      flex-grow: 1;
      padding: 10px 15px;
      border: 1px solid #ccc;
      border-radius: 25px;
      margin-right: 10px;
      font-size: 1rem;
      outline: none;
    }

    .chat-input-area button {
      background-color: #31A8FF;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s ease;
    }

    .chat-input-area button:hover {
      background-color: #2188d9;
    }
  `]
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = [];
  userMessage: string = '';
  isCreatingMedication: boolean = false;
  isCreatingPaciente = false;
  currentStep = 0;
  currentMedicationStep: number = 0;
  medicationData: any = {};
  pacienteData: PacienteData = {};
  pacientes: Paciente[] = [];
  isSelfRegistration = false;

  // Opciones para selección numérica
  private readonly opcionesSexo = [
    { numero: 1, valor: 'Masculino' },
    { numero: 2, valor: 'Femenino' },
    { numero: 3, valor: 'Otro' }
  ];

  private readonly opcionesInicio = [
    { numero: 1, texto: 'Quiero registrar un nuevo paciente' },
    { numero: 2, texto: 'Soy el paciente y quiero registrarme' },
    { numero: 3, texto: 'Quiero crear un medicamento' }
  ];

  constructor(
    private router: Router,
    private medicinesService: MedicinesService,
    private pacientesService: PacientesService
  ) { }

  ngOnInit(): void {
    this.addBotMessage('¡Hola! Soy Pastibot, tu asistente virtual. ¿En qué puedo ayudarte hoy?');
    this.addBotMessage('Puedes:');
    this.addBotMessage('1. Registrar un paciente (puedes decir "nuevo paciente", "registrar persona", etc.)');
    this.addBotMessage('2. Registrarte como paciente (puedes decir "soy yo", "me registro", "yo soy el paciente", etc.)');
    this.addBotMessage('3. Crear un medicamento (puedes decir "nuevo medicamento", "agregar pastilla", etc.)');
    this.loadPacientes();
  }

  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[áäàâã]/g, 'a')
      .replace(/[éëèê]/g, 'e')
      .replace(/[íïìî]/g, 'i')
      .replace(/[óöòôõ]/g, 'o')
      .replace(/[úüùû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  private isNumericInput(input: string): boolean {
    return /^\d+$/.test(input.trim());
  }

  handleGeneralMessage(message: string): void {
    const normalizedMessage = this.normalizeText(message);
    
    // Si estamos en proceso de crear un medicamento, continuar con ese flujo
    if (this.isCreatingMedication) {
      this.handleMedicationCreation(message);
      return;
    }

    // Verificar si es una selección numérica
    if (this.isNumericInput(message)) {
      const numero = parseInt(message);
      if (numero >= 1 && numero <= 3) {
        const opcion = this.opcionesInicio[numero - 1];
        if (opcion.numero === 1) {
          this.startPacienteCreation(false);
        } else if (opcion.numero === 2) {
          this.startPacienteCreation(true);
        } else {
          this.handleMedicationCreation('');
        }
        return;
      }
    }

    // Verificar texto completo con más variaciones
    const palabrasPaciente = ['paciente', 'persona', 'usuario', 'gente', 'personas'];
    const palabrasRegistrar = ['registrar', 'crear', 'agregar', 'añadir', 'nuevo', 'nueva'];
    const palabrasMedicamento = ['medicamento', 'medicina', 'medicinas', 'medicamentos', 'pastilla', 'pastillas', 'remedio', 'remedios'];
    const palabrasYo = ['yo', 'me', 'mi', 'soy', 'mismo', 'misma', 'propio', 'propia', 'yo mismo', 'yo misma'];

    // Verificar si es auto-registro (prioridad alta)
    const esAutoRegistro = palabrasYo.some(y => normalizedMessage.includes(y)) || 
                          normalizedMessage === 'soy yo' ||
                          normalizedMessage === 'yo soy' ||
                          normalizedMessage === 'me registro' ||
                          normalizedMessage === 'registrarme';

    if (esAutoRegistro) {
      this.startPacienteCreation(true);
      return;
    }

    // Verificar si es registro de paciente
    const esRegistroPaciente = palabrasPaciente.some(p => normalizedMessage.includes(p)) && 
                              palabrasRegistrar.some(r => normalizedMessage.includes(r));
    
    // Verificar si es creación de medicamento
    const esCreacionMedicamento = palabrasMedicamento.some(m => normalizedMessage.includes(m)) && 
                                 palabrasRegistrar.some(r => normalizedMessage.includes(r));

    if (esRegistroPaciente) {
      this.startPacienteCreation(false);
    } else if (esCreacionMedicamento) {
      this.handleMedicationCreation('');
    } else {
      setTimeout(() => {
        this.addBotMessage('Entiendo que quieres interactuar conmigo. Puedes:');
        this.addBotMessage('1. Registrar un paciente (puedes decir "nuevo paciente", "registrar persona", etc.)');
        this.addBotMessage('2. Registrarte como paciente (puedes decir "soy yo", "me registro", "yo soy el paciente", etc.)');
        this.addBotMessage('3. Crear un medicamento (puedes decir "nuevo medicamento", "agregar pastilla", etc.)');
        this.addBotMessage('¿Qué te gustaría hacer?');
      }, 1000);
    }
  }

  startPacienteCreation(isSelf: boolean): void {
    this.isCreatingPaciente = true;
    this.isSelfRegistration = isSelf;
    this.currentStep = 0;
    this.pacienteData = {};
    
    if (isSelf) {
      this.addBotMessage('Perfecto, vamos a registrarte como paciente. ¿Cuál es tu nombre completo?');
    } else {
      this.addBotMessage('Perfecto, vamos a registrar un nuevo paciente. ¿Cuál es el nombre completo del paciente?');
    }
  }

  handlePacienteCreation(message: string): void {
    const normalizedMessage = this.normalizeText(message);

    switch (this.currentStep) {
      case 0: // Nombre
        if (message.trim().length < 3) {
          this.addBotMessage('Por favor, ingresa un nombre válido (mínimo 3 caracteres)');
          return;
        }
        this.pacienteData.nombre = message.trim();
        this.addBotMessage('¿Cuál es la edad?');
        this.currentStep++;
        break;

      case 1: // Edad
        if (this.isNumericInput(message)) {
          const edad = parseInt(message);
          if (edad > 0 && edad < 120) {
            this.pacienteData.edad = edad;
            this.addBotMessage('¿Cuál es el sexo? Puedes escribir el número o el texto:');
            this.opcionesSexo.forEach(opcion => {
              this.addBotMessage(`${opcion.numero}. ${opcion.valor}`);
            });
            this.currentStep++;
          } else {
            this.addBotMessage('Por favor, ingresa una edad válida (entre 1 y 120 años)');
          }
        } else {
          this.addBotMessage('Por favor, ingresa solo números para la edad');
        }
        break;

      case 2: // Sexo
        if (this.isNumericInput(message)) {
          const numero = parseInt(message);
          if (numero >= 1 && numero <= 3) {
            this.pacienteData.sexo = this.opcionesSexo[numero - 1].valor;
            this.addBotMessage('¿Cuáles son las enfermedades o condiciones? (Si no tienes ninguna, escribe "ninguna")');
            this.currentStep++;
          } else {
            this.addBotMessage('Por favor, selecciona una opción válida (1, 2 o 3)');
          }
        } else {
          const sexoNormalizado = this.normalizeText(message);
          if (['masculino', 'femenino', 'otro'].includes(sexoNormalizado)) {
            this.pacienteData.sexo = message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();
            this.addBotMessage('¿Cuáles son las enfermedades o condiciones? (Si no tienes ninguna, escribe "ninguna")');
            this.currentStep++;
          } else {
            this.addBotMessage('Por favor, selecciona una opción válida o escribe el sexo correctamente');
          }
        }
        break;

      case 3: // Enfermedades
        if (normalizedMessage === 'ninguna' || normalizedMessage === 'no tengo' || normalizedMessage === 'no padezco') {
          this.pacienteData.enfermedades = 'Ninguna';
        } else {
          this.pacienteData.enfermedades = message.trim();
        }
        this.addBotMessage('¿Cuál es el número de teléfono del cuidador? (Si eres el paciente, escribe tu número)');
        this.currentStep++;
        break;

      case 4: // Teléfono del cuidador
        const telefono = message.replace(/\D/g, '');
        if (telefono.length >= 7 && telefono.length <= 15) {
          this.pacienteData.telefonoCuidador = telefono;
          this.addBotMessage('¿Quieres revisar los datos antes de guardar? (Escribe "sí" para revisar o "no" para guardar directamente)');
          this.currentStep++;
        } else {
          this.addBotMessage('Por favor, ingresa un número de teléfono válido (entre 7 y 15 dígitos)');
        }
        break;

      case 5: // Confirmación
        if (normalizedMessage === 'si' || normalizedMessage === 'sí' || normalizedMessage === 'revisar') {
          this.addBotMessage('Estos son los datos que vamos a guardar:');
          this.addBotMessage(`Nombre: ${this.pacienteData.nombre}`);
          this.addBotMessage(`Edad: ${this.pacienteData.edad}`);
          this.addBotMessage(`Sexo: ${this.pacienteData.sexo}`);
          this.addBotMessage(`Enfermedades: ${this.pacienteData.enfermedades}`);
          this.addBotMessage(`Teléfono: ${this.pacienteData.telefonoCuidador}`);
          this.addBotMessage('¿Los datos son correctos? (Escribe "sí" para guardar o "no" para empezar de nuevo)');
          this.currentStep++;
        } else {
          this.createPaciente();
        }
        break;

      case 6: // Confirmación final
        if (normalizedMessage === 'si' || normalizedMessage === 'sí') {
          this.createPaciente();
        } else {
          this.addBotMessage('De acuerdo, vamos a empezar de nuevo.');
          this.startPacienteCreation(this.isSelfRegistration);
        }
        break;
    }
  }

  createPaciente(): void {
    if (!this.pacienteData.nombre || !this.pacienteData.edad || !this.pacienteData.sexo || 
        !this.pacienteData.enfermedades || !this.pacienteData.telefonoCuidador) {
      this.addBotMessage('Lo siento, faltan datos requeridos para registrar el paciente. Por favor, intenta de nuevo.');
      this.isCreatingPaciente = false;
      this.currentStep = 0;
      return;
    }

    this.pacientesService.crearPaciente(this.pacienteData as Paciente).subscribe({
      next: () => {
        if (this.isSelfRegistration) {
          this.addBotMessage('¡Te has registrado exitosamente! ¿Hay algo más en lo que pueda ayudarte?');
        } else {
          this.addBotMessage('¡Paciente registrado exitosamente! ¿Hay algo más en lo que pueda ayudarte?');
        }
        this.isCreatingPaciente = false;
        this.currentStep = 0;
        this.loadPacientes();
      },
      error: (error: any) => {
        console.error('Error creating paciente:', error);
        this.addBotMessage('Lo siento, hubo un error al registrar el paciente. Por favor, intenta de nuevo.');
        this.isCreatingPaciente = false;
        this.currentStep = 0;
      }
    });
  }

  loadPacientes(): void {
    this.pacientesService.getPacientes().subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
      },
      error: (error) => {
        console.error('Error loading pacientes:', error);
        this.addBotMessage('Lo siento, hubo un error al cargar la lista de pacientes.');
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/medicines']);
  }

  addBotMessage(text: string): void {
    this.messages.push({
      text,
      sender: 'bot',
      time: this.getCurrentTime()
    });
  }

  addUserMessage(text: string): void {
    this.messages.push({
      text,
      sender: 'user',
      time: this.getCurrentTime()
    });
  }

  sendMessage(): void {
    if (this.userMessage.trim() === '') return;

    const messageToSend = this.userMessage.trim();
    this.addUserMessage(messageToSend);
    this.userMessage = '';

    if (this.isCreatingMedication) {
      this.handleMedicationCreation(messageToSend);
    } else if (this.isCreatingPaciente) {
      this.handlePacienteCreation(messageToSend);
    } else {
      this.handleGeneralMessage(messageToSend);
    }
  }

  handleMedicationCreation(message: string): void {
    if (!this.isCreatingMedication) {
      this.isCreatingMedication = true;
      this.currentMedicationStep = 0;
      this.medicationData = {};
      this.addBotMessage('Vamos a crear un nuevo medicamento. ¿Cuál es el nombre del medicamento?');
      return;
    }

    switch (this.currentMedicationStep) {
      case 0: // Nombre del medicamento
        this.medicationData.nombre = message;
        this.currentMedicationStep++;
        this.addBotMessage('¿Cuál es la dosis del medicamento? (Ejemplos: 500mg, 10ml, 1 tableta, 2 cápsulas)');
        break;

      case 1: // Dosis
        this.medicationData.dosis = message;
        this.currentMedicationStep++;
        this.addBotMessage('¿Cada cuántas horas se debe tomar? (Ejemplo: 8 horas, 12 horas, 24 horas)');
        break;

      case 2: // Frecuencia
        this.medicationData.frecuencia = message;
        this.currentMedicationStep++;
        this.addBotMessage('¿Cuántos días se debe tomar?');
        break;

      case 3: // Duración
        const days = parseInt(message);
        if (!isNaN(days) && days > 0) {
          this.medicationData.durationInDays = days;
          this.currentMedicationStep++;
          this.addBotMessage('¿Hay alguna instrucción especial? (Ejemplo: tomar con comida, antes de dormir)');
        } else {
          this.addBotMessage('Por favor, ingresa un número válido de días');
        }
        break;

      case 4: // Instrucciones especiales
        this.medicationData.instrucciones = message;
        this.currentMedicationStep++;
        this.addBotMessage('¿Para qué paciente es este medicamento?');
        break;

      case 5: // Paciente
        const paciente = this.pacientes.find(p => 
          this.normalizeText(p.nombre).includes(this.normalizeText(message)) ||
          (p.id && p.id.toString() === message) ||
          (message.toLowerCase() === 'yo' && this.pacientes.length > 0)
        );

        if (paciente) {
          this.medicationData.pacienteId = paciente.id;
          this.addBotMessage(`Medicamento asignado a: ${paciente.nombre}`);
          this.createMedication();
        } else {
          if (this.pacientes.length === 0) {
            this.addBotMessage('No hay pacientes registrados. ¿Te gustaría registrar un nuevo paciente? (sí/no)');
            this.currentMedicationStep = 6; // Paso adicional para manejar nuevo paciente
          } else {
            this.addBotMessage('Pacientes disponibles:');
            this.pacientes.forEach(p => {
              this.addBotMessage(`- ${p.nombre} (ID: ${p.id})`);
            });
            this.addBotMessage('Por favor, ingresa el nombre completo o el ID del paciente.');
          }
        }
        break;

      case 6: // Confirmación de nuevo paciente
        if (message.toLowerCase() === 'sí' || message.toLowerCase() === 'si') {
          this.isCreatingMedication = false;
          this.startPacienteCreation(false);
        } else {
          this.addBotMessage('Por favor, selecciona un paciente existente de la lista mostrada.');
          this.currentMedicationStep = 5;
        }
        break;
    }
  }

  createMedication(): void {
    if (!this.medicationData.nombre || !this.medicationData.dosis || !this.medicationData.frecuencia || 
        !this.medicationData.durationInDays || !this.medicationData.pacienteId) {
      this.addBotMessage('Error: Faltan campos requeridos para crear el medicamento.');
      return;
    }

    const medicine: Medicine = {
      nombre: this.medicationData.nombre,
      dosis: this.medicationData.dosis,
      frecuencia: this.medicationData.frecuencia,
      horaFecha: new Date().toISOString(),
      durationInDays: this.medicationData.durationInDays,
      totalDoses: this.medicationData.totalDoses,
      pacienteId: this.medicationData.pacienteId,
      createdBy: 'chatbot'
    };

    this.medicinesService.createMedicine(medicine).subscribe({
      next: (response: Medicine) => {
        this.addBotMessage('¡Medicamento creado exitosamente!');
        this.isCreatingMedication = false;
        this.currentMedicationStep = 0;
        this.medicationData = {};
      },
      error: (error: any) => {
        console.error('Error al crear medicamento:', error);
        this.addBotMessage('Lo siento, hubo un error al crear el medicamento. Por favor, inténtalo de nuevo.');
        if (error.error) {
          this.addBotMessage(`Detalles del error: ${error.error.message || JSON.stringify(error.error)}`);
        }
      }
    });
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; 
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }
} 