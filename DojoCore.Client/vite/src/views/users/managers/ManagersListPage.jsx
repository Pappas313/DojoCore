import { useCallback, useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
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
import { getManagers, createManager, updateManager, deleteManager } from 'api/managers';

// assets
import { IconTrash, IconPencil, IconPlus, IconUsers } from '@tabler/icons-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [{ value: 1, label: 'Male' }, { value: 0, label: 'Female' }];
const STATUS_OPTIONS = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'Active' },
  { value: 2, label: 'Inactive' },
  { value: 3, label: 'Suspended' }
];
const GENDER_LABEL = { 0: 'Female', 1: 'Male' };
const STATUS_MAP = {
  0: { label: 'Pending', color: 'warning' },
  1: { label: 'Active', color: 'success' },
  2: { label: 'Inactive', color: 'default' },
  3: { label: 'Suspended', color: 'error' }
};

const EMPTY_FORM = { username: '', email: '', password: '', gender: 1, dateOfBirth: '', address: '', status: 1 };

function getInitials(username = '') {
  return username.slice(0, 2).toUpperCase();
}

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
          Add Manager
        </Button>
      </Stack>
    </GridToolbarContainer>
  );
}

// ── Manager Form Dialog (Create / Edit) ───────────────────────────────────────

function ManagerFormDialog({ manager, onClose, onSaved }) {
  const isEdit = Boolean(manager?.id);
  const [form, setForm] = useState(
    isEdit
      ? {
          username: manager.username ?? '',
          email: manager.email ?? '',
          password: '',
          gender: manager.gender ?? 1,
          dateOfBirth: manager.dateOfBirth ? manager.dateOfBirth.slice(0, 10) : '',
          address: manager.address ?? '',
          status: manager.status ?? 1
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
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const result = isEdit ? await updateManager(manager.id, payload) : await createManager(payload);
      onSaved(result, isEdit);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save manager.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit Manager' : 'New Manager'}</DialogTitle>
        <Divider />
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={isEdit ? 'New Password (optional)' : 'Password'}
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required={!isEdit}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Gender"
                name="gender"
                select
                value={form.gender}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                {GENDER_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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

function DeleteConfirmDialog({ manager, onClose, onConfirm, loading }) {
  if (!manager) return null;
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Manager</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{manager.username}</strong>? This action cannot be undone.
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

export default function ManagersListPage() {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formTarget, setFormTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getManagers();
      setRows(Array.isArray(data) ? data : (data?.items ?? data?.data ?? []));
    } catch (err) {
      setError(err.message || 'Failed to load managers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchManagers(); }, [fetchManagers]);

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
      await deleteManager(deleteTarget.id);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to delete manager.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      field: 'username',
      headerName: 'Username',
      flex: 1,
      minWidth: 140,
      type: 'string',
      renderCell: ({ row }) => (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.vars.palette.secondary.main, fontSize: '0.75rem' }}>
            {getInitials(row.username)}
          </Avatar>
          <Typography variant="body2">{row.username}</Typography>
        </Stack>
      )
    },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200, type: 'string' },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 120,
      type: 'singleSelect',
      valueOptions: GENDER_OPTIONS,
      getOptionValue: (o) => o.value,
      getOptionLabel: (o) => o.label,
      valueFormatter: (value) => GENDER_LABEL[value] ?? '—'
    },
    {
      field: 'dateOfBirth',
      headerName: 'Date of Birth',
      width: 150,
      type: 'date',
      valueGetter: (value) => value ? new Date(value) : null,
      valueFormatter: (value) => value ? value.toLocaleDateString() : '—'
    },
    { field: 'address', headerName: 'Address', flex: 1, minWidth: 160, type: 'string' },
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
          <IconUsers size={22} />
          <Typography variant="h3">Managers</Typography>
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
        <ManagerFormDialog manager={formTarget} onClose={closeForm} onSaved={handleSaved} />
      )}
      <DeleteConfirmDialog
        manager={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </MainCard>
  );
}
