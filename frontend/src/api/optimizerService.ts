/**
 * [F5-05] Servicio HTTP para el endpoint de optimización de rutas.
 *
 * POST /api/v1/optimize/
 * - Request: { shopping_list_id, lat, lng, max_distance_km?, max_stops?, w_precio?, w_distancia?, w_tiempo? }
 * - Success: { success: true, data: OptimizeResponse }
 * - Error 404: { success: false, error: { code: "OPTIMIZER_NO_STORES_IN_RADIUS", message: "..." } }
 */

import { apiClient } from "./client";

export interface OptimizeRequest {
  shopping_list_id: number;
  lat: number;
  lng: number;
  max_distance_km?: number;
  max_stops?: number;
  w_precio?: number;
  w_distancia?: number;
  w_tiempo?: number;
}

export interface SaveSemanticChoiceRequest {
  shopping_list_id: number;
  query_text: string;
  product_id: number;
}

export interface RouteStopSemanticOption {
  product_id: number;
  product_name: string;
  brand: string;
  category: string;
}

export interface RouteStopProduct {
  query_text: string;
  quantity: number;
  matched_product_id: number;
  matched_product_name: string;
  matched_store_id: number;
  matched_store_name: string;
  matched_chain: string;
  price: number;
  similarity_score: number;
  candidate_rank: number;
  semantic_needs_confirmation: boolean;
  semantic_reason: string;
  semantic_hints: string[];
  semantic_options: RouteStopSemanticOption[];
}

export interface RouteStop {
  store_id: number;
  store_name: string;
  chain: string;
  lat: number;
  lng: number;
  distance_km: number;
  time_minutes: number;
  products: RouteStopProduct[];
}

export interface OptimizeResponse {
  id: number;
  shopping_list_id: number;
  max_distance_km: number;
  max_stops: number;
  w_precio: number;
  w_distancia: number;
  w_tiempo: number;
  user_lat: number | null;
  user_lng: number | null;
  total_price: number;
  total_distance_km: number;
  estimated_time_minutes: number;
  route: RouteStop[];
}

interface RawRouteStopProduct {
  query_text: string;
  quantity: number | string;
  matched_product_id: number | string;
  matched_product_name: string;
  matched_store_id: number | string;
  matched_store_name: string;
  matched_chain: string;
  price: number | string;
  similarity_score: number | string;
  candidate_rank: number | string;
  semantic_needs_confirmation?: boolean;
  semantic_reason?: string;
  semantic_hints?: unknown;
  semantic_options?: unknown;
}

interface RawRouteStopSemanticOption {
  product_id?: number | string;
  product_name?: string;
  brand?: string;
  category?: string;
}

interface RawRouteStop {
  store_id: number | string;
  store_name: string;
  chain: string;
  lat: number | string;
  lng: number | string;
  distance_km: number | string;
  time_minutes: number | string;
  products: RawRouteStopProduct[];
}

interface RawOptimizeResponse {
  id: number | string;
  shopping_list_id?: number | string;
  max_distance_km?: number | string;
  max_stops?: number | string;
  w_precio?: number | string;
  w_distancia?: number | string;
  w_tiempo?: number | string;
  user_lat?: number | string | null;
  user_lng?: number | string | null;
  total_price?: number | string;
  total_distance_km?: number | string;
  estimated_time_minutes?: number | string;
  route?: RawRouteStop[];
  route_data?: RawRouteStop[];
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
}

function normalizeSemanticOptions(value: unknown): RouteStopSemanticOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => {
      const raw = entry as RawRouteStopSemanticOption;
      return {
        product_id: Math.round(toNumber(raw.product_id, 0)),
        product_name: raw.product_name ?? "",
        brand: raw.brand ?? "",
        category: raw.category ?? "",
      };
    })
    .filter((entry) => entry.product_id > 0 && entry.product_name.length > 0);
}

