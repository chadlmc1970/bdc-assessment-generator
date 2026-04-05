/**
 * Section 7: Risk & Change Management
 *
 * PURPOSE: What Bain includes but vendors skip - migration complexity, skills gaps, organizational change
 * STYLE: Pragmatic risk assessment with mitigation strategies
 * OUTPUT: Risk register + change management roadmap + success factors
 */

export const section7Prompt = ({ customerProfile, selectedComponents }) => {
  return {
    systemPrompt: `You are a strategic business consultant assessing implementation risks and change management requirements.

CRITICAL RULES:
- This is what separates consulting docs from vendor pitches - honest risk assessment
- Cover technical risks (migration, integration, performance) AND organizational risks (adoption, skills, culture)
- Mitigation strategies must be actionable, not generic platitudes
- Reference change management best practices (Kotter, Prosci)
- Acknowledge what could go wrong - builds credibility

TONE: Pragmatic consultant who has seen implementations succeed AND fail`,

    userPrompt: `Write Section 7: Risk & Change Management for this customer:

**Customer Profile:**
- Company: ${customerProfile.companyName}
- Industry: ${customerProfile.industry}
- Employees: ${customerProfile.employees}
- Data Ops Team: ${customerProfile.baseline.dataOpsFTEs} FTEs

**Selected BDC Components:**
${selectedComponents.map(c => `- ${c}`).join('\n')}

**Migration Complexity:**
- Source Systems: ${customerProfile.entitlements.length} SAP products + ${customerProfile.thirdPartyTools.length} third-party tools
- Data Volume: [Estimate based on company size]
- Integration Points: [Complex given fragmented landscape]

OUTPUT FORMAT:
# 7. Risk & Change Management

## Implementation Risk Register

### Technical Risks

#### 1. Data Migration Complexity
- **Probability:** Medium (40%)
- **Impact:** High (6-month delay, cost overrun)
- **Root Causes:**
  - Migrating from ${customerProfile.thirdPartyTools.length} third-party tools (Snowflake, Informatica, etc.)
  - Data quality issues in legacy systems
  - Inconsistent data models across sources
- **Mitigation Strategies:**
  - Pilot migration with non-critical data first
  - Invest in data profiling and cleansing upfront
  - Parallel run period (3-6 months) before cutover
  - Engage SAP Professional Services for complex migrations
- **Residual Risk:** Low

#### 2. Integration Stability
- **Probability:** Medium (35%)
- **Impact:** Medium (performance issues, user complaints)
- **Root Causes:**
  - Real-time integration requirements
  - Third-party API dependencies
  - Peak load handling
- **Mitigation Strategies:**
  - Performance testing with production-scale data
  - Fallback mechanisms for critical integrations
  - Phased rollout to limit blast radius
- **Residual Risk:** Low-Medium

#### 3. Performance & Scalability
- **Probability:** Low (20%)
- **Impact:** Medium (user dissatisfaction)
- **Root Causes:**
  - Underestimated query complexity
  - Insufficient infrastructure sizing
- **Mitigation Strategies:**
  - Benchmark testing with realistic workloads
  - Cloud infrastructure auto-scaling
  - Query optimization reviews
- **Residual Risk:** Low

---

### Organizational Risks

#### 4. User Adoption & Skills Gaps
- **Probability:** HIGH (60%)
- **Impact:** High (delayed benefits realization)
- **Root Causes:**
  - ${customerProfile.baseline.dataOpsFTEs}-person data ops team with legacy skills
  - Business users accustomed to old tools
  - Fear of job displacement
- **Mitigation Strategies:**
  - Invest 10% of budget in training ($550K over 24 months)
  - Certification programs for data ops team
  - Power user champions in each business unit
  - Self-service analytics enablement (reduce bottlenecks)
  - Transparent communication about FTE reductions (attrition vs layoffs)
- **Residual Risk:** Medium

#### 5. Executive Sponsorship
- **Probability:** Medium (30%)
- **Impact:** High (stalled decision-making, scope creep)
- **Root Causes:**
  - Competing priorities at executive level
  - Unclear accountability
- **Mitigation Strategies:**
  - Designate executive sponsor (CFO or CIO)
  - Steering committee with clear decision rights
  - Quarterly board updates on business value realization
- **Residual Risk:** Low

#### 6. Change Fatigue
- **Probability:** Medium (40%)
- **Impact:** Medium (slower adoption)
- **Root Causes:**
  - Multiple concurrent IT initiatives
  - Recent organizational changes
- **Mitigation Strategies:**
  - Phased rollout (pilot → regional → global)
  - Early wins to build momentum
  - User feedback loops
- **Residual Risk:** Medium

---

## Change Management Roadmap

### Phase 1: Awareness & Buy-In (Months 1-3)
- [ ] Executive roadshow - present Section 5 scenario comparison
- [ ] Town halls with data ops team - transparent communication
- [ ] Identify change champions in each business unit
- [ ] Establish governance structure (steering committee, working groups)

### Phase 2: Training & Enablement (Months 4-12)
- [ ] Administrator training (Datasphere, Analytics Cloud, etc.)
- [ ] Business user training (self-service analytics)
- [ ] Certification programs (incentivize upskilling)
- [ ] Sandbox environments for hands-on learning

### Phase 3: Pilot & Feedback (Months 10-15)
- [ ] Pilot with non-critical business unit
- [ ] User feedback surveys
- [ ] Iterate on processes and training
- [ ] Document lessons learned

### Phase 4: Scaling & Optimization (Months 16-24)
- [ ] Phased rollout to remaining business units
- [ ] Advanced use case enablement (AI/ML)
- [ ] Continuous improvement based on user feedback

---

## Critical Success Factors

### Must-Haves
1. **Executive Sponsor with Budget Authority** - Non-negotiable
2. **Dedicated Implementation Team** - Not "other duties as assigned"
3. **Fixed-Price Implementation Contract** - Risk transfer to SI partner
4. **Phased Go-Live** - Limit blast radius, learn iteratively

### Nice-to-Haves (But Important)
- Early wins to build momentum
- External implementation partner with ${customerProfile.industry} expertise
- User community / center of excellence

---

## Lessons from Failed Implementations

What causes BDC implementations to fail (learn from others' mistakes):
1. **Big-bang cutover** - Migrate everything at once, no fallback
2. **Underinvest in change management** - Assume "if we build it, they will come"
3. **Unclear business case** - Technology project, not business transformation
4. **Weak executive sponsorship** - IT-led without CFO/CEO backing

**Our Mitigation:** This assessment positions BDC as strategic business transformation (not IT project) with CFO-grade financials and executive-level sponsorship.

REMEMBER: Acknowledging risks builds trust. CFOs know every project has risks - they want to see honest assessment and mitigation plans.`
  };
};
