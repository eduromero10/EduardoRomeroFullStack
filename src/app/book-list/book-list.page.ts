import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  cover_url?: string;
  avg_rating: number;
  review_count: number;
}

interface UserSuggestion {
  id: number;
  username: string;
  profile_image?: string;
}

@Component({
  selector: 'app-book-list',
  standalone: true,
  templateUrl: './book-list.page.html',
  styleUrls: ['./book-list.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
})
export class BookListPage implements OnInit {
  currentUser: any = null;
  avatarUrl = 'assets/default-avatar.png';

  userSearchTerm = '';
  userSuggestions: UserSuggestion[] = [];
  showUserSuggestions = false;

  books: Book[] = [];
  filteredBooks: Book[] = [];
  authors: string[] = [];
  selectedAuthor = 'Todos';
  bookSearchTerm = '';

  selectedBook: Book | null = null;
  ratingInput: number | null = null;
  commentInput = '';
  bookImageFile: File | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      if (this.currentUser.profile_image) {
        this.avatarUrl = this.currentUser.profile_image;
      }
    }

    this.loadBooks();
    this.loadAuthors();
  }

  onUserSearchChange(): void {
    const term = this.userSearchTerm.trim();
    if (term.length < 2) {
      this.userSuggestions = [];
      this.showUserSuggestions = false;
      return;
    }

    const params = new HttpParams().set('username', term);

    this.http
      .get<UserSuggestion[]>(`${environment.apiUrl}/api/users/search`, { params })
      .subscribe((users) => {
        this.userSuggestions = users;
        this.showUserSuggestions = users.length > 0;
      });
  }

  selectUserFromSuggestions(user: UserSuggestion): void {
    this.router.navigate(['/otherprofile', user.id]);
    this.clearUserSearch();
  }

  clearUserSearch(): void {
    this.userSearchTerm = '';
    this.userSuggestions = [];
    this.showUserSuggestions = false;
  }

  onSearchProfileClick(): void {
    if (!this.userSearchTerm.trim()) return;

    const params = new HttpParams().set('username', this.userSearchTerm.trim());

    this.http
      .get<UserSuggestion[]>(`${environment.apiUrl}/api/users/search`, { params })
      .subscribe((users) => {
        if (users.length > 0) {
          this.router.navigate(['/otherprofile', users[0].id]);
        } else {
          alert('No se encontró ningún usuario');
        }
      });
  }

  goToMyProfile(): void {
    
    this.router.navigate(['/profile']);
  }

  loadBooks(): void {
    let params = new HttpParams();

    if (this.bookSearchTerm.trim()) {
      params = params.set('title', this.bookSearchTerm.trim());
    }
    if (this.selectedAuthor !== 'Todos') {
      params = params.set('author', this.selectedAuthor);
    }

    this.http.get<Book[]>(`${environment.apiUrl}/api/books`, { params }).subscribe((books) => {
      this.books = books;
      this.applyBookFilter();
    });
  }

  loadAuthors(): void {
    this.http
      .get<{ author: string }[]>(`${environment.apiUrl}/api/books/authors`)
      .subscribe((rows) => {
        this.authors = ['Todos', ...rows.map((r) => r.author)];
      });
  }

  applyBookFilter(): void {
    const term = this.bookSearchTerm.toLowerCase();

    this.filteredBooks = this.books.filter(
      (book) =>
        book.title.toLowerCase().includes(term) &&
        (this.selectedAuthor === 'Todos' || book.author === this.selectedAuthor)
    );
  }

  onBookSearchChange(): void {
    this.applyBookFilter();
  }

  onAuthorChange(): void {
    this.loadBooks();
  }

  selectBook(book: Book): void {
    this.selectedBook = book;
  }

  onBookImageChange(event: any): void {
    this.bookImageFile = event.target.files[0] || null;
  }

  saveReview(): void {
    if (!this.selectedBook || this.ratingInput === null) {
      alert('Selecciona libro y valoración');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('No hay token. Inicia sesión de nuevo.');
      return;
    }

    const formData = new FormData();
    formData.append('bookId', String(this.selectedBook.id));

    formData.append('rating', String(this.ratingInput));
    formData.append('comment', this.commentInput || '');

    if (this.bookImageFile) {
      formData.append('book_image', this.bookImageFile);
    }

    this.http
      .post(`${environment.apiUrl}/api/reviews`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => {
          alert('Reseña guardada');
          this.loadBooks();
          this.ratingInput = null;
          this.commentInput = '';
          this.bookImageFile = null;
        },
        error: (err) => {
          console.error('Error guardando reseña:', err);
          if (err.status === 401) alert('No autorizado: token inválido o expirado.');
          else alert('Error guardando reseña');
        },
      });
  }
}
