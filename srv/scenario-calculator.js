// srv/scenario-calculator.js
// Deterministic scenario engine: 3 scenarios + Chart.js-ready data arrays
// Conservative (Datasphere only, 18mo, ~$1.2M)
// Recommended (Datasphere + AI Core, 12mo, ~$2.5M)
// Aggressive (Full BDC stack, 9mo, ~$4.8M)

const { FinancialModel } = require('./financial-model');

const SCENARIO_PROFILES = {
  conservative: {
    label: 'Conservative',
    description: 'Datasphere-only deployment with phased rollout',
    investmentMultiplier: 0.55,
    timelineMonths: 18,
    scopePercent: 40,
    riskLevel: 'Low',
    components: ['Datasphere'],
    returnAdjust: 0.45, // Lower returns - Datasphere only captures fewer savings
    breakdownRatios: { datasphere: 0.65, aiCore: 0, sac: 0, services: 0.35 },
    phases: [
      { name: 'Foundation', months: 6, description: 'Datasphere setup, data migration planning' },
      { name: 'Migration', months: 6, description: 'BW data migration to Datasphere' },
      { name: 'Optimization', months: 6, description: 'Query optimization, user adoption' }
    ]
  },
  recommended: {
    label: 'Recommended',
    description: 'Datasphere + AI Core with accelerated timeline',
    investmentMultiplier: 1.0,
    timelineMonths: 12,
    scopePercent: 70,
    riskLevel: 'Medium',
    components: ['Datasphere', 'AI Core'],
    returnAdjust: 0.85, // Balanced returns - most capabilities, good return
    breakdownRatios: { datasphere: 0.45, aiCore: 0.18, sac: 0, services: 0.37 },
    phases: [
      { name: 'Foundation', months: 3, description: 'Platform setup, AI Core provisioning' },
      { name: 'Core Migration', months: 4, description: 'Data migration + AI model deployment' },
      { name: 'Integration', months: 3, description: 'Business process integration, testing' },
      { name: 'Go-Live', months: 2, description: 'Production cutover, hypercare' }
    ]
  },
  aggressive: {
    label: 'Aggressive',
    description: 'Full BDC stack (Datasphere + AI Core + SAC + BTP)',
    investmentMultiplier: 1.65,
    timelineMonths: 9,
    scopePercent: 100,
    riskLevel: 'High',
    components: ['Datasphere', 'AI Core', 'SAC', 'BTP Extensions', 'Joule'],
    returnAdjust: 1.40, // Full stack unlocks AI/automation returns beyond tool consolidation
    breakdownRatios: { datasphere: 0.37, aiCore: 0.17, sac: 0.13, services: 0.33 },
    phases: [
      { name: 'Rapid Setup', months: 2, description: 'Full platform deployment, parallel workstreams' },
      { name: 'Accelerated Migration', months: 3, description: 'Data + analytics migration, AI training' },
      { name: 'Integration Sprint', months: 2, description: 'Full stack integration, SAC dashboards' },
      { name: 'Launch', months: 2, description: 'Production cutover, change management' }
    ]
  }
};

// Interview answer modifiers
const DRIVER_ADJUSTMENTS = {
  cost_reduction:       { investMul: 0.85, returnMul: 1.10, focus: 'Cost optimization and tool consolidation' },
  revenue_growth:       { investMul: 1.10, returnMul: 1.25, focus: 'Revenue enablement through data-driven decisions' },
  competitive_pressure: { investMul: 1.00, returnMul: 1.00, focus: 'Competitive parity and market positioning' }
};

const TIMELINE_ADJUSTMENTS = {
  this_quarter:  { conservative: -3, recommended: -2, aggressive: -1 },
  '6-12_months': { conservative: 0,  recommended: 0,  aggressive: 0 },
  '6_12_months': { conservative: 0,  recommended: 0,  aggressive: 0 },  // alias
  exploratory:   { conservative: 6,  recommended: 3,  aggressive: 2 }
};

const RISK_ADJUSTMENTS = {
  conservative: { timelineAdd: 3,  scopeReduce: 10 },
  balanced:     { timelineAdd: 0,  scopeReduce: 0 },
  aggressive:   { timelineAdd: -2, scopeReduce: -5 }
};

// ── Core calculation ─────────────────────────────────────────────────

