import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Add the autoTable plugin to jsPDF
jsPDF.API.autoTable = autoTable;

const COMPANY_INFO = {
  name: 'Wango Holdings Limited',
  email: 'info@wangoholdings.com',
  phone: '+254 700 000 000',
  website: 'www.wangoholdings.com',
  address: 'Nairobi, Kenya'
};

// Function to create PDF header with logo and company info
const addPDFHeader = (doc) => {
  // Add company name
  doc.setFontSize(20);
  doc.setTextColor(0, 100, 0); // Dark green
  doc.text(COMPANY_INFO.name, doc.internal.pageSize.width / 2, 20, { align: 'center' });

  // Add contact info
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(COMPANY_INFO.email, doc.internal.pageSize.width / 2, 30, { align: 'center' });
  doc.text(COMPANY_INFO.phone, doc.internal.pageSize.width / 2, 35, { align: 'center' });
  doc.text(COMPANY_INFO.website, doc.internal.pageSize.width / 2, 40, { align: 'center' });
  doc.text(COMPANY_INFO.address, doc.internal.pageSize.width / 2, 45, { align: 'center' });

  // Add decorative line
  doc.setDrawColor(0, 100, 0); // Dark green
  doc.setLineWidth(0.5);
  doc.line(20, 50, doc.internal.pageSize.width - 20, 50);
};

// Filter data based on search term and filters
export const filterData = (data = [], searchTerm = '', filters = {}) => {
  // Ensure data is an array
  if (!Array.isArray(data)) {
    console.warn('filterData received non-array data:', data);
    return [];
  }

  return data.filter(item => {
    // Search term filtering
    const searchMatch = !searchTerm || Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filters
    const filterMatch = Object.entries(filters).every(([key, value]) => {
      return !value || item[key] === value || 
             (item[key] && String(item[key]).toLowerCase() === String(value).toLowerCase());
    });

    return searchMatch && filterMatch;
  });
};

// Function to create PDF footer
const addPDFFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.height;
  
  // Add gradient pattern
  doc.setFillColor(0, 100, 0); // Green background
  doc.rect(0, pageHeight - 20, doc.internal.pageSize.width, 20, 'F');
  
  // Add page number
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(
    `Page ${doc.internal.getNumberOfPages()}`,
    doc.internal.pageSize.width / 2,
    pageHeight - 10,
    { align: 'center' }
  );
};

export const exportToPDF = (data, columns, title) => {
  // Initialize jsPDF with default font
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });
  
  // Add header
  addPDFHeader(doc);
  
  // Add title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, doc.internal.pageSize.width / 2, 65, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    doc.internal.pageSize.width - 20,
    75,
    { align: 'right' }
  );
  
  // Create table
  doc.autoTable({
    head: [columns.map(col => col.label)],
    body: data.map(row => columns.map(col => row[col.id])),
    startY: 80,
    margin: { top: 80 },
    styles: {
      fontSize: 8,
      font: 'helvetica', // Use a standard PDF font
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [0, 100, 0], // Dark green header
      textColor: [255, 255, 255],
      fontSize: 9,
      font: 'helvetica-bold',
    },
    didDrawPage: function(data) {
      addPDFFooter(doc);
    },
    tableWidth: 'auto',
    theme: 'grid'
  });
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (data, columns, title) => {
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(
    data.map(row => {
      const newRow = {};
      columns.forEach(col => {
        newRow[col.label] = row[col.id];
      });
      return newRow;
    })
  );
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
  // Save the file
  XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Function to help with sorting
export const getSorting = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
    : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
};
