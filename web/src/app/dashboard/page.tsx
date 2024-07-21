"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { LatestCves } from '@/components/dashboard/overview/latest-cves';
import { Sales } from '@/components/dashboard/overview/sales';
import { Traffic } from '@/components/dashboard/overview/traffic';
import { CveCard } from "@/components/dashboard/overview/cve-card";

interface Cve {
  id: string;
  source: string;
  amount: number;
  severity: string;
  attackVector: string;
  createdAt: Date;
}

const CACHE_KEY = 'cachedLatestCveData';
const CACHE_EXPIRATION = 1000 * 60 * 10; // 10 minutes

export default function Page(): React.JSX.Element {
  const [cves, setCves] = useState<Cve[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

        const response = await axios.get('/api/surface-web/cves-from-es');
        const cveData = response.data.cves;  // Access the 'cves' array

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

          const sortedCveData = transformedData.sort((a: Cve, b: Cve) => b.createdAt.getTime() - a.createdAt.getTime());
          const lastSixCves = sortedCveData.slice(0, 6);

          setCves(lastSixCves);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), cves: lastSixCves }));
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <CveCard diff={12} trend="up" sx={{ height: '100%' }} title="Total Critical CVEs" value="122" severity="CRITICAL" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <CveCard diff={12} trend="up" sx={{ height: '100%' }} title="Total HIGH CVEs" value="144" severity="HIGH" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <CveCard diff={12} trend="up" sx={{ height: '100%' }} title="Total MEDIUM CVEs" value="767" severity="MEDIUM" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <CveCard diff={12} trend="up" sx={{ height: '100%' }} title="Total LOW CVEs" value="2300" severity="LOW" />
      </Grid>
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: 'Last year', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <Traffic chartSeries={[63, 15, 22,10,10]} labels={['Critical', 'High','Medium', 'Low','Unknown']} sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <LatestCves cves={cves.map(cve => ({
          ...cve,
          createdAt: dayjs(cve.createdAt).toDate()
        }))} sx={{ height: '100%' }} />
      </Grid>
    </Grid>
  );
}
