import { useTranslation } from 'react-i18next';

import ThemeIcon from '@mui/icons-material/InvertColors';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Divider, IconButton, Stack, Toolbar, Tooltip } from '@mui/material';

import { useNotifications } from '@toolpad/core/useNotifications';

import LanguageSwitch from '@/components/LanguageSwitch';
import { useSidebar } from '@/sections/Sidebar/hooks';
import { useThemeMode } from '@/theme';

function Header() {
  const { t } = useTranslation();
  const { themeMode, toggle: toggleThemeMode } = useThemeMode();
  const { open: openSidebar } = useSidebar();

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={2}
      data-pw={`theme-${themeMode}`}
      enableColorOnDark
    >
      <Toolbar>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flex={1}>
          <Stack direction="row" gap={1} alignItems="center">
            <IconButton
              size="large"
              edge="start"
              color="info"
              aria-label="menu"
              onClick={openSidebar}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
          <Stack direction="row" alignItems="center">
            <LanguageSwitch />
            <Divider orientation="vertical" flexItem />
            <Tooltip title={t('header.switchTheme')} arrow>
              <IconButton
                color="info"
                edge="end"
                size="large"
                onClick={toggleThemeMode}
                data-pw="theme-toggle"
              >
                <ThemeIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
