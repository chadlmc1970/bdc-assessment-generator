# AI Agent Demo UI - Design Specification

**Date:** 2026-04-05
**Type:** Wizard of Oz Demo (Scripted Content, Production Polish)
**Timeline:** This week (urgent for SAP leadership demo)
**Emphasis:** Interactive, visually pleasing, VERY functional

---

## Executive Summary

Build a production-quality Wizard of Oz AI agent demo that shows how an agentic AI system would interact with an Account Executive to generate BDC assessments. All content is pre-scripted, but the UX must feel like a real AI agent with smooth animations, proper state management, and robust interaction handling.

**Key Requirements:**
- 4-phase workflow: Discovery → Briefing → Generation → Results
- Smooth timing-based animations (no jank)
- Robust state machine (proper phase transitions)
- Functional refinement loop (regenerates assessment)
- Mobile-responsive layout
- Zero console errors

---

## User Flow

```
1. Customer Search (existing wizard.html)
   ↓
2. Select "Love's Travel Stops"
   ↓
3. Click "Generate AI Assessment" button
   ↓
4. Navigate to /agent-demo.html?customer=190852
   ↓
5. PHASE 0: Discovery (15s auto-advance)
   - Animated data extraction from SAP systems
   - Progressive step reveals with icons
   ↓
6. PHASE 1: Briefing (AE approval gate)
   - Show key facts, strategic context, recommendation
   - [Generate Assessment] or [Adjust Assumptions]
   ↓
7. PHASE 2: Generation (90s auto-advance)
   - Progress bar animation (0→100%)
   - 15 reasoning steps appear sequentially
   - Collapsible reasoning section
   ↓
8. PHASE 3: Results (interactive)
   - PDF download buttons (real files)
   - 3 scenario cards with financial data
   - Refinement input → loops to Phase 2 (30s) → back to Phase 3
```

---

## Architecture

### State Machine

```javascript
// agent-demo.js manages phases with clean state transitions
const APP_STATE = {
  phase: 0,                    // 0=discovery, 1=briefing, 2=generation, 3=results
  discoveryTimer: null,
  generationTimer: null,
  progressInterval: null,
  reasoningTimeout: [],
  isRefining: false
};

function advancePhase(nextPhase) {
  // Clear all timers
  clearPhase();

  // Hide current phase
  document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));

  // Show next phase
  document.getElementById(`phase${nextPhase}`).classList.add('active');
  APP_STATE.phase = nextPhase;

  // Initialize next phase
  initPhase(nextPhase);
}
```

### Component Hierarchy

```
agent-demo.html
├── Top Bar (customer badge)
├── Phase 0: Discovery
│   └── .discovery-steps (6 animated steps)
├── Phase 1: Briefing
│   ├── .message (analysis card)
│   └── .button-group
├── Phase 2: Generation
│   ├── .progress-card
│   │   ├── .progress-bar-container
│   │   └── .reasoning (collapsible)
├── Phase 3: Results
│   ├── .success-banner
│   ├── .pdf-card (×2)
│   ├── .scenarios (3 cards)
│   └── .refinement-input
```

### File Structure

```
srv/
├── public/
│   ├── agent-demo.html          (main UI, 4 phases)
│   ├── css/
│   │   └── agent-demo.css       (agent-specific styles)
│   ├── js/
│   │   └── agent-demo.js        (state machine, animations, interactions)
│   ├── downloads/
│   │   ├── loves-executive-summary.pdf
│   │   └── loves-financial-appendix.pdf
│   └── wizard.html              (add entry button)
├── demo-data.js                 (scripted content - Node.js module)
└── server.js                    (add /downloads route)
```

---

## Phase Specifications

### Phase 0: Discovery (15 seconds)

**Purpose:** Show agent extracting data from SAP systems before analysis.

**Timing Sequence:**
```javascript
const discoverySteps = [
  { time: 0,     icon: '🔄', text: 'Connecting to SAP ECC...', state: 'loading' },
  { time: 3000,  icon: '✅', text: 'Found 897 active orders', state: 'complete' },
  { time: 6000,  icon: '🔄', text: 'Analyzing entitlement data...', state: 'loading' },
  { time: 9000,  icon: '✅', text: 'BW 7.5 on-premises detected', state: 'complete' },
  { time: 11000, icon: '🔄', text: 'Checking cloud infrastructure...', state: 'loading' },
  { time: 13000, icon: '✅', text: 'Azure + Snowflake confirmed', state: 'complete' },
  { time: 15000, icon: '✅', text: 'ECIF eligibility confirmed (25%)', state: 'complete' }
];
```

