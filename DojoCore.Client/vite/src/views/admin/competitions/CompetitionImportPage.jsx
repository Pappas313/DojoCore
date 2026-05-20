import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid, GridActionsCellItem, Toolbar as GridToolbar, QuickFilter, QuickFilterControl } from '@mui/x-data-grid';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { importCompetition, getCompetitionImports, deleteCompetitionImport } from 'api/competitions';

// assets
import { IconTrash, IconEye, IconUpload, IconTrophy, IconFileSpreadsheet } from '@tabler/icons-react';

// ── Toolbar ───────────────────────────────────────────────────────────────────

function HistoryToolbar() {
  return (
    <GridToolbar sx={{ px: 2, py: 1, justifyContent: 'flex-end' }}>
      <QuickFilter debounceMs={300}>
        <QuickFilterControl />
      </QuickFilter>
    </GridToolbar>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteConfirmDialog({ row, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      await deleteCompetitionImport(row.id);
      onDeleted(row.id);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Import</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <DialogContentText>
          Are you sure you want to delete <strong>{row.title}</strong> and all its results? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={deleting}>Cancel</Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleDelete}
          disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} /> : <IconTrash size={16} />}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CompetitionImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Upload form
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // History grid
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Delete dialog
  const [deleteRow, setDeleteRow] = useState(null);

  // Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // ── Load imports ─────────────────────────────────────────────────────────────

  const loadImports = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const data = await getCompetitionImports();
      setImports(data ?? []);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadImports(); }, [loadImports]);

  // ── File handling ─────────────────────────────────────────────────────────────

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) setSelectedFile(f);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setSelectedFile(f);
  }

  // ── Upload ────────────────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!selectedFile) { setUploadError('Please select an Excel file.'); return; }
    if (!title.trim()) { setUploadError('Please enter a title for this import.'); return; }

    setUploading(true);
    setUploadError('');
    try {
      const result = await importCompetition(selectedFile, title.trim());
      setSelectedFile(null);
      setTitle('');
      showToast(`Imported ${result.rowsImported} results across ${result.categories.length} categories.`, 'success');
      await loadImports();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  function handleDeleted(id) {
    setImports((prev) => prev.filter((r) => r.id !== id));
    setDeleteRow(null);
    showToast('Import deleted.', 'success');
  }

  // ── Toast ─────────────────────────────────────────────────────────────────────

  function showToast(message, severity = 'success') {
    setToast({ open: true, message, severity });
  }

  // ── Columns ───────────────────────────────────────────────────────────────────

  const columns = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1.5,
      minWidth: 200
    },
    {
      field: 'tournament',
      headerName: 'Tournament',
      flex: 1.5,
      minWidth: 180
    },
    {
      field: 'fileName',
      headerName: 'File',
      flex: 1,
      minWidth: 160
    },
    {
      field: 'rowCount',
      headerName: 'Results',
      width: 90,
      type: 'number'
    },
    {
      field: 'createdAt',
      headerName: 'Imported At',
      width: 170,
      valueFormatter: (value) => value ? new Date(value).toLocaleString() : ''
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 90,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<Tooltip title="View Results"><IconEye size={18} /></Tooltip>}
          label="View Results"
          onClick={() => navigate(`/admin/competitions/results/${row.id}`)}
          color="primary"
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Tooltip title="Delete"><IconTrash size={18} /></Tooltip>}
          label="Delete"
          onClick={() => setDeleteRow(row)}
          color="error"
        />
      ]
    }
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
          <IconTrophy size={22} />
          <Typography variant="h4">Competition Import</Typography>
        </Stack>
      }
    >
      {/* ── Upload Form ── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Import Excel File</Typography>

        <Stack spacing={2}>
          {/* Title input */}
          <TextField
            label="Grouping Title"
            placeholder="e.g. ΠΑΝ.ΠΡ.Α.Γ 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            size="small"
            disabled={uploading}
          />

          {/* Drop zone */}
          <Box
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: uploading ? 'default' : 'pointer',
              bgcolor: dragOver ? 'action.hover' : 'background.default',
              transition: 'all 0.2s'
            }}
          >
            <IconFileSpreadsheet size={40} style={{ opacity: 0.5 }} />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {selectedFile
                ? selectedFile.name
                : 'Drag & drop an Excel file here, or click to browse (.xls, .xlsx)'}
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Box>

          {/* Error */}
          {uploadError && <Alert severity="error" onClose={() => setUploadError('')}>{uploadError}</Alert>}

          {/* Upload button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <IconUpload size={16} />}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Importing…' : 'Import'}
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* ── Import History Grid ── */}
      <Typography variant="h5" sx={{ mb: 1.5 }}>Import History</Typography>

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageError('')}>{pageError}</Alert>
      )}

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={imports}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{ toolbar: HistoryToolbar }}
          sx={{ '& .MuiDataGrid-row': { cursor: 'default' } }}
        />
      </Box>

      {/* Delete Confirm Dialog */}
      {deleteRow && (
        <DeleteConfirmDialog
          row={deleteRow}
          onClose={() => setDeleteRow(null)}
          onDeleted={handleDeleted}
        />
      )}

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((p) => ({ ...p, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
}
