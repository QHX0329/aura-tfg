/**
 * Servicio de precios — wrapper tipado sobre apiClient.
 */

import { apiClient } from "./client";
import type { PriceAlert, PriceCompare } from "@/types/domain";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function normalizeCollection<T>(payload: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray((payload as PaginatedResponse<T>).results))
    return (payload as PaginatedResponse<T>).results;
  return [];
}

export interface CreatePriceAlertPayload {
  product: number;
  store?: number | null;
  target_price: string;
}

export interface UpdatePriceAlertPayload {
  target_price?: string;
  store?: number | null;
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

  /** POST /prices/alerts/ — crear alerta de precio */
  createPriceAlert: (data: CreatePriceAlertPayload): Promise<PriceAlert> =>
    apiClient.post<never, PriceAlert>("/prices/alerts/", data),

  /** DELETE /prices/alerts/{id}/ — eliminar alerta */
  deletePriceAlert: (id: string): Promise<void> =>
    apiClient.delete<never, void>(`/prices/alerts/${id}/`),

  /** PATCH /prices/alerts/{id}/ — actualizar alerta */
  updatePriceAlert: (
    id: string,
    data: UpdatePriceAlertPayload,
  ): Promise<PriceAlert> =>
    apiClient.patch<never, PriceAlert>(`/prices/alerts/${id}/`, data),

  /**
   * GET /prices/compare/?product=<id>[&lat=<lat>&lng=<lng>&radius=<km>]
   * Devuelve precios del producto en tiendas cercanas.
   */
  getPriceComparison: (
    productId: string | number,
    lat?: number,
    lng?: number,
    radius = 10,
  ): Promise<PriceCompare[]> =>
    apiClient.get<never, PriceCompare[]>("/prices/compare/", {
      params: {
        product: productId,
        ...(lat !== undefined && lng !== undefined ? { lat, lng, radius } : {}),
      },
    }),

  /**
   * GET /prices/{product_id}/history/
   * Histórico diario (min/max/avg) de los últimos 90 días.
   */
  getPriceHistory: (productId: string | number): Promise<unknown> =>
    apiClient.get(`/prices/${productId}/history/`),

  /**
   * GET /prices/list-total/?list=<id>&store=<id>
   * Coste total de una lista en una tienda específica.
   */
  getListTotal: (
    listId: string | number,
    storeId: string | number,
  ): Promise<unknown> =>
    apiClient.get("/prices/list-total/", {
      params: { list: listId, store: storeId },
    }),

  /**
   * POST /prices/crowdsource/ — reportar precio de un producto en una tienda
   */
  crowdsourcePrice: (data: {
    product: number;
    store: number;
    price: string;
    offer_price?: string;
  }): Promise<unknown> => apiClient.post("/prices/crowdsource/", data),
};
