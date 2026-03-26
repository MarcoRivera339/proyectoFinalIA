import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluadorComponent } from './evaluator/evaluator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EvaluadorComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'proyectoFinalIA';
}