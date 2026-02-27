import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluadorService {
 
  private apiUrl = 'http://localhost:3000/evaluar';

  constructor(private http: HttpClient) { }

  enviarExamen(imagen: File, instrucciones: string): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    formData.append('instrucciones', instrucciones);

    return this.http.post(this.apiUrl, formData);
  }
}