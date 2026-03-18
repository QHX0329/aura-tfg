import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiClient, API_BASE_URL } from '../api/client';
import { useBusinessStore } from '../store/businessStore';
import type { BusinessProfile } from '../store/businessStore';

const { Title } = Typography;

/**
 * Pure async function — handles login logic independently of React rendering.
 * Accepts an axiosInstance for testability.
 * Throws on error.
 */
export async function handleLogin(
  email: string,
  password: string,
  axiosInstance: Pick<typeof axios, 'post'>,
): Promise<void> {
  const response = await axiosInstance.post(`${API_BASE_URL}/auth/token/`, {
    username: email,
    password,
  });

  const data = response.data as { access?: string; refresh?: string };
  const accessToken = data.access;

  if (!accessToken) {
    throw new Error('No access token in response');
  }

  localStorage.setItem('access_token', accessToken);
  if (data.refresh) {
    localStorage.setItem('refresh_token', data.refresh);
  }
}

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setToken, setProfile } = useBusinessStore();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await handleLogin(values.email, values.password, axios);
      const token = localStorage.getItem('access_token') ?? '';
      setToken(token);

      // Load business profile into store
      const profileResponse = await apiClient.get<BusinessProfile[]>('/business/profiles/');
      const profiles = profileResponse.data;
      if (Array.isArray(profiles) && profiles.length > 0) {
        setProfile(profiles[0]);
      }

      navigate('/');
    } catch {
      void message.error('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0 }}>
            BargAIn Business
          </Title>
          <Typography.Text type="secondary">Portal de gestión para empresas PYME</Typography.Text>
        </div>
        <Form<LoginFormValues>
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[
              { required: true, message: 'Introduce tu correo electrónico' },
              { type: 'email', message: 'Introduce un correo electrónico válido' },
            ]}
          >
            <Input placeholder="empresa@ejemplo.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Introduce tu contraseña' }]}
          >
            <Input.Password placeholder="Contraseña" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              style={{ width: '100%' }}
            >
              Iniciar sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
