import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Cause } from '../../core/models/models';

@Component({
  selector: 'app-causes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="causes-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold mb-1" style="color: #0F3D63;">Causes & Programs</h2>
          <p class="text-muted small mb-0">Manage community initiatives, target funding goals, and relief drives.</p>
        </div>
        <div class="flex-shrink-0">
          <button class="btn btn-trust-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-plus-lg me-1"></i> Add New Cause
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="admin-card p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search causes by title or category..." 
                [(ngModel)]="searchQuery" 
                (keyup)="filterCauses()"
              >
            </div>
          </div>
          <div class="col-8 col-md-4">
            <select class="form-select" [(ngModel)]="statusFilter" (change)="filterCauses()">
              <option value="">All Statuses</option>
              <option value="active">Active Causes</option>
              <option value="completed">Completed Projects</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <div class="col-4 col-md-2 d-grid">
            <button class="btn btn-trust-outline" (click)="resetFilters()">Reset</button>
          </div>
        </div>
      </div>

      <!-- Causes Grid -->
      @if (isLoading()) {
        <div class="spinner-container">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      } @else {
        <div class="row g-4 mb-2">
          @for (item of filteredCauses(); track item.id) {
            <div class="col-md-6 col-xl-4">
              <div class="admin-card h-100 d-flex flex-column overflow-hidden">
                <!-- Cause Image -->
                <div class="position-relative" style="height: 180px; background: #e2e8f0;">
                  <img 
                    [src]="item.image_url || 'https://ik.imagekit.io/baaidzoik/assets/gallery/AR_food_dist.png'" 
                    [alt]="item.title"
                    class="w-100 h-100 object-fit-cover"
                  >
                  <span class="badge position-absolute top-0 start-0 m-2" [ngClass]="item.status === 'active' ? 'bg-success' : 'bg-secondary'">
                    {{ item.status | uppercase }}
                  </span>
                  @if (item.featured) {
                    <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">
                      <i class="bi bi-star-fill me-1"></i> Featured
                    </span>
                  }
                </div>

                <!-- Cause Content -->
                <div class="p-3 flex-grow-1 d-flex flex-column">
                  <div class="small fw-bold text-uppercase text-muted mb-1">{{ item.category }}</div>
                  <h5 class="fw-bold fs-6 mb-2 text-dark">{{ item.title }}</h5>
                  <p class="small text-muted flex-grow-1 mb-3 text-truncate-3">
                    {{ item.description }}
                  </p>

                  <!-- Progress Bar -->
                  <div class="mb-3">
                    <div class="d-flex justify-content-between small fw-bold mb-1">
                      <span class="text-success">₹{{ item.raised_amount | number:'1.0-0' }}</span>
                      <span class="text-muted">Target: ₹{{ item.target_amount | number:'1.0-0' }}</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div 
                        class="progress-bar bg-success" 
                        role="progressbar" 
                        [style.width.%]="getProgress(item)"
                      ></div>
                    </div>
                    <div class="text-end small text-muted mt-1">{{ getProgress(item) | number:'1.0-0' }}% Funded</div>
                  </div>

                  <!-- Actions -->
                  <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
                    <button class="btn btn-sm btn-outline-primary" (click)="openEditModal(item)">
                      <i class="bi bi-pencil me-1"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteCause(item.id)">
                      <i class="bi bi-trash me-1"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12 text-center py-5 text-muted">
              No causes found matching your search.
            </div>
          }
        </div>
      }
    </div>

    <!-- ADD / EDIT MODAL -->
    @if (showModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow">
            <div class="modal-header" style="background-color: #0F3D63; color: #fff;">
              <h5 class="modal-title fw-bold">
                {{ isEditing() ? 'Edit Cause' : 'Create New Cause / Program' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="showModal.set(false)"></button>
            </div>
            <div class="modal-body p-4">
              <form (ngSubmit)="saveCause()">
                <div class="mb-3">
                  <label class="form-label small fw-bold">Cause Title *</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.title" name="title" required>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label small fw-bold">Category *</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.category" name="category" placeholder="e.g. Healthcare, Food, Education" required>
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-bold">Status</label>
                    <select class="form-select" [(ngModel)]="formData.status" name="status">
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label small fw-bold">Target Amount (₹)</label>
                    <input type="number" class="form-control" [(ngModel)]="formData.target_amount" name="target_amount">
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-bold">Raised Amount (₹)</label>
                    <input type="number" class="form-control" [(ngModel)]="formData.raised_amount" name="raised_amount">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Image URL or ImageKit link</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.image_url" name="image_url" placeholder="https://ik.imagekit.io/baaidzoik/assets/...">
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Description *</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="formData.description" name="description" required></textarea>
                </div>
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" id="featuredCheck" [(ngModel)]="formData.featured" name="featured">
                  <label class="form-check-label small" for="featuredCheck">
                    Feature on Homepage Carousel & Banner
                  </label>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-light" (click)="showModal.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-trust-primary" [disabled]="isSubmitting()">
                    {{ isSubmitting() ? 'Saving...' : 'Save Cause' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .text-truncate-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CausesComponent implements OnInit {
  isLoading = signal(true);
  isSubmitting = signal(false);
  causes = signal<Cause[]>([]);
  filteredCauses = signal<Cause[]>([]);

  searchQuery = '';
  statusFilter = '';

  showModal = signal(false);
  isEditing = signal(false);
  formData: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCauses();
  }

  loadCauses(): void {
    this.isLoading.set(true);
    this.apiService.getCauses().subscribe({
      next: (res) => {
        if (res.success) {
          this.causes.set(res.data);
          this.filterCauses();
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  filterCauses(): void {
    let list = this.causes();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    if (this.statusFilter) {
      list = list.filter(c => c.status === this.statusFilter);
    }
    this.filteredCauses.set(list);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.filterCauses();
  }

  getProgress(item: Cause): number {
    if (!item.target_amount || item.target_amount <= 0) return 100;
    const pct = (item.raised_amount / item.target_amount) * 100;
    return Math.min(100, Math.max(0, pct));
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.formData = {
      title: '',
      category: 'Community Relief',
      description: '',
      target_amount: 100000,
      raised_amount: 0,
      image_url: 'https://ik.imagekit.io/baaidzoik/assets/gallery/AR_food_dist.png',
      status: 'active',
      featured: false
    };
    this.showModal.set(true);
  }

  openEditModal(item: Cause): void {
    this.isEditing.set(true);
    this.formData = { ...item };
    this.showModal.set(true);
  }

  saveCause(): void {
    this.isSubmitting.set(true);
    if (this.isEditing()) {
      this.apiService.updateCause(this.formData.id, this.formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showModal.set(false);
          this.loadCauses();
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.apiService.createCause(this.formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showModal.set(false);
          this.loadCauses();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  deleteCause(id: number): void {
    if (confirm('Are you sure you want to delete this cause?')) {
      this.apiService.deleteCause(id).subscribe({
        next: () => this.loadCauses()
      });
    }
  }
}
