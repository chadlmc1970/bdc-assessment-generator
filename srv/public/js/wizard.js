/* ============================================================
   BDC Assessment Generator - Interview Wizard
   ============================================================ */

// ---- State ----
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

// ---- Questions Config ----
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

// ---- Theme ----
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeButton(next);
}

function updateThemeButton(theme) {
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    if (theme === 'dark') {
        icon.textContent = '\u2600\uFE0F';
        label.textContent = 'Light';
    } else {
        icon.textContent = '\uD83C\uDF19';
        label.textContent = 'Dark';
    }
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButton(theme);
}

initTheme();

// ---- Customer Search ----
let allCustomers = [];
let searchSelectedIndex = -1;

async function loadCustomers() {
    try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        allCustomers = data.customers || [];
        console.log(`✅ Loaded ${allCustomers.length} customers`);
    } catch (e) {
        console.error('❌ Failed to load customers:', e);
        alert('Failed to load customers. Please refresh the page.');
    }
}

function initSearch() {
    console.log('🚀 initSearch called');
    console.log('📊 Document readyState:', document.readyState);

    loadCustomers();

    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');

    console.log('🔍 searchInput element:', searchInput);
    console.log('🔍 searchDropdown element:', searchDropdown);

    if (!searchInput || !searchDropdown) {
        console.error('❌ Search elements not found!');
        console.error('❌ searchInput:', searchInput);
        console.error('❌ searchDropdown:', searchDropdown);
        return;
    }

    console.log('📝 Attaching input event listener...');
    searchInput.addEventListener('input', (e) => {
        console.log('🎯 INPUT EVENT FIRED! Value:', e.target.value);
        searchSelectedIndex = -1;
        renderSearchResults(searchInput.value.trim());
    });
    console.log('✅ Input listener attached');

    console.log('📝 Attaching keydown event listener...');
    searchInput.addEventListener('keydown', (e) => {
        console.log('⌨️ KEYDOWN EVENT FIRED! Key:', e.key);
        const items = searchDropdown.querySelectorAll('.search-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            searchSelectedIndex = Math.min(searchSelectedIndex + 1, items.length - 1);
            highlightSearchItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            searchSelectedIndex = Math.max(searchSelectedIndex - 1, -1);
            highlightSearchItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (searchSelectedIndex >= 0 && items[searchSelectedIndex]) {
                const name = items[searchSelectedIndex].dataset.name;
                selectCustomer(name);
            }
        } else if (e.key === 'Escape') {
            searchDropdown.classList.remove('show');
        }
    });
    console.log('✅ Keydown listener attached');

    document.addEventListener('click', (e) => {
        if (!searchDropdown.contains(e.target) && e.target !== searchInput) {
            searchDropdown.classList.remove('show');
        }
    });

    console.log('✅ Search initialized successfully');
    console.log('🧪 Test: Try typing in the search input now...');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}

function highlightSearchItem(items) {
    items.forEach((item, i) => {
        item.classList.toggle('active', i === searchSelectedIndex);
    });
}

function renderSearchResults(query) {
    const searchDropdown = document.getElementById('searchDropdown');

    console.log('🔍 Search:', query, '| Customers:', allCustomers.length);

    if (!query || query.length < 1) {
        searchDropdown.classList.remove('show');
        return;
    }

    const q = query.toLowerCase();
    const matches = allCustomers.filter(c => {
        const name = c.name.toLowerCase();

        // Exact substring match
        if (name.includes(q)) return true;

        // Fuzzy match - characters in order
        let qi = 0;
        for (let i = 0; i < name.length && qi < q.length; i++) {
            if (name[i] === q[qi]) qi++;
        }
        if (qi === q.length) return true;

        // Word-based fuzzy match
        const words = name.split(/\s+/);
        for (const word of words) {
            if (word.startsWith(q)) return true;
            // Fuzzy within word
            let wqi = 0;
            for (let i = 0; i < word.length && wqi < q.length; i++) {
                if (word[i] === q[wqi]) wqi++;
            }
            if (wqi === q.length) return true;
        }

        return false;
    }).slice(0, 6);

    if (matches.length === 0) {
        searchDropdown.classList.remove('show');
        return;
    }

    searchDropdown.innerHTML = matches.map((c, i) => `
        <div class="search-item ${i === searchSelectedIndex ? 'active' : ''}"
             data-name="${c.name}" onclick="selectCustomer('${c.name.replace(/'/g, "\\'")}')">
            <div class="search-item-name">${c.name}</div>
            <div class="search-item-detail">${c.erpDeployment || 'No ERP'} &middot; ${c.existingBW || 'No BW'}</div>
        </div>
    `).join('');

    searchDropdown.classList.add('show');
}

