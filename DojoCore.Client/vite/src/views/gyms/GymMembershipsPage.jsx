import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// assets
import {
  IconBuildingStore,
  IconChevronDown,
  IconChevronRight,
  IconSearch,
  IconUsers
} from '@tabler/icons-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

const COLS = 4; // Role | Username | Email | Status

const STATUS_MAP = {
  0: { label: 'Pending',   color: 'warning'   },
  1: { label: 'Active',    color: 'success'   },
  2: { label: 'Inactive',  color: 'default'   },
  3: { label: 'Suspended', color: 'error'     }
};

const ROLE_COLOR = { Coach: 'primary', Manager: 'secondary', Athlete: 'info' };

function getInitials(username = '') {
  return username.slice(0, 2).toUpperCase();
}

function matchesTerm(str = '', term = '') {
  return str.toLowerCase().includes(term.toLowerCase());
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

function Toolbar({ search, onSearch, onExpandAll, onCollapseAll }) {
  const { t } = useTranslation('common');
  return (
    <Stack
      direction="row"
      sx={{ px: 2, py: 1, gap: 1, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Stack direction="row" sx={{ gap: 1 }}>
        <Button size="small" variant="outlined" onClick={onExpandAll}>{t('Expand All', 'Expand All')}</Button>
        <Button size="small" variant="outlined" onClick={onCollapseAll}>{t('Collapse All', 'Collapse All')}</Button>
      </Stack>
      <TextField
        size="small"
        placeholder={t('Search gyms or members…', 'Search gyms or members…')}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        sx={{ minWidth: 240 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start"><IconSearch size={16} /></InputAdornment>
            )
          }
        }}
      />
    </Stack>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function GymMembershipsPage() {
  const { t } = useTranslation('common');
  const [gyms, setGyms]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    fetch('/api/gyms/mine/members', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const raw = Array.isArray(data) ? data : (data?.gyms ?? data?.items ?? data?.data ?? []);
        // API returns { gyms: [{ gym: {...}, coaches, managers, athletes }] } — flatten
        const list = raw.map((item) => ({
          ...item.gym,
          coaches:  item.coaches  ?? [],
          managers: item.managers ?? [],
          athletes: item.athletes ?? []
        }));
        setGyms(list);
        setExpanded(new Set(list.map((g) => g.id)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return gyms;
    return gyms
      .map((gym) => {
        const nameMatch = matchesTerm(gym.name, search) || matchesTerm(gym.gymCode ?? '', search);
        const fCoaches  = (gym.coaches  ?? []).filter((m) => matchesTerm(m.username, search) || matchesTerm(m.email, search));
        const fManagers = (gym.managers ?? []).filter((m) => matchesTerm(m.username, search) || matchesTerm(m.email, search));
        const fAthletes = (gym.athletes ?? []).filter((m) => matchesTerm(m.username, search) || matchesTerm(m.email, search));
        if (!nameMatch && !fCoaches.length && !fManagers.length && !fAthletes.length) return null;
        return {
          ...gym,
          coaches:  nameMatch ? (gym.coaches  ?? []) : fCoaches,
          managers: nameMatch ? (gym.managers ?? []) : fManagers,
          athletes: nameMatch ? (gym.athletes ?? []) : fAthletes
        };
      })
      .filter(Boolean);
  }, [gyms, search]);

  const toggleExpanded = useCallback((gymId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(gymId)) next.delete(gymId); else next.add(gymId);
      return next;
    });
  }, []);

  const expandAll   = useCallback(() => setExpanded(new Set(filtered.map((g) => g.id))), [filtered]);
  const collapseAll = useCallback(() => setExpanded(new Set()), []);

  const totalMembers = gyms.reduce(
    (acc, g) => acc + (g.coaches?.length ?? 0) + (g.managers?.length ?? 0) + (g.athletes?.length ?? 0),
    0
  );

  return (
    <MainCard
      title={
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <IconUsers size={22} />
          <Typography variant="h3">{t('Gym Memberships', 'Gym Memberships')}</Typography>
          {!loading && (
            <Chip label={`${gyms.length} gyms · ${totalMembers} members`} size="small" variant="outlined" />
          )}
        </Stack>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      {/* Group Panel — mimics DevExtreme group panel bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 0.75,
          bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.06)',
          border: '1px solid',
          borderColor: 'divider',
          borderBottom: 0,
          borderRadius: '8px 8px 0 0'
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>{t('Grouped by:', 'Grouped by:')}</Typography>
        <Chip label={t('Gym', 'Gym')} size="small" icon={<IconBuildingStore size={13} />} color="primary" variant="outlined" />
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
        <Toolbar search={search} onSearch={setSearch} onExpandAll={expandAll} onCollapseAll={collapseAll} />

        {loading ? (
          <Stack sx={{ alignItems: 'center', py: 6 }}><CircularProgress /></Stack>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 120 }}>{t('Role', 'Role')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('Username', 'Username')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('Email', 'Email')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 130 }}>{t('Status', 'Status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLS} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      {search ? t('No results match your search.', 'No results match your search.') : t('No gyms found.', 'No gyms found.')}
                    </TableCell>
                  </TableRow>
                ) : filtered.map((gym) => {
                  const gymId      = gym.id;
                  const isExpanded = expanded.has(gymId);
                  const coaches    = gym.coaches  ?? [];
                  const managers   = gym.managers ?? [];
                  const athletes   = gym.athletes ?? [];
                  const allMembers = [
                    ...coaches.map( (m, i) => ({ ...m, _key: `${gymId}-c-${i}`, _role: 'Coach'   })),
                    ...managers.map((m, i) => ({ ...m, _key: `${gymId}-m-${i}`, _role: 'Manager' })),
                    ...athletes.map((m, i) => ({ ...m, _key: `${gymId}-a-${i}`, _role: 'Athlete' }))
                  ];

                  return (
                    <Fragment key={gymId}>
                      {/* ── Group header row ── */}
                      <TableRow
                        onClick={() => toggleExpanded(gymId)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.06)',
                          '&:hover': { bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.12) !important' }
                        }}
                      >
                        <TableCell colSpan={COLS} sx={{ py: 1.25 }}>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                            {isExpanded
                              ? <IconChevronDown  size={16} style={{ flexShrink: 0 }} />
                              : <IconChevronRight size={16} style={{ flexShrink: 0 }} />
                            }
                            <IconBuildingStore size={16} style={{ flexShrink: 0 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {t('Gym: {{name}}', 'Gym: {{name}}', { name: gym.name ?? gym.gymName ?? '—' })}
                            </Typography>
                            {gym.gymCode && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                ({gym.gymCode})
                              </Typography>
                            )}
                            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.75 }}>
                              {coaches.length  > 0 && <Chip label={t('{{n}} coaches', '{{n}} coaches', { n: coaches.length })}   size="small" color="primary"   variant="outlined" />}
                              {managers.length > 0 && <Chip label={t('{{n}} managers', '{{n}} managers', { n: managers.length })} size="small" color="secondary" variant="outlined" />}
                              {athletes.length > 0 && <Chip label={t('{{n}} athletes', '{{n}} athletes', { n: athletes.length })} size="small" color="info"      variant="outlined" />}
                              {allMembers.length === 0 && <Chip label={t('No members', 'No members')} size="small" variant="outlined" />}
                            </Box>
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* ── Member rows ── */}
                      {isExpanded && allMembers.map((m) => {
                        const status = STATUS_MAP[m.status] ?? { label: 'Unknown', color: 'default' };
                        return (
                          <TableRow key={m._key} hover>
                            <TableCell sx={{ py: 0.75 }}>
                              <Chip label={t(m._role, m._role)} color={ROLE_COLOR[m._role] ?? 'default'} size="small" />
                            </TableCell>
                            <TableCell sx={{ py: 0.75 }}>
                              <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                                  {getInitials(m.username)}
                                </Avatar>
                                <Typography variant="body2">{m.username}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ py: 0.75 }}>
                              <Typography variant="body2" color="text.secondary">{m.email}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 0.75 }}>
                              <Chip label={t(status.label, status.label)} color={status.color} size="small" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </MainCard>
  );
}
