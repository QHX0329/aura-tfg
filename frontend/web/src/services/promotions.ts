/**
 * Servicio de promociones para el portal business.
 */

import { apiClient } from '../api/client';
import type { PromotionRecord } from '../types/business';

/** Lista promociones del negocio autenticado. */
export async function fetchPromotions(): Promise<PromotionRecord[]> {
  const res = await apiClient.get<PromotionRecord[]>('/business/promotions/');
  return Array.isArray(res.data) ? res.data : [];
}

/** Crea una nueva promoción. */
export async function createPromotion(
  data: Omit<PromotionRecord, 'id' | 'views' | 'created_at'>,
): Promise<PromotionRecord> {
  const res = await apiClient.post<PromotionRecord>('/business/promotions/', data);
  return res.data;
}

/** Actualiza una promoción existente. */
export async function updatePromotion(
  id: number,
  data: Partial<Omit<PromotionRecord, 'id' | 'views' | 'created_at'>>,
): Promise<PromotionRecord> {
  const res = await apiClient.patch<PromotionRecord>(`/business/promotions/${id}/`, data);
  return res.data;
}

/** Desactiva una promoción. */
export async function deactivatePromotion(id: number): Promise<void> {
  await apiClient.post(`/business/promotions/${id}/deactivate/`);
}
