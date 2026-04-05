/**
 * Section 6: Financial Model & Sensitivity Analysis
 *
 * PURPOSE: Detailed NPV/IRR/ROI breakdown + assumptions table + sensitivity scenarios
 * STYLE: CFO-grade financial modeling with transparent assumptions
 * OUTPUT: Multi-year cash flow model + sensitivity charts + assumption validation
 */

export const section6Prompt = ({ customerProfile, selectedComponents }) => {
  return {
    systemPrompt: `You are a strategic business consultant building a CFO-grade financial model.

CRITICAL RULES:
- Show all assumptions explicitly (discount rate, escalation factors, productivity gains)
- Multi-year cash flow model (Years 0-5)
- Sensitivity analysis on key variables (discount rate, implementation cost, business value)
- Risk-adjusted returns (not just best-case scenario)
- Reference Financial Appendix PDF structure for tables

TONE: Investment analyst presenting to CFO`,

    userPrompt: `Write Section 6: Financial Model & Sensitivity Analysis for this customer:

**Customer Profile:**
- Company: ${customerProfile.companyName}
- Revenue: ${customerProfile.revenue}
- Current Annual Spend: $${((customerProfile.totalAnnualSpend + customerProfile.thirdPartyTools.reduce((sum, t) => sum + t.annualCost, 0)) / 1000000).toFixed(1)}M

**Selected BDC Components:**
${selectedComponents.map(c => `- ${c}`).join('\n')}

**Recommended Scenario:** SAP BDC (from Section 5)
- Net Investment: $5.45M over 24 months
- Expected Annual Return: $7.3M
- NPV: $7.3M
- IRR: 42%
- Payback: 9 months

OUTPUT FORMAT:
# 6. Financial Model & Sensitivity Analysis

## Investment Summary
| Metric | Value |
|--------|-------|
| Total Investment (24 months) | $5.45M |
| Annual Recurring Benefit | $7.3M |
| Net Present Value (5-year) | $7.3M |
| Internal Rate of Return | 42% |
| Payback Period | 9 months |
| Return on Investment | 134% |

---

## Detailed Cash Flow Model (SAP BDC Scenario)

### Implementation Costs (Years 0-2)
| Component | Year 0 | Year 1 | Year 2 | Total |
|-----------|--------|--------|--------|-------|
| Software Licenses | $1.2M | $1.5M | $0.8M | $3.5M |
| Implementation Services | $0.6M | $0.4M | $0.2M | $1.2M |
| Migration & Integration | $0.3M | $0.2M | $0.1M | $0.6M |
| Training & Change Mgmt | $0.1M | $0.05M | $0.0M | $0.15M |
| **Total Investment** | **$2.2M** | **$2.15M** | **$1.1M** | **$5.45M** |

### Operating Costs (Years 1-5)
| Component | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|-----------|--------|--------|--------|--------|--------|
| BDC Subscription Fees | $1.8M | $2.1M | $2.2M | $2.3M | $2.4M |
| Cloud Infrastructure | $0.4M | $0.5M | $0.5M | $0.6M | $0.6M |
| Support & Maintenance | $0.2M | $0.2M | $0.2M | $0.3M | $0.3M |
| **Total OpEx** | **$2.4M** | **$2.8M** | **$2.9M** | **$3.2M** | **$3.3M** |

### Business Value (Years 1-5)
| Benefit Category | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|------------------|--------|--------|--------|--------|--------|
| License Consolidation | $1.2M | $1.8M | $1.9M | $2.0M | $2.1M |
| Infrastructure Savings | $0.8M | $1.5M | $1.6M | $1.7M | $1.8M |
| Labor Efficiency (${customerProfile.baseline.dataOpsFTEs} → 18 FTEs) | $0.7M | $1.4M | $1.5M | $1.6M | $1.7M |
| Reduced Integration Costs | $0.5M | $1.0M | $1.1M | $1.2M | $1.3M |
| Faster Insights (Revenue Impact) | $0.3M | $1.6M | $2.0M | $2.4M | $2.8M |
| **Total Benefits** | **$3.5M** | **$7.3M** | **$8.1M** | **$8.9M** | **$9.7M** |

### Net Cash Flow
| Year | Total Costs | Total Benefits | Net Cash Flow | Cumulative |
|------|-------------|----------------|---------------|------------|
| Year 0 | $2.2M | $0.0M | -$2.2M | -$2.2M |
| Year 1 | $4.55M | $3.5M | -$1.05M | -$3.25M |
| Year 2 | $3.9M | $7.3M | +$3.4M | **+$0.15M** ← Payback |
| Year 3 | $2.9M | $8.1M | +$5.2M | +$5.35M |
| Year 4 | $3.2M | $8.9M | +$5.7M | +$11.05M |
| Year 5 | $3.3M | $9.7M | +$6.4M | +$17.45M |

**NPV @ 10% Discount Rate:** $7.3M

---

## Key Assumptions & Validation

| Assumption | Value | Source | Sensitivity |
|------------|-------|--------|-------------|
| Discount Rate | 10% | WACC estimate | Medium |
| Implementation Timeline | 18-24 months | SAP benchmarks | Low |
| FTE Reduction | 7 FTEs (28%) | Industry avg | High |
| License Consolidation | $1.9M/year | Decommission list | Low |
| Revenue Impact (Faster Insights) | 0.5% revenue growth | Conservative | High |

---

## Sensitivity Analysis

### NPV Sensitivity to Key Variables
| Variable | -20% | Base Case | +20% |
|----------|------|-----------|------|
| Implementation Cost | $8.4M | $7.3M | $6.2M |
| Business Value | $4.1M | $7.3M | $10.5M |
| Discount Rate | $8.9M | $7.3M | $5.9M |

### Break-Even Analysis
- **Minimum annual benefit to justify investment:** $3.8M (52% of projected)
- **Maximum implementation cost before NPV turns negative:** $8.9M (163% of projected)

### Risk Scenarios
#### Conservative Case (70% of projected benefits)
- Annual Benefit: $5.1M
- NPV: $4.2M
- Payback: 14 months

#### Optimistic Case (130% of projected benefits)
- Annual Benefit: $9.5M
- NPV: $11.8M
- Payback: 7 months

---

## Financial Risk Assessment

### Implementation Risk
- **Probability:** 15%
- **Impact:** +20% cost overrun
- **Mitigation:** Fixed-price implementation contracts, phased go-live

### Business Value Risk
- **Probability:** 25%
- **Impact:** 30% lower benefits in Year 1
- **Mitigation:** Conservative ramp-up assumptions, pilot programs

### Adoption Risk
- **Probability:** 20%
- **Impact:** Delayed benefits realization (6-month slip)
- **Mitigation:** Change management investment, executive sponsorship

**Risk-Adjusted NPV:** $5.8M (vs $7.3M base case)

REMEMBER: Transparent assumptions build CFO trust. Show the math, don't hide risks.`
  };
};
