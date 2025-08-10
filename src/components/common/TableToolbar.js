import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Toolbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  GetApp as GetAppIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const TableToolbar = props => {
  const {
    title,
    data,
    columns,
    searchTerm,
    onSearchChange,
    filters,
    onFilterChange,
    filterOptions,
  } = props;
  const handleExportPDF = () => {
    exportToPDF(data, columns, title);
  };

  const handleExportExcel = () => {
    exportToExcel(data, columns, title);
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        bgcolor: (theme) => theme.palette.grey[100],
      }}
    >
      <Box sx={{ flex: '1 1 100%' }} display="flex" alignItems="center" gap={2}>
        {/* Search field */}
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
        />

        {/* Filters */}
        {filterOptions && filterOptions.map((option) => (
          <FormControl key={option.field} size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{option.label}</InputLabel>
            <Select
              value={filters[option.field] || ''}
              onChange={(e) => onFilterChange(option.field, e.target.value)}
              label={option.label}
            >
              <MenuItem value="">All</MenuItem>
              {option.values.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>

      {/* Export buttons */}
      <Box>
        <Tooltip title="Export to Excel">
          <IconButton onClick={handleExportExcel}>
            <GetAppIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Export to PDF">
          <IconButton onClick={handleExportPDF}>
            <GetAppIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Toolbar>
  );
};

export default TableToolbar;
