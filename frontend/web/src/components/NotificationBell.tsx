import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Popover, List, Typography, Button, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { fetchNotifications, fetchUnreadCount, markAsRead } from '../services/notifications';
import type { NotificationItem } from '../types/business';

const POLL_INTERVAL_MS = 60_000; // cada 60s

const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently ignore – badge stays at 0
    }
  }, []);

  useEffect(() => {
    void loadUnreadCount();
    const timer = setInterval(() => void loadUnreadCount(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [loadUnreadCount]);

  const handleOpen = async (visible: boolean) => {
    setOpen(visible);
    if (visible) {
      setLoading(true);
      try {
        const items = await fetchNotifications();
        setNotifications(items.slice(0, 20));
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const content = (
    <div style={{ width: 340, maxHeight: 420, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Typography.Text strong>Notificaciones</Typography.Text>
        {unreadCount > 0 && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {unreadCount} sin leer
          </Typography.Text>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sin notificaciones"
          style={{ padding: 16 }}
        />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              style={{
                padding: '10px 4px',
                background: item.is_read ? 'transparent' : 'rgba(95,94,94,0.04)',
                borderRadius: 8,
              }}
              extra={
                !item.is_read ? (
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => void handleMarkRead(item.id)}
                    title="Marcar como leída"
                  />
                ) : null
              }
            >
              <List.Item.Meta
                title={
                  <Typography.Text style={{ fontWeight: item.is_read ? 400 : 600, fontSize: 13 }}>
                    {item.title}
                  </Typography.Text>
                }
                description={
                  <>
                    <Typography.Text style={{ fontSize: 12, color: '#65655c' }}>
                      {item.message}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {formatDate(item.created_at)}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={(v) => void handleOpen(v)}
      placement="bottomRight"
      arrow={false}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 4]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ display: 'flex', alignItems: 'center' }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
