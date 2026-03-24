import { useTranslation } from 'react-i18next';

import { Button, Stack, Typography } from '@mui/material';

import Loading from '@/components/Loading';
import { FullSizeCentered } from '@/components/styled';
import { useUser } from '@/hooks/useUser';

function AccountPage() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useUser();

  const handleLogin = () => {
    window.location.href = `/bff/login?ui_locales=${i18n.language}`;
  };

  const handleLogout = () => {
    window.location.href = `/bff/logout?ui_locales=${i18n.language}`;
  };

  const handleChangePassword = () => {
    window.location.href = `/bff/change-password?ui_locales=${i18n.language}`;
  };

  const handleUpdateProfile = () => {
    window.location.href = `/bff/update-profile?ui_locales=${i18n.language}`;
  };

  if (loading) {
    return <Loading />;
  }

  const isAuth = !!user;

  console.log(user);

  return (
    <>
      <meta name="title" content={t('accountPage.title')} />
      {!isAuth && (
        <FullSizeCentered>
          <Button variant="contained" onClick={handleLogin}>
            {t('accountPage.signIn')}
          </Button>
        </FullSizeCentered>
      )}
      {isAuth && (
        <FullSizeCentered>
          <Typography variant="h3" gutterBottom>
            {t('accountPage.title')}
          </Typography>
          <Typography variant="body1">
            {t('accountPage.hello', {
              name: user.fullName || user.name,
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t('accountPage.username')}: {user.name}
          </Typography>

          <Stack spacing={2} sx={{ width: '100%', maxWidth: 300 }}>
            <Button variant="outlined" onClick={handleUpdateProfile}>
              {t('accountPage.updateProfile')}
            </Button>
            <Button variant="outlined" onClick={handleChangePassword}>
              {t('accountPage.changePassword')}
            </Button>
            <Button color="error" onClick={handleLogout}>
              {t('accountPage.signOut')}
            </Button>
          </Stack>
        </FullSizeCentered>
      )}
    </>
  );
}

export default AccountPage;
