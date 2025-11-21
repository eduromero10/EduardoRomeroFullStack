import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-other-profile',
  standalone: true,
  templateUrl: './otherprofile.page.html',
  styleUrls: ['./otherprofile.page.scss'],
  imports: [IonicModule, CommonModule, HttpClientModule],
  providers: [DatePipe],
})
export class OtherProfilePage implements OnInit {
  userId = 0;
  viewedUser: any = null;
  avatarUrl = 'assets/default-avatar.png';

  order: 'asc' | 'desc' = 'desc';
  reviews: any[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.userId = idParam ? parseInt(idParam, 10) : 0;

    this.loadUser();
    this.loadReviews();
  }

  loadUser(): void {
    this.http
      .get<any>(`http://localhost:3000/api/users/${this.userId}`)
      .subscribe({
        next: (user) => {
          this.viewedUser = user;
          if (user.profile_image) {
            this.avatarUrl = user.profile_image;
          }
        },
        error: (err) => console.error('Error cargando usuario:', err),
      });
  }

  loadReviews(): void {
    const params = new HttpParams().set('order', this.order);

    this.http
      .get<any[]>(`http://localhost:3000/api/users/${this.userId}/reviews`, {
        params,
      })
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews;
        },
        error: (err) => console.error('Error cargando reseñas:', err),
      });
  }

  onOrderChange(event: any): void {
    this.order = event.detail.value;
    this.loadReviews();
  }

  // 🔙 FUNCIÓN PARA VOLVER
  goBack() {
    this.router.navigate(['/book-list']);
  }
}
