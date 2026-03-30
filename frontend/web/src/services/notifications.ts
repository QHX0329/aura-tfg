/**
 * Servicio de notificaciones para el portal business.
 */

import { apiClient } from '../api/client';
import type { NotificationItem } from '../types/business';

/** Lista notificaciones del usuario autenticado. */
export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient.get<NotificationItem[] | { results?: NotificationItem[] }>(
    '/notifications/',
  );
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.results)) return res.data.results;
  return [];
}

/** Obtiene el conteo de notificaciones no leídas. */
export async function fetchUnreadCount(): Promise<number> {
  const res = await apiClient.get<{ unread_count: number }>('/notifications/unread-count/');
  return res.data?.unread_count ?? 0;
}

/** Marca una notificación como leída. */
export async function markAsRead(id: number): Promise<void> {
  await apiClient.post(`/notifications/${id}/read/`);
}
