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

interface CvesCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
}

interface CvesPercentage {
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
}

const CACHE_KEY = 'CveCachedData';
const CACHE_EXPIRATION = 1000 * 60 * 10; // 10 minutes

export default function Page(): React.JSX.Element {
  const [cves, setCves] = useState<Cve[]>([]);
  const [cvescount, setCvesCount] = useState<CvesCount[][]>([]);
  const [cvespercentage, setCvesPercentage] = useState<CvesPercentage[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (parsedData.timestamp > Date.now() - CACHE_EXPIRATION) {
            setCves(parsedData.cves);
            setCvesCount(parsedData.cvescount);
            setCvesPercentage(parsedData.cvespercentage);
            setLoading(false);
            return;
          }
        }

        const response = await axios.get('/api/surface-web/cves');
        const cveData = response.data.cves; // Access the 'cves' array

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

          const cves1 = await axios.get('/api/surface-web/severity_counts/?date_filter=24h');
          const cves2 = await axios.get('/api/surface-web/severity_counts/?date_filter=week');
          const cves3 = await axios.get('/api/surface-web/severity_counts/?date_filter=month');
          const cves4 = await axios.get('/api/surface-web/severity_counts/?date_filter=3months');
          const cves5 = await axios.get('/api/surface-web/severity_counts/?date_filter=year');
          const cvesPercent1 = await axios.get('/api/surface-web/severity_counts/?date_filter=24h&return_percent=True');
          const cvesPercent2 = await axios.get('/api/surface-web/severity_counts/?date_filter=week&return_percent=True');
          const cvesPercent3 = await axios.get('/api/surface-web/severity_counts/?date_filter=month&return_percent=True');
          const cvesPercent4 = await axios.get('/api/surface-web/severity_counts/?date_filter=3months&return_percent=True');
          const cvesPercent5 = await axios.get('/api/surface-web/severity_counts/?date_filter=year&return_percent=True');

          const cvesCountData: CvesCount[][] = [
            cves1.data,
            cves2.data,
            cves3.data,
            cves4.data,
            cves5.data,
          ];

          const cvesPercentageData: CvesPercentage[][] = [
            cvesPercent1.data,
            cvesPercent2.data,
            cvesPercent3.data,
            cvesPercent4.data,
            cvesPercent5.data,
          ];

          setCvesCount(cvesCountData);
          setCvesPercentage(cvesPercentageData);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), cves: lastSixCves, cvescount: cvesCountData, cvespercentage: cvesPercentageData }));
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
        <CveCard diff={12} trend="up" sx={{ height: '100%' }} title="Total Critical CVEs" value={`${cvescount[0]?.critical ?? 0}`} severity="CRITICAL" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <CveCard diff={12} trend="up" sx={{ height: '100%' }} title="Total HIGH CVEs" value={`${cvescount[0]?.high ?? 0}`} severity="HIGH" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <CveCard diff={12} trend="up" sx={{ height: '100%' }} title="Total MEDIUM CVEs" value={`${cvescount[0]?.medium ?? 0}`} severity="MEDIUM" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <CveCard diff={12} trend="up" sx={{ height: '100%' }} title="Total LOW CVEs" value={`${cvescount[0]?.low ?? 0}`} severity="LOW" />
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
        <Traffic chartSeries={[cvespercentage[0]?.critical ?? 0, cvespercentage[0]?.high ?? 0, cvespercentage[0]?.medium ?? 0, cvespercentage[0]?.low ?? 0, cvespercentage[0]?.unknown ?? 0]} labels={['Critical', 'High', 'Medium', 'Low', 'Unknown']} sx={{ height: '100%' }} />
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
