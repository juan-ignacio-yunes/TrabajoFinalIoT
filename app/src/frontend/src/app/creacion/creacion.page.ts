import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Router } from '@angular/router';
@Component({
  selector: 'app-creacion',
  templateUrl: './creacion.page.html',
  styleUrls: ['./creacion.page.scss'],
})
export class CreacionPage {

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
    console.log("🚀 Enviando solicitud al backend...");
    this.http.post('http://localhost:3000/creacion', this.formData)
      .subscribe({
        next: (res) => {
          console.log('Usuario creado', res);
          alert('Creación exitosa');
          // Luego se redirige al usuario a la home
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error en creacion:', err);
          alert(err.error?.error || 'Error al crear el usuario');
        }
      });
  }

}