function calculateScenarios(customer, interviewAnswers) {
  const financialModel = new FinancialModel(customer);
  const baseFinancials = financialModel.calculate();

  const driverAdj   = DRIVER_ADJUSTMENTS[interviewAnswers.businessDriver]  || DRIVER_ADJUSTMENTS.revenue_growth;
  const timelineAdj = TIMELINE_ADJUSTMENTS[interviewAnswers.timeline]      || TIMELINE_ADJUSTMENTS['6-12_months'];
  const riskAdj     = RISK_ADJUSTMENTS[interviewAnswers.riskTolerance]     || RISK_ADJUSTMENTS.balanced;

  const scenarios = {};

  for (const [key, profile] of Object.entries(SCENARIO_PROFILES)) {
    const investment = Math.round(baseFinancials.investment * profile.investmentMultiplier * driverAdj.investMul);

    // Breakdown using profile-specific ratios
    const breakdown = {
      datasphere: Math.round(investment * profile.breakdownRatios.datasphere),
      aiCore:     Math.round(investment * profile.breakdownRatios.aiCore),
      sac:        Math.round(investment * profile.breakdownRatios.sac),
      services:   Math.round(investment * profile.breakdownRatios.services)
    };

    const timelineMonths = Math.max(6, profile.timelineMonths + (timelineAdj[key] || 0) + riskAdj.timelineAdd);
    const scopePercent   = Math.max(30, Math.min(100, profile.scopePercent - riskAdj.scopeReduce));
    const annualReturn   = Math.round(baseFinancials.annualReturn * profile.returnAdjust * driverAdj.returnMul);

    // ECIF
    const hasHyperscaler = customer.otherDatalake &&
      ['Snowflake', 'Azure', 'AWS', 'GCP', 'BigQuery'].some(h =>
        (customer.otherDatalake || '').toLowerCase().includes(h.toLowerCase()));
    const ecifFunding  = hasHyperscaler ? Math.round(investment * 0.25) : 0;
    const netInvestment = investment - ecifFunding;

    // 3-year cumulative ROI (with implementation ramp in year 1)
    const year1Return = annualReturn * 0.5; // ~50% of full returns during implementation year
    const year2Return = annualReturn;
    const year3Return = annualReturn;
    const totalReturn3yr = year1Return + year2Return + year3Return;
    const roi = Math.round(((totalReturn3yr - netInvestment) / netInvestment) * 100);

    // Payback with implementation ramp simulation
    const monthlyReturn = annualReturn / 12;
    let cumReturn = 0;
    let paybackMonths = 36; // default if never reached
    for (let m = 1; m <= 36; m++) {
      if (m <= timelineMonths) {
        cumReturn += monthlyReturn * (m / timelineMonths) * 0.5;
      } else {
        cumReturn += monthlyReturn;
      }
      if (cumReturn >= netInvestment) {
        paybackMonths = m;
        break;
      }
    }

    // NPV (3-year, 10% discount)
    const discountRate = 0.10;
    let npv = -netInvestment;
    for (let year = 1; year <= 3; year++) {
      npv += annualReturn / Math.pow(1 + discountRate, year);
    }

    const irr = Math.max(0, Math.round(((annualReturn / netInvestment) - 1) * 100));

    // Monthly cash flow with implementation ramp (Chart.js {x,y} format)
    const monthlyCashFlow = [];
    // monthlyReturn already defined above for payback calculation
    let cumCF = -netInvestment;
    for (let m = 0; m <= 36; m++) {
      if (m === 0) {
        monthlyCashFlow.push({ x: 0, y: Math.round(cumCF) });
      } else if (m <= timelineMonths) {
        cumCF += monthlyReturn * (m / timelineMonths) * 0.3;
        monthlyCashFlow.push({ x: m, y: Math.round(cumCF) });
      } else {
        cumCF += monthlyReturn;
        monthlyCashFlow.push({ x: m, y: Math.round(cumCF) });
      }
    }

    // Scale phases to adjusted timeline
    const totalTemplateMonths = profile.phases.reduce((s, p) => s + p.months, 0);
    const phases = profile.phases.map(p => ({
      ...p,
      months: Math.max(1, Math.round(p.months * (timelineMonths / totalTemplateMonths)))
    }));

    scenarios[key] = {
      label: profile.label,
      description: profile.description,
      riskLevel: profile.riskLevel,
      components: profile.components,
      scopePercent,
      investment: investment / 1000000, // Convert to millions for frontend
      investmentBreakdown: {
        datasphere: breakdown.datasphere / 1000000,
        aiCore: breakdown.aiCore / 1000000,
        sac: breakdown.sac / 1000000,
        services: breakdown.services / 1000000
      },
      timeline: timelineMonths,
      timelineMonths,
      annualReturn: annualReturn / 1000000, // Convert to millions
      ecifFunding: ecifFunding / 1000000, // Convert to millions
      ecifPartner: hasHyperscaler ? customer.otherDatalake : null,
      netInvestment: netInvestment / 1000000, // Convert to millions
      roi,
      payback: paybackMonths,
      paybackMonths,
      npv: Math.round(npv) / 1000000, // Convert to millions
      irr,
      monthlyCashFlow: monthlyCashFlow.map(pt => ({ x: pt.x, y: pt.y / 1000000 })), // Convert to millions
      phases,
      driverFocus: driverAdj.focus
    };
  }

  // ── Chart data (Chart.js-ready) ──────────────────────────────────

  const currentAnnualSpend = baseFinancials.currentSpend;
  const chartData = buildChartData(scenarios, currentAnnualSpend);

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      erpDeployment: customer.erpDeployment || 'Unknown',
      existingBW: customer.existingBW || 'Unknown',
      existingDatasphere: customer.existingDatasphere || 'Unknown',
      otherDatalake: customer.otherDatalake || 'None',
      entitlementOrders: customer.entitlementSummary?.totalOrders || 0
    },
    interviewAnswers,
    currentSpend: currentAnnualSpend,
    scenarios,
    chartData,
    assumptions: baseFinancials.assumptions,
    generatedAt: new Date().toISOString()
  };
}

