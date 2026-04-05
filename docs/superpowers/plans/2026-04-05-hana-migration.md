# BDC Assessment Generator - HANA Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate BDC Assessment Generator from in-memory JavaScript data to HANA database using SAP CAP framework

**Architecture:** CAP service layer provides OData APIs backed by HANA HDI container. Express server consumes CAP service for customer data queries, keeps direct Anthropic integration for AI generation. Loves Travel Stops data (5 Excel files, ~2K records) loaded as seed data.

**Tech Stack:** SAP CAP, HANA Cloud, HDI, CDS, Express.js, Node.js

---

## File Structure

**New files:**
- `db/schema.cds` - Entity definitions
- `srv/assessment-service.cds` - Service layer
- `srv/assessment-service.js` - Custom handlers
- `scripts/excel-to-csv.js` - Data conversion
- `db/data/*.csv` - Seed data (5 files)
- `.hdiconfig` - HDI artifact types
- `mta.yaml` - Multi-target application descriptor

**Modified files:**
- `srv/server.js` - Query CAP instead of JS objects
- `package.json` - Add CAP dependencies
- `manifest.yml` - Add HANA service binding

**Removed after migration:**
- `srv/data/customer-list.js` (data moved to HANA)

---

### Task 1: Create CDS Schema Models

**Files:**
- Create: `db/schema.cds`
- Create: `.hdiconfig`

- [ ] **Step 1: Create database schema file**

Create `db/schema.cds`:

```cds
namespace bdc.assessment;

entity Customers {
  key id                  : String(20);
      name                : String(255);
      bdcOverview         : String(50);
      erpDeployment       : String(100);
      existingBW          : String(50);
      existingDatasphere  : String(50);
      existingSAC         : String(50);
      existingDatabricks  : String(50);
      otherDatalake       : String(100);
      existingPEA         : String(50);
      dataOwner           : String(255);
      aiOwner             : String(255);
      ivp                 : String(255);
      iae                 : String(255);
      bwMoveTarget        : String(50);
      notes               : String(2000);
}

entity CloudSystems {
  key systemId            : String(20);
      customerId          : String(20);
      customerName        : String(255);
      tenantId            : String(20);
      entitlementSetId    : String(20);
      orderId             : String(20);
      lifecycleStatus     : String(50);
      businessType        : String(100);
      systemRole          : String(100);
      solutionArea        : String(255);
      subSolutionArea     : String(255);
      dataCenterExternal  : String(100);
      dataCenterInternal  : String(100);
      createdOn           : Date;
      mainUrl             : String(500);
}

entity OnPremSystems {
  key systemNumber        : String(20);
      customerId          : String(20);
      systemId            : String(50);
      systemName          : String(255);
      installationNo      : String(20);
      systemRole          : String(100);
      solutionArea        : String(255);
      subSolutionArea     : String(255);
      product             : String(255);
      productId           : String(50);
      productVersion      : String(100);
      productCategory     : String(100);
      osType              : String(100);
      osVersion           : String(100);
      database            : String(100);
}

entity SystemDetails {
  key systemNumber        : String(20);
      customerId          : String(20);
      systemId            : String(50);
      systemName          : String(255);
      installationNo      : String(20);
      product             : String(255);
      productVersion      : String(100);
      endOfMaintenance    : Date;
      maintenanceStatus   : String(100);
      expiresIn0to12      : Integer;
      expiresIn12to24     : Integer;
      expiresIn24to36     : Integer;
      expiresIn36Plus     : Integer;
      expired             : Integer;
}

entity OnPremLicenses {
  key orderId             : String(20);
  key orderItem           : String(20);
  key materialId          : String(20);
      customerId          : String(20);
      customerName        : String(255);
      orderType           : String(100);
      solutionArea        : String(255);
      solutionAreaTitle   : String(255);
      subSolutionArea     : String(255);
      subSolutionAreaTitle : String(255);
      product             : String(255);
      material            : String(255);
      quantity            : Integer;
      tcvOnPrem           : Decimal(15,2);
      signedDate          : Date;
      startDate           : Date;
      endDate             : Date;
      contractPartner     : String(255);
      country             : String(50);
}

entity PurchasedSolutions {
  key customerId          : String(20);
  key solutionArea        : String(255);
      customerName        : String(255);
      channel             : String(100);
      activeACV           : Decimal(15,2);
      averageACV          : Decimal(15,2);
      exitACV             : Decimal(15,2);
      scv                 : Decimal(15,2);
      tcv                 : Decimal(15,2);
      contractStartDate   : Date;
      contractEndDate     : Date;
      contractStatus      : String(50);
      supportLevel        : String(100);
}

entity Assessments {
  key id                  : UUID;
      customerId          : String(20);
      createdAt           : Timestamp;
      createdBy           : String(255);
      selectedScenario    : String(50);
      investment          : Decimal(15,2);
      annualReturn        : Decimal(15,2);
      roi                 : Decimal(5,2);
      paybackMonths       : Integer;
      npv                 : Decimal(15,2);
      narrative           : LargeString;
      interviewAnswers    : LargeString;
      scenarioData        : LargeString;
}
```

- [ ] **Step 2: Create HDI configuration**

