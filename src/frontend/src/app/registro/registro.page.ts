import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Router } from '@angular/router';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {

  // Objeto que se enlaza con el form (vía [(ngModel)])
  formData = {
    user_email: '',
    password: '',
    user_nombre: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router //,ngOnInit() {}
  ) { }

  onSubmit() {
    this.http.post('http://localhost:3000/registro', this.formData)
      .subscribe({
        next: (res) => {
          console.log('Usuario registrado', res);
          alert('Registro exitoso');
          // Luego se redirige al usuario a la home
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error en registro:', err);
          alert(err.error?.error || 'Error al registrar usuario');
        }
      });
  }

}
