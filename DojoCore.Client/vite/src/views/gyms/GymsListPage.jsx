import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  GridToolbarFilterButton,
  Toolbar as GridToolbar,
  QuickFilter,
  QuickFilterControl,
  ExportCsv,
  ExportPrint
} from '@mui/x-data-grid';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { getGyms, createGym, updateGym, deleteGym } from 'api/gyms';

// assets
import { IconTrash, IconPencil, IconPlus, IconBuildingStore } from '@tabler/icons-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'Active' },
  { value: 2, label: 'Inactive' },
  { value: 3, label: 'Suspended' }
];
const STATUS_MAP = {
  0: { label: 'Pending', color: 'warning' },
  1: { label: 'Active', color: 'success' },
  2: { label: 'Inactive', color: 'default' },
  3: { label: 'Suspended', color: 'error' }
};

const EMPTY_FORM = { name: '', address: '', status: 1 };

// ── Custom Toolbar ────────────────────────────────────────────────────────────

function Toolbar({ onAdd }) {
  const { t } = useTranslation('common');
  return (
    <GridToolbar sx={{ px: 2, py: 1, gap: 1, justifyContent: 'space-between' }}>
      <Stack direction="row" sx={{ gap: 1 }}>
        <GridToolbarFilterButton />
        <ExportCsv />
        <ExportPrint />
      </Stack>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        <QuickFilter debounceMs={300}>
          <QuickFilterControl />
        </QuickFilter>
        <Button variant="contained" size="small" startIcon={<IconPlus size={16} />} onClick={onAdd}>
          {t('Add Gym', 'Add Gym')}
        </Button>
      </Stack>
    </GridToolbar>
  );
}

// ── Gym Form Dialog (Create / Edit) ───────────────────────────────────────────

function GymFormDialog({ gym, onClose, onSaved }) {
  const { t } = useTranslation('common');
  const isEdit = Boolean(gym?.id);
  const [form, setForm] = useState(
    isEdit
      ? {
          name: gym.name ?? '',
          address: gym.address ?? '',
          status: gym.status ?? 1
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const result = isEdit ? await updateGym(gym.id, form) : await createGym(form);
      onSaved(result, isEdit);
      onClose();
    } catch (err) {
      setFormError(err.message || t('Failed to save gym.', 'Failed to save gym.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? t('Edit Gym', 'Edit Gym') : t('New Gym', 'New Gym')}</DialogTitle>
        <Divider />
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label={t('Gym Name', 'Gym Name')}
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label={t('Status', 'Status')}
                name="status"
                select
                value={form.status}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{t(o.label, o.label)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={t('Address', 'Address')}
                name="address"
                value={form.address}
                onChange={handleChange}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>{t('Cancel', 'Cancel')}</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (isEdit ? t('Save Changes', 'Save Changes') : t('Create', 'Create'))}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteConfirmDialog({ gym, onClose, onConfirm, loading }) {
  const { t } = useTranslation('common');
  if (!gym) return null;
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('Delete Gym', 'Delete Gym')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('Are you sure you want to delete {{name}}? This action cannot be undone.', 'Are you sure you want to delete {{name}}? This action cannot be undone.', { name: gym.name })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>{t('Cancel', 'Cancel')}</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : t('Delete', 'Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function GymsListPage() {
  const { t } = useTranslation('common');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formTarget, setFormTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchGyms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getGyms();
      setRows(Array.isArray(data) ? data : (data?.items ?? data?.data ?? []));
    } catch (err) {
      setError(err.message || t('Failed to load gyms.', 'Failed to load gyms.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGyms(); }, [fetchGyms]);

  function openCreate() { setFormTarget({}); setFormOpen(true); }
  function openEdit(row) { setFormTarget(row); setFormOpen(true); }
  function closeForm() { setFormOpen(false); setFormTarget(null); }

  function handleSaved(result, isEdit) {
    if (!result) return;
    if (isEdit) {
      setRows((prev) => prev.map((r) => (r.id === result.id ? result : r)));
    } else {
      setRows((prev) => [...prev, result]);
    }
  }

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteGym(deleteTarget.id);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || t('Failed to delete gym.', 'Failed to delete gym.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: t('Name', 'Name'),
      flex: 1,
      minWidth: 180,
      type: 'string'
    },
    {
      field: 'gymCode',
      headerName: t('Code', 'Code'),
      width: 130,
      type: 'string',
      valueGetter: (value, row) => value ?? row.gym_code ?? '—'
    },
    {
      field: 'address',
      headerName: t('Address', 'Address'),
      flex: 1.5,
      minWidth: 200,
      type: 'string'
    },
    {
      field: 'status',
      headerName: t('Status', 'Status'),
      width: 140,
      type: 'singleSelect',
      valueOptions: STATUS_OPTIONS,
      getOptionValue: (o) => o.value,
      getOptionLabel: (o) => t(o.label, o.label),
      renderCell: ({ value }) => {
        const s = STATUS_MAP[value] ?? { label: 'Unknown', color: 'default' };
        return <Chip label={t(s.label, s.label)} color={s.color} size="small" />;
      }
    },
    {
      field: 'actions',
      headerName: t('Actions', 'Actions'),
      width: 110,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={t('Edit', 'Edit')}>
            <IconButton size="small" color="primary" onClick={() => openEdit(row)}>
              <IconPencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('Delete', 'Delete')}>
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <MainCard
      title={
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <IconBuildingStore size={22} />
          <Typography variant="h3">{t('Gyms', 'Gyms')}</Typography>
        </Stack>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{ toolbar: Toolbar }}
          slotProps={{ toolbar: { onAdd: openCreate } }}
          disableRowSelectionOnClick
          unstable_headerFilters
          sx={{
            border: 0,
            '& .MuiDataGrid-cell': { py: 1 },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 }
          }}
        />
      </Box>

      {formOpen && (
        <GymFormDialog gym={formTarget} onClose={closeForm} onSaved={handleSaved} />
      )}
      <DeleteConfirmDialog
        gym={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </MainCard>
  );
}
