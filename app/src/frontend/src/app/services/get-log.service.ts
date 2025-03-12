import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetLogService {

  constructor(private http: HttpClient) { }

  getLogs(id: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8000/log_riegos/${id}`);
  }
}
