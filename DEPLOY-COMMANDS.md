# BTP Deployment Commands

## Step 1: Login to BTP Cloud Foundry

```bash
export PATH="/opt/homebrew/opt/cf-cli@8/bin:$PATH"
cf login -a https://api.cf.us10-001.hana.ondemand.com -o 19704659trial -s dev
```

Enter your BTP credentials when prompted (same as cockpit login).

## Step 2: Verify Target

```bash
cf target
```

Should show:
- API endpoint: https://api.cf.us10-001.hana.ondemand.com
- Org: 19704659trial
- Space: dev

## Step 3: Deploy Application

```bash
cd ~/bdc-assessment-generator
cf push
```

This will:
- Upload code to Cloud Foundry
- Install dependencies (npm install)
- Start CAP service
- Expose at: `https://bdc-assessment-api-19704659trial.cfapps.us10-001.hana.ondemand.com`

## Step 4: Verify Deployment

```bash
# Check app status
cf app bdc-assessment-api

# View logs
cf logs bdc-assessment-api --recent

# Test health endpoint
curl https://bdc-assessment-api-19704659trial.cfapps.us10-001.hana.ondemand.com/health
```

## Step 5: Test Service Endpoint

```bash
curl -X POST https://bdc-assessment-api-19704659trial.cfapps.us10-001.hana.ondemand.com/odata/v4/assessment/startConversation \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Southeast Energy"}'
```

---

## If Deployment Fails

### Check manifest.yml
The manifest should reference your org name correctly. Current:
```yaml
routes:
  - route: bdc-assessment-api-((org-name)).cfapps.us10-001.hana.ondemand.com
```

May need to be:
```yaml
routes:
  - route: bdc-assessment-api-19704659trial.cfapps.us10-001.hana.ondemand.com
```

### Check logs
```bash
cf logs bdc-assessment-api --recent
```

### Restart app
```bash
cf restart bdc-assessment-api
```

---

## Environment Variables (for AI integration)

If using Anthropic API fallback:
```bash
cf set-env bdc-assessment-api ANTHROPIC_API_KEY "your-key-here"
cf restage bdc-assessment-api
```

For SAP AI Core (production):
```bash
# Check marketplace for AI Core service
cf marketplace | grep -i ai

# Create service instance
cf create-service ai-core extended bdc-ai-core

# Bind to app (add to manifest.yml services section)
```

---

## Shane Demo Talking Points

Once deployed to BTP:

✅ "This is running on SAP BTP Cloud Foundry - production-ready architecture"
✅ "CAP framework with OData services - standard SAP development model"
✅ "Path to SAP AI Core integration for enterprise governance"
✅ "Shows we can deliver enterprise-grade tools on BTP platform"

