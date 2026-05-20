import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  DataGrid,
  Toolbar as GridToolbar,
  ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterControl
} from '@mui/x-data-grid';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { getCompetitionResults } from 'api/competitions';

// assets
import { IconArrowLeft, IconTrophy } from '@tabler/icons-react';

// ── Placement badge colours ───────────────────────────────────────────────────

const PLACEMENT_COLOR = { 1: 'warning', 2: 'default', 3: 'default' };
const PLACEMENT_STYLE = {
  1: { fontWeight: 700, color: '#b8860b' },
  2: { fontWeight: 700, color: '#808080' },
  3: { fontWeight: 700, color: '#cd7f32' }
};

// ── Toolbar ───────────────────────────────────────────────────────────────────

function ResultsToolbar({ filterGender, filterWeight, genders, weights, onGenderChange, onWeightChange }) {
  return (
    <GridToolbar sx={{ px: 2, py: 1.5, gap: 1, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Gender</InputLabel>
          <Select label="Gender" value={filterGender} onChange={(e) => onGenderChange(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {genders.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Weight Class</InputLabel>
          <Select label="Weight Class" value={filterWeight} onChange={(e) => onWeightChange(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {weights.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </Select>
        </FormControl>

        <ExportCsv />
        <ExportPrint />
      </Stack>

      <QuickFilter debounceMs={300}>
        <QuickFilterControl />
      </QuickFilter>
    </GridToolbar>
  );
}

// ── Inject group header rows into flat results list ───────────────────────────
// For each new category, a synthetic header row is inserted before the group.

function buildGroupedRows(results) {
  const rows = [];
  let lastCategory = null;
  let groupSeq = 0;

  for (const r of results) {
    if (r.category !== lastCategory) {
      lastCategory = r.category;
      groupSeq += 1;
      rows.push({
        id: `__group_${groupSeq}`,
        _isGroupHeader: true,
        category: r.category,
        gender: r.gender,
        weightClass: r.weightClass
      });
    }
    rows.push({ ...r, _isGroupHeader: false });
  }
  return rows;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CompetitionResultsPage() {
  const { importId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [data, setData] = useState(null);          // full API response
  const [allResults, setAllResults] = useState([]); // flat sorted results
  const [rows, setRows] = useState([]);              // grouped rows for grid
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Filters
  const [filterGender, setFilterGender] = useState('');
  const [filterWeight, setFilterWeight] = useState('');

  // ── Load ──────────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await getCompetitionResults(importId);
      if (!response) { setPageError('Import not found.'); return; }
      setData(response);
      setAllResults(response.results ?? []);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }, [importId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Re-build grid rows when filters or data change ────────────────────────────

  useEffect(() => {
    let filtered = allResults;
    if (filterGender) filtered = filtered.filter((r) => r.gender === filterGender);
    if (filterWeight) filtered = filtered.filter((r) => r.weightClass === filterWeight);
    setRows(buildGroupedRows(filtered));
  }, [allResults, filterGender, filterWeight]);

  // ── Derived filter options ─────────────────────────────────────────────────────

  const genders = [...new Set(allResults.map((r) => r.gender))].sort();
  const weights = [...new Set(allResults.map((r) => r.weightClass))].sort();

  // ── Columns ────────────────────────────────────────────────────────────────────

  const columns = [
    {
      field: 'placement',
      headerName: '#',
      width: 52,
      renderCell: ({ row }) => {
        if (row._isGroupHeader) return null;
        return (
          <Typography variant="body2" sx={{ ...PLACEMENT_STYLE[row.placement], fontSize: '0.85rem' }}>
            {row.placement}
          </Typography>
        );
      }
    },
    {
      field: 'placementLabel',
      headerName: 'Medal',
      width: 80,
      renderCell: ({ row }) => {
        if (row._isGroupHeader) return null;
        return (
          <Chip
            label={row.placementLabel}
            size="small"
            color={PLACEMENT_COLOR[row.placement] ?? 'default'}
            variant={row.placement === 1 ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        );
      }
    },
    {
      field: 'athleteName',
      headerName: 'Athlete',
      flex: 2,
      minWidth: 220,
      renderCell: ({ row }) => {
        if (row._isGroupHeader) {
          // Group header cell — spans visually via styling applied on the row
          return (
            <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
              <IconTrophy size={16} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                {row.category}
              </Typography>
            </Stack>
          );
        }
        return <Typography variant="body2">{row.athleteName}</Typography>;
      }
    },
    {
      field: 'countryCode',
      headerName: 'Country',
      width: 90,
      renderCell: ({ row }) => {
        if (row._isGroupHeader) return null;
        return <Typography variant="body2">{row.countryCode}</Typography>;
      }
    },
    {
      field: 'clubName',
      headerName: 'Club',
      flex: 1.5,
      minWidth: 200,
      renderCell: ({ row }) => {
        if (row._isGroupHeader) return null;
        return <Typography variant="body2" noWrap>{row.clubName}</Typography>;
      }
    },
    {
      field: 'weightClass',
      headerName: 'Weight',
      width: 90,
      renderCell: ({ row }) => {
        if (row._isGroupHeader) return null;
        return (
          <Chip label={row.weightClass} size="small" variant="outlined" />
        );
      }
    }
  ];

  // ── Row class ─────────────────────────────────────────────────────────────────

  function getRowClassName(params) {
    return params.row._isGroupHeader ? 'row--group-header' : '';
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <MainCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
          <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
            <IconTrophy size={22} />
            <Typography variant="h4">{data?.title ?? 'Competition Results'}</Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<IconArrowLeft size={16} />}
            onClick={() => navigate('/admin/competitions')}
            variant="outlined"
          >
            Back to Imports
          </Button>
        </Stack>
      }
    >
      {data?.tournament && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {data.tournament}
        </Typography>
      )}

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageError('')}>{pageError}</Alert>
      )}

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          getRowClassName={getRowClassName}
          getRowHeight={({ row }) => (row._isGroupHeader ? 40 : 52)}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
          slots={{ toolbar: ResultsToolbar }}
          slotProps={{
            toolbar: {
              filterGender,
              filterWeight,
              genders,
              weights,
              onGenderChange: setFilterGender,
              onWeightChange: setFilterWeight
            }
          }}
          sx={{
            // Group header row styling — mimics DevExtreme record grouping
            '& .row--group-header': {
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.04)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.06)'
              },
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              fontWeight: 700
            },
            '& .MuiDataGrid-cell': { alignItems: 'center' },
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.paper' }
          }}
        />
      </Box>
    </MainCard>
  );
}
