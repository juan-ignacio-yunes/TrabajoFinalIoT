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

  constructor(private _loginService: LoginService) { }

  onLogin(form: NgForm) {
    this.submitted = true
  
    if (form.valid) {
      this._loginService.login(this.login.user_email, this.login.password)
    } 
  }
}