// Agent Demo - Scripted Content
// Wizard of Oz demo with pre-scripted briefings and reasoning steps

const AGENT_BRIEFINGS = {
  '190852': { // Love's Travel Stops
    customerName: 'Love\'s Travel Stops',
    customerId: '190852',
    briefing: {
      facts: [
        '897 active SAP orders across retail and logistics operations',
        'Currently using Snowflake data lake (excellent ECIF co-sell opportunity)',
        'Estimated $7.6M annual SAP spend based on order volume',
        'Strong BW/BEx usage indicating mature analytics capability'
      ],
      strategicContext: 'Love\'s is a prime candidate for SAP Datasphere + AI Core modernization. Their Snowflake investment shows commitment to cloud, and ECIF co-funding (25%) makes this highly competitive.',
      recommendedApproach: '3-phase rollout over 12 months with focus on operational cost reduction.'
    },
    scenarios: {
      conservative: {
        investment: 2.08,
        roi: 215,
        payback: 23,
        description: 'Datasphere-only, phased approach'
      },
      recommended: {
        investment: 3.79,
        roi: 227,
        payback: 18,
        description: 'Datasphere + AI Core + SAC'
      },
      aggressive: {
        investment: 6.25,
        roi: 227,
        payback: 16,
        description: 'Full stack with BTP + Joule'
      }
    },
    pdfFiles: {
      executive: 'loves-executive-summary.pdf',
      financial: 'loves-financial-appendix.pdf'
    }
  }
};

const REASONING_STEPS = [
  {
    time: 0,
    icon: '🔍',
    text: 'Analyzing customer profile...',
    detail: '897 orders detected, $7.6M annual spend estimated'
  },
  {
    time: 5000,
    icon: '✅',
    text: 'Customer profile complete',
    detail: 'Love\'s Travel Stops: Retail/Logistics, 897 orders'
  },
  {
    time: 8000,
    icon: '🔍',
    text: 'Checking ECIF eligibility...',
    detail: 'Snowflake data lake detected'
  },
  {
    time: 12000,
    icon: '✅',
    text: 'ECIF eligible!',
    detail: '25% co-funding available ($950K)'
  },
  {
    time: 15000,
    icon: '🔢',
    text: 'Calculating 3 scenarios...',
    detail: 'Conservative, Recommended, Aggressive models'
  },
  {
    time: 20000,
    icon: '✅',
    text: 'Financial models complete',
    detail: 'Recommended: $3.8M investment, 227% ROI, 18mo payback'
  },
  {
    time: 25000,
    icon: '✍️',
    text: 'Generating Section 1: Business Problem...',
    detail: 'Using customer language: "CFO mandate to reduce costs by Q4"'
  },
  {
    time: 35000,
    icon: '✍️',
    text: 'Generating Section 2: Current State...',
    detail: 'Documenting BW/BEx environment and Snowflake integration'
  },
  {
    time: 45000,
    icon: '✍️',
    text: 'Generating Section 3: Industry Context...',
    detail: 'Benchmarking against retail/logistics peers'
  },
  {
    time: 55000,
    icon: '✍️',
    text: 'Generating Section 4: Future State...',
    detail: 'Architecting Datasphere + AI Core solution'
  },
  {
    time: 65000,
    icon: '✍️',
    text: 'Generating Section 5: Scenario Comparison...',
    detail: 'Building 3-scenario Go/No-Go matrix'
  },
  {
    time: 75000,
    icon: '✍️',
    text: 'Generating Section 6: Financial Model...',
    detail: 'NPV, IRR, payback analysis with ECIF co-funding'
  },
  {
    time: 80000,
    icon: '✍️',
    text: 'Generating Section 7: Risk Management...',
    detail: 'Identifying implementation risks and mitigation'
  },
  {
    time: 85000,
    icon: '✍️',
    text: 'Generating Section 8: Roadmap...',
    detail: '3-phase implementation: Assess → Build → Scale'
  },
  {
    time: 90000,
    icon: '✅',
    text: 'Assessment complete!',
    detail: 'Executive Summary (11 pages) + Financial Appendix (10 pages) ready'
  }
];

const EXECUTIVE_PREVIEW = `Love's Travel Stops has a compelling opportunity to modernize their data platform with SAP Datasphere and AI Core. With 897 active orders and $7.6M in annual SAP spend, they are well-positioned for a 3-phase transformation.

The current BW/BEx environment, combined with their existing Snowflake investment, creates a unique ECIF co-funding opportunity worth $950K (25% of recommended investment). This significantly reduces net investment while accelerating cloud adoption.

Our analysis identifies $3.5M in annual returns from tool consolidation, productivity gains, and revenue impact...`;

// Export for use in agent-demo.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AGENT_BRIEFINGS, REASONING_STEPS, EXECUTIVE_PREVIEW };
}
