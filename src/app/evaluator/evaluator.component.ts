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
  selectedFile: File | null = null;
  imagePreview: any = null;
  instructions: string = '';
  resultado: any = null; 
  loading: boolean = false;

  constructor(private evaluadorService: EvaluadorService) {}

  onFileSelected(event: any) {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
    
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);

    console.log("✅ Archivo cargado con éxito:", this.selectedFile.name);
  } else {
    console.warn("⚠️ No se seleccionó ningún archivo");
  }
}

  analizarExamen() {
    this.resultado = null;
    this.loading = true;
    if (!this.selectedFile){
      alert("Error: No detecto el archivo en la variable");
      return;
    }

    this.loading = true;

    this.evaluadorService.enviarExamen(this.selectedFile, this.instructions)
      .subscribe({
        next: (response: any) => {
          this.resultado = response.evaluacion; 
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }
}