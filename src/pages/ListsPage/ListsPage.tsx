import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import Loading from '@/components/Loading';
import { ErrorDialog } from '@/pages/ListDetailsPage/ErrorDialog';
import { fetchWithLocale } from '@/utils/fetchWithLocale';

type ShoppingListRecord = {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
};

type ListShoppingListsResponse = ShoppingListRecord[];

type ListFormState = {
  name: string;
};

function ListsPage() {
  const { t } = useTranslation();
  const [lists, setLists] = useState<ShoppingListRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [createForm, setCreateForm] = useState<ListFormState>({ name: '' });
  const [editForm, setEditForm] = useState<ListFormState>({ name: '' });
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  const selectedList = useMemo(
    () => lists.find((l) => l.id === selectedListId) ?? null,
    [lists, selectedListId],
  );

  const loadLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithLocale('/api/lists', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok)
        throw new Error(t('listsPage.errors.loadingLists', { status: response.status }));
      const data = (await response.json()) as ListShoppingListsResponse;
      setLists(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message ?? t('listsPage.errors.unknownLists'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  const openCreate = () => {
    setCreateForm({ name: '' });
    setIsCreateOpen(true);
  };

  const openEdit = (id: string) => {
    const list = lists.find((l) => l.id === id);
    if (!list) return;
    setSelectedListId(id);
    setEditForm({ name: list.name });
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    const name = createForm.name.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithLocale('/api/lists', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok)
        throw new Error(t('listsPage.errors.creatingList', { status: response.status }));
      setIsCreateOpen(false);
      await loadLists();
    } catch (e) {
      setError((e as Error).message ?? 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedList) return;
    const name = editForm.name.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithLocale(`/api/lists/${selectedList.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedList.id, name }),
      });
      if (!response.ok)
        throw new Error(t('listsPage.errors.savingList', { status: response.status }));
      setIsEditOpen(false);
      await loadLists();
    } catch (e) {
      setError((e as Error).message ?? 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedList) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithLocale(`/api/lists/${selectedList.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok && response.status !== 204)
        throw new Error(t('listsPage.errors.deleting', { status: response.status }));
      setIsDeleteConfirmOpen(false);
      setIsEditOpen(false);
      setSelectedListId(null);
      await loadLists();
    } catch (e) {
      setError((e as Error).message ?? 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: { xs: 2, md: 3 }, px: { xs: 1, md: 3 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={{ xs: 1.5, md: 2 }}
        gap={1}
      >
        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            flex: { xs: '1 1 auto', md: '0 0 auto' },
            minWidth: 0,
          }}
        >
          {t('listsPage.title')}
        </Typography>
        {isDesktop ? (
          <Stack direction="row" gap={1} alignItems="center">
            <Tooltip title={t('listsPage.refresh')}>
              <span>
                <IconButton onClick={loadLists} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={openCreate}
              disabled={loading}
            >
              {t('listsPage.createList')}
            </Button>
          </Stack>
        ) : (
          <Tooltip title={t('listsPage.refresh')}>
            <span>
              <IconButton onClick={loadLists} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>

      {loading && <Loading />}

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {lists.map((list) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={list.id}>
            <Card sx={{ height: '100%' }}>
              <Box position="relative">
                <CardActionArea onClick={() => navigate(`/lists/${list.id}`)}>
                  <CardContent sx={{ pb: { xs: '36px !important', sm: '16px !important' } }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      noWrap
                      title={list.name}
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      {list.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('listsPage.updated')}: {new Date(list.updatedAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <Tooltip title={t('listsPage.edit')}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(list.id);
                    }}
                    sx={{
                      position: 'absolute',
                      top: { xs: 4, sm: 8 },
                      right: { xs: 4, sm: 8 },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {lists.length === 0 && !loading && (
        <Typography color="text.secondary" mt={2}>
          {t('listsPage.noLists')}
        </Typography>
      )}

      {!isDesktop && (
        <Fab
          color="primary"
          aria-label="add list"
          onClick={openCreate}
          sx={{ position: 'fixed', bottom: theme.spacing(3), right: theme.spacing(3) }}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('listsPage.createDialogTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('listsPage.name')}
            fullWidth
            required
            value={createForm.name}
            onChange={(e) => setCreateForm({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>{t('listsPage.cancel')}</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>
            {t('listsPage.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('listsPage.editDialogTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('listsPage.name')}
            fullWidth
            required
            value={editForm.name}
            onChange={(e) => setEditForm({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            {t('listsPage.delete')}
          </Button>
          <Box>
            <Button onClick={() => setIsEditOpen(false)} sx={{ mr: 1 }}>
              {t('listsPage.back')}
            </Button>
            <Button variant="contained" onClick={handleEdit} disabled={loading}>
              {t('listsPage.save')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
        <DialogTitle>{t('listsPage.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('listsPage.confirmDeleteText')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteConfirmOpen(false)}>{t('listsPage.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={loading}>
            {t('listsPage.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <ErrorDialog
        error={error}
        onClose={() => setError(null)}
        title={t('listsPage.errorDialogTitle')}
      />
    </Container>
  );
}

export default ListsPage;
