import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, RouterLink, HttpClientModule, CommonModule],
})
export class MainPage {
  email = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      alert('Introduce email y contraseña');
      return;
    }

    const body = {
      email: this.email,
      password: this.password,
    };

    this.http.post<any>(`${environment.apiUrl}/api/login`, body).subscribe({
      next: (res) => {
        console.log('LOGIN RESPONSE:', res);

        if (!res?.token) {
          alert('Login OK pero NO llegó token. Revisa backend /api/login');
          return;
        }

        localStorage.setItem('currentUser', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);

        console.log('TOKEN GUARDADO:', localStorage.getItem('token'));

        this.router.navigate(['/book-list']);
      },
      error: (err) => {
        console.error('ERROR LOGIN:', err);

        if (err.status === 0) {
          alert('No conecta con el servidor (IP/puerto/firewall).');
        } else if (err.status === 401) {
          alert('Credenciales incorrectas');
        } else {
          alert(`Error en login (${err.status})`);
        }
      },
    });
  }
}
