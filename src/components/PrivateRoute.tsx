import { ReactNode, useEffect, useState } from 'react';

import { Typography } from '@mui/material';

import Loading from './Loading';
import { FullSizeCentered } from './styled';

interface PrivateRouteProps {
  children: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setLogggedIn] = useState<boolean>(false);

  const loadUser = async () => {
    setLoading(true);
    fetch('/bff/user', {
      credentials: 'include', // Include cookies
    })
      .then((r) => {
        if (r.status === 401) {
          setLogggedIn(false);
        } else {
          setLogggedIn(true);
        }
      })
      .catch((e) => {
        setLogggedIn(false);
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) return <Loading />;

  if (!isLoggedIn)
    return (
      <FullSizeCentered>
        <Typography variant="h3">Sign In required</Typography>
      </FullSizeCentered>
    );
  return children;
}
