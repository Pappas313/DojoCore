import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
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
import { alpha, useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { getAllCompetitionResults } from 'api/competitions';

// assets
import {
  IconChevronDown,
  IconChevronRight,
  IconTrophy,
  IconEye,
  IconMedal
} from '@tabler/icons-react';

// ── Placement helpers ─────────────────────────────────────────────────────────

const MEDAL_COLOR = {
  1: '#FFD700',  // gold
  2: '#C0C0C0',  // silver
  3: '#CD7F32'   // bronze
};

function MedalBadge({ placement, label }) {
  const color = MEDAL_COLOR[placement];
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {color && <IconMedal size={14} style={{ color }} />}
      <Typography variant="body2" sx={{ fontWeight: placement === 1 ? 700 : 500, color: color ?? 'text.primary', fontSize: '0.8rem' }}>
        {label}
      </Typography>
    </Stack>
  );
}

// ── Category sub-group row ────────────────────────────────────────────────────

function CategoryGroupRow({ category, rows, open, onToggle }) {
  const theme = useTheme();
  return (
    <>
      {/* Category header */}
      <TableRow
        onClick={onToggle}
        sx={{
          cursor: 'pointer',
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.main, 0.12)
            : alpha(theme.palette.primary.main, 0.06),
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.18)
              : alpha(theme.palette.primary.main, 0.10)
          }
        }}
      >
        <TableCell sx={{ width: 40, py: 0.75, pl: 6 }}>
          <IconButton size="small" disableRipple>
            {open
              ? <IconChevronDown size={16} />
              : <IconChevronRight size={16} />}
          </IconButton>
        </TableCell>
        <TableCell colSpan={5} sx={{ py: 0.75 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconTrophy size={14} color={theme.palette.primary.main} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {category}
            </Typography>
            <Chip label={rows.length} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.7rem' }} />
          </Stack>
        </TableCell>
      </TableRow>

      {/* Athlete rows */}
      <TableRow sx={{ p: 0 }}>
        <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.02)'
                          : 'rgba(0,0,0,0.015)'
                      },
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell sx={{ width: 40, pl: 10 }} />
                    <TableCell sx={{ width: 80 }}>
                      <MedalBadge placement={r.placement} label={r.placementLabel} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 240 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{r.athleteName}</Typography>
                    </TableCell>
                    <TableCell sx={{ width: 80 }}>
                      <Typography variant="body2" color="text.secondary">{r.countryCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap>{r.clubName}</Typography>
                    </TableCell>
                    <TableCell sx={{ width: 90 }}>
                      <Chip label={r.weightClass} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ── Import (title) group row ──────────────────────────────────────────────────

function ImportGroupRow({ importId, title, tournament, categories, filterGender, filterWeight, navigate }) {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  // Category open state
  const [catOpen, setCatOpen] = useState({});
  const toggleCat = (cat) => setCatOpen((prev) => ({ ...prev, [cat]: !prev[cat] }));

  // Expand all categories by default on first render
  useEffect(() => {
    const initial = {};
    Object.keys(categories).forEach((cat) => { initial[cat] = true; });
    setCatOpen(initial);
  }, [categories]);

  const totalRows = Object.values(categories).reduce((s, rows) => s + rows.length, 0);

  return (
    <>
      {/* Import / Title header row */}
      <TableRow
        sx={{
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.grey[700], 0.5)
            : alpha(theme.palette.grey[200], 0.8),
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.grey[600], 0.5)
              : alpha(theme.palette.grey[300], 0.7)
          }
        }}
      >
        <TableCell sx={{ width: 40, py: 1, pl: 2 }}>
          <IconButton size="small" onClick={() => setOpen((o) => !o)}>
            {open ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
          </IconButton>
        </TableCell>
        <TableCell colSpan={4} sx={{ py: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {tournament && (
              <Typography variant="caption" color="text.secondary">
                — {tournament}
              </Typography>
            )}
            <Chip
              label={`${totalRows} results`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Stack>
        </TableCell>
        <TableCell sx={{ width: 80, py: 1, textAlign: 'right', pr: 2 }}>
          <Tooltip title="View full results page">
            <IconButton size="small" onClick={() => navigate(`/admin/competitions/results/${importId}`)}>
              <IconEye size={16} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Category sub-groups */}
      <TableRow sx={{ p: 0 }}>
        <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableBody>
                {Object.entries(categories).map(([cat, rows]) => (
                  <CategoryGroupRow
                    key={cat}
                    category={cat}
                    rows={rows}
                    open={catOpen[cat] ?? true}
                    onToggle={() => toggleCat(cat)}
                  />
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CompetitionListPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Filters
  const [filterGender, setFilterGender] = useState('');
  const [filterWeight, setFilterWeight] = useState('');
  const [search, setSearch] = useState('');

  // ── Load ────────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const data = await getAllCompetitionResults();
      setAllResults(data ?? []);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived filter options ──────────────────────────────────────────────────

  const genders = useMemo(() => [...new Set(allResults.map((r) => r.gender))].sort(), [allResults]);
  const weights = useMemo(() => [...new Set(allResults.map((r) => r.weightClass))].sort(), [allResults]);

  // ── Build two-level grouped structure: { importId → { title, tournament, categories: { cat → rows[] } } }

  const grouped = useMemo(() => {
    let filtered = allResults;
    if (filterGender) filtered = filtered.filter((r) => r.gender === filterGender);
    if (filterWeight) filtered = filtered.filter((r) => r.weightClass === filterWeight);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.athleteName?.toLowerCase().includes(q) ||
          r.clubName?.toLowerCase().includes(q) ||
          r.importTitle?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q)
      );
    }

    const map = {};
    for (const r of filtered) {
      if (!map[r.importId]) {
        map[r.importId] = { title: r.importTitle, tournament: r.tournament, categories: {} };
      }
      const cats = map[r.importId].categories;
      if (!cats[r.category]) cats[r.category] = [];
      cats[r.category].push(r);
    }
    return map;
  }, [allResults, filterGender, filterWeight, search]);

  const totalResults = useMemo(
    () => allResults.length,
    [allResults]
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
          <IconTrophy size={22} />
          <Typography variant="h4">Competition Results</Typography>
          {!loading && (
            <Chip
              label={`${totalResults} athletes`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 1, fontSize: '0.75rem' }}
            />
          )}
        </Stack>
      }
    >
      {/* Filters toolbar */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap' }} alignItems="center">
        <TextField
          size="small"
          placeholder="Search athlete, club, title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Gender</InputLabel>
          <Select label="Gender" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {genders.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Weight Class</InputLabel>
          <Select label="Weight Class" value={filterWeight} onChange={(e) => setFilterWeight(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {weights.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageError('')}>{pageError}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : Object.keys(grouped).length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No results found.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            {/* Column headers */}
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
                <TableCell sx={{ width: 40 }} />
                <TableCell sx={{ width: 80, fontWeight: 700 }}>Medal</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Athlete</TableCell>
                <TableCell sx={{ width: 80, fontWeight: 700 }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Club</TableCell>
                <TableCell sx={{ width: 90, fontWeight: 700 }}>Weight</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(grouped).map(([importId, { title, tournament, categories }]) => (
                <ImportGroupRow
                  key={importId}
                  importId={importId}
                  title={title}
                  tournament={tournament}
                  categories={categories}
                  filterGender={filterGender}
                  filterWeight={filterWeight}
                  navigate={navigate}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </MainCard>
  );
}