Create `.hdiconfig`:

```json
{
  "file_suffixes": {
    "hdbcds": {
      "plugin_name": "com.sap.hana.di.cds"
    },
    "hdbsynonym": {
      "plugin_name": "com.sap.hana.di.synonym"
    },
    "hdbsynonymconfig": {
      "plugin_name": "com.sap.hana.di.synonym.config"
    }
  }
}
```

- [ ] **Step 3: Verify CDS syntax**

Run: `cd ~/bdc-assessment-generator && npx cds compile db/schema.cds`

Expected: No syntax errors, outputs compiled SQL

- [ ] **Step 4: Commit schema**

```bash
git add db/schema.cds .hdiconfig
git commit -m "feat: add HANA CDS schema for BDC data model"
```

---

### Task 2: Convert Excel Files to CSV Seed Data

**Files:**
- Create: `scripts/excel-to-csv.js`
- Create: `db/data/bdc.assessment-Customers.csv`
- Create: `db/data/bdc.assessment-CloudSystems.csv`
- Create: `db/data/bdc.assessment-OnPremSystems.csv`
- Create: `db/data/bdc.assessment-OnPremLicenses.csv`
- Create: `db/data/bdc.assessment-PurchasedSolutions.csv`

- [ ] **Step 1: Create Excel to CSV converter script**

Create `scripts/excel-to-csv.js`:

```javascript
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const DOWNLOADS = '/Users/I870089/Downloads';
const OUTPUT_DIR = path.join(__dirname, '..', 'db', 'data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function parseExcelToCSV(filename, outputName, columnMap) {
  console.log(`\nProcessing ${filename}...`);

  const filePath = path.join(DOWNLOADS, filename);
  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`  Rows: ${data.length}`);

  // Map Excel columns to CDS entity fields
  const mapped = data.map(row => {
    const obj = {};
    for (const [cdsField, excelField] of Object.entries(columnMap)) {
      let value = row[excelField];

      // Handle dates
      if (value && typeof value === 'number' && excelField.toLowerCase().includes('date')) {
        const date = xlsx.SSF.parse_date_code(value);
        value = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }

      // Handle empty strings for numbers
      if (value === '' && (cdsField.includes('ACV') || cdsField.includes('tcv') || cdsField === 'quantity')) {
        value = 0;
      }

      // Escape commas and quotes for CSV
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
      }

      obj[cdsField] = value;
    }
    return obj;
  });

  // Write CSV with header
  const headers = Object.keys(columnMap);
  const csvRows = [headers.join(',')];
  mapped.forEach(row => {
    csvRows.push(headers.map(h => row[h] ?? '').join(','));
  });

  const outputPath = path.join(OUTPUT_DIR, `bdc.assessment-${outputName}.csv`);
  fs.writeFileSync(outputPath, csvRows.join('\n'));
  console.log(`  Written: ${outputPath}`);
}

// 1. Cloud Systems
parseExcelToCSV(
  'Cloud Systems Table-2026-04-04 22_20_48.xlsx',
  'CloudSystems',
  {
    systemId: 'System ID',
    customerId: 'Customer ID',
    customerName: 'Customer',
    tenantId: 'Tenant ID',
    entitlementSetId: 'Entitlement Set ID',
    orderId: 'Order ID',
    lifecycleStatus: 'Lifecycle Status',
    businessType: 'Business Type',
    systemRole: 'System Role',
    solutionArea: 'Solution Area',
    subSolutionArea: 'Sub-Solution Area',
    dataCenterExternal: 'Data Center External Description',
    dataCenterInternal: 'Data Center Internal Description',
    createdOn: 'Creation Date',
    mainUrl: 'Main URL'
  }
);

// 2. System Landscape (On-Prem Systems)
parseExcelToCSV(
  'System Landscape Details Table-2026-04-04 22_21_03.xlsx',
  'OnPremSystems',
  {
    systemNumber: 'System Number',
    customerId: 'Customer ID',
    systemId: 'System ID',
    systemName: 'System Name',
    installationNo: 'Installation No.',
    systemRole: 'System Role',
    solutionArea: 'Solution Area',
    subSolutionArea: 'Sub-Solution Area',
    product: 'Product',
    productId: 'Product ID',
    productVersion: 'Product Version',
    productCategory: 'Product Category',
    osType: 'OS',
    osVersion: 'OS Version',
    database: 'Data Base'
  }
);

// 3. System Details (Maintenance Status)
parseExcelToCSV(
  'System Details Table-2026-04-04 22_22_43.xlsx',
  'SystemDetails',
  {
    systemNumber: 'System Number',
    customerId: 'Customer ID',
    systemId: 'System ID',
    systemName: 'System Name',
    installationNo: 'Installation No.',
    product: 'Product',
    productVersion: 'Product Version',
    endOfMaintenance: 'End of Maintenance',
    maintenanceStatus: 'Maintenance Status',
    expiresIn0to12: 'Expires in 0-12 Months',
    expiresIn12to24: 'Expires in 12-24 Months',
    expiresIn24to36: 'Expires in 24-36 Months',
    expiresIn36Plus: 'Expires in 36+ Months',
    expired: 'Expired'
  }
);

// 4. On-Prem Licenses
parseExcelToCSV(
  'On Prem Licenses Table-2026-04-04 22_23_27.xlsx',
  'OnPremLicenses',
  {
    orderId: 'Order ID',
    orderItem: 'Order Item',
    materialId: 'Material ID',
    customerId: 'Customer ID',
    customerName: 'Customer',
    orderType: 'Order Type',
    solutionArea: 'Solution Area',
    solutionAreaTitle: 'Solution Area Title',
    subSolutionArea: 'Sub-Solution Area',
    subSolutionAreaTitle: 'Sub-Solution Area Title',
    product: 'Product (LPR)',
    material: 'Material',
    quantity: 'Quantity',
    tcvOnPrem: 'TCV On-Premise*',
    signedDate: 'Signed Date',
    startDate: 'Start Date (Item)',
    endDate: 'End Date (Item)',
    contractPartner: 'Contract Partner',
    country: 'Country'
  }
);

// 5. Purchased Solutions
parseExcelToCSV(
  'Purchased Solutions Table-2026-04-04 22_23_16.xlsx',
  'PurchasedSolutions',
  {
    customerId: 'Customer ID',
    solutionArea: 'Solution Area',
    customerName: 'Customer',
    channel: 'Channel (Agg.)',
    activeACV: 'Active ACV*',
    averageACV: 'Average ACV*',
    exitACV: 'Exit ACV* (active)',
    scv: 'SCV*',
    tcv: 'TCV*',
    contractStartDate: 'Initial Contract Start Date',
    contractEndDate: 'Contract End Date (Last Item)',
    contractStatus: 'Contract Status',
    supportLevel: 'Support Level'
  }
);

console.log('\n✅ All Excel files converted to CSV successfully!\n');
```

