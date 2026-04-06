/**
 * BDC Assessment Generator - Express Server with HANA Integration
 * Scenario-based workflow: Interview -> 3 Scenarios -> Dashboard -> Export
 */

const cds = require('@sap/cds');
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { FinancialModel } = require('./financial-model');
const { calculateScenarios, adjustScenario } = require('./scenario-calculator');
const { generatePDF } = require('./pdf-generator');
const {
  connect,
  getCustomers,
  findCustomerById,
  searchCustomers,
  getCustomerWithEntitlements
} = require('./db-service');
const { analyzeCustomer } = require('./intelligence-service');
const { streamAssessment } = require('./narrative-service');

const PORT = process.env.PORT || 4005; // Changed from 4004 (CAP uses 4004)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const app = express();
app.use(express.json());

// Serve static files including PDFs
app.use(express.static('srv/public'));
app.use('/downloads', express.static('srv/public/downloads'));

// Health check
app.get('/health', async (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'bdc-assessment-generator-v3',
    version: '4.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    intelligenceService: 'ready',
    narrativeService: 'ready'
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    service: 'BDC Assessment Generator',
    version: '4.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      customers: 'GET /api/customers',
      search: 'GET /api/customers/search?q=name',
      scenarios: 'POST /api/scenarios',
      adjustScenario: 'POST /api/scenarios/adjust',
      narrative: 'GET /api/generate-narrative (SSE)',
      exportPdf: 'POST /api/export-pdf',
      chat: 'GET /api/chat (SSE, legacy)'
    }
  });
});

// Customer list endpoint
app.get('/api/customers', async (req, res) => {
  try {
    const ready = req.query.ready === 'true';
    let customers = await getCustomers();
    if (ready) {
      customers = customers.filter(c => c.bdcOverview === 'Yes');
    }
    res.json({ total: customers.length, customers });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers', message: error.message });
  }
});

// Customer search endpoint
app.get('/api/customers/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing query parameter: q' });

    const customers = await searchCustomers(query);
    if (!customers || customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found', query });
    }

    res.json(customers[0]);
  } catch (error) {
    console.error('Customer search error:', error);
    res.status(500).json({ error: 'Failed to search customers', message: error.message });
  }
});

// ===== NEW: Scenario-based endpoints =====

// POST /api/scenarios - Generate 3 scenarios from interview answers
app.post('/api/scenarios', async (req, res) => {
  try {
    const { customerId, interviewAnswers } = req.body;

    if (!customerId || !interviewAnswers) {
      return res.status(400).json({ error: 'Missing customerId or interviewAnswers' });
    }

    // Get customer with entitlements from HANA
    const customer = await getCustomerWithEntitlements(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found', customerId });
    }

    const result = calculateScenarios(customer, interviewAnswers);
    res.json(result);
  } catch (error) {
    console.error('Scenario calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate scenarios', message: error.message });
  }
});

// POST /api/scenarios/adjust - Recalculate a single scenario with slider adjustments
app.post('/api/scenarios/adjust', (req, res) => {
  try {
    const { scenario, adjustments } = req.body;
    if (!scenario || !adjustments) {
      return res.status(400).json({ error: 'Missing scenario or adjustments' });
    }
    const adjusted = adjustScenario(scenario, adjustments);
    res.json(adjusted);
  } catch (error) {
    console.error('Scenario adjustment error:', error);
    res.status(500).json({ error: 'Failed to adjust scenario', message: error.message });
  }
});

// GET /api/generate-narrative - Stream AI narrative for selected scenario (SSE)
app.get('/api/generate-narrative', async (req, res) => {
  try {
    const { customerId, scenarioType, investment, timeline, roi, payback, npv, scopePercent, ecifFunding, annualReturn, dealContext, components } = req.query;

    const customer = await findCustomerById(customerId);
    const customerName = customer ? customer.name : 'Unknown Customer';
    const customerErp = customer ? (customer.erpDeployment || 'Not specified') : 'N/A';
    const customerBw = customer ? (customer.existingBW || 'No') : 'N/A';
    const customerLake = customer ? (customer.otherDatalake || 'None') : 'None';

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemPrompt = `You are a senior SAP strategy consultant writing a brief, impactful scenario narrative.
Write 2-3 concise paragraphs (150-200 words total) analyzing the selected scenario.

Guidelines:
- Consulting-grade tone (McKinsey/Bain style)
- Reference specific numbers provided
- Highlight trade-offs and strategic rationale
- If ECIF funding is available, mention co-sell opportunity
- End with a clear recommendation or next step
- Do NOT use markdown headers or bullet points - just flowing prose`;

    const userPrompt = `Customer: ${customerName}
Current ERP: ${customerErp} | BW: ${customerBw} | Data Lake: ${customerLake}
${dealContext ? `Deal Context: ${dealContext}` : ''}

Selected Scenario: ${scenarioType || 'Recommended'}
Components: ${components || 'Datasphere, AI Core, SAC'}
Investment: $${Number(investment || 0).toLocaleString()}
Timeline: ${timeline || 12} months
Scope: ${scopePercent || 75}%
Annual Return: $${Number(annualReturn || 0).toLocaleString()}
ROI: ${roi || 0}%
Payback: ${payback || 12} months
NPV (3yr): $${Number(npv || 0).toLocaleString()}
${Number(ecifFunding || 0) > 0 ? `ECIF Co-sell Funding: $${Number(ecifFunding).toLocaleString()} (customer uses ${customerLake})` : ''}

Write a concise strategic narrative for this scenario.`;

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
    });

    stream.on('message', () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Narrative stream error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    });
  } catch (error) {
    console.error('Narrative error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate narrative', message: error.message });
    }
  }
});

