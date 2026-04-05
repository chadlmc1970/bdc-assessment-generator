#!/usr/bin/env node
/**
 * Excel to CSV Converter for BDC Assessment Generator
 *
 * Converts 5 Excel files from Loves Travel Stops export into CAP-compatible CSV format.
 * Output files match the naming convention: bdc.assessment-EntityName.csv
 *
 * Usage: node scripts/excel-to-csv.js
 */

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// File mappings: Excel file -> CSV output
const FILES = [
  {
    excel: '/Users/I870089/Downloads/Cloud Systems Table-2026-04-04 22_20_48.xlsx',
    csv: 'db/data/bdc.assessment-CloudSystems.csv',
    entity: 'CloudSystems',
    mapping: {
      'System ID': 'systemId',
      'Customer ID': 'customerId',
      'Customer': 'customerName',
      'Tenant ID': 'tenantId',
      'Entitlement Set ID': 'entitlementSetId',
      'Order ID': 'orderId',
      'Lifecycle Status': 'lifecycleStatus',
      'Business Type': 'businessType',
      'Role': 'systemRole',
      'Solution Area': 'solutionArea',
      'Sub-Solution Area': 'subSolutionArea',
      'Data Center External Description': 'dataCenterExternal',
      'Data Center Internal Description': 'dataCenterInternal',
      'Creation Date': 'createdOn',
      'Main URL': 'mainUrl'
    }
  },
  {
    excel: '/Users/I870089/Downloads/System Landscape Details Table-2026-04-04 22_21_03.xlsx',
    csv: 'db/data/bdc.assessment-OnPremSystems.csv',
    entity: 'OnPremSystems',
    mapping: {
      'System Number': 'systemNumber',
      'Customer ID': 'customerId',
      'System ID': 'systemId',
      'System Name': 'systemName',
      'Installation No.': 'installationNo',
      'System Role': 'systemRole',
      'Solution Area': 'solutionArea',
      'Sub-Solution Area': 'subSolutionArea',
      'Product': 'product',
      'Product ID': 'productId',
      'Product Version': 'productVersion',
      'Product Category': 'productCategory',
      'OS': 'osType',
      'OS Version': 'osVersion',
      'Data Base': 'database'
    }
  },
  {
    excel: '/Users/I870089/Downloads/System Details Table-2026-04-04 22_22_43.xlsx',
    csv: 'db/data/bdc.assessment-SystemDetails.csv',
    entity: 'SystemDetails',
    mapping: {
      'System Number': 'systemNumber',
      'Customer ID': 'customerId',
      'System ID': 'systemId',
      'System Name': 'systemName',
      'Installation No.': 'installationNo',
      'Product': 'product',
      'Product Version': 'productVersion',
      'End of Maintenance': 'endOfMaintenance',
      'Maintenance Status': 'maintenanceStatus',
      'Expires in 0-12 Months': 'expiresIn0to12',
      'Expires in 12-24 Months': 'expiresIn12to24',
      'Expires in 24-36 Months': 'expiresIn24to36',
      'Expires in 36+ Months': 'expiresIn36Plus',
      'Expired': 'expired'
    }
  },
  {
    excel: '/Users/I870089/Downloads/On Prem Licenses Table-2026-04-04 22_23_27.xlsx',
    csv: 'db/data/bdc.assessment-OnPremLicenses.csv',
    entity: 'OnPremLicenses',
    mapping: {
      'Order ID': 'orderId',
      'Order Item': 'orderItem',
      'Material ID': 'materialId',
      'Customer ID': 'customerId',
      'Customer': 'customerName',
      'Order Type': 'orderType',
      'Solution Area': 'solutionArea',
      'Solution Area Title': 'solutionAreaTitle',
      'Sub-Solution Area': 'subSolutionArea',
      'Sub-Solution Area Title': 'subSolutionAreaTitle',
      'Product (LPR)': 'product',
      'Material': 'material',
      'Quantity': 'quantity',
      'TCV On-Premise*': 'tcvOnPrem',
      'Signed Date': 'signedDate',
      'Start Date (Item)': 'startDate',
      'End Date (Item)': 'endDate',
      'Contract Partner': 'contractPartner',
      'Country': 'country'
    }
  },
  {
    excel: '/Users/I870089/Downloads/Purchased Solutions Table-2026-04-04 22_23_16.xlsx',
    csv: 'db/data/bdc.assessment-PurchasedSolutions.csv',
    entity: 'PurchasedSolutions',
    mapping: {
      'Customer ID': 'customerId',
      'Solution Area': 'solutionArea',
      'Customer': 'customerName',
      'Channel (Agg.)': 'channel',
      'Active ACV*': 'activeACV',
      'Average ACV*': 'averageACV',
      'Exit ACV* (active)': 'exitACV',
      'SCV*': 'scv',
      'TCV*': 'tcv',
      'Initial Contract Start Date': 'contractStartDate',
      'Contract End Date (Last Item)': 'contractEndDate',
      'Contract Status': 'contractStatus',
      'Support Level': 'supportLevel'
    }
  }
];

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSV(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const str = String(value);

  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Format date for CSV (YYYY-MM-DD)
 */
function formatDate(value) {
  if (!value || value === '') return '';

  // Try parsing Excel date
  if (typeof value === 'number') {
    const date = xlsx.SSF.parse_date_code(value);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }

  // Try parsing string date
  const parsed = new Date(value);
  if (!isNaN(parsed)) {
    return parsed.toISOString().split('T')[0];
  }

  return String(value);
}

/**
 * Format numeric value
 */
function formatNumber(value) {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  // Remove currency symbols, commas, spaces
  const cleaned = String(value).replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);

  return isNaN(num) ? '0' : String(num);
}

