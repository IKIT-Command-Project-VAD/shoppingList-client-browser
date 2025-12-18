import { FC } from 'react';

import { Box, Button, Typography } from '@mui/material';

interface UnauthorizedProps {
  message?: string;
}

const Unauthorized: FC<UnauthorizedProps> = ({ message }) => {
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
        Не авторизован
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {message ?? 'Вы должны быть авторизованы, чтобы видеть содержимое страницы.'}
      </Typography>
      <Button variant="contained" onClick={handleLogin}>
        Войти
      </Button>
    </Box>
  );
};

export default Unauthorized;
