import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Menu, MenuItem } from '@mui/material';

function LanguageSwitch() {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentLanguage = i18n.language;
  const isEnglish = currentLanguage.startsWith('en');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    handleClose();
  };

  return (
    <>
      <Button
        size="small"
        color="info"
        onClick={handleClick}
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {isEnglish ? t('language.en') : t('language.ru')}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 2,
        }}
      >
        <MenuItem selected={isEnglish} onClick={() => changeLanguage('en')}>
          {t('language.english')}
        </MenuItem>
        <MenuItem selected={!isEnglish} onClick={() => changeLanguage('ru')}>
          {t('language.russian')}
        </MenuItem>
      </Menu>
    </>
  );
}

export default LanguageSwitch;
