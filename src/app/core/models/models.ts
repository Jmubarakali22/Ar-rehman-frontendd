export interface Admin {
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'moderator';
  avatar?: string;
  created_at?: string;
}

export interface Donation {
  id: number;
  donor_name: string;
  donor_email?: string;
  donor_phone: string;
  amount: number;
  donation_type: 'zakat' | 'sadaqah' | 'monthly_donation' | string;
  payment_method: 'upi' | 'bank_transfer' | 'cash' | 'card';
  transaction_id?: string;
  status: 'completed' | 'pending' | 'verified' | 'failed';
  notes?: string;
  receipt_number?: string;
  created_at: string;
}

export interface Cause {
  id: number;
  title: string;
  category: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  image_url: string;
  status: 'active' | 'completed' | 'paused';
  featured: boolean | number;
  created_at: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  caption?: string;
  category: string;
  image_url: string;
  order_num: number;
  is_visible: boolean | number;
  created_at: string;
}

export interface Volunteer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  availability: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
}

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  admin_notes?: string;
  created_at: string;
}

export interface DashboardStats {
  totalDonationsAmount: number;
  totalDonationsCount: number;
  totalZakat: number;
  totalSadaqah: number;
  totalMonthly?: number;
  totalMonthlyCount?: number;
  pendingDonationsCount: number;
  totalCauses: number;
  activeCauses: number;
  totalTarget: number;
  totalRaised: number;
  totalPhotos: number;
  totalVolunteers: number;
  approvedVolunteers: number;
  pendingVolunteers: number;
  totalInquiries: number;
  unreadInquiries: number;
}
