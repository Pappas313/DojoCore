import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third party
import Chart from 'react-apexcharts';

// project imports
import useConfig from 'hooks/useConfig';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// ==============================|| STATS - MEMBER STATS BAR CHART ||============================== //

const baseOptions = {
  chart: {
    type: 'bar',
    height: 280,
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '45%',
      borderRadius: 4
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Athletes', 'Coaches', 'Managers', 'Gyms']
  },
  yaxis: {
    min: 0,
    labels: { formatter: (val) => Math.round(val) }
  },
  fill: { type: 'solid' },
  legend: { show: false },
  tooltip: {
    y: { formatter: (val) => val }
  }
};

export default function MemberStatsBarChart({ isLoading, stats }) {
  const theme = useTheme();
  const {
    state: { fontFamily }
  } = useConfig();

  const [chartOptions, setChartOptions] = useState(baseOptions);

  const textPrimary = theme.vars.palette.text.primary;
  const divider = theme.vars.palette.divider;
  const primary200 = theme.vars.palette.primary[200];
  const primaryDark = theme.vars.palette.primary.dark;
  const secondaryMain = theme.vars.palette.secondary.main;
  const warning = theme.vars.palette.warning.main;

  useEffect(() => {
    setChartOptions({
      ...baseOptions,
      chart: { ...baseOptions.chart, fontFamily },
      colors: [secondaryMain, primary200, warning, primaryDark],
      xaxis: {
        ...baseOptions.xaxis,
        labels: { style: { colors: textPrimary } }
      },
      yaxis: {
        ...baseOptions.yaxis,
        labels: { style: { colors: textPrimary }, formatter: (val) => Math.round(val) }
      },
      grid: { borderColor: divider },
      tooltip: { theme: 'light', y: { formatter: (val) => val } }
    });
  }, [fontFamily, primary200, primaryDark, secondaryMain, warning, textPrimary, divider]);

  const series = [
    {
      name: 'Members',
      data: [
        stats?.athleteCount ?? 0,
        stats?.coachCount ?? 0,
        stats?.managerCount ?? 0,
        stats?.gymCount ?? 0
      ]
    }
  ];

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Stack sx={{ gap: gridSpacing }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack sx={{ gap: 0.5 }}>
                <Typography variant="subtitle2">Member Overview</Typography>
                <Typography variant="h3">
                  {(stats?.athleteCount ?? 0) + (stats?.coachCount ?? 0) + (stats?.managerCount ?? 0)} members · {stats?.gymCount ?? 0} gyms
                </Typography>
              </Stack>
            </Stack>
            <Box>
              <Chart options={chartOptions} series={series} type="bar" height={280} />
            </Box>
          </Stack>
        </MainCard>
      )}
    </>
  );
}

MemberStatsBarChart.propTypes = {
  isLoading: PropTypes.bool,
  stats: PropTypes.shape({
    athleteCount: PropTypes.number,
    coachCount: PropTypes.number,
    managerCount: PropTypes.number,
    gymCount: PropTypes.number
  })
};
