import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class posteadoresService {

  constructor(private http: HttpClient) { }

  // Tus métodos existentes van aquí

  enviarMedicion(medicion: any): Observable<any> {
    const url = 'http://localhost:8000/mediciones/agregar';
    return this.http.post(url, medicion);
  }

  enviarLog(log: any): Observable<any> {
    const url = 'http://localhost:8000/log_riegos/agregar';
    return this.http.post(url, log);
  }
}