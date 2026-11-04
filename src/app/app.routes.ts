import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DonationsComponent } from './pages/donations/donations.component';
import { CausesComponent } from './pages/causes/causes.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { VolunteersComponent } from './pages/volunteers/volunteers.component';
import { InquiriesComponent } from './pages/inquiries/inquiries.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AdminsComponent } from './pages/admins/admins.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'donations', component: DonationsComponent },
      { path: 'causes', component: CausesComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'volunteers', component: VolunteersComponent },
      { path: 'inquiries', component: InquiriesComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'admins', component: AdminsComponent }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