async function selectCustomer(name) {
    const searchDropdown = document.getElementById('searchDropdown');
    const searchInput = document.getElementById('searchInput');

    searchDropdown.classList.remove('show');
    searchInput.value = name;

    try {
        const res = await fetch(`/api/customers/search?q=${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error('Customer not found');
        const customer = await res.json();
        state.customer = customer;
        showCustomerConfirm(customer);
    } catch (e) {
        console.error('Failed to fetch customer:', e);
        alert('Failed to load customer details. Please try again.');
    }
}

function showCustomerConfirm(c) {
    const tags = [];
    if (c.existingDatasphere && c.existingDatasphere !== 'No') tags.push({ label: 'Datasphere', color: 'blue' });
    if (c.existingBW && c.existingBW !== 'No') tags.push({ label: 'BW', color: 'purple' });
    if (c.existingSAC && c.existingSAC !== 'No') tags.push({ label: 'SAC', color: 'green' });
    if (c.otherDatalake) tags.push({ label: c.otherDatalake, color: 'orange' });

    const tagsHtml = tags.map(t => `<span class="badge badge-${t.color}">${t.label}</span>`).join('');

    const el = document.getElementById('customerConfirm');
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
                    <div class="customer-meta-label">BPC</div>
                    <div class="customer-meta-value">${c.bpc || 'None'}</div>
                </div>
                <div class="customer-meta-item">
                    <div class="customer-meta-label">Target</div>
                    <div class="customer-meta-value">${c.bwMoveTarget || 'N/A'}</div>
                </div>
            </div>
            ${tagsHtml ? `<div class="customer-tags">${tagsHtml}</div>` : ''}
            ${c.dataOwner || c.aiOwner || c.iae ? `
                <div style="font-size:13px; color:var(--text-tertiary); margin-bottom:16px;">
                    ${c.dataOwner ? 'Data: ' + c.dataOwner : ''}
                    ${c.aiOwner ? ' &middot; AI: ' + c.aiOwner : ''}
                    ${c.iae ? ' &middot; IAE: ' + c.iae : ''}
                </div>
            ` : ''}
            <div class="customer-confirm-actions">
                <button class="btn btn-primary btn-full" onclick="startInterview()">
                    Start Assessment Interview
                </button>
                <button class="btn btn-secondary btn-full" onclick="startAgentDemo()" style="margin-top:12px;">
                    Try AI Agent Mode (Demo)
                </button>
            </div>
            <div style="text-align:center; margin-top:10px;">
                <button class="btn btn-ghost btn-sm" onclick="resetSearch()">Choose different customer</button>
            </div>
        </div>
    `;
    el.style.display = 'block';
}

function resetSearch() {
    state.customer = null;
    document.getElementById('customerConfirm').style.display = 'none';
    searchInput.value = '';
    searchInput.focus();
}

// ---- Interview Flow ----
function startInterview() {
    document.getElementById('searchPhase').style.display = 'none';
    document.getElementById('interviewPhase').style.display = 'block';
    state.currentStep = 0;
    renderQuestion();
}

function renderQuestion() {
    const q = questions[state.currentStep];
    const area = document.getElementById('questionArea');

    // Update progress
    const pct = ((state.currentStep + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('stepLabel').textContent = q.label;
    document.getElementById('stepCount').textContent = `${state.currentStep + 1} of ${questions.length}`;

    // Back button visibility
    document.getElementById('backBtn').style.visibility = state.currentStep === 0 ? 'hidden' : 'visible';

    // Build question HTML
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

    // Update next button
    updateNextButton();
}

function selectOption(key, value) {
    state.answers[key] = value;
    renderQuestion();
    // Auto-advance after short delay
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
        // Textarea is optional, always enabled
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

// ---- Submit & Generate ----
async function submitInterview() {
    // Show generating phase
    document.getElementById('interviewPhase').style.display = 'none';
    document.getElementById('generatingPhase').style.display = 'block';
    document.getElementById('genCustomerName').textContent = `Generating for ${state.customer.name}`;

    // Animate steps
    const stepKeys = ['analyze', 'financial', 'scenarios', 'narrative'];
    let currentGenStep = 0;

    const stepInterval = setInterval(() => {
        if (currentGenStep >= stepKeys.length) {
            clearInterval(stepInterval);
            return;
        }
        const steps = document.querySelectorAll('.generating-step');
        steps.forEach((s, i) => {
            if (i < currentGenStep) {
                s.className = 'generating-step done';
                s.querySelector('.generating-step-icon').innerHTML = '&#10003;';
            } else if (i === currentGenStep) {
                s.className = 'generating-step active';
            } else {
                s.className = 'generating-step pending';
            }
        });
        currentGenStep++;
    }, 1200);

    try {
        const res = await fetch('/api/scenarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: state.customer.id,
                interviewAnswers: state.answers
            })
        });

        clearInterval(stepInterval);

        if (!res.ok) {
            // If endpoint doesn't exist yet, use mock data
            console.warn('Scenarios API not ready, using mock data');
            const mockData = generateMockScenarios();
            navigateToDashboard(mockData);
            return;
        }

        const data = await res.json();
        navigateToDashboard(data);
    } catch (e) {
        clearInterval(stepInterval);
        console.warn('Scenarios API error, using mock data:', e.message);
        const mockData = generateMockScenarios();
        navigateToDashboard(mockData);
    }
}

function generateMockScenarios() {
    const name = state.customer ? state.customer.name : 'Customer';
    const baseInvestment = state.answers.riskTolerance === 'aggressive' ? 3.2 :
                           state.answers.riskTolerance === 'conservative' ? 1.0 : 1.8;

    return {
        customer: state.customer,
        interviewAnswers: state.answers,
        conservative: {
            label: 'Conservative',
            investment: baseInvestment * 0.6,
            annualReturn: baseInvestment * 0.6 * 0.75,
            roi: 75,
            paybackMonths: 18,
            npv: baseInvestment * 0.6 * 1.2,
            timeline: 18,
            scope: 'Datasphere only',
            description: 'Phased Datasphere deployment with low risk and proven ROI.'
        },
        recommended: {
            label: 'Recommended',
            investment: baseInvestment,
            annualReturn: baseInvestment * 1.34,
            roi: 134,
            paybackMonths: 12,
            npv: baseInvestment * 2.1,
            timeline: 12,
            scope: 'Datasphere + AI Core',
            description: 'Full BDC platform with AI capabilities for maximum strategic value.'
        },
        aggressive: {
            label: 'Aggressive',
            investment: baseInvestment * 1.8,
            annualReturn: baseInvestment * 1.8 * 1.8,
            roi: 180,
            paybackMonths: 9,
            npv: baseInvestment * 1.8 * 2.8,
            timeline: 9,
            scope: 'Full BDC + Services',
            description: 'Accelerated full-stack deployment with premium services and support.'
        },
        chartData: {
            npv: generateNPVData(baseInvestment),
            payback: generatePaybackData(baseInvestment),
            tco: generateTCOData(baseInvestment)
        }
    };
}

function generateNPVData(base) {
    const months = [0, 3, 6, 9, 12, 15, 18, 21, 24];
    return {
        labels: months.map(m => `M${m}`),
        conservative: months.map(m => -base * 0.6 + (base * 0.6 * 0.75 / 12) * m),
        recommended: months.map(m => -base + (base * 1.34 / 12) * m),
        aggressive: months.map(m => -base * 1.8 + (base * 1.8 * 1.8 / 12) * m)
    };
}

function generatePaybackData(base) {
    return {
        labels: ['Initial Investment', 'Q1 Savings', 'Q2 Savings', 'Q3 Savings', 'Q4 Savings', 'Net Position'],
        values: [-base, base * 0.2, base * 0.35, base * 0.4, base * 0.45, base * 0.4]
    };
}

function generateTCOData(base) {
    return {
        labels: ['Year 1', 'Year 2', 'Year 3'],
        current: [base * 1.2, base * 1.25, base * 1.3],
        proposed: [base * 1.0, base * 0.85, base * 0.7]
    };
}

function navigateToDashboard(data) {
    // Store complete response including chartData
    sessionStorage.setItem('scenarioData', JSON.stringify(data));
    sessionStorage.setItem('customerData', JSON.stringify(data.customer || state.customer));
    sessionStorage.setItem('interviewAnswers', JSON.stringify(data.interviewAnswers || state.answers));
    window.location.href = '/dashboard.html';
}

// Agent Demo Mode
function startAgentDemo() {
    if (!state.customer) {
        alert('Please select a customer first');
        return;
    }
    window.location.href = `/agent-demo.html?customer=${state.customer.id}`;
}
