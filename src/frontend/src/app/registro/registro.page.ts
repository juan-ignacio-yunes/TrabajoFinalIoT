import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Router } from '@angular/router'; // si quieres redireccionar
import { environment } from 'src/environments/environment'; // si tienes un environment.ts

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {

  // Objeto que enlazamos con el form (vía [(ngModel)])
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
    // Suponiendo que el backend corre en: http://localhost:3000/api/registro/register
    this.http.post('http://localhost:3000/api/registro/register', this.formData)
      .subscribe({
        next: (res) => {
          console.log('Usuario registrado', res);
          // Si quieres redirigir al login, por ejemplo:
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error en registro:', err);
          // Manejo de error, ej. mostrar un toast
        }
      });
  }

}
