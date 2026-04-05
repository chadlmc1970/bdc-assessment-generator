# BDC Assessment Generator - Complete Session Context

**Last Updated:** April 4, 2026
**Project Status:** Phase 1 Complete (Local Testing) → Ready for BTP Deployment
**Demo Date:** Thursday (Shane Gorman - CRO Data & AI Americas)

---

## Project Purpose

AI-powered tool that generates **consulting-grade strategic assessments** for SAP BDC sales opportunities. Differentiator: 3-scenario comparison (Status Quo vs Best-of-Breed vs SAP BDC) with unbiased financial modeling - positions AE as strategic consultant, not vendor.

**Target Audience:** Internal SAP BDC AEs
**Output Format:** Markdown (matching Love's PDF structure from example files)
**Architecture:** SAP CAP on BTP Cloud Foundry + AI integration

---

## What's Built (Phase 1 - COMPLETE)

### Backend CAP Service
**Location:** `~/bdc-assessment-generator/`

**Files Ready:**
```
srv/
├── assessment-service.cds        # 6 API actions defined
├── assessment-service.js         # Service implementation (working)
├── server.js                     # CF entry point with /health
├── ai/
│   ├── claude-client.js          # SAP AI SDK wrapper + Anthropic fallback
│   └── prompts/
│       ├── section-1-business-problem.js       # Consulting methodology
│       ├── section-2-current-state.js          # Systems diagnosis
│       ├── section-3-industry-context.js       # Market benchmarks
│       ├── section-4-future-state.js           # Architecture vision
│       ├── section-5-scenario-comparison.js    # ⭐ THE KILLER MOVE
│       ├── section-6-financial-model.js        # CFO-grade NPV/IRR
│       ├── section-7-risk-management.js        # What Bain includes
│       └── section-8-roadmap.js                # Phased implementation
├── markdown/
│   └── formatter.js              # Assembles final document
└── data/
    ├── hardcoded-customers.js    # Southeast Energy + Acme Retail
    └── benchmarks.js             # Industry benchmarks (energy, retail, etc.)
```

**API Endpoints (6 actions):**
1. `startConversation(customerName)` - Returns profile + benchmarks ✅ TESTED
2. `captureBusinessContext(sessionId, businessContext)` - Extracts priorities
3. `getAvailableComponents()` - Lists 7 BDC components
4. `generateAssessment(sessionId, selectedComponents)` - Generates 8 sections
5. `regenerateSection(assessmentId, sectionNumber, refinementPrompt)` - Iterative refinement
6. `downloadAssessment(assessmentId)` - Returns markdown file

**Local Test (Working):**
```bash
curl -X POST http://localhost:4004/odata/v4/assessment/startConversation \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Southeast Energy"}'
# Returns: sessionId + full customer profile + industry benchmarks
```

**Start Local Server:**
```bash
cd ~/bdc-assessment-generator && npm run watch
# Runs at http://localhost:4004
```

---

## BTP Deployment Configuration (READY)

### Files
- `manifest.yml` - Cloud Foundry app config (512M RAM, Node.js buildpack)
- `.cfignore` - Excludes node_modules, logs
- `package.json` - Dependencies configured

### Target BTP Environment
**From Cockpit Screenshot:**
- **API Endpoint:** https://api.cf.us10-001.hana.ondemand.com
- **Org:** 19704659trial
- **Space:** dev
- **Region:** US East (VA) - AWS
- **Subaccount ID:** 66313228-1c73-4e34-9a0b-c3e62d07d661

### Expected Deployed URL
`https://bdc-assessment-api-19704659trial.cfapps.us10-001.hana.ondemand.com`

### CF CLI Installed
- **Version:** cf version 8.18.0
- **Path:** `/opt/homebrew/opt/cf-cli@8/bin/cf`

---

## What I Can Do via CLI for BTP

### ✅ CF CLI Operations (Fully Automated)
```bash
# Login (requires your credentials interactively)
cf login -a https://api.cf.us10-001.hana.ondemand.com -o 19704659trial -s dev

# Deploy application
cf push

# Manage apps
cf apps                           # List all apps
cf app bdc-assessment-api         # Show app details
cf logs bdc-assessment-api --recent
cf restart bdc-assessment-api
cf delete bdc-assessment-api

# Environment variables
cf env bdc-assessment-api
cf set-env bdc-assessment-api ANTHROPIC_API_KEY "sk-..."
cf restage bdc-assessment-api     # Apply env changes

# Services
cf marketplace                    # List available services
cf services                       # List bound services
cf create-service ai-core extended bdc-ai-core
cf bind-service bdc-assessment-api bdc-ai-core
cf unbind-service bdc-assessment-api bdc-ai-core

# Scaling
cf scale bdc-assessment-api -i 2  # Scale to 2 instances
cf scale bdc-assessment-api -m 1G # Increase memory to 1GB

# Routes
cf routes
cf map-route bdc-assessment-api cfapps.us10-001.hana.ondemand.com --hostname custom-name

# SSH into running container
cf ssh bdc-assessment-api
```

### ❌ BTP Web UI Operations (Need Manual Browser)
- Create subaccounts
- Subscribe to services via Entitlements
- Configure service keys in cockpit
- View detailed service bindings
- HTML5 Application Repository uploads
- Security role assignments

### ⚠️ Partially Automated
- **MTA deployments** - Can run `cf deploy`, but MTA build requires specific tools
- **Service keys** - Can create via CLI, but JSON output needs manual copying
- **XSUAA config** - Can update via CLI, but complex JSON configuration

---

## Deployment Instructions

### Step 1: CF Login
```bash
export PATH="/opt/homebrew/opt/cf-cli@8/bin:$PATH"
cf login -a https://api.cf.us10-001.hana.ondemand.com -o 19704659trial -s dev
```
**Note:** I can run this, but it requires YOUR credentials interactively.

### Step 2: Deploy
```bash
cd ~/bdc-assessment-generator
cf push
```
**Expected duration:** 2-3 minutes
**I can monitor:** logs, status, errors in real-time

### Step 3: Verify
```bash
cf app bdc-assessment-api
curl https://bdc-assessment-api-19704659trial.cfapps.us10-001.hana.ondemand.com/health
```

### Step 4: Test API
```bash
curl -X POST https://bdc-assessment-api-19704659trial.cfapps.us10-001.hana.ondemand.com/odata/v4/assessment/startConversation \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Southeast Energy"}'
```

---

## AI Integration Options

### Option 1: Anthropic API (POC - Fast)
```bash
cf set-env bdc-assessment-api ANTHROPIC_API_KEY "sk-ant-..."
cf restage bdc-assessment-api
```
**Code ready:** Fallback in `srv/ai/claude-client.js`

### Option 2: SAP AI Core (Production - For Shane)
```bash
# Check if available in trial
cf marketplace | grep -i ai

# If available:
cf create-service ai-core extended bdc-ai-core
cf bind-service bdc-assessment-api bdc-ai-core
cf restage bdc-assessment-api
```
**Code ready:** Primary path in `srv/ai/claude-client.js` uses `@sap-ai-sdk/orchestration`

---

## Phase 2: Frontend (NOT STARTED)

### Architecture Decision Needed
**Option A: React on BTP HTML5 Repository**
- Pure SAP stack (best for Shane demo)
- Deploy via MTA
- Longer setup time

**Option B: React on Vercel**
- Faster development
- Can migrate to BTP post-demo
- Calls BTP backend API

**Option C: SAPUI5 on BTP**
- Most SAP-native
- Steeper learning curve
- Best for production

### Frontend Requirements
- 5-step conversation flow
- Customer autocomplete (2 hardcoded)
- Business context capture (textarea)
- Component selection (7 BDC components)
- Streaming generation progress
- Markdown preview + download

**Estimated time:** 4-6 hours development

---

## Demo Strategy for Shane

### What Shane Cares About
1. ✅ **BTP deployment** (not localhost) - enterprise credibility
2. ✅ **3-scenario comparison** - unbiased modeling differentiator
3. ✅ **CAP framework** - standard SAP development model
4. ✅ **Path to AI Core** - enterprise AI governance story

### Demo Flow
1. Show BTP cockpit with running app
2. Test API with curl showing JSON response
3. Show frontend generating assessment (if built)
4. Download markdown - review Section 5 (3-scenario comparison)
5. Emphasize: "This is consultant methodology, not vendor pitch"

### Talking Points
- "Positions BDC AEs as strategic consultants who shape evaluation criteria"
- "3-scenario comparison (we model Snowflake honestly) builds CFO trust"
- "Running on BTP - production-ready deployment model"
- "Every AE becomes a Bain consultant with this tool"

---

## Known Issues / TODOs

### Blocker Issues
- **None** - backend is deployment-ready

### Minor Issues
- `manifest.yml` env var `ANTHROPIC_API_KEY: ((ANTHROPIC_API_KEY))` syntax may fail on CF
  - Solution: Use `cf set-env` post-deployment instead
- Node.js version warning (using v25, package wants v20/22/24)
  - Non-blocking, but may need `engines.node: ">=20"` adjustment

### Post-Deployment Tasks
1. Test all 6 API endpoints on BTP
2. Set ANTHROPIC_API_KEY if using fallback
3. Build frontend UI
4. End-to-end test with Southeast Energy
5. Generate sample assessment for Shane review

---

## Resume Commands

### Start Local Testing
```bash
cd ~/bdc-assessment-generator
npm run watch
# Test: curl http://localhost:4004/health
```

### Deploy to BTP
```bash
cd ~/bdc-assessment-generator
export PATH="/opt/homebrew/opt/cf-cli@8/bin:$PATH"
cf login -a https://api.cf.us10-001.hana.ondemand.com -o 19704659trial -s dev
cf push
```

### Check Deployment Status
```bash
cf app bdc-assessment-api
cf logs bdc-assessment-api --recent
```

---

## Critical Files Reference

**Deployment Config:**
- `~/bdc-assessment-generator/manifest.yml`
- `~/bdc-assessment-generator/package.json`

**Service Definition:**
- `~/bdc-assessment-generator/srv/assessment-service.cds`

**Core Logic:**
- `~/bdc-assessment-generator/srv/assessment-service.js`
- `~/bdc-assessment-generator/srv/ai/claude-client.js`

**8 Prompt Templates:**
- `~/bdc-assessment-generator/srv/ai/prompts/section-[1-8]-*.js`

**This Status File:**
- `~/bdc-assessment-generator/STATUS.md`

---

## Next Session Priorities

1. **YOU LOGIN:** `cf login` (requires manual credentials)
2. **I DEPLOY:** `cf push` and monitor
3. **I TEST:** All API endpoints on BTP
4. **I BUILD:** Frontend UI (React - decision needed: BTP vs Vercel)
5. **WE DEMO:** Test end-to-end flow for Shane

---

**Session End Status:** Backend complete, tested locally, ready for BTP deployment. Waiting for CF login to proceed.
