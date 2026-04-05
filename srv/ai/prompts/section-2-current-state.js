/**
 * Section 2: Current-State Assessment
 *
 * PURPOSE: Systems map showing fragmentation + entitlement inventory + maturity gaps
 * STYLE: Data-driven, visual, diagnostic
 * OUTPUT: System map diagram + entitlement table + maturity scorecard
 */

export const section2Prompt = ({ customerProfile, benchmarks }) => {
  return {
    systemPrompt: `You are a strategic business consultant documenting the current-state technical landscape.

CRITICAL RULES:
- Show fragmentation visually (ASCII diagrams accepted for POC)
- Enumerate all SAP entitlements with annual costs
- List third-party tools showing redundancy with SAP portfolio
- Compare maturity scores to industry benchmarks
- Diagnose gaps objectively (NOT as setup for SAP pitch)

TONE: Diagnostic consultant analyzing technical debt`,

    userPrompt: `Write Section 2: Current-State Assessment for this customer:

**Customer Profile:**
- Company: ${customerProfile.companyName}
- Industry: ${customerProfile.industry}

**SAP Entitlements (${customerProfile.entitlements.length} products):**
${customerProfile.entitlements.map(e => `- ${e.product}: $${(e.annualCost / 1000).toFixed(0)}K/year`).join('\n')}
**Total SAP Spend:** $${(customerProfile.totalAnnualSpend / 1000000).toFixed(1)}M/year

**Third-Party Data/Analytics Tools:**
${customerProfile.thirdPartyTools.map(t => `- ${t.name}: $${(t.annualCost / 1000).toFixed(0)}K/year`).join('\n')}

**Operational Baseline:**
- Infrastructure Cost: $${(customerProfile.baseline.infrastructureCost / 1000000).toFixed(1)}M/year
- Data Operations Team: ${customerProfile.baseline.dataOpsFTEs} FTEs
- Integration Spend: $${(customerProfile.baseline.integrationCost / 1000000).toFixed(1)}M/year

**Industry Benchmarks (${benchmarks.industry}):**
- Median Analytics TCO: $${(benchmarks.medianAnalyticsTCO / 1000000).toFixed(1)}M
- Median Data Ops per $1B Revenue: ${benchmarks.medianDataOpsPerBillionRevenue} FTEs
- Median Integration Cost % of IT Budget: ${benchmarks.medianIntegrationCostPercent}%

OUTPUT FORMAT:
# 2. Current-State Assessment

## System Landscape
[Text-based system map showing fragmentation - SAP systems, third-party tools, integration points]

## Entitlement Inventory
| Product | Annual Cost | Maturity Level | Usage Rate |
|---------|------------|----------------|------------|
[Table of SAP entitlements]

## Third-Party Overlap Analysis
[Table showing which third-party tools duplicate SAP BDC capabilities]

## Maturity Scorecard vs Industry Benchmarks
| Dimension | Current Score | Industry Median | Gap |
|-----------|---------------|-----------------|-----|
[Maturity assessment]

## Cost Inefficiency Diagnosis
- [Fragmentation tax: integration costs, duplicate licenses]
- [Underutilized entitlements]
- [Skills gaps requiring external consultants]`
  };
};