**Visual Treatment:**
- Each step fades in at its timestamp
- Loading steps show spinner icon (animated rotation)
- Complete steps show checkmark with subtle scale animation
- Last step triggers auto-advance to Phase 1 after 500ms

**Error Handling:**
- If user clicks away during discovery, clear all timers on unmount
- Store timer IDs for cleanup

---

### Phase 1: Briefing (User-Controlled)

**Purpose:** Present agent's analysis and get AE approval before generation.

**Content (from demo-data.js):**
```javascript
const briefing = {
  label: 'Analysis Complete',
  facts: [
    '897 active SAP orders across retail and logistics operations',
    'Currently using Snowflake data lake (excellent ECIF co-sell opportunity)',
    'Estimated $7.6M annual SAP spend based on order volume',
    'Strong BW/BEx usage indicating mature analytics capability'
  ],
  context: 'Love\'s is a prime candidate for SAP Datasphere + AI Core modernization...',
  approach: '3-phase rollout over 12 months with focus on operational cost reduction.'
};
```

**Interactions:**
1. **"Generate Assessment" button** → `advancePhase(2)` (start generation)
2. **"Adjust Assumptions" button** → Show alert: "This feature links to the interview flow. For demo, proceeding with agent recommendations." → `advancePhase(2)`

**Visual Treatment:**
- Fade in entire card over 300ms
- Hover states on buttons (transform: translateY(-1px))
- Avatar gradient animation (subtle rotation)

---

### Phase 2: Generation (90 seconds)

**Purpose:** Show agent building assessment with visible reasoning.

**Progress Animation:**
```javascript
// Smooth progress bar from 0→100% over 90 seconds
let progress = 0;
const progressInterval = setInterval(() => {
  progress += (100 / 90) * 0.1; // update every 100ms
  if (progress >= 100) {
    progress = 100;
    clearInterval(progressInterval);
    setTimeout(() => advancePhase(3), 500);
  }
  updateProgress(progress);
}, 100);
```

**Reasoning Steps (15 steps from demo-data.js):**
```javascript
const reasoningSteps = [
  { time: 0,     icon: '🔄', text: 'Analyzing customer profile...', detail: 'Order volume, spend patterns, system landscape' },
  { time: 5000,  icon: '✅', text: 'Customer profile complete', detail: '897 orders detected, $7.6M annual spend estimated' },
  { time: 8000,  icon: '🔄', text: 'Checking ECIF eligibility...', detail: 'Snowflake data lake detected' },
  { time: 12000, icon: '✅', text: 'ECIF eligible!', detail: 'Snowflake detected → 25% co-funding available ($950K)' },
  { time: 15000, icon: '🔄', text: 'Calculating 3 scenarios...', detail: 'Conservative, Recommended, Aggressive models' },
  { time: 20000, icon: '✅', text: 'Financial models complete', detail: '3-year cumulative ROI, NPV, payback calculated' },
  { time: 25000, icon: '🔄', text: 'Generating Section 1: Executive Summary', detail: 'Strategic overview and opportunity sizing' },
  { time: 35000, icon: '✅', text: 'Section 1 complete', detail: 'Executive Summary (2 pages)' },
  { time: 38000, icon: '🔄', text: 'Generating Section 2: Current State', detail: 'System landscape and pain points' },
  { time: 48000, icon: '✅', text: 'Section 2 complete', detail: 'Current State Analysis (2 pages)' },
  { time: 50000, icon: '🔄', text: 'Generating Section 3: Industry Context', detail: 'Retail/logistics benchmarking' },
  { time: 58000, icon: '✅', text: 'Section 3 complete', detail: 'Industry Analysis (1 page)' },
  { time: 60000, icon: '🔄', text: 'Generating Section 4-8', detail: 'Future state, scenarios, risks, roadmap' },
  { time: 85000, icon: '✅', text: 'Sections 4-8 complete', detail: 'Recommendations and financial models (16 pages)' },
  { time: 90000, icon: '✅', text: 'Assessment complete!', detail: 'Ready for review' }
];
```

