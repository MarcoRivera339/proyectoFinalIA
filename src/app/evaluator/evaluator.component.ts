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
export class EvaluatorComponent {
  nuevoMensaje: string = '';
  imagenesSeleccionadas: File[] = [];
  historial: any[] = []; 
  loading: boolean = false;
  isDarkMode: boolean = false;

  constructor(private evaluadorService: EvaluadorService) {}

  toggleDarkMode(){
    this.isDarkMode = !this.isDarkMode;
  }

  onFileSelected(event: any) {
    this.imagenesSeleccionadas = Array.from(event.target.files);
  }

  enviarMensaje(){
    if (this.imagenesSeleccionadas.length === 0 && !this.nuevoMensaje) return;
    this.loading = true;
    this.historial.push({ 
      emisor: 'usuario', 
      texto: this.nuevoMensaje, 
      cantImagenes: this.imagenesSeleccionadas.length });

    this.evaluadorService.enviarAlChat(this.nuevoMensaje, this.imagenesSeleccionadas).subscribe({
      next: (res) => {
        this.historial.push({
          emisor: 'ia',
          texto: res.evaluacion.general_feedback,
          soluciones: res.evaluacion.exercises
        });
        this.loading = false;
        this.limpiarInputs();
      },
      error: () => { alert("Error de conexión"); this.loading = false; }
    });
  }

  limpiarInputs(){
    this.nuevoMensaje = '';
    this.imagenesSeleccionadas = [];
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}