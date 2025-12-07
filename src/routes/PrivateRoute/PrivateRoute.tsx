import { ReactNode, useEffect, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';

import Unauthorized from '@/components/Unauthorized';

interface PrivateRouteProps {
  children: ReactNode;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthorized' | 'error';

export function PrivateRoute({ children }: PrivateRouteProps) {
  const [status, setStatus] = useState<AuthStatus>('loading');

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
        <CircularProgress />
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
  return <Unauthorized message="Authorization check failed. Try signing in again." />;
}
