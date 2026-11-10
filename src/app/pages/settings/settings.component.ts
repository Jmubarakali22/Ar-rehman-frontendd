import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AutoLogoutService } from '../../core/services/auto-logout.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="mb-4">
        <h2 class="h4 fw-bold mb-1" style="color: #0F3D63;">Trust Settings & System Configuration</h2>
        <p class="text-muted small mb-0">Configure official charity contact details, UPI banking ID, admin security, and view audit logs.</p>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills mb-4 gap-2">
        <li class="nav-item">
          <button class="btn btn-sm" [ngClass]="activeTab === 'general' ? 'btn-trust-primary' : 'btn-outline-secondary'" (click)="activeTab = 'general'">
            <i class="bi bi-bank2 me-1"></i> Trust & Payment Info
          </button>
        </li>
        <li class="nav-item">
          <button class="btn btn-sm" [ngClass]="activeTab === 'profile' ? 'btn-trust-primary' : 'btn-outline-secondary'" (click)="activeTab = 'profile'">
            <i class="bi bi-person-badge me-1"></i> My Profile & Security
          </button>
        </li>
        <li class="nav-item">
          <button class="btn btn-sm" [ngClass]="activeTab === 'logs' ? 'btn-trust-primary' : 'btn-outline-secondary'" (click)="activeTab = 'logs'; loadLogs()">
            <i class="bi bi-clock-history me-1"></i> Audit Activity Logs
          </button>
        </li>
      </ul>

      <!-- Alerts -->
      @if (successMessage()) {
        <div class="alert alert-success alert-dismissible fade show small" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i> {{ successMessage() }}
          <button type="button" class="btn-close" (click)="successMessage.set(null)"></button>
        </div>
      }
      @if (errorMessage()) {
        <div class="alert alert-danger alert-dismissible fade show small" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage() }}
          <button type="button" class="btn-close" (click)="errorMessage.set(null)"></button>
        </div>
      }

      <!-- TAB 1: General Trust Settings -->
      @if (activeTab === 'general') {
        <div class="row g-4">
          <div class="col-lg-8">
            <div class="admin-card p-4">
              <h5 class="fw-bold mb-3" style="color: #0F3D63;"><i class="bi bi-info-circle me-2"></i>Official Charity Identity</h5>
              <form (ngSubmit)="saveSettings()">
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Trust Registered Name</label>
                    <input type="text" class="form-control" [(ngModel)]="settings.trust_name" name="trust_name">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Charity Registration Number</label>
                    <input type="text" class="form-control" [(ngModel)]="settings.reg_number" name="reg_number">
                  </div>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">UPI ID (For QR Code Payments)</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="bi bi-qr-code"></i></span>
                      <input type="text" class="form-control font-monospace" [(ngModel)]="settings.upi_id" name="upi_id" placeholder="fuzailahmed536l@okaxis">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">UPI Payee / Beneficiary Name</label>
                    <input type="text" class="form-control" [(ngModel)]="settings.payee_name" name="payee_name" placeholder="Ar Rahman Trust">
                  </div>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Contact Phone Number</label>
                    <input type="text" class="form-control" [(ngModel)]="settings.contact_phone" name="contact_phone" placeholder="+91 80156 65648">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Contact Email</label>
                    <input type="email" class="form-control" [(ngModel)]="settings.contact_email" name="contact_email" placeholder="arrahmantrust@gmail.com">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-bold">Headquarters Address</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="settings.trust_address" name="trust_address"></textarea>
                </div>

                <div class="mb-4">
                  <label class="form-label small fw-bold">Website Header Notification / Banner</label>
                  <input type="text" class="form-control" [(ngModel)]="settings.banner_announcement" name="banner_announcement">
                </div>

                <button type="submit" class="btn btn-trust-primary" [disabled]="isSubmitting()">
                  {{ isSubmitting() ? 'Saving...' : 'Save Trust Settings' }}
                </button>
              </form>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="admin-card p-4">
              <h6 class="fw-bold mb-3 text-secondary">LIVE QR CODE PREVIEW</h6>
              <div class="p-3 bg-light rounded-3 text-center border">
                <i class="bi bi-upc-scan fs-1 text-primary mb-2 d-block"></i>
                <div class="small fw-bold text-dark">{{ settings.payee_name || 'Ar Rahman Trust' }}</div>
                <div class="font-monospace small text-muted mb-2">{{ settings.upi_id || 'fuzailahmed536l@okaxis' }}</div>
                <div class="badge bg-success">UPI Instant QR Ready</div>
              </div>
              <p class="small text-muted mt-3 mb-0">
                Any changes saved here immediately update the payment details shown to donors on the official website.
              </p>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: Profile & Password -->
      @if (activeTab === 'profile') {
        <div class="row g-4">
          <div class="col-lg-7">
            <div class="admin-card p-4">
              <h5 class="fw-bold mb-3" style="color: #0F3D63;"><i class="bi bi-shield-lock me-2"></i>Change Admin Password</h5>
              <form (ngSubmit)="updatePassword()">
                <div class="mb-3">
                  <label class="form-label small fw-bold">Current Password</label>
                  <input type="password" class="form-control" [(ngModel)]="profileData.currentPassword" name="currentPassword" required>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">New Password</label>
                  <input type="password" class="form-control" [(ngModel)]="profileData.newPassword" name="newPassword" required>
                </div>
                <div class="mb-4">
                  <label class="form-label small fw-bold">Confirm New Password</label>
                  <input type="password" class="form-control" [(ngModel)]="profileData.confirmPassword" name="confirmPassword" required>
                </div>
                <button type="submit" class="btn btn-trust-primary" [disabled]="isSubmitting()">
                  Update Password
                </button>
              </form>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="admin-card p-4 text-center">
              <div class="avatar-circle mx-auto mb-3" style="width: 70px; height: 70px; font-size: 1.8rem; background: #0F3D63; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                {{ (authService.currentUser()?.name || 'A').charAt(0).toUpperCase() }}
              </div>
              <h5 class="fw-bold mb-1">{{ authService.currentUser()?.name }}</h5>
              <p class="text-muted small mb-2">{{ authService.currentUser()?.email }}</p>
              <span class="badge bg-primary text-uppercase">{{ authService.currentUser()?.role }}</span>
            </div>

            <!-- Inactivity Auto-Logout Security Card -->
            <div class="admin-card p-4 mt-4 text-start">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-clock-history fs-5 text-warning"></i>
                <h6 class="fw-bold mb-0 text-dark">Inactivity Auto-Logout</h6>
              </div>
              <p class="text-muted small mb-3">
                Automatically logs out the admin console when no mouse, keyboard, or touch input is detected.
              </p>

              <label class="form-label small fw-bold text-secondary">Idle Timeout Duration</label>
              <select 
                class="form-select form-select-sm" 
                [ngModel]="autoLogoutService.idleTimeoutMinutes()" 
                (ngModelChange)="onTimeoutChange($event)"
              >
                <option [value]="5">5 Minutes (High Security)</option>
                <option [value]="10">10 Minutes (Recommended)</option>
                <option [value]="15">15 Minutes (Default)</option>
                <option [value]="30">30 Minutes</option>
                <option [value]="60">60 Minutes (Extended)</option>
              </select>
              <div class="text-success small mt-2 d-flex align-items-center gap-1">
                <i class="bi bi-shield-check"></i>
                <span>Active: Auto-logout after {{ autoLogoutService.idleTimeoutMinutes() }}m with 60s countdown warning</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: Audit Activity Logs -->
      @if (activeTab === 'logs') {
        <div class="admin-card">
          <div class="table-responsive">
            <table class="table admin-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin Name</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                @for (log of activityLogs(); track log.id) {
                  <tr>
                    <td class="small text-muted">{{ log.created_at | date:'medium' }}</td>
                    <td class="fw-bold text-dark">{{ log.admin_name || 'System' }}</td>
                    <td>
                      <span class="badge bg-light text-dark border">{{ log.action }}</span>
                    </td>
                    <td class="small">{{ log.details }}</td>
                    <td class="font-monospace small text-muted">{{ log.ip_address || '127.0.0.1' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center py-5 text-muted">No activity logs recorded yet.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class SettingsComponent implements OnInit {
  activeTab = 'general';
  isLoading = signal(false);
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  settings: any = {
    trust_name: 'Ar Rahman Trust',
    reg_number: '04/16/2020',
    upi_id: 'fuzailahmed536l@okaxis',
    payee_name: 'Ar Rahman Trust',
    contact_phone: '+91 80156 65648',
    contact_email: 'arrahmantrust@gmail.com',
    trust_address: '112, Small Mosque Street, Pernambut, Vellore District, Tamil Nadu, India',
    banner_announcement: 'Welcome to Ar Rahman Trust. Serving Pernambut and surrounding rural villages.'
  };

  profileData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  activityLogs = signal<any[]>([]);

  constructor(
    private apiService: ApiService, 
    public authService: AuthService,
    public autoLogoutService: AutoLogoutService
  ) {}

  onTimeoutChange(minutes: any): void {
    const num = Number(minutes);
    if (!isNaN(num)) {
      this.autoLogoutService.setTimeoutMinutes(num);
      this.successMessage.set(`Session inactivity timeout updated to ${num} minutes.`);
      setTimeout(() => this.successMessage.set(null), 4000);
    }
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.apiService.getSettings().subscribe({
      next: (res) => {
        if (res.success && res.settings) {
          this.settings = { ...this.settings, ...res.settings };
        }
      }
    });
  }

  saveSettings(): void {
    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.apiService.updateSettings(this.settings).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Trust configuration settings saved successfully!');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to save settings.');
      }
    });
  }

  updatePassword(): void {
    if (this.profileData.newPassword !== this.profileData.confirmPassword) {
      this.errorMessage.set('New passwords do not match.');
      return;
    }

    this.isSubmitting.set(true);
    const fd = new FormData();
    fd.append('currentPassword', this.profileData.currentPassword);
    fd.append('newPassword', this.profileData.newPassword);

    this.authService.updateProfile(fd).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Password updated successfully!');
        this.profileData = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to update password.');
      }
    });
  }

  loadLogs(): void {
    this.apiService.getActivityLogs().subscribe({
      next: (res) => {
        if (res.success) {
          this.activityLogs.set(res.logs || []);
        }
      }
    });
  }
}