**Collapsible Reasoning:**
```javascript
// Toggle reasoning visibility
function toggleReasoning() {
  const steps = document.querySelector('.reasoning-steps');
  const toggle = document.querySelector('.reasoning-toggle');
  const isHidden = steps.classList.toggle('hidden');
  toggle.textContent = isHidden ? 'Show' : 'Hide';
}
```

**Visual Treatment:**
- Progress bar uses gradient fill with smooth animation
- Each reasoning step slides in from left (transform: translateX(-10px) → 0)
- Loading steps show rotating spinner
- Percent updates with tabular-nums font for no layout shift
- Auto-advance to Phase 3 when progress hits 100%

**Performance:**
- Use `requestAnimationFrame` for progress bar updates if 100ms is too frequent
- Batch DOM updates for reasoning steps

---

### Phase 3: Results (Interactive)

**Purpose:** Present completed assessment with PDFs and allow refinement.

**Content:**

**PDF Cards (2):**
```javascript
const pdfs = [
  {
    title: 'Executive Summary',
    subtitle: '11 pages',
    preview: 'Love\'s Travel Stops has a compelling opportunity to modernize...',
    filename: 'loves-executive-summary.pdf'
  },
  {
    title: 'Financial Appendix',
    subtitle: '10 pages • 3 scenarios',
    scenarios: [...],
    filename: 'loves-financial-appendix.pdf'
  }
];
```

**Scenario Cards (from FINANCIAL-AUDIT.md):**
```javascript
const scenarios = [
  { type: 'conservative', investment: 2.08, roi: 215, payback: 23 },
  { type: 'recommended', investment: 3.79, roi: 227, payback: 18, highlighted: true },
  { type: 'aggressive', investment: 6.25, roi: 227, payback: 16 }
];
```

**Interactions:**

1. **PDF Download Buttons:**
```javascript
function downloadPDF(filename) {
  window.location.href = `/downloads/${filename}`;
}
```

2. **Refinement Flow:**
```javascript
function handleRefine() {
  const input = document.getElementById('refinementInput').value;
  if (!input.trim()) {
    alert('Please enter refinement instructions');
    return;
  }

  APP_STATE.isRefining = true;

  // Show toast notification
  showToast(`Refining assessment: "${input}"`);

  // Go back to Phase 2 with shorter generation (30s)
  advancePhase(2);

  // Run abbreviated generation sequence
  setTimeout(() => {
    if (APP_STATE.isRefining) {
      APP_STATE.isRefining = false;
      advancePhase(3);
      showToast('Refinement complete');
    }
  }, 30000);
}
```

**Visual Treatment:**
- Success banner slides down from top
- PDF cards have hover lift effect (box-shadow: 0 8px 24px)
- Recommended scenario has blue border + background tint
- Refinement input has focus state with blue border
- Toast notifications for refinement feedback

**Accessibility:**
- PDF buttons have proper ARIA labels
- Scenario cards use semantic HTML (role="article")
- Refinement form has label association

---

## Technical Implementation

### CSS Architecture

**Use existing design system from app.css:**
- CSS custom properties: `--blue`, `--surface`, `--radius-lg`, etc.
- Match existing button styles (`.btn-primary`, `.btn-secondary`)
- Inherit font stack (SF Pro Display)

**agent-demo.css additions:**
```css
/* Discovery phase animations */
.discovery-step {
  opacity: 0;
  transform: translateY(10px);
  animation: slideUp 0.3s ease forwards;
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Progress bar gradient */
.progress-bar-fill {
  background: linear-gradient(90deg, var(--blue) 0%, #5E7FFF 100%);
  transition: width 0.1s linear;
}

/* Reasoning step reveal */
.reasoning-step {
  opacity: 0;
  transform: translateX(-10px);
  animation: slideIn 0.3s ease forwards;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* PDF card hover */
.pdf-card {
  transition: all var(--transition-normal);
}

.pdf-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Spinner animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon-loading {
  animation: spin 1s linear infinite;
}
```

### JavaScript Architecture

