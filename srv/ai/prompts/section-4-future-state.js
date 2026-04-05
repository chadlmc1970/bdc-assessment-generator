/**
 * Section 4: Future-State Architecture
 *
 * PURPOSE: Strategic recommendation (not product pitch) - BDC components as delivery mechanism
 * STYLE: Architectural blueprint with business outcomes
 * OUTPUT: Logical architecture diagram + capability map + business value drivers
 */

export const section4Prompt = ({ customerProfile, businessContext, selectedComponents, benchmarks }) => {
  return {
    systemPrompt: `You are a strategic business consultant designing the future-state technical architecture.

CRITICAL RULES:
- Lead with BUSINESS CAPABILITIES (analytics, governance, integration) NOT products
- Show BDC components as *delivery mechanisms* for capabilities
- Map each capability to board-level outcomes
- Architecture must solve Section 1 problems and close Section 2 gaps
- NO marketing language - this is an architectural blueprint

TONE: Enterprise architect presenting to CFO/CIO`,

    userPrompt: `Write Section 4: Future-State Architecture for this customer:

**Customer Profile:**
- Company: ${customerProfile.companyName}
- Industry: ${customerProfile.industry}

**Business Context (from Section 1):**
${businessContext}

**Selected BDC Components:**
${selectedComponents.map(c => `- ${c}`).join('\n')}

**Current-State Problems (from Section 2):**
- Fragmentation: ${customerProfile.entitlements.length} SAP products + ${customerProfile.thirdPartyTools.length} third-party tools
- High integration costs: $${(customerProfile.baseline.integrationCost / 1000000).toFixed(1)}M/year
- Oversized data ops team: ${customerProfile.baseline.dataOpsFTEs} FTEs

**Target Outcomes:**
- [Infer from business context - cost reduction, faster insights, AI-ready architecture]

OUTPUT FORMAT:
# 4. Future-State Architecture

## Strategic Vision
[2-3 paragraphs describing the target-state - unified data foundation, self-service analytics, governed AI]

## Capability Map
| Business Capability | Target State | Delivered By (BDC Component) | Business Outcome |
|---------------------|--------------|------------------------------|------------------|
[Map each selected component to business capability and outcome]

## Logical Architecture
[Text-based diagram showing:
- Data ingestion layer
- Unified data foundation (Datasphere)
- Analytics/AI layer
- Governance/security layer]

## Integration & Migration Strategy
### Phase 1: Foundation (Months 1-6)
- [Datasphere deployment]
- [Data migration from fragmented sources]

### Phase 2: Analytics Enablement (Months 7-12)
- [Analytics Cloud rollout]
- [Self-service enablement]

### Phase 3: Advanced Capabilities (Months 13-24)
- [AI/ML workloads]
- [Predictive analytics]

## Decommissioning Roadmap
[Which third-party tools get replaced, which SAP products get consolidated]

## Operational Model Changes
- Data Ops Team: ${customerProfile.baseline.dataOpsFTEs} FTEs → [Target] FTEs
- Infrastructure: On-prem → Cloud
- Governance: Manual → Automated

REMEMBER: This is NOT a product pitch. It's an architectural blueprint solving their business problems.`
  };
};
