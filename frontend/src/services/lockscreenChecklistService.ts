import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { listService } from '@/api/listService';
import type { ShoppingListItem } from '@/types/domain';

const ACTION_PREFIX = 'check-item:';
const CATEGORY_PREFIX = 'shopping-checklist-';
const TYPE_LOCKSCREEN_CHECKLIST = 'lockscreen-checklist';
const MAX_ACTIONS = 4;
const MAX_LINES = 10;

interface OrderedChecklistItem {
  item: ShoppingListItem;
  isChecked: boolean;
}

function isChecked(item: ShoppingListItem): boolean {
  return Boolean(item.is_checked ?? item.isChecked ?? false);
}

function parseOrderedItemIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
}

function buildOrderedChecklistItems(
  items: ShoppingListItem[],
  orderedItemIds?: string[],
): OrderedChecklistItem[] {
  if (!orderedItemIds || orderedItemIds.length === 0) {
    return items.map((item) => ({ item, isChecked: isChecked(item) }));
  }

  const byId = new Map<string, ShoppingListItem>();
  for (const item of items) {
    byId.set(item.id, item);
  }

  const ordered: OrderedChecklistItem[] = [];
  for (const itemId of orderedItemIds) {
    const found = byId.get(itemId);
    if (!found) {
      continue;
    }
    ordered.push({ item: found, isChecked: isChecked(found) });
  }

  return ordered;
}

function buildChecklistBody(items: OrderedChecklistItem[]): string {
  const rows = items
    .slice(0, MAX_LINES)
    .map(({ item, isChecked: itemChecked }) => {
      const mark = itemChecked ? '[x]' : '[ ]';
      return `${mark} ${item.name} x${item.quantity}`;
    })
    .join('\n');

  if (items.length <= MAX_LINES) {
    return rows;
  }

  const hidden = items.length - MAX_LINES;
  return `${rows}\n... y ${hidden} más`;
}

async function ensureNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function cancelPreviousChecklistNotifications(listId: string): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = pending.filter((scheduled) => {
    const data = scheduled.content.data as Record<string, unknown> | undefined;
    return (
      data?.type === TYPE_LOCKSCREEN_CHECKLIST &&
      typeof data.listId === 'string' &&
      data.listId === listId
    );
  });

  await Promise.all(
    toCancel.map((scheduled) =>
      Notifications.cancelScheduledNotificationAsync(scheduled.identifier),
    ),
  );
}

export async function scheduleLockscreenChecklist(params: {
  listId: string;
  listName: string;
  items: ShoppingListItem[];
  orderedItemIds?: string[];
}): Promise<{ scheduled: boolean; id?: string; reason?: string }> {
  const { listId, listName, items, orderedItemIds } = params;
  const orderedItems = buildOrderedChecklistItems(items, orderedItemIds);
  const pendingItems = orderedItems.filter(({ isChecked: itemChecked }) => !itemChecked);

  if (pendingItems.length === 0) {
    return { scheduled: false, reason: 'no-pending-items' };
  }

  const hasPermissions = await ensureNotificationPermissions();
  if (!hasPermissions) {
    return { scheduled: false, reason: 'permission-denied' };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('shopping-checklist', {
      name: 'Checklist de compra',
      importance: Notifications.AndroidImportance.HIGH,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  const categoryIdentifier = `${CATEGORY_PREFIX}${listId}`;
  const actions = pendingItems.slice(0, MAX_ACTIONS).map(({ item }) => ({
    identifier: `${ACTION_PREFIX}${item.id}`,
    buttonTitle: `✓ ${item.name}`,
    options: {
      opensAppToForeground: true,
    },
  }));

  await Notifications.setNotificationCategoryAsync(categoryIdentifier, actions);
  await cancelPreviousChecklistNotifications(listId);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Lista en compra: ${listName}`,
      body: buildChecklistBody(orderedItems),
      categoryIdentifier,
      data: {
        type: TYPE_LOCKSCREEN_CHECKLIST,
        listId,
        orderedItemIds: orderedItems.map(({ item }) => item.id),
      },
      sound: false,
    },
    trigger: null,
  });

  return { scheduled: true, id };
}

export function registerLockscreenChecklistActionHandler(): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(async (response) => {
    const actionIdentifier = response.actionIdentifier;
    if (!actionIdentifier.startsWith(ACTION_PREFIX)) {
      return;
    }

    const data = response.notification.request.content.data as Record<string, unknown>;
    const listId = typeof data?.listId === 'string' ? data.listId : null;
    const orderedItemIds = parseOrderedItemIds(data?.orderedItemIds);
    const itemId = actionIdentifier.slice(ACTION_PREFIX.length);

    if (!listId || !itemId) {
      return;
    }

    try {
      await listService.updateItem(listId, itemId, { is_checked: true });
      const freshList = await listService.getList(listId);
      await scheduleLockscreenChecklist({
        listId,
        listName: freshList.name,
        items: freshList.items,
        orderedItemIds,
      });
    } catch {
      // Silent fail: lockscreen action should never crash app startup.
    }
  });
}
