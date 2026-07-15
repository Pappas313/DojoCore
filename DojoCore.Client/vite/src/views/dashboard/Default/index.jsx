import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

// project imports
import StatsAthleteCard from 'views/main/StatsAthleteCard';
import StatsCoachCard from 'views/main/StatsCoachCard';
import StatsManagerCard from 'views/main/StatsManagerCard';
import StatsGymCard from 'views/main/StatsGymCard';

import { getDashboardStats } from 'api/dashboard';
import { gridSpacing } from 'store/constant';

// assets
import dashboardBg from 'assets/images/auth/dojo-bg.jpg';

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
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
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 1.95), rgba(255, 255, 255, 1.95)), url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: 2,
        p: { xs: 2, sm: 3 }
      }}
    >
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
    </Box>
  );
}
