/**
 * Database Service - CDS/HANA data access layer
 * Abstracts CDS queries for Express server endpoints
 */

const cds = require('@sap/cds');
const { SELECT } = cds.ql;

let db = null;

/**
 * Initialize CDS connection (call once at startup)
 */
async function connect() {
  if (!db) {
    db = await cds.connect.to('db');
    console.log('✓ Connected to CDS database');
  }
  return db;
}

/**
 * Get all customers with ERP/BW data for dropdown
 * @returns {Promise<Array>} Customer list with solutions
 */
async function getCustomers() {
  await connect();

  const customers = await SELECT.from('bdc.assessment.Customers').columns([
    'id',
    'name',
    'erpDeployment',
    'existingBW',
    'otherDatalake',
    'bdcOverview',
    'dataOwner',
    'aiOwner',
    'iae'
  ]).orderBy('name');

  // Fetch all purchased solutions for all customers
  const allSolutions = await SELECT.from('bdc.assessment.PurchasedSolutions');

  // Group solutions by customerId
  const solutionsMap = {};
  allSolutions.forEach(sol => {
    if (!solutionsMap[sol.customerId]) {
      solutionsMap[sol.customerId] = [];
    }
    solutionsMap[sol.customerId].push(sol);
  });

  // Attach solutions to each customer
  customers.forEach(customer => {
    customer.solutions = solutionsMap[customer.id] || [];
  });

  return customers;
}

/**
 * Find customer by ID (exact match)
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object|null>} Customer object or null
 */
async function findCustomerById(customerId) {
  await connect();

  const customer = await SELECT.one.from('bdc.assessment.Customers').where({ id: customerId });
  return customer || null;
}

/**
 * Search customers by name (fuzzy match)
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching customers with solutions
 */
async function searchCustomers(query) {
  await connect();

  const customers = await SELECT.from('bdc.assessment.Customers')
    .where`lower(name) like ${'%' + query.toLowerCase() + '%'}`
    .orderBy('name');

  // Fetch solutions for matched customers
  if (customers.length > 0) {
    const customerIds = customers.map(c => c.id);
    const solutions = await SELECT.from('bdc.assessment.PurchasedSolutions')
      .where({ customerId: { in: customerIds } });

    // Group solutions by customer
    const solutionsMap = {};
    solutions.forEach(sol => {
      if (!solutionsMap[sol.customerId]) {
        solutionsMap[sol.customerId] = [];
      }
      solutionsMap[sol.customerId].push(sol);
    });

    // Attach solutions to customers
    customers.forEach(customer => {
      customer.solutions = solutionsMap[customer.id] || [];
    });
  }

  return customers;
}

/**
 * Get customer with full entitlement data (for scenario calculation)
 * Joins customer with cloud systems, on-prem systems, licenses, and purchased solutions
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>} Customer with entitlement data
 */
async function getCustomerWithEntitlements(customerId) {
  await connect();

  // Get base customer
  const customer = await SELECT.one.from('bdc.assessment.Customers').where({ id: customerId });
  if (!customer) return null;

  // Normalize customer ID for joins (CloudSystems uses zero-padded IDs)
  const paddedId = customerId.padStart(10, '0');

  // Get cloud systems
  const cloudSystems = await SELECT.from('bdc.assessment.CloudSystems').where({ customerId: paddedId });

  // Get on-prem systems
  const onPremSystems = await SELECT.from('bdc.assessment.OnPremSystems').where({ customerId });

  // Get on-prem licenses
  const licenses = await SELECT.from('bdc.assessment.OnPremLicenses').where({ customerId });

  // Get purchased solutions
  const solutions = await SELECT.from('bdc.assessment.PurchasedSolutions').where({ customerId });

  // Calculate total spend
  const solutionsSpend = solutions.reduce((sum, s) => sum + (s.activeACV || 0), 0);
  const licensesSpend = licenses.reduce((sum, l) => sum + (l.tcvOnPrem || 0), 0);

  // Build entitlement sets (group cloud systems by entitlementSetId)
  const entitlementSetsMap = {};
  cloudSystems.forEach(sys => {
    const setId = sys.entitlementSetId || 'unknown';
    if (!entitlementSetsMap[setId]) {
      entitlementSetsMap[setId] = {
        id: setId,
        type: sys.businessType || 'Unknown',
        orders: 0,
        created: sys.createdOn,
        solutionAreas: {}
      };
    }
    entitlementSetsMap[setId].orders++;
    if (sys.solutionArea) {
      entitlementSetsMap[setId].solutionAreas[sys.solutionArea] = true;
    }
  });

  const entitlementSets = Object.values(entitlementSetsMap);

  // Build entitlement summary
  const hasAI = cloudSystems.some(s =>
    s.solutionArea?.includes('AI') ||
    s.subSolutionArea?.includes('AI')
  );
  const hasBTP = cloudSystems.some(s =>
    s.solutionArea?.includes('BTP') ||
    s.businessType?.includes('BTP')
  );

  const keyAreas = [...new Set(
    cloudSystems
      .map(s => s.solutionArea)
      .filter(Boolean)
  )].slice(0, 5);

  return {
    ...customer,
    entitlementSets,
    entitlementSummary: {
      totalSets: entitlementSets.length,
      totalOrders: cloudSystems.length,
      hasAI,
      hasBTP,
      keyAreas
    },
    cloudSystems,
    onPremSystems,
    licenses,
    solutions,
    totalSpend: solutionsSpend + licensesSpend
  };
}

module.exports = {
  connect,
  getCustomers,
  findCustomerById,
  searchCustomers,
  getCustomerWithEntitlements
};
