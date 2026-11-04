import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'connected';
  connected: boolean;
  connectedNumber: string | null;
  qr: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/whatsapp`;

  getStatus(): Observable<{ success: boolean; data: WhatsAppStatus }> {
    return this.http.get<{ success: boolean; data: WhatsAppStatus }>(`${this.apiUrl}/status`);
  }

  connect(): Observable<any> {
    return this.http.post(`${this.apiUrl}/connect`, {});
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  sendPdfDirect(donationId: number, phone: string, pdfBlob?: Blob, fileName?: string): Observable<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('phone', phone);
    if (pdfBlob) {
      formData.append('pdf', pdfBlob, fileName || `Ar_Rahman_Trust_Receipt_${donationId}.pdf`);
    }
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/send-pdf/${donationId}`, formData);
  }
}