- [ ] **Step 2: Run converter to generate CSV files**

Run: `cd ~/bdc-assessment-generator && node scripts/excel-to-csv.js`

Expected:
```
Processing Cloud Systems Table-2026-04-04 22_20_48.xlsx...
  Rows: 1552
  Written: /Users/I870089/bdc-assessment-generator/db/data/bdc.assessment-CloudSystems.csv
...
✅ All Excel files converted to CSV successfully!
```

- [ ] **Step 3: Create Customers CSV from existing customer-list.js**

Create `db/data/bdc.assessment-Customers.csv`:

```csv
id,name,bdcOverview,erpDeployment,existingBW,existingDatasphere,existingSAC,existingDatabricks,otherDatalake,existingPEA,dataOwner,aiOwner,ivp,iae,bwMoveTarget,notes
0000190852,Loves Travel Stops & Country Stores,Yes,S/4 RISE,No,Yes - Existing,Yes - Existing,No,Other,Yes,,,,,,
162055,Celanese International Corporation,Yes,S/4 RISE,BW OP,No,Yes - New,No,Snowflake,Yes,Keith Stewart,Keith Stewart,Paul Smith,Brent McQuitty,Yes,BW/4HANA (HEC) (AP01006)
205723,Builders Firstsource Inc,Yes,S/4 RISE,No,No,Yes - Existing,Yes - Native,,Yes,Nirmala Kunavarapu,Mike McConnell,Paul Smith,Brandon Stanley,No,Project elevate
```

(Note: Add remaining customers from customer-list.js manually or extend script)

- [ ] **Step 4: Verify CSV file structure**

Run: `ls -lh ~/bdc-assessment-generator/db/data/`

Expected: 5 CSV files present, non-zero size

- [ ] **Step 5: Commit data files**

```bash
git add scripts/excel-to-csv.js db/data/*.csv
git commit -m "feat: convert Loves entitlement data to CSV seed files"
```

---

### Task 3: Create CAP Service Layer

**Files:**
- Create: `srv/assessment-service.cds`
- Create: `srv/assessment-service.js`

- [ ] **Step 1: Create service definition**

Create `srv/assessment-service.cds`:

```cds
using bdc.assessment from '../db/schema';

service AssessmentService {

  // Read-only entities (data from Excel)
  @readonly entity Customers as projection on assessment.Customers;
  @readonly entity CloudSystems as projection on assessment.CloudSystems;
  @readonly entity OnPremSystems as projection on assessment.OnPremSystems;
  @readonly entity SystemDetails as projection on assessment.SystemDetails;
  @readonly entity OnPremLicenses as projection on assessment.OnPremLicenses;
  @readonly entity PurchasedSolutions as projection on assessment.PurchasedSolutions;

  // Read-write entity (generated assessments)
  entity Assessments as projection on assessment.Assessments;

  // Custom functions
  function getCustomerSpend(customerId: String) returns Decimal;
  function getContractExpirations(customerId: String, daysThreshold: Integer) returns array of {
    solutionArea: String;
    contractEndDate: Date;
    daysUntilExpiry: Integer;
    activeACV: Decimal;
  };
}
```

- [ ] **Step 2: Create custom service handlers**

Create `srv/assessment-service.js`:

