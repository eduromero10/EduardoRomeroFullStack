import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule, RouterLink],
})

export class ProfilePage implements OnInit {
  
  avatarUrl = 'assets/default-avatar.png';
  titleText = 'Mi perfil';
  isCurrentUser = false;

  userId = 0;
  currentUser: any = null;
  viewedUser: any = null;

  order: 'asc' | 'desc' = 'desc';
  reviews: any[] = [];

  selectedReview: any = null;
  editRating: number | null = null;
  editComment = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    const stored = localStorage.getItem('currentUser');
    if (stored) this.currentUser = JSON.parse(stored);

    if (idParam) this.userId = parseInt(idParam, 10);
    else if (this.currentUser) this.userId = this.currentUser.id;

    this.isCurrentUser = this.currentUser?.id === this.userId;

    this.titleText = this.isCurrentUser ? 'Mi perfil' : 'Perfil del usuario';

    this.loadUser();
    this.loadReviews();
  }

  goBackToBooks(): void {
    this.router.navigate(['/book-list']);
  }

  loadUser() {
    this.http
      .get<any>(`${environment.apiUrl}/api/users/${this.userId}`)
      .subscribe((user) => {
        this.viewedUser = user;
        if (user?.profile_image) this.avatarUrl = user.profile_image;
      });
  }

  loadReviews() {
    const params = new HttpParams().set('order', this.order);

    this.http
      .get<any[]>(`${environment.apiUrl}/api/users/${this.userId}/reviews`, { params })
      .subscribe((r) => (this.reviews = r));
  }

  onOrderChange(event: any) {
    this.order = event.detail.value;
    this.loadReviews();
  }

  selectReview(r: any) {
    if (!this.isCurrentUser) return;

    this.selectedReview = r;
    this.editRating = r.rating;
    this.editComment = r.comment;
  }

  clearSelection() {
    this.selectedReview = null;
    this.editRating = null;
    this.editComment = '';
  }

  updateSelectedReview() {
    if (!this.selectedReview) return;

    this.http
      .put(`${environment.apiUrl}/api/reviews/${this.selectedReview.id}`, {
        rating: this.editRating,
        comment: this.editComment,
      })
      .subscribe(() => {
        alert('Actualizada');
        this.loadReviews();
      });
  }

  deleteSelectedReview() {
    if (!this.selectedReview) return;

    this.http
      .delete(`${environment.apiUrl}/api/reviews/${this.selectedReview.id}`)
      .subscribe(() => {
        alert('Eliminada');
        this.loadReviews();
      });
  }
}
