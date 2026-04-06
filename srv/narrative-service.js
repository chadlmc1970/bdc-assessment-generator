/**
 * Narrative Service - Pre-Baked Claude Assessment Streaming
 * Streams pre-written assessment narratives character-by-character via SSE
 */

const fs = require('fs');
const path = require('path');

/**
 * Stream assessment narrative via Server-Sent Events
 * GET /api/narrative/stream-assessment?customer=loves
 */
async function streamAssessment(req, res) {
  const customerName = req.query.customer || 'loves';

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Disable nginx buffering
  });

  try {
    // Load pre-baked narrative
    const narrative = await loadNarrative(customerName);

    // Stream in phases with agent coordination
    await streamPhase(res, 'agent-start', {
      agent: 'Financial Model Agent',
      status: 'initializing',
      message: 'Loading customer financial data...'
    });

    await delay(800);

    await streamPhase(res, 'agent-progress', {
      agent: 'Financial Model Agent',
      status: 'processing',
      message: 'Calculating 3-tier investment scenarios...',
      progress: 33
    });

    // Stream Executive Summary
    await streamText(res, narrative.executiveSummary, 'executive-summary', 'Financial Model Agent');

    await streamPhase(res, 'agent-complete', {
      agent: 'Financial Model Agent',
      status: 'complete',
      progress: 100
    });

    await delay(600);

    // ECIF Calculator Agent starts
    await streamPhase(res, 'agent-start', {
      agent: 'ECIF Calculator Agent',
      status: 'initializing',
      message: 'Analyzing co-funding eligibility...'
    });

    await delay(700);

    await streamPhase(res, 'agent-progress', {
      agent: 'ECIF Calculator Agent',
      status: 'processing',
      message: 'Validating customer tier and data platform...',
      progress: 50
    });

    // Stream ECIF Funding section
    await streamText(res, narrative.ecifFunding, 'ecif-funding', 'ECIF Calculator Agent');

    await streamPhase(res, 'agent-complete', {
      agent: 'ECIF Calculator Agent',
      status: 'complete',
      progress: 100
    });

    await delay(600);

    // Narrative Generator Agent starts
    await streamPhase(res, 'agent-start', {
      agent: 'Narrative Generator Agent',
      status: 'initializing',
      message: 'Synthesizing strategic assessment...'
    });

    await delay(800);

    await streamPhase(res, 'agent-progress', {
      agent: 'Narrative Generator Agent',
      status: 'processing',
      message: 'Generating executive recommendations...',
      progress: 40
    });

    // Stream Industry Context
    await streamText(res, narrative.industryContext, 'industry-context', 'Narrative Generator Agent');

    await delay(400);

    // Stream Technical Assessment
    await streamText(res, narrative.technicalAssessment, 'technical-assessment', 'Narrative Generator Agent');

    await delay(400);

    // Stream Financial Analysis
    await streamText(res, narrative.financialAnalysis, 'financial-analysis', 'Narrative Generator Agent');

    await delay(400);

    // Stream Recommendations
    await streamText(res, narrative.recommendations, 'recommendations', 'Narrative Generator Agent');

    await streamPhase(res, 'agent-complete', {
      agent: 'Narrative Generator Agent',
      status: 'complete',
      progress: 100
    });

    await delay(500);

    // All agents complete
    await streamPhase(res, 'all-complete', {
      message: 'Assessment generation complete',
      timestamp: new Date().toISOString()
    });

    res.write('event: done\ndata: {}\n\n');
    res.end();

  } catch (error) {
    console.error('Narrative streaming error:', error);
    res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}

/**
 * Stream text content character-by-character
 */
async function streamText(res, text, section, agent) {
  // Send section header
  await streamPhase(res, 'section-start', {
    section,
    agent
  });

  await delay(200);

  // Split into chunks of 15-30 characters
  const chunkSize = Math.floor(Math.random() * 16) + 15; // 15-30
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  // Stream each chunk
  for (const chunk of chunks) {
    res.write(`event: text\ndata: ${JSON.stringify({ text: chunk, section })}\n\n`);
    await delay(50); // 50ms between chunks
  }

  // Section complete
  await streamPhase(res, 'section-complete', {
    section,
    agent
  });

  await delay(300);
}

/**
 * Stream agent phase/status update
 */
