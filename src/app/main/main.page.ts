import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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

  onLogin() {
    if (!this.email || !this.password) {
      alert('Introduce email y contraseña');
      return;
    }

    this.http
      .post<any>('http://localhost:3000/api/login', {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          // guardamos usuario logueado
          localStorage.setItem('currentUser', JSON.stringify(res.user));
          this.router.navigate(['/book-list']);
        },
        error: () => {
          alert('Credenciales incorrectas');
        },
      });
  }
}
