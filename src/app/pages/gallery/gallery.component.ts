import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { GalleryItem } from '../../core/models/models';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gallery-page">
      <!-- Top Page Header -->
      <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <div class="d-flex align-items-center gap-2">
            <h2 class="h4 fw-bold mb-0" style="color: #0F3D63;">Gallery Photos</h2>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 small fw-semibold">
              {{ photos().length }} Photos
            </span>
          </div>
          <p class="text-muted small mb-0 mt-1">
            Manage photos, create custom program categories, and upload files directly from your computer or ImageKit.
          </p>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Link to Public Website Gallery-Full -->
          <a 
            href="https://arrahmantrust.netlify.app/gallery-full" 
            target="_blank" 
            class="btn btn-outline-success btn-sm rounded-pill d-flex align-items-center gap-1.5 fw-semibold"
            title="Open Live Netlify Gallery"
          >
            <i class="bi bi-box-arrow-up-right"></i>
            <span>Live Public Gallery</span>
          </a>

          <!-- Add Photo Button -->
          <button class="btn btn-trust-primary btn-sm rounded-pill px-3 shadow-sm" (click)="openAddModal()">
            <i class="bi bi-cloud-arrow-up-fill me-1.5"></i>
            <span>Upload / Add Photo</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="admin-card p-3 mb-4">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <!-- Dynamic Category Filter Pills (Auto-updates with any new category!) -->
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <button 
              type="button"
              class="btn btn-sm rounded-pill category-filter-btn" 
              [ngClass]="activeCategory === '' ? 'btn-navy-active' : 'btn-outline-secondary'"
              (click)="selectCategory('')"
            >
              All ({{ photos().length }})
            </button>

            @for (cat of dynamicCategories(); track cat) {
              <button 
                type="button"
                class="btn btn-sm rounded-pill category-filter-btn d-inline-flex align-items-center gap-1" 
                [ngClass]="activeCategory === cat ? 'btn-navy-active' : 'btn-outline-secondary'"
                (click)="selectCategory(cat)"
              >
                <i [class]="getCategoryIcon(cat)"></i>
                <span>{{ cat }}</span>
                <span class="badge bg-light text-dark rounded-pill py-0 px-1.5 ms-0.5 border" [style.fontSize]="'0.7rem'">
                  {{ countByCategory(cat) }}
                </span>
              </button>
            }

            <!-- Quick Add Category Helper Button -->
            <button 
              type="button" 
              class="btn btn-sm btn-outline-primary rounded-pill d-inline-flex align-items-center gap-1 border-dashed"
              (click)="openAddCategoryModal()"
              title="Create a new gallery category"
            >
              <i class="bi bi-plus-circle-fill"></i>
              <span>+ Category</span>
            </button>
          </div>

          <!-- Search Input -->
          <div class="search-input-wrapper">
            <i class="bi bi-search search-icon text-muted"></i>
            <input 
              type="text" 
              class="form-control form-control-sm search-field" 
              placeholder="Search by title, number or caption..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
            >
            @if (searchQuery) {
              <button class="btn btn-sm clear-btn" (click)="searchQuery = ''; onSearchChange()">
                <i class="bi bi-x-circle-fill text-muted"></i>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="spinner-container">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      } @else {
        <!-- Summary & Pagination Controls Bar -->
        <div class="d-flex justify-content-between align-items-center mb-3 text-muted small flex-wrap gap-2">
          <div>
            Showing <strong>{{ pagedPhotos().length }}</strong> of <strong>{{ filteredPhotos().length }}</strong> matching photos
            @if (activeCategory) {
              <span> in <strong>{{ activeCategory }}</strong></span>
            }
            @if (searchQuery) {
              <span> matching "<em class="text-dark">{{ searchQuery }}</em>"</span>
            }
          </div>
          <div class="d-flex align-items-center gap-2">
            <span>Per page:</span>
            <select class="form-select form-select-sm per-page-select" [(ngModel)]="pageSize" (ngModelChange)="currentPage = 1">
              <option [ngValue]="12">12</option>
              <option [ngValue]="24">24</option>
              <option [ngValue]="48">48</option>
              <option [ngValue]="999">All Photos</option>
            </select>
          </div>
        </div>

        <!-- Photos Grid -->
        <div class="row g-3 mb-4">
          @for (photo of pagedPhotos(); track photo.id) {
            <div class="col-sm-6 col-md-4 col-xl-3">
              <div class="admin-card overflow-hidden h-100 d-flex flex-column photo-card">
                <!-- Image Container with Zoom Trigger -->
                <div class="position-relative photo-thumb-wrapper" (click)="openLightbox(photo)">
                  <img 
                    [src]="resolveImageUrl(photo.image_url)" 
                    [alt]="photo.title"
                    loading="lazy"
                    decoding="async"
                    class="w-100 h-100 object-fit-cover photo-thumb"
                  >
                  <!-- Zoom overlay -->
                  <div class="thumb-hover-overlay">
                    <span class="zoom-pill">
                      <i class="bi bi-zoom-in me-1"></i> Full View
                    </span>
                  </div>

                  <!-- Visibility Badge -->
                  <span 
                    class="badge position-absolute top-0 end-0 m-2 cursor-pointer shadow-sm" 
                    [ngClass]="photo.is_visible ? 'bg-success' : 'bg-secondary'"
                    (click)="$event.stopPropagation(); toggleVisibility(photo)"
                    title="Click to toggle public visibility"
                  >
                    {{ photo.is_visible ? 'Live on Site' : 'Hidden' }}
                  </span>

                  <!-- Index Tag -->
                  <span class="badge position-absolute bottom-0 start-0 m-2 bg-dark bg-opacity-75 font-monospace small">
                    #{{ photo.order_num || photo.id }}
                  </span>
                </div>

                <!-- Details -->
                <div class="p-3 flex-grow-1 d-flex flex-column">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <span class="badge-category" [ngClass]="getCategoryBadgeClass(photo.category)">
                      {{ photo.category }}
                    </span>
                  </div>

                  <h6 class="fw-bold mb-1 text-dark text-truncate" [title]="photo.title">
                    {{ photo.title }}
                  </h6>

                  <p class="small text-muted mb-3 flex-grow-1 line-clamp-2" [title]="photo.caption || ''">
                    {{ photo.caption || 'No caption provided.' }}
                  </p>
                  
                  <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                    <button 
                      class="btn btn-sm btn-outline-secondary" 
                      (click)="openLightbox(photo)" 
                      title="View Full Resolution"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <div class="d-flex gap-1">
                      <button 
                        class="btn btn-sm btn-outline-primary" 
                        (click)="openEditModal(photo)"
                        title="Edit Details"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger" 
                        (click)="deletePhoto(photo.id)"
                        title="Delete Photo"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12 text-center py-5">
              <i class="bi bi-images text-muted fs-1 mb-2 d-block"></i>
              <div class="fw-semibold text-secondary">No photos found</div>
              <p class="small text-muted">Try clearing your search query or uploading a photo into this category.</p>
              <button class="btn btn-trust-primary btn-sm rounded-pill px-3" (click)="openAddModal()">
                <i class="bi bi-plus-lg me-1"></i> Add Photo Now
              </button>
            </div>
          }
        </div>

        <!-- Pagination Controls -->
        @if (totalPages() > 1) {
          <div class="d-flex justify-content-center align-items-center gap-2 mt-3 pb-3">
            <button 
              class="btn btn-sm btn-outline-secondary px-3 rounded-pill" 
              [disabled]="currentPage === 1"
              (click)="goToPage(currentPage - 1)"
            >
              <i class="bi bi-chevron-left me-1"></i> Prev
            </button>

            <span class="small text-muted px-2">
              Page <strong>{{ currentPage }}</strong> of <strong>{{ totalPages() }}</strong>
            </span>

            <button 
              class="btn btn-sm btn-outline-secondary px-3 rounded-pill" 
              [disabled]="currentPage === totalPages()"
              (click)="goToPage(currentPage + 1)"
            >
              Next <i class="bi bi-chevron-right ms-1"></i>
            </button>
          </div>
        }
      }
    </div>

    <!-- LIGHTBOX / FULLSCREEN PREVIEW MODAL -->
    @if (lightboxPhoto()) {
      <div class="lightbox-overlay" (click)="closeLightbox()">
        <div class="lightbox-dialog" (click)="$event.stopPropagation()">
          <div class="lightbox-header d-flex justify-content-between align-items-center p-3 text-white">
            <div>
              <span class="badge bg-primary me-2">{{ lightboxPhoto()?.category }}</span>
              <strong class="fs-6">{{ lightboxPhoto()?.title }}</strong>
            </div>
            <button type="button" class="btn-close btn-close-white" (click)="closeLightbox()"></button>
          </div>

          <div class="lightbox-body text-center p-2 bg-black">
            <img 
              [src]="resolveImageUrl(lightboxPhoto()?.image_url)" 
              [alt]="lightboxPhoto()?.title" 
              class="img-fluid rounded lightbox-full-img"
            >
          </div>

          <div class="lightbox-footer p-3 bg-dark text-white-50 small d-flex justify-content-between align-items-center">
            <div>{{ lightboxPhoto()?.caption || 'Photo from Ar Rahman Trust gallery archives' }}</div>
            <a [href]="resolveImageUrl(lightboxPhoto()?.image_url)" target="_blank" class="btn btn-sm btn-outline-light rounded-pill px-3">
              <i class="bi bi-box-arrow-up-right me-1"></i> Open Raw
            </a>
          </div>
        </div>
      </div>
    }

    <!-- ADD / EDIT PHOTO MODAL (With File Upload & New Category Creation) -->
    @if (showModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.65); backdrop-filter: blur(5px);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-2xl">
            <!-- Modal Header -->
            <div class="modal-header" style="background-color: #0F3D63; color: #fff;">
              <div>
                <h5 class="modal-title fw-bold mb-0">
                  {{ isEditing() ? 'Edit Photo Details' : 'Upload & Add Gallery Photo' }}
                </h5>
                <span class="small text-white-50">Ar Rahman Trust Gallery System</span>
              </div>
              <button type="button" class="btn-close btn-close-white" (click)="showModal.set(false)"></button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body p-4">
              <form (ngSubmit)="savePhoto()">
                <div class="row g-3">
                  <!-- Photo Title -->
                  <div class="col-12">
                    <label class="form-label small fw-bold">Photo Title *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      [(ngModel)]="formData.title" 
                      name="title" 
                      required 
                      placeholder="e.g. Ramadan Ration Kit Distribution #5"
                    >
                  </div>

                  <!-- CATEGORY SELECTION & NEW CATEGORY OPTION -->
                  <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <label class="form-label small fw-bold mb-0">Category *</label>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-link p-0 text-decoration-none fw-bold"
                        (click)="toggleNewCategoryMode()"
                        style="color: #0F3D63;"
                      >
                        @if (isCreatingNewCategory) {
                          <i class="bi bi-arrow-left-circle me-1"></i> Choose Existing Category
                        } @else {
                          <i class="bi bi-plus-circle-fill me-1 text-success"></i> + Add New Category
                        }
                      </button>
                    </div>

                    <!-- If choosing existing category -->
                    @if (!isCreatingNewCategory) {
                      <div class="input-group">
                        <select class="form-select" [(ngModel)]="formData.category" name="category">
                          @for (cat of dynamicCategories(); track cat) {
                            <option [value]="cat">{{ cat }}</option>
                          }
                          <option value="General">General</option>
                        </select>
                        <button 
                          type="button" 
                          class="btn btn-outline-primary btn-sm"
                          (click)="toggleNewCategoryMode()"
                          title="Type a new category name"
                        >
                          <i class="bi bi-plus-lg"></i> New
                        </button>
                      </div>
                      <div class="form-text small text-muted">
                        Select a category or click <strong>+ Add New Category</strong> to create a custom one.
                      </div>
                    } @else {
                      <!-- If creating a brand new category -->
                      <div class="new-category-box p-3 rounded-3 border bg-light">
                        <div class="d-flex align-items-center gap-2 mb-2">
                          <i class="bi bi-folder-plus text-primary fs-5"></i>
                          <span class="small fw-bold text-navy">Enter New Category Name:</span>
                        </div>
                        <div class="input-group">
                          <input 
                            type="text" 
                            class="form-control" 
                            [(ngModel)]="newCategoryName" 
                            name="newCategoryName" 
                            placeholder="e.g. Ramadan Relief, Drinking Water, Orphan Care..."
                            autofocus
                          >
                          <button 
                            type="button" 
                            class="btn btn-secondary btn-sm"
                            (click)="toggleNewCategoryMode()"
                          >
                            Cancel
                          </button>
                        </div>
                        <div class="small text-muted mt-1">
                          This new category will be created and added to your filter tabs automatically.
                        </div>
                      </div>
                    }
                  </div>

                  <!-- IMAGE INPUT METHOD (FILE UPLOAD OR URL) -->
                  <div class="col-12">
                    <label class="form-label small fw-bold d-block mb-2">Photo Source *</label>

                    <!-- Source Selector Tabs -->
                    <div class="btn-group w-100 mb-3" role="group">
                      <button 
                        type="button" 
                        class="btn btn-sm" 
                        [ngClass]="imageSourceMode === 'upload' ? 'btn-navy-active fw-bold' : 'btn-outline-secondary'"
                        (click)="imageSourceMode = 'upload'"
                      >
                        <i class="bi bi-upload me-1"></i> Upload from Computer / Device
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-sm" 
                        [ngClass]="imageSourceMode === 'url' ? 'btn-navy-active fw-bold' : 'btn-outline-secondary'"
                        (click)="imageSourceMode = 'url'"
                      >
                        <i class="bi bi-link-45deg me-1"></i> Image URL / ImageKit Link
                      </button>
                    </div>

                    <!-- 1. FILE UPLOAD BOX -->
                    @if (imageSourceMode === 'upload') {
                      <div class="file-dropzone p-3 text-center border-dashed rounded-3">
                        <input 
                          type="file" 
                          id="galleryFileInput" 
                          class="d-none" 
                          accept="image/*"
                          (change)="onFileSelected($event)"
                          #fileInput
                        >

                        @if (filePreviewUrl) {
                          <!-- Selected File Preview -->
                          <div class="preview-container position-relative d-inline-block">
                            <img [src]="filePreviewUrl" alt="Upload preview" class="rounded shadow-sm file-preview-img mb-2">
                            <button 
                              type="button" 
                              class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-1"
                              (click)="clearSelectedFile(fileInput)"
                              title="Remove selected image"
                            >
                              <i class="bi bi-x-lg"></i>
                            </button>
                            <div class="small text-muted">
                              <strong>{{ selectedFileName }}</strong> ({{ selectedFileSize }})
                            </div>
                            <button 
                              type="button" 
                              class="btn btn-sm btn-outline-primary mt-2 rounded-pill px-3"
                              (click)="fileInput.click()"
                            >
                              <i class="bi bi-arrow-repeat me-1"></i> Change File
                            </button>
                          </div>
                        } @else {
                          <!-- Dropzone Placeholder -->
                          <div class="py-3 cursor-pointer" (click)="fileInput.click()">
                            <i class="bi bi-cloud-arrow-up text-primary display-6 mb-2 d-block"></i>
                            <div class="fw-bold text-dark">Click to Browse Photo from Computer</div>
                            <div class="small text-muted mt-1">Supports JPG, PNG, WEBP, GIF (Up to 10 MB)</div>
                            <button type="button" class="btn btn-sm btn-trust-primary rounded-pill mt-3 px-3">
                              <i class="bi bi-folder2-open me-1"></i> Browse Files
                            </button>
                          </div>
                        }

                        <!-- ImageKit Folder Destination Pill -->
                        <div class="mt-3 p-2.5 bg-white border rounded-3 text-start shadow-sm">
                          <div class="d-flex align-items-center justify-content-between mb-1.5">
                            <span class="small fw-bold text-navy">
                              <i class="bi bi-cloud-arrow-up-fill text-primary me-1"></i> ImageKit Destination Folder:
                            </span>
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace small">
                              baaidzoik
                            </span>
                          </div>
                          <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light text-muted font-monospace small">...baaidzoik</span>
                            <input 
                              type="text" 
                              class="form-control font-monospace text-primary fw-semibold" 
                              [(ngModel)]="targetImageKitFolder" 
                              name="targetImageKitFolder" 
                              placeholder="/assets/gallery-full/Test"
                            >
                          </div>
                          <div class="text-muted small mt-1" style="font-size: 0.72rem;">
                            Direct URL: <code>https://ik.imagekit.io/baaidzoik{{ targetImageKitFolder }}</code>
                          </div>
                        </div>
                      </div>
                    } @else {
                      <!-- 2. DIRECT IMAGE URL INPUT -->
                      <div class="url-input-box">
                        <div class="input-group">
                          <span class="input-group-text bg-light"><i class="bi bi-link"></i></span>
                          <input 
                            type="text" 
                            class="form-control" 
                            [(ngModel)]="formData.image_url" 
                            name="image_url" 
                            placeholder="https://ik.imagekit.io/baaidzoik/assets/..."
                          >
                        </div>
                        @if (formData.image_url) {
                          <div class="mt-2 text-center bg-light p-2 rounded border">
                            <img 
                              [src]="formData.image_url" 
                              alt="URL preview" 
                              class="rounded" 
                              style="max-height: 120px; max-width: 100%; object-fit: contain;"
                              (error)="onImageError($event)"
                            >
                          </div>
                        }
                      </div>
                    }
                  </div>

                  <!-- Caption -->
                  <div class="col-12">
                    <label class="form-label small fw-bold">Caption & Activity Description</label>
                    <textarea 
                      class="form-control" 
                      rows="2" 
                      [(ngModel)]="formData.caption" 
                      name="caption" 
                      placeholder="e.g. Free grocery distribution to 50 rural families in Pernambut..."
                    ></textarea>
                  </div>

                  <!-- Sort Order & Visibility Switch -->
                  <div class="col-sm-6">
                    <label class="form-label small fw-bold">Sort Order Number</label>
                    <input type="number" class="form-control" [(ngModel)]="formData.order_num" name="order_num">
                  </div>

                  <div class="col-sm-6 d-flex align-items-center">
                    <div class="form-check form-switch mt-3">
                      <input class="form-check-input" type="checkbox" id="visibleCheck" [(ngModel)]="formData.is_visible" name="is_visible">
                      <label class="form-check-label small fw-semibold" for="visibleCheck">
                        Display Live on Public Website
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Modal Actions -->
                <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <button type="button" class="btn btn-light rounded-pill px-4" (click)="showModal.set(false)">Cancel</button>
                  <button 
                    type="submit" 
                    class="btn btn-trust-primary rounded-pill px-4" 
                    [disabled]="isSubmitting() || !formData.title || (!selectedFile && !formData.image_url)"
                  >
                    @if (isSubmitting()) {
                      <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                      <span>Uploading & Saving...</span>
                    } @else {
                      <i class="bi bi-check-lg me-1"></i>
                      <span>{{ isEditing() ? 'Update Photo' : 'Save Photo to Gallery' }}</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- QUICK CATEGORY CREATOR MODAL -->
    @if (showCategoryModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.65);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header" style="background-color: #0F3D63; color: #fff;">
              <h5 class="modal-title fw-bold">Create New Gallery Category</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showCategoryModal.set(false)"></button>
            </div>
            <div class="modal-body p-4">
              <p class="small text-muted mb-3">
                Create a dedicated category (e.g., <em>Ramadan Ration</em>, <em>Clean Water Borewells</em>, <em>Orphan Care</em>) to organize your photos.
              </p>
              <div class="mb-3">
                <label class="form-label small fw-bold">Category Name *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  [(ngModel)]="standaloneCategoryName" 
                  placeholder="e.g. Ramadan Relief 2026"
                  autofocus
                >
              </div>
              <div class="d-flex justify-content-end gap-2 mt-3">
                <button type="button" class="btn btn-light" (click)="showCategoryModal.set(false)">Cancel</button>
                <button 
                  type="button" 
                  class="btn btn-trust-primary" 
                  [disabled]="!standaloneCategoryName.trim()"
                  (click)="confirmCreateCategory()"
                >
                  Create & Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .btn-navy-active {
      background-color: #0F3D63 !important;
      color: #ffffff !important;
      border-color: #0F3D63 !important;
    }

    .category-filter-btn {
      font-weight: 600;
      font-size: 0.82rem;
      padding: 0.4rem 0.9rem;
      transition: all 0.15s ease;
    }

    .border-dashed {
      border: 1.5px dashed #0F3D63 !important;
    }

    .search-input-wrapper {
      position: relative;
      min-width: 270px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.85rem;
    }

    .search-field {
      padding-left: 32px;
      padding-right: 30px;
      border-radius: 20px;
    }

    .clear-btn {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      padding: 0 4px;
      background: none;
      border: none;
    }

    .per-page-select {
      width: auto;
      display: inline-block;
      padding-top: 0.2rem;
      padding-bottom: 0.2rem;
    }

    .photo-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .photo-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(15, 61, 99, 0.12);
    }

    .photo-thumb-wrapper {
      height: 190px;
      background: #f1f5f9;
      overflow: hidden;
      cursor: pointer;
    }

    .photo-thumb {
      transition: transform 0.3s ease;
    }
    .photo-card:hover .photo-thumb {
      transform: scale(1.05);
    }

    .thumb-hover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 61, 99, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .photo-card:hover .thumb-hover-overlay {
      opacity: 1;
    }

    .zoom-pill {
      background: #ffffff;
      color: #0F3D63;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.35rem 0.8rem;
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .badge-category {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
    }
    .badge-food { background: #fee2e2; color: #991b1b; }
    .badge-skill { background: #fef3c7; color: #92400e; }
    .badge-medical { background: #d1fae5; color: #065f46; }
    .badge-general { background: #e0f2fe; color: #0369a1; }
    .badge-custom { background: #ede9fe; color: #5b21b6; }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .file-dropzone {
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      transition: all 0.2s ease;
    }
    .file-dropzone:hover {
      border-color: #0F3D63;
      background: #eff6ff;
    }

    .file-preview-img {
      max-height: 180px;
      max-width: 100%;
      object-fit: contain;
    }

    .lightbox-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(5, 18, 30, 0.88);
      backdrop-filter: blur(8px);
      z-index: 1060;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeInLightbox 0.2s ease-out;
    }

    @keyframes fadeInLightbox {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .lightbox-dialog {
      max-width: 900px;
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
    }

    .lightbox-header {
      background: #0F3D63;
    }

    .lightbox-full-img {
      max-height: 70vh;
      width: auto;
      margin: auto;
      object-fit: contain;
    }
  `]
})
export class GalleryComponent implements OnInit {
  isLoading = signal(true);
  isSubmitting = signal(false);
  photos = signal<GalleryItem[]>([]);
  filteredPhotos = signal<GalleryItem[]>([]);
  activeCategory = '';
  searchQuery = '';

  // Dynamic Categories tracking
  userAddedCategories = signal<string[]>([]);
  dynamicCategories = computed(() => {
    const list = this.photos();
    const defaults = ['Food Distribution', 'Education & Skill', 'Healthcare'];
    const extracted = list.map(p => p.category).filter(Boolean);
    const combined = Array.from(new Set([...defaults, ...extracted, ...this.userAddedCategories()]));
    return combined;
  });

  // Pagination
  currentPage = 1;
  pageSize = 24;

  // Lightbox
  lightboxPhoto = signal<GalleryItem | null>(null);

  // Modal State
  showModal = signal(false);
  showCategoryModal = signal(false);
  isEditing = signal(false);
  formData: any = {};

  // Category in modal
  isCreatingNewCategory = false;
  newCategoryName = '';
  standaloneCategoryName = '';

  // File Upload vs URL
  imageSourceMode: 'upload' | 'url' = 'upload';
  selectedFile: File | null = null;
  selectedFileName = '';
  selectedFileSize = '';
  filePreviewUrl: string | null = null;
  targetImageKitFolder = '/assets/gallery-full/Test';

  pagedPhotos = computed(() => {
    const list = this.filteredPhotos();
    const start = (this.currentPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredPhotos().length / this.pageSize) || 1;
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPhotos();
  }

  loadPhotos(): void {
    this.isLoading.set(true);
    this.apiService.getGallery().subscribe({
      next: (res) => {
        if (res.success) {
          this.photos.set(res.data);
          this.applyFilter();
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  resolveImageUrl(url: string | undefined): string {
    if (!url) return 'https://ik.imagekit.io/baaidzoik/assets/gallery/AR_food_dist.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  }

  countByCategory(category: string): number {
    return this.photos().filter(p => p.category === category).length;
  }

  getCategoryIcon(category: string): string {
    if (category === 'Food Distribution') return 'bi bi-box2-heart text-danger';
    if (category === 'Education & Skill') return 'bi bi-scissors text-warning';
    if (category === 'Healthcare') return 'bi bi-heart-pulse-fill text-success';
    return 'bi bi-tag-fill text-primary';
  }

  getCategoryBadgeClass(category: string): string {
    if (category === 'Food Distribution') return 'badge-food';
    if (category === 'Education & Skill') return 'badge-skill';
    if (category === 'Healthcare') return 'badge-medical';
    if (category === 'General') return 'badge-general';
    return 'badge-custom';
  }

  selectCategory(cat: string): void {
    this.activeCategory = cat;
    this.currentPage = 1;
    this.applyFilter();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    let list = this.photos();

    // Category filter
    if (this.activeCategory) {
      list = list.filter(p => p.category === this.activeCategory);
    }

    // Search query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.image_url && p.image_url.toLowerCase().includes(q))
      );
    }

    this.filteredPhotos.set(list);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  openLightbox(photo: GalleryItem): void {
    this.lightboxPhoto.set(photo);
  }

  closeLightbox(): void {
    this.lightboxPhoto.set(null);
  }

  toggleVisibility(photo: GalleryItem): void {
    const updated = { ...photo, is_visible: !photo.is_visible };
    this.apiService.updateGallery(photo.id, updated).subscribe({
      next: () => {
        this.photos.update(items => items.map(p => p.id === photo.id ? updated : p));
        this.applyFilter();
      }
    });
  }

  toggleNewCategoryMode(): void {
    this.isCreatingNewCategory = !this.isCreatingNewCategory;
    if (this.isCreatingNewCategory) {
      this.newCategoryName = '';
    }
  }

  openAddCategoryModal(): void {
    this.standaloneCategoryName = '';
    this.showCategoryModal.set(true);
  }

  confirmCreateCategory(): void {
    const trimmed = this.standaloneCategoryName.trim();
    if (trimmed) {
      if (!this.userAddedCategories().includes(trimmed)) {
        this.userAddedCategories.update(c => [...c, trimmed]);
      }
      this.activeCategory = trimmed;
      this.showCategoryModal.set(false);
      this.applyFilter();
    }
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

  onImageError(event: any): void {
    event.target.src = 'https://ik.imagekit.io/baaidzoik/assets/gallery/AR_food_dist.png';
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.isCreatingNewCategory = false;
    this.newCategoryName = '';
    this.clearSelectedFile();
    this.imageSourceMode = 'upload';

    // If currently filtered by category, default to it
    const defaultCat = this.activeCategory || 'Food Distribution';

    this.formData = {
      title: '',
      category: defaultCat,
      image_url: '',
      caption: '',
      is_visible: true,
      order_num: this.photos().length + 1
    };
    this.showModal.set(true);
  }

  openEditModal(item: GalleryItem): void {
    this.isEditing.set(true);
    this.isCreatingNewCategory = false;
    this.newCategoryName = '';
    this.clearSelectedFile();
    this.formData = { ...item };
    this.imageSourceMode = 'url';
    this.showModal.set(true);
  }

  savePhoto(): void {
    // Determine the category to use
    let targetCategory = this.formData.category;
    if (this.isCreatingNewCategory && this.newCategoryName.trim()) {
      targetCategory = this.newCategoryName.trim();
      if (!this.userAddedCategories().includes(targetCategory)) {
        this.userAddedCategories.update(c => [...c, targetCategory]);
      }
    }

    this.isSubmitting.set(true);

    if (this.imageSourceMode === 'upload' && this.selectedFile) {
      // Build FormData for multipart upload
      const fd = new FormData();
      fd.append('title', this.formData.title);
      fd.append('category', targetCategory);
      fd.append('caption', this.formData.caption || '');
      fd.append('order_num', (this.formData.order_num || 0).toString());
      fd.append('is_visible', this.formData.is_visible ? '1' : '0');
      fd.append('folder', this.targetImageKitFolder || '/assets/gallery-full/Test');
      fd.append('image', this.selectedFile);

      if (this.isEditing()) {
        this.apiService.updateGallery(this.formData.id, fd).subscribe({
          next: () => this.handleSaveSuccess(targetCategory),
          error: (err) => this.handleSaveError(err)
        });
      } else {
        this.apiService.createGallery(fd).subscribe({
          next: () => this.handleSaveSuccess(targetCategory),
          error: (err) => this.handleSaveError(err)
        });
      }
    } else {
      // Standard JSON update / create with image_url
      const payload = {
        ...this.formData,
        category: targetCategory
      };

      if (this.isEditing()) {
        this.apiService.updateGallery(this.formData.id, payload).subscribe({
          next: () => this.handleSaveSuccess(targetCategory),
          error: (err) => this.handleSaveError(err)
        });
      } else {
        this.apiService.createGallery(payload).subscribe({
          next: () => this.handleSaveSuccess(targetCategory),
          error: (err) => this.handleSaveError(err)
        });
      }
    }
  }

  private handleSaveSuccess(category: string): void {
    this.isSubmitting.set(false);
    this.showModal.set(false);
    // Switch to that category so user sees their new upload immediately
    this.activeCategory = category;
    this.loadPhotos();
  }

  private handleSaveError(err: any): void {
    this.isSubmitting.set(false);
    const msg = err.error?.message || 'Failed to save photo. Please try again.';
    alert(msg);
  }

  deletePhoto(id: number): void {
    if (confirm('Are you sure you want to delete this photo from the gallery?')) {
      this.apiService.deleteGallery(id).subscribe({
        next: () => this.loadPhotos()
      });
    }
  }
}
