import { useState, useMemo } from 'react';
import { filterData, getSorting } from '../utils/exportUtils';

const useTableData = ({ data = [], defaultSortKey = '', defaultFilterValues = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(defaultFilterValues);
  const [orderBy, setOrderBy] = useState(defaultSortKey);
  const [order, setOrder] = useState('asc');

  // Handle search term change
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle sort change
  const handleSort = (field) => {
    const isAsc = orderBy === field && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(field);
  };

  // Filtered and sorted data
  const processedData = useMemo(() => {
    // First apply filters and search
    let result = filterData(data, searchTerm, filters);
    
    // Then sort
    if (orderBy) {
      result = [...result].sort(getSorting(order, orderBy));
    }
    
    return result;
  }, [data, searchTerm, filters, order, orderBy]);

  return {
    filteredData: processedData,
    searchTerm,
    filters,
    order,
    orderBy,
    handleSearchChange,
    handleFilterChange,
    handleSortChange: handleSort
  };
};

export default useTableData;
