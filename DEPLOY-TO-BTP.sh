#!/bin/bash
# BTP Deployment Script

echo "===== BDC Assessment Generator - BTP Deployment ====="
echo ""
echo "Step 1: Login to BTP Cloud Foundry"
cf login -a https://api.cf.us10-001.hana.ondemand.com -o 19704659trial -s dev

echo ""
echo "Step 2: Push application"
cf push

echo ""
echo "Step 3: Check app status"
cf app bdc-assessment-api

echo ""
echo "Step 4: Test health endpoint"
echo "Fetching app route..."
APP_ROUTE=$(cf app bdc-assessment-api | grep "routes:" | awk '{print $2}')
echo "Testing https://$APP_ROUTE/health"
curl -s "https://$APP_ROUTE/health" | python3 -m json.tool

echo ""
echo "===== Deployment Complete ====="
echo "API Base URL: https://$APP_ROUTE"
echo "Service Endpoint: https://$APP_ROUTE/odata/v4/assessment"
