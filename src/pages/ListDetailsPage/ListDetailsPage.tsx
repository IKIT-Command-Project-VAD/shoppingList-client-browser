import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewListIcon from '@mui/icons-material/ViewList';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import Loading from '@/components/Loading';
import { fetchWithLocale } from '@/utils/fetchWithLocale';

import { ErrorDialog } from './ErrorDialog';

type ListItemRecord = {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string | null;
  categoryId: string | null;
  category?: CategoryRecord | null;
  price: number | null;
  currency: string | null;
  isChecked: boolean;
  updatedAt: string;
  createdAt: string;
};

type ShoppingListRecord = {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  items: ListItemRecord[];
};

type CategoryRecord = {
  id: string;
  name: string;
  icon?: string | null;
};

type ItemFormState = {
  name: string;
  quantity: string;
  unit: string;
  categoryId: string;
  price: string;
  currency: string;
  isChecked: boolean;
};

type ListFormState = {
  name: string;
};

function ListDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Функция для перевода имени категории
  const getCategoryName = useCallback(
    (categoryName: string | null | undefined): string => {
      if (!categoryName) return '';
      const translationKey = `categories.${categoryName}`;
      const translated = t(translationKey, { defaultValue: categoryName });
      // Если перевод не найден (вернулся ключ), возвращаем оригинальное имя
      return translated === translationKey ? categoryName : translated;
    },
    [t],
  );

  const [list, setList] = useState<ShoppingListRecord | null>(null);
  const [items, setItems] = useState<ListItemRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [toggleInFlightId, setToggleInFlightId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isItemDeleteOpen, setIsItemDeleteOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isGrouped, setIsGrouped] = useState(false);
  const [itemForm, setItemForm] = useState<ItemFormState>({
    name: '',
    quantity: '1',
    unit: '',
    categoryId: '',
    price: '',
    currency: 'RUB',
    isChecked: false,
  });

  const [isListEditOpen, setIsListEditOpen] = useState(false);
  const [isListDeleteOpen, setIsListDeleteOpen] = useState(false);
  const [listForm, setListForm] = useState<ListFormState>({ name: '' });

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );

  const filteredItems = useMemo(() => {
    const base = (() => {
      if (filterCategory === 'all') return items;
      if (filterCategory === '') return items.filter((i) => !i.categoryId);
      return items.filter((i) => i.categoryId === filterCategory);
    })();

    return [...base].sort((a, b) => {
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? 1 : -1;
      }
      return a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' });
    });
  }, [items, filterCategory]);

  const groupedItems = useMemo(() => {
    if (!isGrouped) return { all: filteredItems };

    const groups: Record<string, ListItemRecord[]> = {};
    filteredItems.forEach((item) => {
      const catId = item.categoryId ?? '';
      if (!groups[catId]) groups[catId] = [];
      groups[catId].push(item);
    });

    return groups;
  }, [filteredItems, isGrouped]);

  const loadList = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithLocale(`/api/lists/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok)
        throw new Error(t('listDetailsPage.errors.loadingList', { status: response.status }));
      const data = (await response.json()) as ShoppingListRecord;
      setList(data);
      setItems(data.items ?? []);
    } catch (e) {
      setError((e as Error).message ?? t('listDetailsPage.errors.unknown'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const toggleItemChecked = useCallback(
    async (item: ListItemRecord, nextChecked: boolean) => {
      setToggleInFlightId(item.id);
      // оптимистичное обновление UI
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, isChecked: nextChecked, updatedAt: new Date().toISOString() }
            : i,
        ),
      );

      const payload = {
        listId: item.listId,
        itemId: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        categoryId: item.categoryId,
        price: item.price,
        currency: item.currency,
        isChecked: nextChecked,
      };

      try {
        const response = await fetchWithLocale(`/api/lists/${item.listId}/items/${item.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`Ошибка сохранения элемента: ${response.status}`);
        }
        await loadList();
      } catch (e) {
        setError((e as Error).message ?? 'Неизвестная ошибка');
        // откат оптимистичного изменения
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isChecked: item.isChecked } : i)),
        );
      } finally {
        setToggleInFlightId(null);
      }
    },
    [loadList],
  );

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await fetchWithLocale('/api/categories', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok)
        throw new Error(t('listDetailsPage.errors.loadingCategories', { status: response.status }));
      const data = (await response.json()) as CategoryRecord[];
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message ?? t('listDetailsPage.errors.unknownCategories'));
    } finally {
      setLoadingCategories(false);
    }
  }, [t]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      setCategories((prev) =>
        [...prev].sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' })),
      );
    }
  }, [categories.length]);

  const openAddDialog = () => {
    setItemForm({
      name: '',
      quantity: '1',
      unit: '',
      categoryId: '',
      price: '',
      currency: 'RUB',
      isChecked: false,
    });
    setIsAddOpen(true);
  };

  const openEditDialog = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    setSelectedItemId(itemId);
    setItemForm({
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit ?? '',
      categoryId: item.categoryId ?? '',
      price: item.price != null ? String(item.price) : '',
      currency: item.currency ?? 'RUB',
      isChecked: item.isChecked,
    });
    setIsEditOpen(true);
  };

  const submitCreateItem = async () => {
    if (!id) return;
    const payload = {
      listId: id,
      name: itemForm.name.trim(),
      quantity: Number(itemForm.quantity) || 0,
      unit: itemForm.unit || null,
      categoryId: itemForm.categoryId || null,
      price: itemForm.price ? Number(itemForm.price) : null,
      currency: itemForm.currency || null,
      isChecked: itemForm.isChecked,
    };
    if (!payload.name) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithLocale(`/api/lists/${id}/items`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(t('listDetailsPage.errors.creatingItem', { status: response.status }));
      setIsAddOpen(false);
      await loadList();
    } catch (e) {
      setError((e as Error).message ?? t('listDetailsPage.errors.unknown'));
    } finally {
      setLoading(false);
    }
  };

  const submitUpdateItem = async () => {
    if (!id || !selectedItem) return;
    const payload = {
      listId: id,
      itemId: selectedItem.id,
      name: itemForm.name.trim(),
      quantity: Number(itemForm.quantity) || 0,
      unit: itemForm.unit || null,
      categoryId: itemForm.categoryId || null,
      price: itemForm.price ? Number(itemForm.price) : null,
      currency: itemForm.currency || null,
      isChecked: itemForm.isChecked,
    };
    if (!payload.name) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithLocale(`/api/lists/${id}/items/${selectedItem.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(t('listDetailsPage.errors.savingItem', { status: response.status }));
      setIsEditOpen(false);
      await loadList();
    } catch (e) {
      setError((e as Error).message ?? t('listDetailsPage.errors.unknown'));
    } finally {
      setLoading(false);
    }
  };

  const submitDeleteItem = async () => {
    if (!id || !selectedItem) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithLocale(`/api/lists/${id}/items/${selectedItem.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok && response.status !== 204)
        throw new Error(t('listDetailsPage.errors.deletingItem', { status: response.status }));
      setIsItemDeleteOpen(false);
      setIsEditOpen(false);
      setSelectedItemId(null);
      await loadList();
    } catch (e) {
      setError((e as Error).message ?? t('listDetailsPage.errors.unknown'));
    } finally {
      setLoading(false);
    }
  };

  const openListEdit = () => {
    if (!list) return;
    setListForm({ name: list.name });
    setIsListEditOpen(true);
  };

  const submitListUpdate = async () => {
    if (!list) return;
    const name = listForm.name.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithLocale(`/api/lists/${list.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: list.id, name }),
      });
      if (!response.ok)
        throw new Error(t('listDetailsPage.errors.savingList', { status: response.status }));
      setIsListEditOpen(false);
      await loadList();
    } catch (e) {
      setError((e as Error).message ?? t('listDetailsPage.errors.unknown'));
    } finally {
      setLoading(false);
    }
  };

  const submitListDelete = async () => {
    if (!list) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithLocale(`/api/lists/${list.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok && response.status !== 204)
        throw new Error(t('listDetailsPage.errors.deletingList', { status: response.status }));
      setIsListDeleteOpen(false);
      navigate('/');
    } catch (e) {
      setError((e as Error).message ?? t('listDetailsPage.errors.unknown'));
    } finally {
      setLoading(false);
    }
  };

  const renderItemRight = (item: ListItemRecord) => {
    const total =
      item.price != null && !Number.isNaN(item.price) ? item.price * item.quantity : null;
    const unit = item.unit ? ` ${item.unit}` : '';
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Stack alignItems="flex-end" textAlign="right">
          <Typography
            variant="body1"
            sx={{
              color: item.isChecked ? 'text.secondary' : 'text.primary',
              textDecoration: item.isChecked ? 'line-through' : 'none',
            }}
          >
            {item.quantity}
            {unit}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: item.isChecked ? 'line-through' : 'none' }}
          >
            {total != null ? `${total} ${item.currency ?? '₽'}` : '—'}
          </Typography>
        </Stack>
        <Checkbox
          checked={item.isChecked}
          size="medium"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            if (toggleInFlightId === item.id) return;
            void toggleItemChecked(item, e.target.checked);
          }}
          disabled={toggleInFlightId === item.id}
        />
      </Stack>
    );
  };

  return (
    <Container sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} gap={1}>
        <Stack direction="row" alignItems="center" gap={1}>
          <IconButton onClick={() => navigate('/')} edge="start" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">{list?.name ?? t('listDetailsPage.title')}</Typography>
        </Stack>
        <Stack direction="row" gap={1} alignItems="center">
          <Tooltip title={t('listDetailsPage.refresh')}>
            <span>
              <IconButton onClick={loadList} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('listDetailsPage.editList')}>
            <span>
              <IconButton onClick={openListEdit} disabled={loading || !list}>
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          {isDesktop && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={openAddDialog}
              disabled={loading}
            >
              {t('listDetailsPage.addItem')}
            </Button>
          )}
        </Stack>
      </Stack>

      {loading && <Loading />}

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <Stack direction="row" spacing={2} alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="filter-category-label">
            {t('listDetailsPage.filterByCategory')}
          </InputLabel>
          <Select
            labelId="filter-category-label"
            label={t('listDetailsPage.filterByCategory')}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            <MenuItem value="all">{t('listDetailsPage.allCategories')}</MenuItem>
            <MenuItem value="">{t('listDetailsPage.withoutCategory')}</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {getCategoryName(c.name)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={isGrouped}
              onChange={(e) => setIsGrouped(e.target.checked)}
              size="small"
            />
          }
          label={
            <Stack direction="row" alignItems="center" gap={0.5}>
              {isGrouped ? <GridViewIcon fontSize="small" /> : <ViewListIcon fontSize="small" />}
              <Typography variant="body2">{t('listDetailsPage.groupByCategory')}</Typography>
            </Stack>
          }
        />
      </Stack>

      <List>
        {Object.entries(groupedItems).map(([catId, groupItems]) => {
          const category = categories.find((c) => c.id === catId);
          const categoryName = category
            ? getCategoryName(category.name)
            : catId === ''
              ? t('listDetailsPage.withoutCategory')
              : '';

          return (
            <Box key={catId}>
              {isGrouped && categoryName && (
                <ListSubheader sx={{ bgcolor: 'background.default', fontWeight: 'bold' }}>
                  {categoryName} ({groupItems.length})
                </ListSubheader>
              )}
              {groupItems.map((item) => (
                <ListItem
                  key={item.id}
                  divider
                  secondaryAction={renderItemRight(item)}
                  onClick={() => openEditDialog(item.id)}
                  sx={{
                    cursor: 'pointer',
                    opacity: item.isChecked ? 0.6 : 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: item.isChecked ? 'text.secondary' : 'text.primary',
                          textDecoration: item.isChecked ? 'line-through' : 'none',
                        }}
                      >
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: item.isChecked ? 'line-through' : 'none' }}
                        >
                          {t('listDetailsPage.updated')}:{' '}
                          {new Date(item.updatedAt).toLocaleString()}
                        </Typography>
                        {item.category && !isGrouped && (
                          <Typography
                            variant="caption"
                            sx={{
                              bgcolor: 'action.selected',
                              px: 1,
                              borderRadius: 1,
                              color: 'text.secondary',
                              opacity: item.isChecked ? 0.7 : 1,
                            }}
                          >
                            {getCategoryName(item.category.name)}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </Box>
          );
        })}
        {items.length === 0 && !loading && (
          <Typography color="text.secondary" mt={2}>
            {t('listDetailsPage.noItems')}
          </Typography>
        )}
        {items.length > 0 && filteredItems.length === 0 && (
          <Typography color="text.secondary" mt={2}>
            {t('listDetailsPage.noItemsMatchingFilter')}
          </Typography>
        )}
      </List>

      {!isDesktop && (
        <Fab
          color="primary"
          aria-label="add item"
          onClick={openAddDialog}
          sx={{ position: 'fixed', bottom: theme.spacing(3), right: theme.spacing(3) }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Диалог создания элемента */}
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('listDetailsPage.newItem')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              autoFocus
              label={t('listDetailsPage.name')}
              required
              value={itemForm.name}
              onChange={(e) => setItemForm((s) => ({ ...s, name: e.target.value }))}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label={t('listDetailsPage.quantity')}
                type="number"
                value={itemForm.quantity}
                onChange={(e) => setItemForm((s) => ({ ...s, quantity: e.target.value }))}
                fullWidth
              />
              <TextField
                label={t('listDetailsPage.units')}
                value={itemForm.unit}
                onChange={(e) => setItemForm((s) => ({ ...s, unit: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label={t('listDetailsPage.pricePerUnit')}
                type="number"
                value={itemForm.price}
                onChange={(e) => setItemForm((s) => ({ ...s, price: e.target.value }))}
                fullWidth
              />
              <TextField
                label={t('listDetailsPage.currency')}
                value={itemForm.currency}
                onChange={(e) => setItemForm((s) => ({ ...s, currency: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl fullWidth>
                <InputLabel id="create-category-label">{t('listDetailsPage.category')}</InputLabel>
                <Select
                  labelId="create-category-label"
                  label={t('listDetailsPage.category')}
                  value={itemForm.categoryId}
                  onChange={(e) =>
                    setItemForm((s) => ({ ...s, categoryId: (e.target.value as string) ?? '' }))
                  }
                >
                  <MenuItem value="">{t('listDetailsPage.withoutCategory')}</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {getCategoryName(c.name)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title={t('listDetailsPage.refreshCategories')}>
                <span>
                  <IconButton onClick={loadCategories} disabled={loadingCategories}>
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={itemForm.isChecked}
                  onChange={(e) => setItemForm((s) => ({ ...s, isChecked: e.target.checked }))}
                />
              }
              label={t('listDetailsPage.checked')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddOpen(false)}>{t('listDetailsPage.cancel')}</Button>
          <Button variant="contained" onClick={submitCreateItem} disabled={loading}>
            {t('listDetailsPage.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования элемента */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('listDetailsPage.editDialogTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              autoFocus
              label={t('listDetailsPage.name')}
              required
              value={itemForm.name}
              onChange={(e) => setItemForm((s) => ({ ...s, name: e.target.value }))}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label={t('listDetailsPage.quantity')}
                type="number"
                value={itemForm.quantity}
                onChange={(e) => setItemForm((s) => ({ ...s, quantity: e.target.value }))}
                fullWidth
              />
              <TextField
                label={t('listDetailsPage.units')}
                value={itemForm.unit}
                onChange={(e) => setItemForm((s) => ({ ...s, unit: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label={t('listDetailsPage.pricePerUnit')}
                type="number"
                value={itemForm.price}
                onChange={(e) => setItemForm((s) => ({ ...s, price: e.target.value }))}
                fullWidth
              />
              <TextField
                label={t('listDetailsPage.currency')}
                value={itemForm.currency}
                onChange={(e) => setItemForm((s) => ({ ...s, currency: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl fullWidth>
                <InputLabel id="edit-category-label">{t('listDetailsPage.category')}</InputLabel>
                <Select
                  labelId="edit-category-label"
                  label={t('listDetailsPage.category')}
                  value={itemForm.categoryId}
                  onChange={(e) =>
                    setItemForm((s) => ({ ...s, categoryId: (e.target.value as string) ?? '' }))
                  }
                >
                  <MenuItem value="">{t('listDetailsPage.withoutCategory')}</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {getCategoryName(c.name)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title={t('listDetailsPage.refreshCategories')}>
                <span>
                  <IconButton onClick={loadCategories} disabled={loadingCategories}>
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={itemForm.isChecked}
                  onChange={(e) => setItemForm((s) => ({ ...s, isChecked: e.target.checked }))}
                />
              }
              label={t('listDetailsPage.checked')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setIsItemDeleteOpen(true)}
          >
            {t('listDetailsPage.delete')}
          </Button>
          <Box>
            <Button onClick={() => setIsEditOpen(false)} sx={{ mr: 1 }}>
              {t('listDetailsPage.back')}
            </Button>
            <Button variant="contained" onClick={submitUpdateItem} disabled={loading}>
              {t('listDetailsPage.save')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Подтверждение удаления элемента */}
      <Dialog open={isItemDeleteOpen} onClose={() => setIsItemDeleteOpen(false)}>
        <DialogTitle>{t('listDetailsPage.confirmDeleteItem')}</DialogTitle>
        <DialogContent>
          <Typography>{t('listDetailsPage.confirmDeleteItemText')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsItemDeleteOpen(false)}>{t('listDetailsPage.cancel')}</Button>
          <Button color="error" variant="contained" onClick={submitDeleteItem} disabled={loading}>
            {t('listDetailsPage.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования списка */}
      <Dialog
        open={isListEditOpen}
        onClose={() => setIsListEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('listsPage.editDialogTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('listsPage.name')}
            fullWidth
            required
            value={listForm.name}
            onChange={(e) => setListForm({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setIsListDeleteOpen(true)}
          >
            {t('listsPage.delete')}
          </Button>
          <Box>
            <Button onClick={() => setIsListEditOpen(false)} sx={{ mr: 1 }}>
              {t('listsPage.back')}
            </Button>
            <Button variant="contained" onClick={submitListUpdate} disabled={loading}>
              {t('listsPage.save')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Подтверждение удаления списка */}
      <Dialog open={isListDeleteOpen} onClose={() => setIsListDeleteOpen(false)}>
        <DialogTitle>{t('listsPage.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('listDetailsPage.confirmDeleteListText')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsListDeleteOpen(false)}>{t('listsPage.cancel')}</Button>
          <Button color="error" variant="contained" onClick={submitListDelete} disabled={loading}>
            {t('listsPage.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <ErrorDialog error={error} onClose={() => setError(null)} title={t('common.error')} />
    </Container>
  );
}

export default ListDetailsPage;
