// Industry benchmarks by vertical for filling gaps in customer data
// Sources: Gartner, IDC, industry surveys

const benchmarks = {
  energy: {
    label: 'Oil & Gas / Energy',
    dataOpsFTEsPerBillion: 5.2,      // FTEs per $1B revenue
    infrastructureCostPerBillion: 1.35,  // $M per $1B revenue
    integrationCostPerBillion: 0.58,     // $M per $1B revenue
    avgDataOpsSalary: 95000,
    manualETLHoursPerFTE: 128,           // Hours per month per FTE
    typicalSystemCount: 6-8,
    aiReadinessAvg: 34,                  // Out of 100
    reportingLatency: '3-5 days'
  },

  retail: {
    label: 'Retail / Consumer Goods',
    dataOpsFTEsPerBillion: 5.2,
    infrastructureCostPerBillion: 1.39,
    integrationCostPerBillion: 0.61,
    avgDataOpsSalary: 88000,
    manualETLHoursPerFTE: 142,
    typicalSystemCount: 5-7,
    aiReadinessAvg: 31,
    reportingLatency: '2-4 days'
  },

  manufacturing: {
    label: 'Manufacturing / Industrial',
    dataOpsFTEsPerBillion: 4.8,
    infrastructureCostPerBillion: 1.42,
    integrationCostPerBillion: 0.64,
    avgDataOpsSalary: 92000,
    manualETLHoursPerFTE: 135,
    typicalSystemCount: 7-9,
    aiReadinessAvg: 29,
    reportingLatency: '4-6 days'
  },

  financial: {
    label: 'Financial Services',
    dataOpsFTEsPerBillion: 6.8,
    infrastructureCostPerBillion: 1.88,
    integrationCostPerBillion: 0.82,
    avgDataOpsSalary: 108000,
    manualETLHoursPerFTE: 118,
    typicalSystemCount: 8-12,
    aiReadinessAvg: 41,
    reportingLatency: '1-2 days'
  }
};

/**
 * Apply benchmarks to fill gaps in customer data
 */
function applyBenchmarks(customerContext) {
  const vertical = customerContext.vertical || 'energy';
  const benchmark = benchmarks[vertical] || benchmarks.energy;

  const revenueInBillions = customerContext.revenueNumeric / 1000000000;

  return {
    estimatedDataOpsFTEs: Math.round(benchmark.dataOpsFTEsPerBillion * revenueInBillions),
    estimatedInfrastructureCost: Math.round(benchmark.infrastructureCostPerBillion * revenueInBillions * 1000000),
    estimatedIntegrationCost: Math.round(benchmark.integrationCostPerBillion * revenueInBillions * 1000000),
    avgSalary: benchmark.avgDataOpsSalary,
    industryNorm: benchmark
  };
}

/**
 * Get industry benchmarks for prompts (Section 2, 3, etc.)
 */
function getBenchmarks(industry) {
  // Map industry string to vertical key
  const industryMap = {
    'oil & gas / energy': 'energy',
    'oil & gas': 'energy',
    'energy': 'energy',
    'retail / consumer goods': 'retail',
    'retail': 'retail',
    'manufacturing / industrial': 'manufacturing',
    'manufacturing': 'manufacturing',
    'financial services': 'financial',
    'banking': 'financial'
  };

  const vertical = industryMap[industry.toLowerCase()] || 'energy';
  const benchmark = benchmarks[vertical];

  return {
    industry: benchmark.label,
    medianAnalyticsTCO: 8500000, // Placeholder for POC
    medianDataOpsPerBillionRevenue: benchmark.dataOpsFTEsPerBillion,
    medianIntegrationCostPercent: 12, // % of IT budget
    cloudAdoptionRate: 68, // %
    aiMLMaturityAverage: benchmark.aiReadinessAvg / 20, // Scale to 1-5
    marketTrends: [
      'Cloud-first data architecture adoption accelerating',
      'AI/ML adoption requiring unified data foundations',
      'Real-time analytics becoming table stakes'
    ],
    regulatoryPressures: [
      'Data privacy regulations (GDPR, CCPA)',
      'Industry-specific compliance requirements',
      'Audit trail and data lineage mandates'
    ]
  };
}

module.exports = {
  benchmarks,
  applyBenchmarks,
  getBenchmarks
};
