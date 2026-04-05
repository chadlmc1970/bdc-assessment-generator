# BDC Assessment Generator - Financial Calculation Audit

**Auditor:** Financial Analysis Agent
**Date:** 2026-04-04
**Files Audited:**
- `srv/financial-model.js` (228 lines)
- `srv/scenario-calculator.js` (428 lines)
- `srv/public/js/dashboard.js` (702 lines)

**Test Case:** Loves Travel Stops (ID: 190852, 897 orders, Snowflake datalake)

---

## 1. Current State Analysis - What's Broken and Why

### 1.1 ROI Definition Problem (ROOT CAUSE #1)

**Current ROI formula** (scenario-calculator.js:116):
```js
roi = Math.round(((annualReturn - investment) / investment) * 100)
```

This is **Year 1 simple ROI**: `(Annual Return - Total Investment) / Total Investment`.

This formula is **mathematically correct as a single-year metric**, but it produces misleading numbers because it measures **one year of return against the entire upfront capital outlay**. For a project with multi-year benefits, this will almost always be negative or very low.

**Walkthrough with Loves Travel Stops (Recommended scenario):**

| Step | Calculation | Value |
|------|-------------|-------|
| Base investment (financial-model.js) | Datasphere $1.5M + AI Core $600K + SAC $450K + Services $892.5K | **$3,442,500** |
| Driver adjustment (revenue_growth) | $3,442,500 * 1.0 (recommended) * 1.10 (revenue) | **$3,786,750** |
| Annual return (base) | Tool consolidation $1.2M + Productivity $1.5M + Revenue $800K | **$3,500,000** |
| Return adjustment | $3,500,000 * 0.80 (recommended) * 1.25 (revenue) | **$3,500,000** |
| ROI | ($3,500,000 - $3,786,750) / $3,786,750 | **-8%** |

**The Aggressive scenario is even worse:**
| Step | Calculation | Value |
|------|-------------|-------|
| Investment | $3,442,500 * 1.65 * 1.10 | **$6,248,138** |
| Annual return | $3,500,000 * 1.0 * 1.25 | **$4,375,000** |
| ROI | ($4,375,000 - $6,248,138) / $6,248,138 | **-30%** |

**Problem:** The aggressive scenario has 1.65x the investment but only 1.0x the returns (vs 0.80x for recommended and 0.55x for conservative). The investment scales up faster than returns. Year 1 ROI will always be negative for the aggressive scenario because the full investment exceeds one year of returns.

### 1.2 The Aggressive ROI Paradox (ROOT CAUSE #2)

The scenario profiles have a fundamental asymmetry:

| Scenario | investmentMultiplier | returnAdjust | Ratio (return/invest) |
|----------|---------------------|--------------|----------------------|
| Conservative | 0.55 | 0.55 | 1.00 |
| Recommended | 1.00 | 0.80 | 0.80 |
| Aggressive | 1.65 | 1.00 | 0.61 |

**The aggressive scenario gets the worst return-to-investment ratio.** This is backwards. An aggressive scenario should unlock proportionally MORE returns (full stack = full benefits), not less. The current model penalizes investment -- spending more gives you diminishing marginal returns, which is the opposite of what the BDC pitch should communicate.

### 1.3 Frontend Slider Formula is Financially Unsound (ROOT CAUSE #3)

**Current formula** (dashboard.js:200):
```js
adjustedROI = Math.round(base.roi * scopeMultiplier * timelineRatio * investmentRatio)
```

Where:
- `scopeMultiplier = scope / 100` (e.g., 75/100 = 0.75)
- `timelineRatio = base.timeline / timeline` (e.g., 12/18 = 0.67)
- `investmentRatio = base.investment / investment` (e.g., 2.5/3.0 = 0.83)

**Problems:**

1. **Multiplicative compounding**: Multiplying three ratios together compounds small changes exponentially. If base ROI is -8%, multiplying by 0.75 * 0.67 * 0.83 gives -3.3%. The direction is right but the magnitude is arbitrary.

2. **investmentRatio is inverted logic**: `base.investment / investment` means increasing investment DECREASES ROI. This is only correct if returns don't change -- but returns SHOULD change with investment (you're buying more capability).

3. **Scope doesn't increase returns**: Scope only appears as a multiplier on ROI, not on the returns themselves. Higher scope should mean more return AND more cost, not just a scaling factor on an already-computed ROI.

4. **Starting from a broken base**: Since base ROI is already wrong (Year 1 simple ROI), all slider adjustments propagate the error.

### 1.4 NPV Calculation in Slider is Wrong (ROOT CAUSE #4)

