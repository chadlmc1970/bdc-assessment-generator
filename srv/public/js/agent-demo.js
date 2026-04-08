/**
 * Agent Demo - Enhanced with Real Backend Integration
 */

// ===== PHASE 0: Internal CRM Account List & Interview =====

// Agent Interview State
const agentState = {
    selectedAccount: null,
    currentStep: 0,
    answers: {
        businessDriver: null,
        timeline: null,
        cloudPreference: null,
        riskTolerance: null,
        dealContext: ''
    }
};

// Account list data
let allAccounts = [];
let filteredAccounts = [];

// Interview Questions Configuration (from wizard.js lines 19-72)
const agentQuestions = [
    {
        key: 'businessDriver',
        label: 'Business Driver',
        text: 'What is the primary business driver for this engagement?',
        type: 'choice',
        options: [
            { value: 'cost_reduction', title: 'Cost Reduction', desc: 'Consolidate, simplify, reduce TCO' },
            { value: 'revenue_growth', title: 'Revenue Growth', desc: 'New capabilities, faster insights, competitive edge' },
            { value: 'competitive_pressure', title: 'Competitive Pressure', desc: 'Market disruption, peer modernization' },
            { value: 'compliance', title: 'Compliance / Risk', desc: 'Regulatory requirements, data governance' }
        ]
    },
    {
        key: 'timeline',
        label: 'Timeline',
        text: 'What is the timeline urgency?',
        type: 'choice',
        options: [
            { value: 'this_quarter', title: 'This Quarter', desc: 'Immediate need, active decision cycle' },
            { value: '6_12_months', title: '6-12 Months', desc: 'Planning phase, budget cycle alignment' },
            { value: 'exploratory', title: 'Exploratory', desc: 'Early stage, building the business case' }
        ]
    },
    {
        key: 'cloudPreference',
        label: 'Cloud Strategy',
        text: 'What is the customer\\'s cloud preference?',
        type: 'choice',
        options: [
            { value: 'sap_only', title: 'SAP-Only', desc: 'BTP, Datasphere, full SAP stack' },
            { value: 'multi_cloud', title: 'Multi-Cloud', desc: 'SAP + Azure / AWS / GCP' },
            { value: 'cloud_agnostic', title: 'Cloud-Agnostic', desc: 'Best-of-breed, open architecture' }
        ]
    },
    {
        key: 'riskTolerance',
        label: 'Risk Appetite',
        text: 'What is the customer\\'s risk tolerance?',
        type: 'choice',
        options: [
            { value: 'conservative', title: 'Conservative', desc: 'Proven solutions, phased rollout, low risk' },
            { value: 'balanced', title: 'Balanced', desc: 'Mix of proven and innovative, moderate risk' },
            { value: 'aggressive', title: 'Aggressive', desc: 'Cutting edge, fast execution, higher investment' }
        ]
    },
    {
        key: 'dealContext',
        label: 'Deal Context',
        text: 'Any additional context about this opportunity?',
        type: 'textarea',
        placeholder: 'CFO priorities, competitive threats, existing vendor relationships, budget constraints, key stakeholders...'
    }
];

// Initialize Phase 0 - CRM Account List
function initializePhase0() {
    loadAccounts();

    const searchInput = document.getElementById('accountSearchInput');

    // Search input event
    searchInput.addEventListener('input', () => {
        filterAccountList(searchInput.value.trim());
    });

    // Focus search on load
    searchInput.focus();
}

// Load accounts from API
async function loadAccounts() {
    try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        allAccounts = data.customers || [];
        filteredAccounts = allAccounts;
        renderAccountTable();
        updateAccountCount();
    } catch (e) {
        console.error('Failed to load accounts:', e);
        document.getElementById('accountTableBody').innerHTML = `
            <tr><td colspan="5" style="text-align:center; color: var(--text-tertiary); padding: 40px;">
                Failed to load accounts. Please refresh the page.
            </td></tr>
        `;
    }
}