async function streamPhase(res, eventType, data) {
  res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Load pre-baked narrative for customer
 */
async function loadNarrative(customerName) {
  const narrativePath = path.join(__dirname, 'data', 'narratives', `${customerName}-assessment.json`);

  try {
    if (fs.existsSync(narrativePath)) {
      const data = JSON.parse(fs.readFileSync(narrativePath, 'utf8'));
      return data;
    }
  } catch (error) {
    console.warn(`Failed to load narrative for ${customerName}, using default`, error);
  }

  // Default Loves narrative
  return {
    executiveSummary: `Love's Travel Stops stands at a critical inflection point. With 897 orders monthly and a 23% manual correction rate, the company is experiencing $160,700 in annual operational waste. However, their recent Datasphere investment and Snowflake data platform position them ideally for AI-powered transformation. Our analysis reveals three viable investment scenarios ranging from $1.2M to $2.8M, each delivering 215-227% ROI with payback periods of 16-23 months. The recommended $1.67M investment qualifies for $950,000 in ECIF co-funding, reducing net investment to just $720K while positioning Love's for their planned S4/Rise migration.`,

    ecifFunding: `Love's qualifies for ECIF Premium Tier co-funding based on their Snowflake data warehouse implementation. The recommended scenario ($1.67M investment) triggers 25% co-funding of $950,000, with an additional $250,000 available if they commit to S4 migration within 12 months. This brings total available co-funding to $1.2M, reducing their net investment to $470K. Co-funding is structured as: 40% upfront upon project kickoff, 30% at technical go-live, and 30% upon reaching adoption milestones (80% user adoption + 3 months stable operation). Love's current SAP relationship and Snowflake implementation make them a preferred ECIF candidate.`,

    industryContext: `The retail and travel sector is experiencing unprecedented data complexity. Gartner reports that companies like Love's face average order error rates of 12%, while Love's current 23% rate suggests systemic data quality gaps. Industry leaders are consolidating data architectures, with 67% expected to complete cloud ERP migrations by 2027. The competitive pressure is tangible: early adopters of AI-powered data platforms are achieving 85% error reduction and 65% faster time-to-insights. Love's multi-location footprint (670+ stores) and high-velocity order processing (897/month) mirror the profile of successful Datasphere adopters who've achieved 30-40% TCO reduction while improving data quality.`,

    technicalAssessment: `Love's technical landscape reveals strategic opportunity. Their ECC On-Premise and BW/4 environment represents classic modernization candidates, while their new Datasphere investment provides an ideal integration hub. The Snowflake data warehouse—uncommon in SAP ecosystems—actually strengthens their position for ECIF funding and positions Love's as a multi-cloud innovator. SAP's modernization patterns suggest a 9-month average timeline for ECC to S4 migration, aligning perfectly with Love's stated evaluation timeline. The recommended approach: expand Datasphere with AI Core integration now, establishing the data foundation, then migrate ECC to S4/Rise in a phased 12-month rollout. This sequencing minimizes risk while maximizing the S4 migration's data quality from day one.`,

    financialAnalysis: `Three scenarios emerge from financial modeling. Conservative ($1.2M investment): Datasphere-only expansion with pre-built connectors and basic data quality automation—delivers $2.08M three-year return, 215% ROI, 23-month payback. Recommended ($1.67M investment): Adds SAP AI Core for intelligent data validation and predictive error detection—achieves $3.79M return, 227% ROI, 18-month payback, and qualifies for $950K ECIF co-funding. Aggressive ($2.79M investment): Full BDC stack including SAC embedded analytics and AI-powered insights across all 670 stores—delivers $6.25M return, 227% ROI, 16-month payback. All scenarios account for implementation ramp (50% returns Year 1, 100% Years 2-3) and use conservative 10% discount rate for NPV calculations. The recommended scenario balances investment scale with ECIF leverage and strategic S4 alignment.`,

    recommendations: `Proceed with the Recommended scenario ($1.67M, $950K ECIF co-funded). Immediate next steps: (1) Submit ECIF application within 30 days to lock Q2 funding—requires technical architecture doc and executive sponsor commitment, (2) Schedule 2-day technical workshop with Karissa Stephenson, Bob Armstrong, and SAP Datasphere architects to validate integration patterns, (3) Align Datasphere+AI rollout with Paul Smith's S4/Rise evaluation timeline—position the data foundation as de-risking the ERP migration, (4) Pilot AI-powered validation on 1-2 high-error order types (estimated 30-45 days to value). Risk mitigation: Phased rollout across store clusters, leverage SAP Customer Success playbook from three similar retail/travel customers who achieved 85%+ error reduction. Timeline: 60-day kickoff, 4-month core implementation, 2-month adoption ramp—total 6-month runway to full value realization.`
  };
}

/**
 * Utility: Delay promise
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  streamAssessment
};
