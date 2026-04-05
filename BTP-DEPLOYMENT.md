# BTP Deployment Guide

## Phase 1: Cloud Foundry Authentication

From your BTP Cockpit screenshot:
- **API Endpoint:** https://api.cf.us10-001.hana.ondemand.com
- **Org:** 19704659trial
- **Space:** dev

### Login Command
```bash
export PATH="/opt/homebrew/opt/cf-cli@8/bin:$PATH"
cf login -a https://api.cf.us10-001.hana.ondemand.com -o 19704659trial -s dev
```

You'll be prompted for your SAP BTP credentials (same as cockpit login).

## Phase 2: Service Provisioning

### Option A: SAP AI Core (Ideal for Shane Demo)
```bash
# Check if AI Core is available in marketplace
cf marketplace | grep -i ai

# Create AI Core service instance (if available)
cf create-service ai-core extended bdc-ai-core

# Bind to app (automatic via manifest.yml)
```

### Option B: Anthropic API Fallback (POC)
If AI Core not available in trial:
```bash
# Set environment variable for app
cf set-env bdc-assessment-api ANTHROPIC_API_KEY "your-key-here"
```

## Phase 3: Deploy Application

```bash
cd ~/bdc-assessment-generator
npm run deploy
```

This will:
1. Push code to Cloud Foundry
2. Install dependencies in CF environment
3. Start CAP service
4. Expose API at: `https://bdc-assessment-api-19704659trial.cfapps.us10-001.hana.ondemand.com`

## Phase 4: Health Check

```bash
# Test deployment
cf app bdc-assessment-api
cf logs bdc-assessment-api --recent

# Test health endpoint
curl https://bdc-assessment-api-19704659trial.cfapps.us10-001.hana.ondemand.com/health
```

## Demo Architecture for Shane

**Running on BTP:**
- ✅ CAP service (Node.js) on Cloud Foundry
- ✅ SAP AI Core integration (or fallback to Anthropic with path to AI Core)
- ✅ Demonstrates enterprise deployment model
- ✅ Shows we're using SAP's AI platform (Gen AI Hub)

**Frontend:** React UI (Phase 5) can be:
- Option A: Static site on BTP HTML5 Application Repository
- Option B: Vercel (faster to build, Shane sees working UI)
- Recommendation: Vercel for POC, migrate to BTP HTML5 post-demo

---

## Next: Test CAP Service Locally First

Before deploying to BTP, let's verify the service works:

```bash
cd ~/bdc-assessment-generator
npm run watch
```

Then test endpoints at http://localhost:4004
