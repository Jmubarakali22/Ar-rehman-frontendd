import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Admin } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  currentUser = signal<Admin | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem('art_token'));
  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  isSuperAdmin = computed(() => this.currentUser()?.role === 'superadmin');

  constructor(private http: HttpClient, private router: Router) {}

  private getStoredUser(): Admin | null {
    try {
      const user = localStorage.getItem('art_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token) {
          localStorage.setItem('art_token', res.token);
          localStorage.setItem('art_user', JSON.stringify(res.admin));
          this.token.set(res.token);
          this.currentUser.set(res.admin);
        }
      })
    );
  }

  logout(reason?: string): void {
    localStorage.removeItem('art_token');
    localStorage.removeItem('art_user');
    this.token.set(null);
    this.currentUser.set(null);
    if (reason) {
      this.router.navigate(['/login'], { queryParams: { reason } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      tap(res => {
        if (res.success && res.admin) {
          this.currentUser.set(res.admin);
          localStorage.setItem('art_user', JSON.stringify(res.admin));
        }
      })
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, formData).pipe(
      tap(res => {
        if (res.success && res.admin) {
          this.currentUser.set(res.admin);
          localStorage.setItem('art_user', JSON.stringify(res.admin));
        }
      })
    );
  }

  getAllAdmins(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`);
  }

  createAdmin(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, data);
  }

  deleteAdmin(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
