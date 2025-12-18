import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Typography } from '@mui/material';

import Loading from '@/components/Loading';
import { FullSizeCentered } from '@/components/styled';

type UserInfo = {
  name: string;
  claims: { type: string; value: string }[];
};

function LoginPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await fetch('/bff/user', {
        credentials: 'include', // Include cookies
      });
      if (res.status === 401) {
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data);
      }
    } catch (e) {
      console.error(e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogin = () => {
    window.location.href = '/bff/login';
  };

  const handleLogout = () => {
    window.location.href = '/bff/logout';
  };

  if (loading) {
    return <Loading />;
  }

  const isAuth = !!user;

  return (
    <>
      <meta name="title" content={t('accountPage.title')} />
      {!isAuth && <Button onClick={handleLogin}>{t('accountPage.signIn')}</Button>}
      {isAuth && (
        <FullSizeCentered>
          <Typography variant="h3">{t('accountPage.title')}</Typography>
          <Typography variant="body1">{t('accountPage.hello', { name: user.name })}</Typography>
          <Button onClick={handleLogout}>{t('accountPage.signOut')}</Button>
        </FullSizeCentered>
      )}
    </>
  );
}

export default LoginPage;
