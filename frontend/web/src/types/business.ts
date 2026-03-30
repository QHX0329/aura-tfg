/**
 * Tipos compartidos del portal business de BarGAIN.
 *
 * Centraliza interfaces que antes se redefinían en cada página.
 */

/* ── Perfil de negocio ── */

export interface BusinessProfile {
  id: number;
  user: number;
  business_name: string;
  tax_id: string;
  address: string;
  website: string;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string;
  price_alert_threshold_pct: number;
  created_at: string;
  updated_at: string;
}

/* ── Precios ── */

export interface PriceRecord {
  id: number;
  product: number | { id: number; name?: string };
  store: number | { id: number; name?: string };
  price: string;
  unit_price: string | null;
  offer_price: string | null;
  offer_end_date: string | null;
  source: string;
  is_stale: boolean;
  verified_at: string;
  created_at: string;
}

/* ── Promociones ── */

export interface PromotionRecord {
  id: number;
  product: number | { id: number; name?: string };
  store: number | { id: number; name?: string };
  discount_type: 'flat' | 'percentage';
  discount_value: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  min_quantity: number | null;
  title: string;
  description: string;
  views: number;
  created_at: string;
}

/* ── Opciones para selects ── */

export interface ProductOption {
  id: number;
  name: string;
  barcode: string;
  normalized_name?: string;
}

export interface StoreOption {
  id: number;
  name: string;
  address: string;
  is_active: boolean;
}

/* ── Notificaciones ── */

export interface NotificationItem {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  data: Record<string, unknown>;
  created_at: string;
}

/* ── Estadísticas de negocio ── */

export interface BusinessStats {
  total_active_prices: number;
  total_active_promotions: number;
  total_stores: number;
  total_promotion_views: number;
  latest_price_update: string | null;
  latest_promotion_created: string | null;
}

/* ── Resultado de bulk update ── */

export interface BulkUpdateResult {
  created: number;
  updated: number;
  errors: Array<{ index: number; errors: Record<string, string> }>;
}
