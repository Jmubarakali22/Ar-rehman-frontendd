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
          <h2 class="h4 fw-bold mb-1" style="color: #0F3D63;">Our Causes</h2>
          <p class="text-muted small mb-0">Small acts, when multiplied by millions of people, can transform the world.</p>
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
          @for (item of filteredCauses(); track item.id; let i = $index) {
            <div class="col-md-6 col-xl-4">
              <div class="admin-card h-100 d-flex flex-column overflow-hidden">
                <!-- Cause Image -->
                <div class="position-relative" style="height: 190px; background: #e2e8f0;">
                  <img 
                    [src]="item.image_url || 'https://ik.imagekit.io/baaidzoik/assets/causes/food_dist.png'" 
                    [alt]="item.title"
                    class="w-100 h-100 object-fit-cover"
                  >
                  <span class="badge position-absolute top-0 start-0 m-2" [ngClass]="item.status === 'active' ? 'bg-success' : 'bg-secondary'">
                    {{ item.status | uppercase }}
                  </span>
                  <span class="badge position-absolute bottom-0 end-0 m-2 font-monospace px-2.5 py-1 text-white shadow-sm" style="background: rgba(15, 61, 99, 0.88); font-size: 13px; font-weight: 700; border-radius: 6px; letter-spacing: 0.5px;">
                    0{{ i + 1 }}
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
                  <p class="small text-muted flex-grow-1 mb-3">
                    {{ item.description }}
                  </p>

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
                  <input type="text" class="form-control" [(ngModel)]="formData.title" name="title" required placeholder="e.g. Monthly Ration Kit">
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

                <!-- IMAGE SELECTION: LOCAL UPLOAD (to ImageKit /assets/causes/) or URL -->
                <div class="mb-3 p-3 bg-light rounded border">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label small fw-bold mb-0">
                      <i class="bi bi-image me-1 text-primary"></i> Cause Photo (ImageKit: /assets/causes/)
                    </label>
                    <div class="btn-group btn-group-sm" role="group">
                      <button 
                        type="button" 
                        class="btn" 
                        [class.btn-primary]="imageSourceMode === 'upload'" 
                        [class.btn-outline-secondary]="imageSourceMode !== 'upload'"
                        (click)="imageSourceMode = 'upload'"
                      >
                        <i class="bi bi-cloud-arrow-up me-1"></i> Upload File
                      </button>
                      <button 
                        type="button" 
                        class="btn" 
                        [class.btn-primary]="imageSourceMode === 'url'" 
                        [class.btn-outline-secondary]="imageSourceMode !== 'url'"
                        (click)="imageSourceMode = 'url'"
                      >
                        <i class="bi bi-link-45deg me-1"></i> Image URL
                      </button>
                    </div>
                  </div>

                  @if (imageSourceMode === 'upload') {
                    <div class="upload-dropzone text-center p-3 border border-2 border-dashed rounded bg-white">
                      <input 
                        type="file" 
                        id="causeFileInput" 
                        class="d-none" 
                        accept="image/*"
                        (change)="onFileSelected($event)"
                        #fileInput
                      >

                      @if (filePreviewUrl) {
                        <div class="preview-container position-relative d-inline-block">
                          <img [src]="filePreviewUrl" alt="Upload preview" class="rounded shadow-sm mb-2" style="max-height: 140px; max-width: 100%; object-fit: cover;">
                          <button 
                            type="button" 
                            class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-1 lh-1"
                            (click)="clearSelectedFile(fileInput)"
                            title="Remove selected image"
                          >
                            <i class="bi bi-x-lg"></i>
                          </button>
                        </div>
                        <div class="small text-muted">
                          <strong>{{ selectedFileName || 'Selected Photo' }}</strong>
                          @if (selectedFileSize) { <span> ({{ selectedFileSize }})</span> }
                        </div>
                        <div class="mt-2">
                          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="fileInput.click()">
                            <i class="bi bi-arrow-repeat me-1"></i> Change File
                          </button>
                        </div>
                      } @else {
                        <div class="py-2 cursor-pointer" (click)="fileInput.click()">
                          <i class="bi bi-cloud-arrow-up text-primary fs-2 d-block mb-1"></i>
                          <div class="fw-semibold small">Click to choose photo from local computer</div>
                          <div class="text-muted" style="font-size: 11px;">PNG, JPG, JPEG, WEBP up to 10MB</div>
                        </div>
                      }
                    </div>
                    <div class="form-text small text-muted mt-1">
                      <i class="bi bi-shield-check text-success me-1"></i>
                      Local photos will be automatically stored in <code>https://ik.imagekit.io/baaidzoik/assets/causes/</code>
                    </div>
                  } @else {
                    <div>
                      <input 
                        type="url" 
                        class="form-control" 
                        [(ngModel)]="formData.image_url" 
                        name="image_url" 
                        placeholder="https://ik.imagekit.io/baaidzoik/assets/causes/..."
                      >
                      <div class="form-text small text-muted mt-1">
                        Direct ImageKit link or hosted image URL.
                      </div>
                      @if (formData.image_url) {
                        <div class="mt-2">
                          <img [src]="formData.image_url" alt="Preview" class="rounded border" style="height: 90px; width: 140px; object-fit: cover;">
                        </div>
                      }
                    </div>
                  }
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-bold">Description *</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="formData.description" name="description" required placeholder="Describe this charitable cause..."></textarea>
                </div>
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" id="featuredCheck" [(ngModel)]="formData.featured" name="featured">
                  <label class="form-check-label small" for="featuredCheck">
                    Feature on Homepage Carousel & Banner
                  </label>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-light" (click)="showModal.set(false)" [disabled]="isSubmitting()">Cancel</button>
                  <button type="submit" class="btn btn-trust-primary" [disabled]="isSubmitting()">
                    @if (isSubmitting()) {
                      <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                      <span>Saving...</span>
                    } @else {
                      <span>Save Cause</span>
                    }
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
    .cursor-pointer {
      cursor: pointer;
    }
    .upload-dropzone {
      transition: all 0.2s ease;
    }
    .upload-dropzone:hover {
      background-color: #f8fafc !important;
      border-color: #0F3D63 !important;
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

  // Image Upload state
  selectedFile: File | null = null;
  selectedFileName = '';
  selectedFileSize = '';
  filePreviewUrl: string | null = null;
  imageSourceMode: 'upload' | 'url' = 'upload';

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

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.selectedFileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearSelectedFile(inputElem?: HTMLInputElement): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.filePreviewUrl = null;
    if (inputElem) {
      inputElem.value = '';
    }
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.filePreviewUrl = null;
    this.imageSourceMode = 'upload';
    this.formData = {
      title: '',
      category: 'Community Relief',
      description: '',
      image_url: '',
      status: 'active',
      featured: false
    };
    this.showModal.set(true);
  }

  openEditModal(item: Cause): void {
    this.isEditing.set(true);
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.filePreviewUrl = item.image_url || null;
    this.imageSourceMode = item.image_url ? 'url' : 'upload';
    this.formData = { ...item };
    this.showModal.set(true);
  }

  saveCause(): void {
    if (!this.formData.title || !this.formData.category || !this.formData.description) {
      alert('Please fill in Title, Category, and Description.');
      return;
    }

    this.isSubmitting.set(true);

    const fd = new FormData();
    fd.append('title', this.formData.title);
    fd.append('category', this.formData.category);
    fd.append('description', this.formData.description);
    fd.append('status', this.formData.status || 'active');
    fd.append('featured', this.formData.featured ? '1' : '0');
    fd.append('folder', '/assets/causes');

    if (this.imageSourceMode === 'upload' && this.selectedFile) {
      fd.append('image', this.selectedFile);
    } else if (this.formData.image_url) {
      fd.append('image_url', this.formData.image_url);
    }

    if (this.isEditing()) {
      this.apiService.updateCause(this.formData.id, fd).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showModal.set(false);
          this.loadCauses();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert('Failed to update cause: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.apiService.createCause(fd).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showModal.set(false);
          this.loadCauses();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert('Failed to create cause: ' + (err.error?.message || err.message));
        }
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
