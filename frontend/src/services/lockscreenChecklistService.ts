import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { listService } from '@/api/listService';
import type { ShoppingListItem } from '@/types/domain';

const ACTION_PREFIX = 'check-item:';
const CATEGORY_PREFIX = 'shopping-checklist-';
const TYPE_LOCKSCREEN_CHECKLIST = 'lockscreen-checklist';
const MAX_ACTIONS = 4;
const MAX_LINES = 8;

function isChecked(item: ShoppingListItem): boolean {
  return Boolean(item.is_checked ?? item.isChecked ?? false);
}

function buildChecklistBody(items: ShoppingListItem[]): string {
  return items
    .slice(0, MAX_LINES)
    .map((item) => `- ${item.name} x${item.quantity}`)
    .join('\n');
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
}): Promise<{ scheduled: boolean; id?: string; reason?: string }> {
  const { listId, listName, items } = params;
  const pendingItems = items.filter((item) => !isChecked(item));

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
  const actions = pendingItems.slice(0, MAX_ACTIONS).map((item) => ({
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
      body: buildChecklistBody(pendingItems),
      categoryIdentifier,
      data: {
        type: TYPE_LOCKSCREEN_CHECKLIST,
        listId,
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
      });
    } catch {
      // Silent fail: lockscreen action should never crash app startup.
    }
  });
}
