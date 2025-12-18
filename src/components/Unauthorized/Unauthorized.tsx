import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Typography } from '@mui/material';

interface UnauthorizedProps {
  message?: string;
}

const Unauthorized: FC<UnauthorizedProps> = ({ message }) => {
  const { t } = useTranslation();
  const handleLogin = () => {
    // через gateway → попадём в Keycloak
    window.location.href = '/bff/login';
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom>
        {t('unauthorized.notAuthorized')}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {message ?? t('unauthorized.message')}
      </Typography>
      <Button variant="contained" onClick={handleLogin}>
        {t('unauthorized.signIn')}
      </Button>
    </Box>
  );
};

export default Unauthorized;
