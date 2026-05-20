import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  GridToolbarFilterButton,
  Toolbar as GridToolbar,
  QuickFilter,
  QuickFilterControl,
  ExportCsv,
  ExportPrint
} from '@mui/x-data-grid';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { getAthletes, createAthlete, updateAthlete, deleteAthlete } from 'api/athletes';

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
          {t('Add Athlete', 'Add Athlete')}
        </Button>
      </Stack>
    </GridToolbar>
  );
}

// ── Athlete Form Dialog (Create / Edit) ───────────────────────────────────────

function AthleteFormDialog({ athlete, onClose, onSaved }) {
  const { t } = useTranslation('common');
  const isEdit = Boolean(athlete?.id);
  const [form, setForm] = useState(
    isEdit
      ? {
          username: athlete.username ?? '',
          email: athlete.email ?? '',
          password: '',
          gender: athlete.gender ?? 1,
          dateOfBirth: athlete.dateOfBirth ? athlete.dateOfBirth.slice(0, 10) : '',
          address: athlete.address ?? '',
          status: athlete.status ?? 1
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
      const result = isEdit ? await updateAthlete(athlete.id, payload) : await createAthlete(payload);
      onSaved(result, isEdit);
      onClose();
    } catch (err) {
      setFormError(err.message || t('Failed to save athlete.', 'Failed to save athlete.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? t('Edit Athlete', 'Edit Athlete') : t('New Athlete', 'New Athlete')}</DialogTitle>
        <Divider />
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('Username', 'Username')}
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
                label={t('Email', 'Email')}
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
                label={isEdit ? t('New Password (optional)', 'New Password (optional)') : t('Password', 'Password')}
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
                label={t('Date of Birth', 'Date of Birth')}
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
                label={t('Gender', 'Gender')}
                name="gender"
                select
                value={form.gender}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                {GENDER_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{t(o.label, o.label)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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

function DeleteConfirmDialog({ athlete, onClose, onConfirm, loading }) {
  const { t } = useTranslation('common');
  if (!athlete) return null;
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('Delete Athlete', 'Delete Athlete')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('Are you sure you want to delete {{name}}? This action cannot be undone.', 'Are you sure you want to delete {{name}}? This action cannot be undone.', { name: athlete.username })}
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

export default function AthletesListPage() {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formTarget, setFormTarget] = useState(null);   // null = closed, {} = create, {id,...} = edit
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAthletes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAthletes();
      setRows(Array.isArray(data) ? data : (data?.items ?? data?.data ?? []));
    } catch (err) {
      setError(err.message || t('Failed to load athletes.', 'Failed to load athletes.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAthletes(); }, [fetchAthletes]);

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
      await deleteAthlete(deleteTarget.id);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || t('Failed to delete athlete.', 'Failed to delete athlete.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      field: 'username',
      headerName: t('Username', 'Username'),
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
    { field: 'email', headerName: t('Email', 'Email'), flex: 1.5, minWidth: 200, type: 'string' },
    {
      field: 'gender',
      headerName: t('Gender', 'Gender'),
      width: 120,
      type: 'singleSelect',
      valueOptions: GENDER_OPTIONS,
      getOptionValue: (o) => o.value,
      getOptionLabel: (o) => t(o.label, o.label),
      valueFormatter: (value) => t(GENDER_LABEL[value] ?? '—', GENDER_LABEL[value] ?? '—')
    },
    {
      field: 'dateOfBirth',
      headerName: t('Date of Birth', 'Date of Birth'),
      width: 150,
      type: 'date',
      valueGetter: (value) => value ? new Date(value) : null,
      valueFormatter: (value) => value ? value.toLocaleDateString() : '—'
    },
    { field: 'address', headerName: t('Address', 'Address'), flex: 1, minWidth: 160, type: 'string' },
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
          <IconUsers size={22} />
          <Typography variant="h3">{t('Athletes', 'Athletes')}</Typography>
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
        <AthleteFormDialog athlete={formTarget} onClose={closeForm} onSaved={handleSaved} />
      )}
      <DeleteConfirmDialog
        athlete={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </MainCard>
  );
}
