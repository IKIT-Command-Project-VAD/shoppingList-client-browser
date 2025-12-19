import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type ErrorDialogProps = {
  error: string | null;
  onClose: () => void;
  title?: string;
};

export function ErrorDialog({ error, onClose, title }: ErrorDialogProps) {
  return (
    <Dialog open={!!error} onClose={onClose} fullWidth maxWidth="sm">
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        <Typography color="error">{error}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}
