'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { Desktop as DesktopIcon } from '@phosphor-icons/react/dist/ssr/Desktop';
import { DeviceTablet as DeviceTabletIcon } from '@phosphor-icons/react/dist/ssr/DeviceTablet';
import { Phone as PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';
import { InputLabel, MenuItem, Select } from "@mui/material";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";

const iconMapping = { Desktop: DesktopIcon, Tablet: DeviceTabletIcon, Phone: PhoneIcon } as Record<string, Icon>;

export interface TrafficProps {
  chartSeries: number[];
  labels: string[];
  sx?: SxProps;
}

export function Traffic({ chartSeries, labels, sx }: TrafficProps): React.JSX.Element {
  const [selectedDateRange, setSelectedDateRange] = React.useState('0');
  const [currentSeries, setCurrentSeries] = React.useState(chartSeries);
  const chartOptions = useChartOptions(labels);

  const handleDateRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedRange = event.target.value as string;
    setSelectedDateRange(selectedRange);

    let newSeries;
    switch (selectedRange) {
      case '0':
        newSeries = [30, 50, 20, 60, 20];
        break;
      case '1':
        newSeries = [40, 30, 30, 10, 20];
        break;
      case '2':
        newSeries = [20, 60, 20, 10, 40];
        break;
      case '3':
        newSeries = [25, 25, 50, 20, 20];
        break;
      case '4':
        newSeries = [10, 40, 50, 60, 20];
        break;
      default:
        newSeries = chartSeries;
    }

    setCurrentSeries(newSeries);
  };

  return (
    <Card sx={sx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
        <CardHeader title="Severity Distribution" sx={{ padding: 0 }} />
        <FormControl sx={{ minWidth: 50 }} size="small">
          <InputLabel id="date-label">Last</InputLabel>
          <Select
            labelId="date-label"
            id="date-select"
            value={selectedDateRange}
            onChange={handleDateRangeChange}
            label="Date"
          >
            <MenuItem value="0">24h</MenuItem>
            <MenuItem value="1">Week</MenuItem>
            <MenuItem value="2">Month</MenuItem>
            <MenuItem value="3">3 Months</MenuItem>
            <MenuItem value="4">Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <CardContent>
        <Stack spacing={2}>
          <Chart height={300} options={chartOptions} series={currentSeries} type="donut" width="100%" />
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {currentSeries.map((item, index) => {
              const label = labels[index];
              const Icon = iconMapping[label];

              return (
                <Stack key={label} spacing={1} sx={{ alignItems: 'center' }}>
                  <Box sx={{ backgroundColor: chartOptions.colors[index], height: '10px', width: '10px', borderRadius: '50%' }}></Box>
                  <Typography variant="h6">{label}</Typography>
                  <Typography color="text.secondary" variant="subtitle2">
                    {item}%
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: ['#f44336', '#ff9800', '#fbc02d', '#4caf50', '#bbbbbb'],
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false } },
    states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };
}
