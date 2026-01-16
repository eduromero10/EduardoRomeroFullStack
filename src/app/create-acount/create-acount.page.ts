import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../service/photo.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-acount',
  standalone: true,
  templateUrl: './create-acount.page.html',
  styleUrls: ['./create-acount.page.scss'],
  imports: [IonicModule, FormsModule, RouterLink, HttpClientModule, CommonModule],
})
export class CreateAcountPage {
  username = '';
  email = '';
  password = '';
  imgFile: File | null = null;
  takingPhoto = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private photoService: PhotoService
  ) {}


  onFileChange(event: any) {
    this.imgFile = event.target.files[0] ?? null;
  }

  
  async onTakePhoto() {
    this.takingPhoto = true;
    try {
      const file = await this.photoService.takePhoto();
      if (file) this.imgFile = file;
    } finally {
      this.takingPhoto = false;
    }
  }

  onRegister() {
    if (!this.username || !this.email || !this.password) {
      alert('Rellena todos los campos');
      return;
    }

    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('email', this.email);
    formData.append('password', this.password);
    if (this.imgFile) formData.append('profile_image', this.imgFile);

    this.http.post(`${environment.apiUrl}/api/users`, formData).subscribe({
      next: () => {
        alert('Cuenta creada');
        this.router.navigate(['/']);
      },
      error: (e) => {
        console.error(e);
        alert('Error creando usuario (quizás email/usuario ya existen)');
      },
    });
  }
}
