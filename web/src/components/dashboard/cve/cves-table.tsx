'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

import { useSelection } from '@/hooks/use-selection';
import Chip from "@mui/material/Chip";

export interface Cves {
  id: string;
  source: string;
  amount: number;
  attackVector: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: Date;
}

interface CvesTableProps {
  count?: number;
  page?: number;
  rows?: Cves[];
  rowsPerPage?: number;
}

const severityMap = {
  LOW: { label: 'LOW', color: '#4caf50' },
  MEDIUM: { label: 'MEDIUM', color: '#fbc02d' },
  HIGH: { label: 'HIGH', color: '#ff9800' },
  CRITICAL: { label: 'CRITICAL', color: '#f44336' }
} as const;

export function CvesTable({
                            count = 0,
                            rows = [],
                            page = 0,
                            rowsPerPage = 5,
                          }: CvesTableProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = React.useState(page);
  const [currentRowsPerPage, setCurrentRowsPerPage] = React.useState(rowsPerPage);

  const rowIds = React.useMemo(() => {
    return rows.map((cve) => cve.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Required Access</TableCell>
              <TableCell>Severity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(currentPage * currentRowsPerPage, currentPage * currentRowsPerPage + currentRowsPerPage).map((row) => {
              const isSelected = selected?.has(row.id);
              const { label, color } = severityMap[row.severity] ?? { label: 'Unknown', color: '#bbbbbb' };
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.id);
                        } else {
                          deselectOne(row.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>{dayjs(row.createdAt).format('MMM D, YYYY')}</TableCell>
                  <TableCell>{row.attackVector}</TableCell>
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
      <TablePagination
        component="div"
        count={count}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        page={currentPage}
        rowsPerPage={currentRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