// Filter account list with fuzzy search (from wizard.js lines 169-178)
function filterAccountList(query) {
    if (!query || query.length < 2) {
        filteredAccounts = allAccounts;
    } else {
        const q = query.toLowerCase();
        filteredAccounts = allAccounts.filter(account => {
            const name = account.name.toLowerCase();
            const id = (account.id || '').toString().toLowerCase();
            const dataOwner = (account.dataOwner || '').toLowerCase();
            const aiOwner = (account.aiOwner || '').toLowerCase();

            // Exact match
            if (name.includes(q) || id.includes(q) || dataOwner.includes(q) || aiOwner.includes(q)) {
                return true;
            }

            // Fuzzy match on name
            let qi = 0;
            for (let i = 0; i < name.length && qi < q.length; i++) {
                if (name[i] === q[qi]) qi++;
            }
            return qi === q.length;
        });
    }

    renderAccountTable();
    updateAccountCount();
}

// Render account table rows
function renderAccountTable() {
    const tbody = document.getElementById('accountTableBody');

    if (filteredAccounts.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5" style="text-align:center; color: var(--text-tertiary); padding: 40px;">
                No accounts found. Try a different search term.
            </td></tr>
        `;
        return;
    }

    tbody.innerHTML = filteredAccounts.map(account => {
        const owner = account.dataOwner || account.aiOwner || 'Unassigned';

        // For initial list, show basic info without solutions (loaded on-demand)
        return `
            <tr class="account-row" onclick="showAccountDetail('${account.id}')">
                <td class="account-name-cell">
                    <div class="account-name">${account.name}</div>
                </td>
                <td class="account-id-cell">${account.id}</td>
                <td class="solutions-cell">
                    <span style="color: var(--text-tertiary); font-size: 13px;">Click to view</span>
                </td>
                <td class="owner-cell">${owner}</td>
                <td class="acv-cell">—</td>
            </tr>
        `;
    }).join('');
}

// Update account count
function updateAccountCount() {
    document.getElementById('accountCount').textContent = filteredAccounts.length;
}

// Show account detail panel
async function showAccountDetail(accountId) {
    try {
        // Fetch full details including PurchasedSolutions from dedicated endpoint
        const res = await fetch(`/api/customers/${encodeURIComponent(accountId)}`);
        if (!res.ok) throw new Error('Account not found');
        const fullAccount = await res.json();

        agentState.selectedAccount = fullAccount;

        // Populate detail panel
        document.getElementById('detailAccountName').textContent = fullAccount.name;
        document.getElementById('detailAccountId').textContent = `ID: ${fullAccount.id}`;

        // Solution Areas with contract details
        const solutions = fullAccount.solutions || [];

        if (solutions.length === 0) {
            document.getElementById('detailEntitlements').innerHTML = '<div style="color: var(--text-tertiary); font-size: 14px;">No active solutions</div>';
        } else {
            // Sort by activeACV descending
            const sortedSolutions = solutions.sort((a, b) => (parseFloat(b.activeACV) || 0) - (parseFloat(a.activeACV) || 0));

            document.getElementById('detailEntitlements').innerHTML = sortedSolutions.map(sol => {
                const statusClass = sol.contractStatus === 'Active' ? 'status-active'
                    : sol.contractStatus === 'Cancelled' ? 'status-cancelled'
                    : 'status-expired';

                const acv = parseFloat(sol.activeACV) || 0;
                const tcv = parseFloat(sol.tcv) || 0;

                const acvFormatted = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(acv);

                const tcvFormatted = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(tcv);

                const endDate = new Date(sol.contractEndDate);
                const today = new Date();
                const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                let renewalBadge = '';
                if (sol.contractStatus === 'Active') {
                    if (daysUntilExpiry < 90) {
                        renewalBadge = '<span class="renewal-badge renewal-urgent">Expires &lt;90 days</span>';
                    } else if (daysUntilExpiry < 180) {
                        renewalBadge = '<span class="renewal-badge renewal-warning">Expires &lt;180 days</span>';
                    }
                }

                return `
                    <div class="solution-detail-card">
                        <div class="solution-detail-header">
                            <div class="solution-area-name">${sol.solutionArea}</div>
                            <span class="status-badge ${statusClass}">${sol.contractStatus}</span>
                        </div>
                        <div class="solution-detail-grid">
                            <div class="solution-detail-item">
                                <div class="detail-label">ACV</div>
                                <div class="detail-value">${acvFormatted}</div>
                            </div>
                            <div class="solution-detail-item">
                                <div class="detail-label">TCV</div>
                                <div class="detail-value">${tcvFormatted}</div>
                            </div>
                            <div class="solution-detail-item">
                                <div class="detail-label">Contract End</div>
                                <div class="detail-value">${endDate.toLocaleDateString()}</div>
                            </div>
                            <div class="solution-detail-item">
                                <div class="detail-label">Support</div>
                                <div class="detail-value">${sol.supportLevel || 'N/A'}</div>
                            </div>
                            ${sol.channel !== 'SAP' ? `
                                <div class="solution-detail-item">
                                    <div class="detail-label">Channel</div>
                                    <div class="detail-value">${sol.channel}</div>
                                </div>
                            ` : ''}
                        </div>
                        ${renewalBadge ? `<div class="renewal-badge-container">${renewalBadge}</div>` : ''}
                    </div>
                `;
            }).join('');
        }

        // System details (existing BW/ERP metadata if available)
        const systemDetails = [];
        if (fullAccount.erpDeployment) systemDetails.push({ label: 'ERP Deployment', value: fullAccount.erpDeployment });
        if (fullAccount.existingBW) systemDetails.push({ label: 'BW System', value: fullAccount.existingBW });
        if (fullAccount.bwMoveTarget) systemDetails.push({ label: 'BW Target', value: fullAccount.bwMoveTarget });
        if (fullAccount.bpc) systemDetails.push({ label: 'BPC', value: fullAccount.bpc });

        if (systemDetails.length > 0) {
            document.getElementById('detailSystemGrid').innerHTML = systemDetails.map(item => `
                <div class="detail-grid-item">
                    <div class="detail-label">${item.label}</div>
                    <div class="detail-value">${item.value}</div>
                </div>
            `).join('');
        } else {
            document.getElementById('detailSystemGrid').innerHTML = '<div style="color: var(--text-tertiary); font-size: 14px;">No system metadata available</div>';
        }

        // Owners
        const owners = [];
        if (fullAccount.dataOwner) owners.push({ role: 'Data Owner', name: fullAccount.dataOwner });
        if (fullAccount.aiOwner) owners.push({ role: 'AI Owner', name: fullAccount.aiOwner });
        if (fullAccount.iae) owners.push({ role: 'IAE', name: fullAccount.iae });

        document.getElementById('detailOwners').innerHTML = owners.length > 0
            ? owners.map(o => `
                <div class="owner-item">
                    <div class="owner-role">${o.role}</div>
                    <div class="owner-name">${o.name}</div>
                </div>
            `).join('')
            : '<div style="color: var(--text-tertiary); font-size: 14px;">No assigned owners</div>';

        // Show panel
        document.getElementById('accountDetailPanel').style.display = 'flex';
    } catch (e) {
        console.error('Failed to load account details:', e);
        alert('Failed to load account details. Please try again.');
    }
}

// Close account detail panel
function closeAccountDetail() {
    document.getElementById('accountDetailPanel').style.display = 'none';
    agentState.selectedAccount = null;
}

// Back to account list from interview
function backToAccountList() {
    document.getElementById('agentInterviewPhase').style.display = 'none';
    document.getElementById('accountListView').style.display = 'block';
    document.getElementById('accountDetailPanel').style.display = 'flex';

    // Reset interview state
    agentState.currentStep = 0;
    agentState.answers = {
        businessDriver: null,
        timeline: null,
        cloudPreference: null,
        riskTolerance: null,
        dealContext: ''
    };
}

// Start assessment (transition from detail panel to interview)
function startAccountAssessment() {
    if (!agentState.selectedAccount) {
        alert('Please select an account first');
        return;
    }

    // Hide account list and detail panel
    document.getElementById('accountListView').style.display = 'none';
    document.getElementById('accountDetailPanel').style.display = 'none';

    // Show interview
    document.getElementById('agentInterviewPhase').style.display = 'block';
    document.getElementById('interviewAccountName').textContent = `${agentState.selectedAccount.name} - BDC Assessment`;

    agentState.currentStep = 0;
    renderAgentQuestion();
}

// Render current interview question
function renderAgentQuestion() {
    const q = agentQuestions[agentState.currentStep];
    const area = document.getElementById('agentQuestionArea');

    // Update progress
    const pct = ((agentState.currentStep + 1) / agentQuestions.length) * 100;
    document.getElementById('agentProgressFill').style.width = pct + '%';
    document.getElementById('agentStepLabel').textContent = q.label;
    document.getElementById('agentStepCount').textContent = `${agentState.currentStep + 1} of ${agentQuestions.length}`;

    // Back button visibility
    document.getElementById('agentBackBtn').style.visibility = agentState.currentStep === 0 ? 'hidden' : 'visible';

    // Build question HTML
    let html = '<div class="interview-question-area">';
    html += `<div class="interview-question-text">${q.text}</div>`;

    if (q.type === 'choice') {
        html += '<div class="interview-options">';
        q.options.forEach(opt => {
            const isSelected = agentState.answers[q.key] === opt.value;
            html += `
                <button class="interview-option ${isSelected ? 'selected' : ''}"
                        onclick="selectAgentOption('${q.key}', '${opt.value}')">
                    <div class="interview-option-radio"></div>
                    <div class="interview-option-content">
                        <div class="interview-option-title">${opt.title}</div>
                        <div class="interview-option-desc">${opt.desc}</div>
                    </div>
                </button>
            `;
        });
        html += '</div>';
    } else if (q.type === 'textarea') {
        html += `
            <div class="interview-textarea-wrap">
                <textarea class="interview-textarea" id="agentTextareaInput"
                          placeholder="${q.placeholder || ''}"
                          oninput="handleAgentTextarea()">${agentState.answers[q.key] || ''}</textarea>
            </div>
        `;
    }

    html += '</div>';
    area.innerHTML = html;

    // Update next button
    updateAgentNextButton();
}

// Select interview option (choice type)
function selectAgentOption(key, value) {
    agentState.answers[key] = value;
    renderAgentQuestion();
    // Auto-advance after short delay
    setTimeout(() => {
        if (agentState.currentStep < agentQuestions.length - 1) {
            agentGoNext();
        }
    }, 300);
}

// Handle textarea input
function handleAgentTextarea() {
    const ta = document.getElementById('agentTextareaInput');
    agentState.answers.dealContext = ta.value;
    updateAgentNextButton();
}

// Update next button state
function updateAgentNextButton() {
    const q = agentQuestions[agentState.currentStep];
    const nextBtn = document.getElementById('agentNextBtn');

    if (q.type === 'textarea') {
        // Textarea is optional, always enabled
        nextBtn.disabled = false;
        nextBtn.textContent = agentState.currentStep === agentQuestions.length - 1 ? 'Start AI Analysis' : 'Continue';
    } else {
        nextBtn.disabled = !agentState.answers[q.key];
        nextBtn.textContent = agentState.currentStep === agentQuestions.length - 1 ? 'Start AI Analysis' : 'Continue';
    }
}

// Navigate to next question
function agentGoNext() {
    if (agentState.currentStep < agentQuestions.length - 1) {
        agentState.currentStep++;
        renderAgentQuestion();
    } else {
        submitAgentInterview();
    }
}

// Navigate to previous question
function agentGoBack() {
    if (agentState.currentStep > 0) {
        agentState.currentStep--;
        renderAgentQuestion();
    }
}

// Submit interview and start AI agent analysis
function submitAgentInterview() {
    // Store customer and interview answers globally for agent phases
    window.selectedCustomer = agentState.selectedAccount;
    window.interviewAnswers = agentState.answers;

    // Transition to Phase 1 (Intelligence Discovery)
    goToPhase(1);
}

// ===== EXISTING AGENT DEMO CODE =====

let currentPhase = 0; // Changed from 1 to 0
let phaseTimers = [];
let intelligenceData = null;
let eventSource = null;

function goToPhase(phase) {
  // Hide all phases (0-4)
  for (let i = 0; i <= 4; i++) {
    const el = document.getElementById(`phase${i}`);
    if (el) el.style.display = 'none';
  }
  const target = document.getElementById(`phase${phase}`);
  if (target) {
    target.style.display = 'block';
    target.classList.add('agent-animate-fade-in-up');
  }
  currentPhase = phase;
  updateProgressDots();
  if (phase === 0) initializePhase0();
  if (phase === 1) startPhase1();
  if (phase === 2) startPhase2();
  if (phase === 3) startPhase3();
  if (phase === 4) startPhase4();
}

function updateProgressDots() {
  // Handle 5 phases (0-4)
  for (let i = 0; i <= 4; i++) {
    const dot = document.querySelector(`.progress-dot[data-phase="${i}"]`);
    if (dot) {
      dot.classList.remove('progress-dot-active', 'progress-dot-complete');
      if (i < currentPhase) dot.classList.add('progress-dot-complete');
      else if (i === currentPhase) dot.classList.add('progress-dot-active');
    }
  }

  // Update connectors (5 phases means 4 connectors)
  const connectors = document.querySelectorAll('.progress-connector');
  connectors.forEach((connector, index) => {
    if (index < currentPhase) {
      connector.classList.add('completed');
    } else {
      connector.classList.remove('completed');
    }
  });
}

async function startPhase1() {
  const customer = window.selectedCustomer?.name || 'loves'; // Fallback to 'loves' if none selected
  const interviewAnswers = window.interviewAnswers || {};

  const sources = [
    { id: 'crm', delay: 0 },
    { id: 'gartner', delay: 800 },
    { id: 'benchmarks', delay: 1600 },
    { id: 'cases', delay: 2400 }
  ];
  sources.forEach((s) => {
    phaseTimers.push(setTimeout(() => showSourceFetching(s), s.delay));
  });
  try {
    // Build URL with interview parameters
    let url = `/api/intelligence/analyze-customer?customer=${encodeURIComponent(customer)}`;

    if (interviewAnswers.businessDriver) {
      url += `&businessDriver=${encodeURIComponent(interviewAnswers.businessDriver)}`;
    }
    if (interviewAnswers.timeline) {
      url += `&timeline=${encodeURIComponent(interviewAnswers.timeline)}`;
    }
    if (interviewAnswers.cloudPreference) {
      url += `&cloudPreference=${encodeURIComponent(interviewAnswers.cloudPreference)}`;
    }
    if (interviewAnswers.riskTolerance) {
      url += `&riskTolerance=${encodeURIComponent(interviewAnswers.riskTolerance)}`;
    }
    if (interviewAnswers.dealContext) {
      url += `&dealContext=${encodeURIComponent(interviewAnswers.dealContext)}`;
    }

    const res = await fetch(url);
    intelligenceData = await res.json();
    sources.forEach((s) => {
      phaseTimers.push(setTimeout(() => markSourceComplete(s, intelligenceData.sources[s.id]), s.delay + 600));
    });
    phaseTimers.push(setTimeout(() => goToPhase(2), 4000));
  } catch (err) {
    console.error(err);
    alert('Failed to fetch intelligence data');
    goToPhase(0); // Return to interview on error
  }
}

function showSourceFetching(source) {
  const card = document.getElementById(`source-${source.id}`);
  if (card) {
    card.style.display = 'flex';
    card.classList.add('agent-animate-fade-in-up');
    const status = card.querySelector('.source-status');
    if (status) {
      status.textContent = 'Fetching...';
      status.style.color = '#ff9500';
    }
  }
}

function markSourceComplete(source, data) {
  const card = document.getElementById(`source-${source.id}`);
  if (!card) return;
  const status = card.querySelector('.source-status');
  const icon = card.querySelector('.source-icon');
  const detail = card.querySelector('.source-detail');
  if (status) {
    status.textContent = '✓ Complete';
    status.style.color = '#2fa82f';
  }
  if (icon) {
    icon.textContent = '✓';
    icon.style.background = 'rgba(47, 168, 47, 0.15)';
    icon.style.borderColor = '#2fa82f';
    icon.style.color = '#2fa82f';
  }
  if (detail && data) {
    if (source.id === 'crm') detail.textContent = `${data.data.orderVolume} orders/month, ${data.data.currentSystems.datalake} platform`;
    else if (source.id === 'gartner') detail.textContent = `Industry avg: ${(data.data.keyMetrics.averageOrderErrorRate * 100).toFixed(0)}% error rate`;
    else if (source.id === 'benchmarks') detail.textContent = `ECC→S4: ${data.data.eccToS4Timeline.average}mo avg`;
    else if (source.id === 'cases') detail.textContent = `${data.data.matchedCustomers} similar customers`;
  }
}

function startPhase2() {
  if (!intelligenceData) return;
  const analysis = intelligenceData.analysis;
  document.getElementById('briefing-challenge').textContent = `${intelligenceData.sources.crm.data.orderVolume} orders monthly, 23% error rate costing $${Math.round(analysis.financialImpact.annualizedCost).toLocaleString()}/year`;
  document.getElementById('briefing-solution').textContent = intelligenceData.recommendations.primaryRecommendation;
  document.getElementById('briefing-timeline').textContent = `6-month implementation, ${analysis.strategicFit.ecifEligibility} for co-funding`;
  animateElement('sources-referenced', 400);
  animateElement('reasoning-section', 800);
}

async function startPhase3() {
  const customer = window.selectedCustomer?.name || 'loves';
  const interviewAnswers = window.interviewAnswers || {};

  const agents = [
    { id: 'financial', name: 'Financial Model Agent', color: '#007aff' },
    { id: 'ecif', name: 'ECIF Calculator Agent', color: '#2fa82f' },
    { id: 'narrative', name: 'Narrative Generator Agent', color: '#5856d6' }
  ];
  agents.forEach((a, i) => {
    phaseTimers.push(setTimeout(() => showAgentStatus(a, 'initializing', 0), i * 300));
  });
  try {
    // Build SSE URL with customer and interview parameters
    let sseUrl = `/api/narrative/stream-assessment?customer=${encodeURIComponent(customer)}`;

    if (interviewAnswers.businessDriver) {
      sseUrl += `&businessDriver=${encodeURIComponent(interviewAnswers.businessDriver)}`;
    }
    if (interviewAnswers.timeline) {
      sseUrl += `&timeline=${encodeURIComponent(interviewAnswers.timeline)}`;
    }
    if (interviewAnswers.cloudPreference) {
      sseUrl += `&cloudPreference=${encodeURIComponent(interviewAnswers.cloudPreference)}`;
    }
    if (interviewAnswers.riskTolerance) {
      sseUrl += `&riskTolerance=${encodeURIComponent(interviewAnswers.riskTolerance)}`;
    }
    if (interviewAnswers.dealContext) {
      sseUrl += `&dealContext=${encodeURIComponent(interviewAnswers.dealContext)}`;
    }

    eventSource = new EventSource(sseUrl);
    eventSource.addEventListener('agent-start', (e) => {
      const data = JSON.parse(e.data);
      const agent = agents.find(a => a.name === data.agent);
      if (agent) showAgentStatus(agent, 'processing', 25);
    });
    eventSource.addEventListener('agent-progress', (e) => {
      const data = JSON.parse(e.data);
      const agent = agents.find(a => a.name === data.agent);
      if (agent) showAgentStatus(agent, 'processing', data.progress);
    });
    eventSource.addEventListener('agent-complete', (e) => {
      const data = JSON.parse(e.data);
      const agent = agents.find(a => a.name === data.agent);
      if (agent) showAgentStatus(agent, 'complete', 100);
    });
    eventSource.addEventListener('text', (e) => {
      const data = JSON.parse(e.data);
      const container = document.getElementById('narrative-stream');
      if (container) {
        container.textContent += data.text;
        container.scrollTop = container.scrollHeight;
      }
    });
    eventSource.addEventListener('all-complete', () => {
      eventSource.close();
      setTimeout(() => goToPhase(4), 1500);
    });
    eventSource.addEventListener('done', () => eventSource.close());
    eventSource.onerror = () => {
      eventSource.close();
      alert('Narrative streaming failed');
    };
  } catch (err) {
    console.error(err);
    alert('Failed to start narrative generation');
  }
}

function showAgentStatus(agent, status, progress) {
  const card = document.getElementById(`agent-${agent.id}`);
  if (!card) return;
  const statusEl = card.querySelector('.agent-status');
  const progressBar = card.querySelector('.agent-progress-fill');
  const icon = card.querySelector('.agent-icon');
  if (status === 'initializing' && statusEl) statusEl.textContent = 'Initializing...';
  else if (status === 'processing') {
    if (statusEl) statusEl.textContent = `Processing... ${progress}%`;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (icon) icon.classList.add('agent-pulse');
  } else if (status === 'complete') {
    if (statusEl) statusEl.textContent = '✓ Complete';
    if (progressBar) progressBar.style.width = '100%';
    if (icon) {
      icon.classList.remove('agent-pulse');
      icon.textContent = '✓';
      icon.style.background = '#2fa82f';
      icon.style.color = '#fff';
    }
  }
}

function startPhase4() {
  document.getElementById('ecif-amount').textContent = '$950,000';
  const scenarios = [
    { id: 'conservative', inv: '$1.20M', ret: '$2.08M', roi: '215%', pb: '23 mo' },
    { id: 'recommended', inv: '$1.67M', ret: '$3.79M', roi: '227%', pb: '18 mo' },
    { id: 'aggressive', inv: '$2.79M', ret: '$6.25M', roi: '227%', pb: '16 mo' }
  ];
  scenarios.forEach((s, i) => {
    phaseTimers.push(setTimeout(() => {
      const card = document.getElementById(`scenario-${s.id}`);
      if (card) {
        card.style.display = 'flex';
        card.classList.add('agent-animate-scale-in');
        card.querySelector('.scenario-investment').textContent = s.inv;
        card.querySelector('.scenario-return').textContent = s.ret;
        card.querySelector('.scenario-roi').textContent = s.roi;
        card.querySelector('.scenario-payback').textContent = s.pb;
      }
    }, i * 200));
  });
}

function animateElement(id, delay) {
  phaseTimers.push(setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'block';
      el.classList.add('agent-animate-fade-in-up');
    }
  }, delay));
}

function restartDemo() {
  phaseTimers.forEach(t => clearTimeout(t));
  phaseTimers = [];
  if (eventSource) eventSource.close();
  intelligenceData = null;
  currentPhase = 1;
  document.getElementById('narrative-stream').textContent = '';
  goToPhase(1);
}

document.addEventListener('DOMContentLoaded', () => goToPhase(0)); // Start at Phase 0 (Interview)
window.addEventListener('beforeunload', () => {
  phaseTimers.forEach(t => clearTimeout(t));
  if (eventSource) eventSource.close();
});
