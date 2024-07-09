import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'published',
    headerName: 'Published Date',
    width: 150,
    editable: false,
  },
  {
    field: 'lastModified',
    headerName: 'Last Modified Date',
    width: 150,
    editable: false,
  },
  {
    field: 'severity',
    headerName: 'Severity',
    width: 150,
    editable: false,
    renderCell: (params) => {
      const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      return (
        <span>
          {validSeverities.includes(params.value) ? params.value : 'N/A'}
        </span>
      );
    },
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 300,
    editable: true,
    renderCell: (params) => (
      <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
        {params.value}
      </div>
    ),
  },
  {
    field: 'references',
    headerName: 'References',
    width: 300,
    editable: false,
    renderCell: (params) => (
      <div>
        {params.value.map((url, index) => (
          <div key={index}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          </div>
        ))}
      </div>
    ),
  },
];

export function CVEDashboard() {
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    // Make a request to the FastAPI backend
    axios.get('http://localhost:8000/surface-web/cves-from-es')
      .then((response) => {
        console.log('Response data:', response.data);
        if (Array.isArray(response.data.cves)) {
          const cveData = response.data.cves.map((item) => ({
            id: item.cve.id,
            published: item.cve.published,
            lastModified: item.cve.lastModified,
            severity: item.cve.metrics?.cvssMetricV2[0]?.baseSeverity || 'N/A',
            description: item.cve.descriptions.find(desc => desc.lang === 'en')?.value || 'N/A',
            references: item.cve.references.map(ref => ref.url),
          }));
          console.log('CVE data:', cveData);
          setRows(cveData);
        } else {
          console.error('Expected an array but got:', response.data.cves);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
