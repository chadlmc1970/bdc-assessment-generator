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
  key id                  : UUID;
      systemId            : String(20);
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
  key id                  : UUID;
      systemNumber        : String(20);
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
  key id                  : UUID;
      systemNumber        : String(20);
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
