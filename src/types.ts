export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  videoUrl?: string;
  downloadUrl?: string;
  category: string;
}

export interface Order {
  id?: string;
  productId: string;
  productName: string;
  customerPhone: string;
  customerEmail?: string;
  transactionId?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
}

export interface AdminUser {
  id?: string;
  email: string;
  addedBy: string;
  createdAt: any;
}

export interface AdminRequest {
  id?: string;
  uid: string;
  email: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}
