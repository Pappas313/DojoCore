import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

// project imports — stat cards
import StatsAthleteCard from 'views/main/StatsAthleteCard';
import StatsCoachCard from 'views/main/StatsCoachCard';
import StatsManagerCard from 'views/main/StatsManagerCard';
import StatsGymCard from 'views/main/StatsGymCard';

// project imports — diagrams & lists
import MemberStatsBarChart from 'views/main/MemberStatsBarChart';
import AthleteNamesCard from 'views/main/AthleteNamesCard';
import MemberGrowthAreaChart from 'views/main/MemberGrowthAreaChart';
import RecentRegistrationsCard from 'views/main/RecentRegistrationsCard';

import { getDashboardStats } from 'api/dashboard';
import { gridSpacing } from 'store/constant';

// assets
import dashboardBg from 'assets/images/auth/dojo-bg.jpg';

// ==============================|| DASHBOARD STATS ||============================== //

export default function DashboardStats() {
  const [isLoading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box
      sx={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88)), url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: 2,
        p: { xs: 2, sm: 3 }
      }}
    >
      <Grid container spacing={gridSpacing}>
        {/* ── Row 1: Count stat cards ───────────────────────────────── */}
        <Grid size={12}>
          <Grid container spacing={gridSpacing}>
            <Grid size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
              <StatsAthleteCard isLoading={isLoading} count={stats?.athleteCount ?? 0} />
            </Grid>
            <Grid size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
              <StatsCoachCard isLoading={isLoading} count={stats?.coachCount ?? 0} />
            </Grid>
            <Grid size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
              <StatsManagerCard isLoading={isLoading} count={stats?.managerCount ?? 0} />
            </Grid>
            <Grid size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
              <StatsGymCard isLoading={isLoading} count={stats?.gymCount ?? 0} />
            </Grid>
          </Grid>
        </Grid>

        {/* ── Row 2: Combined bar chart + athlete names list ────────── */}
        <Grid size={12}>
          <Grid container spacing={gridSpacing}>
            <Grid size={{ xs: 12, md: 8 }}>
              <MemberStatsBarChart isLoading={isLoading} stats={stats} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <AthleteNamesCard isLoading={isLoading} athletes={stats?.athletes ?? []} />
            </Grid>
          </Grid>
        </Grid>

        {/* ── Row 3: Analytics — area chart + recent registrations ──── */}
        <Grid size={12}>
          <Grid container spacing={gridSpacing}>
            <Grid size={{ xs: 12, md: 8 }}>
              <MemberGrowthAreaChart isLoading={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <RecentRegistrationsCard isLoading={isLoading} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
