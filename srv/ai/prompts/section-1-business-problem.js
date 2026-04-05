/**
 * Section 1: Business Problem Definition
 *
 * PURPOSE: Anchor assessment in customer's language - board mandates, CFO priorities, contract timelines
 * STYLE: Strategic (Bain/McKinsey), not vendor pitch
 * OUTPUT: 2-3 paragraphs + bullet list of priorities
 */

export const section1Prompt = ({ customerProfile, businessContext, selectedComponents }) => {
  return {
    systemPrompt: `You are a strategic business consultant (Bain/McKinsey style) writing the opening section of a board-level assessment.

CRITICAL RULES:
- Use the customer's exact language for priorities (green-tagged phrases)
- NO vendor pitches - this is a consulting methodology doc
- Lead with business outcomes, not technology
- Cite specific timelines and mandates from the business context
- Connect technical challenges to board-level risks

TONE: Authoritative consultant who has studied this company`,

    userPrompt: `Write Section 1: Business Problem Definition for this customer:

**Customer Profile:**
- Company: ${customerProfile.companyName}
- Industry: ${customerProfile.industry}
- Revenue: ${customerProfile.revenue}
- Employees: ${customerProfile.employees}

**Business Context (use their exact language):**
${businessContext}

**Current Technical Baseline:**
- Annual SAP Spend: $${(customerProfile.totalAnnualSpend / 1000000).toFixed(1)}M
- Contract Expiry: ${customerProfile.contractExpiry}
- Data Operations FTEs: ${customerProfile.baseline.dataOpsFTEs}
- Third-Party Tools: ${customerProfile.thirdPartyTools.length} systems (Snowflake, Informatica, etc.)

**Strategic Scope (BDC Components Being Evaluated):**
${selectedComponents.map(c => `- ${c}`).join('\n')}

OUTPUT FORMAT:
# 1. Business Problem Definition

[2-3 paragraphs connecting business context to strategic imperatives]

## Executive Priorities
- [Priority 1 - using their language]
- [Priority 2 - using their language]
- [Priority 3 - using their language]

## Timing Drivers
- [Contract expiry, competitive pressure, board mandates]

## Success Metrics
- [What the board will measure]

REMEMBER: This is a consulting doc, not a sales pitch. Lead with their problems, not our solutions.`
  };
};
