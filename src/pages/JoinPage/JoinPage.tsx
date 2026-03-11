import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';

import { fetchWithLocale } from '@/utils/fetchWithLocale';

function JoinPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const join = async () => {
      if (!token) {
        setError(t('joinPage.errors.missingToken'));
        setLoading(false);
        return;
      }

      try {
        const response = await fetchWithLocale(`/api/lists/join/${token}`, {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok || response.status === 204) {
          navigate('/'); // Redirect to lists after joining
          return;
        }

        if (response.status === 404) {
          setError(t('joinPage.errors.invalidToken'));
        } else if (response.status === 403) {
          setError(t('joinPage.errors.expiredToken'));
        } else {
          setError(t('joinPage.errors.unknownError'));
        }
      } catch (e) {
        setError((e as Error).message ?? t('joinPage.errors.unknownError'));
      } finally {
        setLoading(false);
      }
    };

    void join();
  }, [token, navigate, t]);

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      {loading ? (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">{t('joinPage.joining')}</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            {t('joinPage.backToLists')}
          </Button>
        </Box>
      ) : null}
    </Container>
  );
}

export default JoinPage;
