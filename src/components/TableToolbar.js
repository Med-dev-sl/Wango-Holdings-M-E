import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Button,
  Typography,
  Tooltip,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

const TableToolbar = ({
  title,
  searchTerm,
  onSearchChange,
  filters = [],
  onFilterChange,
  sortOptions = [],
  onSortChange,
  exportColumns,
  data,
  onExportPDF,
  onExportExcel
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setFilterAnchorEl(null);
    setSortAnchorEl(null);
    setExportAnchorEl(null);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">{title}</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {filters.length > 0 && (
            <>
              <Tooltip title="Filter">
                <IconButton onClick={handleFilterClick}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleClose}
              >
                {filters.map((filter) => (
                  <MenuItem
                    key={filter.key}
                    onClick={() => {
                      onFilterChange(filter.key);
                      handleClose();
                    }}
                  >
                    {filter.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {sortOptions.length > 0 && (
            <>
              <Tooltip title="Sort">
                <IconButton onClick={handleSortClick}>
                  <SortIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={sortAnchorEl}
                open={Boolean(sortAnchorEl)}
                onClose={handleClose}
              >
                {sortOptions.map((option) => (
                  <MenuItem
                    key={option.key}
                    onClick={() => {
                      onSortChange(option.key);
                      handleClose();
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {(onExportPDF || onExportExcel) && (
            <>
              <Tooltip title="Export">
                <IconButton onClick={handleExportClick}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={handleClose}
              >
                {onExportPDF && (
                  <MenuItem
                    onClick={() => {
                      onExportPDF(data, exportColumns, title);
                      handleClose();
                    }}
                  >
                    <PictureAsPdfIcon sx={{ mr: 1 }} />
                    Export as PDF
                  </MenuItem>
                )}
                {onExportExcel && (
                  <MenuItem
                    onClick={() => {
                      onExportExcel(data, exportColumns, title);
                      handleClose();
                    }}
                  >
                    <TableChartIcon sx={{ mr: 1 }} />
                    Export as Excel
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default TableToolbar;
