import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ContactInquiry } from '../../core/models/models';

@Component({
  selector: 'app-inquiries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inquiries-page">
      <!-- Header -->
      <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold mb-1" style="color: #0F3D63;">Contact Inquiries & Feedback</h2>
          <p class="text-muted small mb-0">Messages and requests submitted through the official website contact portal.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" (click)="loadInquiries()">
            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="admin-card p-3 mb-4">
        <div class="row g-2">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search messages by name, email, subject..." 
                [(ngModel)]="searchQuery" 
                (keyup)="filterInquiries()"
              >
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="filterInquiries()">
              <option value="">All Inquiries</option>
              <option value="unread">Unread New Messages</option>
              <option value="read">Read Messages</option>
              <option value="replied">Replied</option>
            </select>
          </div>
          <div class="col-md-2 d-grid">
            <button class="btn btn-trust-outline" (click)="resetFilters()">Reset</button>
          </div>
        </div>
      </div>

      <!-- Inquiries List -->
      @if (isLoading()) {
        <div class="spinner-container">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      } @else {
        <div class="admin-table-scroll pe-1 mb-4" style="max-height: 560px; overflow-y: auto; overflow-x: hidden;">
          <div class="row g-3">
            @for (inq of filteredInquiries(); track inq.id) {
              <div class="col-12">
                <div class="admin-card p-3" [class.border-start]="inq.status === 'unread'" [style.border-left-width]="inq.status === 'unread' ? '4px' : '1px'" [style.border-left-color]="inq.status === 'unread' ? '#dc3545' : '#e5e7eb'">
                  <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge" [ngClass]="{
                        'badge-soft-danger': inq.status === 'unread',
                        'badge-soft-info': inq.status === 'read',
                        'badge-soft-success': inq.status === 'replied'
                      }">
                        {{ inq.status | uppercase }}
                      </span>
                      <h6 class="fw-bold mb-0 text-dark">{{ inq.subject || 'General Inquiry' }}</h6>
                    </div>
                    <div class="small text-muted">{{ inq.created_at | date:'medium' }}</div>
                  </div>

                  <div class="small text-secondary mb-2">
                    From: <strong class="text-dark">{{ inq.name }}</strong> &bull;
                    <a [href]="'mailto:' + inq.email" class="text-primary text-decoration-none me-2">
                      <i class="bi bi-envelope me-1"></i>{{ inq.email }}
                    </a>
                    @if (inq.phone) {
                      &bull; <a [href]="'tel:' + inq.phone" class="text-success text-decoration-none">
                        <i class="bi bi-telephone me-1"></i>{{ inq.phone }}
                      </a>
                    }
                  </div>

                  <p class="small text-dark bg-light p-3 rounded-2 mb-2 border">
                    {{ inq.message }}
                  </p>

                  @if (inq.admin_notes) {
                    <div class="small text-muted mb-2 ps-2 border-start border-2 border-info">
                      <strong>Admin Note:</strong> {{ inq.admin_notes }}
                    </div>
                  }

                  <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                    <div class="d-flex gap-2">
                      @if (inq.status === 'unread') {
                        <button class="btn btn-sm btn-outline-secondary" (click)="updateStatus(inq.id, 'read')">
                          <i class="bi bi-envelope-open me-1"></i> Mark Read
                        </button>
                      }
                      @if (inq.status !== 'replied') {
                        <button class="btn btn-sm btn-outline-success" (click)="updateStatus(inq.id, 'replied')">
                          <i class="bi bi-check2-all me-1"></i> Mark Replied
                        </button>
                      }
                    </div>
                    <div class="d-flex gap-2">
                      <a [href]="'mailto:' + inq.email + '?subject=Re: ' + (inq.subject || 'Inquiry regarding Ar Rahman Trust')" class="btn btn-sm btn-trust-primary">
                        <i class="bi bi-reply-fill me-1"></i> Reply via Email
                      </a>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteInquiry(inq.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="col-12 text-center py-5 text-muted">
                No inquiries found in this view.
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class InquiriesComponent implements OnInit {
  isLoading = signal(true);
  inquiries = signal<ContactInquiry[]>([]);
  filteredInquiries = signal<ContactInquiry[]>([]);

  searchQuery = '';
  statusFilter = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadInquiries();
  }

  loadInquiries(): void {
    this.isLoading.set(true);
    this.apiService.getContacts().subscribe({
      next: (res) => {
        if (res.success) {
          this.inquiries.set(res.data);
          this.filterInquiries();
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  filterInquiries(): void {
    let list = this.inquiries();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || (i.subject && i.subject.toLowerCase().includes(q)) || i.message.toLowerCase().includes(q));
    }
    if (this.statusFilter) {
      list = list.filter(i => i.status === this.statusFilter);
    }
    this.filteredInquiries.set(list);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.filterInquiries();
  }

  updateStatus(id: number, status: string): void {
    this.apiService.updateContactStatus(id, status).subscribe({
      next: () => this.loadInquiries()
    });
  }

  deleteInquiry(id: number): void {
    if (confirm('Are you sure you want to delete this message?')) {
      this.apiService.deleteContact(id).subscribe({
        next: () => this.loadInquiries()
      });
    }
  }
}
