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
  isSuperAdmin = computed(() => {
    const role = (this.currentUser()?.role || '').toLowerCase().trim();
    return role === 'superadmin' || role === 'super admin' || role === 'super_admin';
  });

  hasPermission(pageKey: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const role = (user.role || '').toLowerCase().trim();

    // Super Admin has unrestricted access across all modules
    if (role === 'superadmin' || role === 'super admin' || role === 'super_admin') {
      return true;
    }

    // Standard Admin / Managing Trustee / Trustee has full administrative access
    if (role === 'admin' || role === 'managing trustee' || role === 'trustee' || role === 'administrator') {
      return true;
    }

    // Dashboard overview is accessible to all authenticated staff
    if (pageKey === 'dashboard') {
      return true;
    }

    const perms = user.permissions;
    // Fallback: If permissions not defined (e.g. existing session before RBAC), grant access gracefully
    if (!perms || !Array.isArray(perms) || perms.length === 0) {
      return true;
    }

    if (perms.includes('*')) return true;
    return perms.includes(pageKey);
  }

  getFirstAccessibleRoute(): string {
    const pages = ['dashboard', 'donations', 'causes', 'gallery', 'volunteers', 'inquiries', 'settings', 'admins', 'roles'];
    for (const page of pages) {
      if (this.hasPermission(page)) {
        return `/${page}`;
      }
    }
    return '/dashboard';
  }

  constructor(private http: HttpClient, private router: Router) {}

  private getStoredUser(): Admin | null {
    try {
      const raw = localStorage.getItem('art_user');
      if (!raw) return null;
      const user = JSON.parse(raw);
      if (user && (user.name === 'Ar-Rahman Super Admin' || user.username === 'Ar-Rahman Super Admin' || user.name === 'Ar-Rahman SuperAdmin')) {
        user.name = 'Super Admin';
        user.username = 'Super Admin';
        localStorage.setItem('art_user', JSON.stringify(user));
      }
      return user;
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

  // --- Roles & Access Control Methods ---
  getRoles(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/roles`);
  }

  createRole(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/roles`, data);
  }

  updateRole(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/roles/${id}`, data);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/roles/${id}`);
  }

  getRoleUsers(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/roles/users`);
  }

  assignUserAccess(userId: number, data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/roles/assign-user/${userId}`, data);
  }
}
