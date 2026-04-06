import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TokenResponse } from '../models/auth';
// import { WishlistService } from './wishlist.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  user = signal<{ id: number; email: string; role: string } | null>(null);

  private baseUrl = 'http://127.0.0.1:8000/auth';

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      this.decodeToken(token);
    }
  }

  register(name: string, email: string, password: string) {
  return this.http.post<TokenResponse>(`${this.baseUrl}/register`, {
    name,
    email,
    password
  });
}

handleAuthSuccess(res: TokenResponse) {
  localStorage.setItem('token', res.access_token);
  this.decodeToken(res.access_token);
}

  login(username: string, password: string) {
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.post<TokenResponse>(`${this.baseUrl}/login`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.user.set(null);
  }

  decodeToken(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.user.set({
        id: Number(payload.sub),
        email: payload.email,
        role: payload.role
      });
    } catch {
      this.logout();
    }
  }

  isLoggedIn() {
    return this.user() !== null;
  }

  isAdmin() {
    return this.user()?.role === 'admin';
  }
}