**State Management:**
```javascript
// Centralized state
const APP_STATE = {
  phase: 0,
  timers: {
    discovery: [],
    generation: [],
    refinement: null
  },
  data: null // loaded from demo-data.js or inline
};

// Phase lifecycle
function initPhase(phase) {
  switch(phase) {
    case 0: startDiscovery(); break;
    case 1: renderBriefing(); break;
    case 2: startGeneration(); break;
    case 3: renderResults(); break;
  }
}

function clearPhase() {
  // Clear all timers
  Object.values(APP_STATE.timers).flat().forEach(t => clearTimeout(t));
  APP_STATE.timers = { discovery: [], generation: [], refinement: null };
}

// Cleanup on page unload
window.addEventListener('beforeunload', clearPhase);
```

**Animation Helpers:**
```javascript
function animateProgress(from, to, duration, callback) {
  const start = performance.now();
  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = from + (to - from) * progress;
    callback(value);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function revealStep(element, delay) {
  const timer = setTimeout(() => {
    element.classList.add('visible');
  }, delay);
  APP_STATE.timers.discovery.push(timer);
}
```

**Error Boundaries:**
```javascript
window.addEventListener('error', (e) => {
  console.error('Demo error:', e);
  // Fallback: show all phases as cards (no automation)
  document.querySelectorAll('.phase').forEach(p => p.style.display = 'block');
});
```

---

## Data Structure

**demo-data.js (ES module):**
```javascript
export const demoData = {
  customer: {
    name: 'Love\'s Travel Stops',
    id: '190852',
    orders: 897,
    spend: 7600000,
    systems: ['BW 7.5', 'Azure', 'Snowflake']
  },

  discovery: [
    { time: 0, icon: '🔄', text: 'Connecting to SAP ECC...', state: 'loading' },
    // ... 6 more steps
  ],

  briefing: {
    label: 'Analysis Complete',
    facts: [...],
    context: '...',
    approach: '...'
  },

  reasoning: [
    { time: 0, icon: '🔄', text: '...', detail: '...' },
    // ... 14 more steps
  ],

  scenarios: [
    { type: 'conservative', investment: 2.08, roi: 215, payback: 23 },
    { type: 'recommended', investment: 3.79, roi: 227, payback: 18, recommended: true },
    { type: 'aggressive', investment: 6.25, roi: 227, payback: 16 }
  ],

  pdfs: [
    { title: '...', subtitle: '...', preview: '...', filename: 'loves-executive-summary.pdf' },
    { title: '...', subtitle: '...', filename: 'loves-financial-appendix.pdf' }
  ]
};
```

**Alternative: Inline in agent-demo.html** (if demo-data.js causes module loading issues):
```html
<script>
  const DEMO_DATA = { /* same structure */ };
</script>
<script src="/js/agent-demo.js"></script>
```

---

## Integration Points

### 1. Entry Button in wizard.html

**Location:** After customer selection (Phase 2), before interview starts.

**Implementation:**
```html
<!-- In wizard.html, inside customerConfirm div -->
<div class="button-group" style="margin-top: 24px;">
  <button class="btn btn-primary" onclick="window.location.href='/agent-demo.html?customer=' + selectedCustomer.id">
    <span>🤖</span> Generate AI Assessment
  </button>
  <button class="btn btn-secondary" onclick="startInterview()">
    Manual Interview
  </button>
</div>
```

**Visual Treatment:**
- AI button is primary (blue, prominent)
- Manual interview becomes secondary option
- Side-by-side layout on desktop, stacked on mobile

### 2. PDF Downloads Route

**server.js addition:**
```javascript
// Add before catch-all route
app.use('/downloads', express.static(path.join(__dirname, 'public', 'downloads')));
```

**Copy PDFs to srv/public/downloads/:**
```bash
cp "/Users/I870089/Documents/Customer Infor/Loves/2026 Roster Card Assessement V1/Roster_Card_Executive_Summary.pdf" \
   srv/public/downloads/loves-executive-summary.pdf

cp "/Users/I870089/Documents/Customer Infor/Loves/2026 Roster Card Assessement V1/Financial_Appendix_Summary.pdf" \
   srv/public/downloads/loves-financial-appendix.pdf
```

---

## Responsive Design

### Breakpoints

