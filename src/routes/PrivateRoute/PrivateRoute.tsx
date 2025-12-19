import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@mui/material';

import Loading from '@/components/Loading';
import Unauthorized from '@/components/Unauthorized';

interface PrivateRouteProps {
  children: ReactNode;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthorized' | 'error';

export function PrivateRoute({ children }: PrivateRouteProps) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const response = await fetch('/bff/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (cancelled) return;

        if (response.status === 401) {
          setStatus('unauthorized');
          return;
        }

        if (response.ok) {
          setStatus('authenticated');
          return;
        }

        setStatus('error');
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    };

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loading />
      </Box>
    );
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  if (status === 'unauthorized') {
    return <Unauthorized />;
  }

  // status === 'error'
  return <Unauthorized message={t('unauthorized.pleaseAuthorize')} />;
}
