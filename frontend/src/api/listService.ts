/**
 * Servicio de listas de la compra — wrapper tipado sobre apiClient.
 */

import { apiClient } from "./client";
import type { ShoppingList, ShoppingListItem } from "@/types/domain";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function normalizeListCollection(
  payload: ShoppingList[] | PaginatedResponse<ShoppingList>,
): ShoppingList[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
}

export interface AddItemPayload {
  product_id: string;
  quantity: number;
}

export interface UpdateItemPayload {
  quantity?: number;
  is_checked?: boolean;
  note?: string;
}

export const listService = {
  /** GET /lists/ — listar todas las listas del usuario */
  getLists: async (): Promise<ShoppingList[]> => {
    const payload = await apiClient.get<
      never,
      ShoppingList[] | PaginatedResponse<ShoppingList>
    >("/lists/");
    return normalizeListCollection(payload);
  },

  /** GET /lists/{id}/ — detalle de una lista */
  getList: (id: string): Promise<ShoppingList> =>
    apiClient.get<never, ShoppingList>(`/lists/${id}/`),

  /** POST /lists/ — crear nueva lista */
  createList: (name: string): Promise<ShoppingList> =>
    apiClient.post<never, ShoppingList>("/lists/", { name }),

  /** PATCH /lists/{id}/ — actualizar nombre u otros campos */
  updateList: (id: string, data: Partial<Pick<ShoppingList, "name" | "isFavorite">>): Promise<ShoppingList> =>
    apiClient.patch<never, ShoppingList>(`/lists/${id}/`, data),

  /** DELETE /lists/{id}/ — eliminar lista */
  deleteList: (id: string): Promise<void> =>
    apiClient.delete<never, void>(`/lists/${id}/`),

  /** POST /lists/{id}/items/ — añadir producto a la lista */
  addItem: (listId: string, payload: AddItemPayload): Promise<ShoppingListItem> =>
    apiClient.post<never, ShoppingListItem>(`/lists/${listId}/items/`, payload),

  /** PATCH /lists/{id}/items/{itemId}/ — actualizar ítem */
  updateItem: (
    listId: string,
    itemId: string,
    data: UpdateItemPayload,
  ): Promise<ShoppingListItem> =>
    apiClient.patch<never, ShoppingListItem>(
      `/lists/${listId}/items/${itemId}/`,
      data,
    ),

  /** DELETE /lists/{id}/items/{itemId}/ — eliminar ítem */
  deleteItem: (listId: string, itemId: string): Promise<void> =>
    apiClient.delete<never, void>(`/lists/${listId}/items/${itemId}/`),
};
