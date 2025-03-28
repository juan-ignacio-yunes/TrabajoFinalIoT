import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  uri = 'http://localhost:8000'

  constructor(private _http: HttpClient, private _router: Router) { }

  async login (user_email: string, contraseña: string) {
    let response = await firstValueFrom(this._http.post<any>(
      this.uri + '/login', {user_email: user_email, password: contraseña}
    ))
    if (response !== null) {
      localStorage.setItem('token', response.token); //guarda el token en el local storage
      localStorage.setItem('user_id', response.user.user_id); //guarda user_id en el local storage
      this._router.navigate(['/home'])
    }
  }

  logout () {
    localStorage.removeItem('token')
  }

  public get logIn (): boolean {
    return (localStorage.getItem('token') !== null)
  }
}
