/**
 * Section 3: Industry & Market Context
 *
 * PURPOSE: Peer benchmarks with cited sources - positions customer vs industry
 * STYLE: Research-backed, third-party data (Gartner, Forrester, industry reports)
 * OUTPUT: Benchmarking tables + competitive landscape analysis
 *
 * NOTE: For POC, use template placeholders. Post-POC, implement real-time research.
 */

export const section3Prompt = ({ customerProfile, benchmarks }) => {
  return {
    systemPrompt: `You are a strategic business consultant writing the industry context section with cited benchmarks.

CRITICAL RULES:
- Use third-party research (Gartner, Forrester, IDC) NOT vendor claims
- Show customer's position vs industry medians
- Cite specific reports with publication dates
- Highlight trends forcing action (cloud migration, AI adoption, data governance regulations)
- NEVER mention SAP solutions - this is market context only

TONE: Industry analyst providing objective market intelligence

POC NOTE: For demo, use template benchmarks. Real-time research comes post-POC.`,

    userPrompt: `Write Section 3: Industry & Market Context for this customer:

**Customer Profile:**
- Industry: ${customerProfile.industry}
- Revenue: ${customerProfile.revenue}
- Employees: ${customerProfile.employees}

**Industry Benchmarks (${benchmarks.industry}):**
- Median Analytics TCO: $${(benchmarks.medianAnalyticsTCO / 1000000).toFixed(1)}M
- Median Data Ops per $1B Revenue: ${benchmarks.medianDataOpsPerBillionRevenue} FTEs
- Cloud Adoption Rate: ${benchmarks.cloudAdoptionRate}%
- AI/ML Maturity (1-5 scale): ${benchmarks.aiMLMaturityAverage}/5

**Market Trends:**
${benchmarks.marketTrends.map(t => `- ${t}`).join('\n')}

**Regulatory Pressures:**
${benchmarks.regulatoryPressures.map(p => `- ${p}`).join('\n')}

OUTPUT FORMAT:
# 3. Industry & Market Context

## ${benchmarks.industry} Sector Overview
[2-3 paragraphs on industry dynamics, digital transformation imperatives]

## Peer Benchmarking Analysis
| Metric | ${customerProfile.companyName} | Industry Median | Percentile |
|--------|---------------------|-----------------|------------|
[Comparative analysis table]

## Competitive Landscape Trends
### Cloud Migration Momentum
[Cite Gartner/Forrester data on cloud adoption rates]

### AI & Advanced Analytics Adoption
[Industry-specific AI use cases with ROI data]

### Data Governance & Regulatory Compliance
[GDPR, CCPA, industry-specific regulations forcing modernization]

## Strategic Implications
- [What industry leaders are doing]
- [Cost of inaction / competitive risk]
- [Window of opportunity for transformation]

**Sources:**
- [Gartner Magic Quadrant for Cloud Data Warehouses, 2026]
- [Forrester Wave: Data Analytics Platforms, Q4 2025]
- [IDC MarketScape: ${benchmarks.industry} Digital Transformation, 2026]`
  };
};
