/**
 * Servicio de precios para el portal business.
 */

import { apiClient } from '../api/client';
import type { BulkUpdateResult, PriceRecord, StoreOption } from '../types/business';

/** Lista precios del negocio autenticado. */
export async function fetchPrices(): Promise<PriceRecord[]> {
  const res = await apiClient.get<PriceRecord[]>('/business/prices/');
  return Array.isArray(res.data) ? res.data : [];
}

/** Crea un nuevo precio. */
export async function createPrice(
  data: Pick<PriceRecord, 'product' | 'store' | 'price' | 'unit_price' | 'offer_price' | 'offer_end_date'>,
): Promise<PriceRecord> {
  const res = await apiClient.post<PriceRecord>('/business/prices/', data);
  return res.data;
}

/** Actualiza un precio existente. */
export async function updatePrice(
  id: number,
  data: Partial<Pick<PriceRecord, 'price' | 'unit_price' | 'offer_price' | 'offer_end_date'>>,
): Promise<PriceRecord> {
  const res = await apiClient.patch<PriceRecord>(`/business/prices/${id}/`, data);
  return res.data;
}

/** Elimina un precio. */
export async function deletePrice(id: number): Promise<void> {
  await apiClient.delete(`/business/prices/${id}/`);
}

/** Actualización masiva de precios por lote. */
export async function bulkUpdatePrices(
  items: {
    product: number;
    store: number;
    price: string;
    unit_price?: string | null;
    offer_price?: string | null;
    offer_end_date?: string | null;
  }[],
): Promise<BulkUpdateResult> {
  const res = await apiClient.post<BulkUpdateResult>('/business/prices/bulk-update/', items);
  return res.data;
}

/** Lista tiendas del negocio autenticado. */
export async function fetchBusinessStores(): Promise<StoreOption[]> {
  const res = await apiClient.get<StoreOption[]>('/business/prices/stores/');
  return Array.isArray(res.data) ? res.data : [];
}
