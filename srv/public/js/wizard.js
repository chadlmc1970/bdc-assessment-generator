// ============================================================
// BDC Assessment Generator - Rebuilt from scratch
// ============================================================

console.log('=== WIZARD.JS LOADED ===');

// State
const state = {
    customer: null,
    currentStep: 0,
    answers: {
        businessDriver: null,
        timeline: null,
        cloudPreference: null,
        riskTolerance: null,
        dealContext: ''
    }
};

// Questions
const questions = [
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
        text: 'What is the customer\'s cloud preference?',
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
        text: 'What is the customer\'s risk tolerance?',
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

// Customer search variables
let allCustomers = [];
let searchSelectedIndex = -1;

// Load customers from API
async function loadCustomers() {
    console.log('Loading customers...');
    try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        allCustomers = data.customers || [];
        console.log('Loaded customers:', allCustomers.length);
    } catch (err) {
        console.error('Failed to load customers:', err);
        alert('Failed to load customers');
    }
}

// Render search results
function renderSearchResults(query) {
    console.log('renderSearchResults called, query:', query);

    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) {
        console.error('searchDropdown element not found');
        return;
    }

    if (!query || query.length < 1) {
        dropdown.classList.remove('show');
        return;
    }

    const q = query.toLowerCase();
    const matches = allCustomers.filter(c => c.name.toLowerCase().includes(q)).slice(0, 6);

    console.log('Matches found:', matches.length);

    if (matches.length === 0) {
        dropdown.classList.remove('show');
        return;
    }

    dropdown.innerHTML = matches.map((c, i) => `
        <div class="search-item" data-name="${c.name}" onclick="selectCustomer('${c.name.replace(/'/g, "\\'")}')">
            <div class="search-item-name">${c.name}</div>
            <div class="search-item-detail">${c.erpDeployment || 'No ERP'} &middot; ${c.existingBW || 'No BW'}</div>
        </div>
    `).join('');

    dropdown.classList.add('show');
}

// Select a customer
async function selectCustomer(name) {
    console.log('selectCustomer called:', name);

    const dropdown = document.getElementById('searchDropdown');
    const input = document.getElementById('searchInput');

    dropdown.classList.remove('show');
    input.value = name;

    try {
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(name)}`);
        const customer = await response.json();
        state.customer = customer;
        showCustomerConfirm(customer);
    } catch (err) {
        console.error('Failed to fetch customer:', err);
        alert('Failed to load customer');
    }
}

// Show customer confirmation card
function showCustomerConfirm(c) {
    const el = document.getElementById('customerConfirm');

    // Check if Love's (customer with reference documents)
    const isLoves = c.name && c.name.toLowerCase().includes('love');
    const docsHtml = isLoves ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
            <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px;">
                📄 Reference Documents
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <a href="/downloads/loves-executive-summary.pdf" target="_blank"
                   style="flex: 1; min-width: 200px; padding: 12px 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; text-decoration: none; color: var(--text-primary); font-size: 13px; display: flex; align-items: center; gap: 8px;">
                    <span>📊</span>
                    <span>Executive Summary</span>
                </a>
                <a href="/downloads/loves-financial-appendix.pdf" target="_blank"
                   style="flex: 1; min-width: 200px; padding: 12px 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; text-decoration: none; color: var(--text-primary); font-size: 13px; display: flex; align-items: center; gap: 8px;">
                    <span>💰</span>
                    <span>Financial Appendix</span>
                </a>
            </div>
        </div>
    ` : '';

    el.innerHTML = `
        <div class="card card-elevated customer-confirm-card">
            <div class="customer-confirm-header">
                <div>
                    <div class="customer-confirm-name">${c.name}</div>
                    <div class="customer-confirm-id">ID: ${c.id}</div>
                </div>
                <span class="badge badge-green">Matched</span>
            </div>
            <div class="customer-meta-grid">
                <div class="customer-meta-item">
                    <div class="customer-meta-label">ERP</div>
                    <div class="customer-meta-value">${c.erpDeployment || 'N/A'}</div>
                </div>
                <div class="customer-meta-item">
                    <div class="customer-meta-label">BW</div>
                    <div class="customer-meta-value">${c.existingBW || 'None'}</div>
                </div>
                <div class="customer-meta-item">
                    <div class="customer-meta-label">Data Lake</div>
                    <div class="customer-meta-value">${c.otherDatalake || 'None'}</div>
                </div>
                <div class="customer-meta-item">
                    <div class="customer-meta-label">Data Owner</div>
                    <div class="customer-meta-value">${c.dataOwner || 'N/A'}</div>
                </div>
            </div>
            ${docsHtml}
            <div class="customer-confirm-actions">
                <button class="btn btn-primary btn-full" onclick="startInterview()">
                    Start Assessment Interview
                </button>
            </div>
        </div>
    `;
    el.style.display = 'block';
}

