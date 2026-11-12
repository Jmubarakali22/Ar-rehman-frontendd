import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WhatsAppService, WhatsAppStatus } from '../../core/services/whatsapp.service';
import { Donation } from '../../core/models/models';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="donations-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-3 gap-2">
        <div>
          <h2 class="h5 fw-bold mb-1" style="color: #0F3D63;">Donations Management</h2>
          <p class="text-muted small mb-0" style="font-size: 12px;">Record, verify, and generate official receipts for Zakat and Sadaqah donors.</p>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <button class="btn btn-outline-secondary btn-sm" (click)="exportToCSV()">
            <i class="bi bi-download me-1"></i> Export CSV
          </button>
          <button class="btn btn-trust-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-plus-lg me-1"></i> Record Donation
          </button>
        </div>
      </div>

      <!-- PDF Download / WhatsApp Notification Alert -->
      @if (pdfDownloadedNotice()) {
        <div class="alert alert-success alert-dismissible fade show d-flex align-items-center justify-content-between p-3 mb-4 shadow-sm border-0" style="border-left: 5px solid #25D366 !important; background-color: #f0fdf4;">
          <div class="d-flex align-items-center">
            <i class="bi bi-file-earmark-pdf-fill fs-3 text-danger me-3"></i>
            <div>
              <div class="fw-bold text-dark">Official PDF Receipt Generated &amp; Downloaded!</div>
              <div class="small text-secondary">WhatsApp chat has been opened. Drag &amp; drop or attach the downloaded PDF receipt into the WhatsApp conversation.</div>
            </div>
          </div>
          <button type="button" class="btn-close" (click)="pdfDownloadedNotice.set(false)"></button>
        </div>
      }

      <!-- Filters & Search Toolbar -->
      <div class="admin-card p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search by name, phone, UTR..." 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="loadDonations()"
              >
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select" [(ngModel)]="selectedType" (change)="loadDonations()">
              <option value="">All Donation Types</option>
              <option value="zakat">Zakat</option>
              <option value="sadaqah">Sadaqah</option>
              <option value="education">Education Support</option>
              <option value="medical">Medical Relief</option>
              <option value="ration">Ration / Food</option>
              <option value="general">General Aid</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select" [(ngModel)]="selectedStatus" (change)="loadDonations()">
              <option value="">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div class="col-12 col-md-2 d-grid">
            <button class="btn btn-trust-outline" (click)="resetFilters()">
              <i class="bi bi-x-circle me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Selection & Action Bar -->
      @if (selectedDonationIds().size > 0) {
        <div class="alert alert-primary d-flex flex-wrap align-items-center justify-content-between p-3 mb-3 shadow-sm border-0" style="background: linear-gradient(135deg, #0F3D63, #1e3a8a); color: #fff; border-radius: 10px;">
          <div class="d-flex align-items-center gap-2 mb-2 mb-sm-0">
            <span class="badge bg-white text-dark fs-6">{{ selectedDonationIds().size }}</span>
            <span class="fw-semibold">Donor{{ selectedDonationIds().size > 1 ? 's' : '' }} Selected</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-warning btn-sm fw-bold px-3 shadow-sm text-dark" (click)="openBulkReminderModal()">
              <i class="bi bi-bell-fill me-1"></i> Send WhatsApp Reminder ({{ selectedDonationIds().size }})
            </button>
            <button class="btn btn-outline-light btn-sm" (click)="clearSelection()">
              Clear Selection
            </button>
          </div>
        </div>
      }

      <!-- Donations Table Card -->
      <div class="admin-card mb-4 shadow-sm">
        <!-- Horizontal Scroll Hint for Mobile Screens Only -->
        <div class="d-md-none px-3 py-1.5 bg-light border-bottom d-flex align-items-center justify-content-between text-muted" style="font-size: 11px;">
          <span><i class="bi bi-arrows-expand me-1" style="transform: rotate(45deg); display: inline-block;"></i> Swipe to view more</span>
          <span class="badge bg-secondary-subtle text-secondary font-monospace">{{ donations().length }} records</span>
        </div>

        <div class="table-responsive">
          <table class="table admin-table mb-0 align-middle">
            <thead>
              <tr>
                <th style="width: 36px;" class="text-center">
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    [checked]="isAllSelected()" 
                    [indeterminate]="isSomeSelected()" 
                    (change)="toggleSelectAll($event)"
                    title="Select / Deselect all on this page"
                  >
                </th>
                <th>Receipt #</th>
                <th>Donor Name &amp; Phone</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Method</th>
                <th>Txn Ref / UTR</th>
                <th>Status</th>
                <th>Date</th>
                <th class="text-end" style="min-width: 155px; width: 155px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading()) {
                <tr>
                  <td colspan="10" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              } @else {
                @for (item of donations(); track item.id) {
                  <tr [class.table-primary]="isSelected(item.id)">
                    <td class="text-center" style="width: 36px;">
                      <input 
                        type="checkbox" 
                        class="form-check-input" 
                        [checked]="isSelected(item.id)" 
                        (change)="toggleSelect(item.id)"
                      >
                    </td>
                    <td>
                      <span class="badge bg-light text-dark border font-monospace px-1.5 py-0.5" style="font-size: 11px;">{{ item.receipt_number || ('ART-' + item.id) }}</span>
                    </td>
                    <td>
                      <div class="fw-bold text-dark text-truncate" style="max-width: 125px;" [title]="item.donor_name">{{ item.donor_name }}</div>
                      <div class="text-muted font-monospace" style="font-size: 11px;">{{ item.donor_phone }}</div>
                      @if (item.donor_email) {
                        <div class="text-secondary text-truncate" style="max-width: 125px; font-size: 10px;" [title]="item.donor_email">{{ item.donor_email }}</div>
                      }
                    </td>
                    <td>
                      <div class="fw-bold text-dark text-nowrap" style="font-size: 0.9rem;">₹{{ item.amount | number:'1.2-2' }}</div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="item.donation_type === 'zakat' ? 'bg-success' : 'bg-primary'" style="font-size: 10px; padding: 2.5px 5.5px;">
                        {{ item.donation_type | uppercase }}
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-secondary text-uppercase" style="font-size: 10px; padding: 2.5px 5px;">{{ item.payment_method }}</span>
                    </td>
                    <td>
                      <span class="font-monospace text-muted text-truncate d-inline-block" style="max-width: 95px; font-size: 10.5px;" [title]="item.transaction_id || '-'">
                        {{ item.transaction_id || '-' }}
                      </span>
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
                    <td class="text-muted text-nowrap" style="font-size: 11px;">{{ item.created_at | date:'mediumDate' }}</td>
                    <td class="text-end" style="min-width: 155px; width: 155px; white-space: nowrap;">
                      <div class="btn-group btn-group-sm action-btn-group">
                        <!-- Download PDF Receipt -->
                        <button class="btn btn-outline-danger" title="Download Official PDF Receipt" (click)="downloadReceiptPDF(item)">
                          <i class="bi bi-file-earmark-pdf"></i>
                        </button>
                        <!-- Send PDF Receipt on WhatsApp -->
                        <button class="btn btn-outline-success" title="Send Official PDF Receipt on WhatsApp" (click)="openWhatsAppModal(item)" style="color: #25D366; border-color: #25D366;">
                          <i class="bi bi-whatsapp"></i>
                        </button>
                        <!-- Send WhatsApp Reminder (Single) -->
                        <button class="btn btn-outline-warning" title="Send WhatsApp Donation Reminder to this donor" (click)="openSingleReminderModal(item)" style="color: #d97706; border-color: #f59e0b;">
                          <i class="bi bi-bell-fill"></i>
                        </button>
                        <!-- Receipt View / Print -->
                        <button class="btn btn-outline-secondary" title="View Full Receipt" (click)="viewReceipt(item)">
                          <i class="bi bi-printer"></i>
                        </button>
                        <!-- Edit -->
                        <button class="btn btn-outline-primary" title="Edit Donation" (click)="openEditModal(item)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <!-- Delete -->
                        <button class="btn btn-outline-danger" title="Delete Donation" (click)="deleteDonation(item.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="10" class="text-center py-5 text-muted">
                      No donations match your filter criteria.
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <div class="small text-muted">
            Showing {{ donations().length }} of {{ totalDonations() }} records
          </div>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" [disabled]="currentPage <= 1" (click)="changePage(currentPage - 1)">
              Previous
            </button>
            <span class="btn btn-light disabled text-dark fw-bold">Page {{ currentPage }} of {{ totalPages() || 1 }}</span>
            <button class="btn btn-outline-secondary" [disabled]="currentPage >= totalPages()" (click)="changePage(currentPage + 1)">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD / EDIT MODAL -->
    @if (showFormModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width: 560px;">
          <div class="modal-content border-0 shadow">
            <div class="modal-header" style="background-color: #0F3D63; color: #fff;">
              <h5 class="modal-title fw-bold">
                {{ isEditing() ? 'Edit Donation Record' : 'Record New Donation' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="showFormModal.set(false)"></button>
            </div>
            <div class="modal-body p-3 p-sm-4">
              <form (ngSubmit)="saveDonation()">
                <div class="mb-3">
                  <label class="form-label small fw-bold">Donor Full Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.donor_name" name="donor_name" required>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-bold">Phone Number *</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.donor_phone" name="donor_phone" placeholder="+91 ..." required>
                  </div>
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-bold">Email (Optional)</label>
                    <input type="email" class="form-control" [(ngModel)]="formData.donor_email" name="donor_email">
                  </div>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-bold">Amount (₹) *</label>
                    <input type="number" class="form-control" [(ngModel)]="formData.amount" name="amount" min="1" required>
                  </div>
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-bold">Donation Purpose *</label>
                    <select class="form-select" [(ngModel)]="formData.donation_type" name="donation_type">
                      <option value="zakat">Zakat</option>
                      <option value="sadaqah">Sadaqah</option>
                      <option value="education">Education Support</option>
                      <option value="medical">Medical Relief</option>
                      <option value="ration">Ration / Food</option>
                      <option value="general">General Donation</option>
                    </select>
                  </div>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-bold">Payment Mode</label>
                    <select class="form-select" [(ngModel)]="formData.payment_method" name="payment_method">
                      <option value="upi">UPI (GPay/PhonePe/Paytm)</option>
                      <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                      <option value="cash">Cash in Office</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-bold">Verification Status</label>
                    <select class="form-select" [(ngModel)]="formData.status" name="status">
                      <option value="verified">Verified</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Transaction Reference / UTR</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.transaction_id" name="transaction_id" placeholder="e.g. UPI/2026/04918231">
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Notes / Special Instructions</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="formData.notes" name="notes"></textarea>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" class="btn btn-light" (click)="showFormModal.set(false)">Cancel</button>
                  <button type="submit" class="btn btn-trust-primary" [disabled]="isSubmitting()">
                    {{ isSubmitting() ? 'Saving...' : 'Save Record' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- OFFICIAL RECEIPT MODAL (Fully Responsive for Windows & Mobile) -->
    @if (showReceiptModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.65);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable receipt-modal-dialog">
          <div class="modal-content border-0 shadow-lg receipt-modal-content">
            <!-- Modal Header (Sticky & Compact) -->
            <div class="modal-header bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
              <h6 class="modal-title fw-bold text-dark mb-0 d-flex align-items-center">
                <i class="bi bi-file-earmark-pdf-fill me-2 text-danger"></i>Official Donation Receipt Voucher
              </h6>
              <div class="d-flex align-items-center gap-1 gap-sm-2">
                <button type="button" class="btn btn-outline-danger btn-sm py-1 px-2 d-none d-sm-inline-flex align-items-center" [disabled]="isGeneratingPdf()" (click)="downloadReceiptPDF(activeReceipt)">
                  <i class="bi bi-file-earmark-pdf me-1"></i> PDF
                </button>
                <button type="button" class="btn btn-outline-success btn-sm py-1 px-2 d-none d-sm-inline-flex align-items-center" (click)="openWhatsAppModal(activeReceipt)">
                  <i class="bi bi-whatsapp me-1"></i> WhatsApp
                </button>
                <button type="button" class="btn-close" (click)="showReceiptModal.set(false)"></button>
              </div>
            </div>

            <!-- Modal Body (Smooth Scrolling on Windows & Mobile) -->
            <div class="modal-body p-2 p-sm-3 p-md-4 bg-light receipt-modal-body">
              <!-- Printable & Downloadable PDF Receipt Paper (Responsive for Windows & Mobile with Complete Closed Borders) -->
              <div id="printableReceiptModal" class="receipt-paper p-3 p-sm-4 pb-4 rounded-3 bg-white position-relative" style="border: 2.5px solid #0F3D63; outline: 1px solid #cbd5e1; outline-offset: -5px; max-width: 720px; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.06); font-family: 'Plus Jakarta Sans', sans-serif;">
                
                <!-- Trust Header Branding -->
                <div class="text-center pb-3 border-bottom mb-3" style="border-bottom: 2px solid #e2e8f0 !important;">
                  <img src="https://ik.imagekit.io/baaidzoik/assets/header-logo/ar_logo_1.png" alt="Ar Rahman Trust" height="52" class="mb-2" crossorigin="anonymous">
                  <h2 class="fw-bold mb-0" style="color: #0F3D63; letter-spacing: 0.5px; font-size: clamp(18px, 4.2vw, 24px);">AR RAHMAN TRUST</h2>
                  <div class="small fw-semibold mt-1" style="color: #475569; font-size: clamp(11px, 2.5vw, 13px);">Helping Needy People &bull; Pernambut &amp; Surrounding Rural Villages</div>
                  <div class="small text-muted mt-1" style="font-size: clamp(9.5px, 2.2vw, 11px);">
                    Registered Charity No. <strong style="color: #0F3D63;">04/16/2020</strong> &bull; 112, Small Mosque Street, Pernambut, Vellore Dist., Tamil Nadu - 635810
                  </div>
                  <div class="d-inline-block mt-2 px-3 py-1 text-uppercase fw-bold" style="background: #e8f5e9; color: #166534; font-size: 11px; border-radius: 20px; border: 1px solid #bbf7d0; letter-spacing: 0.5px;">
                    Official Donation &amp; Zakat Receipt
                  </div>
                </div>

                <!-- Receipt Meta Bar (Responsive 3-Column / Mobile Stack) -->
                <div class="row g-2 mb-3 p-2 rounded-2" style="background: #f8fafc; font-size: 13px; border: 1px solid #e2e8f0;">
                  <div class="col-12 col-sm-4 text-center text-sm-start mb-1 mb-sm-0">
                    <span class="text-muted" style="font-size: 11px;">Receipt Number:</span><br>
                    <strong class="font-monospace text-primary fs-6">{{ activeReceipt?.receipt_number || ('ART-' + activeReceipt?.id) }}</strong>
                  </div>
                  <div class="col-12 col-sm-4 text-center mb-1 mb-sm-0">
                    <span class="text-muted" style="font-size: 11px;">Date of Contribution:</span><br>
                    <strong class="text-dark">{{ activeReceipt?.created_at | date:'mediumDate' }}</strong>
                  </div>
                  <div class="col-12 col-sm-4 text-center text-sm-end">
                    <span class="text-muted" style="font-size: 11px;">Financial Year:</span><br>
                    <strong class="text-dark">2026 - 2027</strong>
                  </div>
                </div>

                <!-- Donor Information Box (Responsive Columns) -->
                <div class="p-3 rounded-3 mb-3" style="background: #ffffff; border: 1px solid #cbd5e1;">
                  <div class="row g-2 align-items-center">
                    <div class="col-12 col-sm-7 text-center text-sm-start">
                      <div class="small text-muted text-uppercase fw-bold" style="font-size: 11px; letter-spacing: 0.5px;">Received with thanks from:</div>
                      <div class="fw-bold fs-5 text-dark mt-1">{{ activeReceipt?.donor_name }}</div>
                      <div class="small text-secondary"><i class="bi bi-telephone me-1"></i> {{ activeReceipt?.donor_phone }}</div>
                      @if (activeReceipt?.donor_email) {
                        <div class="small text-muted"><i class="bi bi-envelope me-1"></i> {{ activeReceipt?.donor_email }}</div>
                      }
                    </div>
                    <div class="col-12 col-sm-5 text-center text-sm-end mt-2 mt-sm-0">
                      <div class="small text-muted text-uppercase fw-bold" style="font-size: 11px; letter-spacing: 0.5px;">Contribution Purpose:</div>
                      <span class="badge text-uppercase fs-6 px-3 py-1 mt-1" [ngClass]="activeReceipt?.donation_type === 'zakat' ? 'bg-success' : 'bg-primary'">
                        {{ activeReceipt?.donation_type }} Donation
                      </span>
                      <div class="small text-muted mt-2">Mode: <strong class="text-uppercase text-dark">{{ activeReceipt?.payment_method }}</strong></div>
                      <div class="small font-monospace text-muted">Ref/UTR: {{ activeReceipt?.transaction_id || 'N/A' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Amount Box (Fluid Typography for Mobile & Desktop) -->
                <div class="p-3 rounded-3 mb-3 text-center" style="background: #f0fdf4; border: 2px dashed #22c55e;">
                  <div class="small text-uppercase fw-bold" style="color: #166534; font-size: 11px; letter-spacing: 0.5px;">Total Amount Received</div>
                  <div class="fw-bold text-success my-1" style="font-size: clamp(24px, 5.5vw, 32px);">
                    ₹{{ activeReceipt?.amount | number:'1.2-2' }}
                  </div>
                  <div class="small fw-semibold text-uppercase" style="color: #15803d; letter-spacing: 0.5px; font-size: clamp(10px, 2.5vw, 12px);">
                    {{ numberToWords(activeReceipt?.amount || 0) }}
                  </div>
                </div>

                <!-- Islamic Blessing -->
                <div class="p-2 mb-3 text-center rounded-2" style="background: #f8fafc; border-left: 4px solid #0F3D63; font-size: clamp(11px, 2.3vw, 12px); color: #334155; font-style: italic;">
                  "May Allah (SWT) accept your noble donation, multiply your reward manifold, and grant continuous barakah in your wealth, health, and family. Jazakallahu Khairan."
                </div>

                <!-- Official Stamp & Signatory Footer (Responsive Row) -->
                <div class="row pt-3 border-top align-items-center mb-2" style="border-top: 1px solid #e2e8f0 !important;">
                  <div class="col-12 col-sm-6 d-flex justify-content-center justify-content-sm-start mb-3 mb-sm-0">
                    <div class="d-flex align-items-center gap-2">
                      <div class="rounded-circle d-flex align-items-center justify-content-center text-success border border-2 border-success" style="width: 44px; height: 44px; background: #ecfdf5;">
                        <i class="bi bi-shield-check fs-4"></i>
                      </div>
                      <div class="text-start">
                        <div class="fw-bold text-success text-uppercase" style="font-size: 11px;">Verified &amp; Credited</div>
                        <div class="text-muted" style="font-size: 10px;">Official Seal &bull; Regd. 04/16/2020</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6 text-center text-sm-end">
                    <div class="fw-bold" style="color: #0F3D63; font-size: 13px;">Authorized Signatory</div>
                    <div class="text-muted small">Managing Trustee &bull; Pernambut</div>
                    <div class="text-secondary" style="font-size: 10px;">Ar Rahman Trust, Vellore Dist.</div>
                  </div>
                </div>

                <!-- Bottom Official Verification Line (Ensures Complete Closed Card Frame) -->
                <div class="pt-2 border-top text-center text-muted" style="border-top: 1px dashed #cbd5e1 !important; font-size: 10px;">
                  Official Electronic Charity Receipt &bull; Regd. Charity No. 04/16/2020 &bull; Ar Rahman Trust, Pernambut &bull; Helping Needy People
                </div>
              </div>
            </div>

            <!-- Modal Footer (Always Visible & Accessible on Screen) -->
            <div class="modal-footer bg-light border-top py-2 px-3 d-flex flex-wrap justify-content-between gap-2">
              <button type="button" class="btn btn-secondary btn-sm" (click)="showReceiptModal.set(false)">Close</button>
              <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-outline-danger btn-sm" [disabled]="isGeneratingPdf()" (click)="downloadReceiptPDF(activeReceipt)">
                  @if (isGeneratingPdf()) {
                    <span class="spinner-border spinner-border-sm me-1" role="status"></span> Generating PDF...
                  } @else {
                    <i class="bi bi-file-earmark-pdf-fill me-1"></i> Download PDF Receipt
                  }
                </button>
                <button type="button" class="btn btn-success btn-sm" (click)="openWhatsAppModal(activeReceipt)" style="background-color: #25D366; border-color: #25D366;">
                  <i class="bi bi-whatsapp me-1"></i> Send on WhatsApp
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm" (click)="printReceipt()">
                  <i class="bi bi-printer me-1"></i> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- GUARANTEED 1-PAGE A4 PROPORTIONED CONTAINER WITH 100% CLOSED OUTER BORDERS FOR PDF & WHATSAPP EXPORT -->
    @if (activeReceipt) {
      <div style="position: fixed; left: -9999px; top: 0; width: 760px; z-index: -9999; pointer-events: none; opacity: 1;">
        <!-- Canvas wrapper with 14px safety padding so html2canvas NEVER clips any border edge -->
        <div id="printableReceiptA4" style="width: 760px; background: #ffffff; padding: 14px; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif;">
          <!-- Authentic Certificate Outer Frame with Double Border (Guaranteed 100% Closed on All 4 Sides) -->
          <div style="border: 2.5px solid #0F3D63; border-radius: 8px; padding: 22px 24px; box-sizing: border-box; background: #ffffff; position: relative; outline: 1px solid #cbd5e1; outline-offset: -5px;">
            
            <!-- Trust Header Branding -->
            <div class="text-center pb-2 border-bottom mb-2" style="border-bottom: 1.5px solid #e2e8f0 !important;">
              <img src="https://ik.imagekit.io/baaidzoik/assets/header-logo/ar_logo_1.png" alt="Ar Rahman Trust" height="48" class="mb-1" crossorigin="anonymous">
              <h2 class="fw-bold mb-0" style="color: #0F3D63; letter-spacing: 0.6px; font-size: 22px;">AR RAHMAN TRUST</h2>
              <div class="fw-semibold mt-1" style="color: #475569; font-size: 12px;">Helping Needy People &bull; Pernambut &amp; Surrounding Rural Villages</div>
              <div class="small text-muted mt-1" style="font-size: 10px;">
                Registered Charity No. <strong style="color: #0F3D63;">04/16/2020</strong> &bull; 112, Small Mosque Street, Pernambut, Vellore Dist., Tamil Nadu - 635810
              </div>
              <div class="d-inline-block mt-2 px-3 py-1 text-uppercase fw-bold" style="background: #e8f5e9; color: #166534; font-size: 11px; border-radius: 20px; border: 1.5px solid #86efac; letter-spacing: 0.5px;">
                Official Donation &amp; Zakat Receipt
              </div>
            </div>

            <!-- Receipt Meta Bar -->
            <div class="row g-2 mb-2 p-2 rounded-2" style="background: #f8fafc; font-size: 12.5px; border: 1px solid #e2e8f0;">
              <div class="col-4">
                <span class="text-muted" style="font-size: 10.5px;">Receipt Number:</span><br>
                <strong class="font-monospace text-primary fs-6">{{ activeReceipt?.receipt_number || ('ART-' + activeReceipt?.id) }}</strong>
              </div>
              <div class="col-4 text-center">
                <span class="text-muted" style="font-size: 10.5px;">Date of Contribution:</span><br>
                <strong class="text-dark">{{ activeReceipt?.created_at | date:'mediumDate' }}</strong>
              </div>
              <div class="col-4 text-end">
                <span class="text-muted" style="font-size: 10.5px;">Financial Year:</span><br>
                <strong class="text-dark">2026 - 2027</strong>
              </div>
            </div>

            <!-- Donor Information & Purpose Box -->
            <div class="p-2 p-sm-3 rounded-2 mb-2" style="background: #ffffff; border: 1px solid #cbd5e1;">
              <div class="row g-2 align-items-center">
                <div class="col-7">
                  <div class="small text-muted text-uppercase fw-bold" style="font-size: 10px; letter-spacing: 0.5px;">Received with thanks from:</div>
                  <div class="fw-bold fs-5 text-dark mt-1">{{ activeReceipt?.donor_name }}</div>
                  <div class="small text-secondary"><i class="bi bi-telephone me-1"></i> {{ activeReceipt?.donor_phone }}</div>
                  @if (activeReceipt?.donor_email) {
                    <div class="small text-muted"><i class="bi bi-envelope me-1"></i> {{ activeReceipt?.donor_email }}</div>
                  }
                </div>
                <div class="col-5 text-end">
                  <div class="small text-muted text-uppercase fw-bold" style="font-size: 10px; letter-spacing: 0.5px;">Contribution Purpose:</div>
                  <span class="badge text-uppercase fs-6 px-3 py-1 mt-1" [ngClass]="activeReceipt?.donation_type === 'zakat' ? 'bg-success' : 'bg-primary'">
                    {{ activeReceipt?.donation_type }} Donation
                  </span>
                  <div class="small text-muted mt-2">Mode: <strong class="text-uppercase text-dark">{{ activeReceipt?.payment_method }}</strong></div>
                  <div class="small font-monospace text-muted">Ref/UTR: {{ activeReceipt?.transaction_id || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <!-- Total Amount Received Box (Prominent Green Dashed Box) -->
            <div class="p-2 p-sm-3 rounded-2 mb-2 text-center" style="background: #f0fdf4; border: 2px dashed #22c55e;">
              <div class="small text-uppercase fw-bold" style="color: #166534; font-size: 11px; letter-spacing: 0.6px;">Total Amount Received</div>
              <div class="fw-bold text-success my-1" style="font-size: 32px;">
                ₹{{ activeReceipt?.amount | number:'1.2-2' }}
              </div>
              <div class="small fw-semibold text-uppercase" style="color: #15803d; letter-spacing: 0.5px; font-size: 11px;">
                {{ numberToWords(activeReceipt?.amount || 0) }}
              </div>
            </div>

            <!-- Islamic Dua / Blessing -->
            <div class="p-2 mb-2 text-center rounded-2" style="background: #f8fafc; border-left: 4px solid #0F3D63; font-size: 11.5px; color: #334155; font-style: italic;">
              "May Allah (SWT) accept your noble donation, multiply your reward manifold, and grant continuous barakah in your wealth, health, and family. Jazakallahu Khairan."
            </div>

            <!-- Trust Welfare & 100% Non-Profit Assurance -->
            <div class="p-2 mb-2 text-center rounded-2" style="background: #f1f5f9; font-size: 10px; color: #475569;">
              <i class="bi bi-shield-check text-success me-1"></i>
              Thank you for your noble contribution. 100% of donations are utilized directly for charitable welfare, medical relief, education aid, and ration distribution for needy families.
            </div>

            <!-- Official Stamp & Signatory Footer -->
            <div class="row pt-2 border-top align-items-center mb-2" style="border-top: 1.5px solid #e2e8f0 !important;">
              <div class="col-6">
                <div class="d-flex align-items-center gap-2">
                  <div class="rounded-circle d-flex align-items-center justify-content-center text-success border border-2 border-success" style="width: 44px; height: 44px; background: #ecfdf5;">
                    <i class="bi bi-shield-check fs-4"></i>
                  </div>
                  <div>
                    <div class="fw-bold text-success text-uppercase" style="font-size: 11px;">Verified &amp; Credited</div>
                    <div class="text-muted" style="font-size: 9.5px;">Official Seal &bull; Regd. 04/16/2020</div>
                    <div class="text-secondary" style="font-size: 9px;">Ar Rahman Trust &bull; Pernambut</div>
                  </div>
                </div>
              </div>
              <div class="col-6 text-end">
                <div class="fw-bold" style="color: #0F3D63; font-size: 13px;">Authorized Signatory</div>
                <div class="text-muted small">Managing Trustee &bull; Pernambut</div>
                <div class="text-secondary" style="font-size: 9.5px;">Ar Rahman Trust, Vellore Dist.</div>
              </div>
            </div>

            <!-- Bottom Legal / Verification Line (Fully Inside Closed Outer Frame) -->
            <div class="pt-2 border-top text-center text-muted" style="border-top: 1px dashed #cbd5e1 !important; font-size: 9.5px;">
              Official Electronic Charity Receipt &bull; Registered Charity No. <strong style="color: #0F3D63;">04/16/2020</strong> &bull; Ar Rahman Trust, Pernambut &bull; Helping Needy People
            </div>

          </div>
        </div>
      </div>
    }

    <!-- SEND RECEIPT WHATSAPP MODAL (Responsive for Windows & Mobile) -->
    @if (showWhatsAppModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.55);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable receipt-modal-dialog">
          <div class="modal-content border-0 shadow-lg receipt-modal-content">
            <div class="modal-header text-white py-2 px-3" style="background-color: #075E54;">
              <h6 class="modal-title fw-bold mb-0">
                <i class="bi bi-file-earmark-pdf-fill text-warning me-2"></i>Send PDF Receipt via WhatsApp
              </h6>
              <button type="button" class="btn-close btn-close-white" (click)="showWhatsAppModal.set(false)"></button>
            </div>
            <div class="modal-body p-3 p-sm-4 receipt-modal-body">
              <!-- Summary Card -->
              <div class="p-3 bg-light rounded-3 mb-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="badge bg-secondary font-monospace">{{ selectedWhatsAppDonation?.receipt_number || ('ART-' + selectedWhatsAppDonation?.id) }}</span>
                  <span class="badge bg-success text-uppercase">{{ selectedWhatsAppDonation?.donation_type }}</span>
                </div>
                <div class="fw-bold text-dark fs-5">{{ selectedWhatsAppDonation?.donor_name }}</div>
                <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                  <span class="small text-muted">Contributed Amount:</span>
                  <span class="fw-bold text-success fs-5">₹{{ selectedWhatsAppDonation?.amount | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Recipient Phone Input -->
              <div class="mb-3">
                <label class="form-label small fw-bold">Donor WhatsApp Mobile Number <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-white text-success"><i class="bi bi-whatsapp"></i></span>
                  <input 
                    type="text" 
                    class="form-control font-monospace" 
                    placeholder="e.g. +91 98450 12345 or 9845012345" 
                    [(ngModel)]="whatsAppPhone"
                    required
                  >
                </div>
                <div class="form-text small text-muted">
                  Supports Indian 10-digit mobile numbers or international numbers with country code.
                </div>
              </div>

              <!-- Direct Send Success Alert -->
              @if (directSendSuccess()) {
                <div class="alert alert-success d-flex align-items-center p-3 mb-3">
                  <i class="bi bi-check-circle-fill fs-4 me-2 text-success"></i>
                  <div>
                    <div class="fw-bold">Delivered!</div>
                    <div class="small">{{ directSendSuccess() }}</div>
                  </div>
                </div>
              }

              <!-- Direct Send Error Alert -->
              @if (directSendError()) {
                <div class="alert alert-danger d-flex align-items-center p-3 mb-3">
                  <i class="bi bi-exclamation-triangle-fill fs-4 me-2 text-danger"></i>
                  <div>
                    <div class="fw-bold">Send Failed</div>
                    <div class="small">{{ directSendError() }}</div>
                  </div>
                </div>
              }

              <!-- WhatsApp Automated Engine Connection Card -->
              @if (whatsAppStatus()?.connected) {
                <div class="p-3 rounded-3 mb-3 border bg-success-subtle text-success-emphasis d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-shield-fill-check fs-3 text-success"></i>
                    <div>
                      <div class="fw-bold small">WhatsApp Connected &amp; Ready</div>
                      <div class="text-muted small" style="font-size: 11px;">Linked account: <strong>+{{ whatsAppStatus()?.connectedNumber }}</strong></div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2" (click)="logoutWhatsApp()">Unlink</button>
                </div>
              } @else {
                <div class="border rounded-3 p-3 mb-3 bg-light text-center">
                  <div class="fw-bold text-dark small mb-1">
                    <i class="bi bi-qr-code-scan text-success me-1"></i>Link WhatsApp for 1-Click Sending (One-Time)
                  </div>
                  <p class="text-muted small mb-2" style="font-size: 11px;">
                    Open WhatsApp on phone ➔ <strong>Settings ➔ Linked Devices ➔ Link a Device</strong> and scan:
                  </p>
                  @if (whatsAppStatus()?.qr) {
                    <div class="d-inline-block bg-white p-2 rounded border shadow-sm">
                      <img [src]="whatsAppStatus()?.qr" alt="WhatsApp QR Code" style="width: 170px; height: 170px; display: block;">
                    </div>
                    <div class="text-muted small mt-1" style="font-size: 10px;">
                      <i class="bi bi-arrow-repeat me-1 spin"></i>Auto-refreshing status...
                    </div>
                  } @else {
                    <div class="p-3 text-muted small">
                      <span class="spinner-border spinner-border-sm me-1 text-success"></span> Generating WhatsApp QR Code...
                    </div>
                  }
                </div>
              }
            </div>
            <div class="modal-footer bg-light border-top py-2 px-3 d-flex flex-wrap justify-content-between gap-2">
              <button type="button" class="btn btn-outline-secondary btn-sm" [disabled]="isGeneratingPdf()" (click)="downloadReceiptPDF(selectedWhatsAppDonation)">
                <i class="bi bi-download me-1"></i> Download PDF
              </button>
              <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-secondary btn-sm" (click)="showWhatsAppModal.set(false)">
                  Cancel
                </button>
                @if (whatsAppStatus()?.connected) {
                  <!-- 100% AUTOMATED BACKGROUND DIRECT SEND BUTTON -->
                  <button 
                    type="button" 
                    class="btn btn-success btn-sm px-3 fw-bold" 
                    [disabled]="!whatsAppPhone || isSendingDirectPdf()" 
                    (click)="sendDirectWhatsAppPdf(selectedWhatsAppDonation)" 
                    style="background-color: #25D366; border-color: #25D366;"
                  >
                    @if (isSendingDirectPdf()) {
                      <span class="spinner-border spinner-border-sm me-1" role="status"></span> Sending PDF directly...
                    } @else {
                      <i class="bi bi-send-fill me-1"></i> Send PDF Directly to WhatsApp
                    }
                  </button>
                } @else {
                  <!-- Fallback open chat button if not linked yet -->
                  <button 
                    type="button" 
                    class="btn btn-success btn-sm px-3" 
                    [disabled]="!whatsAppPhone" 
                    (click)="sendReceiptPdfOnWhatsApp(selectedWhatsAppDonation)" 
                    style="background-color: #25D366; border-color: #25D366;"
                  >
                    <i class="bi bi-whatsapp me-1"></i> Open WhatsApp Web
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- WHATSAPP DONATION REMINDER MODAL (Single & Multiple Bulk Donors) -->
    @if (showReminderModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header text-white py-2 px-3" style="background: linear-gradient(135deg, #075E54, #128C7E);">
              <h6 class="modal-title fw-bold mb-0 d-flex align-items-center">
                <i class="bi bi-bell-fill text-warning me-2 fs-5"></i>
                Send WhatsApp Donation Reminder
                <span class="badge bg-white text-dark ms-2 fw-semibold" style="font-size: 11px;">
                  {{ reminderRecipients().length }} Donor{{ reminderRecipients().length > 1 ? 's' : '' }} Selected
                </span>
              </h6>
              <button type="button" class="btn-close btn-close-white" (click)="showReminderModal.set(false)"></button>
            </div>

            <div class="modal-body p-3 p-md-4">
              <!-- Recipient List Card -->
              <div class="p-3 bg-light rounded-3 mb-3 border">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small fw-bold text-uppercase text-secondary" style="font-size: 11px;">
                    Target Recipients ({{ reminderRecipients().length }})
                  </span>
                  @if (reminderRecipients().length > 1) {
                    <span class="small text-muted" style="font-size: 11px;">Click &times; on any badge to remove donor</span>
                  }
                </div>
                <div class="d-flex flex-wrap gap-2" style="max-height: 120px; overflow-y: auto;">
                  @for (r of reminderRecipients(); track r.id) {
                    <span class="badge bg-white text-dark border d-flex align-items-center gap-1 py-1 px-2 shadow-sm">
                      <i class="bi bi-person-fill text-primary"></i>
                      <strong>{{ r.donor_name }}</strong>
                      <span class="text-muted font-monospace" style="font-size: 10px;">{{ r.donor_phone }}</span>
                      <button type="button" class="btn-close ms-1" style="font-size: 8px;" (click)="removeRecipientFromReminder(r.id)"></button>
                    </span>
                  }
                </div>
              </div>

              <!-- Reminder Appeal Category / Template Selection -->
              <div class="row g-2 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold">Select Reminder Template</label>
                  <select class="form-select form-select-sm" [(ngModel)]="reminderTemplateType" (change)="onReminderTemplateChange()">
                    <option value="monthly">🌙 Monthly Donation Renewal Appeal</option>
                    <option value="friday">🕌 Jumu'ah (Friday) Sadaqah Appeal</option>
                    <option value="food">🍲 Food &amp; Ration Kit Distribution Drive</option>
                    <option value="medical">🏥 Emergency Medical Relief Appeal</option>
                    <option value="custom">✏️ Custom Message</option>
                  </select>
                </div>
                <div class="col-12 col-md-6 d-flex align-items-end">
                  <div class="small text-muted p-2 rounded bg-light border w-100" style="font-size: 11px;">
                    <strong>Available Placeholders:</strong> <code>&#123;name&#125;</code> (donor name), <code>&#123;cause&#125;</code> (purpose), <code>&#123;amount&#125;</code>
                  </div>
                </div>
              </div>

              <!-- Message Textarea -->
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label small fw-bold mb-0">Message Content (WhatsApp Formatted)</label>
                  <span class="small text-muted" style="font-size: 11px;">Supports *bold*, _italic_</span>
                </div>
                <textarea 
                  class="form-control font-monospace" 
                  rows="9" 
                  [(ngModel)]="reminderCustomMessage"
                  style="font-size: 12.5px; line-height: 1.5;"
                  placeholder="Type your reminder message here..."
                  required
                ></textarea>
              </div>

              <!-- Progress & Success/Error Alerts -->
              @if (reminderProgress()) {
                <div class="alert alert-info d-flex align-items-center p-3 mb-3">
                  <span class="spinner-border spinner-border-sm me-2 text-info" role="status"></span>
                  <div>
                    <div class="fw-bold small">Sending in Progress...</div>
                    <div class="small">{{ reminderProgress() }}</div>
                  </div>
                </div>
              }

              @if (reminderSuccess()) {
                <div class="alert alert-success d-flex align-items-center p-3 mb-3">
                  <i class="bi bi-check-circle-fill fs-4 me-2 text-success"></i>
                  <div>
                    <div class="fw-bold">Delivered!</div>
                    <div class="small">{{ reminderSuccess() }}</div>
                  </div>
                </div>
              }

              @if (reminderError()) {
                <div class="alert alert-danger d-flex align-items-center p-3 mb-3">
                  <i class="bi bi-exclamation-triangle-fill fs-4 me-2 text-danger"></i>
                  <div>
                    <div class="fw-bold">Send Failed</div>
                    <div class="small">{{ reminderError() }}</div>
                  </div>
                </div>
              }

              <!-- WhatsApp Automated Engine Connection Status Card -->
              @if (whatsAppStatus()?.connected) {
                <div class="p-2 px-3 rounded-2 mb-2 border bg-success-subtle text-success-emphasis d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-shield-fill-check fs-4 text-success"></i>
                    <div>
                      <div class="fw-bold small">WhatsApp Connected &amp; Ready</div>
                      <div class="text-muted small" style="font-size: 11px;">Linked sender account: <strong>+{{ whatsAppStatus()?.connectedNumber }}</strong></div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2" (click)="logoutWhatsApp()">Unlink</button>
                </div>
              } @else {
                <div class="border rounded-3 p-3 mb-2 bg-light text-center">
                  <div class="fw-bold text-dark small mb-1">
                    <i class="bi bi-qr-code-scan text-success me-1"></i>Link WhatsApp for 1-Click Sending (One-Time)
                  </div>
                  <p class="text-muted small mb-2" style="font-size: 11px;">
                    Open WhatsApp on phone ➔ <strong>Settings ➔ Linked Devices ➔ Link a Device</strong> and scan:
                  </p>
                  @if (whatsAppStatus()?.qr) {
                    <div class="d-inline-block bg-white p-2 rounded border shadow-sm">
                      <img [src]="whatsAppStatus()?.qr" alt="WhatsApp QR Code" style="width: 150px; height: 150px; display: block;">
                    </div>
                  } @else {
                    <div class="p-2 text-muted small">
                      <span class="spinner-border spinner-border-sm me-1 text-success"></span> Generating WhatsApp QR Code...
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer bg-light border-top py-2 px-3 d-flex flex-wrap justify-content-between gap-2">
              <button type="button" class="btn btn-secondary btn-sm" (click)="showReminderModal.set(false)">
                Cancel
              </button>

              <div class="d-flex flex-wrap gap-2">
                @if (reminderRecipients().length === 1 && !whatsAppStatus()?.connected) {
                  <!-- Fallback open chat in WhatsApp Web for single recipient if server is not connected -->
                  <button 
                    type="button" 
                    class="btn btn-outline-success btn-sm px-3"
                    (click)="openReminderInWhatsAppWeb(reminderRecipients()[0])"
                  >
                    <i class="bi bi-whatsapp me-1"></i> Open in WhatsApp Web
                  </button>
                }

                @if (whatsAppStatus()?.connected) {
                  <!-- Direct 1-Click Automated Sending Button -->
                  <button 
                    type="button" 
                    class="btn btn-success btn-sm px-3 fw-bold" 
                    [disabled]="!reminderRecipients().length || !reminderCustomMessage.trim() || isSendingReminder()" 
                    (click)="sendWhatsAppReminders()" 
                    style="background-color: #25D366; border-color: #25D366;"
                  >
                    @if (isSendingReminder()) {
                      <span class="spinner-border spinner-border-sm me-1" role="status"></span> Sending Reminders...
                    } @else {
                      <i class="bi bi-send-fill me-1"></i> Send Reminders Directly ({{ reminderRecipients().length }})
                    }
                  </button>
                } @else {
                  <button 
                    type="button" 
                    class="btn btn-success btn-sm px-3" 
                    disabled
                    style="background-color: #25D366; border-color: #25D366;"
                  >
                    <i class="bi bi-qr-code-scan me-1"></i> Scan QR Above to Send
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class DonationsComponent implements OnInit {
  isLoading = signal(true);
  isSubmitting = signal(false);
  donations = signal<Donation[]>([]);
  totalDonations = signal(0);
  totalPages = signal(1);
  currentPage = 1;

  searchQuery = '';
  selectedType = '';
  selectedStatus = '';

  showFormModal = signal(false);
  isEditing = signal(false);
  formData: any = {};

  showReceiptModal = signal(false);
  activeReceipt: Donation | null = null;

  showWhatsAppModal = signal(false);
  selectedWhatsAppDonation: Donation | null = null;
  whatsAppPhone = '';
  whatsAppMessagePreview = '';
  copySuccess = signal(false);
  isGeneratingPdf = signal(false);
  pdfDownloadedNotice = signal(false);

  whatsAppStatus = signal<WhatsAppStatus | null>(null);
  isSendingDirectPdf = signal(false);
  directSendSuccess = signal<string | null>(null);
  directSendError = signal<string | null>(null);
  private statusPollTimer: any = null;

  // Selection state for single & bulk reminders
  selectedDonationIds = signal<Set<number>>(new Set());

  isAllSelected = computed(() => {
    const list = this.donations();
    if (!list.length) return false;
    const selected = this.selectedDonationIds();
    return list.every(d => selected.has(d.id));
  });

  isSomeSelected = computed(() => {
    const list = this.donations();
    if (!list.length) return false;
    const selected = this.selectedDonationIds();
    const count = list.filter(d => selected.has(d.id)).length;
    return count > 0 && count < list.length;
  });

  // Reminder Modal State
  showReminderModal = signal(false);
  reminderRecipients = signal<Donation[]>([]);
  reminderTemplateType = 'monthly';
  reminderCustomMessage = '';
  isSendingReminder = signal(false);
  reminderSuccess = signal<string | null>(null);
  reminderError = signal<string | null>(null);
  reminderProgress = signal<string | null>(null);

  reminderTemplates: { [key: string]: string } = {
    monthly: `*AR RAHMAN TRUST - MONTHLY SADAQAH REMINDER*
_Helping Needy People • Pernambut & Surrounding Villages_
*Regd. Charity No:* 04/16/2020
----------------------------------------
Assalamu Alaikum wa Rahmatullahi wa Barakatuh *{name}*,

We pray this message reaches you and your family in good health and highest iman.

As Allah (SWT) reminds us in the Holy Quran:
_"The example of those who spend their wealth in the way of Allah is like a seed of grain which grows seven spikes; in each spike is a hundred grains." (Al-Baqarah 2:261)_

Your noble past contributions have brought direct food, emergency medicine, and educational aid to needy families across Pernambut.

As our charity drives continue for this month, we humbly invite you to renew your noble contribution for:
🤲 *{cause}*

💳 *Trust Official Bank & UPI Details:*
• *Bank:* State Bank of India (Pernambut Branch)
• *Account Name:* Ar Rahman Trust
• *Account No:* 39485710293
• *IFSC Code:* SBIN0001824
• *UPI ID / GPay / PhonePe:* arrahmantrust@sbi
• *Registered Charity No:* 04/16/2020

"May Allah (SWT) accept your charity, grant immense barakah in your wealth, and safeguard your family. Jazakallahu Khairan."

*Ar Rahman Trust, Pernambut*
📞 Inquiries / Office: +91 96290 88776`,

    friday: `*JUMU'AH MUBARAK - NOBLE SADAQAH APPEAL*
*Ar Rahman Trust, Pernambut* • *Regd. No:* 04/16/2020
----------------------------------------
Assalamu Alaikum *{name}*,

Jumu'ah Mubarak! On this auspicious day of Friday, our Prophet (ﷺ) reminded us:
_"Giving charity on Friday is better than giving it on any other day of the week."_

We invite you to earn multiplied continuous rewards (Sadaqah Jariyah) today by contributing to:
🤲 *{cause}*

💳 *Quick UPI / Online Transfer:*
• *UPI ID:* arrahmantrust@sbi
• *GPay / PhonePe / Paytm Accepted*
• *Bank:* SBI Pernambut | A/C: 39485710293 (IFSC: SBIN0001824)

May Allah (SWT) accept your prayers, multiply your sustenance, and protect your loved ones. Jazakallahu Khairan!

*Ar Rahman Trust, Pernambut*`,

    food: `*URGENT FOOD & RATION KIT DRIVE - AR RAHMAN TRUST*
_Pernambut & Surrounding Rural Villages_ • *Regd:* 04/16/2020
----------------------------------------
Assalamu Alaikum *{name}*,

Ar Rahman Trust is currently distributing essential monthly dry food kits (rice, oil, dal, spices) and cooked meals to vulnerable widows, daily-wage laborers, and destitute elderly families in Pernambut.

🤲 *Each Ration Kit:* ₹1,500
🤲 *Hot Meals for 50 People:* ₹2,500

We humbly request your generous support to ensure no poor family in our villages sleeps hungry tonight.

💳 *Send Contribution via UPI / Bank:*
• *UPI ID:* arrahmantrust@sbi
• *Bank:* State Bank of India (A/C: 39485710293 | IFSC: SBIN0001824)

"Whoever feeds a hungry person, Allah will feed him from the fruits of Paradise." (Tirmidhi)

*Ar Rahman Trust, Pernambut*`,

    medical: `*EMERGENCY MEDICAL RELIEF APPEAL - AR RAHMAN TRUST*
_Pernambut & Vellore Dist._ • *Regd. Charity No:* 04/16/2020
----------------------------------------
Assalamu Alaikum *{name}*,

Ar Rahman Trust has received urgent appeals from impoverished village families struggling to afford life-saving medications, dialysis, and emergency surgeries for elderly patients and sick children.

We humbly seek your kind assistance to provide critical medical aid for these deserving patients:
🤲 *Urgent Healthcare Relief:* {cause}

💳 *Official Trust Payment Details:*
• *UPI ID:* arrahmantrust@sbi
• *Bank Transfer:* SBI Pernambut | A/C: 39485710293 | IFSC: SBIN0001824

"Whoever relieves a Muslim of a burden from this world, Allah will relieve him of a burden on the Day of Resurrection." (Muslim)

*Ar Rahman Trust, Pernambut*`,

    custom: `*AR RAHMAN TRUST - CHARITY APPEAL*
_Pernambut, Vellore Dist._ • *Regd:* 04/16/2020
----------------------------------------
Assalamu Alaikum *{name}*,

We pray you and your family are in good health.

Ar Rahman Trust invites your kind support for our ongoing welfare programs:
🤲 *{cause}*

💳 *UPI ID:* arrahmantrust@sbi
• *Bank:* State Bank of India (A/C: 39485710293 | IFSC: SBIN0001824)

Jazakallahu Khairan for your continuous benevolence and trust.

*Ar Rahman Trust, Pernambut*`
  };

  constructor(private apiService: ApiService, private whatsappService: WhatsAppService) {}

  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations(): void {
    this.isLoading.set(true);
    this.apiService.getDonations({
      page: this.currentPage,
      limit: 10,
      search: this.searchQuery,
      type: this.selectedType,
      status: this.selectedStatus
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.donations.set(res.data);
          this.totalDonations.set(res.pagination.total);
          this.totalPages.set(res.pagination.totalPages);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadDonations();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadDonations();
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.formData = {
      donor_name: '',
      donor_phone: '',
      donor_email: '',
      amount: 1000,
      donation_type: 'sadaqah',
      payment_method: 'upi',
      status: 'verified',
      transaction_id: '',
      notes: ''
    };
    this.showFormModal.set(true);
  }

  openEditModal(item: Donation): void {
    this.isEditing.set(true);
    this.formData = { ...item };
    this.showFormModal.set(true);
  }

  saveDonation(): void {
    this.isSubmitting.set(true);
    if (this.isEditing()) {
      this.apiService.updateDonation(this.formData.id, this.formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showFormModal.set(false);
          this.loadDonations();
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.apiService.createDonation(this.formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showFormModal.set(false);
          this.loadDonations();
        },
        error: () => this.isSubmitting.set(false)
      });
    }
  }

  deleteDonation(id: number): void {
    if (confirm('Are you sure you want to delete this donation record?')) {
      this.apiService.deleteDonation(id).subscribe({
        next: () => this.loadDonations()
      });
    }
  }

  viewReceipt(item: Donation): void {
    this.activeReceipt = item;
    this.showReceiptModal.set(true);
  }

  printReceipt(item?: Donation): void {
    if (item) {
      this.activeReceipt = item;
      this.showReceiptModal.set(true);
    }
    setTimeout(() => {
      window.print();
    }, 150);
  }

  numberToWords(num: number): string {
    if (!num) return 'Zero Rupees Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      let str = '';
      if (n >= 10000000) {
        str += inWords(Math.floor(n / 10000000)) + ' Crore ';
        n %= 10000000;
      }
      if (n >= 100000) {
        str += inWords(Math.floor(n / 100000)) + ' Lakh ';
        n %= 100000;
      }
      if (n >= 1000) {
        str += inWords(Math.floor(n / 1000)) + ' Thousand ';
        n %= 1000;
      }
      if (n >= 100) {
        str += inWords(Math.floor(n / 100)) + ' Hundred ';
        n %= 100;
      }
      if (n > 0) {
        if (str !== '') str += 'and ';
        if (n < 20) str += a[n] + ' ';
        else str += b[Math.floor(n / 10)] + ' ' + a[n % 10] + ' ';
      }
      return str.trim();
    };

    const integerPart = Math.floor(num);
    return inWords(integerPart) + ' Rupees Only';
  }

  downloadReceiptPDF(donation: Donation | null): void {
    if (!donation) return;
    this.activeReceipt = donation;
    this.isGeneratingPdf.set(true);

    const receiptNo = donation.receipt_number || ('ART-' + donation.id);
    const fileName = `Ar_Rahman_Trust_Receipt_${receiptNo}.pdf`;

    setTimeout(() => {
      // Prioritize the fixed 760px offscreen template to guarantee consistent proportions across Windows & Mobile
      const element = document.getElementById('printableReceiptA4') || document.getElementById('printableReceiptModal');
      const win = window as any;

      if (win.html2pdf && element) {
        const rect = element.getBoundingClientRect();
        const elemWidth = rect.width || 760;
        const elemHeight = rect.height || 660;
        const pdfWidthMm = 210;
        // Tailored height matching exact voucher aspect ratio so there is ZERO blank white void at the bottom
        const contentHeightMm = (elemHeight / elemWidth) * (pdfWidthMm - 8);
        const pdfHeightMm = Math.ceil(contentHeightMm + 8);

        const opt = {
          margin: [4, 4, 4, 4],
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2.5, useCORS: true, logging: false, scrollY: 0 },
          jsPDF: { unit: 'mm', format: [pdfWidthMm, pdfHeightMm], orientation: 'portrait' },
          pagebreak: { mode: 'avoid-all' }
        };

        win.html2pdf().set(opt).from(element).save().then(() => {
          this.isGeneratingPdf.set(false);
          this.pdfDownloadedNotice.set(true);
          setTimeout(() => this.pdfDownloadedNotice.set(false), 8000);
        }).catch((err: any) => {
          console.error('Client PDF generation error, falling back to backend PDF download:', err);
          this.isGeneratingPdf.set(false);
          window.open(`http://localhost:5000/api/donations/${donation.id}/pdf`, '_blank');
        });
      } else {
        this.isGeneratingPdf.set(false);
        window.open(`http://localhost:5000/api/donations/${donation.id}/pdf`, '_blank');
      }
    }, 200);
  }

  sendReceiptPdfOnWhatsApp(donation: Donation | null): void {
    if (!donation) return;

    let cleanPhone = (this.whatsAppPhone || donation.donor_phone || '').replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) cleanPhone = '91' + cleanPhone.substring(1);

    // 1. Download the exact designed PDF receipt
    this.downloadReceiptPDF(donation);

    // 2. Open WhatsApp directly to that phone number with NO prefilled text
    const phoneParam = cleanPhone ? `phone=${cleanPhone}` : '';
    const waUrl = `https://web.whatsapp.com/send?${phoneParam}`;
    
    // Open WhatsApp Web directly to chat with this number
    window.open(waUrl, '_blank');

    this.showWhatsAppModal.set(false);
  }

  openDirectWhatsAppPage(pdfBlob: Blob | null, fileName: string, cleanPhone: string, donation: Donation): void {
    this.sendReceiptPdfOnWhatsApp(donation);
  }

  openWhatsAppModal(item: Donation | null): void {
    if (!item) return;
    this.selectedWhatsAppDonation = item;
    this.activeReceipt = item;
    this.whatsAppPhone = item.donor_phone || '';
    this.directSendSuccess.set(null);
    this.directSendError.set(null);
    this.showWhatsAppModal.set(true);
    this.pollWhatsAppStatus();
  }

  pollWhatsAppStatus(): void {
    this.whatsappService.getStatus().subscribe({
      next: (res) => {
        if (res.success) {
          this.whatsAppStatus.set(res.data);
        }
      }
    });

    if (this.statusPollTimer) clearInterval(this.statusPollTimer);
    this.statusPollTimer = setInterval(() => {
      if (!this.showWhatsAppModal()) {
        clearInterval(this.statusPollTimer);
        return;
      }
      this.whatsappService.getStatus().subscribe({
        next: (res) => {
          if (res.success) {
            this.whatsAppStatus.set(res.data);
          }
        }
      });
    }, 2500);
  }

  logoutWhatsApp(): void {
    this.whatsappService.logout().subscribe({
      next: () => {
        this.pollWhatsAppStatus();
      }
    });
  }

  sendDirectWhatsAppPdf(donation: Donation | null): void {
    if (!donation || !this.whatsAppPhone) return;
    this.isSendingDirectPdf.set(true);
    this.directSendError.set(null);
    this.directSendSuccess.set(null);

    const receiptNo = donation.receipt_number || ('ART-' + donation.id);
    const fileName = `Ar_Rahman_Trust_Receipt_${receiptNo}.pdf`;
    const element = document.getElementById('printableReceiptA4') || document.getElementById('printableReceiptModal');
    const win = window as any;

    if (win.html2pdf && element) {
      const rect = element.getBoundingClientRect();
      const elemWidth = rect.width || 760;
      const elemHeight = rect.height || 660;
      const pdfWidthMm = 210;
      // Tailored height matching exact voucher aspect ratio so there is ZERO blank white void at the bottom
      const contentHeightMm = (elemHeight / elemWidth) * (pdfWidthMm - 8);
      const pdfHeightMm = Math.ceil(contentHeightMm + 8);

      const opt = {
        margin: [4, 4, 4, 4],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.5, useCORS: true, logging: false, scrollY: 0 },
        jsPDF: { unit: 'mm', format: [pdfWidthMm, pdfHeightMm], orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      };

      // Generate the EXACT same design PDF directly from the voucher!
      win.html2pdf().set(opt).from(element).output('blob').then((pdfBlob: Blob) => {
        this.whatsappService.sendPdfDirect(donation.id, this.whatsAppPhone, pdfBlob, fileName).subscribe({
          next: (res) => {
            this.isSendingDirectPdf.set(false);
            if (res.success) {
              this.directSendSuccess.set(res.message);
              setTimeout(() => {
                this.showWhatsAppModal.set(false);
                this.directSendSuccess.set(null);
              }, 3500);
            }
          },
          error: (err) => {
            this.isSendingDirectPdf.set(false);
            this.directSendError.set(err.error?.message || 'Failed to send WhatsApp PDF. Please check connection.');
          }
        });
      }).catch((err: any) => {
        console.error('PDF generation error, fallback to backend PDF:', err);
        this.dispatchBackendDirectPdf(donation);
      });
    } else {
      this.dispatchBackendDirectPdf(donation);
    }
  }

  private dispatchBackendDirectPdf(donation: Donation): void {
    this.whatsappService.sendPdfDirect(donation.id, this.whatsAppPhone).subscribe({
      next: (res) => {
        this.isSendingDirectPdf.set(false);
        if (res.success) {
          this.directSendSuccess.set(res.message);
          setTimeout(() => {
            this.showWhatsAppModal.set(false);
            this.directSendSuccess.set(null);
          }, 3500);
        }
      },
      error: (err) => {
        this.isSendingDirectPdf.set(false);
        this.directSendError.set(err.error?.message || 'Failed to send WhatsApp PDF. Please check connection.');
      }
    });
  }

  toggleSelect(id: number): void {
    const current = new Set(this.selectedDonationIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedDonationIds.set(current);
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    const current = new Set(this.selectedDonationIds());
    const list = this.donations();
    if (checked) {
      list.forEach(d => current.add(d.id));
    } else {
      list.forEach(d => current.delete(d.id));
    }
    this.selectedDonationIds.set(current);
  }

  clearSelection(): void {
    this.selectedDonationIds.set(new Set());
  }

  isSelected(id: number): boolean {
    return this.selectedDonationIds().has(id);
  }

  openSingleReminderModal(donation: Donation): void {
    this.reminderRecipients.set([donation]);
    this.reminderTemplateType = 'monthly';
    this.reminderCustomMessage = this.reminderTemplates['monthly'];
    this.reminderSuccess.set(null);
    this.reminderError.set(null);
    this.reminderProgress.set(null);
    this.showReminderModal.set(true);
    this.pollWhatsAppStatus();
  }

  openBulkReminderModal(): void {
    const selectedIds = this.selectedDonationIds();
    const all = this.donations();
    const recipients = all.filter(d => selectedIds.has(d.id));
    if (!recipients.length) return;
    this.reminderRecipients.set(recipients);
    this.reminderTemplateType = 'monthly';
    this.reminderCustomMessage = this.reminderTemplates['monthly'];
    this.reminderSuccess.set(null);
    this.reminderError.set(null);
    this.reminderProgress.set(null);
    this.showReminderModal.set(true);
    this.pollWhatsAppStatus();
  }

  removeRecipientFromReminder(donationId: number): void {
    const updated = this.reminderRecipients().filter(d => d.id !== donationId);
    this.reminderRecipients.set(updated);
    if (!updated.length) {
      this.showReminderModal.set(false);
    }
  }

  onReminderTemplateChange(): void {
    this.reminderCustomMessage = this.reminderTemplates[this.reminderTemplateType] || '';
  }

  sendWhatsAppReminders(): void {
    const recipients = this.reminderRecipients();
    if (!recipients.length || !this.reminderCustomMessage.trim()) return;

    this.isSendingReminder.set(true);
    this.reminderError.set(null);
    this.reminderSuccess.set(null);
    this.reminderProgress.set(`Delivering to ${recipients.length} donor(s)...`);

    this.whatsappService.sendReminder({
      recipients: recipients.map(d => ({
        id: d.id,
        donor_name: d.donor_name,
        donor_phone: d.donor_phone,
        donation_type: d.donation_type,
        amount: d.amount
      })),
      messageTemplate: this.reminderCustomMessage
    }).subscribe({
      next: (res) => {
        this.isSendingReminder.set(false);
        this.reminderProgress.set(null);
        if (res.success) {
          this.reminderSuccess.set(`Successfully delivered WhatsApp reminder to ${res.summary.sent} donor(s)!`);
          this.clearSelection();
          setTimeout(() => {
            this.showReminderModal.set(false);
            this.reminderSuccess.set(null);
          }, 3500);
        }
      },
      error: (err) => {
        this.isSendingReminder.set(false);
        this.reminderProgress.set(null);
        this.reminderError.set(err.error?.message || 'Failed to send WhatsApp reminder. Please check server connection.');
      }
    });
  }

  openReminderInWhatsAppWeb(donation: Donation): void {
    let cleanPhone = (donation.donor_phone || '').replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) cleanPhone = '91' + cleanPhone.substring(1);

    const message = this.reminderCustomMessage
      .replace(/\{name\}/gi, donation.donor_name)
      .replace(/\{cause\}/gi, (donation.donation_type || 'General').toUpperCase())
      .replace(/\{amount\}/gi, `₹${Number(donation.amount).toLocaleString('en-IN')}`);

    const waUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    this.showReminderModal.set(false);
  }

  exportToCSV(): void {
    const data = this.donations();
    if (!data.length) return;

    const headers = ['Receipt No', 'Donor Name', 'Phone', 'Email', 'Amount', 'Type', 'Method', 'Transaction ID', 'Status', 'Date'];
    const rows = data.map(d => [
      `"${d.receipt_number || d.id}"`,
      `"${d.donor_name}"`,
      `"${d.donor_phone}"`,
      `"${d.donor_email || ''}"`,
      d.amount,
      `"${d.donation_type}"`,
      `"${d.payment_method}"`,
      `"${d.transaction_id || ''}"`,
      `"${d.status}"`,
      `"${d.created_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ar_Rahman_Trust_Donations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
