/**
 * Intelligence Service - Multi-Source Data Integration
 * Simulates fetching data from SAP CRM, Gartner, SAP Benchmarks, and Case Studies
 */

const { findCustomerById, getCustomerWithEntitlements } = require('./db-service');
const fs = require('fs');
const path = require('path');

/**
 * Analyze customer by fetching data from multiple sources
 * GET /api/intelligence/analyze-customer?customer=loves
 */
async function analyzeCustomer(req, res) {
  try {
    const customerName = req.query.customer || 'loves';

    // Simulate realistic delays for each data source
    const sources = {};

    // Source 1: SAP CRM Data (from SQLite)
    await delay(600);
    sources.crm = await fetchCRMData(customerName);

    // Source 2: Gartner Industry Benchmarks
    await delay(750);
    sources.gartner = await fetchGartnerData();

    // Source 3: SAP Technical Benchmarks
    await delay(550);
    sources.benchmarks = await fetchSAPBenchmarks();

    // Source 4: Customer Case Studies
    await delay(700);
    sources.caseStudies = await fetchCaseStudies();

    // Generate analysis summary
    const analysis = generateAnalysis(sources);

    res.json({
      success: true,
      customer: customerName,
      timestamp: new Date().toISOString(),
      sources,
      analysis,
      recommendations: generateRecommendations(sources, analysis)
    });

  } catch (error) {
    console.error('Intelligence service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze customer',
      message: error.message
    });
  }
}

/**
 * Fetch CRM data from SQLite database
 */
async function fetchCRMData(customerName) {
  try {
    // Map customer name to ID
    const customerMap = {
      'loves': '190852',
      'love': '190852',
      'loves travel stops': '190852'
    };

    const customerId = customerMap[customerName.toLowerCase()] || '190852';

    // Get customer with entitlements from database
    const customerData = await getCustomerWithEntitlements(customerId);

    if (!customerData) {
      throw new Error(`Customer ${customerId} not found`);
    }

    return {
      status: 'complete',
      source: 'SAP CRM',
      timestamp: new Date().toISOString(),
      data: {
        customerId: customerData.customerID,
        name: customerData.customerName,
        orderVolume: customerData.orderVolume,
        activeOrders: customerData.orderVolume,
        currentSystems: {
          erp: customerData.erpVersion || 'ECC OP',
          analytics: customerData.bwVersion || 'BW/4 OP',
          datasphere: customerData.datasphere || 'New',
          datalake: customerData.dataLake || 'Snowflake',
          sac: customerData.sac || 'No'
        },
        technicalLandscape: {
          cloudSystems: customerData.cloudSystems || 1552,
          onPremSystems: customerData.onPremSystems || 265,
          purchasedSolutions: customerData.solutions || 8
        },
        keyContacts: {
          dataOwner: customerData.dataOwner || 'Karissa Stephenson',
          technicalLead: customerData.technicalLead || 'Bob Armstrong',
          sponsor: customerData.sponsor || 'Paul Smith'
        },
        strategicInitiatives: customerData.notes || 'Looking at S4 / ECC Rise. Recently purchased Datasphere w S4 Hana Runtime conversion.'
      }
    };
  } catch (error) {
    console.error('CRM fetch error:', error);
    // Fallback to hardcoded data if DB fails
    return {
      status: 'complete',
      source: 'SAP CRM',
      timestamp: new Date().toISOString(),
      data: {
        customerId: '190852',
        name: "Love's Travel Stops & Country Stores",
        orderVolume: 897,
        activeOrders: 897,
        currentSystems: {
          erp: 'ECC OP',
          analytics: 'BW/4 OP',
          datasphere: 'New',
          datalake: 'Snowflake',
          sac: 'No'
        },
        technicalLandscape: {
          cloudSystems: 1552,
          onPremSystems: 265,
          purchasedSolutions: 8
        },
        keyContacts: {
          dataOwner: 'Karissa Stephenson',
          technicalLead: 'Bob Armstrong',
          sponsor: 'Paul Smith'
        },
        strategicInitiatives: 'Looking at S4 / ECC Rise. Recently purchased Datasphere w S4 Hana Runtime conversion.'
      }
    };
  }
}

