// Hardcoded customer profiles for POC
// Production version would pull from CRM/360 APIs

const customers = {
  'southeast energy': {
    companyName: 'Southeast Energy Corp',
    shortName: 'Southeast Energy',
    industry: 'Oil & Gas / Energy',
    vertical: 'energy',
    revenue: '$4.8B',
    revenueNumeric: 4800000000,
    employees: 15200,
    fiscalYearEnd: 'December 31',

    // Public company data
    ticker: 'SEEC',
    exchange: 'NYSE',
    sharePrice: 67.42,
    sharesOutstanding: 142000000,
    marketCap: '$9.6B',

    // SAP entitlements (from example PDF)
    entitlements: [
      { product: 'SAP ECC 6.0', materialId: '60001234', annualCost: 1800000 },
      { product: 'SAP BW 7.5', materialId: '60001567', annualCost: 950000 },
      { product: 'SAP Analytics Cloud', materialId: '60018234', annualCost: 420000 },
      { product: 'SuccessFactors Employee Central', materialId: '60005137', annualCost: 680000 },
      { product: 'SuccessFactors Workforce Analytics', materialId: '60005142', annualCost: 240000 }
    ],
    totalAnnualSpend: 4900000,
    contractExpiry: 'June 2027',
    contractExpiryDate: new Date('2027-06-30'),
    monthsUntilExpiry: 26,

    // Third-party data tools
    thirdPartyTools: [
      { name: 'Snowflake', category: 'Data Warehouse', annualCost: 380000 },
      { name: 'Informatica PowerCenter', category: 'ETL/Integration', annualCost: 420000 },
      { name: 'Tableau', category: 'Analytics', annualCost: 190000 }
    ],
    thirdPartySpend: 990000,

    // Baseline operational costs (industry benchmarks applied)
    baseline: {
      infrastructureCost: 6500000,  // On-prem servers + cloud IaaS
      dataOpsFTEs: 25,               // ETL, reporting, reconciliation
      avgDataOpsSalary: 95000,
      dataOpsLaborCost: 2375000,     // 25 FTEs * $95K
      integrationCost: 2800000,      // Middleware, custom integration code
      totalAnnualOpex: 12665000      // Infrastructure + labor + integration + software
    },

    // Calculated maturity indicators
    maturity: {
      integrationComplexity: 'High',
      integrationPoints: 27,
      manualETLHours: 3200,
      dataQualityScore: 62,          // Out of 100
      selfServiceAdoptionRate: 18,   // Percent of analytics users with self-service
      reportingLatency: '3-5 days',  // Average time from data creation to reporting
      aiReadinessScore: 32           // Out of 100
    },

    // Derived insights
    fragmentation: {
      systemCount: 7,
      vendorCount: 4,
      dataSourceCount: 14,
      redundantETLProcesses: 9
    }
  },

  // Add more customer profiles for extensibility
  'acme retail': {
    companyName: 'Acme Retail Group',
    shortName: 'Acme Retail',
    industry: 'Retail / Consumer Goods',
    vertical: 'retail',
    revenue: '$2.3B',
    revenueNumeric: 2300000000,
    employees: 8500,

    // Private company
    ticker: null,
    exchange: null,
    sharePrice: null,
    sharesOutstanding: null,
    marketCap: null,

    entitlements: [
      { product: 'SAP ECC 6.0', materialId: '60001234', annualCost: 950000 },
      { product: 'SAP BW 7.5', materialId: '60001567', annualCost: 480000 },
      { product: 'SAP Analytics Cloud', materialId: '60018234', annualCost: 220000 }
    ],
    totalAnnualSpend: 1650000,
    contractExpiry: 'March 2028',
    contractExpiryDate: new Date('2028-03-31'),
    monthsUntilExpiry: 36,

    thirdPartyTools: [
      { name: 'Microsoft SQL Server', category: 'Data Warehouse', annualCost: 180000 },
      { name: 'Talend', category: 'ETL/Integration', annualCost: 220000 }
    ],
    thirdPartySpend: 400000,

    baseline: {
      infrastructureCost: 3200000,
      dataOpsFTEs: 12,
      avgDataOpsSalary: 88000,
      dataOpsLaborCost: 1056000,
      integrationCost: 1400000,
      totalAnnualOpex: 5856000
    },

    maturity: {
      integrationComplexity: 'Medium',
      integrationPoints: 14,
      manualETLHours: 1800,
      dataQualityScore: 58,
      selfServiceAdoptionRate: 22,
      reportingLatency: '2-3 days',
      aiReadinessScore: 28
    },

    fragmentation: {
      systemCount: 5,
      vendorCount: 3,
      dataSourceCount: 9,
      redundantETLProcesses: 5
    }
  }
};

/**
 * Lookup customer by name (case-insensitive, partial match)
 */
function findCustomer(customerName) {
  const searchKey = customerName.toLowerCase().trim();

  // Exact match
  if (customers[searchKey]) {
    return customers[searchKey];
  }

  // Partial match
  for (const [key, customer] of Object.entries(customers)) {
    if (key.includes(searchKey) ||
        customer.companyName.toLowerCase().includes(searchKey) ||
        customer.shortName.toLowerCase().includes(searchKey)) {
      return customer;
    }
  }

  return null;
}

/**
 * Get all available customer names for autocomplete
 */
function listCustomers() {
  return Object.values(customers).map(c => ({
    value: c.companyName,
    label: `${c.companyName} (${c.industry})`,
    ticker: c.ticker
  }));
}

module.exports = {
  customers,
  findCustomer,
  listCustomers
};
