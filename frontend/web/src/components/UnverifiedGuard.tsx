import React from 'react';
import { Button, Result, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useBusinessStore } from '../store/businessStore';

type VerificationStatus = 'pending' | 'verified' | 'rejected';

/**
 * Pure function — returns display content for the given verification status.
 * Returns null for 'verified' (children should render).
 * Exported for unit testing without React rendering.
 */
export function getGuardContent(
  status: VerificationStatus | undefined,
  rejectionReason: string | undefined,
): React.ReactNode {
  if (status === 'verified') {
    return null;
  }

  if (status === 'pending') {
    return (
      <Result
        status="warning"
        title="Solicitud en revisión"
        subTitle="Tu solicitud está siendo revisada. Te notificaremos cuando sea aprobada."
      />
    );
  }

  if (status === 'rejected') {
    return (
      <Result
        status="error"
        title="Solicitud rechazada"
        subTitle={
          rejectionReason
            ? `Motivo del rechazo: ${rejectionReason}`
            : 'Tu solicitud ha sido rechazada.'
        }
        extra={
          <Button type="primary" href="/profile">
            Editar perfil
          </Button>
        }
      />
    );
  }

  return null;
}

interface UnverifiedGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that blocks access for unverified (pending/rejected) businesses.
 * Renders a status screen for pending and rejected, passes through for verified.
 */
const UnverifiedGuard: React.FC<UnverifiedGuardProps> = ({ children }) => {
  const { profile } = useBusinessStore();
  const navigate = useNavigate();

  if (profile === null) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const content = getGuardContent(profile.verification_status, profile.rejection_reason);

  if (content !== null) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        {profile.verification_status === 'rejected' ? (
          <Result
            status="error"
            title="Solicitud rechazada"
            subTitle={
              profile.rejection_reason
                ? `Motivo del rechazo: ${profile.rejection_reason}`
                : 'Tu solicitud ha sido rechazada.'
            }
            extra={
              <Button type="primary" onClick={() => navigate('/profile')}>
                Editar perfil
              </Button>
            }
          />
        ) : (
          content
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default UnverifiedGuard;
