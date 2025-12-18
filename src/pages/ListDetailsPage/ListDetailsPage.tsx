import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
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
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import Loading from '@/components/Loading';

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
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

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

  const loadList = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/lists/${id}`, { method: 'GET', credentials: 'include' });
      if (!response.ok) throw new Error(`Ошибка загрузки списка: ${response.status}`);
      const data = (await response.json()) as ShoppingListRecord;
      setList(data);
      setItems(data.items ?? []);
    } catch (e) {
      setError((e as Error).message ?? 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [id]);

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
        const response = await fetch(`/api/lists/${item.listId}/items/${item.id}`, {
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
      const response = await fetch('/api/categories', { method: 'GET', credentials: 'include' });
      if (!response.ok) throw new Error(`Ошибка загрузки категорий: ${response.status}`);
      const data = (await response.json()) as CategoryRecord[];
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message ?? 'Неизвестная ошибка категорий');
    } finally {
      setLoadingCategories(false);
    }
  }, []);

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
      const response = await fetch(`/api/lists/${id}/items`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Ошибка создания элемента: ${response.status}`);
      setIsAddOpen(false);
      await loadList();
    } catch (e) {
      setError((e as Error).message ?? 'Неизвестная ошибка');
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
      const response = await fetch(`/api/lists/${id}/items/${selectedItem.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Ошибка сохранения элемента: ${response.status}`);
      setIsEditOpen(false);
      await loadList();
    } catch (e) {
      setError((e as Error).message ?? 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const submitDeleteItem = async () => {
    if (!id || !selectedItem) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/lists/${id}/items/${selectedItem.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok && response.status !== 204)
        throw new Error(`Ошибка удаления элемента: ${response.status}`);
      setIsItemDeleteOpen(false);
      setIsEditOpen(false);
      setSelectedItemId(null);
      await loadList();
    } catch (e) {
      setError((e as Error).message ?? 'Неизвестная ошибка');
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
      const response = await fetch(`/api/lists/${list.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: list.id, name }),
      });
      if (!response.ok) throw new Error(`Ошибка сохранения списка: ${response.status}`);
      setIsListEditOpen(false);
      await loadList();
    } catch (e) {
      setError((e as Error).message ?? 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const submitListDelete = async () => {
    if (!list) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/lists/${list.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok && response.status !== 204)
        throw new Error(`Ошибка удаления списка: ${response.status}`);
      setIsListDeleteOpen(false);
      navigate('/lists');
    } catch (e) {
      setError((e as Error).message ?? 'Неизвестная ошибка');
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
          <Typography variant="body1">
            {item.quantity}
            {unit}
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
          <Typography variant="h5">{list?.name ?? 'Список'}</Typography>
        </Stack>
        <Stack direction="row" gap={1} alignItems="center">
          <Tooltip title="Обновить">
            <span>
              <IconButton onClick={loadList} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Редактировать список">
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
              Добавить элемент
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

      <List>
        {items.map((item) => (
          <ListItem
            key={item.id}
            divider
            secondaryAction={renderItemRight(item)}
            onClick={() => openEditDialog(item.id)}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemText
              primary={<Typography variant="subtitle1">{item.name}</Typography>}
              secondary={
                <Typography variant="body2" color="text.secondary">
                  Обновлён: {new Date(item.updatedAt).toLocaleString()}
                </Typography>
              }
            />
          </ListItem>
        ))}
        {items.length === 0 && !loading && (
          <Typography color="text.secondary" mt={2}>
            Нет элементов. Добавьте первый.
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
        <DialogTitle>Новый элемент</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              autoFocus
              label="Название"
              required
              value={itemForm.name}
              onChange={(e) => setItemForm((s) => ({ ...s, name: e.target.value }))}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Количество"
                type="number"
                value={itemForm.quantity}
                onChange={(e) => setItemForm((s) => ({ ...s, quantity: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Ед. изм. (шт/гр/кг)"
                value={itemForm.unit}
                onChange={(e) => setItemForm((s) => ({ ...s, unit: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Цена за единицу"
                type="number"
                value={itemForm.price}
                onChange={(e) => setItemForm((s) => ({ ...s, price: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Валюта"
                value={itemForm.currency}
                onChange={(e) => setItemForm((s) => ({ ...s, currency: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl fullWidth>
                <InputLabel id="create-category-label">Категория</InputLabel>
                <Select
                  labelId="create-category-label"
                  label="Категория"
                  value={itemForm.categoryId}
                  onChange={(e) =>
                    setItemForm((s) => ({ ...s, categoryId: (e.target.value as string) ?? '' }))
                  }
                >
                  <MenuItem value="">Без категории</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Обновить категории">
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
              label="Отмечено"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={submitCreateItem} disabled={loading}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования элемента */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Редактировать элемент</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              autoFocus
              label="Название"
              required
              value={itemForm.name}
              onChange={(e) => setItemForm((s) => ({ ...s, name: e.target.value }))}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Количество"
                type="number"
                value={itemForm.quantity}
                onChange={(e) => setItemForm((s) => ({ ...s, quantity: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Ед. изм. (шт/гр/кг)"
                value={itemForm.unit}
                onChange={(e) => setItemForm((s) => ({ ...s, unit: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Цена за единицу"
                type="number"
                value={itemForm.price}
                onChange={(e) => setItemForm((s) => ({ ...s, price: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Валюта"
                value={itemForm.currency}
                onChange={(e) => setItemForm((s) => ({ ...s, currency: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl fullWidth>
                <InputLabel id="edit-category-label">Категория</InputLabel>
                <Select
                  labelId="edit-category-label"
                  label="Категория"
                  value={itemForm.categoryId}
                  onChange={(e) =>
                    setItemForm((s) => ({ ...s, categoryId: (e.target.value as string) ?? '' }))
                  }
                >
                  <MenuItem value="">Без категории</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Обновить категории">
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
              label="Отмечено"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setIsItemDeleteOpen(true)}
          >
            Удалить
          </Button>
          <Box>
            <Button onClick={() => setIsEditOpen(false)} sx={{ mr: 1 }}>
              Назад
            </Button>
            <Button variant="contained" onClick={submitUpdateItem} disabled={loading}>
              Сохранить
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Подтверждение удаления элемента */}
      <Dialog open={isItemDeleteOpen} onClose={() => setIsItemDeleteOpen(false)}>
        <DialogTitle>Удалить элемент?</DialogTitle>
        <DialogContent>
          <Typography>Действие нельзя отменить. Продолжить?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsItemDeleteOpen(false)}>Отмена</Button>
          <Button color="error" variant="contained" onClick={submitDeleteItem} disabled={loading}>
            Удалить
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
        <DialogTitle>Редактировать список</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
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
            Удалить
          </Button>
          <Box>
            <Button onClick={() => setIsListEditOpen(false)} sx={{ mr: 1 }}>
              Назад
            </Button>
            <Button variant="contained" onClick={submitListUpdate} disabled={loading}>
              Сохранить
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Подтверждение удаления списка */}
      <Dialog open={isListDeleteOpen} onClose={() => setIsListDeleteOpen(false)}>
        <DialogTitle>Удалить список?</DialogTitle>
        <DialogContent>
          <Typography>Список и все элементы будут удалены. Продолжить?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsListDeleteOpen(false)}>Отмена</Button>
          <Button color="error" variant="contained" onClick={submitListDelete} disabled={loading}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ListDetailsPage;