// ── Chart data builders ────────────────────────────────────────────

function buildChartData(scenarios, currentAnnualSpend) {
  return {
    npvCurves:           buildNPVCurves(scenarios),
    paybackWaterfall:    buildPaybackWaterfall(scenarios),
    tcoComparison:       buildTCOComparison(scenarios, currentAnnualSpend),
    roiComparison:       buildROIComparison(scenarios),
    investmentBreakdown: buildInvestmentBreakdown(scenarios)
  };
}

// NPV curves: {x: month, y: cumulativeNPV} for each scenario
function buildNPVCurves(scenarios) {
  const discountRate = 0.10;
  const curves = {};

  for (const [key, s] of Object.entries(scenarios)) {
    const points = [];
    const monthlyReturn = s.annualReturn / 12;
    let cumNPV = -s.netInvestment;

    for (let m = 0; m <= 36; m++) {
      if (m === 0) {
        points.push({ x: 0, y: Math.round(cumNPV) });
      } else {
        const df = 1 / Math.pow(1 + discountRate / 12, m);
        if (m <= s.timelineMonths) {
          cumNPV += monthlyReturn * (m / s.timelineMonths) * 0.3 * df;
        } else {
          cumNPV += monthlyReturn * df;
        }
        points.push({ x: m, y: Math.round(cumNPV) });
      }
    }
    curves[key] = points;
  }
  return curves;
}

// Payback waterfall: bars for initial investment + quarterly returns
function buildPaybackWaterfall(scenarios) {
  const waterfalls = {};

  for (const [key, s] of Object.entries(scenarios)) {
    const qReturn = s.annualReturn / 4;
    const bars = [{ label: 'Investment', value: -s.netInvestment, cumulative: -s.netInvestment, type: 'cost' }];
    let cum = -s.netInvestment;

    for (let q = 1; q <= 8; q++) {
      cum += qReturn;
      bars.push({
        label: `Q${q}`,
        value: Math.round(qReturn),
        cumulative: Math.round(cum),
        type: cum >= 0 ? 'positive' : 'recovery'
      });
    }
    waterfalls[key] = bars;
  }
  return waterfalls;
}

// TCO comparison: current state vs each scenario (3-year)
function buildTCOComparison(scenarios, currentAnnualSpend) {
  return {
    labels: ['Current State', 'Conservative', 'Recommended', 'Aggressive'],
    datasets: [
      {
        label: '3-Year Cost',
        data: [
          Math.round(currentAnnualSpend * 3.15),
          Math.round(scenarios.conservative.investment + currentAnnualSpend * 1.7),
          Math.round(scenarios.recommended.investment + currentAnnualSpend * 1.2),
          Math.round(scenarios.aggressive.investment + currentAnnualSpend * 0.75)
        ],
        backgroundColor: ['#8E8E93', '#34C759', '#007AFF', '#FF9500']
      },
      {
        label: '3-Year Returns',
        data: [
          0,
          Math.round(scenarios.conservative.annualReturn * 3),
          Math.round(scenarios.recommended.annualReturn * 3),
          Math.round(scenarios.aggressive.annualReturn * 3)
        ],
        backgroundColor: ['#8E8E93', '#30D158', '#0A84FF', '#FF9F0A']
      },
      {
        label: 'Net 3-Year Value',
        data: [
          Math.round(-currentAnnualSpend * 3.15),
          scenarios.conservative.npv,
          scenarios.recommended.npv,
          scenarios.aggressive.npv
        ],
        backgroundColor: ['#FF3B30', '#34C759', '#007AFF', '#FF9500']
      }
    ]
  };
}

