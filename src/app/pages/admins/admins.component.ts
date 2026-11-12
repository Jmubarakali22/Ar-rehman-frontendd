import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Admin } from '../../core/models/models';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admins-page">
      <!-- Header -->
      <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold mb-1" style="color: #0F3D63;">Admin Accounts & Access Control</h2>
          <p class="text-muted small mb-0">Manage authorized charity staff and trustee administrative logins.</p>
        </div>
        <div class="flex-shrink-0">
          <button class="btn btn-trust-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-shield-plus me-1"></i> Add Admin
          </button>
        </div>
      </div>

      <!-- Admins Table Card -->
      <div class="admin-card mb-4">
        <div class="table-responsive admin-table-scroll">
          <table class="table admin-table mb-0 align-middle" style="min-width: 680px;">
            <thead class="sticky-top bg-light" style="top: 0; z-index: 5; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <tr>
                <th style="min-width: 140px;">User / Name</th>
                <th style="min-width: 110px;">Username</th>
                <th style="min-width: 150px;">Email Address</th>
                <th style="min-width: 95px;">Role</th>
                <th style="min-width: 100px;">Joined</th>
                <th class="text-end" style="min-width: 90px; white-space: nowrap;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading()) {
                <tr>
                  <td colspan="6" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              } @else {
                @for (a of admins(); track a.id) {
                  <tr>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="avatar-sm rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                          {{ a.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="fw-bold text-dark">{{ a.name }}</div>
                      </div>
                    </td>
                    <td class="font-monospace small">{{ a.username }}</td>
                    <td class="small">{{ a.email }}</td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-danger': a.role === 'superadmin',
                        'bg-primary': a.role === 'admin',
                        'bg-secondary': a.role === 'moderator'
                      }">
                        {{ a.role | uppercase }}
                      </span>
                    </td>
                    <td class="small text-muted">{{ a.created_at | date:'mediumDate' }}</td>
                    <td class="text-end" style="min-width: 90px; white-space: nowrap;">
                      @if (a.id !== authService.currentUser()?.id) {
                        <button class="btn btn-sm btn-outline-danger" (click)="deleteAdmin(a.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      } @else {
                        <span class="badge bg-light text-muted border">You</span>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ADD ADMIN MODAL -->
    @if (showModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header" style="background-color: #0F3D63; color: #fff;">
              <h5 class="modal-title fw-bold">Create New Admin Account</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showModal.set(false)"></button>
            </div>
            <div class="modal-body p-4">
              <form (ngSubmit)="saveAdmin()">
                <div class="mb-3">
                  <label class="form-label small fw-bold">Full Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.name" name="name" required>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label small fw-bold">Username *</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.username" name="username" required>
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-bold">Role</label>
                    <select class="form-select" [(ngModel)]="formData.role" name="role">
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Email *</label>
                  <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Initial Password *</label>
                  <input type="password" class="form-control" [(ngModel)]="formData.password" name="password" required>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-light" (click)="showModal.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-trust-primary" [disabled]="isSubmitting()">
                    {{ isSubmitting() ? 'Creating...' : 'Create Admin' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminsComponent implements OnInit {
  isLoading = signal(true);
  isSubmitting = signal(false);
  admins = signal<Admin[]>([]);
  showModal = signal(false);
  formData: any = {};

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.isLoading.set(true);
    this.authService.getAllAdmins().subscribe({
      next: (res) => {
        if (res.success) {
          this.admins.set(res.admins || []);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddModal(): void {
    this.formData = {
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'admin'
    };
    this.showModal.set(true);
  }

  saveAdmin(): void {
    this.isSubmitting.set(true);
    this.authService.createAdmin(this.formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showModal.set(false);
        this.loadAdmins();
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  deleteAdmin(id: number): void {
    if (confirm('Are you sure you want to delete this admin account?')) {
      this.authService.deleteAdmin(id).subscribe({
        next: () => this.loadAdmins()
      });
    }
  }
}