```css
/* Desktop (default) */
.scenarios {
  grid-template-columns: repeat(3, 1fr);
}

/* Tablet (768px and below) */
@media (max-width: 768px) {
  .scenarios {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .pdf-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Mobile (480px and below) */
@media (max-width: 480px) {
  .container {
    padding: 24px 16px;
  }

  .top-bar {
    flex-direction: column;
    gap: 12px;
  }
}
```

---

## Testing Checklist

**Phase Transitions:**
- [ ] Discovery auto-advances to Briefing after 15s
- [ ] Briefing buttons both advance to Generation
- [ ] Generation auto-advances to Results after 90s
- [ ] Refinement loops back to Generation for 30s

**Animations:**
- [ ] Progress bar animates smoothly (no jank)
- [ ] Discovery steps fade in at correct times
- [ ] Reasoning steps appear sequentially
- [ ] All hover states work (buttons, cards)

**Interactions:**
- [ ] PDF downloads trigger correctly
- [ ] Refinement input validates (not empty)
- [ ] Refinement button shows generation for 30s
- [ ] Collapsible reasoning toggles visibility

**Data Accuracy:**
- [ ] All scenario numbers match FINANCIAL-AUDIT.md
- [ ] Love's facts correct (897 orders, $7.6M, Snowflake)
- [ ] PDF filenames correct

**Responsive:**
- [ ] Layout works on mobile (< 480px)
- [ ] Layout works on tablet (768px)
- [ ] No horizontal scroll on any device

**Error Handling:**
- [ ] No console errors
- [ ] Timers clear on navigation away
- [ ] Works with browser back button

**Performance:**
- [ ] Page loads in < 2s
- [ ] Animations run at 60fps
- [ ] No memory leaks from timers

---

## Known Constraints

**Wizard of Oz Limitations:**
- Only works for Love's Travel Stops (customer ID 190852)
- All content is pre-scripted (no real LLM calls)
- Refinement doesn't actually change output (regenerates same content)
- Discovery doesn't query real SAP systems

**Deferred to Post-Demo:**
- Real Claude API integration
- Dynamic PDF generation
- Actual refinement logic (prompt engineering)
- Multi-customer support
- Integration with existing dashboard (slider transition)

---

## Success Criteria

**Demo Quality:**
- Feels like a real AI agent (believable timing, smooth animations)
- Zero visible bugs during 5-minute demo
- Impresses SAP leadership with polish and intelligence
- **Tighter visual design** than mockup (better spacing, hierarchy, polish)

**Technical Quality:**
- Clean, maintainable code
- No console errors
- Proper state management (no race conditions)
- Responsive on all devices

**Functional Requirements:**
- All 4 phases work correctly
- PDFs download successfully
- Refinement loop functions
- Entry point from wizard works

**User Approval:**
- ✅ Flow and concept approved
- ✅ 4-phase structure confirmed
- ⚠️ Visual execution needs tightening (spacing, polish, refinement)

---

## Implementation Order

1. **File Structure** - Create agent-demo.html, agent-demo.css, agent-demo.js, demo-data.js
2. **Static Content** - Build all 4 phases as static HTML first (no animations)
3. **Styling** - Apply design system, match mockup pixel-perfect
4. **Phase Transitions** - Implement state machine and basic navigation
5. **Discovery Animation** - Add timed step reveals
6. **Generation Animation** - Add progress bar and reasoning steps
7. **Interactions** - PDF downloads, refinement loop
8. **Integration** - Add wizard button, server route, copy PDFs
9. **Testing** - Run through checklist, fix bugs
10. **Polish** - Smooth animations, hover states, responsive layout

---

## File Deliverables

1. `srv/public/agent-demo.html` (400-500 lines)
2. `srv/public/css/agent-demo.css` (300-400 lines)
3. `srv/public/js/agent-demo.js` (500-600 lines)
4. `srv/demo-data.js` (200-300 lines)
5. `srv/public/downloads/loves-executive-summary.pdf` (copied)
6. `srv/public/downloads/loves-financial-appendix.pdf` (copied)
7. `srv/public/wizard.html` (modified - add entry button)
8. `srv/server.js` (modified - add downloads route)

**Total:** 5 new files, 2 copied files, 2 modified files
