/**
 * Section 8: Recommended Roadmap
 *
 * PURPOSE: 3-phase implementation tied to business outcomes (not just technical milestones)
 * STYLE: Actionable plan with clear decision points and success metrics
 * OUTPUT: Phased roadmap + milestone definitions + resource requirements
 */

export const section8Prompt = ({ customerProfile, businessContext, selectedComponents }) => {
  return {
    systemPrompt: `You are a strategic business consultant designing an implementation roadmap tied to business outcomes.

CRITICAL RULES:
- 3-phase approach (Foundation → Enablement → Optimization)
- Each phase ends with business value realization, not just tech milestones
- Clear decision gates between phases (go/no-go criteria)
- Resource requirements (budget, team, timeline)
- Tie milestones to Section 1 business priorities

TONE: Program manager presenting to steering committee`,

    userPrompt: `Write Section 8: Recommended Roadmap for this customer:

**Customer Profile:**
- Company: ${customerProfile.companyName}
- Industry: ${customerProfile.industry}

**Business Context (from Section 1):**
${businessContext}

**Selected BDC Components:**
${selectedComponents.map(c => `- ${c}`).join('\n')}

**Investment:**
- Total: $5.45M over 24 months
- Year 1: $2.2M
- Year 2: $2.15M
- Year 3+: $1.1M

OUTPUT FORMAT:
# 8. Recommended Implementation Roadmap

## Overview: Phased Approach

| Phase | Timeline | Investment | Key Deliverables | Business Value |
|-------|----------|------------|------------------|----------------|
| Phase 1: Foundation | Months 1-6 | $2.2M | Datasphere deployed, legacy data migrated | License consolidation begins |
| Phase 2: Enablement | Months 7-12 | $2.15M | Analytics Cloud rollout, self-service enabled | FTE reduction, faster insights |
| Phase 3: Optimization | Months 13-24 | $1.1M | AI/ML workloads, advanced analytics | Revenue impact, competitive advantage |

---

## Phase 1: Foundation (Months 1-6)

### Objectives
- Deploy SAP Datasphere as unified data foundation
- Migrate data from fragmented sources (${customerProfile.entitlements.length} SAP systems + ${customerProfile.thirdPartyTools.length} third-party tools)
- Establish governance framework
- Begin license consolidation

### Key Activities

#### Month 1: Kickoff & Design
- [ ] Executive steering committee formation
- [ ] Detailed requirements gathering
- [ ] Data source assessment and prioritization
- [ ] Architecture design validation
- [ ] Implementation partner selection (if needed)

#### Months 2-4: Build & Migrate
- [ ] Datasphere environment provisioning
- [ ] Pilot data migration (non-critical sources)
- [ ] Data quality profiling and cleansing
- [ ] Integration development (SAP BW, ECC, third-party APIs)
- [ ] Governance policies definition (data ownership, access controls)

#### Months 5-6: Test & Stabilize
- [ ] UAT with data ops team
- [ ] Performance testing at scale
- [ ] Security and compliance validation
- [ ] Runbook documentation
- [ ] Parallel run with legacy systems

### Go/No-Go Decision Gate
**Criteria:**
- ✅ Core data sources migrated and validated
- ✅ Performance benchmarks met
- ✅ Governance policies approved by compliance team
- ✅ User acceptance testing passed
- ✅ Runbook documentation complete

### Business Value Realization
- **License Consolidation:** Decommission 2-3 third-party tools → $500K annual savings
- **Infrastructure:** Begin cloud migration → $300K annual savings

### Resource Requirements
- **Budget:** $2.2M
- **Team:**
  - 2 SAP architects (full-time)
  - 4 data engineers (full-time)
  - 1 project manager (full-time)
  - Business SMEs (part-time)
- **External:** SAP Professional Services (optional, 6-month engagement)

---

## Phase 2: Analytics Enablement (Months 7-12)

### Objectives
- Deploy SAP Analytics Cloud
- Enable self-service analytics for business users
- Reduce data ops team bottleneck
- Demonstrate business value to executive stakeholders

### Key Activities

#### Months 7-8: Analytics Rollout
- [ ] Analytics Cloud environment setup
- [ ] Power user training (20 users)
- [ ] Dashboard migration from legacy tools (Tableau, etc.)
- [ ] Self-service catalog creation

#### Months 9-10: Adoption & Scale
- [ ] Business user training (200+ users)
- [ ] Pilot with 2-3 business units
- [ ] Feedback loops and iteration
- [ ] Advanced analytics use cases (predictive models)

#### Months 11-12: Optimization
- [ ] Decommission legacy BI tools
- [ ] Data ops team restructuring (${customerProfile.baseline.dataOpsFTEs} → 18 FTEs)
- [ ] Performance tuning based on usage patterns
- [ ] Executive dashboard for steering committee

### Go/No-Go Decision Gate
**Criteria:**
- ✅ 80% user adoption in pilot business units
- ✅ Self-service requests reduced by 40%
- ✅ Legacy BI tools decommissioned
- ✅ FTE reduction plan approved by HR
- ✅ Business value metrics tracking established

### Business Value Realization
- **Labor Efficiency:** 7 FTE reduction → $700K annual savings
- **Faster Insights:** Reduced analytics request turnaround (5 days → 1 day) → $1.6M annual revenue impact
- **License Consolidation:** Decommission Tableau, remaining third-party tools → $1.2M annual savings

### Resource Requirements
- **Budget:** $2.15M
- **Team:**
  - 1 SAP Analytics Cloud architect (full-time)
  - 2 BI developers (full-time)
  - 1 change management lead (full-time)
  - Power user champions (part-time)
- **External:** Change management consultant (optional, 6-month engagement)

---

## Phase 3: Advanced Capabilities (Months 13-24)

### Objectives
- Enable AI/ML workloads on Datasphere
- Deploy predictive analytics for key business processes
- Achieve full ROI realization
- Position ${customerProfile.companyName} as industry leader in data-driven decision-making

### Key Activities

#### Months 13-16: AI/ML Foundation
- [ ] SAP AI Core integration
- [ ] Data science sandbox environments
- [ ] Pilot ML models (demand forecasting, predictive maintenance, etc.)
- [ ] Model governance framework

#### Months 17-20: Production Deployment
- [ ] Deploy production ML models
- [ ] Real-time analytics use cases
- [ ] Advanced visualization and storytelling
- [ ] Executive AI literacy training

#### Months 21-24: Optimization & Scale
- [ ] MLOps pipeline automation
- [ ] Continuous model retraining
- [ ] Expansion to additional use cases
- [ ] Post-implementation value assessment

### Go/No-Go Decision Gate
**Criteria:**
- ✅ At least 3 production ML models deployed
- ✅ Measurable business impact from predictive analytics
- ✅ User satisfaction scores > 80%
- ✅ Full ROI realization (vs Section 6 financial model)

### Business Value Realization
- **Revenue Impact:** Predictive analytics driving 0.5% revenue growth → $2.4M annual
- **Operational Efficiency:** AI-powered automation → $1.0M annual savings
- **Competitive Advantage:** Industry-leading analytics maturity

### Resource Requirements
- **Budget:** $1.1M
- **Team:**
  - 2 data scientists (full-time)
  - 1 ML engineer (full-time)
  - 1 business analyst (part-time)

---

## Governance & Ongoing Operations

### Steering Committee
- **Chair:** CFO or CIO
- **Members:** Finance, Operations, IT, HR leaders
- **Cadence:** Monthly (Phase 1-2), Quarterly (Phase 3+)
- **Decisions:** Budget approvals, scope changes, phase gate approvals

### Working Groups
- **Technical:** Architecture, data quality, integration
- **Business:** Use case prioritization, user feedback
- **Change Management:** Training, communication, adoption metrics

### Success Metrics Dashboard

| Metric | Target | Tracking Frequency |
|--------|--------|--------------------|
| User Adoption Rate | >80% | Monthly |
| Self-Service Request Reduction | >40% | Monthly |
| License Consolidation Savings | $1.9M annual | Quarterly |
| FTE Efficiency | 7 FTE reduction | Quarterly |
| Revenue Impact (Faster Insights) | 0.5% growth | Quarterly |
| User Satisfaction Score | >80% | Quarterly |
| ROI Realization | 134% over 5 years | Annual |

---

## Next Steps (30 Days)

### Week 1: Secure Executive Sponsorship
- [ ] Present this assessment to CFO and CIO
- [ ] Obtain steering committee commitment
- [ ] Allocate Phase 1 budget ($2.2M)

### Week 2: Form Core Team
- [ ] Hire/assign project manager
- [ ] Identify internal architects and data engineers
- [ ] Evaluate external implementation partners (if needed)

### Week 3: Detailed Planning
- [ ] Finalize Phase 1 project plan
- [ ] Conduct data source assessment
- [ ] Define success metrics and tracking mechanisms

### Week 4: Kickoff
- [ ] Official project launch
- [ ] Stakeholder communication (town halls)
- [ ] Begin Datasphere environment provisioning

---

## Why This Roadmap Works

1. **Phased Value Realization** - Business value in each phase, not just at the end
2. **Clear Decision Gates** - Go/no-go criteria prevent runaway projects
3. **Tied to Business Outcomes** - Every milestone maps to Section 1 priorities
4. **Risk-Aware** - Pilot-first approach limits blast radius
5. **Change Management Embedded** - Not an afterthought

**Recommendation:** Proceed with Phase 1 kickoff within 30 days to hit ${customerProfile.contractExpiry} renewal timeline.

REMEMBER: This roadmap solves the Section 1 business problems, not just implements technology. That's what makes it a consulting deliverable, not a vendor pitch.`
  };
};
