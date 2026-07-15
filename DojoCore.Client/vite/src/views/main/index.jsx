import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

// project imports — stat cards
import StatsAthleteCard from './StatsAthleteCard';
import StatsCoachCard from './StatsCoachCard';
import StatsManagerCard from './StatsManagerCard';
import StatsGymCard from './StatsGymCard';

// api
import { getDashboardStats } from 'api/dashboard';

import { gridSpacing } from 'store/constant';

// assets
import dashboardBg from 'assets/images/auth/dojo-bg.jpg';

// ==============================|| MAIN PAGE ||============================== //

export default function MainPage() {
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
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: 2,
        flexGrow: 1,
        minHeight: 'calc(100vh - 250px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Grid container spacing={gridSpacing} justifyContent="center" sx={{ maxWidth: 1500, width: '100%' }}>
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
    </Box>
  );
}
