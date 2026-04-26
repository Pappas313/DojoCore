import { useCallback, useEffect, useState } from 'react';

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
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter
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
  return (
    <GridToolbarContainer sx={{ px: 2, py: 1, gap: 1, justifyContent: 'space-between' }}>
      <Stack direction="row" sx={{ gap: 1 }}>
        <GridToolbarFilterButton />
        <GridToolbarExport />
      </Stack>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        <GridToolbarQuickFilter debounceMs={300} />
        <Button variant="contained" size="small" startIcon={<IconPlus size={16} />} onClick={onAdd}>
          Add Gym
        </Button>
      </Stack>
    </GridToolbarContainer>
  );
}

// ── Gym Form Dialog (Create / Edit) ───────────────────────────────────────────

function GymFormDialog({ gym, onClose, onSaved }) {
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
      setFormError(err.message || 'Failed to save gym.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit Gym' : 'New Gym'}</DialogTitle>
        <Divider />
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Gym Name"
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
                label="Status"
                name="status"
                select
                value={form.status}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Address"
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
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (isEdit ? 'Save Changes' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteConfirmDialog({ gym, onClose, onConfirm, loading }) {
  if (!gym) return null;
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Gym</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{gym.name}</strong>? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function GymsListPage() {
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
      setError(err.message || 'Failed to load gyms.');
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
      setError(err.message || 'Failed to delete gym.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      type: 'string'
    },
    {
      field: 'gymCode',
      headerName: 'Code',
      width: 130,
      type: 'string',
      valueGetter: (value, row) => value ?? row.gym_code ?? '—'
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1.5,
      minWidth: 200,
      type: 'string'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      type: 'singleSelect',
      valueOptions: STATUS_OPTIONS,
      getOptionValue: (o) => o.value,
      getOptionLabel: (o) => o.label,
      renderCell: ({ value }) => {
        const s = STATUS_MAP[value] ?? { label: 'Unknown', color: 'default' };
        return <Chip label={s.label} color={s.color} size="small" />;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => openEdit(row)}>
              <IconPencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
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
          <Typography variant="h3">Gyms</Typography>
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
