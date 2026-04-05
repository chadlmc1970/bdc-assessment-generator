# BDC Assessment Generator - Context Recovery

**Date:** April 4, 2026
**Status:** Day 1 complete - CAP project initialized, pivoting to markdown output
**Demo Audience:** Shane Gorman (CRO Data & AI Americas - BDC + BTP)
**Timeline:** Working POC by end of week

---

## Project Vision

**Problem:** Internal SAP AEs generate generic sales pitches that lack credibility with CFOs/boards

**Solution:** AI-powered conversational agent that generates **consulting-grade strategic assessments** (not vendor pitches) following Bain/McKinsey methodology

**Key Differentiator:** 3-scenario comparison (Status Quo vs Best-of-Breed vs SAP BDC) with unbiased financial modeling - positions AE as strategic consultant who shapes evaluation criteria before vendor shortlist

---

## Architecture Decisions

| Decision | Choice |
|----------|--------|
| **Data sources** | Manual AE input + agent-inferred benchmarks (no CRM/360 for POC) |
| **Industry research** | Template-based Section 3 for POC (real-time research post-POC) |
| **Financial modeling** | Hardcoded 3-scenario TCO from example PDFs |
| **Output format** | **PIVOT: Markdown matching Love's PDF structure** (not pdfmake) |
| **Deployment** | SAP BTP Cloud Foundry + CAP + AI Core Gen AI Hub |
| **Scope** | POC with shortcuts - prove concept this week |

---

## 8-Section Document Structure (Consulting Methodology)

Based on Love's Roster Card example PDFs:

### Section 1: Business Problem Definition
- Anchor in customer's priorities (green-tagged as "their language")
- Board mandates, CFO priorities, contract timelines
- **POC:** Use AE's deal context input

### Section 2: Current-State Assessment
- Systems map showing fragmentation
- Entitlement inventory + maturity gaps
- **POC:** Southeast Energy entitlements + O&G benchmarks

### Section 3: Industry & Market Context
- Peer benchmarks with cited sources
- **POC:** Template placeholders (real-time research post-POC)

### Section 4: Future-State Architecture
- Strategic recommendation (not product pitch)
- BDC components positioned as delivery mechanism

### Section 5: Scenario Comparison ⭐ **THE KILLER MOVE**
- Status Quo vs Best-of-Breed vs SAP BDC
- Same assumptions, unbiased comparison
- **POC:** Hardcoded NPV values from example PDFs

### Section 6: Financial Model & Sensitivity
- NPV/IRR/ROI per scenario
- Assumptions table with transparency
- **POC:** Copy tables from Financial Appendix PDF

### Section 7: Risk & Change Management
- What Bain includes, vendors skip
- Migration complexity, skills gaps, change management

### Section 8: Recommended Roadmap
- 3-phase implementation tied to business outcomes

---

## Conversation Flow (5 Steps)

### Step 1: Customer Context Extraction
**Agent:** "Which customer are you working on?"
**AE:** Types "Southeast Energy Corp"
**Agent:** Displays briefing card with inferred data (profile, entitlements, baseline costs)

### Step 2: Business Context Capture
**Agent:** "What's the business context? Executive priorities, timing drivers, competitive pressure?"
**AE:** "CFO wants 15% headcount reduction. Snowflake renewal in 8 months. Board wants AI-ready architecture by Q3."
**Agent:** Extracts structured priorities for Section 1

### Step 3: BDC Component Selection
**Agent:** Shows component chips (Datasphere, DWC, Data Intelligence, Analytics Cloud, etc.)
**AE:** Selects 6 components
**Agent:** Maps to Section 4 architecture

### Step 4: Generation with Streaming Preview
**Agent:** Streams 8 sections as expandable preview cards (60-90 seconds)

### Step 5: Iterative Refinement
**Agent:** "Tell me what to change"
**AE:** "Make urgency stronger"
**Agent:** Regenerates Section 1 inline

**Total flow:** <3 minutes from start to markdown download

---

## Technical Stack

```
Project Root:  ~/bdc-assessment-generator/
Frontend:      React on BTP (or SAPUI5)
Backend:       SAP CAP (Node.js) on Cloud Foundry
Database:      In-memory state only (no HANA Cloud for POC)
AI:            SAP AI Core Gen AI Hub → Claude Sonnet 4.6
Output:        Markdown (matching Love's PDF structure)
Auth:          Skip for POC
```

### Key Dependencies Installed
- `@sap/cds` - CAP framework
- `@sap-ai-sdk/orchestration` - SAP AI Core client
- ~~`pdfmake`~~ - **REMOVED (using markdown instead)**

---

## Current File Structure

```
bdc-assessment-generator/
├── srv/
│   ├── data/
│   │   ├── hardcoded-customers.js    ✅ Southeast Energy + Acme Retail profiles
│   │   ├── benchmarks.js             ✅ Industry benchmarks by vertical
│   │   └── component-impacts.js      ⏳ TODO
│   ├── ai/
│   │   ├── claude-client.js          ⏳ TODO - SAP AI SDK wrapper
│   │   └── prompts/
│   │       ├── section-1-business-problem.js      ⏳ TODO
│   │       ├── section-2-current-state.js         ⏳ TODO
│   │       ├── section-3-industry-context.js      ⏳ TODO
│   │       ├── section-4-future-state.js          ⏳ TODO
│   │       ├── section-5-scenario-comparison.js   ⏳ TODO
│   │       ├── section-6-financial-model.js       ⏳ TODO
│   │       ├── section-7-risk-management.js       ⏳ TODO
│   │       └── section-8-roadmap.js               ⏳ TODO
│   ├── markdown/
│   │   └── formatter.js              ⏳ TODO - Format output matching Love's PDFs
│   ├── assessment-service.cds        ⏳ TODO - CAP service definition
│   └── assessment-service.js         ⏳ TODO - Service implementation
├── app/
│   ├── ConversationUI.tsx            ⏳ TODO
│   └── PreviewCards.tsx              ⏳ TODO
├── package.json                      ✅
└── mta.yaml                          ✅
```

