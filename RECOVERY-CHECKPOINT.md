# BDC Assessment HANA Migration - Recovery Checkpoint

**Date:** 2026-04-05 03:35 UTC
**Status:** Plan complete, ready for execution
**Context:** Session token usage high, created recovery point before implementation

---

## Current State

### ✅ Completed
1. Brainstorming - Clarified requirements (production BTP demo, not CRM)
2. Approach selection - Full CAP rewrite (Approach B)
3. Data analysis - Parsed 5 Loves Excel files (2K records)
4. Plan creation - 9 tasks, ~3.5 hours estimated

### 📍 You Are Here
- **Plan location:** `docs/superpowers/plans/2026-04-05-hana-migration.md`
- **Git:** Last commit `b4efdc8` - "docs: add HANA migration implementation plan"
- **Ready to execute:** Need to choose subagent-driven vs inline execution

---

## HANA Status

```bash
cf service bdc-hana-trial
```

**Result:**
- Status: `create succeeded`
- Message: `HanaService is ready. All pods are running`
- Created: 2026-04-05T03:15:15Z
- Dashboard: https://19704659trial.hana-tooling.ingress.orchestration.prod-us10.hanacloud.ondemand.com

**HANA is READY for HDI container creation.**

---

## Source Data Files

**Location:** `/Users/I870089/Downloads/`

1. `Cloud Systems Table-2026-04-04 22_20_48.xlsx` (251 KB, 1,552 rows)
2. `System Landscape Details Table-2026-04-04 22_21_03.xlsx` (37 KB, 265 rows)
3. `System Details Table-2026-04-04 22_22_43.xlsx` (32 KB, 265 rows)
4. `On Prem Licenses Table-2026-04-04 22_23_27.xlsx` (18 KB, 93 rows)
5. `Purchased Solutions Table-2026-04-04 22_23_16.xlsx` (5 KB, 8 rows)

**Data verified:** All files parsed successfully, structure documented in plan

**Customer:** Loves Travel Stops & Country Stores (ID: 0000190852)

---

## Current Application State

**Directory:** `/Users/I870089/bdc-assessment-generator/`

**Active Files:**
- `srv/server.js` - Express server (uses JS objects, NOT migrated yet)
- `srv/data/customer-list.js` - Hardcoded customer data (will be replaced)
- `package.json` - Has `@sap/cds` but not fully configured for HANA
- `manifest.yml` - Cloud Foundry config (needs HANA binding)

**Production URL:** https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com

**Status:** Working with in-memory data, NOT using HANA yet

---

## Next Steps (To Resume)

### Option 1: Start Fresh Session

```bash
cd ~/bdc-assessment-generator

# Check plan
cat docs/superpowers/plans/2026-04-05-hana-migration.md

# Verify HANA still running
cf service bdc-hana-trial

# Tell Claude:
# "Execute the HANA migration plan at docs/superpowers/plans/2026-04-05-hana-migration.md
# Use subagent-driven-development. Start with Task 1."
```

### Option 2: Resume Current Session

If context window not full yet:
- Choose execution mode (subagent-driven or inline)
- Start with Task 1: Create CDS Schema Models

---

## Critical Context for Next Session

**Goal:** Migrate from JS objects to HANA for production BTP demo

**Why Full CAP Rewrite:**
- Shane/CRO will show to SAP architects
- Need production-grade architecture
- Global deployment potential
- 6-8 hours upfront > months of technical debt

**Not Building:**
- ❌ CRM system
- ❌ Upload UI (Phase 2)
- ❌ Multi-tenant (single customer demo)
- ❌ Integration with LIS (manual data load)

**Building:**
- ✅ CAP data model
- ✅ HANA HDI container
- ✅ Seed data from Loves Excel
- ✅ OData APIs
- ✅ Express queries HANA
- ✅ Financial rollup logic

---

## Key Architectural Decisions

