import { create } from 'zustand';

export interface BusinessProfile {
  id: string;
  business_name: string;
  tax_id: string;
  address: string;
  website?: string;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string;
  price_alert_threshold_pct: number;
}

export interface Promotion {
  id: string;
  product: { id: string; name: string };
  store: { id: string; name: string };
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  min_quantity?: number;
  views: number;
}

interface BusinessStoreState {
  token: string | null;
  profile: BusinessProfile | null;
  promotions: Promotion[];
  isLoading: boolean;
  setToken: (t: string) => void;
  setProfile: (p: BusinessProfile) => void;
  setPromotions: (list: Promotion[]) => void;
  logout: () => void;
}

export const useBusinessStore = create<BusinessStoreState>((set) => ({
  token: localStorage.getItem('access_token'),
  profile: null,
  promotions: [],
  isLoading: false,

  setToken: (t: string) => {
    localStorage.setItem('access_token', t);
    set({ token: t });
  },

  setProfile: (p: BusinessProfile) => {
    set({ profile: p });
  },

  setPromotions: (list: Promotion[]) => {
    set({ promotions: list });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ token: null, profile: null, promotions: [] });
  },
}));
