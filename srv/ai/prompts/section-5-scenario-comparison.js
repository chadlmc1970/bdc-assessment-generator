/**
 * Section 5: Three-Scenario Comparison ⭐ THE KILLER MOVE
 *
 * PURPOSE: Unbiased comparison - Status Quo vs Best-of-Breed vs SAP BDC
 * STYLE: Financial modeling with same assumptions across all scenarios
 * OUTPUT: NPV/IRR/ROI comparison + cost breakdown + risk assessment
 *
 * NOTE: For POC, use hardcoded NPV values from example PDFs. Post-POC, implement real calculations.
 */

export const section5Prompt = ({ customerProfile, selectedComponents }) => {
  return {
    systemPrompt: `You are a strategic business consultant modeling three alternative scenarios with unbiased financial analysis.

CRITICAL RULES:
- This is THE strategic differentiator - we model competitive alternatives honestly
- Same assumptions across all scenarios (discount rate, implementation timeline, business value)
- Show Best-of-Breed (Snowflake + Databricks + Fivetran) as viable alternative
- Financial model must be defensible to CFO/board
- NO thumb on scale for SAP - let numbers speak

TONE: Investment banker presenting to board

WHY THIS WORKS: Modeling competitive alternatives builds trust. CFOs know we're not hiding risks.`,

    userPrompt: `Write Section 5: Three-Scenario Comparison for this customer:

**Customer Profile:**
- Company: ${customerProfile.companyName}
- Revenue: ${customerProfile.revenue}
- Current SAP Spend: $${(customerProfile.totalAnnualSpend / 1000000).toFixed(1)}M/year
- Current Third-Party Spend: $${(customerProfile.thirdPartyTools.reduce((sum, t) => sum + t.annualCost, 0) / 1000000).toFixed(1)}M/year
- Data Ops FTEs: ${customerProfile.baseline.dataOpsFTEs}

**Selected BDC Components:**
${selectedComponents.map(c => `- ${c}`).join('\n')}

**POC Note:** For demo, use these hardcoded NPV values from Financial Appendix example:
- Scenario 1 (Status Quo): NPV = -$2.1M (do nothing = negative value)
- Scenario 2 (Best-of-Breed): NPV = $4.8M (Snowflake + Databricks stack)
- Scenario 3 (SAP BDC): NPV = $7.3M (integrated SAP suite)

OUTPUT FORMAT:
# 5. Three-Scenario Financial Comparison

## Modeling Assumptions (Applied Uniformly)
| Assumption | Value |
|------------|-------|
| Discount Rate | 10% |
| Analysis Period | 5 years |
| Implementation Timeline | 18-24 months |
| Business Value (Efficiency Gains) | $5.2M annually |
| Risk Adjustment | Included per scenario |

---

## Scenario 1: Status Quo (Do Nothing)

### Description
Continue with current fragmented landscape - ${customerProfile.entitlements.length} SAP products + ${customerProfile.thirdPartyTools.length} third-party tools

### 5-Year Financial Model
| Year | License Costs | Infrastructure | Labor | Integration | Total Cost | NPV |
|------|---------------|----------------|-------|-------------|------------|-----|
[Annual cost projections with escalation]

**NPV:** -$2.1M (negative = value destruction)
**IRR:** N/A (no investment)
**Payback:** N/A

### Risks
- Growing technical debt
- Escalating integration costs
- Competitive disadvantage (peers modernizing faster)

---

## Scenario 2: Best-of-Breed (Cloud Data Stack)

### Description
Snowflake (data warehouse) + Databricks (lakehouse) + Fivetran (ETL) + Tableau (BI)

### 5-Year Financial Model
| Year | License Costs | Implementation | Migration | Labor | Total Cost | NPV |
|------|---------------|----------------|-----------|-------|------------|-----|
[Annual cost projections]

**Net Investment:** $6.8M over 24 months
**NPV:** $4.8M
**IRR:** 31%
**Payback:** 18 months

### Strengths
- Best-in-class individual components
- Mature vendor ecosystem
- Strong community support

### Risks
- Integration complexity across 4+ vendors
- No unified governance layer
- Skills gaps for multiple platforms
- Vendor lock-in across multiple contracts

---

## Scenario 3: SAP Business Data Cloud

### Description
Integrated SAP BDC suite: ${selectedComponents.join(', ')}

### 5-Year Financial Model
| Year | License Costs | Implementation | Migration | Labor | Total Cost | NPV |
|------|---------------|----------------|-----------|-------|------------|-----|
[Annual cost projections with BDC discounts]

**Net Investment:** $5.45M over 24 months
**NPV:** $7.3M
**IRR:** 42%
**Payback:** 9 months

### Strengths
- Unified governance and security
- Native SAP integration (no middleware tax)
- Single vendor contract
- Leverage existing SAP skills

### Risks
- SAP platform dependency
- Change management for new tools

---

## Recommended Approach

Based on unbiased financial modeling, **Scenario 3 (SAP BDC)** delivers:
- **$2.5M higher NPV** than Best-of-Breed
- **9-month faster payback**
- **Lower integration risk** (unified platform vs multi-vendor)

**But** the decision should factor in:
- Organizational readiness for change
- Strategic importance of SAP ecosystem
- Risk tolerance for vendor consolidation

REMEMBER: We modeled competitive alternatives honestly - that's what makes this analysis credible to CFOs.`
  };
};
