import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

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
      .get<UserSuggestion[]>('http://localhost:3000/api/users/search', {
        params,
      })
      .subscribe({
        next: (users) => {
          this.userSuggestions = users;
          this.showUserSuggestions = users.length > 0;
        },
        error: (err) => console.error('Error buscando usuarios:', err),
      });
  }

  selectUserFromSuggestions(user: UserSuggestion): void {
    this.userSearchTerm = user.username;
    this.userSuggestions = [];
    this.showUserSuggestions = false;
    this.router.navigate(['/otherprofile', user.id]); // 👈 FIX
  }

  clearUserSearch(): void {
    this.userSearchTerm = '';
    this.userSuggestions = [];
    this.showUserSuggestions = false;
  }

  onSearchProfileClick(): void {
    const term = this.userSearchTerm.trim();
    if (!term) return;

    const params = new HttpParams().set('username', term);

    this.http
      .get<UserSuggestion[]>('http://localhost:3000/api/users/search', {
        params,
      })
      .subscribe({
        next: (users) => {
          if (users.length === 0) {
            alert('No se encontró ningún usuario con ese nombre');
            return;
          }
          this.router.navigate(['/otherprofile', users[0].id]); // 👈 FIX
        },
        error: (err) => console.error('Error buscando usuario:', err),
      });
  }

  goToMyProfile(): void {
    if (!this.currentUser) {
      alert('Debes iniciar sesión');
      return;
    }
    this.router.navigate(['/profile']);
  }

  loadBooks(): void {
    let params = new HttpParams();
    if (this.bookSearchTerm.trim()) {
      params = params.set('title', this.bookSearchTerm.trim());
    }
    if (this.selectedAuthor && this.selectedAuthor !== 'Todos') {
      params = params.set('author', this.selectedAuthor);
    }

    this.http
      .get<Book[]>('http://localhost:3000/api/books', { params })
      .subscribe({
        next: (books) => {
          this.books = books;
          this.applyBookFilter();
        },
        error: (err) => console.error('Error cargando libros:', err),
      });
  }

  loadAuthors(): void {
    this.http
      .get<{ author: string }[]>('http://localhost:3000/api/books/authors')
      .subscribe({
        next: (rows) => {
          this.authors = ['Todos', ...rows.map((r) => r.author)];
        },
        error: (err) => console.error('Error cargando autores:', err),
      });
  }

  applyBookFilter(): void {
    const term = this.bookSearchTerm.toLowerCase().trim();
    const author = this.selectedAuthor;

    this.filteredBooks = this.books.filter((b) => {
      const matchesTitle = term
        ? b.title.toLowerCase().includes(term)
        : true;
      const matchesAuthor =
        !author || author === 'Todos' ? true : b.author === author;
      return matchesTitle && matchesAuthor;
    });
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
    const file = event.target.files[0];
    this.bookImageFile = file || null;
  }

  saveReview(): void {
    if (!this.currentUser) {
      alert('Debes iniciar sesión');
      return;
    }
    if (!this.selectedBook) {
      alert('Selecciona un libro de la lista');
      return;
    }
    if (
      this.ratingInput === null ||
      isNaN(this.ratingInput) ||
      this.ratingInput < 0 ||
      this.ratingInput > 10
    ) {
      alert('La valoración debe estar entre 0 y 10');
      return;
    }

    const formData = new FormData();
    formData.append('bookId', String(this.selectedBook.id));
    formData.append('userId', String(this.currentUser.id));
    formData.append('rating', String(this.ratingInput));
    formData.append('comment', this.commentInput || '');
    if (this.bookImageFile) {
      formData.append('book_image', this.bookImageFile);
    }

    this.http.post('http://localhost:3000/api/reviews', formData).subscribe({
      next: () => {
        alert('Reseña guardada');
        this.loadBooks();
        this.ratingInput = null;
        this.commentInput = '';
        this.bookImageFile = null;
      },
      error: (err) => {
        console.error('Error guardando reseña:', err);
        alert('Error al guardar la reseña');
      },
    });
  }
}