/**
 * Convert Excel file to CSV
 */
function convertExcelToCSV(config) {
  console.log(`\nProcessing ${config.entity}...`);
  console.log(`  Source: ${path.basename(config.excel)}`);

  // Read Excel file
  const workbook = xlsx.readFile(config.excel);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`  Rows: ${data.length}`);

  if (data.length === 0) {
    console.log(`  WARNING: No data found in ${config.excel}`);
    return;
  }

  // Build CSV header (camelCase field names)
  const headers = Object.values(config.mapping);
  let csv = headers.join(',') + '\n';

  // Convert each row
  let convertedCount = 0;
  data.forEach(row => {
    const values = headers.map(fieldName => {
      // Find the Excel column name for this field
      const excelColumn = Object.keys(config.mapping).find(
        key => config.mapping[key] === fieldName
      );

      if (!excelColumn) return '';

      const value = row[excelColumn];

      // Handle date fields
      if (fieldName.includes('Date') || fieldName === 'createdOn' ||
          fieldName === 'endOfMaintenance') {
        return escapeCSV(formatDate(value));
      }

      // Handle numeric fields
      if (fieldName.includes('ACV') || fieldName.includes('CV') ||
          fieldName === 'quantity' || fieldName.startsWith('expiresIn') ||
          fieldName === 'expired') {
        return formatNumber(value);
      }

      // Handle string fields
      return escapeCSV(value);
    });

    csv += values.join(',') + '\n';
    convertedCount++;
  });

  // Ensure output directory exists
  const outputDir = path.dirname(config.csv);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write CSV file
  fs.writeFileSync(config.csv, csv, 'utf8');

  const fileSize = fs.statSync(config.csv).size;
  console.log(`  Output: ${config.csv}`);
  console.log(`  Size: ${(fileSize / 1024).toFixed(1)} KB`);
  console.log(`  ✅ Converted ${convertedCount} rows`);
}

/**
 * Main execution
 */
function main() {
  console.log('='.repeat(60));
  console.log('Excel to CSV Converter for BDC Assessment');
  console.log('='.repeat(60));

  let successCount = 0;
  let errorCount = 0;

  FILES.forEach(config => {
    try {
      convertExcelToCSV(config);
      successCount++;
    } catch (error) {
      console.error(`\n❌ Error processing ${config.entity}:`);
      console.error(error.message);
      errorCount++;
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Conversion complete: ${successCount} succeeded, ${errorCount} failed`);
  console.log('='.repeat(60));

  if (errorCount > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { convertExcelToCSV, escapeCSV, formatDate, formatNumber };
