import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://192.168.120.150:3000/api';

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

  register(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, formData);
  }
}
