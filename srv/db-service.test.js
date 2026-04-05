// srv/db-service.test.js
const cds = require('@sap/cds');

async function runTests() {
  console.log('Testing db-service...');

  // Load CDS model first
  await cds.load('*');

  const { getCustomers, findCustomerById, searchCustomers, getCustomerWithEntitlements } = require('./db-service');

  // Test 1: Get all customers
  try {
    const customers = await getCustomers();
    console.assert(customers.length >= 25, 'Should have at least 25 customers');
    console.log('✓ getCustomers() passed');
  } catch (err) {
    console.error('✗ getCustomers() failed:', err.message);
  }

  // Test 2: Find customer by ID
  try {
    const customer = await findCustomerById('190852'); // Love Travels Stops
    console.assert(customer.name === 'Love Travels Stops', 'Should find Love Travels Stops');
    console.log('✓ findCustomerById() passed');
  } catch (err) {
    console.error('✗ findCustomerById() failed:', err.message);
  }

  // Test 3: Search customers
  try {
    const results = await searchCustomers('love');
    console.assert(results.length > 0, 'Should find customer with "love"');
    console.log('✓ searchCustomers() passed');
  } catch (err) {
    console.error('✗ searchCustomers() failed:', err.message);
  }

  // Test 4: Get customer with entitlements
  try {
    const customer = await getCustomerWithEntitlements('190852');
    console.assert(customer, 'Should return customer object');
    console.assert(customer.name === 'Love Travels Stops', 'Should have customer name');
    console.assert(Array.isArray(customer.entitlementSets), 'Should have entitlementSets array');
    console.assert(customer.entitlementSummary, 'Should have entitlementSummary object');
    console.assert(typeof customer.totalSpend === 'number', 'Should calculate totalSpend');
    console.log('✓ getCustomerWithEntitlements() passed');
  } catch (err) {
    console.error('✗ getCustomerWithEntitlements() failed:', err.message);
  }
}

runTests().catch(console.error);
