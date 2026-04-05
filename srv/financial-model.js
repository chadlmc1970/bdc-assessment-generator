// srv/financial-model.js
// Deterministic financial calculation engine for BDC assessments
// Calculates NPV, IRR, ROI, payback period BEFORE AI generates narrative

class FinancialModel {
  constructor(customer) {
    this.customer = customer;
    this.assumptions = [];
    this.assumptionCounter = 1;
  }

  // Helper to generate assumption ID
  nextAssumptionId() {
    const id = `ASMP-${String(this.assumptionCounter).padStart(3, '0')}`;
    this.assumptionCounter++;
    return id;
  }

  // Calculate current annual SAP spend from entitlement order volume
  calculateCurrentSpend() {
    const orderCount = this.customer.entitlementSummary?.totalOrders || 0;

    // Industry benchmark: $7K-$12K per order annually
    const spendPerOrder = 8500; // Median
    const annualSpend = orderCount * spendPerOrder;

    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Financial',
      assumption: 'Current SAP annual spend',
      value: `$${(annualSpend / 1000000).toFixed(1)}M`,
      confidence: orderCount > 500 ? 'High' : 'Medium',
      source: `Entitlement order volume (${orderCount} orders × $${spendPerOrder} industry benchmark)`
    });

    return annualSpend;
  }

  // Calculate BDC investment components
  calculateBDCInvestment() {
    // Datasphere base: $1.2M-$1.8M (depends on data volume)
    const datasphere = 1500000;
    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Investment',
      assumption: 'Datasphere Platform',
      value: `$${(datasphere / 1000000).toFixed(2)}M`,
      confidence: 'High',
      source: 'SAP Datasphere list pricing + typical enterprise capacity'
    });

    // AI Core: $400K-$800K (base tier, no GPU)
    const aiCore = 600000;
    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Investment',
      assumption: 'AI Core base tier',
      value: `$${(aiCore / 1000).toFixed(0)}K`,
      confidence: 'High',
      source: 'SAP AI Core standard tier pricing'
    });

    // SAC expansion: $300K-$600K
    const sac = 450000;
    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Investment',
      assumption: 'SAC Analytics Cloud',
      value: `$${(sac / 1000).toFixed(0)}K`,
      confidence: 'High',
      source: 'SAC enterprise license expansion'
    });

    // Services: 30-40% of platform cost
    const services = (datasphere + aiCore + sac) * 0.35;
    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Investment',
      assumption: 'Professional Services',
      value: `$${(services / 1000000).toFixed(2)}M`,
      confidence: 'Medium',
      source: '35% of platform cost (industry benchmark for implementation services)'
    });

    const totalInvestment = datasphere + aiCore + sac + services;

    return {
      datasphere,
      aiCore,
      sac,
      services,
      total: totalInvestment
    };
  }

  // Calculate annual returns
  calculateAnnualReturns() {
    // Cost savings from tool consolidation
    const toolConsolidation = 1200000; // 3-5 legacy tools × $240K-$400K each
    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Returns',
      assumption: 'Annual cost savings from tool consolidation',
      value: `$${(toolConsolidation / 1000000).toFixed(1)}M`,
      confidence: 'Medium',
      source: '3 legacy tools decommissioned (BW, 3rd-party BI, ETL) × avg $400K maintenance'
    });

    // Productivity gains from 40% time-to-insight reduction
    const productivityGain = 1500000; // Analyst team efficiency
    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Returns',
      assumption: 'Annual productivity gains',
      value: `$${(productivityGain / 1000000).toFixed(1)}M`,
      confidence: 'Medium',
      source: '40% time-to-insight reduction × analyst labor cost'
    });

    // Revenue impact from faster decision-making
    const revenueImpact = 800000; // Market advantage
    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Returns',
      assumption: 'Revenue impact from faster decisions',
      value: `$${(revenueImpact / 1000000).toFixed(1)}M`,
      confidence: 'Low',
      source: 'Competitive advantage from faster market response'
    });

    const totalAnnualReturn = toolConsolidation + productivityGain + revenueImpact;
    return totalAnnualReturn;
  }

  // Calculate ECIF co-funding (if applicable)
  calculateECIFFunding() {
    const { otherDatalake } = this.customer;
    const hasHyperscaler = otherDatalake && ['Snowflake', 'Azure', 'AWS'].some(h => otherDatalake.includes(h));

    if (!hasHyperscaler) return 0;

    const investment = this.calculateBDCInvestment().total;
    const ecifPercent = 0.25; // 20-30% typical, use 25%
    const ecifFunding = investment * ecifPercent;

    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Funding',
      assumption: 'ECIF co-sell funding',
      value: `$${(ecifFunding / 1000000).toFixed(2)}M`,
      confidence: 'Medium',
      source: `Customer uses ${otherDatalake} - eligible for 25% ECIF co-investment`
    });

    return ecifFunding;
  }

  // Calculate a specific scenario type (conservative/recommended/aggressive)
  // Delegates to ScenarioCalculator but provides FinancialModel interface
  calculateScenario(interviewAnswers, scenarioType) {
    const { calculateScenarios } = require('./scenario-calculator');
    const result = calculateScenarios(this.customer, interviewAnswers);
    return result.scenarios[scenarioType] || null;
  }

  // Calculate all 3 scenarios with chart data
  calculateAllScenarios(interviewAnswers) {
    const { calculateScenarios } = require('./scenario-calculator');
    return calculateScenarios(this.customer, interviewAnswers);
  }

  // Calculate ROI, payback, NPV, IRR
  calculate() {
    const currentSpend = this.calculateCurrentSpend();
    const investment = this.calculateBDCInvestment();
    const annualReturn = this.calculateAnnualReturns();
    const ecifFunding = this.calculateECIFFunding();

    const netInvestment = investment.total - ecifFunding;
    const roi = ((annualReturn - investment.total) / investment.total) * 100;
    const paybackMonths = (netInvestment / (annualReturn / 12));

    // NPV calculation (3-year horizon, 10% discount rate)
    const discountRate = 0.10;
    let npv = -netInvestment;
    for (let year = 1; year <= 3; year++) {
      npv += annualReturn / Math.pow(1 + discountRate, year);
    }

    // IRR calculation (approximate)
    const irr = ((annualReturn / netInvestment) - 1) * 100;

    // Add ROI/payback assumptions
    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Financial',
      assumption: 'ROI calculation',
      value: `${roi.toFixed(0)}%`,
      confidence: 'Medium',
      source: `(Annual return $${(annualReturn / 1000000).toFixed(1)}M - Investment $${(investment.total / 1000000).toFixed(1)}M) / Investment`
    });

    this.assumptions.push({
      id: this.nextAssumptionId(),
      category: 'Financial',
      assumption: 'Payback period',
      value: `${Math.round(paybackMonths)} months`,
      confidence: 'Medium',
      source: `Net investment $${(netInvestment / 1000000).toFixed(1)}M / Monthly return $${((annualReturn / 12) / 1000000).toFixed(2)}M`
    });

    return {
      currentSpend,
      investment: investment.total,
      investmentBreakdown: investment,
      ecifFunding,
      netInvestment,
      annualReturn,
      roi: roi.toFixed(0),
      paybackMonths: Math.round(paybackMonths),
      npv: npv.toFixed(0),
      irr: irr.toFixed(0),
      assumptions: this.assumptions
    };
  }
}

module.exports = { FinancialModel };
