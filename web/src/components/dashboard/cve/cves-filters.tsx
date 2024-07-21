import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MenuItem, Select, FormControl, InputLabel, Box } from '@mui/material';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

interface CvesFiltersProps {
  onSearchChange: (query: string) => void;
  onSeverityChange: (severity: string) => void;
  onAccessChange: (access: string) => void;
}

export function CvesFilters({ onSearchChange, onSeverityChange, onAccessChange }: CvesFiltersProps): React.JSX.Element {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleSeverityChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onSeverityChange(event.target.value as string);
  };

  const handleAccessChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onAccessChange(event.target.value as string);
  };

  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <OutlinedInput
          defaultValue=""
          fullWidth
          placeholder="Search CVE"
          startAdornment={
            <InputAdornment position="start">
              <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
            </InputAdornment>
          }
          sx={{ maxWidth: '500px' }}
          onChange={handleInputChange}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="severity-label">Severity</InputLabel>
          <Select
            labelId="severity-label"
            id="severity-select"
            onChange={handleSeverityChange}
            label="Severity"
            defaultValue=""
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="LOW">LOW</MenuItem>
            <MenuItem value="MEDIUM">MEDIUM</MenuItem>
            <MenuItem value="HIGH">HIGH</MenuItem>
            <MenuItem value="CRITICAL">CRITICAL</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 190 }}>
          <InputLabel id="Access-label">Required Access</InputLabel>
          <Select
            labelId="Access-label"
            id="Access-select"
            onChange={handleAccessChange}
            label="Required Access"
            defaultValue=""
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="LOCAL">LOCAL</MenuItem>
            <MenuItem value="NETWORK">NETWORK</MenuItem>
            <MenuItem value="ADJACENT_NETWORK">ADJACENT NETWORK</MenuItem>
            <MenuItem value="PHYSICAL">PHYSICAL</MenuItem>
            <MenuItem value="UNKNOWN">UNKNOWN</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Card>
  );
}
