import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Role, UserRoleItem, AvailablePage } from '../../core/models/models';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="roles-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold mb-1" style="color: #0F3D63;">Roles & Page Access Control (RBAC)</h2>
          <p class="text-muted small mb-0">Configure staff roles and control which pages and features each user can access.</p>
        </div>
        <div class="d-flex gap-2">
          @if (activeTab() === 'roles') {
            <button class="btn btn-trust-primary btn-sm" (click)="openCreateRoleModal()">
              <i class="bi bi-shield-plus me-1"></i> Create New Role
            </button>
          }
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills mb-4 gap-2">
        <li class="nav-item">
          <button 
            class="btn btn-sm" 
            [ngClass]="activeTab() === 'roles' ? 'btn-trust-primary' : 'btn-outline-secondary'" 
            (click)="activeTab.set('roles')"
          >
            <i class="bi bi-shield-shaded me-1"></i> Roles & Page Permissions ({{ roles().length }})
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="btn btn-sm" 
            [ngClass]="activeTab() === 'users' ? 'btn-trust-primary' : 'btn-outline-secondary'" 
            (click)="activeTab.set('users')"
          >
            <i class="bi bi-people-fill me-1"></i> User Access Assignment ({{ users().length }})
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

      <!-- TAB 1: ROLES & PAGE PERMISSIONS -->
      @if (activeTab() === 'roles') {
        @if (isLoading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted small mt-2">Loading roles & permissions...</p>
          </div>
        } @else {
          <div class="row g-3 mb-4">
            @for (role of roles(); track role.id) {
              <div class="col-12 col-md-6 col-xl-4">
                <div class="admin-card h-100 p-3.5 d-flex flex-column justify-content-between position-relative" style="border-top: 3px solid #0F3D63;">
                  <div>
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <div class="d-flex align-items-center gap-2">
                        <div class="rounded-circle d-flex align-items-center justify-content-center text-primary" style="width: 36px; height: 36px; background: #e0f2fe;">
                          <i class="bi bi-shield-check fs-5"></i>
                        </div>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">{{ role.name }}</h6>
                          <div class="text-muted" style="font-size: 11px;">
                            {{ role.user_count || 0 }} user(s) assigned
                          </div>
                        </div>
                      </div>
                      @if (role.is_system) {
                        <span class="badge bg-secondary-subtle text-secondary border small" style="font-size: 10px;">System Standard</span>
                      }
                    </div>

                    <p class="text-muted small mb-3" style="font-size: 12px; min-height: 34px;">
                      {{ role.description || 'No description provided.' }}
                    </p>

                    <!-- Allowed Pages Badges -->
                    <div class="mb-3">
                      <div class="small fw-bold text-dark text-uppercase mb-1.5" style="font-size: 10.5px; letter-spacing: 0.5px;">
                        Allowed Page Access:
                      </div>
                      <div class="d-flex flex-wrap gap-1">
                        @if (role.permissions.includes('*')) {
                          <span class="badge bg-success-subtle text-success border border-success-subtle">
                            <i class="bi bi-check-all me-1"></i> Full Unrestricted Access (All Pages)
                          </span>
                        } @else {
                          @for (page of availablePages(); track page.key) {
                            @if (role.permissions.includes(page.key)) {
                              <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 11px;">
                                <i class="bi bi-check2 me-1"></i>{{ page.name }}
                              </span>
                            }
                          }
                          @if (role.permissions.length === 0) {
                            <span class="badge bg-warning-subtle text-warning border border-warning-subtle" style="font-size: 11px;">
                              No pages permitted
                            </span>
                          }
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="border-top pt-2.5 mt-2 d-flex justify-content-between align-items-center">
                    <span class="text-muted" style="font-size: 11px;">
                      {{ role.permissions.includes('*') ? 'All Modules' : (role.permissions.length + ' page(s)') }}
                    </span>
                    <div class="d-flex gap-1">
                      <button class="btn btn-sm btn-outline-primary py-1 px-2" (click)="openEditRoleModal(role)" title="Edit Page Permissions">
                        <i class="bi bi-pencil-square me-1"></i> Edit
                      </button>
                      @if (!role.is_system) {
                        <button class="btn btn-sm btn-outline-danger py-1 px-2" (click)="deleteRole(role)" title="Delete Role">
                          <i class="bi bi-trash"></i>
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- TAB 2: USER ACCESS ASSIGNMENT -->
      @if (activeTab() === 'users') {
        @if (isLoading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted small mt-2">Loading user permissions...</p>
          </div>
        } @else {
          <!-- User Search & Count Bar -->
          <div class="admin-card p-3 mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
            <div class="small text-muted">
              Managing access for <strong>{{ users().length }}</strong> registered administrative users.
            </div>
            <div class="input-group input-group-sm" style="max-width: 280px;">
              <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control" placeholder="Search user by name or email..." [(ngModel)]="userSearch">
            </div>
          </div>

          <!-- Users Access Table -->
          <div class="admin-card mb-4">
            <div class="table-responsive admin-table-scroll">
              <table class="table admin-table mb-0 align-middle" style="min-width: 760px;">
                <thead class="sticky-top bg-light" style="top: 0; z-index: 5; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                  <tr>
                    <th style="min-width: 170px;">Staff Member</th>
                    <th style="min-width: 140px;">Assigned Role</th>
                    <th style="min-width: 280px;">Allowed Page Permissions</th>
                    <th class="text-end" style="min-width: 120px;">Access Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of filteredUsers(); track u.id) {
                    <tr>
                      <td>
                        <div class="d-flex align-items-center gap-2">
                          <div class="avatar-sm rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                            {{ u.name.charAt(0).toUpperCase() }}
                          </div>
                          <div>
                            <div class="fw-bold text-dark">{{ u.name }}</div>
                            <div class="text-muted small" style="font-size: 11px;">{{ u.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge text-uppercase px-2.5 py-1.5" [ngClass]="{
                          'bg-danger': u.is_superadmin,
                          'bg-primary': !u.is_superadmin && (u.role.includes('Trustee') || u.role.includes('admin')),
                          'bg-success': u.role.includes('Finance') || u.role.includes('Accountant'),
                          'bg-info text-dark': u.role.includes('Welfare') || u.role.includes('Media'),
                          'bg-secondary': !u.is_superadmin
                        }">
                          {{ u.role }}
                        </span>
                        @if (u.custom_permissions) {
                          <div class="text-muted mt-1" style="font-size: 10px;">
                            <i class="bi bi-sliders me-1"></i>Custom Overrides
                          </div>
                        }
                      </td>
                      <td>
                        <div class="d-flex flex-wrap gap-1">
                          @if (u.effective_permissions.includes('*')) {
                            <span class="badge bg-success-subtle text-success border border-success-subtle">
                              <i class="bi bi-check-all me-1"></i> All Pages Allowed (Super Admin)
                            </span>
                          } @else {
                            @for (page of availablePages(); track page.key) {
                              @if (u.effective_permissions.includes(page.key)) {
                                <span class="badge bg-light text-dark border" style="font-size: 11px;">
                                  {{ page.name }}
                                </span>
                              }
                            }
                            @if (u.effective_permissions.length === 0) {
                              <span class="badge bg-danger-subtle text-danger border border-danger-subtle" style="font-size: 11px;">
                                No page permissions
                              </span>
                            }
                          }
                        </div>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary py-1 px-2.5" (click)="openAssignUserModal(u)">
                          <i class="bi bi-key-fill me-1"></i> Assign Access
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="text-center py-4 text-muted">
                        No users found matching your search.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }
    </div>

    <!-- MODAL 1: CREATE / EDIT ROLE -->
    @if (showRoleModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.55); z-index: 1055;" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg rounded-3">
            <div class="modal-header text-white" style="background-color: #0F3D63;">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-shield-shaded me-2"></i>
                {{ isEditingRole() ? 'Edit Role & Page Permissions' : 'Create New Staff Role' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="showRoleModal.set(false)"></button>
            </div>
            <div class="modal-body p-4">
              <form (ngSubmit)="saveRole()">
                <div class="mb-3">
                  <label class="form-label small fw-bold">Role Title / Designation *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="roleForm.name" 
                    name="roleName" 
                    placeholder="e.g. Donation Cashier, Volunteer Head, Medical Aid Manager"
                    [disabled]="isEditingRole() && !!selectedRole?.is_system"
                    required
                  >
                  @if (isEditingRole() && selectedRole?.is_system) {
                    <div class="form-text small text-muted">System standard role titles cannot be renamed.</div>
                  }
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-bold">Role Description</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="roleForm.description" 
                    name="roleDescription" 
                    placeholder="Brief summary of duties and permissions..."
                  >
                </div>

                <!-- Page Access Checkboxes Matrix -->
                <div class="mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label small fw-bold mb-0">Allow Access to Specific Pages *</label>
                    <div class="d-flex gap-2">
                      <button type="button" class="btn btn-link btn-sm text-decoration-none p-0" (click)="toggleAllPages(true)">Select All</button>
                      <span class="text-muted">&bull;</span>
                      <button type="button" class="btn btn-link btn-sm text-decoration-none p-0 text-secondary" (click)="toggleAllPages(false)">Clear All</button>
                    </div>
                  </div>

                  <div class="row g-2">
                    @for (page of availablePages(); track page.key) {
                      <div class="col-12 col-sm-6">
                        <label class="d-flex align-items-start gap-2 p-2.5 rounded-2 border cursor-pointer h-100" [ngClass]="isPageSelected(page.key) ? 'bg-light border-primary' : 'bg-white'">
                          <input 
                            type="checkbox" 
                            class="form-check-input mt-1" 
                            [checked]="isPageSelected(page.key)"
                            (change)="togglePage(page.key)"
                          >
                          <div class="flex-grow-1">
                            <div class="fw-semibold small text-dark">{{ page.name }}</div>
                            <div class="text-muted" style="font-size: 11px;">{{ page.description }}</div>
                          </div>
                        </label>
                      </div>
                    }
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button type="button" class="btn btn-light" (click)="showRoleModal.set(false)" [disabled]="isSubmitting()">Cancel</button>
                  <button type="submit" class="btn btn-trust-primary" [disabled]="isSubmitting()">
                    @if (isSubmitting()) {
                      <span class="spinner-border spinner-border-sm me-1"></span> Saving...
                    } @else {
                      <i class="bi bi-check-circle me-1"></i> {{ isEditingRole() ? 'Save Changes' : 'Create Role' }}
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- MODAL 2: ASSIGN ROLE & USER ACCESS -->
    @if (showAssignModal()) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.55); z-index: 1055;" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg rounded-3">
            <div class="modal-header text-white" style="background-color: #0F3D63;">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-person-gear me-2"></i>
                Assign User Role & Page Access
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="showAssignModal.set(false)"></button>
            </div>
            <div class="modal-body p-4">
              <!-- Selected User Info Card -->
              @if (selectedUser) {
                <div class="p-3 bg-light rounded-3 border mb-4 d-flex align-items-center gap-3">
                  <div class="avatar-circle fs-5">
                    {{ selectedUser.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0 text-dark">{{ selectedUser.name }}</h6>
                    <div class="text-muted small">{{ selectedUser.email }} ({{ selectedUser.username }})</div>
                  </div>
                </div>

                <form (ngSubmit)="saveUserAccess()">
                  <!-- Role Selector -->
                  <div class="mb-3">
                    <label class="form-label small fw-bold">Assign Role Template</label>
                    <select 
                      class="form-select" 
                      [(ngModel)]="assignForm.role" 
                      name="assignRole"
                      (change)="onRoleTemplateChange()"
                    >
                      @for (role of roles(); track role.id) {
                        <option [value]="role.name">{{ role.name }} ({{ role.description }})</option>
                      }
                    </select>
                  </div>

                  <!-- Page Access Toggles -->
                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <label class="form-label small fw-bold mb-0">Allowed Pages for this User</label>
                      <div class="d-flex gap-2">
                        <button type="button" class="btn btn-link btn-sm text-decoration-none p-0" (click)="toggleAllUserPages(true)">Allow All</button>
                        <span class="text-muted">&bull;</span>
                        <button type="button" class="btn btn-link btn-sm text-decoration-none p-0 text-secondary" (click)="toggleAllUserPages(false)">Clear All</button>
                      </div>
                    </div>

                    <div class="row g-2">
                      @for (page of availablePages(); track page.key) {
                        <div class="col-12 col-sm-6">
                          <label class="d-flex align-items-start gap-2 p-2.5 rounded-2 border cursor-pointer h-100" [ngClass]="isUserPageSelected(page.key) ? 'bg-light border-primary' : 'bg-white'">
                            <input 
                              type="checkbox" 
                              class="form-check-input mt-1" 
                              [checked]="isUserPageSelected(page.key)"
                              (change)="toggleUserPage(page.key)"
                            >
                            <div class="flex-grow-1">
                              <div class="fw-semibold small text-dark">{{ page.name }}</div>
                              <div class="text-muted" style="font-size: 11px;">{{ page.description }}</div>
                            </div>
                          </label>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                    <button type="button" class="btn btn-light" (click)="showAssignModal.set(false)" [disabled]="isSubmitting()">Cancel</button>
                    <button type="submit" class="btn btn-trust-primary" [disabled]="isSubmitting()">
                      @if (isSubmitting()) {
                        <span class="spinner-border spinner-border-sm me-1"></span> Saving...
                      } @else {
                        <i class="bi bi-check-circle me-1"></i> Update User Access
                      }
                    </button>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .roles-page {
      max-width: 1400px;
      margin: 0 auto;
    }
    .admin-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .btn-trust-primary {
      background-color: #0F3D63;
      border-color: #0F3D63;
      color: #ffffff;
    }
    .btn-trust-primary:hover {
      background-color: #0c314f;
      border-color: #0c314f;
      color: #ffffff;
    }
    .avatar-circle {
      width: 42px;
      height: 42px;
      background: #0F3D63;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    .cursor-pointer {
      cursor: pointer;
    }
  `]
})
export class RolesComponent implements OnInit {
  activeTab = signal<'roles' | 'users'>('roles');
  isLoading = signal(true);
  isSubmitting = signal(false);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  roles = signal<Role[]>([]);
  users = signal<UserRoleItem[]>([]);
  availablePages = signal<AvailablePage[]>([]);

  userSearch = '';

  // Role Form Modal State
  showRoleModal = signal(false);
  isEditingRole = signal(false);
  selectedRole: Role | null = null;
  roleForm = {
    name: '',
    description: '',
    permissions: [] as string[]
  };

  // User Assign Modal State
  showAssignModal = signal(false);
  selectedUser: UserRoleItem | null = null;
  assignForm = {
    role: '',
    permissions: [] as string[]
  };

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.authService.getRoles().subscribe({
      next: (res) => {
        this.roles.set(res.roles || []);
        this.availablePages.set(res.available_pages || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load roles: ' + (err.error?.message || err.message));
        this.isLoading.set(false);
      }
    });
  }

  loadUsers(): void {
    this.authService.getRoleUsers().subscribe({
      next: (res) => {
        this.users.set(res.users || []);
        if (res.available_pages && this.availablePages().length === 0) {
          this.availablePages.set(res.available_pages);
        }
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  filteredUsers(): UserRoleItem[] {
    if (!this.userSearch.trim()) return this.users();
    const q = this.userSearch.toLowerCase();
    return this.users().filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      u.role.toLowerCase().includes(q)
    );
  }

  // Role Modal Helpers
  openCreateRoleModal(): void {
    this.isEditingRole.set(false);
    this.selectedRole = null;
    this.roleForm = {
      name: '',
      description: '',
      permissions: ['dashboard']
    };
    this.showRoleModal.set(true);
  }

  openEditRoleModal(role: Role): void {
    this.isEditingRole.set(true);
    this.selectedRole = role;
    this.roleForm = {
      name: role.name,
      description: role.description || '',
      permissions: [...role.permissions]
    };
    this.showRoleModal.set(true);
  }

  isPageSelected(key: string): boolean {
    if (this.roleForm.permissions.includes('*')) return true;
    return this.roleForm.permissions.includes(key);
  }

  togglePage(key: string): void {
    if (this.roleForm.permissions.includes('*')) {
      this.roleForm.permissions = this.availablePages().map(p => p.key);
    }
    const idx = this.roleForm.permissions.indexOf(key);
    if (idx !== -1) {
      this.roleForm.permissions.splice(idx, 1);
    } else {
      this.roleForm.permissions.push(key);
    }
  }

  toggleAllPages(select: boolean): void {
    if (select) {
      this.roleForm.permissions = this.availablePages().map(p => p.key);
    } else {
      this.roleForm.permissions = [];
    }
  }

  saveRole(): void {
    if (!this.roleForm.name.trim()) {
      alert('Please enter a Role title.');
      return;
    }

    this.isSubmitting.set(true);
    const data = {
      name: this.roleForm.name,
      description: this.roleForm.description,
      permissions: this.roleForm.permissions
    };

    if (this.isEditingRole() && this.selectedRole) {
      this.authService.updateRole(this.selectedRole.id, data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showRoleModal.set(false);
          this.successMessage.set(`Role "${data.name}" updated successfully.`);
          this.loadRoles();
          this.loadUsers();
          setTimeout(() => this.successMessage.set(null), 5000);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || err.message);
        }
      });
    } else {
      this.authService.createRole(data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showRoleModal.set(false);
          this.successMessage.set(`New role "${data.name}" created successfully.`);
          this.loadRoles();
          setTimeout(() => this.successMessage.set(null), 5000);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || err.message);
        }
      });
    }
  }

  deleteRole(role: Role): void {
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    this.authService.deleteRole(role.id).subscribe({
      next: (res) => {
        this.successMessage.set(res.message || 'Role deleted.');
        this.loadRoles();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || err.message);
      }
    });
  }

  // User Assignment Helpers
  openAssignUserModal(user: UserRoleItem): void {
    this.selectedUser = user;
    const currentPerms = user.custom_permissions || user.effective_permissions || [];
    this.assignForm = {
      role: user.role,
      permissions: [...currentPerms]
    };
    this.showAssignModal.set(true);
  }

  onRoleTemplateChange(): void {
    const matchedRole = this.roles().find(r => r.name.toLowerCase() === this.assignForm.role.toLowerCase());
    if (matchedRole) {
      if (matchedRole.permissions.includes('*')) {
        this.assignForm.permissions = this.availablePages().map(p => p.key);
      } else {
        this.assignForm.permissions = [...matchedRole.permissions];
      }
    }
  }

  isUserPageSelected(key: string): boolean {
    if (this.assignForm.permissions.includes('*')) return true;
    return this.assignForm.permissions.includes(key);
  }

  toggleUserPage(key: string): void {
    if (this.assignForm.permissions.includes('*')) {
      this.assignForm.permissions = this.availablePages().map(p => p.key);
    }
    const idx = this.assignForm.permissions.indexOf(key);
    if (idx !== -1) {
      this.assignForm.permissions.splice(idx, 1);
    } else {
      this.assignForm.permissions.push(key);
    }
  }

  toggleAllUserPages(select: boolean): void {
    if (select) {
      this.assignForm.permissions = this.availablePages().map(p => p.key);
    } else {
      this.assignForm.permissions = [];
    }
  }

  saveUserAccess(): void {
    if (!this.selectedUser) return;

    this.isSubmitting.set(true);
    const data = {
      role: this.assignForm.role,
      permissions: this.assignForm.permissions
    };

    this.authService.assignUserAccess(this.selectedUser.id, data).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.showAssignModal.set(false);
        this.successMessage.set(res.message || 'User access updated successfully.');
        this.loadUsers();
        // If updating currently logged in user, refresh profile
        if (this.selectedUser?.id === this.authService.currentUser()?.id) {
          this.authService.getProfile().subscribe();
        }
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || err.message);
      }
    });
  }
}
