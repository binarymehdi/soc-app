"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { ArrowClockwise as RefreshIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';

import { config } from '@/config';
import { CvesFilters } from '@/components/dashboard/cve/cves-filters';
import { CvesTable } from '@/components/dashboard/cve/cves-table';
import type { Cves } from '@/components/dashboard/customer/customers-table';
import { useEffect, useState } from 'react';
import axios from "axios";

const CACHE_KEY = 'cachedCveData';
const CACHE_EXPIRATION = 1000 * 60 * 10; // 10 minutes

export default function Page(): React.JSX.Element {
  const [cves, setCves] = useState<Cves[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [attackVector, setAttackVector] = useState<string>('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (parsedData.timestamp > Date.now() - CACHE_EXPIRATION) {
            setCves(parsedData.cves);
            setLoading(false);
            return;
          }
        }

        const response = await axios.get('/api/surface-web/cves');
        const cveData = response.data.cves;

        if (Array.isArray(cveData)) {
          const transformedData = cveData.map((item: any) => {
            const cvssMetric = item.cve.metrics.cvssMetricV31?.[0]?.cvssData || {};
            return {
              id: item.cve.id,
              source: item.cve.sourceIdentifier,
              amount: 0,
              severity: cvssMetric.baseSeverity || 'UNKNOWN',
              attackVector: cvssMetric.attackVector || 'UNKNOWN',
              createdAt: new Date(item.cve.published),
            };
          });

          setCves(transformedData);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), cves: transformedData }));
        } else {
          console.error('Data is not in expected format:', cveData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching CVEs:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSeverityChange = (severity: string) => {
    setSeverity(severity);
  };
  const handleAccessChange = (attackVector: string) => {
    setAttackVector(attackVector);
  };

  const filteredCves = cves.filter(cve =>
    (cve.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cve.source.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (severity === '' || cve.severity === severity) && (attackVector === '' || cve.attackVector === attackVector)
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Cves</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
              Import
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
              Export
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button startIcon={<RefreshIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Refresh
          </Button>
        </div>
      </Stack>
      <CvesFilters onSearchChange={handleSearchChange} onSeverityChange={handleSeverityChange} onAccessChange={handleAccessChange}/>
      <CvesTable
        count={filteredCves.length}
        page={page}
        rows={filteredCves}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Stack>
  );
}
