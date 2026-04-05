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
