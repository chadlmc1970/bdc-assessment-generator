#!/bin/bash
# srv/integration-test.sh
# Integration test for all Express API endpoints with HANA

set -e

echo "Starting Express server..."
node srv/server.js &
SERVER_PID=$!
sleep 3

echo "Running integration tests..."

# Test 1: Health check
echo "Test 1: Health check"
curl -s http://localhost:4005/health | jq -e '.status == "UP"' || exit 1
echo "✓ Passed"

# Test 2: Get all customers
echo "Test 2: Get all customers"
curl -s http://localhost:4005/api/customers | jq -e '.customers | length >= 25' || exit 1
echo "✓ Passed"

# Test 3: Search customer
echo "Test 3: Search customer"
curl -s "http://localhost:4005/api/customers/search?q=love" | jq -e '.name == "Love Travels Stops"' || exit 1
echo "✓ Passed"

# Test 4: Generate scenarios
echo "Test 4: Generate scenarios"
curl -s -X POST http://localhost:4005/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{"customerId":"190852","interviewAnswers":{"businessDriver":"revenue_growth","timeline":"6-12_months","cloudPreference":"multi_cloud","riskTolerance":"balanced"}}' \
  | jq -e '.scenarios.recommended.investment > 0' || exit 1
echo "✓ Passed"

# Test 5: Adjust scenario
echo "Test 5: Adjust scenario"
curl -s -X POST http://localhost:4005/api/scenarios/adjust \
  -H "Content-Type: application/json" \
  -d '{"scenario":{"investment":2500000,"timelineMonths":12,"scopePercent":75},"adjustments":{"timelineMonths":18}}' \
  | jq -e '.timelineMonths == 18' || exit 1
echo "✓ Passed"

echo "All tests passed!"
kill $SERVER_PID
