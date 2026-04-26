// ==============================|| MAIN PAGE - MEMBER GROWTH AREA CHART ||============================== //

const chartOptions = {
  chart: {
    height: 350,
    type: 'area',
    toolbar: { show: false }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    type: 'category',
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  legend: {
    show: true,
    position: 'bottom',
    offsetX: 20,
    labels: { useSeriesColors: false },
    markers: { size: 8, shape: 'circle', strokeWidth: 0 },
    itemMargin: { horizontal: 15, vertical: 8 }
  },
  tooltip: { x: { show: true } }
};

export default chartOptions;
