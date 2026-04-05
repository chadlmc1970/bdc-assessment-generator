/**
 * PDF Generator (stub implementation)
 * TODO: Full PDF export with charts when needed
 */

function generatePDF(data) {
  // Return simple markdown export for MVP
  const { customer, scenarioData, selectedScenario, narrative } = data;
  const scenario = scenarioData[selectedScenario];

  const markdown = `# BDC Assessment - ${customer.name}

## Selected Scenario: ${selectedScenario}

**Investment:** $${(scenario.investment / 1000000).toFixed(2)}M
**Timeline:** ${scenario.timeline} months
**ROI:** ${scenario.roi}%
**Payback:** ${scenario.payback} months
**NPV (3yr):** $${(scenario.npv / 1000000).toFixed(2)}M

## Strategic Analysis

${narrative}

## Components

${scenario.components.join('\n')}

## Key Metrics

- Annual Return: $${(scenario.annualReturn / 1000000).toFixed(2)}M
- Total Investment: $${(scenario.investment / 1000000).toFixed(2)}M
- Scope: ${scenario.scopePercent}%
${scenario.ecifFunding > 0 ? `- ECIF Co-sell Funding: $${(scenario.ecifFunding / 1000000).toFixed(2)}M\n` : ''}

---
Generated: ${data.generatedAt}
`;

  return Buffer.from(markdown);
}

module.exports = { generatePDF };