---

## Reference Files from Existing Projects

**AI generation pattern:**
- `/Users/I870089/la-pathfinder/src/app/api/careers/generate/route.ts`
- AI SDK 6 + `Output.object()` + Zod validation

**BDC business context:**
- `/Users/I870089/CatchWeight/BDC_Feasibility_Brief.md`

**Example PDFs to reverse engineer:**
- `/Users/I870089/bdc-assessment-generator/Financial_Appendix_Summary.pdf` (9 pages)
- `/Users/I870089/bdc-assessment-generator/Roster_Card_Executive_Summary.pdf` (11 pages)

---

## Example Hardcoded Data (Southeast Energy)

```javascript
{
  companyName: 'Southeast Energy Corp',
  industry: 'Oil & Gas / Energy',
  revenue: '$4.8B',
  employees: 15200,
  ticker: 'SEEC',

  entitlements: [
    { product: 'SAP ECC 6.0', annualCost: 1800000 },
    { product: 'SAP BW 7.5', annualCost: 950000 },
    { product: 'SAP Analytics Cloud', annualCost: 420000 },
    // ... more
  ],
  totalAnnualSpend: 4900000,
  contractExpiry: 'June 2027',

  thirdPartyTools: [
    { name: 'Snowflake', annualCost: 380000 },
    { name: 'Informatica PowerCenter', annualCost: 420000 },
    // ... more
  ],

  baseline: {
    infrastructureCost: 6500000,
    dataOpsFTEs: 25,
    integrationCost: 2800000
  }
}
```

---

## Markdown Output Format (Matches Love's PDFs)

**Cover Page:**
```markdown
# Strategic Assessment
## Business Data Cloud Migration Analysis

**Company:** Southeast Energy Corp
**Industry:** Oil & Gas / Energy
**Prepared:** April 2026
**Net Investment:** $5.45M over 24 months
**Expected Return:** $7.3M annual (134% ROI, 9-month payback)

---
```

**Section Templates:** Use table/heading structure from Financial Appendix PDF

---

## Implementation Roadmap (Revised)

### ✅ Day 1 Complete
- CAP project initialized
- Customer profiles + benchmarks created
- Dependencies installed

### Day 2 (Today)
- Write 8 AI prompt templates
- Implement SAP AI SDK client
- Create markdown formatter (matching Love's PDF structure)
- Define CAP service (startConversation, selectComponents, generateAssessment)

### Day 3
- Build React conversation UI (chat interface + preview cards)
- Test end-to-end flow with Southeast Energy

### Day 4
- Polish and test
- Prepare demo talking points

### Day 5
- Final rehearsal
- Demo to Shane Gorman

---

## Success Metrics for Shane Demo

1. **Differentiation is obvious** - NOT a sales pitch generator
2. **3-scenario comparison lands** - Modeling competitive alternatives builds trust
3. **Speed is acceptable** - <3 minutes input to markdown download
4. **Output quality is credible** - Reads like McKinsey, not chatbot
5. **Strategic positioning clear** - AEs shape evaluation criteria, not just compete at RFP stage

---

## Demo Talking Points

- "We're positioning BDC AEs as strategic consultants, not vendors waiting for RFPs"
- "The killer move: 3-scenario comparison - we model Snowflake + Databricks honestly"
- "This is what makes CFOs take our docs to the board without feeling like sales pitches"
- "Every AE becomes a Bain consultant who brings a point of view"

---

## SAP BTP Trial Details

**Global Account:** 19704659trial
**Subaccount:** trial
**Space:** dev
**Region:** US East (VA) - AWS
**Services needed:** SAP AI Core Gen AI Hub access

---

## Key Pivot Decision (April 4 evening)

**Original:** Build pdfmake layouts for professional PDF generation
**Revised:** Output markdown matching Love's PDF structure
**Rationale:** Faster path to demo, Shane sees content quality (can convert to PDF post-demo)

---

## Next Session TODO

1. Create `srv/ai/claude-client.js` (SAP AI SDK wrapper)
2. Write 8 prompt files in `srv/ai/prompts/`
3. Create `srv/markdown/formatter.js` (output matching Financial Appendix structure)
4. Define CAP service in `srv/assessment-service.cds`
5. Implement service handlers in `srv/assessment-service.js`

---

## Critical Context to Remember

- This is an **internal SAP sales tool** for BDC AEs
- Output structure mirrors **consulting methodology** (Bain/McKinsey style)
- The **3-scenario comparison** is the strategic differentiator (unbiased modeling)
- POC shortcuts: hardcoded data, no persistence, simplified research
- Demo audience: Shane Gorman (CRO) expects strategic positioning, not just tech demo

---

**Resumption command:** "Continue BDC assessment generator implementation - Day 2 AI prompts"
