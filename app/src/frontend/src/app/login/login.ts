import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  login = { user_email: '', password: '' };
  submitted = false;
  errorMessage = ''; // para mostrar el error en la vista

  constructor(private _loginService: LoginService) { }

  /* onLogin(form: NgForm) {
    this.submitted = true
  
    if (form.valid) {
      this._loginService.login(this.login.user_email, this.login.password)
    } 
  } */

  onLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this._loginService.login(this.login.user_email, this.login.password)
        .then(response => {
          // Si llega aquí, fue login exitoso.
        })
        .catch(err => {
          // Aquí capturas errores (401, 400, etc.)
          if (err.status === 401) {
            this.errorMessage = 'Credenciales inválidas';
          } else if (err.status === 400) {
            this.errorMessage = 'Faltan datos en el formulario';
          } else {
            this.errorMessage = 'Ocurrió un error inesperado';
          }
        });
    }
  }

}