/**
 * Fetch Gartner industry benchmark data
 */
async function fetchGartnerData() {
  const benchmarkPath = path.join(__dirname, 'data', 'benchmarks', 'retail-travel-industry.json');

  try {
    if (fs.existsSync(benchmarkPath)) {
      const data = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8'));
      return {
        status: 'complete',
        source: 'Gartner Research',
        timestamp: new Date().toISOString(),
        data
      };
    }
  } catch (error) {
    console.warn('Failed to load Gartner data, using defaults', error);
  }

  // Default Gartner-style benchmark data
  return {
    status: 'complete',
    source: 'Gartner Research',
    timestamp: new Date().toISOString(),
    data: {
      industry: 'Retail & Travel',
      reportDate: '2026-Q1',
      keyMetrics: {
        averageOrderErrorRate: 0.12,
        manualCorrectionCostPerOrder: 15.50,
        typicalPaybackPeriod: 24,
        industryAverageROI: 185
      },
      trends: [
        'Cloud ERP adoption in retail sector: 67% by 2027',
        'Data warehouse consolidation driving 30-40% cost reduction',
        'AI-powered data quality tools showing 85% error reduction',
        'Hybrid cloud strategies preferred for retail/travel sector'
      ],
      competitivePressure: 'High - Market leaders investing heavily in data modernization'
    }
  };
}

/**
 * Fetch SAP technical benchmark data
 */
async function fetchSAPBenchmarks() {
  const benchmarkPath = path.join(__dirname, 'data', 'benchmarks', 'sap-technical.json');

  try {
    if (fs.existsSync(benchmarkPath)) {
      const data = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8'));
      return {
        status: 'complete',
        source: 'SAP Modernization Patterns',
        timestamp: new Date().toISOString(),
        data
      };
    }
  } catch (error) {
    console.warn('Failed to load SAP benchmarks, using defaults', error);
  }

  // Default SAP benchmark data
  return {
    status: 'complete',
    source: 'SAP Modernization Patterns',
    timestamp: new Date().toISOString(),
    data: {
      eccToS4Timeline: {
        min: 6,
        max: 12,
        average: 9,
        unit: 'months'
      },
      bwMigrationOptions: [
        {
          option: 'BW/4HANA',
          timeline: '4-6 months',
          complexity: 'Medium',
          suitability: 'Existing BW investments, mature analytics'
        },
        {
          option: 'Datasphere',
          timeline: '3-5 months',
          complexity: 'Low',
          suitability: 'Cloud-first, multi-source data integration'
        }
      ],
      datasphereBenefits: {
        timeToValue: '60% faster than traditional DW',
        integrationComplexity: 'Pre-built connectors for 100+ sources',
        costReduction: '30-40% lower TCO vs on-premise',
        aiReadiness: 'Native SAP AI Core integration'
      },
      successMetrics: {
        customerAdoptionRate: 0.73,
        averageROI: 227,
        dataQualityImprovement: 0.85,
        timeToInsights: '-65%'
      }
    }
  };
}

/**
 * Fetch customer case studies
 */
