import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const severityMap = {
  LOW: { label: 'LOW', color: '#4caf50' },
  MEDIUM: { label: 'MEDIUM', color: '#fbc02d' },
  HIGH: { label: 'HIGH', color: '#ff9800' },
  CRITICAL: { label: 'CRITICAL', color: '#f44336' }
} as const;

export interface Cve {
  id: string;
  source: string;
  amount: number;
  attackVector: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: Date;
}

export interface LatestCvesProps {
  cves?: Cve[];
  sx?: SxProps;
}

export function LatestCves({ cves = [], sx }: LatestCvesProps): React.JSX.Element {
  const router = useRouter();
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      router.push('/dashboard/cves');
    }
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Latest CVEs" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Source</TableCell>
              <TableCell sortDirection="desc">Date</TableCell>
              <TableCell>Required Access</TableCell>
              <TableCell>Severity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cves.map((cve) => {
              const { label, color } = severityMap[cve.severity] ?? { label: 'Unknown', color: '#bbbbbb' };

              return (
                <TableRow hover key={cve.id}>
                  <TableCell>{cve.id}</TableCell>
                  <TableCell>{cve.source}</TableCell>
                  <TableCell>{dayjs(cve.createdAt).format('MMM D, YYYY')}</TableCell>
                  <TableCell>{cve.attackVector}</TableCell>
                  <TableCell>
                    <Chip sx={{ backgroundColor: color, color: '#ffffff' }} label={label} size="small" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
          onClick={handleClick}
        >
          View all
        </Button>
      </CardActions>
    </Card>
  );
}
