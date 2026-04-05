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