```javascript
module.exports = async (srv) => {
  const { Customers, PurchasedSolutions, OnPremLicenses } = srv.entities;

  // Custom function: Calculate total customer spend
  srv.on('getCustomerSpend', async (req) => {
    const { customerId } = req.data;

    // Sum purchased solutions ACV
    const solutions = await SELECT.from(PurchasedSolutions)
      .where({ customerId })
      .columns('activeACV');

    const solutionsSpend = solutions.reduce((sum, s) => sum + (s.activeACV || 0), 0);

    // Sum on-prem licenses TCV
    const licenses = await SELECT.from(OnPremLicenses)
      .where({ customerId })
      .columns('tcvOnPrem');

    const licensesSpend = licenses.reduce((sum, l) => sum + (l.tcvOnPrem || 0), 0);

    return solutionsSpend + licensesSpend;
  });

  // Custom function: Get expiring contracts
  srv.on('getContractExpirations', async (req) => {
    const { customerId, daysThreshold } = req.data;

    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    const solutions = await SELECT.from(PurchasedSolutions)
      .where({ customerId })
      .and({ contractEndDate: { '<=': thresholdDate.toISOString().split('T')[0] } })
      .and({ contractStatus: 'Active' });

    return solutions.map(s => ({
      solutionArea: s.solutionArea,
      contractEndDate: s.contractEndDate,
      daysUntilExpiry: Math.ceil((new Date(s.contractEndDate) - today) / (1000 * 60 * 60 * 24)),
      activeACV: s.activeACV
    }));
  });
};
```

- [ ] **Step 3: Verify CAP service compiles**

Run: `cd ~/bdc-assessment-generator && npx cds compile srv/assessment-service.cds`

Expected: No syntax errors, outputs service metadata

- [ ] **Step 4: Commit CAP service**

```bash
git add srv/assessment-service.cds srv/assessment-service.js
git commit -m "feat: add CAP service layer for assessment data"
```

---

### Task 4: Update Dependencies and Configuration

**Files:**
- Modify: `package.json`
- Create: `mta.yaml`
- Modify: `manifest.yml`

- [ ] **Step 1: Update package.json with CAP dependencies**

Modify `package.json`:

```json
{
  "name": "bdc-assessment-generator",
  "version": "1.0.0",
  "description": "SAP BDC Strategic Assessment Generator - AI-powered consulting-grade assessments",
  "main": "srv/server.js",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.0",
    "@sap/cds": "^9",
    "@sap/hana-client": "^2.22",
    "express": "^4.21.2",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@sap/cds-dk": "^9"
  },
  "scripts": {
    "start": "node srv/server.js",
    "cds-serve": "cds serve --with-mocks --in-memory",
    "watch": "cds watch",
    "deploy": "cf push",
    "build": "cds build --production"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "cds": {
    "requires": {
      "db": {
        "kind": "hana",
        "credentials": {}
      },
      "[development]": {
        "db": {
          "kind": "sql"
        }
      }
    },
    "hana": {
      "deploy-format": "hdbtable"
    }
  },
  "private": true
}
```

- [ ] **Step 2: Install new dependencies**

Run: `cd ~/bdc-assessment-generator && npm install`

Expected: Dependencies installed, no errors

- [ ] **Step 3: Create MTA descriptor for BTP deployment**

Create `mta.yaml`:

```yaml
_schema-version: '3.1'
ID: bdc-assessment-generator
version: 1.0.0
description: BDC Strategic Assessment Generator
parameters:
  enable-parallel-deployments: true

modules:
  - name: bdc-assessment-db-deployer
    type: hdb
    path: gen/db
    parameters:
      buildpack: nodejs_buildpack
    requires:
      - name: bdc-hana-db

  - name: bdc-assessment-srv
    type: nodejs
    path: gen/srv
    parameters:
      buildpack: nodejs_buildpack
      memory: 512M
      disk-quota: 512M
    provides:
      - name: srv-api
        properties:
          srv-url: ${default-url}
    requires:
      - name: bdc-hana-db

resources:
  - name: bdc-hana-db
    type: com.sap.xs.hdi-container
    parameters:
      service: hana
      service-plan: hdi-shared
```

- [ ] **Step 4: Update Cloud Foundry manifest**

Modify `manifest.yml`:

```yaml
applications:
  - name: bdc-assessment-v3
    memory: 512M
    disk_quota: 512M
    buildpack: nodejs_buildpack
    command: node srv/server.js
    services:
      - bdc-hana-trial
    env:
      NODE_ENV: production
      ANTHROPIC_API_KEY: ((will be set via cf set-env))
```

- [ ] **Step 5: Commit configuration changes**

```bash
git add package.json mta.yaml manifest.yml
git commit -m "feat: configure HANA and MTA deployment"
```

---

### Task 5: Update Express Server to Query HANA

**Files:**
- Modify: `srv/server.js:1-66`
- Remove: `srv/data/customer-list.js` (after testing)

- [ ] **Step 1: Update server.js imports and initialization**

Modify `srv/server.js` lines 1-16:

