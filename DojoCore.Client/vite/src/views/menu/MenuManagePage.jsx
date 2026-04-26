import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from 'api/menuManage';

// assets
import { IconTrash, IconPencil, IconPlus, IconMenu2, IconChevronRight, IconX, IconSearch } from '@tabler/icons-react';

// ── Column count (Title, PageCode, URL, Icon, Order, Actions) ─────────────────
const COL_COUNT = 6;

// ── Constants ─────────────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  'home',
  'layout',
  'bar-chart-2',
  'trending-up',
  'file-text',
  'users',
  'activity',
  'list',
  'user-plus',
  'award',
  'briefcase',
  'settings',
  'user',
  'shield',
  'lock',
  'smartphone',
  'bell',
  'link',
  'plus-circle'
];

const EMPTY_FORM = {
  title: '',
  pageCode: '',
  url: '',
  icon: '',
  orderIndex: 1,
  parentId: ''
};

// ── Tree helpers ──────────────────────────────────────────────────────────────

/**
 * Flatten a nested menu tree into a sorted flat list, tracking depth and parentId.
 * Each node gets a `_depth` and `_parentId` property for display.
 */
function flattenTree(items, parentId = null, depth = 0) {
  const result = [];
  const sorted = [...items].sort((a, b) => {
    if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
    return (a.pageCode ?? '').localeCompare(b.pageCode ?? '');
  });
  for (const item of sorted) {
    result.push({ ...item, _depth: depth, _parentId: parentId });
    if (Array.isArray(item.children) && item.children.length > 0) {
      result.push(...flattenTree(item.children, item.id, depth + 1));
    }
  }
  return result;
}

/**
 * Given a flat list, collect all descendant IDs of a given item ID.
 */
function collectDescendantIds(flatRows, itemId) {
  const ids = new Set();
  // BFS using _parentId relationships
  const queue = [itemId];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const row of flatRows) {
      if (row._parentId === current) {
        ids.add(row.id);
        queue.push(row.id);
      }
    }
  }
  return ids;
}

// ── Inline Form Panel ─────────────────────────────────────────────────────────

