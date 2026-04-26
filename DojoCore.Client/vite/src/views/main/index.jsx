import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';

// project imports — statistics widget row (reuse existing dashboard cards)
import EarningCard from 'views/dashboard/Default/EarningCard';
import TotalOrderLineChartCard from 'views/dashboard/Default/TotalOrderLineChartCard';
import TotalIncomeDarkCard from 'ui-component/cards/TotalIncomeDarkCard';
import TotalIncomeLightCard from 'ui-component/cards/TotalIncomeLightCard';
import TotalGrowthBarChart from 'views/dashboard/Default/TotalGrowthBarChart';

// project imports — analytics row (new components)
import MemberGrowthAreaChart from './MemberGrowthAreaChart';
import RecentRegistrationsCard from './RecentRegistrationsCard';

import { gridSpacing } from 'store/constant';

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';

// ==============================|| MAIN PAGE ||============================== //

export default function MainPage() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      {/* ── Row 1: Statistics widgets ─────────────────────────────── */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <EarningCard isLoading={isLoading} />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard isLoading={isLoading} />
          </Grid>
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={gridSpacing}>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeDarkCard isLoading={isLoading} />
              </Grid>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeLightCard
                  isLoading={isLoading}
                  total={203}
                  label="Total Income"
                  icon={<StorefrontTwoToneIcon fontSize="inherit" />}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ── Row 2: Analytics — area chart + recent registrations ──── */}
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

      {/* ── Row 3: Activity bar chart ─────────────────────────────── */}
      <Grid size={12}>
        <TotalGrowthBarChart isLoading={isLoading} />
      </Grid>
    </Grid>
  );
}