1. **Approach:** Full CAP rewrite (not hybrid Express wrapper)
2. **Data Loading:** Deploy-time CSV seeding (not runtime uploads)
3. **Service Layer:** CAP OData + Express facade for AI endpoints
4. **Authentication:** Deferred to Phase 2 (no XSUAA for demo)
5. **Customers Table:** Merged from existing customer-list.js
6. **Entitlements:** All 5 Loves files loaded into separate tables

---

## Commands to Verify State

```bash
# Current git state
cd ~/bdc-assessment-generator
git log --oneline -5
git status

# HANA status
cf service bdc-hana-trial
cf services | grep hana

# Current deployment
cf app bdc-assessment-v3

# Test current API (pre-migration)
curl https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/health
```

---

## File Structure After Migration

**New files (not created yet):**
```
db/
  schema.cds               # CDS entity definitions
  data/
    bdc.assessment-Customers.csv
    bdc.assessment-CloudSystems.csv
    bdc.assessment-OnPremSystems.csv
    bdc.assessment-OnPremLicenses.csv
    bdc.assessment-PurchasedSolutions.csv
srv/
  assessment-service.cds   # CAP service definitions
  assessment-service.js    # Custom handlers
scripts/
  excel-to-csv.js          # Data conversion script
.hdiconfig                 # HDI artifact types
mta.yaml                   # Multi-target app descriptor
```

**Modified (not changed yet):**
- `srv/server.js` - Will query CAP instead of JS objects
- `package.json` - Will add HANA dependencies
- `manifest.yml` - Will add HANA service binding

---

## Success Criteria

When complete:
1. Health endpoint shows `customersLoaded: 25, database: "HANA"`
2. Customer search returns data from HANA (not JS objects)
3. Loves shows $1.67M spend from PurchasedSolutions table
4. Scenario generation uses HANA financial data
5. No references to `customer-list.js` in running code

---

## Time Estimate

**Realistic:** 3.5 hours (not 3 hours)

**Critical path:**
- Tasks must run sequentially
- HANA must complete before HDI deployment
- Each task ~15-45 min

**Buffer:** Add 30 min for unexpected issues

---

## Rollback Plan

If migration fails:

```bash
# Option 1: Git rollback
cd ~/bdc-assessment-generator
git checkout b4efdc8  # Before implementation starts
cf push

# Option 2: Keep schema, revert Express
git checkout HEAD~1 srv/server.js
cf set-env bdc-assessment-v3 USE_SQLITE true
cf restage bdc-assessment-v3

# Option 3: Delete HANA services and start over
cf unbind-service bdc-assessment-v3 bdc-hana-db
cf delete-service bdc-hana-db -f
```

---

## Resume Command

**For new session:**

```
Execute the HANA migration plan at:
/Users/I870089/bdc-assessment-generator/docs/superpowers/plans/2026-04-05-hana-migration.md

Use superpowers:subagent-driven-development (recommended).

Context:
- HANA instance is RUNNING (bdc-hana-trial)
- 5 Excel files in ~/Downloads/ (verified)
- Plan is complete and committed (b4efdc8)
- Current app uses JS objects (not migrated yet)
- Goal: Production BTP demo for Shane/CRO

Start with Task 1: Create CDS Schema Models
```

---

## Last Known Good State

- **Git commit:** `b4efdc8`
- **Branch:** `main`
- **Working directory:** Clean (no uncommitted changes)
- **CF App:** Running (pre-migration)
- **HANA:** Running and ready
- **Context tokens:** ~88K used, 112K remaining

---

## Contact Info for Troubleshooting

**BTP Trial:**
- Org: `19704659trial`
- Space: `dev`
- Region: `us10-001`
- User: `chad.mcglothlin@sap.com`

**HANA Instance:**
- Name: `bdc-hana-trial`
- Plan: `hana-free`
- Memory: 16 GB
- Dashboard: (see HANA Status section above)

---

**END OF CHECKPOINT**

Resume with: "Execute HANA migration plan, subagent-driven"
