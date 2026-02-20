import {
  ApparelProduct,
  ArtistProfile,
  Beat,
  CheckoutStatusResponse,
  ContractTemplate,
  LicenseType,
  OwnerBeat,
  OwnerContract,
  OwnerOrder,
  OwnerOverview,
  OwnerUser
} from '../types/api';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    ...init
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';

    try {
      const payload = await response.json();
      errorMessage = payload.error || errorMessage;
    } catch (_err) {
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
};

export const api = {
  getPublicProfile: () => request<ArtistProfile>('/api/public/profile'),
  getPublicBeats: () => request<{ beats: Beat[] }>('/api/public/beats'),
  getPublicBeatById: (beatId: string) => request<Beat>(`/api/public/beats/${beatId}`),
  getContracts: () => request<{ templates: ContractTemplate[] }>('/api/public/contracts/templates'),
  signContract: (payload: {
    beatId: string;
    licenseType: LicenseType;
    templateId: string;
    buyerName: string;
    buyerEmail: string;
    typedSignature: string;
    acceptedFullTerms: true;
    acceptedSummary: true;
  }) => request<{ agreementId: string }>('/api/public/contracts/sign', { method: 'POST', body: JSON.stringify(payload) }),
  createBeatCheckoutSession: (payload: {
    beatId: string;
    licenseType: LicenseType;
    agreementId: string;
    buyerEmail: string;
  }) => request<{ checkoutUrl: string; sessionId: string }>('/api/public/checkout/beat-session', { method: 'POST', body: JSON.stringify(payload) }),
  getCheckoutStatus: (sessionId: string) =>
    request<CheckoutStatusResponse>(`/api/public/checkout/status/${encodeURIComponent(sessionId)}`),
  getApparelProducts: () => request<{ products: ApparelProduct[] }>('/api/public/apparel/products'),
  createApparelCheckoutSession: (payload: {
    buyerEmail?: string;
    items: Array<{ productId: string; variantId: string | number; quantity: number }>;
  }) => request<{ checkoutUrl: string; sessionId: string }>('/api/public/checkout/apparel-session', { method: 'POST', body: JSON.stringify(payload) }),
  loginOwner: (email: string, password: string) =>
    request<{ user: OwnerUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  logoutOwner: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  getOwnerMe: () => request<{ user: OwnerUser }>('/api/auth/me'),
  getOwnerOverview: () => request<{ overview: OwnerOverview }>('/api/owner/overview'),
  getOwnerBeats: () => request<{ beats: OwnerBeat[] }>('/api/owner/beats'),
  createOwnerBeat: (payload: {
    title: string;
    description?: string;
    bpm?: number | null;
    key?: string;
    tags?: string[];
    exclusivePriceCents: number;
    nonExclusivePriceCents: number;
    isAvailable?: boolean;
    isActive?: boolean;
  }) => request<{ beat: OwnerBeat }>('/api/owner/beats', { method: 'POST', body: JSON.stringify(payload) }),
  updateOwnerBeat: (beatId: string, payload: Partial<OwnerBeat>) =>
    request<{ beat: OwnerBeat }>(`/api/owner/beats/${beatId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  uploadBeatFiles: async (beatId: string, files: { preview?: File; full?: File }) => {
    const formData = new FormData();
    if (files.preview) formData.append('preview', files.preview);
    if (files.full) formData.append('full', files.full);

    const response = await fetch(`${API_BASE}/api/owner/beats/${beatId}/files`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(payload.error || 'Upload failed');
    }

    return response.json() as Promise<{ beat: OwnerBeat }>;
  },
  getOwnerOrders: () => request<{ orders: OwnerOrder[] }>('/api/owner/orders'),
  getOwnerContracts: () => request<{ contracts: OwnerContract[] }>('/api/owner/contracts')
};

export const formatCurrency = (cents: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(cents / 100);
