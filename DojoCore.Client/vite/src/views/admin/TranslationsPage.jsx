import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridRowModes,
  Toolbar as GridToolbar,
  ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterControl
} from '@mui/x-data-grid';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { getTranslations, upsertTranslation, deleteTranslation, getLanguages } from 'api/translations';
import { useAuth } from 'contexts/AuthContext';

// assets
import { IconTrash, IconPencil, IconPlus, IconDeviceFloppy, IconX, IconLanguage } from '@tabler/icons-react';

// ── Temp id counter (negative so it never collides with real ids) ─────────────
let _tmpCounter = -1;
function tmpId() {
  return _tmpCounter--;
}

// ── Custom Toolbar ────────────────────────────────────────────────────────────

function Toolbar({ onAddRow, hasNewRow, filterLanguage, filterPage, onFilterLanguageChange, onFilterPageChange, languages, pages }) {
  const { t } = useTranslation('common');
  return (
    <GridToolbar sx={{ px: 2, py: 1.5, gap: 1, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Language filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{t('Language', 'Language')}</InputLabel>
          <Select label={t('Language', 'Language')} value={filterLanguage} onChange={(e) => onFilterLanguageChange(e.target.value)}>
            <MenuItem value="">{t('All', 'All')}</MenuItem>
            {languages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Page / Namespace filter */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t('Page / Namespace', 'Page / Namespace')}</InputLabel>
          <Select label={t('Page / Namespace', 'Page / Namespace')} value={filterPage} onChange={(e) => onFilterPageChange(e.target.value)}>
            <MenuItem value="">{t('All', 'All')}</MenuItem>
            {pages.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ExportCsv />
        <ExportPrint />
      </Stack>

      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        <QuickFilter debounceMs={300}>
          <QuickFilterControl />
        </QuickFilter>
        <Button
          variant="contained"
          size="small"
          startIcon={<IconPlus size={16} />}
          onClick={onAddRow}
          disabled={hasNewRow}
        >
          {t('Add a Row', 'Add a Row')}
        </Button>
      </Stack>
    </GridToolbar>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteConfirmDialog({ row, onClose, onDeleted }) {
  const { t } = useTranslation('common');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      await deleteTranslation(row.language, row.page, row.key);
      onDeleted(row);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('Delete Translation', 'Delete Translation')}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <DialogContentText>
          {t(
            'Are you sure you want to delete the translation for key {{key}} in {{lang}}/{{page}}? This action cannot be undone.',
            'Are you sure you want to delete the translation for key {{key}} in {{lang}}/{{page}}? This action cannot be undone.',
            { key: row.key, lang: row.language, page: row.page }
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={deleting}>
          {t('Cancel', 'Cancel')}
        </Button>
        <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} /> : <IconTrash size={16} />}>
          {t('Delete', 'Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TranslationsPage() {
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Filters
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterPage, setFilterPage] = useState('');

  // Dialogs
  const [deleteRow, setDeleteRow] = useState(null);

  // Whether an unsaved new row is present
  const hasNewRow = rows.some((r) => r._isNew);

  // Available languages & pages for filter dropdowns
  const [languages, setLanguages] = useState([]);
  const [pages, setPages] = useState([]);

  // Pagination
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [rowCount, setRowCount] = useState(0);

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [data, langs] = await Promise.all([
        getTranslations({
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          language: filterLanguage,
          translationPage: filterPage
        }),
        getLanguages().catch(() => [])
      ]);

      // Support both paginated { items, total } and plain array responses
      const items = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
      const total = Array.isArray(data) ? items.length : (data?.total ?? data?.totalCount ?? items.length);

      // Assign stable id for DataGrid if backend doesn't return one
      const withIds = items.map((r, i) => ({
        id: r.id ?? `${r.language}__${r.page}__${r.key}`,
        ...r
      }));

      setRows(withIds);
      setRowCount(total);
      setLanguages(Array.isArray(langs) ? langs : []);

      // Derive distinct pages from loaded rows for filter dropdown
      const distinctPages = [...new Set(withIds.map((r) => r.page).filter(Boolean))].sort();
      setPages(distinctPages);
    } catch (err) {
      const status = err.message?.includes('401') || err.message?.includes('403');
      setPageError(
        status
          ? t(
              'Access denied (401). You must be logged in as an Administrator to manage translations. Please log out and log in with an Admin account.',
              'Access denied (401). You must be logged in as an Administrator to manage translations. Please log out and log in with an Admin account.'
            )
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, [paginationModel, filterLanguage, filterPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Row editing handlers ────────────────────────────────────────────────────

  function handleEditClick(id) {
    setRowModesModel((prev) => ({ ...prev, [id]: { mode: GridRowModes.Edit } }));
  }

  function handleSaveClick(id) {
    setRowModesModel((prev) => ({ ...prev, [id]: { mode: GridRowModes.View } }));
  }

  function handleCancelClick(id) {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true }
    }));
    // Remove temp rows that were never saved
    setRows((prev) => prev.filter((r) => !(r.id === id && r._isNew)));
  }

  function handleRowModesModelChange(newModel) {
    setRowModesModel(newModel);
  }

  function handleRowEditStop(params, event) {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  }

  const processRowUpdate = useCallback(async (newRow, oldRow) => {
    if (!newRow.language || !newRow.page || !newRow.key) {
      showToast(t('Language, Page and Key are required.', 'Language, Page and Key are required.'), 'error');
      return oldRow;
    }
    try {
      await upsertTranslation(newRow.language, newRow.page, newRow.key, newRow.value ?? '');
      const saved = {
        ...newRow,
        id: newRow._isNew ? `${newRow.language}__${newRow.page}__${newRow.key}` : newRow.id,
        _isNew: false
      };
      setRows((prev) => prev.map((r) => (r.id === newRow.id ? saved : r)));
      showToast(t('Translation saved.', 'Translation saved.'), 'success');
      return saved;
    } catch (err) {
      showToast(err.message, 'error');
      return oldRow;
    }
  }, []);

  function handleProcessRowUpdateError(err) {
    showToast(err.message, 'error');
  }

  // ── Delete handlers ─────────────────────────────────────────────────────────

  function handleDeleteClick(row) {
    if (row._isNew) {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      return;
    }
    setDeleteRow(row);
  }

  function handleDeleted(row) {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    setDeleteRow(null);
    showToast(t('Translation deleted.', 'Translation deleted.'), 'success');
  }

  // ── Add row inline (DevExtreme style) ────────────────────────────────────────

  function handleAddRow() {
    const id = tmpId();
    setRows((prev) => [
      { id, language: '', page: '', key: '', value: '', _isNew: true },
      ...prev
    ]);
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'language' }
    }));
  }

  // ── Toast helper ─────────────────────────────────────────────────────────────

  function showToast(message, severity = 'success') {
    setToast({ open: true, message, severity });
  }

  // ── Filter handlers ──────────────────────────────────────────────────────────

  function handleFilterLanguageChange(value) {
    setFilterLanguage(value);
    setPaginationModel((p) => ({ ...p, page: 0 }));
  }

  function handleFilterPageChange(value) {
    setFilterPage(value);
    setPaginationModel((p) => ({ ...p, page: 0 }));
  }

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns = [
    {
      field: 'language',
      headerName: t('Language', 'Language'),
      width: 120,
      editable: true
    },
    {
      field: 'page',
      headerName: t('Page / Namespace', 'Page / Namespace'),
      width: 180,
      editable: true
    },
    {
      field: 'key',
      headerName: t('Key', 'Key'),
      flex: 1,
      minWidth: 220,
      editable: true
    },
    {
      field: 'value',
      headerName: t('Value', 'Value'),
      flex: 2,
      minWidth: 260,
      editable: true
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('Actions', 'Actions'),
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id, row }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={
                <Tooltip title="Save">
                  <IconDeviceFloppy size={18} />
                </Tooltip>
              }
              label="Save"
              onClick={() => handleSaveClick(id)}
              color="primary"
            />,
            <GridActionsCellItem
              key="cancel"
              icon={
                <Tooltip title="Cancel">
                  <IconX size={18} />
                </Tooltip>
              }
              label="Cancel"
              onClick={() => handleCancelClick(id)}
              color="inherit"
            />
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={
              <Tooltip title="Edit">
                <IconPencil size={18} />
              </Tooltip>
            }
            label="Edit"
            onClick={() => handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={
              <Tooltip title="Delete">
                <IconTrash size={18} />
              </Tooltip>
            }
            label="Delete"
            onClick={() => handleDeleteClick(row)}
            color="error"
          />
        ];
      }
    }
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
          <IconLanguage size={22} />
          <Typography variant="h4">{t('Translation Management', 'Translation Management')}</Typography>
        </Stack>
      }
    >
      {/* Role guard – Admin only (role 0) */}
      {user?.role !== 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t(
            'This page is restricted to Administrators. You are logged in as {{username}} (role {{role}}). Please log in with an Admin account.',
            'This page is restricted to Administrators. You are logged in as {{username}} (role {{role}}). Please log in with an Admin account.',
            { username: user?.username ?? 'unknown', role: user?.role ?? '?' }
          )}
        </Alert>
      )}

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}

      <Box sx={{ width: '100%', minHeight: 400 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          autoHeight
          getRowClassName={(params) => (params.row._isNew ? 'row--new' : '')}
          slots={{ toolbar: Toolbar }}
          slotProps={{
            toolbar: {
              onAddRow: handleAddRow,
              hasNewRow,
              filterLanguage,
              filterPage,
              onFilterLanguageChange: handleFilterLanguageChange,
              onFilterPageChange: handleFilterPageChange,
              languages,
              pages
            }
          }}
          sx={{
            '& .actions': { color: 'text.secondary' },
            '& .row--new': { bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } },
            '& .MuiDataGrid-row.Mui-selected': { bgcolor: 'action.selected' }
          }}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      {deleteRow && (
        <DeleteConfirmDialog
          row={deleteRow}
          onClose={() => setDeleteRow(null)}
          onDeleted={handleDeleted}
        />
      )}

      {/* Toast notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
}