function MenuItemFormPanel({ editTarget, isNew, flatRows, onClose, onSaved }) {
  const isEdit = !isNew && editTarget !== null;

  const [form, setForm] = useState(() =>
    isNew
      ? { ...EMPTY_FORM }
      : {
          title: editTarget?.title ?? '',
          pageCode: editTarget?.pageCode ?? '',
          url: editTarget?.url ?? '',
          icon: editTarget?.icon ?? '',
          orderIndex: editTarget?.orderIndex ?? 1,
          parentId: editTarget?._parentId ?? ''
        }
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const titleRef = useRef(null);

  // Focus title on mount
  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 50);
  }, []);

  // Parent options: all items except the item itself and its descendants
  const parentOptions = useMemo(() => {
    if (!flatRows) return [];
    const excludeIds = isEdit
      ? new Set([editTarget.id, ...collectDescendantIds(flatRows, editTarget.id)])
      : new Set();
    return flatRows.filter((r) => !excludeIds.has(r.id));
  }, [flatRows, isEdit, editTarget]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'orderIndex' ? Number(value) || 1 : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!form.pageCode.trim()) {
      setFormError('Page Code is required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title: form.title.trim(),
        pageCode: form.pageCode.trim(),
        url: form.url.trim() || null,
        icon: form.icon || null,
        orderIndex: form.orderIndex,
        parentId: form.parentId !== '' ? Number(form.parentId) : null
      };
      const result = isEdit
        ? await updateMenuItem(editTarget.id, payload)
        : await createMenuItem(payload);
      onSaved(result);
    } catch (err) {
      setFormError(err.message || 'Failed to save menu item.');
      setSaving(false);
    }
  }

  return (
    <Box sx={{ p: 2.5, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50', borderTop: '2px solid', borderColor: 'primary.main' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" color="primary">
          {isEdit ? `Edit: ${editTarget.title}` : 'New Menu Item'}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close form">
          <IconX size={18} />
        </IconButton>
      </Stack>
      <form onSubmit={handleSubmit} noValidate>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2}>
            {/* Row 1 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                inputRef={titleRef}
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Page Code"
                name="pageCode"
                value={form.pageCode}
                onChange={handleChange}
                fullWidth
                size="small"
                required
              />
            </Grid>

            {/* Row 2 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="URL"
                name="url"
                value={form.url}
                onChange={handleChange}
                fullWidth
                size="small"
                placeholder="/path/to/page"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Icon"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                fullWidth
                size="small"
                select
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {ICON_OPTIONS.map((icon) => (
                  <MenuItem key={icon} value={icon}>
                    {icon}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Row 3 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Order Index"
                name="orderIndex"
                type="number"
                value={form.orderIndex}
                onChange={handleChange}
                fullWidth
                size="small"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Parent Item"
                name="parentId"
                value={form.parentId}
                onChange={handleChange}
                fullWidth
                size="small"
                select
              >
                <MenuItem value="">
                  <em>— No parent (top-level group) —</em>
                </MenuItem>
                {parentOptions.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {'  '.repeat(item._depth)}
                    {item._depth > 0 ? '└ ' : ''}
                    {item.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
            <Button onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create'
              )}
            </Button>
          </Stack>
        </form>
    </Box>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteConfirmDialog({ item, hasChildren, onClose, onConfirm, loading }) {
  if (!item) return null;
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Menu Item</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{item.title}</strong>?
          {hasChildren && (
            <>
              {' '}
              <br />
              <Typography component="span" color="error" variant="body2">
                This will also delete all of its child items.
              </Typography>
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MenuManagePage() {
  const [flatRows, setFlatRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [formMode, setFormMode] = useState(null); // null | 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMenuItems();
      const items = Array.isArray(data) ? data : [];
      setFlatRows(flattenTree(items));
    } catch (err) {
      setError(err.message || 'Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  function openCreate() {
    setEditTarget(null);
    setFormMode('create');
  }

  function openEdit(row) {
    if (editTarget?.id === row.id && formMode === 'edit') {
      setFormMode(null);
      setEditTarget(null);
      return;
    }
    setEditTarget(row);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode(null);
    setEditTarget(null);
  }

  async function handleSaved() {
    closeForm();
    await fetchMenu();
  }

  async function handleDeleteConfirm() {
    setDeleteLoading(true);
    try {
      await deleteMenuItem(deleteTarget.id);
      setDeleteTarget(null);
      await fetchMenu();
    } catch (err) {
      setError(err.message || 'Failed to delete menu item.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const hasChildren = useMemo(() => {
    if (!deleteTarget) return false;
    return flatRows.some((r) => r._parentId === deleteTarget.id);
  }, [flatRows, deleteTarget]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return flatRows;
    return flatRows.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.pageCode?.toLowerCase().includes(q) ||
        r.url?.toLowerCase().includes(q)
    );
  }, [flatRows, search]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconMenu2 size={22} />
          <span>Menu Management</span>
        </Stack>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* ── Toolbar ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={16} />
              </InputAdornment>
            )
          }}
        />
        <Button variant="contained" size="small" startIcon={<IconPlus size={16} />} onClick={openCreate}>
          Add Item
        </Button>
      </Stack>

      {/* ── Table ── */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600, width: '28%' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Page Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>URL</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Icon</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 70, textAlign: 'center' }}>Order</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 100 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={COL_COUNT} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={COL_COUNT} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No menu items found.
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredRows.map((row) => {
              const isEditing = editTarget?.id === row.id && formMode === 'edit';
              return (
                <Fragment key={row.id}>
                  {/* Data row */}
                  <TableRow
                    hover
                    selected={isEditing}
                    sx={isEditing ? { '& td': { borderBottom: 0 } } : undefined}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" sx={{ pl: row._depth * 2.5 }}>
                        {row._depth > 0 && (
                          <IconChevronRight size={14} style={{ marginRight: 4, opacity: 0.45, flexShrink: 0 }} />
                        )}
                        <Typography variant="body2">{row.title}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{row.pageCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{row.url ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{row.icon ?? '—'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{row.orderIndex}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(row)} color={isEditing ? 'primary' : 'default'}>
                            <IconPencil size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
                            <IconTrash size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>

                  {/* Inline edit form — injected directly below this row */}
                  <TableRow>
                    <TableCell colSpan={COL_COUNT} sx={{ p: 0, border: 0 }}>
                      <Collapse in={isEditing} timeout="auto" unmountOnExit>
                        <MenuItemFormPanel
                          key={row.id}
                          editTarget={row}
                          isNew={false}
                          flatRows={flatRows}
                          onClose={closeForm}
                          onSaved={handleSaved}
                        />
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}

            {/* Create form — appended after all rows */}
            {formMode === 'create' && (
              <TableRow>
                <TableCell colSpan={COL_COUNT} sx={{ p: 0 }}>
                  <Collapse in timeout="auto" unmountOnExit>
                    <MenuItemFormPanel
                      key="create"
                      editTarget={null}
                      isNew
                      flatRows={flatRows}
                      onClose={closeForm}
                      onSaved={handleSaved}
                    />
                  </Collapse>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteConfirmDialog
        item={deleteTarget}
        hasChildren={hasChildren}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </MainCard>
  );
}
