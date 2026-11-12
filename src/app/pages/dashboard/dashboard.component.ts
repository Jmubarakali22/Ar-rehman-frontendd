import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats, Donation } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <!-- Welcome Banner -->
      <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold mb-1" style="color: #0F3D63;">
            Ar Rahman Trust Overview
          </h2>
          <p class="text-muted small mb-0">
            Charity Operations &bull; Pernambut & Surrounding Rural Villages (Reg: 04/16/2020)
          </p>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm" (click)="loadDashboard()">
            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <a routerLink="/donations" class="btn btn-trust-primary btn-sm">
            <i class="bi bi-plus-lg me-1"></i> New Donation
          </a>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="spinner-container">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      } @else {
        <!-- Metric Cards Grid -->
        <div class="row g-3 mb-4">
          <!-- Total Donations -->
          <div class="col-sm-6 col-xl-3">
            <div class="stat-card">
              <div class="stat-icon-wrapper" style="background: #e0f2fe; color: #0284c7;">
                <i class="bi bi-wallet2"></i>
              </div>
              <div>
                <div class="stat-label">Total Donations</div>
                <div class="stat-value">₹{{ stats()?.totalDonationsAmount | number:'1.0-0' }}</div>
                <div class="small text-muted mt-1">{{ stats()?.totalDonationsCount }} donations received</div>
              </div>
            </div>
          </div>

          <!-- Total Zakat -->
          <div class="col-sm-6 col-xl-3">
            <div class="stat-card">
              <div class="stat-icon-wrapper" style="background: #dcfce7; color: #16a34a;">
                <i class="bi bi-shield-check"></i>
              </div>
              <div>
                <div class="stat-label">Zakat Collected</div>
                <div class="stat-value text-success">₹{{ stats()?.totalZakat | number:'1.0-0' }}</div>
                <div class="small text-muted mt-1">Dedicated Zakat Fund</div>
              </div>
            </div>
          </div>

          <!-- Total Sadaqah -->
          <div class="col-sm-6 col-xl-3">
            <div class="stat-card">
              <div class="stat-icon-wrapper" style="background: #fef3c7; color: #d97706;">
                <i class="bi bi-heart-fill"></i>
              </div>
              <div>
                <div class="stat-label">Sadaqah Collected</div>
                <div class="stat-value" style="color: #d97706;">₹{{ stats()?.totalSadaqah | number:'1.0-0' }}</div>
                <div class="small text-muted mt-1">General Sadaqah & Aid</div>
              </div>
            </div>
          </div>

          <!-- Active Causes -->
          <div class="col-sm-6 col-xl-3">
            <div class="stat-card">
              <div class="stat-icon-wrapper" style="background: #f3e8ff; color: #9333ea;">
                <i class="bi bi-diagram-3-fill"></i>
              </div>
              <div>
                <div class="stat-label">Active Causes</div>
                <div class="stat-value" style="color: #9333ea;">{{ stats()?.activeCauses }} / {{ stats()?.totalCauses }}</div>
                <div class="small text-muted mt-1">₹{{ stats()?.totalRaised | number:'1.0-0' }} raised</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Secondary Metrics Grid -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="p-3 bg-white rounded-3 border d-flex align-items-center gap-3">
              <i class="bi bi-people text-primary fs-3"></i>
              <div>
                <div class="small text-muted fw-semibold">Volunteers</div>
                <div class="fw-bold fs-5 text-dark">{{ stats()?.totalVolunteers }} Registered</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="p-3 bg-white rounded-3 border d-flex align-items-center gap-3">
              <i class="bi bi-images text-info fs-3"></i>
              <div>
                <div class="small text-muted fw-semibold">Gallery Photos</div>
                <div class="fw-bold fs-5 text-dark">{{ stats()?.totalPhotos }} Photos</div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="p-3 bg-white rounded-3 border d-flex align-items-center gap-3">
              <i class="bi bi-chat-left-dots text-warning fs-3"></i>
              <div>
                <div class="small text-muted fw-semibold">Inquiries</div>
                <div class="fw-bold fs-5 text-dark">
                  {{ stats()?.totalInquiries }} Total
                  @if (stats()?.unreadInquiries) {
                    <span class="badge bg-danger ms-1">{{ stats()?.unreadInquiries }} new</span>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="p-3 bg-white rounded-3 border d-flex align-items-center gap-3">
              <i class="bi bi-clock-history text-secondary fs-3"></i>
              <div>
                <div class="small text-muted fw-semibold">Pending Verifications</div>
                <div class="fw-bold fs-5 text-dark">{{ stats()?.pendingDonationsCount }} items</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Dashboard Split View -->
        <div class="row g-4 mb-4">
          <!-- Recent Donations Table (Recent 5 with Visible Scroller) -->
          <div class="col-lg-8">
            <div class="admin-card h-100 d-flex flex-column">
              <div class="card-header-clean">
                <div class="d-flex align-items-center gap-2">
                  <h5 class="card-title-clean mb-0">
                    <i class="bi bi-clock-history text-primary"></i> Recent Donations
                  </h5>
                  <span class="badge bg-light text-secondary border font-monospace" style="font-size: 11px;">Recent 5</span>
                </div>
                <a routerLink="/donations" class="btn btn-sm btn-link text-decoration-none">View All</a>
              </div>
              <div class="table-responsive recent-donations-scroll flex-grow-1">
                <table class="table admin-table mb-0 align-middle">
                  <thead class="sticky-top bg-light" style="top: 0; z-index: 5; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <tr>
                      <th style="min-width: 100px;">Receipt #</th>
                      <th style="min-width: 130px;">Donor</th>
                      <th style="min-width: 80px;">Type</th>
                      <th style="min-width: 90px;">Amount</th>
                      <th style="min-width: 70px;">Method</th>
                      <th style="min-width: 80px;">Status</th>
                      <th style="min-width: 85px;">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of recentDonations().slice(0, 5); track item.id) {
                      <tr>
                        <td>
                          <span class="badge bg-light text-dark border font-monospace px-1.5 py-0.5" style="font-size: 11px;">
                            {{ formatReceiptNo(item) }}
                          </span>
                        </td>
                        <td>
                          <div class="fw-semibold text-dark text-truncate" style="max-width: 135px;" [title]="item.donor_name">{{ item.donor_name }}</div>
                          <div class="small text-muted font-monospace" style="font-size: 11px;">{{ item.donor_phone }}</div>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-success': item.donation_type === 'zakat' || item.donation_type === 'zakath',
                            'bg-primary': item.donation_type === 'sadaqah',
                            'bg-info text-dark': item.donation_type === 'monthly_donation'
                          }" style="font-size: 10px; padding: 2.5px 5.5px;">
                            {{ item.donation_type === 'monthly_donation' ? 'MONTHLY' : (item.donation_type === 'zakat' ? 'ZAKATH' : (item.donation_type | uppercase)) }}
                          </span>
                        </td>
                        <td class="fw-bold text-dark text-nowrap">₹{{ item.amount | number:'1.2-2' }}</td>
                        <td>
                          <span class="badge bg-secondary text-uppercase" style="font-size: 10px; padding: 2.5px 5px;">{{ item.payment_method }}</span>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'badge-soft-success': item.status === 'verified' || item.status === 'completed',
                            'badge-soft-warning': item.status === 'pending',
                            'badge-soft-danger': item.status === 'failed'
                          }" style="font-size: 10px; padding: 2.5px 5.5px;">
                            {{ item.status }}
                          </span>
                        </td>
                        <td class="small text-muted text-nowrap" style="font-size: 11.5px;">{{ item.created_at | date:'shortDate' }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="7" class="text-center py-4 text-muted">No donations recorded yet.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Quick Navigation Hub -->
          <div class="col-lg-4">
            <div class="admin-card h-100 d-flex flex-column">
              <div class="card-header-clean">
                <h5 class="card-title-clean">
                  <i class="bi bi-lightning-charge-fill text-warning"></i> Quick Management
                </h5>
              </div>
              <div class="p-3 d-grid gap-2 flex-grow-1 align-content-start">
                <a routerLink="/donations" class="btn btn-outline-primary btn-sm text-start d-flex align-items-center justify-content-between">
                  <span><i class="bi bi-receipt me-2"></i> Manage Donations & Receipts</span>
                  <i class="bi bi-chevron-right"></i>
                </a>
                <a routerLink="/causes" class="btn btn-outline-success btn-sm text-start d-flex align-items-center justify-content-between">
                  <span><i class="bi bi-plus-square me-2"></i> Create / Update Cause</span>
                  <i class="bi bi-chevron-right"></i>
                </a>
                <a routerLink="/gallery" class="btn btn-outline-secondary btn-sm text-start d-flex align-items-center justify-content-between">
                  <span><i class="bi bi-camera me-2"></i> Upload Trust Activity Photos</span>
                  <i class="bi bi-chevron-right"></i>
                </a>
                <a routerLink="/inquiries" class="btn btn-outline-info btn-sm text-start d-flex align-items-center justify-content-between">
                  <span><i class="bi bi-inbox me-2"></i> Review Website Messages</span>
                  <i class="bi bi-chevron-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .recent-donations-scroll {
      max-height: 205px;
      overflow-y: auto;
      overflow-x: auto;
      scrollbar-gutter: stable;
    }
    .recent-donations-scroll::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .recent-donations-scroll::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    .recent-donations-scroll::-webkit-scrollbar-thumb {
      background: #0f3d63;
      border-radius: 4px;
    }
    .recent-donations-scroll::-webkit-scrollbar-thumb:hover {
      background: #16568a;
    }
  `]
})
export class DashboardComponent implements OnInit {
  isLoading = signal(true);
  stats = signal<DashboardStats | null>(null);
  recentDonations = signal<Donation[]>([]);
  typeBreakdown = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  formatReceiptNo(d: any): string {
    if (!d) return 'ART20260001';
    if (d.receipt_number) {
      return String(d.receipt_number).replace(/^ART-(\d{4})-?(\d+)/i, (_match: string, y: string, seq: string) => {
        return `ART${y}${seq.padStart(4, '0')}`;
      });
    }
    const year = new Date().getFullYear();
    return `ART${year}${String(d.id || 1).padStart(4, '0')}`;
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.apiService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats.set(res.stats);
          this.recentDonations.set(res.recentDonations || []);
          this.typeBreakdown.set(res.typeBreakdown || []);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard stats:', err);
        this.isLoading.set(false);
      }
    });
  }
}