```javascript
/**
 * BDC Assessment Generator - Express Server with CAP/HANA Backend
 * Scenario-based workflow: Interview -> 3 Scenarios -> Dashboard -> Export
 */

const express = require('express');
const cds = require('@sap/cds');
const Anthropic = require('@anthropic-ai/sdk');
const { FinancialModel } = require('./financial-model');
const { calculateScenarios, adjustScenario } = require('./scenario-calculator');
const { generatePDF } = require('./pdf-generator');

const PORT = process.env.PORT || 4004;
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

let assessmentService;
let db;

// Initialize CAP connection
cds.connect.to('db').then(async () => {
  assessmentService = await cds.connect.to('AssessmentService');
  db = assessmentService.entities;
  console.log('✅ Connected to CAP AssessmentService with HANA');
}).catch(err => {
  console.error('❌ Failed to connect to CAP service:', err);
  process.exit(1);
});

const app = express();
app.use(express.json());
```

- [ ] **Step 2: Update health check to query HANA**

Modify `srv/server.js` lines 22-31:

```javascript
// Health check
app.get('/health', async (req, res) => {
  try {
    const customerCount = await assessmentService.run(
      SELECT.from(db.Customers).columns('count(*) as count')
    );

    res.status(200).json({
      status: 'UP',
      service: 'bdc-assessment-generator-v3',
      version: '4.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      customersLoaded: customerCount[0]?.count || 0,
      database: 'HANA'
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      error: error.message
    });
  }
});
```

- [ ] **Step 3: Update customer list endpoint**

Modify `srv/server.js` lines 52-57:

```javascript
// Customer list endpoint
app.get('/api/customers', async (req, res) => {
  try {
    const ready = req.query.ready === 'true';

    // For "ready" filter, get customers with bdcOverview = 'Yes'
    const query = ready
      ? SELECT.from(db.Customers).where({ bdcOverview: 'Yes' })
      : SELECT.from(db.Customers);

    const customers = await assessmentService.run(query);

    res.json({
      total: customers.length,
      customers
    });
  } catch (error) {
    console.error('Customer list error:', error);
    res.status(500).json({ error: 'Failed to fetch customers', message: error.message });
  }
});
```

- [ ] **Step 4: Update customer search endpoint**

Modify `srv/server.js` lines 59-66:

```javascript
// Customer search endpoint
app.get('/api/customers/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing query parameter: q' });

    const customers = await assessmentService.run(
      SELECT.from(db.Customers)
        .where`lower(name) like ${`%${query.toLowerCase()}%`}`
    );

    if (!customers || customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found', query });
    }

    // Get additional financial data for first match
    const customer = customers[0];

    // Get purchased solutions
    const solutions = await assessmentService.run(
      SELECT.from(db.PurchasedSolutions).where({ customerId: customer.id })
    );

    // Get cloud systems count
    const cloudSystems = await assessmentService.run(
      SELECT.from(db.CloudSystems)
        .where({ customerId: customer.id })
        .columns('count(*) as count')
    );

    // Get on-prem licenses
    const licenses = await assessmentService.run(
      SELECT.from(db.OnPremLicenses).where({ customerId: customer.id })
    );

    // Enrich customer object
    customer.purchasedSolutions = solutions;
    customer.cloudSystemsCount = cloudSystems[0]?.count || 0;
    customer.onPremLicensesCount = licenses.length;
    customer.totalSpend = solutions.reduce((sum, s) => sum + (s.activeACV || 0), 0);

    res.json(customer);
  } catch (error) {
    console.error('Customer search error:', error);
    res.status(500).json({ error: 'Failed to search customers', message: error.message });
  }
});
```

- [ ] **Step 5: Update scenario generation to use HANA data**

Modify `srv/server.js` lines 70-91 (POST /api/scenarios):

```javascript
// POST /api/scenarios - Generate 3 scenarios from interview answers
app.post('/api/scenarios', async (req, res) => {
  try {
    const { customerId, interviewAnswers } = req.body;

    if (!customerId || !interviewAnswers) {
      return res.status(400).json({ error: 'Missing customerId or interviewAnswers' });
    }

    // Find customer from HANA
    const customers = await assessmentService.run(
      SELECT.from(db.Customers).where({ id: customerId })
    );

    if (!customers || customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found', customerId });
    }

    const customer = customers[0];

    // Enrich with purchased solutions for financial model
    const solutions = await assessmentService.run(
      SELECT.from(db.PurchasedSolutions).where({ customerId })
    );

    customer.purchasedSolutions = solutions;

    const result = calculateScenarios(customer, interviewAnswers);
    res.json(result);
  } catch (error) {
    console.error('Scenario calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate scenarios', message: error.message });
  }
});
```

- [ ] **Step 6: Update narrative generation endpoint**

Modify `srv/server.js` lines 109-178 (GET /api/generate-narrative):

Replace `const customer = customerData.find(...)` on line 113 with:

```javascript
    const customers = await assessmentService.run(
      SELECT.from(db.Customers).where({ id: customerId })
    );
    const customer = customers[0];
```

- [ ] **Step 7: Update PDF export endpoint**

Modify `srv/server.js` lines 181-218 (POST /api/export-pdf):

Replace lines 189-192 with:

```javascript
    const customers = await assessmentService.run(
      SELECT.from(db.Customers).where({ id: customerId })
    );

    if (!customers || customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found', customerId });
    }

    const customer = customers[0];
```

- [ ] **Step 8: Update legacy chat endpoint**