// Reset search
function resetSearch() {
    state.customer = null;
    document.getElementById('customerConfirm').style.display = 'none';
    document.getElementById('searchInput').value = '';
}

// Start interview
function startInterview() {
    document.getElementById('searchPhase').style.display = 'none';
    document.getElementById('interviewPhase').style.display = 'block';
    state.currentStep = 0;
    renderQuestion();
}

// Render question
function renderQuestion() {
    const q = questions[state.currentStep];
    const area = document.getElementById('questionArea');

    const pct = ((state.currentStep + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('stepLabel').textContent = q.label;
    document.getElementById('stepCount').textContent = `${state.currentStep + 1} of ${questions.length}`;
    document.getElementById('backBtn').style.visibility = state.currentStep === 0 ? 'hidden' : 'visible';

    let html = '<div class="interview-question-area">';
    html += `<div class="interview-question-text">${q.text}</div>`;

    if (q.type === 'choice') {
        html += '<div class="interview-options">';
        q.options.forEach(opt => {
            const isSelected = state.answers[q.key] === opt.value;
            html += `
                <button class="interview-option ${isSelected ? 'selected' : ''}"
                        onclick="selectOption('${q.key}', '${opt.value}')">
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
                <textarea class="interview-textarea" id="textareaInput"
                          placeholder="${q.placeholder || ''}"
                          oninput="handleTextarea()">${state.answers[q.key] || ''}</textarea>
            </div>
        `;
    }

    html += '</div>';
    area.innerHTML = html;
    updateNextButton();
}

function selectOption(key, value) {
    state.answers[key] = value;
    renderQuestion();
    setTimeout(() => {
        if (state.currentStep < questions.length - 1) {
            goNext();
        }
    }, 300);
}

function handleTextarea() {
    const ta = document.getElementById('textareaInput');
    state.answers.dealContext = ta.value;
    updateNextButton();
}

function updateNextButton() {
    const q = questions[state.currentStep];
    const nextBtn = document.getElementById('nextBtn');

    if (q.type === 'textarea') {
        nextBtn.disabled = false;
        nextBtn.textContent = state.currentStep === questions.length - 1 ? 'Generate Scenarios' : 'Continue';
    } else {
        nextBtn.disabled = !state.answers[q.key];
        nextBtn.textContent = state.currentStep === questions.length - 1 ? 'Generate Scenarios' : 'Continue';
    }
}

function goNext() {
    if (state.currentStep < questions.length - 1) {
        state.currentStep++;
        renderQuestion();
    } else {
        submitInterview();
    }
}

function goBack() {
    if (state.currentStep > 0) {
        state.currentStep--;
        renderQuestion();
    }
}

async function submitInterview() {
    document.getElementById('interviewPhase').style.display = 'none';
    document.getElementById('generatingPhase').style.display = 'block';
    document.getElementById('genCustomerName').textContent = `Generating for ${state.customer.name}`;

    const mockData = {
        customer: state.customer,
        interviewAnswers: state.answers,
        recommended: {
            label: 'Recommended',
            investment: 1.8,
            annualReturn: 2.4,
            roi: 134,
            paybackMonths: 12,
            npv: 3.8,
            timeline: 12,
            scope: 'Datasphere + AI Core',
            description: 'Full BDC platform'
        }
    };

    setTimeout(() => {
        sessionStorage.setItem('scenarioData', JSON.stringify(mockData));
        window.location.href = '/dashboard.html';
    }, 2000);
}

function startAgentDemo() {
    if (!state.customer) {
        alert('Please select a customer first');
        return;
    }
    window.location.href = `/agent-demo.html?customer=${state.customer.id}`;
}

// ============================================================
// INITIALIZATION
// ============================================================

console.log('Starting initialization...');

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting...');
    document.addEventListener('DOMContentLoaded', init);
} else {
    console.log('DOM ready, initializing now');
    init();
}

function init() {
    console.log('=== INIT CALLED ===');

    // Load customers
    loadCustomers();

    // Get elements
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');

    console.log('searchInput:', searchInput);
    console.log('searchDropdown:', searchDropdown);

    if (!searchInput) {
        console.error('FATAL: searchInput not found');
        return;
    }

    if (!searchDropdown) {
        console.error('FATAL: searchDropdown not found');
        return;
    }

    // Attach input event
    console.log('Attaching input event listener...');
    searchInput.addEventListener('input', function(e) {
        console.log('INPUT EVENT! Value:', e.target.value);
        const query = e.target.value.trim();
        renderSearchResults(query);
    });

    // Attach keydown event
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchDropdown.classList.remove('show');
        }
    });

    // Click outside to close
    document.addEventListener('click', function(e) {
        if (!searchDropdown.contains(e.target) && e.target !== searchInput) {
            searchDropdown.classList.remove('show');
        }
    });

    console.log('=== INITIALIZATION COMPLETE ===');
}