function normalizeRouteStopProduct(raw: RawRouteStopProduct): RouteStopProduct {
  return {
    query_text: raw.query_text,
    quantity: Math.max(0, Math.round(toNumber(raw.quantity, 0))),
    matched_product_id: Math.round(toNumber(raw.matched_product_id, 0)),
    matched_product_name: raw.matched_product_name,
    matched_store_id: Math.round(toNumber(raw.matched_store_id, 0)),
    matched_store_name: raw.matched_store_name,
    matched_chain: raw.matched_chain,
    price: toNumber(raw.price, 0),
    similarity_score: toNumber(raw.similarity_score, 0),
    candidate_rank: Math.max(1, Math.round(toNumber(raw.candidate_rank, 1))),
    semantic_needs_confirmation: Boolean(raw.semantic_needs_confirmation),
    semantic_reason: raw.semantic_reason?.trim() ?? "",
    semantic_hints: toStringArray(raw.semantic_hints),
    semantic_options: normalizeSemanticOptions(raw.semantic_options),
  };
}

function normalizeRouteStop(raw: RawRouteStop): RouteStop {
  return {
    store_id: Math.round(toNumber(raw.store_id, 0)),
    store_name: raw.store_name,
    chain: raw.chain,
    lat: toNumber(raw.lat, 0),
    lng: toNumber(raw.lng, 0),
    distance_km: toNumber(raw.distance_km, 0),
    time_minutes: toNumber(raw.time_minutes, 0),
    products: (raw.products ?? []).map(normalizeRouteStopProduct),
  };
}

function normalizeOptimizeResponse(raw: RawOptimizeResponse): OptimizeResponse {
  const routeRaw = raw.route ?? raw.route_data ?? [];

  return {
    id: Math.round(toNumber(raw.id, 0)),
    shopping_list_id: Math.round(toNumber(raw.shopping_list_id, 0)),
    max_distance_km: toNumber(raw.max_distance_km, 10),
    max_stops: Math.max(2, Math.round(toNumber(raw.max_stops, 3))),
    w_precio: toNumber(raw.w_precio, 0.5),
    w_distancia: toNumber(raw.w_distancia, 0.3),
    w_tiempo: toNumber(raw.w_tiempo, 0.2),
    user_lat: raw.user_lat == null ? null : toNumber(raw.user_lat, 0),
    user_lng: raw.user_lng == null ? null : toNumber(raw.user_lng, 0),
    total_price: toNumber(raw.total_price, 0),
    total_distance_km: toNumber(raw.total_distance_km, 0),
    estimated_time_minutes: toNumber(raw.estimated_time_minutes, 0),
    route: routeRaw.map(normalizeRouteStop),
  };
}

export const optimizeRoute = async (
  data: OptimizeRequest,
): Promise<OptimizeResponse> => {
  const payload = await apiClient.post<
    never,
    RawOptimizeResponse | { data: RawOptimizeResponse }
  >("/optimize/", data);

  const raw =
    payload && typeof payload === "object" && "data" in payload
      ? (payload.data as RawOptimizeResponse)
      : (payload as RawOptimizeResponse);

  return normalizeOptimizeResponse(raw);
};

export const getLatestOptimizedRoute = async (
  shoppingListId: number,
): Promise<OptimizeResponse | null> => {
  const payload = await apiClient.get<
    never,
    RawOptimizeResponse | { data: RawOptimizeResponse } | null
  >("/optimize/", {
    params: { shopping_list_id: shoppingListId },
  });

  if (payload == null) {
    return null;
  }

  const raw =
    payload && typeof payload === "object" && "data" in payload
      ? (payload.data as RawOptimizeResponse)
      : (payload as RawOptimizeResponse);

  if (!raw || raw.id == null) {
    return null;
  }

  return normalizeOptimizeResponse(raw);
};

export const saveSemanticChoice = async (
  data: SaveSemanticChoiceRequest,
): Promise<void> => {
  await apiClient.post<never, { success: boolean }>("/optimize/choices/", data);
};