Modify `srv/server.js` lines 224-309 (GET /api/chat):

Replace lines 234-278 with:

```javascript
    if (customerId) {
      const customers = await assessmentService.run(
        SELECT.from(db.Customers).where({ id: customerId })
      );

      if (customers && customers.length > 0) {
        const customer = customers[0];

        // Get purchased solutions for financial model
        const solutions = await assessmentService.run(
          SELECT.from(db.PurchasedSolutions).where({ customerId })
        );

        customer.purchasedSolutions = solutions;

        const financialModel = new FinancialModel(customer);
        financials = financialModel.calculate();

        // Build entitlement context from HANA data
        let entitlementContext = '';
        if (solutions && solutions.length > 0) {
          entitlementContext = `\nPurchased Solutions (${solutions.length} solution areas):`;
          solutions.forEach(sol => {
            entitlementContext += `\n  - ${sol.solutionArea}: $${(sol.activeACV / 1000000).toFixed(2)}M ACV, contract ends ${sol.contractEndDate}`;
          });
        }

        customerContext = `
Customer Profile:
- Name: ${customer.name}
- ERP: ${customer.erpDeployment || 'Not specified'}
- BW: ${customer.existingBW || 'No'}
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
```

- [ ] **Step 9: Commit Express HANA integration**

```bash
git add srv/server.js
git commit -m "feat: migrate Express server to query CAP/HANA backend"
```

---

### Task 6: Create HDI Container and Deploy to HANA

**Files:**
- N/A (Cloud Foundry service creation and deployment)

- [ ] **Step 1: Verify HANA instance is running**

Run: `cf service bdc-hana-trial`

Expected: `status: create succeeded` and `message: HanaService is ready`

- [ ] **Step 2: Create HDI container service**

Run: `cf create-service hana hdi-shared bdc-hana-db`

Expected: `Creating service instance bdc-hana-db... OK`

- [ ] **Step 3: Wait for HDI container provisioning**

Run: `cf service bdc-hana-db`

Expected: `status: create succeeded`

(If status is "create in progress", wait 2-3 minutes and check again)

- [ ] **Step 4: Build CAP project for deployment**

Run: `cd ~/bdc-assessment-generator && cds build --production`

Expected:
```
[cds] - build completed in X ms
✔ Build completed successfully
```

Output creates `gen/` folder with compiled artifacts

- [ ] **Step 5: Deploy HDI artifacts to HANA**

Run: `cd ~/bdc-assessment-generator && cf deploy gen/db -s bdc-hana-db`

Expected:
```
Deploying to service bdc-hana-db...
✔ Deployment successful
```

This creates tables and loads CSV seed data

- [ ] **Step 6: Verify tables were created**

Run: `cf ssh bdc-assessment-srv -c "env | grep hana"`

Expected: VCAP_SERVICES contains hana binding

(Note: App must be deployed first - see next task)

- [ ] **Step 7: Check deployment logs**

Run: `cf logs bdc-assessment-srv --recent | grep -i hana`

Expected: Connection logs, no errors

---

### Task 7: Deploy Updated Application to Cloud Foundry

**Files:**
- N/A (deployment)

- [ ] **Step 1: Set Anthropic API key**

Run: `cf set-env bdc-assessment-v3 ANTHROPIC_API_KEY "your-actual-key-here"`

Expected: `Setting env variable ANTHROPIC_API_KEY for app bdc-assessment-v3... OK`

- [ ] **Step 2: Push application to Cloud Foundry**

Run: `cd ~/bdc-assessment-generator && cf push`

Expected:
```
Pushing app bdc-assessment-v3...
✔ App started successfully
route: bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com
```

- [ ] **Step 3: Bind HANA service to application**

Run: `cf bind-service bdc-assessment-v3 bdc-hana-db`

Expected: `Binding service bdc-hana-db to app bdc-assessment-v3... OK`

- [ ] **Step 4: Restage application to pick up service binding**

Run: `cf restage bdc-assessment-v3`

Expected: `App restaged successfully`

- [ ] **Step 5: Verify application is running**

Run: `cf app bdc-assessment-v3`

Expected: `state: started`, `instances: 1/1`

- [ ] **Step 6: Test health endpoint**

Run: `curl https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/health`

Expected:
```json
{
  "status": "UP",
  "service": "bdc-assessment-generator-v3",
  "customersLoaded": 25,
  "database": "HANA"
}
```

- [ ] **Step 7: Test customer API with HANA data**

Run: `curl "https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/api/customers/search?q=loves"`

Expected: JSON response with Loves customer data including `purchasedSolutions`, `cloudSystemsCount`

- [ ] **Step 8: Check application logs for HANA connection**

Run: `cf logs bdc-assessment-v3 --recent | head -20`

Expected: `✅ Connected to CAP AssessmentService with HANA`

---

### Task 8: Verify Data Integrity and Create Test Queries

**Files:**
- Create: `tests/hana-verification.http`

- [ ] **Step 1: Create HTTP test file for manual verification**

Create `tests/hana-verification.http`:

```http
### 1. Health Check
GET https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/health

### 2. List All Customers
GET https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/api/customers

### 3. Search for Loves
GET https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/api/customers/search?q=loves

