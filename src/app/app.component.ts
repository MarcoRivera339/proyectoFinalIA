import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluatorComponent } from './evaluator/evaluator.component'; // Verifica que termine en 't'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EvaluatorComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'proyectoFinalIA';
}