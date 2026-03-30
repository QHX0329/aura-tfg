import React, { useMemo, useState } from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreAddOutlined,
  TagsOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useBusinessStore } from '../store/businessStore';
import NotificationBell from './NotificationBell';

const { Sider, Header, Content } = Layout;
const { Title } = Typography;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, profile } = useBusinessStore();
  const [collapsed, setCollapsed] = useState(false);

  const headerSubtitle = useMemo(() => {
    if (profile?.business_name) {
      return profile.business_name;
    }
    return 'Portal Business';
  }, [profile?.business_name]);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/prices',
      icon: <ShoppingOutlined />,
      label: 'Precios',
    },
    {
      key: '/products-upload',
      icon: <AppstoreAddOutlined />,
      label: 'Productos',
    },
    {
      key: '/promotions',
      icon: <TagsOutlined />,
      label: 'Promociones',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout className="business-shell">
      <Sider
        className="business-sider"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={250}
      >
        <div className="business-brand">
          {collapsed ? 'B' : 'BarGAIN Business'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="business-main-header">
          <div className="header-title-block">
            <Title level={4} style={{ margin: 0, fontFamily: 'Manrope, sans-serif' }}>
              Centro de Operaciones
            </Title>
            <Typography.Text className="header-kicker">{headerSubtitle}</Typography.Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NotificationBell />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger
            >
              Cerrar sesión
            </Button>
          </div>
        </Header>
        <Content className="business-main-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