### 4. Search for Celanese
GET https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/api/customers/search?q=celanese

### 5. Generate Scenarios (Loves)
POST https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/api/scenarios
Content-Type: application/json

{
  "customerId": "0000190852",
  "interviewAnswers": {
    "businessDriver": "revenue_growth",
    "timeline": "6-12_months",
    "cloudPreference": "multi_cloud",
    "riskTolerance": "balanced"
  }
}

### 6. OData Service Metadata
GET https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/odata/v4/assessment/$metadata

### 7. Query Cloud Systems (OData)
GET https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/odata/v4/assessment/CloudSystems?$filter=customerId eq '0000190852'&$top=5

### 8. Query Purchased Solutions (OData)
GET https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/odata/v4/assessment/PurchasedSolutions?$filter=customerId eq '0000190852'

### 9. Get Customer Spend (Custom Function)
GET https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/odata/v4/assessment/getCustomerSpend(customerId='0000190852')

### 10. Get Contract Expirations (Custom Function)
GET https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/odata/v4/assessment/getContractExpirations(customerId='0000190852',daysThreshold=365)
```

- [ ] **Step 2: Test customer count matches seed data**

Run: `curl -s https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/health | jq '.customersLoaded'`

Expected: `25` (or however many customers in CSV)

- [ ] **Step 3: Test Loves customer has correct spend data**

Run:
```bash
curl -s "https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/api/customers/search?q=loves" | jq '{name: .name, totalSpend: .totalSpend, cloudSystems: .cloudSystemsCount, licenses: .onPremLicensesCount}'
```

Expected:
```json
{
  "name": "Loves Travel Stops & Country Stores",
  "totalSpend": 1668571.41,
  "cloudSystems": 1552,
  "licenses": 93
}
```

- [ ] **Step 4: Verify purchased solutions match Excel data**

Run:
```bash
curl -s "https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/api/customers/search?q=loves" | jq '.purchasedSolutions[] | {area: .solutionArea, acv: .activeACV, endDate: .contractEndDate}'
```

Expected: JSON array with 8 solution areas (BTP, Customer Experience, etc.)

- [ ] **Step 5: Test scenario generation with HANA data**

Run:
```bash
curl -s -X POST https://bdc-assessment-v3.cfapps.us10-001.hana.ondemand.com/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{"customerId":"0000190852","interviewAnswers":{"businessDriver":"revenue_growth","timeline":"6-12_months","cloudPreference":"multi_cloud","riskTolerance":"balanced"}}' \
  | jq '.scenarios | length'
```

Expected: `3` (three scenarios generated)

- [ ] **Step 6: Commit verification tests**

```bash
git add tests/hana-verification.http
git commit -m "test: add HANA data verification tests"
```

---

### Task 9: Update Documentation

**Files:**
- Create: `docs/HANA-MIGRATION.md`
- Modify: `README.md` (if exists)

- [ ] **Step 1: Create migration documentation**

Create `docs/HANA-MIGRATION.md`:

```markdown
# HANA Migration - Completed

## Overview

BDC Assessment Generator has been migrated from in-memory JavaScript objects to SAP HANA Cloud database using CAP framework.

## Architecture

**Before:**
- Customer data: Hardcoded JS objects in `srv/data/customer-list.js`
- Entitlements: Not stored (demo data only)
- Database: SQLite (in-memory)

**After:**
- Customer data: HANA tables with 2K+ records
- Entitlements: Cloud Systems (1,552), On-Prem Licenses (93), Purchased Solutions (8)
- Database: HANA Cloud HDI container
- Service Layer: CAP OData APIs
- API Layer: Express (consumes CAP service)

## Data Model

**Entities:**
1. `Customers` - 25 customer profiles
2. `CloudSystems` - 1,552 cloud entitlements (BTP, etc.)
3. `OnPremSystems` - 265 on-premise systems
4. `SystemDetails` - Maintenance expiration tracking
5. `OnPremLicenses` - 93 license records with TCV
6. `PurchasedSolutions` - 8 solution areas with ACV
7. `Assessments` - Generated assessment repository

## Seed Data

**Source:** Loves Travel Stops entitlement export (April 4, 2026)

**Files:**
- `db/data/bdc.assessment-Customers.csv`
- `db/data/bdc.assessment-CloudSystems.csv`
- `db/data/bdc.assessment-OnPremSystems.csv`
- `db/data/bdc.assessment-OnPremLicenses.csv`
- `db/data/bdc.assessment-PurchasedSolutions.csv`

**Conversion:** `scripts/excel-to-csv.js` (reusable for other customers)

## Deployment

**Prerequisites:**
1. HANA Cloud instance running (`bdc-hana-trial`)
2. HDI container service (`bdc-hana-db`)
3. Cloud Foundry CLI
4. Node.js 20+

**Deploy:**
```bash
# Build CAP project
cds build --production

# Deploy HDI container
cf deploy gen/db -s bdc-hana-db

# Push application
cf push

# Bind HANA service
cf bind-service bdc-assessment-v3 bdc-hana-db
cf restage bdc-assessment-v3
```

## API Changes

