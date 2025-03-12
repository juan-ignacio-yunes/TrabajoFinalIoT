import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetMedicionService {

  constructor(private http: HttpClient) { }

  getMediciones(id: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8000/mediciones/${id}`);
  }

  getUltimaMedicion(id: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8000/ultimaMedicion/${id}`);
  }
}
