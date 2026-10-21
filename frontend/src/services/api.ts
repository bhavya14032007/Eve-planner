const RAW_API_URL = import.meta.env.VITE_API_URL;
const API_BASE = RAW_API_URL
  ? `${RAW_API_URL.replace(/\/$/, '')}${RAW_API_URL.endsWith('/api') ? '' : '/api'}`
  : '/api';


export const getAuthToken = (): string | null => {
  return localStorage.getItem('eve_auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('eve_auth_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('eve_auth_token');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// 1. Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; data: { user: any; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData: any) =>
    request<{ success: boolean; data: { user: any; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => request<{ success: boolean; data: any }>('/auth/me'),
};

// 2. Services API
export const servicesApi = {
  getCategories: () => request<{ success: boolean; data: any[] }>('/services/categories'),
  getFeatured: () => request<{ success: boolean; data: any[] }>('/services/featured'),
  getServices: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<{ success: boolean; data: any[]; pagination: any }>(
      `/services?${query.toString()}`
    );
  },
  getServiceDetail: (idOrSlug: string) =>
    request<{ success: boolean; data: any }>(`/services/${idOrSlug}`),
};

// 3. Packages API
export const packagesApi = {
  getPackages: (eventType?: string) => {
    const query = eventType && eventType !== 'All' ? `?eventType=${encodeURIComponent(eventType)}` : '';
    return request<{ success: boolean; data: any[] }>(`/packages${query}`);
  },
  getPackageDetail: (idOrSlug: string) =>
    request<{ success: boolean; data: any }>(`/packages/${idOrSlug}`),
  calculateCustomPrice: (packageId: string, selectedAddons: any[]) =>
    request<{ success: boolean; data: any }>('/packages/calculate-price', {
      method: 'POST',
      body: JSON.stringify({ packageId, selectedAddons }),
    }),
};

// 4. Bookings API
export const bookingsApi = {
  calculatePrice: (data: any) =>
    request<{ success: boolean; data: any }>('/bookings/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createBooking: (data: any) =>
    request<{ success: boolean; data: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyBookings: () => request<{ success: boolean; data: any[] }>('/bookings/my'),
  getBookingById: (id: string) => request<{ success: boolean; data: any }>(`/bookings/${id}`),
  cancelBooking: (id: string, reason?: string) =>
    request<{ success: boolean; data: any }>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  simulatePayment: (id: string, paymentMethod: string = 'UPI') =>
    request<{ success: boolean; data: any }>(`/bookings/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod }),
    }),
};

// 5. AI API
export const aiApi = {
  getRecommendations: (planInput: any) =>
    request<{ success: boolean; data: any }>('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(planInput),
    }),
  chatWithAssistant: (message: string, history: any[] = []) =>
    request<{ success: boolean; data: any }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
};

// 6. Vendor API
export const vendorApi = {
  registerVendor: (data: any) =>
    request<{ success: boolean; data: any }>('/vendors/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProfile: () => request<{ success: boolean; data: any }>('/vendors/me'),
  getRequests: () => request<{ success: boolean; data: any[] }>('/vendors/requests'),
  respondToRequest: (id: string, status: 'ACCEPTED' | 'DECLINED', notes?: string) =>
    request<{ success: boolean; data: any }>(`/vendors/requests/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    }),
  createListing: (data: any) =>
    request<{ success: boolean; data: any }>('/vendors/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAnalytics: () => request<{ success: boolean; data: any }>('/vendors/analytics'),
};

// 7. Admin API
export const adminApi = {
  getVendors: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<{ success: boolean; data: any[] }>(`/admin/vendors${query}`);
  },
  verifyVendor: (id: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string) =>
    request<{ success: boolean; data: any }>(`/admin/vendors/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status, adminNotes }),
    }),
  getAllBookings: () => request<{ success: boolean; data: any[] }>('/admin/bookings'),
  getStats: () => request<{ success: boolean; data: any }>('/admin/stats'),
  getAuditLogs: () => request<{ success: boolean; data: any[] }>('/admin/audit-logs'),
};