// ROI + payback comparison bars
function buildROIComparison(scenarios) {
  return {
    labels: ['Conservative', 'Recommended', 'Aggressive'],
    roi: {
      label: 'ROI %',
      data: [scenarios.conservative.roi, scenarios.recommended.roi, scenarios.aggressive.roi],
      backgroundColor: ['#34C759', '#007AFF', '#FF9500']
    },
    payback: {
      label: 'Payback (months)',
      data: [scenarios.conservative.paybackMonths, scenarios.recommended.paybackMonths, scenarios.aggressive.paybackMonths],
      backgroundColor: ['#30D158', '#0A84FF', '#FF9F0A']
    }
  };
}

// Stacked investment breakdown
function buildInvestmentBreakdown(scenarios) {
  return {
    labels: ['Conservative', 'Recommended', 'Aggressive'],
    datasets: [
      {
        label: 'Datasphere',
        data: [
          scenarios.conservative.investmentBreakdown.datasphere,
          scenarios.recommended.investmentBreakdown.datasphere,
          scenarios.aggressive.investmentBreakdown.datasphere
        ],
        backgroundColor: '#007AFF'
      },
      {
        label: 'AI Core',
        data: [
          scenarios.conservative.investmentBreakdown.aiCore,
          scenarios.recommended.investmentBreakdown.aiCore,
          scenarios.aggressive.investmentBreakdown.aiCore
        ],
        backgroundColor: '#5856D6'
      },
      {
        label: 'SAC',
        data: [
          scenarios.conservative.investmentBreakdown.sac,
          scenarios.recommended.investmentBreakdown.sac,
          scenarios.aggressive.investmentBreakdown.sac
        ],
        backgroundColor: '#34C759'
      },
      {
        label: 'Services',
        data: [
          scenarios.conservative.investmentBreakdown.services,
          scenarios.recommended.investmentBreakdown.services,
          scenarios.aggressive.investmentBreakdown.services
        ],
        backgroundColor: '#FF9500'
      }
    ]
  };
}

// ── Slider adjustment (recalculate single scenario) ────────────────

function adjustScenario(baseScenario, adjustments) {
  const s = JSON.parse(JSON.stringify(baseScenario)); // deep clone

  if (adjustments.timelineMonths !== undefined) {
    s.timelineMonths = Math.max(6, Math.min(36, adjustments.timelineMonths));
  }
  if (adjustments.scopePercent !== undefined) {
    const scopeRatio = adjustments.scopePercent / s.scopePercent;
    s.investment    = Math.round(s.investment * scopeRatio);
    s.annualReturn  = Math.round(s.annualReturn * scopeRatio);
    s.netInvestment = s.investment - s.ecifFunding;
    s.scopePercent  = adjustments.scopePercent;
  }
  if (adjustments.investmentOverride !== undefined) {
    s.investment    = Math.max(500000, adjustments.investmentOverride);
    s.netInvestment = s.investment - s.ecifFunding;
    // Scale breakdown proportionally
    const ratio = s.investment / baseScenario.investment;
    s.investmentBreakdown = {
      datasphere: Math.round(baseScenario.investmentBreakdown.datasphere * ratio),
      aiCore:     Math.round(baseScenario.investmentBreakdown.aiCore * ratio),
      sac:        Math.round(baseScenario.investmentBreakdown.sac * ratio),
      services:   Math.round(baseScenario.investmentBreakdown.services * ratio)
    };
  }

  // Recalculate derived metrics
  s.roi           = Math.round(((s.annualReturn - s.investment) / s.investment) * 100);
  s.paybackMonths = Math.max(3, Math.round(s.netInvestment / (s.annualReturn / 12)));

  let npv = -s.netInvestment;
  for (let year = 1; year <= 3; year++) {
    npv += s.annualReturn / Math.pow(1.10, year);
  }
  s.npv = Math.round(npv);
  s.irr = Math.max(0, Math.round(((s.annualReturn / s.netInvestment) - 1) * 100));

  // Recalculate monthly cash flow
  const monthlyReturn = s.annualReturn / 12;
  let cumCF = -s.netInvestment;
  s.monthlyCashFlow = [];
  for (let m = 0; m <= 36; m++) {
    if (m === 0) {
      s.monthlyCashFlow.push({ x: 0, y: Math.round(cumCF) });
    } else if (m <= s.timelineMonths) {
      cumCF += monthlyReturn * (m / s.timelineMonths) * 0.3;
      s.monthlyCashFlow.push({ x: m, y: Math.round(cumCF) });
    } else {
      cumCF += monthlyReturn;
      s.monthlyCashFlow.push({ x: m, y: Math.round(cumCF) });
    }
  }

  s.label = `Custom (${s.label})`;
  return s;
}

module.exports = { calculateScenarios, adjustScenario, SCENARIO_PROFILES };
