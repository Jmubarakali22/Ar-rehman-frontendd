import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Volunteer } from '../../core/models/models';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="volunteers-page">
      <!-- Header -->
      <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold mb-1" style="color: #0F3D63;">Volunteers & Community Members</h2>
          <p class="text-muted small mb-0">Review sign-ups, approve active members, and coordinate field workers.</p>
        </div>
        <div class="flex-shrink-0">
          <button class="btn btn-trust-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-person-plus me-1"></i> Register Volunteer
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="admin-card p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search by name, phone, occupation..." 
                [(ngModel)]="searchQuery" 
                (keyup)="filterVolunteers()"
              >
            </div>
          </div>
          <div class="col-8 col-md-4">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="filterVolunteers()">
              <option value="">All Statuses</option>
              <option value="approved">Approved Active Volunteers</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div class="col-4 col-md-2 d-grid">
            <button class="btn btn-trust-outline" (click)="resetFilters()">Reset</button>
          </div>
        </div>
      </div>

      <!-- Volunteers Table -->
      <div class="admin-card mb-4">
        <div class="table-responsive admin-table-scroll">
          <table class="table admin-table mb-0 align-middle" style="min-width: 820px;">
            <thead class="sticky-top bg-light" style="top: 0; z-index: 5; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <tr>
                <th style="min-width: 140px;">Volunteer Name</th>
                <th style="min-width: 130px;">Phone & Contact</th>
                <th style="min-width: 150px;">Address / Location</th>
                <th style="min-width: 140px;">Occupation / Skills</th>
                <th style="min-width: 110px;">Availability</th>
                <th style="min-width: 100px;">Status</th>
                <th class="text-end" style="min-width: 130px; white-space: nowrap;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading()) {
                <tr>
                  <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              } @else {
                @for (v of filteredVolunteers(); track v.id) {
                  <tr>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="avatar-sm rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                          {{ v.name.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <div class="fw-bold text-dark">{{ v.name }}</div>
                          <div class="small text-muted">{{ v.email || 'No email' }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a [href]="'tel:' + v.phone" class="text-decoration-none fw-semibold text-dark">
                        <i class="bi bi-telephone-fill text-success me-1"></i> {{ v.phone }}
                      </a>
                    </td>
                    <td>{{ v.address || 'Pernambut' }}</td>
                    <td>
                      <span class="badge bg-light text-dark border">{{ v.occupation || 'Volunteer' }}</span>
                    </td>
                    <td class="small">{{ v.availability }}</td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'badge-soft-success': v.status === 'approved',
                        'badge-soft-warning': v.status === 'pending',
                        'badge-soft-danger': v.status === 'rejected'
                      }">
                        {{ v.status | uppercase }}
                      </span>
                    </td>
                    <td class="text-end" style="min-width: 130px; white-space: nowrap;">
                      <div class="btn-group btn-group-sm">
                        @if (v.status !== 'approved') {
                          <button class="btn btn-outline-success" title="Approve Volunteer" (click)="updateStatus(v.id, 'approved')">
                            <i class="bi bi-check-lg"></i>
                          </button>
                        }
                        @if (v.status !== 'rejected') {
                          <button class="btn btn-outline-warning" title="Reject / Deactivate" (click)="updateStatus(v.id, 'rejected')">
                            <i class="bi bi-x-lg"></i>
                          </button>
                        }
                        <button class="btn btn-outline-danger" title="Delete" (click)="deleteVolunteer(v.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="text-center py-5 text-muted">No volunteers found matching your query.</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- REGISTER MODAL -->
    @if (showModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header" style="background-color: #0F3D63; color: #fff;">
              <h5 class="modal-title fw-bold">Register Volunteer</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showModal.set(false)"></button>
            </div>
            <div class="modal-body p-4">
              <form (ngSubmit)="saveVolunteer()">
                <div class="mb-3">
                  <label class="form-label small fw-bold">Full Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.name" name="name" required>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label small fw-bold">Phone Number *</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.phone" name="phone" required>
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-bold">Email</label>
                    <input type="email" class="form-control" [(ngModel)]="formData.email" name="email">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Address / Village</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.address" name="address" placeholder="e.g. Small Mosque St, Pernambut">
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label small fw-bold">Occupation / Profession</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.occupation" name="occupation">
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-bold">Availability</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.availability" name="availability" placeholder="e.g. Weekends, Sunday Camps">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Notes</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="formData.notes" name="notes"></textarea>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-light" (click)="showModal.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-trust-primary" [disabled]="isSubmitting()">
                    {{ isSubmitting() ? 'Saving...' : 'Register' }}
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
export class VolunteersComponent implements OnInit {
  isLoading = signal(true);
  isSubmitting = signal(false);
  volunteers = signal<Volunteer[]>([]);
  filteredVolunteers = signal<Volunteer[]>([]);

  searchQuery = '';
  statusFilter = '';

  showModal = signal(false);
  formData: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadVolunteers();
  }

  loadVolunteers(): void {
    this.isLoading.set(true);
    this.apiService.getVolunteers().subscribe({
      next: (res) => {
        if (res.success) {
          this.volunteers.set(res.data);
          this.filterVolunteers();
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  filterVolunteers(): void {
    let list = this.volunteers();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(v => v.name.toLowerCase().includes(q) || v.phone.includes(q) || (v.occupation && v.occupation.toLowerCase().includes(q)));
    }
    if (this.statusFilter) {
      list = list.filter(v => v.status === this.statusFilter);
    }
    this.filteredVolunteers.set(list);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.filterVolunteers();
  }

  openAddModal(): void {
    this.formData = {
      name: '',
      phone: '',
      email: '',
      address: '',
      occupation: '',
      availability: 'Weekends & Holidays',
      status: 'approved',
      notes: ''
    };
    this.showModal.set(true);
  }

  saveVolunteer(): void {
    this.isSubmitting.set(true);
    this.apiService.createVolunteer(this.formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showModal.set(false);
        this.loadVolunteers();
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  updateStatus(id: number, status: string): void {
    this.apiService.updateVolunteerStatus(id, status).subscribe({
      next: () => this.loadVolunteers()
    });
  }

  deleteVolunteer(id: number): void {
    if (confirm('Are you sure you want to delete this volunteer?')) {
      this.apiService.deleteVolunteer(id).subscribe({
        next: () => this.loadVolunteers()
      });
    }
  }
}
