import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AutoLogoutService } from '../../core/services/auto-logout.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-wrapper d-flex min-vh-100">
      <!-- Sidebar -->
      <aside class="admin-sidebar" [class.collapsed]="isSidebarCollapsed()">
        <!-- Brand Header -->
        <div class="sidebar-brand d-flex align-items-center gap-3 p-3">
          <img 
            src="https://ik.imagekit.io/baaidzoik/assets/header-logo/ar_logo_1.png" 
            alt="Ar Rahman Trust" 
            class="brand-logo"
          >
          <div class="brand-text" *ngIf="!isSidebarCollapsed()">
            <div class="fw-bold brand-title">Ar Rahman</div>
            <div class="brand-subtitle">Charity Admin</div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="sidebar-nav px-2 py-3">
          <div class="nav-section-title px-3 mb-2" *ngIf="!isSidebarCollapsed()">
            CORE MANAGEMENT
          </div>

          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item-link">
            <i class="bi bi-speedometer2"></i>
            <span *ngIf="!isSidebarCollapsed()">Dashboard</span>
          </a>

          <a routerLink="/donations" routerLinkActive="active" class="nav-item-link">
            <i class="bi bi-cash-coin"></i>
            <span *ngIf="!isSidebarCollapsed()">Donations</span>
          </a>

          <a routerLink="/causes" routerLinkActive="active" class="nav-item-link">
            <i class="bi bi-heart-pulse-fill"></i>
            <span *ngIf="!isSidebarCollapsed()">Causes / Programs</span>
          </a>

          <a routerLink="/gallery" routerLinkActive="active" class="nav-item-link">
            <i class="bi bi-images"></i>
            <span *ngIf="!isSidebarCollapsed()">Gallery Photos</span>
          </a>

          <div class="nav-section-title px-3 mt-4 mb-2" *ngIf="!isSidebarCollapsed()">
            COMMUNITY & ENGAGEMENT
          </div>

          <a routerLink="/volunteers" routerLinkActive="active" class="nav-item-link">
            <i class="bi bi-people-fill"></i>
            <span *ngIf="!isSidebarCollapsed()">Volunteers</span>
          </a>

          <a routerLink="/inquiries" routerLinkActive="active" class="nav-item-link">
            <i class="bi bi-envelope-paper-fill"></i>
            <span *ngIf="!isSidebarCollapsed()">Contact Inquiries</span>
          </a>

          <div class="nav-section-title px-3 mt-4 mb-2" *ngIf="!isSidebarCollapsed()">
            CONFIGURATION
          </div>

          <a routerLink="/settings" routerLinkActive="active" class="nav-item-link">
            <i class="bi bi-gear-fill"></i>
            <span *ngIf="!isSidebarCollapsed()">Trust Settings</span>
          </a>

          <a routerLink="/admins" routerLinkActive="active" class="nav-item-link" *ngIf="authService.isSuperAdmin()">
            <i class="bi bi-shield-lock-fill"></i>
            <span *ngIf="!isSidebarCollapsed()">Admin Accounts</span>
          </a>
        </div>

        <!-- Sidebar Footer Status -->
        <div class="sidebar-footer p-3 mt-auto border-top border-secondary border-opacity-25" *ngIf="!isSidebarCollapsed()">
          <div class="d-flex align-items-center gap-2">
            <span class="status-indicator online"></span>
            <div class="small text-white-50">Charity Reg. No. 04/16/2020</div>
          </div>
        </div>
      </aside>

      <!-- Main Layout Right Side -->
      <div class="admin-main flex-grow-1 d-flex flex-column">
        <!-- Top Navbar -->
        <header class="admin-topbar px-4 py-2 bg-white border-bottom d-flex align-items-center justify-content-between sticky-top">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-light btn-sm toggle-btn border" (click)="toggleSidebar()">
              <i class="bi" [class.bi-list]="!isSidebarCollapsed()" [class.bi-arrow-right]="isSidebarCollapsed()"></i>
            </button>

            <span class="d-none d-md-inline-block fw-semibold text-secondary small">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i> Pernambut, Vellore District
            </span>
          </div>

          <div class="d-flex align-items-center gap-3">
            <!-- View Live Website Link -->
            <a 
              href="https://arrahmantrust.netlify.app/" 
              target="_blank" 
              class="btn btn-outline-success btn-sm rounded-pill px-3 d-flex align-items-center gap-2 fw-semibold"
            >
              <i class="bi bi-globe"></i>
              <span class="d-none d-sm-inline">Live Website</span>
            </a>

            <!-- Quick Add Donation Button -->
            <a routerLink="/donations" class="btn btn-sm text-white rounded-pill px-3 d-flex align-items-center gap-2 fw-semibold" style="background-color: #0F3D63;">
              <i class="bi bi-plus-circle"></i>
              <span class="d-none d-sm-inline">Add Donation</span>
            </a>

            <!-- Profile Info & Logout -->
            <div class="dropdown">
              <div class="d-flex align-items-center gap-2 cursor-pointer" role="button" data-bs-toggle="dropdown">
                <div class="avatar-circle">
                  {{ (authService.currentUser()?.name || 'A').charAt(0).toUpperCase() }}
                </div>
                <div class="d-none d-lg-block text-start">
                  <div class="fw-bold small lh-1 mb-1">{{ authService.currentUser()?.name || 'Admin' }}</div>
                  <span class="badge bg-light text-dark border small py-0 px-1">{{ authService.currentUser()?.role || 'admin' }}</span>
                </div>
              </div>
              <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                <li><h6 class="dropdown-header">{{ authService.currentUser()?.email }}</h6></li>
                <li><a class="dropdown-item" routerLink="/settings"><i class="bi bi-person me-2"></i>My Profile</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger" (click)="authService.logout()"><i class="bi bi-box-arrow-right me-2"></i>Log Out</button></li>
              </ul>
            </div>
          </div>
        </header>

        <!-- Page Body Content -->
        <main class="page-body p-3 p-md-4 flex-grow-1">
          <router-outlet></router-outlet>
        </main>

        <!-- Inactivity Countdown Warning Modal -->
        @if (autoLogoutService.showWarningModal()) {
          <div class="modal fade show d-block" style="background: rgba(10, 39, 64, 0.75); z-index: 1060; backdrop-filter: blur(4px);" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
              <div class="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
                <div class="modal-header border-0 pb-0 pt-4 px-4 bg-light">
                  <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle d-flex align-items-center justify-content-center text-warning" style="width: 48px; height: 48px; background: #fef3c7; font-size: 1.5rem;">
                      <i class="bi bi-clock-history"></i>
                    </div>
                    <div>
                      <h5 class="modal-title fw-bold text-dark mb-0">Inactivity Warning</h5>
                      <div class="text-muted small">Auto-logout protection active</div>
                    </div>
                  </div>
                </div>

                <div class="modal-body p-4 text-center bg-light">
                  <p class="text-secondary small mb-3">
                    You have been inactive. For your security and to safeguard donor records, you will be automatically logged out in:
                  </p>
                  <div class="p-3 rounded-3 bg-white border shadow-sm my-3">
                    <span class="fs-1 fw-bolder text-danger font-monospace">
                      {{ autoLogoutService.countdownSeconds() }}
                    </span>
                    <span class="fs-5 text-danger fw-bold ms-1">s</span>
                    <div class="text-muted small mt-1">Seconds remaining</div>
                  </div>
                  <p class="text-muted small mb-0">
                    Click <strong>"Stay Logged In"</strong> or move your mouse / press any key to continue.
                  </p>
                </div>

                <div class="modal-footer border-0 bg-white p-3 d-flex justify-content-between gap-2">
                  <button type="button" class="btn btn-outline-danger btn-sm px-3 rounded-pill" (click)="autoLogoutService.logoutNow()">
                    <i class="bi bi-box-arrow-right me-1"></i> Log Out Now
                  </button>
                  <button type="button" class="btn text-white btn-sm px-4 rounded-pill fw-semibold" style="background-color: #0F3D63;" (click)="autoLogoutService.stayLoggedIn()">
                    <i class="bi bi-shield-check me-1"></i> Stay Logged In
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-sidebar {
      width: 250px;
      background: #0a2740;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
      flex-shrink: 0;
      min-height: 100vh;
    }
    .admin-sidebar.collapsed {
      width: 72px;
    }
    .brand-logo {
      height: 42px;
      width: 42px;
      object-fit: contain;
      border-radius: 8px;
      background: #ffffff;
      padding: 3px;
    }
    .brand-title {
      font-size: 1rem;
      color: #ffffff;
      letter-spacing: -0.01em;
    }
    .brand-subtitle {
      font-size: 0.72rem;
      color: #94a3b8;
    }
    .nav-section-title {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
    }
    .nav-item-link {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 1rem;
      color: #94a3b8;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.88rem;
      border-radius: 8px;
      margin-bottom: 3px;
      transition: all 0.15s ease;
    }
    .nav-item-link i {
      font-size: 1.15rem;
    }
    .nav-item-link:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
    .nav-item-link.active {
      background: #0F3D63;
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      display: inline-block;
    }
    .avatar-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #0F3D63;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .admin-topbar {
      height: 64px;
      z-index: 100;
    }
  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = signal(false);

  constructor(
    public authService: AuthService,
    public autoLogoutService: AutoLogoutService
  ) {}

  ngOnInit(): void {
    this.autoLogoutService.start();
  }

  ngOnDestroy(): void {
    this.autoLogoutService.stop();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }
}