async function fetchCaseStudies() {
  const casePath = path.join(__dirname, 'data', 'case-studies', 'similar-customers.json');

  try {
    if (fs.existsSync(casePath)) {
      const data = JSON.parse(fs.readFileSync(casePath, 'utf8'));
      return {
        status: 'complete',
        source: 'SAP Customer Success Stories',
        timestamp: new Date().toISOString(),
        data
      };
    }
  } catch (error) {
    console.warn('Failed to load case studies, using defaults', error);
  }

  // Default case studies
  return {
    status: 'complete',
    source: 'SAP Customer Success Stories',
    timestamp: new Date().toISOString(),
    data: {
      matchedCustomers: 3,
      cases: [
        {
          id: 'CS-001',
          industry: 'Retail - Fuel & Convenience',
          customerSize: 'Large Enterprise',
          profile: {
            locations: 500,
            monthlyOrders: 12000,
            dataChallenge: 'Manual order corrections, data quality issues'
          },
          solution: 'Datasphere + AI Core for automated data validation',
          outcome: {
            errorReduction: 0.85,
            timeSavings: '240 hours/month',
            roi: 312,
            payback: 14
          },
          quote: 'Datasphere transformed our data operations. We went from reactive to predictive.'
        },
        {
          id: 'CS-002',
          industry: 'Travel & Hospitality',
          customerSize: 'Mid-Market',
          profile: {
            locations: 280,
            monthlyOrders: 8500,
            dataChallenge: 'Siloed systems, inconsistent reporting'
          },
          solution: 'ECC to S4 migration + Datasphere integration',
          outcome: {
            dataConsolidation: 'Unified 14 disparate sources',
            reportingSpeed: '+78% faster insights',
            roi: 215,
            payback: 18
          },
          quote: 'Single source of truth across all operations. Game changer for decision-making.'
        },
        {
          id: 'CS-003',
          industry: 'Retail - Multi-Location',
          customerSize: 'Enterprise',
          profile: {
            locations: 750,
            monthlyOrders: 15000,
            dataChallenge: 'Legacy BW performance, cloud migration needed'
          },
          solution: 'BW/4 to Datasphere migration with phased rollout',
          outcome: {
            performanceGain: '+320% query speed',
            costReduction: '42% lower TCO',
            roi: 189,
            payback: 22
          },
          quote: 'Moved from overnight batch jobs to real-time analytics. Revolutionary.'
        }
      ]
    }
  };
}

/**
 * Generate analysis from combined sources
 */
function generateAnalysis(sources) {
  const crmData = sources.crm.data;
  const gartnerData = sources.gartner.data;

  // Calculate key insights
  const estimatedErrorRate = 0.23; // 23% based on Loves data
  const monthlyErrorCost = crmData.orderVolume * estimatedErrorRate * gartnerData.keyMetrics.manualCorrectionCostPerOrder;
  const annualWaste = monthlyErrorCost * 12;

  return {
    customerProfile: {
      maturityLevel: crmData.currentSystems.datasphere === 'New' ? 'Early Cloud Adoption' : 'Cloud Native',
      dataArchitecture: crmData.currentSystems.datalake === 'Snowflake' ? 'Modern Multi-Cloud' : 'Hybrid',
      modernizationReadiness: 'High - Active S4/Rise evaluation'
    },
    financialImpact: {
      estimatedMonthlyWaste: Math.round(monthlyErrorCost),
      annualizedCost: Math.round(annualWaste),
      industryComparison: estimatedErrorRate > gartnerData.keyMetrics.averageOrderErrorRate ? 'Above Industry Average' : 'Below Industry Average'
    },
    technicalGaps: [
      'Manual order correction process (23% error rate)',
      'Limited real-time data validation',
      'Opportunity for AI-powered data quality'
    ],
    strategicFit: {
      datasphereAlignment: 'Strong - Already invested, ready to expand',
      ecifEligibility: crmData.currentSystems.datalake === 'Snowflake' ? 'Qualified - Premium tier' : 'Standard tier',
      aiReadiness: 'High - Modern data platform foundation'
    }
  };
}

/**
 * Generate recommendations
 */
function generateRecommendations(sources, analysis) {
  return {
    primaryRecommendation: 'Accelerated Datasphere + AI Core deployment',
    rationale: [
      `Eliminate $${Math.round(analysis.financialImpact.annualizedCost).toLocaleString()} annual waste from manual corrections`,
      'Leverage existing Datasphere investment for faster time-to-value',
      `Qualify for $950K ECIF co-funding (25% of recommended investment)`,
      'Position for S4/Rise migration with unified data foundation'
    ],
    nextSteps: [
      'Review 3-scenario financial models',
      'Validate ECIF funding eligibility',
      'Schedule technical architecture workshop',
      'Align with S4/Rise migration timeline'
    ],
    riskMitigation: [
      'Phased rollout to minimize disruption',
      'Leverage SAP Customer Success playbooks',
      'Build on existing Datasphere foundation'
    ]
  };
}

/**
 * Utility: Delay promise
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  analyzeCustomer
};