**Unchanged:**
- `/health` - Now shows HANA connection
- `/api/customers` - Same response, now from HANA
- `/api/customers/search` - Enhanced with financial data
- `/api/scenarios` - Same workflow
- `/api/generate-narrative` - No changes
- `/api/export-pdf` - No changes

**New (OData):**
- `/odata/v4/assessment/$metadata` - Service metadata
- `/odata/v4/assessment/Customers` - CRUD operations
- `/odata/v4/assessment/CloudSystems?$filter=...` - Query entitlements
- `/odata/v4/assessment/getCustomerSpend(customerId='...')` - Financial rollup

## Financial Calculations

**Customer Spend:**
```
Total Spend = SUM(PurchasedSolutions.activeACV) + SUM(OnPremLicenses.tcvOnPrem)
```

**Example (Loves):**
- BTP ACV: $1.67M
- Customer Experience: $15K
- Other solutions: $X
- On-prem licenses: $76K
- **Total: $1.76M/year**

## Contract Expiration Alerts

Query contracts expiring within N days:
```javascript
const expirations = await assessmentService.run(
  'getContractExpirations',
  { customerId: '0000190852', daysThreshold: 90 }
);
```

**Loves Example:**
- BTP contract ends: 2026-12-31 (272 days)
- Customer Experience: 2026-09-30 (180 days)

## Production Readiness

**✅ Completed:**
- HANA schema design
- CAP service layer
- Data seeding from Excel
- Express integration
- Deployment automation
- Financial rollup logic

**🚧 Future Enhancements:**
- Admin UI for data upload
- Contract renewal workflows
- Multi-customer analysis
- API integration with LIS
- AI Core for assessment generation

## Demo Script

**For Shane (3 minutes):**

1. **Show architecture:** "Built with CAP + HANA on BTP trial"
   - `cf apps` - Show running app
   - `cf services` - Show HANA binding

2. **Show data volume:** "Loaded 2K real entitlement records"
   - Open `/health` - Show 25 customers loaded
   - Open browser DevTools Network tab

3. **Search customer:** "Loves Travel Stops"
   - Type "loves" in search
   - Show: $1.67M spend, 1,552 cloud systems, contracts expiring

4. **Generate assessment:** Click through interview
   - AI reads from HANA
   - Generates 3 scenarios with ROI

5. **Key point:** "The only thing missing is AI Core - using Anthropic API directly"

**Technical credibility:**
- Production-grade CAP architecture
- Real entitlement data (not mock)
- OData APIs ready for Power BI
- Scales to thousands of customers

## Files Modified

**Created:**
- `db/schema.cds` - Data model
- `srv/assessment-service.cds` - Service definitions
- `srv/assessment-service.js` - Custom handlers
- `scripts/excel-to-csv.js` - Data conversion
- `db/data/*.csv` - Seed data (5 files)
- `mta.yaml` - Deployment descriptor

**Modified:**
- `srv/server.js` - Query HANA instead of JS objects
- `package.json` - Add CAP dependencies
- `manifest.yml` - Add HANA binding

**Removed:**
- `srv/data/customer-list.js` - Replaced by HANA tables
```

- [ ] **Step 2: Commit documentation**

```bash
git add docs/HANA-MIGRATION.md
git commit -m "docs: add HANA migration documentation"
```

- [ ] **Step 3: Create final commit tag**

```bash
git tag -a v4.0.0-hana-migration -m "Migrate BDC Assessment to HANA Cloud"
git push origin main --tags
```

---

## Verification Checklist

After completing all tasks, verify:

- [ ] HANA instance running (`cf service bdc-hana-trial` shows "ready")
- [ ] HDI container created (`cf service bdc-hana-db` shows "create succeeded")
- [ ] Tables created with seed data (2K+ records)
- [ ] Application deployed and running
- [ ] Health endpoint returns 25 customers
- [ ] Customer search works with HANA data
- [ ] Scenario generation uses HANA financial data
- [ ] OData APIs accessible
- [ ] No references to `customer-list.js` in running code
- [ ] Git commits follow convention (feat:, test:, docs:)

---

## Time Estimate

**Realistic breakdown:**
- Task 1 (Schema): 20 min
- Task 2 (CSV conversion): 30 min
- Task 3 (CAP service): 25 min
- Task 4 (Config): 15 min
- Task 5 (Express updates): 45 min
- Task 6 (HDI deploy): 20 min
- Task 7 (App deploy): 25 min
- Task 8 (Testing): 20 min
- Task 9 (Docs): 15 min

**Total: ~3.5 hours**

**Critical path:**
- HANA must be running before Task 6
- HDI container must succeed before Task 7
- Each task builds on previous (no parallelization)

---

## Rollback Plan

If migration fails:

1. **Revert to JS data:**
   ```bash
   git checkout HEAD~10 srv/server.js
   cf set-env bdc-assessment-v3 USE_SQLITE true
   cf restage bdc-assessment-v3
   ```

2. **Delete HANA service:**
   ```bash
   cf unbind-service bdc-assessment-v3 bdc-hana-db
   cf delete-service bdc-hana-db -f
   ```

3. **Keep HANA schema for retry:**
   - Don't delete `db/schema.cds` or CSV files
   - Fix issues and redeploy