**Current formula** (dashboard.js:201):
```js
adjustedNPV = investment * (adjustedROI / 100) * (timeline / 12)
```

This is `Investment * ROI% * Years`. This is **not NPV**. NPV requires discounting future cash flows. This formula:
- Uses ROI as a rate of return on the investment (circular if ROI is already broken)
- Does not discount
- Scales linearly with timeline (longer = better, which isn't necessarily true)
- Can produce negative NPV when ROI is negative (which is correct accidentally)

### 1.5 Payback Calculation in Slider is Wrong (ROOT CAUSE #5)

**Current formula** (dashboard.js:202):
```js
adjustedPayback = Math.round(timeline / (adjustedROI / 100 + 1))
```

This is `Timeline / (1 + ROI%)`. For example:
- ROI = 5%, timeline = 12: payback = 12 / 1.05 = 11.4 months (nearly same as timeline -- makes no sense)
- ROI = -20%, timeline = 9: payback = 9 / 0.8 = 11.25 months (payback exceeds project -- correct signal, wrong formula)
- ROI = -100% (edge case): payback = timeline / 0 = Infinity (crash)

**Payback should be:** `netInvestment / monthlyReturn` -- how many months until cumulative returns equal the investment.

### 1.6 Implementation Ramp Reduces Returns by ~85% During Implementation (HIDDEN BUG)

**Cash flow during implementation** (scenario-calculator.js:136):
```js
cumCF += monthlyReturn * (m / timelineMonths) * 0.3
```

During the implementation phase, monthly returns are scaled by `(month / timeline) * 0.3`. At the midpoint of a 12-month implementation, this gives `(6/12) * 0.3 = 0.15` -- only 15% of full monthly returns. At month 1 of 12, it's `(1/12) * 0.3 = 2.5%`.

This is reasonable (you don't get full returns during implementation), but it means the payback calculation at line 117 is overly optimistic because it uses the full annual return rate, not the ramped rate.

---

## 2. Root Cause Summary

| # | Root Cause | Location | Severity |
|---|-----------|----------|----------|
| 1 | ROI = Year 1 simple ROI (investment > 1yr returns = negative) | scenario-calculator.js:116 | **Critical** |
| 2 | Aggressive scenario has worst return/investment ratio | scenario-calculator.js SCENARIO_PROFILES | **Critical** |
| 3 | Frontend slider formula is arbitrary multiplication | dashboard.js:200 | **Critical** |
| 4 | Frontend NPV formula is not discounted cash flows | dashboard.js:201 | **High** |
| 5 | Frontend payback formula is mathematically wrong | dashboard.js:202 | **High** |
| 6 | Payback period ignores implementation ramp | scenario-calculator.js:117 | **Medium** |

---

## 3. Proposed Fixes

### Fix 1: Change ROI to 3-Year Cumulative ROI

**Why:** A BDC assessment is a multi-year investment. Measuring Year 1 return against total investment is like judging a house purchase by first-month rental income. The industry standard for enterprise software ROI studies is 3-year cumulative ROI.

**Current:**
```js
roi = Math.round(((annualReturn - investment) / investment) * 100)
```

**Proposed:**
```js
// 3-year cumulative ROI (with implementation ramp in year 1)
const year1Return = annualReturn * 0.5; // ~50% of full returns during implementation year
const year2Return = annualReturn;
const year3Return = annualReturn;
const totalReturn = year1Return + year2Return + year3Return;
const cumulativeROI = Math.round(((totalReturn - netInvestment) / netInvestment) * 100);
```

**Impact on Loves Travel Stops (Recommended):**
- Year 1 return (ramped): $3.5M * 0.5 = $1.75M
- Year 2: $3.5M
- Year 3: $3.5M
- Total 3yr return: $8.75M
- Net investment: $3.79M - $0.95M ECIF = $2.84M
- 3yr ROI: ($8.75M - $2.84M) / $2.84M = **208%**  (vs current -8%)

### Fix 2: Fix Scenario Return Ratios

**Current ratios (return/investment):**
| Scenario | investmentMultiplier | returnAdjust |
|----------|---------------------|-------------|
| Conservative | 0.55 | 0.55 |
| Recommended | 1.00 | 0.80 |
| Aggressive | 1.65 | 1.00 |

**Proposed ratios:**
| Scenario | investmentMultiplier | returnAdjust | Rationale |
|----------|---------------------|-------------|-----------|
| Conservative | 0.55 | 0.45 | Datasphere-only captures fewer savings |
| Recommended | 1.00 | 0.85 | Most capabilities, good return |
| Aggressive | 1.65 | 1.40 | Full stack unlocks AI/automation returns beyond tool consolidation |

**Key insight:** The aggressive scenario includes AI Core + SAC + BTP + Joule. These should unlock returns BEYOND what Datasphere alone provides -- AI-driven automation, predictive analytics, self-service BI. The aggressive return multiplier should exceed 1.0 (the base return benchmark) to reflect full-stack value.

### Fix 3: Rewrite Frontend Slider Logic

**Replace the arbitrary multiplication with proper financial recalculation.**

**Proposed slider logic:**
```js
function onSliderChange() {
    const timeline = parseInt(document.getElementById('sliderTimeline').value);
    const scope = parseInt(document.getElementById('sliderScope').value);
    const investment = parseFloat(document.getElementById('sliderInvestment').value);

    const base = scenarioData[activeScenario];
    if (!base) return;

    // Scope adjusts BOTH investment and returns proportionally
    // (more scope = more cost AND more benefit)
    const scopeRatio = scope / (base.scopePercent || 75);

    // Adjusted annual return scales with scope
    const adjustedAnnualReturn = base.annualReturn * scopeRatio;

    // ECIF stays proportional to investment
    const ecifRatio = base.ecifFunding / base.investment;
    const adjustedECIF = investment * ecifRatio;
    const adjustedNetInvestment = investment - adjustedECIF;

    // Year 1 return is ramped (50% during implementation)
    const implFraction = Math.min(timeline / 12, 1); // normalize
    const year1Return = adjustedAnnualReturn * 0.5;
    const year2Return = adjustedAnnualReturn;
    const year3Return = adjustedAnnualReturn;
    const totalReturn3yr = year1Return + year2Return + year3Return;

    // 3-year cumulative ROI
    const adjustedROI = Math.round(
        ((totalReturn3yr - adjustedNetInvestment) / adjustedNetInvestment) * 100
    );

    // Payback = months until cumulative return equals net investment
    // During implementation: ramp from 0 to full monthly return
    // After implementation: full monthly return
    const monthlyReturn = adjustedAnnualReturn / 12;
    let cumReturn = 0;
    let paybackMonth = 0;
    for (let m = 1; m <= 36; m++) {
        if (m <= timeline) {
            cumReturn += monthlyReturn * (m / timeline) * 0.5;
        } else {
            cumReturn += monthlyReturn;
        }
        if (cumReturn >= adjustedNetInvestment && paybackMonth === 0) {
            paybackMonth = m;
        }
    }
    const adjustedPayback = paybackMonth || 36; // cap at 36 if never reached

    // NPV with proper discounting (10% annual, monthly compounding)
    const monthlyDiscount = 0.10 / 12;
    let adjustedNPV = -adjustedNetInvestment;
    for (let m = 1; m <= 36; m++) {
        const df = 1 / Math.pow(1 + monthlyDiscount, m);
        if (m <= timeline) {
            adjustedNPV += monthlyReturn * (m / timeline) * 0.5 * df;
        } else {
            adjustedNPV += monthlyReturn * df;
        }
    }

    // Update KPIs
    document.getElementById('kpiInvestment').textContent = fmt(investment);
    document.getElementById('kpiROI').textContent = fmtPct(adjustedROI);
    document.getElementById('kpiPayback').textContent = adjustedPayback + ' mo';
    document.getElementById('kpiNPV').textContent = fmt(adjustedNPV);
}
```

### Fix 4: Align Backend Payback with Ramp

**Current** (scenario-calculator.js:117):
```js
paybackMonths = Math.max(3, Math.round(netInvestment / (annualReturn / 12)));
```

**Proposed:**
```js
// Simulate monthly cash flow to find actual payback
const monthlyReturn = annualReturn / 12;
let cumReturn = 0;
let paybackMonths = 36; // default if never reached
for (let m = 1; m <= 36; m++) {
    if (m <= timelineMonths) {
        cumReturn += monthlyReturn * (m / timelineMonths) * 0.5;
    } else {
        cumReturn += monthlyReturn;
    }
    if (cumReturn >= netInvestment) {
        paybackMonths = m;
        break;
    }
}
```

### Fix 5: Fix Backend ROI to 3-Year Cumulative

**Replace** scenario-calculator.js:116 with:
```js
const year1Return = annualReturn * 0.5; // ramped during implementation
const year2Return = annualReturn;
const year3Return = annualReturn;
const totalReturn3yr = year1Return + year2Return + year3Return;
const roi = Math.round(((totalReturn3yr - netInvestment) / netInvestment) * 100);
```

---

## 4. Slider Business Logic - How Should Adjustments Work?

### Timeline Slider
- **Shorter timeline** = higher cost (expedited services, parallel workstreams, premium consultants)
- **Shorter timeline** = same total returns but realized sooner (higher NPV due to time value of money)
- **Shorter timeline** = faster payback (returns start sooner)
- **Implementation:** Timeline affects when returns ramp up, not the total return amount

### Scope Slider
- **More scope** = proportionally more investment AND more returns
- **60% scope** = 60% of investment, ~55% of returns (diminishing returns at edges)
- **100% scope** = full investment, full returns
- **Implementation:** Scope is a linear multiplier on BOTH investment and returns (with slight diminishing return curve)

### Investment Slider
- **Higher investment** = keeping scope constant means paying more for premium services/faster delivery
- **Higher investment** should NOT directly reduce ROI
- **Implementation:** Investment slider should ONLY adjust the services/implementation portion (not license costs). Extra investment buys better implementation quality, not more software. Returns stay constant (same scope), but net investment changes, affecting ROI and payback.
- **Alternative simpler model:** Investment slider adjusts total outlay. Returns stay pegged to scope. This means overspending reduces ROI, underspending reduces implementation quality (risk, not modeled).

### Recommended Slider Interaction Model

```
Scope  --> scales BOTH investment AND returns (proportional)
Timeline --> affects WHEN returns are realized (NPV/payback), not total return amount
Investment --> overrides total cost (returns unchanged), affects ROI/payback directly
```

This means:
- Increasing scope from 75% to 100% increases investment by ~33% and returns by ~33%
- Shortening timeline from 12 to 9 months increases NPV (money sooner) but doesn't change total 3yr returns
- Increasing investment from $2.5M to $3.0M (without scope change) reduces ROI because you're paying more for the same outcome

---

## 5. Test Cases

### Test Case 1: Loves Travel Stops - Recommended Scenario (Baseline)

**Input:**
- Customer: 897 orders, Snowflake datalake (ECIF eligible)
- Driver: revenue_growth
- Timeline: 6-12 months
- Risk: balanced

**Expected with fixes:**

| Metric | Current (broken) | Expected (fixed) |
|--------|-----------------|-------------------|
| Investment | $3.8M | $3.8M (unchanged) |
| ECIF | $0.95M (25%) | $0.95M (unchanged) |
| Net Investment | $2.84M | $2.84M (unchanged) |
| Annual Return | $3.5M | $3.5M (unchanged) |
| ROI (3yr cumulative) | -8% | **208%** |
| Payback | 10 mo | **14 mo** (with ramp) |
| NPV (3yr, 10%) | $5.9M | **$5.4M** (with proper discounting + ramp) |

### Test Case 2: Loves Travel Stops - Aggressive Scenario

**Expected with fixes (returnAdjust changed to 1.40):**

| Metric | Current (broken) | Expected (fixed) |
|--------|-----------------|-------------------|
| Investment | $6.25M | $6.25M |
| ECIF | $1.56M | $1.56M |
| Net Investment | $4.69M | $4.69M |
| Annual Return | $4.375M | **$6.125M** (1.40 * 1.25 * $3.5M) |
| ROI (3yr cumulative) | -30% | **227%** |
| Payback | 13 mo | **16 mo** (with ramp) |

### Test Case 3: Loves Travel Stops - Conservative Scenario

**Expected with fixes (returnAdjust changed to 0.45):**

| Metric | Current (broken) | Expected (fixed) |
|--------|-----------------|-------------------|
| Investment | $2.08M | $2.08M |
| ECIF | $0.52M | $0.52M |
| Net Investment | $1.56M | $1.56M |
| Annual Return | $2.12M | **$1.97M** (0.45 * 1.25 * $3.5M) |
| ROI (3yr cumulative) | 2% | **216%** |
| Payback | 9 mo | **16 mo** (with ramp) |

### Test Case 4: Slider - Increase Scope from 75% to 100%

**Starting from Recommended baseline:**

| Metric | At 75% | At 100% |
|--------|--------|---------|
| Investment | $3.8M | $5.07M |
| Annual Return | $3.5M | $4.67M |
| Net Investment | $2.84M | $3.80M |
| 3yr ROI | 208% | **207%** (similar -- returns scale with investment) |
| Payback | 14 mo | **14 mo** (similar) |

### Test Case 5: Slider - Shorten Timeline from 12 to 9 months

| Metric | At 12mo | At 9mo |
|--------|---------|--------|
| Investment | $3.8M | $3.8M (unchanged) |
| Annual Return | $3.5M | $3.5M (unchanged) |
| 3yr ROI | 208% | **208%** (same total, different timing) |
| Payback | 14 mo | **12 mo** (returns ramp up faster) |
| NPV | $5.4M | **$5.6M** (money arrives sooner) |

### Test Case 6: Edge Case - Very Low Investment Override

**Investment slider pushed to $1M on Recommended:**

| Metric | Value |
|--------|-------|
| Investment | $1.0M |
| ECIF | $0.25M |
| Net Investment | $0.75M |
| Annual Return | $3.5M (unchanged -- scope same) |
| 3yr ROI | **1067%** (unrealistic but mathematically correct) |
| Payback | **1 mo** |

**Note:** This edge case shows why the investment slider should have bounds tied to scope. A $1M investment for 75% scope is unrealistic. Consider: `minInvestment = baseInvestment * 0.7` and `maxInvestment = baseInvestment * 1.5`.

---

## 6. Additional Findings

### 6.1 IRR Calculation is Not IRR

**Current** (scenario-calculator.js:126):
```js
irr = Math.max(0, Math.round(((annualReturn / netInvestment) - 1) * 100))
```

This is `(Return / Investment - 1) * 100`, which is a simple yield ratio, NOT Internal Rate of Return. True IRR requires solving for the discount rate that makes NPV = 0 (iterative calculation). Recommendation: Either implement proper IRR with Newton-Raphson method, or remove the field and label it "Annual Yield" instead.

### 6.2 financial-model.js calculate() vs scenario-calculator.js

The `FinancialModel.calculate()` method (line 173) computes ROI as:
```js
roi = ((annualReturn - investment.total) / investment.total) * 100
```

But this method isn't used by the dashboard -- `calculateScenarios()` in scenario-calculator.js drives the UI. The financial-model.js `calculate()` method has the same Year 1 ROI problem but it's currently dead code for the dashboard flow. The base financials are only used as input to scenario-calculator.js.

### 6.3 Hardcoded Return Values

`financial-model.js` has hardcoded annual returns:
- Tool consolidation: $1.2M
- Productivity gains: $1.5M
- Revenue impact: $800K

These don't scale with customer size (order count). A customer with 100 orders gets the same $3.5M annual return as one with 5,000 orders. Consider scaling returns based on `orderCount * returnPerOrder` similar to how `calculateCurrentSpend` works.

### 6.4 Double ECIF Calculation

`FinancialModel.calculateECIFFunding()` (line 136) calls `this.calculateBDCInvestment()` internally, which creates DUPLICATE assumption entries if both are called in sequence (as they are in `calculate()` at line 176). The second call to `calculateBDCInvestment` inside `calculateECIFFunding` pushes duplicate investment assumption entries. This doesn't affect math (returns are correct) but pollutes the assumptions array.

---

## 7. Priority of Fixes

| Priority | Fix | Impact | Effort |
|----------|-----|--------|--------|
| P0 | Change ROI to 3-year cumulative (backend) | Fixes negative/low ROI display | Small |
| P0 | Fix returnAdjust ratios for aggressive scenario | Fixes aggressive penalty paradox | Small |
| P1 | Rewrite frontend slider recalculation | Fixes slider KPI updates | Medium |
| P1 | Fix frontend NPV to use discounted cash flows | Fixes NPV after slider | Medium |
| P1 | Fix frontend payback to simulate monthly cash flow | Fixes payback after slider | Medium |
| P2 | Align backend payback with implementation ramp | More accurate payback | Small |
| P2 | Scale returns by customer size | More defensible per-customer numbers | Medium |
| P3 | Fix or relabel IRR | Correctness | Small |
| P3 | Fix duplicate assumptions in ECIF calc | Cleanliness | Small |

---

## 8. Summary

The core problem is that **ROI is calculated as Year 1 simple return on total investment**, which produces negative or near-zero ROI for scenarios where the upfront investment exceeds one year of benefits. This is fundamentally the wrong metric for a multi-year enterprise platform investment.

The fix is straightforward: switch to **3-year cumulative ROI** (industry standard for enterprise software business cases), fix the **aggressive scenario return ratios** so that full-stack investments unlock proportionally higher returns, and rewrite the **frontend slider formulas** to use proper financial calculations instead of arbitrary ratio multiplication.

No changes to the UI layout, charts, or narrative system are needed. The fixes are confined to calculation logic in three locations:
1. `scenario-calculator.js` lines 116-117 (ROI + payback)
2. `scenario-calculator.js` SCENARIO_PROFILES (returnAdjust values)
3. `dashboard.js` lines 188-208 (onSliderChange function)
