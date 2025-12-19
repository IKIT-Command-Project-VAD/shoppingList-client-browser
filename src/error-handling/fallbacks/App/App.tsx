import { useTranslation } from 'react-i18next';

import EmailIcon from '@mui/icons-material/Email';
import RestartIcon from '@mui/icons-material/RestartAlt';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { FullSizeCentered } from '@/components/styled';
import { email } from '@/config';
import resetApp from '@/utils/reset-app';

function AppErrorBoundaryFallback() {
  const { t } = useTranslation();

  return (
    <Box height={400}>
      <FullSizeCentered>
        <Paper sx={{ p: 5 }}>
          <Typography variant="h5" component="h3">
            {t('error.fallback.title')}
          </Typography>
          <Button
            startIcon={<EmailIcon />}
            variant="outlined"
            target="_blank"
            rel="noreferrer"
            href={`mailto: ${email}`}
            sx={{ my: 3 }}
          >
            {t('error.fallback.contact', { email })}
          </Button>
          <Typography component="h6">{t('error.fallback.or')}</Typography>
          <Button startIcon={<RestartIcon />} sx={{ mt: 3 }} variant="outlined" onClick={resetApp}>
            {t('error.fallback.reset')}
          </Button>
        </Paper>
      </FullSizeCentered>
    </Box>
  );
}

export default AppErrorBoundaryFallback;
