import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluadorService } from '../services/evaluador.service';

@Component({
  selector: 'app-evaluator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluator.component.html',
  styleUrls: ['./evaluator.component.css']
})

export class EvaluadorComponent {
  nuevoMensaje: string = '';
  imagenesSeleccionadas: File[] = [];
  historial: any[] = [];
  loading: boolean = false;
  isDarkMode: boolean = true;
  isSidebarOpen: boolean = true;
  
  chatsGuardados = [{ titulo: 'Ejercicio Matrices', id: 1 }];

  constructor(private evaluadorService: EvaluadorService) {}

  nuevoChat() {
    this.historial = []; // Limpia el chat actual
    this.nuevoMensaje = ''; // Limpia el texto de entrada
    this.imagenesSeleccionadas = []; // Limpia las imágenes
    console.log("Iniciando nueva sesión de estudio...");
  }

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  toggleDarkMode() { this.isDarkMode = !this.isDarkMode; }

  onFileSelected(event: any) {
    this.imagenesSeleccionadas = Array.from(event.target.files);
  }

  async enviarMensaje() {
    if (this.imagenesSeleccionadas.length === 0 && !this.nuevoMensaje) return;
    this.loading = true;

    // Generar miniaturas para visualización inmediata
    const miniaturas = await Promise.all(this.imagenesSeleccionadas.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }));

    this.historial.push({ emisor: 'usuario', texto: this.nuevoMensaje, previsualizaciones: miniaturas });

    this.evaluadorService.enviarAlChat(this.nuevoMensaje, this.imagenesSeleccionadas).subscribe({
      next: (res) => {
        this.historial.push({ 
          emisor: 'ia', 
          texto: res.evaluacion.general_feedback, 
          soluciones: res.evaluacion.exercises,
          miniaturasInput: miniaturas 
        });
        this.loading = false;
        this.limpiarInputs();
      },
      error: () => { alert("Error"); this.loading = false; }
    });
  }

  limpiarInputs() {
    this.nuevoMensaje = '';
    this.imagenesSeleccionadas = [];
    (document.getElementById('fileInput') as HTMLInputElement).value = '';
  }
}