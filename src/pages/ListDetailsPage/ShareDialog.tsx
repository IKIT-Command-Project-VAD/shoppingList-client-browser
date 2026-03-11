import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { fetchWithLocale } from '@/utils/fetchWithLocale';

import { ShoppingListRecord } from './ListDetailsPage';

type ShareDialogProps = {
  open: boolean;
  onClose: () => void;
  list: ShoppingListRecord;
  onUpdate: () => void;
};

export function ShareDialog({ open, onClose, list, onUpdate }: ShareDialogProps) {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<number>(0); // 0 = Read, 1 = Write
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCreateShareLink = async () => {
    setLoading(true);
    try {
      const response = await fetchWithLocale(`/api/lists/${list.id}/share-links`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: list.id,
          permissionType: permission,
          expiresAt: expiresAt || null,
          createdBy: list.ownerId, // Just a placeholder, backend should handle it
        }),
      });

      if (!response.ok) {
        throw new Error(t('listDetailsPage.errors.creatingShareLink', { status: response.status }));
      }

      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/join/${token}`;
    void navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('listDetailsPage.share')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              {t('listDetailsPage.members')}
            </Typography>
            <List dense>
              {!list.members.some((m) => m.userId === list.ownerId) && (
                <ListItem>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary={`${list.ownerId} (Owner)`}
                    secondary={t('listDetailsPage.readWrite')}
                  />
                </ListItem>
              )}
              {list.members.map((member) => (
                <ListItem key={member.id}>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary={member.userId === list.ownerId ? `${member.userId} (Owner)` : member.userId}
                    secondary={member.permissionType === 1 ? t('listDetailsPage.readWrite') : t('listDetailsPage.readOnly')}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              {t('listDetailsPage.shareLinks')}
            </Typography>
            {list.shareLinks.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('listDetailsPage.noShareLinks')}
              </Typography>
            ) : (
              <List dense>
                {list.shareLinks.map((link) => (
                  <ListItem key={link.id}>
                    <ListItemText
                      primary={link.permissionType === 1 ? t('listDetailsPage.readWrite') : t('listDetailsPage.readOnly')}
                      secondary={link.expiresAt ? `${t('listDetailsPage.expiresAt')}: ${new Date(link.expiresAt).toLocaleString()}` : ''}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title={copied === link.shareToken ? t('listDetailsPage.linkCopied') : t('listDetailsPage.copyLink')}>
                        <IconButton edge="end" onClick={() => copyToClipboard(link.shareToken)}>
                          <ContentCopyIcon fontSize="small" color={copied === link.shareToken ? 'success' : 'inherit'} />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              {t('listDetailsPage.createShareLink')}
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('listDetailsPage.permission')}</InputLabel>
                <Select
                  value={permission}
                  label={t('listDetailsPage.permission')}
                  onChange={(e) => setPermission(Number(e.target.value))}
                >
                  <MenuItem value={0}>{t('listDetailsPage.readOnly')}</MenuItem>
                  <MenuItem value={1}>{t('listDetailsPage.readWrite')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('listDetailsPage.expiresAt')}
                type="datetime-local"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={handleCreateShareLink}
                disabled={loading}
              >
                {t('listDetailsPage.createShareLink')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('listDetailsPage.done')}</Button>
      </DialogActions>
    </Dialog>
  );
}
