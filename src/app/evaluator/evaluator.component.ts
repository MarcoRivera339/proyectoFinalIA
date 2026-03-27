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
  imagenesSeleccionadas: File[] = []; // Aseguramos tipo File[]
  historial: any[] = [];
  loading: boolean = false;
  archivosCargados: boolean = false;

  constructor(private evaluadorService: EvaluadorService) {}

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.imagenesSeleccionadas = Array.from(files); // Conversión explícita
      this.archivosCargados = true;
      console.log("Archivos listos para enviar:", this.imagenesSeleccionadas.length);
    }
  }

  nuevoChat() {
    this.historial = [];
    this.limpiarInputs();
  }

  async enviarMensaje() {
    if (this.imagenesSeleccionadas.length === 0) {
      alert("Por favor, adjunta al menos una imagen.");
      return;
    }
    
    this.loading = true;
    this.archivosCargados = false;

    // Generar miniaturas para el chat
    const miniaturas = await Promise.all(this.imagenesSeleccionadas.map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e: any) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }));

    const promptTxt = this.nuevoMensaje;
    this.historial.push({ emisor: 'usuario', texto: promptTxt, previsualizaciones: miniaturas });

    this.evaluadorService.enviarAlChat(promptTxt, this.imagenesSeleccionadas).subscribe({
      next: (res: any) => {
        this.historial.push({
          emisor: 'ia',
          texto: res.evaluacion.general_feedback,
          soluciones: res.evaluacion.exercises,
          notaGlobal: res.evaluacion.global_total_score,
          notaMaxGlobal: res.evaluacion.global_max_score
        });
        this.loading = false;
        this.limpiarInputs();
      },
      error: (err: any) => {
        console.error("Error en peticion:", err);
        this.loading = false;
        alert("Error 400: El servidor no reconoció los datos. Revisa la consola.");
      }
    });
  }

  limpiarInputs() {
    this.nuevoMensaje = '';
    this.imagenesSeleccionadas = [];
    this.archivosCargados = false;
    const input = document.getElementById('fileInput') as HTMLInputElement;
    if (input) input.value = '';
  }
}