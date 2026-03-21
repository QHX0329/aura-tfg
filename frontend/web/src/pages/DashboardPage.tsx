import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Alert, Tag, Progress, Table } from 'antd';
import { ShopOutlined, TagsOutlined, DollarOutlined, LineChartOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../api/client';
import { useBusinessStore } from '../store/businessStore';
import type { BusinessProfile, Promotion } from '../store/businessStore';
import { extractBusinessProfiles } from '../utils/businessProfiles';
import {
  collectUnresolvedEntityIds,
  resolveEntityName,
} from '../utils/entityResolver';

const { Title, Text } = Typography;

interface PriceRecord {
  id: string;
  product: { id: string; name?: string } | string | number | null;
  price: string;
  updated_at: string;
}

interface ProductLookupRecord {
  id: string | number;
  name: string;
}

type PromotionStatus = 'active' | 'pending' | 'inactive';

const getPromotionStatus = (promotion: Promotion): PromotionStatus => {
  if (!promotion.is_active) {
    return 'inactive';
  }

  const today = new Date();
  const start = new Date(promotion.start_date);
  const end = promotion.end_date ? new Date(promotion.end_date) : null;

  if (start > today) {
    return 'pending';
  }

  if (end && end < today) {
    return 'inactive';
  }

  return 'active';
};

const DashboardPage: React.FC = () => {
  const { profile, setProfile } = useBusinessStore();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [recentPrices, setRecentPrices] = useState<PriceRecord[]>([]);
  const [productNamesById, setProductNamesById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, promotionsRes, pricesRes] = await Promise.all([
          apiClient.get<BusinessProfile[]>('/business/profiles/'),
          apiClient.get<Promotion[] | { results?: Promotion[] }>('/business/promotions/'),
          apiClient.get<{ results?: PriceRecord[] } | PriceRecord[]>(
            '/business/prices/?limit=8&ordering=-updated_at',
          ),
        ]);

        const profiles = extractBusinessProfiles(profileRes.data);
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }

        const promotionsData = promotionsRes.data;
        if (Array.isArray(promotionsData)) {
          setPromotions(promotionsData);
        } else if (promotionsData && 'results' in promotionsData && Array.isArray(promotionsData.results)) {
          setPromotions(promotionsData.results);
        } else {
          setPromotions([]);
        }

        const pricesData = pricesRes.data;
        if (Array.isArray(pricesData)) {
          setRecentPrices(pricesData);
        } else if (pricesData && 'results' in pricesData && Array.isArray(pricesData.results)) {
          setRecentPrices(pricesData.results);
        }
      } catch {
        setError('Error al cargar los datos del dashboard. Comprueba la conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [setProfile]);

  useEffect(() => {
    const unresolvedProductIds = collectUnresolvedEntityIds(
      recentPrices.map((price) => price.product),
      productNamesById,
    );

    if (unresolvedProductIds.length === 0) {
      return;
    }

    const resolveNames = async () => {
      const lookups = await Promise.allSettled(
        unresolvedProductIds.map(async (productId) => {
          const response = await apiClient.get<ProductLookupRecord>(`/products/${productId}/`);
          return response.data;
        }),
      );

      const resolved = lookups.reduce<Record<string, string>>((acc, result) => {
        if (result.status === 'fulfilled') {
          acc[String(result.value.id)] = result.value.name;
        }
        return acc;
      }, {});

      if (Object.keys(resolved).length > 0) {
        setProductNamesById((previous) => ({ ...previous, ...resolved }));
      }
    };

    void resolveNames();
  }, [recentPrices, productNamesById]);

  const resolveProductName = (entity: PriceRecord['product']): string => {
    return resolveEntityName({
      entity,
      byId: productNamesById,
      fallback: 'Producto sin nombre',
    });
  };

  const promotionsByStatus = useMemo(() => {
    const counters = { active: 0, pending: 0, inactive: 0 };
    promotions.forEach((promotion) => {
      counters[getPromotionStatus(promotion)] += 1;
    });
    return counters;
  }, [promotions]);

  const activePromotions = promotionsByStatus.active;
  const totalViews = useMemo(
    () => promotions.reduce((sum, promotion) => sum + (promotion.views ?? 0), 0),
    [promotions],
  );

  const avgDiscount = useMemo(() => {
    if (promotions.length === 0) {
      return 0;
    }

    const weighted = promotions.reduce((sum, promotion) => {
      if (promotion.discount_type === 'percentage') {
        return sum + promotion.discount_value;
      }
      return sum + Math.min(30, promotion.discount_value * 2);
    }, 0);

    return Number((weighted / promotions.length).toFixed(1));
  }, [promotions]);

  const statusRatio = useMemo(() => {
    const total = promotions.length || 1;
    return {
      active: Math.round((promotionsByStatus.active / total) * 100),
      pending: Math.round((promotionsByStatus.pending / total) * 100),
      inactive: Math.round((promotionsByStatus.inactive / total) * 100),
    };
  }, [promotions.length, promotionsByStatus.active, promotionsByStatus.inactive, promotionsByStatus.pending]);

  const priceColumns: ColumnsType<PriceRecord> = [
    {
      title: 'Producto',
      key: 'product',
      render: (_: unknown, record: PriceRecord) => resolveProductName(record.product),
    },
    {
      title: 'Precio actual',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (value: string) => `${value} EUR`,
    },
    {
      title: 'Actualizado',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 150,
      render: (value: string) => new Date(value).toLocaleDateString('es-ES'),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div>
      <section className="dashboard-hero">
        <Title level={3}>
          Panel ejecutivo del negocio
        </Title>
        <Text type="secondary">
          Prioriza decisiones con indicadores de actividad comercial y promociones en tiempo real.
        </Text>
        <div style={{ marginTop: 14 }}>
          <Tag color="success">Operativo</Tag>
          <Tag color="processing">Modo analitico</Tag>
          <Tag color="default">Actualizado hoy</Tag>
        </div>
      </section>

      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card className="surface-card kpi-card" style={{ width: '100%', height: '100%' }}>
            <Statistic
              title="Nombre del negocio"
              value={profile?.business_name ?? '—'}
              prefix={<ShopOutlined />}
              styles={{ content: { fontSize: 18, fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card className="surface-card kpi-card" style={{ width: '100%', height: '100%' }}>
            <Statistic
              title="Promociones activas"
              value={activePromotions}
              prefix={<TagsOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card className="surface-card kpi-card" style={{ width: '100%', height: '100%' }}>
            <Statistic
              title="Descuento medio"
              value={avgDiscount}
              suffix="%"
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card className="surface-card kpi-card" style={{ width: '100%', height: '100%' }}>
            <Statistic
              title="Interes acumulado"
              value={totalViews}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card className="surface-card" title="Salud de promociones" style={{ height: '100%' }}>
            <div style={{ marginBottom: 10 }}>
              <Text>Activas ({promotionsByStatus.active})</Text>
              <Progress percent={statusRatio.active} strokeColor="#5a7d66" showInfo={false} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <Text>Pendientes ({promotionsByStatus.pending})</Text>
              <Progress percent={statusRatio.pending} strokeColor="#8f6d43" showInfo={false} />
            </div>
            <div>
              <Text>Inactivas ({promotionsByStatus.inactive})</Text>
              <Progress percent={statusRatio.inactive} strokeColor="#9b8f80" showInfo={false} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card className="surface-card" title="Ajustes recientes de precio">
            <Table<PriceRecord>
              dataSource={recentPrices}
              columns={priceColumns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: 'No hay actualizaciones de precio recientes.' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
