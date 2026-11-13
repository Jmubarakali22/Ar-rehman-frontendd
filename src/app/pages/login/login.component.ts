import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page-container">
      <!-- Ambient decorative gradient orbs in background -->
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
      <div class="ambient-orb orb-3"></div>

      <div class="login-card-wrapper">
        <!-- Split Layout Card -->
        <div class="login-split-card shadow-2xl">
          
          <!-- LEFT HERO PANEL (Showcase & Brand Story) -->
          <div class="login-hero-panel d-none d-lg-flex flex-column justify-content-between">
            <!-- Background mesh & pattern -->
            <div class="hero-pattern-overlay"></div>
            
            <!-- Top Trust Identity -->
            <div class="hero-top-section position-relative">
              <div class="brand-crest-wrapper mb-3">
                <div class="brand-crest">
                  <img 
                    src="https://ik.imagekit.io/baaidzoik/assets/header-logo/ar_logo_1.png" 
                    alt="Ar Rahman Trust Crest" 
                    class="brand-crest-img"
                  >
                </div>
                <div class="brand-badge-pill">
                  <i class="bi bi-patch-check-fill text-success"></i>
                  <span>Registered Charitable Trust</span>
                </div>
              </div>

              <h1 class="hero-brand-name">Ar Rahman Trust</h1>
              <div class="hero-brand-tagline">
                <span class="location-badge">
                  <i class="bi bi-geo-alt-fill text-danger me-1"></i> Pernambut &bull; Vellore Dist
                </span>
                <span class="reg-number">Reg. No. 04/16/2020</span>
              </div>

              <p class="hero-mission-lead mt-3">
                Empowering underprivileged families with dignity, comprehensive ration relief, higher education grants, and emergency healthcare.
              </p>
            </div>

            <!-- Middle Inspiration & Highlights -->
            <div class="hero-middle-section position-relative my-4">
              <!-- Quranic / Wisdom Quote Card -->
              <div class="quote-glass-card p-3 mb-4">
                <div class="d-flex align-items-start gap-2">
                  <i class="bi bi-quote fs-3 text-warning opacity-75"></i>
                  <div>
                    <p class="quote-text mb-1 fst-italic">
                      "Those who spend their wealth in charity day and night, secretly and openly, will have their reward with their Lord."
                    </p>
                    <span class="quote-author">&mdash; Holy Quran (2:274)</span>
                  </div>
                </div>
              </div>

              <!-- Quick Pillars Grid -->
              <div class="impact-grid">
                <div class="impact-pill">
                  <div class="impact-icon-circle bg-emerald-subtle">
                    <i class="bi bi-heart-pulse-fill text-emerald"></i>
                  </div>
                  <div class="impact-content">
                    <span class="impact-number">30+</span>
                    <span class="impact-desc">Villages Served</span>
                  </div>
                </div>

                <div class="impact-pill">
                  <div class="impact-icon-circle bg-blue-subtle">
                    <i class="bi bi-shield-check text-info"></i>
                  </div>
                  <div class="impact-content">
                    <span class="impact-number">100%</span>
                    <span class="impact-desc">Direct Aid Delivery</span>
                  </div>
                </div>

                <div class="impact-pill">
                  <div class="impact-icon-circle bg-amber-subtle">
                    <i class="bi bi-cash-stack text-warning"></i>
                  </div>
                  <div class="impact-content">
                    <span class="impact-number">Audited</span>
                    <span class="impact-desc">Full Transparency</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom Hero Status -->
            <div class="hero-bottom-section position-relative d-flex align-items-center justify-content-between pt-3 border-top border-white border-opacity-10">
              <div class="d-flex align-items-center gap-2">
                <span class="pulse-indicator"></span>
                <span class="server-status-text">Central Admin Gateway &bull; Live</span>
              </div>
              <span class="encryption-tag">
                <i class="bi bi-lock-fill me-1"></i> 256-Bit SSL
              </span>
            </div>
          </div>

          <!-- RIGHT FORM PANEL (Authentication & Controls) -->
          <div class="login-form-panel d-flex flex-column justify-content-between">
            <div>
              <!-- Mobile Header (Visible only on smaller screens) -->
              <div class="text-center d-lg-none mb-4 pt-2">
                <div class="mobile-logo-ring mx-auto mb-2">
                  <img 
                    src="https://ik.imagekit.io/baaidzoik/assets/header-logo/ar_logo_1.png" 
                    alt="Ar Rahman Trust" 
                    class="mobile-logo-img"
                  >
                </div>
                <h3 class="fw-bold text-navy mb-0">Ar Rahman Trust</h3>
                <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 mt-1 small">
                  Reg. Charity No. 04/16/2020
                </span>
              </div>

              <!-- Form Title & Subtitle -->
              <div class="form-header mb-4">
                <div class="d-flex align-items-center justify-content-between">
                  <span class="portal-badge">
                    <i class="bi bi-shield-lock-fill me-1"></i> Admin Portal
                  </span>
                  <a href="https://arrahmantrust.netlify.app/" target="_blank" class="public-site-link small" title="View Public Website">
                    <span>Main Site</span>
                    <i class="bi bi-box-arrow-up-right ms-1"></i>
                  </a>
                </div>
                <h2 class="form-title mt-2">Sign in to console</h2>
                <p class="form-subtitle text-muted">
                  Enter your credentials to manage donations, causes, gallery and volunteers.
                </p>
              </div>

              <!-- Inactivity Auto-Logout Alert Banner -->
              @if (inactivityNotice()) {
                <div class="alert alert-warning-custom d-flex align-items-start gap-3 p-3 mb-4 rounded-3" role="alert">
                  <i class="bi bi-clock-history fs-5 flex-shrink-0 text-warning mt-0.5"></i>
                  <div class="flex-grow-1">
                    <div class="fw-bold text-dark">Session Inactivity Timeout</div>
                    <div class="small text-secondary mt-0.5">You were automatically logged out due to inactivity to protect administrative records. Please sign in again.</div>
                  </div>
                  <button type="button" class="btn-close btn-close-sm" (click)="inactivityNotice.set(false)" aria-label="Close"></button>
                </div>
              }

              <!-- Error Alert -->
              @if (errorMessage()) {
                <div class="alert alert-danger-custom d-flex align-items-start gap-3 p-3 mb-4 rounded-3 animate-shake" role="alert">
                  <i class="bi bi-exclamation-octagon-fill fs-5 flex-shrink-0 text-danger mt-1"></i>
                  <div class="flex-grow-1">
                    <div class="fw-bold text-danger">Authentication Failed</div>
                    <div class="small text-danger text-opacity-90 mt-0.5">{{ errorMessage() }}</div>
                  </div>
                  <button type="button" class="btn-close btn-close-sm" (click)="errorMessage.set(null)" aria-label="Close"></button>
                </div>
              }

              <!-- CapsLock Warning Pill -->
              @if (capsLockOn()) {
                <div class="caps-warning-pill mb-3 d-flex align-items-center gap-2">
                  <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                  <span><strong>Caps Lock</strong> is ON</span>
                </div>
              }

              <!-- Login Form -->
              <form (ngSubmit)="onLogin()" autocomplete="on">
                <!-- Username / Email Field -->
                <div class="form-group-custom mb-3">
                  <label for="usernameInput" class="form-label-custom">
                    <span>Username or Email</span>
                    <span class="required-star">*</span>
                  </label>
                  <div class="input-container" [class.is-focused]="usernameFocused">
                    <div class="input-icon-lead">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <input 
                      id="usernameInput"
                      type="text" 
                      class="custom-input" 
                      placeholder="e.g. arrahmantrust@gmail.com" 
                      [(ngModel)]="username" 
                      name="username" 
                      required
                      autocomplete="username"
                      (focus)="usernameFocused = true"
                      (blur)="usernameFocused = false"
                      (keydown)="checkCapsLock($event)"
                      (keyup)="checkCapsLock($event)"
                      [disabled]="isLoading()"
                    >
                    @if (username && !isLoading()) {
                      <button 
                        type="button" 
                        class="clear-input-btn" 
                        (click)="username = ''" 
                        title="Clear field"
                      >
                        <i class="bi bi-x"></i>
                      </button>
                    }
                  </div>
                </div>

                <!-- Password Field -->
                <div class="form-group-custom mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <label for="passwordInput" class="form-label-custom">
                      <span>Password</span>
                      <span class="required-star">*</span>
                    </label>
                    <button 
                      type="button" 
                      class="help-link-btn"
                      (click)="toggleHelpModal(true)"
                    >
                      Need help?
                    </button>
                  </div>
                  <div class="input-container" [class.is-focused]="passwordFocused">
                    <div class="input-icon-lead">
                      <i class="bi bi-lock-fill"></i>
                    </div>
                    <input 
                      id="passwordInput"
                      [type]="showPassword() ? 'text' : 'password'" 
                      class="custom-input" 
                      placeholder="Enter secret portal password" 
                      [(ngModel)]="password" 
                      name="password" 
                      required
                      autocomplete="current-password"
                      (focus)="passwordFocused = true"
                      (blur)="passwordFocused = false"
                      (keydown)="checkCapsLock($event)"
                      (keyup)="checkCapsLock($event)"
                      [disabled]="isLoading()"
                    >
                    <button 
                      type="button" 
                      class="password-toggle-btn"
                      (click)="showPassword.set(!showPassword())"
                      [title]="showPassword() ? 'Hide password' : 'Show password'"
                      [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                    >
                      <i [class]="showPassword() ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>

                <!-- Remember Me & Portal Session -->
                <div class="d-flex align-items-center justify-content-between mb-4">
                  <label class="custom-checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="rememberMe" 
                      name="rememberMe"
                      class="custom-checkbox-input"
                    >
                    <span class="custom-checkbox-indicator"></span>
                    <span class="checkbox-text">Remember my username</span>
                  </label>
                  
                  <span class="session-badge">
                    <i class="bi bi-hourglass-split me-1"></i> 24h Session
                  </span>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit" 
                  class="btn-login-primary"
                  [disabled]="isLoading() || !username.trim() || !password.trim()"
                >
                  @if (isLoading()) {
                    <div class="d-flex align-items-center justify-content-center gap-2">
                      <span class="spinner-border spinner-border-sm" role="status"></span>
                      <span>Verifying Credentials...</span>
                    </div>
                  } @else {
                    <div class="d-flex align-items-center justify-content-center gap-2">
                      <span>Sign In to Admin Portal</span>
                      <i class="bi bi-arrow-right"></i>
                    </div>
                  }
                </button>
              </form>
            </div>

            <!-- Footer Details -->
            <div class="form-panel-footer mt-4 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2 text-muted small">
              <div class="d-flex align-items-center gap-1">
                <i class="bi bi-shield-check text-success"></i>
                <span>Authorized Trustee & Admin Access Only</span>
              </div>
              <div class="text-secondary opacity-75">
                v2.0 &bull; Ar Rahman Trust
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Help / Forgot Password Modal Overlay -->
      @if (showHelpModal()) {
        <div class="modal-backdrop-custom" (click)="toggleHelpModal(false)">
          <div class="help-modal-card" (click)="$event.stopPropagation()">
            <div class="help-modal-header d-flex align-items-center justify-content-between pb-3 border-bottom">
              <div class="d-flex align-items-center gap-2">
                <div class="icon-circle-amber">
                  <i class="bi bi-shield-exclamation text-warning fs-5"></i>
                </div>
                <h5 class="modal-title fw-bold text-navy mb-0">Password & Portal Assistance</h5>
              </div>
              <button type="button" class="btn-close" (click)="toggleHelpModal(false)"></button>
            </div>

            <div class="help-modal-body py-3">
              <p class="text-secondary small mb-3">
                For security reasons and compliance with the public charitable trust regulations, automatic email password resets are disabled. All access privileges are governed by the Trust Super Administrator.
              </p>

              <div class="support-contact-list p-3 bg-light rounded-3 mb-3 border">
                <div class="d-flex align-items-center gap-3 mb-2 pb-2 border-bottom">
                  <i class="bi bi-envelope-at-fill text-primary fs-5"></i>
                  <div>
                    <div class="fw-bold small text-navy">Trust Contact Email</div>
                    <div class="text-muted small">contact&#64;arrahmantrust.org</div>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-3 mb-2 pb-2 border-bottom">
                  <i class="bi bi-geo-alt-fill text-danger fs-5"></i>
                  <div>
                    <div class="fw-bold small text-navy">Head Office Location</div>
                    <div class="text-muted small">Pernambut, Vellore District, Tamil Nadu - India</div>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-3">
                  <i class="bi bi-shield-lock-fill text-success fs-5"></i>
                  <div>
                    <div class="fw-bold small text-navy">Administrative Access</div>
                    <div class="text-muted small">Please use your authorized admin email (<strong>arrahmantrust&#64;gmail.com</strong>)</div>
                  </div>
                </div>
              </div>

              <div class="alert alert-info py-2 small mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-info-circle-fill"></i>
                <span>Ensure your MySQL backend server is active on <code>http://localhost:5000</code>.</span>
              </div>
            </div>

            <div class="help-modal-footer pt-3 border-top text-end">
              <button type="button" class="btn btn-navy-sm px-4" (click)="toggleHelpModal(false)">
                Understood, Return
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ==========================================================================
       LOGIN CONTAINER & AMBIENT GRAPHICS
       ========================================================================== */
    .login-page-container {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: radial-gradient(circle at 10% 20%, #06192d 0%, #0a2740 40%, #041220 100%);
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }

    /* Ambient animated orbs */
    .ambient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.35;
      animation: floatOrb 18s ease-in-out infinite alternate;
    }
    .orb-1 {
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, #0284c7 0%, transparent 70%);
      top: -100px;
      left: -120px;
    }
    .orb-2 {
      width: 550px;
      height: 550px;
      background: radial-gradient(circle, #059669 0%, transparent 70%);
      bottom: -150px;
      right: -100px;
      animation-delay: -5s;
    }
    .orb-3 {
      width: 320px;
      height: 320px;
      background: radial-gradient(circle, #d97706 0%, transparent 70%);
      top: 40%;
      left: 35%;
      opacity: 0.18;
      animation-delay: -9s;
    }

    @keyframes floatOrb {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(30px, 40px) scale(1.08); }
      100% { transform: translate(-25px, -20px) scale(0.95); }
    }

    /* Card Wrapper */
    .login-card-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 1060px;
      margin: auto;
    }

    .login-split-card {
      display: flex;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08);
      min-height: 640px;
    }

    /* ==========================================================================
       LEFT HERO PANEL (Brand Showcase)
       ========================================================================== */
    .login-hero-panel {
      position: relative;
      width: 46%;
      background: linear-gradient(145deg, #071f36 0%, #0F3D63 60%, #0d4b7d 100%);
      padding: 3rem 2.5rem;
      color: #ffffff;
      overflow: hidden;
    }

    .hero-pattern-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
      background-size: 24px 24px;
      opacity: 0.6;
      pointer-events: none;
    }

    .brand-crest-wrapper {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand-crest {
      width: 58px;
      height: 58px;
      border-radius: 16px;
      background: #ffffff;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(255, 255, 255, 0.2);
    }

    .brand-crest-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .brand-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      padding: 0.35rem 0.85rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .hero-brand-name {
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .hero-brand-tagline {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.35rem;
      font-size: 0.8rem;
    }

    .location-badge {
      color: #bae6fd;
      font-weight: 500;
    }

    .reg-number {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
      padding: 0.15rem 0.55rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.73rem;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .hero-mission-lead {
      color: #cbd5e1;
      font-size: 0.88rem;
      line-height: 1.55;
      margin-bottom: 0;
    }

    /* Quote Glass Card */
    .quote-glass-card {
      background: rgba(255, 255, 255, 0.07);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      position: relative;
    }

    .quote-text {
      color: #e2e8f0;
      font-size: 0.83rem;
      line-height: 1.5;
    }

    .quote-author {
      font-size: 0.72rem;
      font-weight: 700;
      color: #fbbf24;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Impact Pillars */
    .impact-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .impact-pill {
      background: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 0.75rem 0.6rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.35rem;
      transition: transform 0.2s ease, background 0.2s ease;
    }

    .impact-pill:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.1);
    }

    .impact-icon-circle {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
    }

    .bg-emerald-subtle { background: rgba(16, 185, 129, 0.2); }
    .bg-blue-subtle { background: rgba(14, 165, 233, 0.2); }
    .bg-amber-subtle { background: rgba(245, 158, 11, 0.2); }
    .text-emerald { color: #34d399; }

    .impact-number {
      font-size: 0.92rem;
      font-weight: 800;
      color: #ffffff;
      display: block;
      line-height: 1.1;
    }

    .impact-desc {
      font-size: 0.65rem;
      color: #94a3b8;
      font-weight: 600;
      display: block;
      line-height: 1.1;
      margin-top: 2px;
    }

    /* Hero bottom status */
    .pulse-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #10b981;
      display: inline-block;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: statusPulse 2s infinite;
    }

    @keyframes statusPulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .server-status-text {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .encryption-tag {
      font-size: 0.72rem;
      color: #cbd5e1;
      font-weight: 600;
    }

    /* ==========================================================================
       RIGHT FORM PANEL
       ========================================================================== */
    .login-form-panel {
      flex: 1;
      background: #ffffff;
      padding: 3rem 3rem 2.25rem 3rem;
      min-width: 0;
    }

    @media (max-width: 991px) {
      .login-form-panel {
        padding: 2.25rem 1.75rem;
      }
    }

    /* Mobile Brand Ring */
    .mobile-logo-ring {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      padding: 5px;
      background: #ffffff;
      box-shadow: 0 4px 15px rgba(15, 61, 99, 0.15);
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mobile-logo-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .text-navy {
      color: #0F3D63;
    }

    .portal-badge {
      display: inline-flex;
      align-items: center;
      background: #e0f2fe;
      color: #0369a1;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
    }

    .public-site-link {
      color: #0F3D63;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      transition: color 0.15s ease, transform 0.15s ease;
    }
    .public-site-link:hover {
      color: #0284c7;
      transform: translateX(2px);
    }

    .form-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 0.35rem;
    }

    .form-subtitle {
      font-size: 0.88rem;
      margin-bottom: 0;
      line-height: 1.45;
    }

    /* Alert Styling */
    .alert-danger-custom {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
    }
    .alert-warning-custom {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
    }

    @keyframes shakeAnimation {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    .animate-shake {
      animation: shakeAnimation 0.4s ease-in-out;
    }

    /* Caps Lock Pill */
    .caps-warning-pill {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
    }

    /* Input Field Styling */
    .form-label-custom {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.83rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
    }

    .required-star {
      color: #ef4444;
      font-size: 0.85rem;
    }

    .help-link-btn {
      background: none;
      border: none;
      padding: 0;
      font-size: 0.78rem;
      color: #0284c7;
      font-weight: 600;
      text-decoration: underline;
      cursor: pointer;
    }
    .help-link-btn:hover {
      color: #0369a1;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .input-container:hover {
      border-color: #cbd5e1;
      background: #ffffff;
    }

    .input-container.is-focused {
      border-color: #0F3D63;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(15, 61, 99, 0.12);
    }

    .input-icon-lead {
      width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 1.05rem;
      flex-shrink: 0;
      transition: color 0.2s ease;
    }
    .input-container.is-focused .input-icon-lead {
      color: #0F3D63;
    }

    .custom-input {
      width: 100%;
      border: none;
      background: transparent;
      padding: 0.72rem 0.75rem 0.72rem 0;
      font-size: 0.92rem;
      color: #0f172a;
      outline: none;
      font-family: inherit;
    }

    .custom-input::placeholder {
      color: #94a3b8;
      font-size: 0.88rem;
    }

    .clear-input-btn, .password-toggle-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 0 0.85rem;
      font-size: 1.05rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }
    .clear-input-btn:hover, .password-toggle-btn:hover {
      color: #334155;
    }

    /* Checkbox & Options */
    .custom-checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      cursor: pointer;
      user-select: none;
    }

    .custom-checkbox-input {
      width: 17px;
      height: 17px;
      accent-color: #0F3D63;
      cursor: pointer;
      border-radius: 4px;
    }

    .checkbox-text {
      font-size: 0.83rem;
      font-weight: 500;
      color: #475569;
    }

    .session-badge {
      font-size: 0.73rem;
      color: #64748b;
      font-weight: 500;
      background: #f1f5f9;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    /* Primary Login Button */
    .btn-login-primary {
      width: 100%;
      background: linear-gradient(135deg, #0F3D63 0%, #16568A 100%);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 0.85rem 1.25rem;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(15, 61, 99, 0.25);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-login-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #0a2740 0%, #0F3D63 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(15, 61, 99, 0.35);
    }

    .btn-login-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-login-primary:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Demo Helper Card */
    .demo-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.85rem 1rem;
    }

    .demo-icon-tag {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: #fef3c7;
      color: #d97706;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }

    .demo-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .btn-demo-fill {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #0F3D63;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-demo-fill:hover {
      background: #0F3D63;
      color: #ffffff;
      border-color: #0F3D63;
    }
    .btn-demo-filled {
      background: #10b981 !important;
      color: #ffffff !important;
      border-color: #10b981 !important;
    }

    .demo-credentials-row {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .credential-chip {
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 0.25rem 0.6rem;
      font-size: 0.76rem;
      font-family: monospace;
      color: #1e293b;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.15s ease;
    }
    .credential-chip:hover {
      border-color: #0F3D63;
      background: #eff6ff;
    }
    .chip-label {
      color: #64748b;
      font-weight: 600;
    }
    .chip-value {
      font-weight: 700;
      color: #0f172a;
    }

    /* Modal Styling */
    .modal-backdrop-custom {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(10, 39, 64, 0.7);
      backdrop-filter: blur(6px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeInModal 0.2s ease-out;
    }

    @keyframes fadeInModal {
      from { opacity: 0; transform: scale(0.97); }
      to { opacity: 1; transform: scale(1); }
    }

    .help-modal-card {
      background: #ffffff;
      width: 100%;
      max-width: 480px;
      border-radius: 18px;
      padding: 1.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
    }

    .icon-circle-amber {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #fef3c7;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-navy-sm {
      background: #0F3D63;
      color: #ffffff;
      font-weight: 600;
      font-size: 0.85rem;
      border-radius: 8px;
      border: none;
      padding: 0.5rem 1.25rem;
    }
    .btn-navy-sm:hover {
      background: #0a2740;
      color: #ffffff;
    }
  `]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  rememberMe = true;

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  capsLockOn = signal(false);
  showHelpModal = signal(false);
  inactivityNotice = signal(false);

  usernameFocused = false;
  passwordFocused = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.authService.getFirstAccessibleRoute()]);
    }
  }

  ngOnInit(): void {
    // Check if redirected due to session inactivity
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'inactivity') {
        this.inactivityNotice.set(true);
      }
    });

    // Retrieve remembered username from previous logins
    const savedUser = localStorage.getItem('art_remembered_username');
    if (savedUser) {
      this.username = savedUser;
    }
  }

  checkCapsLock(event: KeyboardEvent): void {
    if (event.getModifierState) {
      this.capsLockOn.set(event.getModifierState('CapsLock'));
    }
  }

  toggleHelpModal(show: boolean): void {
    this.showHelpModal.set(show);
  }

  onLogin(): void {
    const trimmedUser = this.username.trim();
    const trimmedPass = this.password.trim();

    if (!trimmedUser || !trimmedPass) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Save or clear remembered username
    if (this.rememberMe) {
      localStorage.setItem('art_remembered_username', trimmedUser);
    } else {
      localStorage.removeItem('art_remembered_username');
    }

    this.authService.login({ username: trimmedUser, password: trimmedPass }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.router.navigate([this.authService.getFirstAccessibleRoute()]);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Login failed. Please verify your credentials and ensure MySQL backend is running on port 5000.';
        this.errorMessage.set(msg);
      }
    });
  }
}
