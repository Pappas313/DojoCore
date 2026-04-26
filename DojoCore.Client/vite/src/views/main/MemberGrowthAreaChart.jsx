import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third party
import Chart from 'react-apexcharts';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import useConfig from 'hooks/useConfig';
import { gridSpacing } from 'store/constant';
import baseChartOptions from './chart-data/member-growth-area-chart';

// ==============================|| MAIN PAGE - MEMBER GROWTH AREA CHART ||============================== //

const status = [
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

const monthlySeries = [
  { name: 'Athletes', data: [31, 40, 28, 51, 42, 109, 100, 87, 62, 71, 95, 110] },
  { name: 'Coaches', data: [11, 32, 45, 32, 34, 52, 41, 35, 28, 40, 47, 55] }
];

const yearlySeries = [
  { name: 'Athletes', data: [210, 345, 420, 510, 590, 680] },
  { name: 'Coaches', data: [90, 120, 155, 200, 240, 285] }
];

const yearlyCategories = ['2019', '2020', '2021', '2022', '2023', '2024'];
const monthlyCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MemberGrowthAreaChart({ isLoading }) {
  const theme = useTheme();
  const {
    state: { fontFamily }
  } = useConfig();

  const [value, setValue] = useState('month');
  const [series, setSeries] = useState(monthlySeries);
  const [chartOptions, setChartOptions] = useState(baseChartOptions);

  const primaryMain = theme.vars.palette.primary.main;
  const secondaryMain = theme.vars.palette.secondary.main;
  const textPrimary = theme.vars.palette.text.primary;
  const divider = theme.vars.palette.divider;
  const grey500 = theme.vars.palette.grey[500];

  useEffect(() => {
    const categories = value === 'year' ? yearlyCategories : monthlyCategories;

    setChartOptions({
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, fontFamily },
      colors: [primaryMain, secondaryMain],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 100]
        }
      },
      xaxis: {
        ...baseChartOptions.xaxis,
        categories,
        labels: { style: { colors: textPrimary } }
      },
      yaxis: { labels: { style: { colors: [grey500] } } },
      grid: { borderColor: divider, strokeDashArray: 4 },
      legend: {
        ...baseChartOptions.legend,
        labels: { colors: textPrimary }
      }
    });

    setSeries(value === 'year' ? yearlySeries : monthlySeries);
  }, [value, fontFamily, primaryMain, secondaryMain, textPrimary, divider, grey500]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: gridSpacing }}>
            <Box>
              <Typography variant="h4">Member Growth</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                Athletes &amp; Coaches registered over time
              </Typography>
            </Box>
            <TextField size="small" select value={value} onChange={(e) => setValue(e.target.value)}>
              {status.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Chart options={chartOptions} series={series} type="area" height={350} />
        </MainCard>
      )}
    </>
  );
}

MemberGrowthAreaChart.propTypes = { isLoading: PropTypes.bool };
