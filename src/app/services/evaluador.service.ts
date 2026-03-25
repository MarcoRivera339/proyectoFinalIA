import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluadorService {
 
  private apiUrl = 'http://localhost:3000/evaluar-chat';

  constructor(private http: HttpClient) { }

  enviarAlChat(instrucciones: string, imagenes: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('instrucciones', instrucciones);

    //Agregamos todas las imágenes cargadas al FormData
    imagenes.forEach(img => {
      formData.append('imagenes', img);
    });

    return this.http.post<any>(this.apiUrl, formData);
  }
}