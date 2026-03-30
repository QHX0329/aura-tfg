/**
 * Servicio de estadísticas del negocio.
 */

import { apiClient } from '../api/client';
import type { BusinessStats } from '../types/business';

/** Obtiene estadísticas agregadas del perfil de negocio. */
export async function fetchBusinessStats(): Promise<BusinessStats> {
  const res = await apiClient.get<BusinessStats>('/business/profiles/stats/');
  return res.data;
}