// POST /api/export-pdf - Generate PDF with scenario data, charts, and assumptions
app.post('/api/export-pdf', async (req, res) => {
  try {
    const { customerId, interviewAnswers, selectedScenario, narrative } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Missing customerId' });
    }

    const customer = await getCustomerWithEntitlements(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found', customerId });
    }

    // Calculate scenarios to get full data
    const answers = interviewAnswers || {
      businessDriver: 'revenue_growth',
      timeline: '6-12_months',
      cloudPreference: 'multi_cloud',
      riskTolerance: 'balanced'
    };
    const scenarioData = calculateScenarios(customer, answers);

    const pdfBuffer = generatePDF({
      customer,
      scenarioData,
      selectedScenario: selectedScenario || 'recommended',
      narrative: narrative || '',
      generatedAt: new Date().toISOString()
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="BDC-Assessment-${customer.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', message: error.message });
  }
});

// ===== NEW: Multi-Source Intelligence & Narrative Streaming =====

// GET /api/intelligence/analyze-customer - Fetch multi-source data (CRM, Gartner, Benchmarks, Case Studies)
app.get('/api/intelligence/analyze-customer', analyzeCustomer);

// GET /api/narrative/stream-assessment - Stream pre-baked narrative via SSE
app.get('/api/narrative/stream-assessment', streamAssessment);

// ===== Legacy Chat Endpoint (SSE) =====

// Serve static files - must be after API routes
app.use(express.static('srv/public'));
app.use('/downloads', express.static('srv/public/downloads'));

// ===== Legacy chat endpoint (kept for backwards compatibility) =====
app.get('/api/chat', async (req, res) => {
  try {
    const customerId = req.query.customerId;
    const dealContext = req.query.dealContext;
    const userMessage = req.query.message || 'Please generate the full strategic BDC assessment.';

    let customerContext = '';
    let financials = null;

    if (customerId) {
      const customer = await getCustomerWithEntitlements(customerId);
      if (customer) {
        const financialModel = new FinancialModel(customer);
        financials = financialModel.calculate();

        let entitlementContext = '';
        if (customer.entitlementSets && customer.entitlementSets.length > 0) {
          entitlementContext = `\nEntitlement Sets (${customer.entitlementSummary?.totalSets || customer.entitlementSets.length} sets, ${customer.entitlementSummary?.totalOrders || 0} total orders):`;
          customer.entitlementSets.forEach(set => {
            entitlementContext += `\n  - Set ${set.id} (${set.type}): ${set.orders} orders, created ${set.created}`;
            if (set.solutionAreas) {
              entitlementContext += `\n    Solution Areas: ${Object.keys(set.solutionAreas).join(', ')}`;
            }
          });
          if (customer.entitlementSummary) {
            entitlementContext += `\nKey Areas: ${customer.entitlementSummary.keyAreas?.join(', ') || 'N/A'}`;
            entitlementContext += `\nAI: ${customer.entitlementSummary.hasAI ? 'Yes' : 'No'} | BTP: ${customer.entitlementSummary.hasBTP ? 'Yes' : 'No'}`;
          }
        }

        customerContext = `
Customer Profile:
- Name: ${customer.name}
- ERP: ${customer.erpDeployment || 'Not specified'}
- BW: ${customer.existingBW || 'No'}
- BPC: ${customer.bpc || 'No'}
- Datasphere: ${customer.existingDatasphere || 'No'}
- Data Lake: ${customer.otherDatalake || 'None'}
- Data Owner: ${customer.dataOwner || 'Not assigned'}
- AI Owner: ${customer.aiOwner || 'Not assigned'}
${customer.notes ? `- Notes: ${customer.notes}` : ''}
${entitlementContext}

FINANCIAL MODEL OUTPUT (use these exact numbers):
- Current SAP Spend: $${(financials.currentSpend / 1000000).toFixed(1)}M annually
- BDC Investment: $${(financials.investment / 1000000).toFixed(2)}M total
- Annual Return: $${(financials.annualReturn / 1000000).toFixed(1)}M
- ROI: ${financials.roi}%
- Payback: ${financials.paybackMonths} months
- NPV (3yr): $${(financials.npv / 1000000).toFixed(1)}M
`;
        if (dealContext) {
          customerContext += `\nDEAL CONTEXT: ${dealContext}\n`;
        }
      }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: 'You are a senior SAP Business Development Consultant. Generate a strategic BDC assessment.',
      messages: [{ role: 'user', content: `${customerContext}\n\n${userMessage}` }]
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
    });
    stream.on('message', () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });
    stream.on('error', (error) => {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    });
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat', message: error.message });
    }
  }
});

// Bootstrap CDS connection BEFORE starting server
async function startServer() {
  try {
    await connect();
    console.log('✓ CDS/HANA connection established');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Endpoints: /health, /api/scenarios, /api/generate-narrative`);
    });
  } catch (err) {
    console.error('✗ Failed to connect to HANA:', err);
    console.error('Cannot start server without database connection');
    process.exit(1);
  }
}

startServer();
