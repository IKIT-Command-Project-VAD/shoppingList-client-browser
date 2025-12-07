import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

type IncomeTransactionRecord = {
  id: string;
  name: string;
  amount: number;
  operationDate: string; // "YYYY-MM-DD"
  isMonthly: boolean;
  type: string; // "Income"
};

type ListIncomeTransactionsByUserIdResponse = {
  transactions: IncomeTransactionRecord[];
};

type AddIncomeFormState = {
  name: string;
  amount: string;
  operationDate: string;
  isMonthly: boolean;
};

type EditIncomeFormState = {
  name: string;
  amount: string;
  operationDate: string;
  isMonthly: boolean;
};

function TransactionsPage() {
  const [transactions, setTransactions] = useState<IncomeTransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // 🔹

  const [addForm, setAddForm] = useState<AddIncomeFormState>({
    name: '',
    amount: '',
    operationDate: '',
    isMonthly: false,
  });

  const [editForm, setEditForm] = useState<EditIncomeFormState>({
    name: '',
    amount: '',
    operationDate: '',
    isMonthly: false,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTransaction = useMemo(
    () => transactions.find((t) => t.id === selectedId) ?? null,
    [transactions, selectedId],
  );

  const loadIncomes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/finance/transactions/income', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Loading error: ${response.status}`);
      }

      const data = (await response.json()) as ListIncomeTransactionsByUserIdResponse;

      if (!data || !Array.isArray(data.transactions)) {
        throw new Error('Invalid server response');
      }

      setTransactions(data.transactions);
    } catch (e) {
      const err = e as Error;
      setError(err.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIncomes();
  }, [loadIncomes]);

  const handleOpenAddDialog = () => {
    setAddForm({
      name: '',
      amount: '',
      operationDate: '',
      isMonthly: false,
    });
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleOpenEditDialog = () => {
    if (!selectedTransaction) return;

    setEditForm({
      name: selectedTransaction.name,
      amount: selectedTransaction.amount.toString(),
      operationDate: selectedTransaction.operationDate,
      isMonthly: selectedTransaction.isMonthly,
    });

    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleOpenDeleteConfirm = () => {
    if (!selectedTransaction) return;
    setIsDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  const parseAmount = (raw: string): number => {
    const value = Number(raw.replace(',', '.'));
    return value;
  };

  const validateAmount = (raw: string): number | null => {
    const value = parseAmount(raw);
    if (Number.isNaN(value) || value < 0.01) {
      return null;
    }
    return value;
  };

  const handleAddIncome = async () => {
    if (!addForm.name.trim()) {
      alert('Name is required');
      return;
    }

    const amount = validateAmount(addForm.amount);
    if (amount === null) {
      alert('Incorrect amount. Must be at least 0.01');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(addForm.operationDate)) {
      alert('Date must be format YYYY-MM-DD');
      return;
    }

    try {
      const response = await fetch('/api/finance/transactions/income', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addForm.name.trim(),
          amount, // отправляем число, не строку
          operationDate: addForm.operationDate,
          isMonthly: addForm.isMonthly,
        }),
      });

      if (!response.ok) {
        throw new Error(`Create error: ${response.status}`);
      }

      await loadIncomes();
      setIsAddDialogOpen(false);
    } catch (e) {
      const err = e as Error;
      alert(err.message ?? 'Error when creating income');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTransaction) return;

    if (!editForm.name.trim()) {
      alert('Name is required');
      return;
    }

    const amount = validateAmount(editForm.amount);
    if (amount === null) {
      alert('Incorrect amount. Must be at least 0.01');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(editForm.operationDate)) {
      alert('Date must be format YYYY-MM-DD');
      return;
    }

    try {
      const response = await fetch(
        `/api/finance/transactions/income/${encodeURIComponent(selectedTransaction.id)}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editForm.name.trim(),
            amount,
            operationDate: editForm.operationDate,
            isMonthly: editForm.isMonthly,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Update error: ${response.status}`);
      }

      await loadIncomes();
      setIsEditDialogOpen(false);
    } catch (e) {
      const err = e as Error;
      alert(err.message ?? 'Error when updating income');
    }
  };

  const handleConfirmDelete = async () => {
    // 🔹
    if (!selectedTransaction) return;

    try {
      const response = await fetch(
        `/api/finance/transactions/income/${encodeURIComponent(selectedTransaction.id)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (response.status !== 204 && !response.ok) {
        throw new Error(`Delete error: ${response.status}`);
      }

      setIsDeleteConfirmOpen(false);
      setIsEditDialogOpen(false);
      setSelectedId(null);
      await loadIncomes();
    } catch (e) {
      const err = e as Error;
      alert(err.message ?? 'Error when deleting income');
    }
  };

  const handleSelectTransaction = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const formatOperationDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}.${month}.${year}`;
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h3" gutterBottom>
        Incomes
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" onClick={handleOpenAddDialog}>
          Add income
        </Button>
        <Button variant="outlined" onClick={() => void loadIncomes()}>
          Refresh incomes
        </Button>
        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        )}
      </Stack>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      {/* Лента доходов */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          maxHeight: 360,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {transactions.length === 0 && !loading && (
          <Typography variant="body2" color="text.secondary">
            No incomes yet. Press &quot;Add income&quot; to create the first one.
          </Typography>
        )}

        {transactions.map((tx) => {
          const isSelected = tx.id === selectedId;
          return (
            <Card
              key={tx.id}
              variant={isSelected ? 'elevation' : 'outlined'}
              sx={{
                transition: 'all 0.15s ease',
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'action.hover' : 'background.paper',
              }}
            >
              <CardActionArea onClick={() => handleSelectTransaction(tx.id)}>
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">{tx.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {formatOperationDate(tx.operationDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1">{tx.amount.toFixed(2)} ₽</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tx.isMonthly ? 'Monthly' : 'Single'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Paper>

      {/* Карточка с деталями выбранного дохода */}
      {selectedTransaction && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Income details
          </Typography>
          <Card
            variant="outlined"
            sx={{
              maxWidth: 420,
              cursor: 'pointer',
              '&:hover': { boxShadow: 4 },
            }}
            onClick={handleOpenEditDialog}
          >
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {selectedTransaction.name}
              </Typography>
              <Typography variant="body2">
                Amount: {selectedTransaction.amount.toFixed(2)} ₽
              </Typography>
              <Typography variant="body2">
                Income date: {formatOperationDate(selectedTransaction.operationDate)}
              </Typography>
              <Typography variant="body2">
                Type: {selectedTransaction.isMonthly ? 'Monthly' : 'Single'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Press to edit
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Диалог добавления дохода */}
      <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Add income</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              type="text"
              fullWidth
              value={addForm.name}
              onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={addForm.amount}
              onChange={(e) => setAddForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
            <TextField
              label="Operation date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={addForm.operationDate}
              onChange={(e) => setAddForm((prev) => ({ ...prev, operationDate: e.target.value }))}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={addForm.isMonthly}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, isMonthly: e.target.checked }))}
                />
              }
              label="Is monthly?"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Back</Button>
          <Button onClick={handleAddIncome} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования дохода */}
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Edit income</DialogTitle>
        <DialogContent dividers>
          {selectedTransaction ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Current
                </Typography>
                <Typography variant="body2">{selectedTransaction.name}</Typography>
                <Typography variant="body2">
                  Amount: {selectedTransaction.amount.toFixed(2)} ₽
                </Typography>
              </Box>
              <Divider />
              <TextField
                label="Name"
                type="text"
                fullWidth
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <TextField
                label="Amount"
                type="number"
                inputProps={{ step: '0.01', min: '0.01' }}
                fullWidth
                value={editForm.amount}
                onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
              <TextField
                label="Operation date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editForm.operationDate}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    operationDate: e.target.value,
                  }))
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.isMonthly}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        isMonthly: e.target.checked,
                      }))
                    }
                  />
                }
                label="Is monthly?"
              />
            </Stack>
          ) : (
            <Typography>No selected income</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Back</Button>
          <Button color="error" onClick={handleOpenDeleteConfirm} disabled={!selectedTransaction}>
            Delete
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={!selectedTransaction}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Delete income</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete this income?</Typography>
          {selectedTransaction && (
            <Typography sx={{ mt: 1 }} color="text.secondary" variant="body2">
              {selectedTransaction.name} — {selectedTransaction.amount.toFixed(2)} ₽
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TransactionsPage;
