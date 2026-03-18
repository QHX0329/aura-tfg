/**
 * Servicio de precios — wrapper tipado sobre apiClient.
 */

import { apiClient } from "./client";
import type { Price, PriceAlert } from "@/types/domain";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function normalizeCollection<T>(payload: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
}

export const priceService = {
  /** GET /prices/alerts/ — alertas de precio activas del usuario */
  getPriceAlerts: async (): Promise<PriceAlert[]> => {
    const payload = await apiClient.get<
      never,
      PriceAlert[] | PaginatedResponse<PriceAlert>
    >("/prices/alerts/");
    return normalizeCollection(payload);
  },

  /** GET /prices/?product={productId} — comparar precios de un producto */
  getPriceComparison: (productId: string): Promise<Price[]> =>
    apiClient.get<never, Price[]>("/prices/", {
      params: { product: productId },
    }),
};
