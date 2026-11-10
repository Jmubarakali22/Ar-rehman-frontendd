import { Injectable, signal, NgZone, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService implements OnDestroy {
  // Configurable timeout in minutes: default 15 minutes
  idleTimeoutMinutes = signal<number>(this.getStoredTimeout());
  
  // Warning window before logout (60 seconds)
  readonly warningDurationSeconds = 60;

  // Reactive state for UI warning modal
  showWarningModal = signal<boolean>(false);
  countdownSeconds = signal<number>(60);
  isTracking = signal<boolean>(false);

  private lastActivityTime = Date.now();
  private heartbeatInterval: any = null;
  private readonly activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  private boundEventListener: ((event: Event) => void) | null = null;
  private lastThrottledTime = 0;

  constructor(
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  private getStoredTimeout(): number {
    try {
      const stored = localStorage.getItem('art_idle_timeout_min');
      const parsed = stored ? parseInt(stored, 10) : 15;
      return (parsed >= 1 && parsed <= 120) ? parsed : 15;
    } catch {
      return 15;
    }
  }

  /**
   * Start tracking user inactivity.
   * Listeners run outside Angular zone for high performance.
   */
  start(): void {
    if (this.isTracking()) {
      return;
    }

    this.lastActivityTime = Date.now();
    this.showWarningModal.set(false);
    this.countdownSeconds.set(this.warningDurationSeconds);
    this.isTracking.set(true);

    // Attach DOM event listeners outside Angular change detection zone
    this.ngZone.runOutsideAngular(() => {
      this.boundEventListener = (event: Event) => this.onUserActivity(event);
      this.activityEvents.forEach(eventType => {
        window.addEventListener(eventType, this.boundEventListener!, { passive: true });
      });

      // Heartbeat interval checking elapsed idle time every 1 second
      this.heartbeatInterval = setInterval(() => {
        this.checkIdleStatus();
      }, 1000);
    });
  }

  /**
   * Stop tracking and clean up listeners & interval
   */
  stop(): void {
    if (this.boundEventListener) {
      this.activityEvents.forEach(eventType => {
        window.removeEventListener(eventType, this.boundEventListener!);
      });
      this.boundEventListener = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.isTracking.set(false);
    this.showWarningModal.set(false);
  }

  /**
   * Throttled user activity handler
   */
  private onUserActivity(event: Event): void {
    const now = Date.now();
    // Throttle activity checks to once every 1 second
    if (now - this.lastThrottledTime < 1000) {
      return;
    }
    this.lastThrottledTime = now;
    this.lastActivityTime = now;

    // If warning modal is showing and user actively interacts, dismiss modal inside Angular
    if (this.showWarningModal()) {
      this.ngZone.run(() => {
        this.showWarningModal.set(false);
        this.countdownSeconds.set(this.warningDurationSeconds);
      });
    }
  }

  /**
   * Check how much idle time has elapsed
   */
  private checkIdleStatus(): void {
    if (!this.authService.isAuthenticated()) {
      this.stop();
      return;
    }

    const now = Date.now();
    const elapsedMs = now - this.lastActivityTime;
    const timeoutMs = this.idleTimeoutMinutes() * 60 * 1000;
    const warningThresholdMs = timeoutMs - (this.warningDurationSeconds * 1000);

    // 1. Timeout reached -> Log out
    if (elapsedMs >= timeoutMs) {
      this.ngZone.run(() => {
        this.stop();
        this.authService.logout('inactivity');
      });
      return;
    }

    // 2. Warning window reached -> Show countdown modal
    if (elapsedMs >= warningThresholdMs) {
      const remainingSeconds = Math.max(1, Math.ceil((timeoutMs - elapsedMs) / 1000));
      this.ngZone.run(() => {
        if (!this.showWarningModal()) {
          this.showWarningModal.set(true);
        }
        this.countdownSeconds.set(remainingSeconds);
      });
      return;
    }

    // 3. User is actively interacting -> Hide warning modal if visible
    if (this.showWarningModal()) {
      this.ngZone.run(() => {
        this.showWarningModal.set(false);
      });
    }
  }

  /**
   * Reset activity timer when user clicks "Stay Logged In"
   */
  stayLoggedIn(): void {
    this.lastActivityTime = Date.now();
    this.showWarningModal.set(false);
    this.countdownSeconds.set(this.warningDurationSeconds);
  }

  /**
   * User manually chooses "Log Out Now"
   */
  logoutNow(): void {
    this.stop();
    this.authService.logout();
  }

  /**
   * Change idle timeout preference in minutes
   */
  setTimeoutMinutes(minutes: number): void {
    const safeMinutes = Math.min(120, Math.max(1, minutes));
    this.idleTimeoutMinutes.set(safeMinutes);
    try {
      localStorage.setItem('art_idle_timeout_min', safeMinutes.toString());
    } catch (e) {
      // Ignore storage errors
    }
    this.stayLoggedIn();
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
