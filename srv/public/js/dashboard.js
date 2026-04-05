/* ============================================================
   BDC Assessment Generator - Scenario Dashboard
   ============================================================ */

// ---- State ----
let scenarioData = null;
let customerData = null;
let interviewAnswers = null;
let activeScenario = 'recommended';
let charts = {};
let narrativeDebounce = null;

// ---- Theme ----
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeButton(next);
    updateChartsTheme();
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

// ---- Helpers ----
function fmt(n) {
    // n is in millions (e.g., 2.5 = $2.5M, 1200 = $1.2B)
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'B';
    if (n >= 1) return '$' + n.toFixed(1) + 'M';
    if (n >= 0.001) return '$' + (n * 1000).toFixed(0) + 'K';
    return '$' + (n * 1000000).toFixed(0);
}

function fmtPct(n) { return n + '%'; }

function getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#98989D' : '#8E8E93',
        grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        surface: isDark ? '#1C1C1E' : '#FFFFFF',
        blue: isDark ? '#0A84FF' : '#007AFF',
        green: isDark ? '#30D158' : '#34C759',
        orange: isDark ? '#FF9F0A' : '#FF9500',
        red: isDark ? '#FF453A' : '#FF3B30',
        blueBg: isDark ? 'rgba(10,132,255,0.15)' : 'rgba(0,122,255,0.1)',
        greenBg: isDark ? 'rgba(48,209,88,0.15)' : 'rgba(52,199,89,0.1)',
        orangeBg: isDark ? 'rgba(255,159,10,0.15)' : 'rgba(255,149,0,0.1)',
    };
}

// ---- Init ----
function init() {
    // Load data from sessionStorage
    try {
        const fullData = JSON.parse(sessionStorage.getItem('scenarioData'));

        // Handle both old format (scenarios only) and new format (full response with chartData)
        if (fullData && fullData.scenarios && fullData.chartData) {
            // New format: full response with chartData
            scenarioData = fullData.scenarios;
            scenarioData.chartData = fullData.chartData;
        } else if (fullData) {
            // Old format: scenarios only (fallback)
            scenarioData = fullData;
        }

        customerData = JSON.parse(sessionStorage.getItem('customerData'));
        interviewAnswers = JSON.parse(sessionStorage.getItem('interviewAnswers'));
    } catch (e) {
        console.error('Failed to parse session data:', e);
    }

    if (!scenarioData) {
        // No data - redirect back
        window.location.href = '/wizard.html';
        return;
    }

    renderHeader();
    renderScenarioCards();
    selectScenario('recommended');
    initCharts();
    requestNarrative();
}

// ---- Header ----
function renderHeader() {
    const name = customerData ? customerData.name : 'Customer';
    document.getElementById('dashTitle').textContent = `Investment Scenarios`;

    // Populate metadata
    document.getElementById('metaCustomer').textContent = name;
    document.getElementById('metaERP').textContent = customerData?.erpDeployment || 'N/A';
    document.getElementById('metaBW').textContent = customerData?.existingBW || 'N/A';

    // Show ECIF eligibility
    const ecifEligible = customerData?.dataLakeProvider &&
        ['Snowflake', 'Azure', 'AWS', 'GCP'].includes(customerData.dataLakeProvider);
    const ecifBadge = document.getElementById('metaECIF');
    ecifBadge.textContent = ecifEligible ? 'Eligible' : 'Not Eligible';
    ecifBadge.className = ecifEligible ? 'meta-badge badge badge-green' : 'meta-badge badge badge-gray';

    // Show ECIF badge on recommended card if eligible
    if (ecifEligible) {
        const ecifCardBadge = document.getElementById('ecifBadge');
        if (ecifCardBadge) ecifCardBadge.style.display = 'inline-block';
    }
}

// ---- Scenario Cards ----
function renderScenarioCards(specificScenario) {
    const scenarios = specificScenario ? [specificScenario] : ['conservative', 'recommended', 'aggressive'];
    scenarios.forEach(key => {
        const s = scenarioData[key];
        if (!s) return;
        const inv = document.getElementById(`sc${capitalize(key)}Inv`);
        const roi = document.getElementById(`sc${capitalize(key)}ROI`);
        const payback = document.getElementById(`sc${capitalize(key)}Payback`);
        const timeline = document.getElementById(`sc${capitalize(key)}Timeline`);
        if (inv) inv.textContent = fmt(s.investment);
        if (roi) roi.textContent = fmtPct(s.roi);
        if (payback) payback.textContent = s.paybackMonths + ' mo';
        if (timeline) timeline.textContent = s.timeline + ' months';
    });
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function selectScenario(key) {
    activeScenario = key;
    const s = scenarioData[key];
    if (!s) return;

    // Update card highlighting
    document.querySelectorAll('.scenario-card').forEach(card => {
        card.classList.toggle('active', card.dataset.scenario === key);
    });

    // Update KPIs
    document.getElementById('kpiInvestment').textContent = fmt(s.investment);
    document.getElementById('kpiROI').textContent = fmtPct(s.roi);
    document.getElementById('kpiPayback').textContent = (s.payback || s.paybackMonths) + ' mo';
    document.getElementById('kpiNPV').textContent = fmt(s.npv);

    // Update sliders to match scenario - use actual scopePercent from backend
    document.getElementById('sliderTimeline').value = s.timeline;
    document.getElementById('sliderTimelineValue').textContent = s.timeline + ' months';

    // Use actual scope from scenario data (backend sends scopePercent)
    const actualScope = s.scopePercent || { conservative: 40, recommended: 70, aggressive: 100 }[key] || 75;
    document.getElementById('sliderScope').value = actualScope;
    document.getElementById('sliderScopeValue').textContent = actualScope + '%';

    document.getElementById('sliderInvestment').value = s.investment;
    document.getElementById('sliderInvestmentValue').textContent = fmt(s.investment);

    // Update charts
    updateCharts();

    // Request new narrative
    requestNarrative();
}

// ---- Sliders ----
function onSliderChange() {
    const timeline = parseInt(document.getElementById('sliderTimeline').value);
    const scope = parseInt(document.getElementById('sliderScope').value);
    const investment = parseFloat(document.getElementById('sliderInvestment').value);

    document.getElementById('sliderTimelineValue').textContent = timeline + ' months';
    document.getElementById('sliderScopeValue').textContent = scope + '%';
    document.getElementById('sliderInvestmentValue').textContent = fmt(investment);

    // Recalculate scenario based on slider adjustments
    const base = scenarioData[activeScenario];
    if (!base) return;

    // Scope adjusts BOTH investment and returns proportionally
    const baseScopePercent = { conservative: 40, recommended: 70, aggressive: 100 }[activeScenario] || 75;
    const scopeRatio = scope / baseScopePercent;

    // Adjusted annual return scales with scope
    const adjustedAnnualReturn = (base.annualReturn || base.investment * 1.0) * scopeRatio;

    // ECIF stays proportional to investment
    const ecifRatio = (base.ecifFunding || 0) / base.investment;
    const adjustedECIF = investment * ecifRatio;
    const adjustedNetInvestment = investment - adjustedECIF;

    // 3-year cumulative ROI with implementation ramp
    const year1Return = adjustedAnnualReturn * 0.5; // 50% during implementation
    const year2Return = adjustedAnnualReturn;
    const year3Return = adjustedAnnualReturn;
    const totalReturn3yr = year1Return + year2Return + year3Return;
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
            break; // Early exit - no need to continue loop
        }
    }
    const adjustedPayback = paybackMonth || 36; // cap at 36 if never reached

    // NPV with proper discounting (10% annual, monthly compounding)
    const monthlyDiscount = 0.10 / 12;
    // Pre-calculate discount factors to avoid repeated Math.pow()
    const discountFactors = [];
    for (let m = 1; m <= 36; m++) {
        discountFactors.push(1 / Math.pow(1 + monthlyDiscount, m));
    }

    let adjustedNPV = -adjustedNetInvestment;
    for (let m = 1; m <= 36; m++) {
        const df = discountFactors[m - 1];
        if (m <= timeline) {
            adjustedNPV += monthlyReturn * (m / timeline) * 0.5 * df;
        } else {
            adjustedNPV += monthlyReturn * df;
        }
    }

    // Update KPI display
    document.getElementById('kpiInvestment').textContent = fmt(investment);
    document.getElementById('kpiROI').textContent = fmtPct(adjustedROI);
    document.getElementById('kpiPayback').textContent = adjustedPayback + ' mo';
    document.getElementById('kpiNPV').textContent = fmt(adjustedNPV);

    // CRITICAL: Update scenarioData so scenario switching preserves adjusted values
    if (scenarioData[activeScenario]) {
        scenarioData[activeScenario].investment = investment;
        scenarioData[activeScenario].roi = adjustedROI;
        scenarioData[activeScenario].paybackMonths = adjustedPayback;
        scenarioData[activeScenario].payback = adjustedPayback;
        scenarioData[activeScenario].npv = adjustedNPV;
        scenarioData[activeScenario].timeline = timeline;
        scenarioData[activeScenario].annualReturn = adjustedAnnualReturn;
    }

    // Update scenario card to reflect adjusted values
    renderScenarioCards(activeScenario);

    // Update charts with new values
    updateChartsFromSliders(adjustedAnnualReturn);

    // Debounce narrative request
    clearTimeout(narrativeDebounce);
    narrativeDebounce = setTimeout(() => {
        requestNarrative(timeline, scope, investment, adjustedROI, adjustedPayback);
    }, 400);
}

// ---- Charts ----
function initCharts() {
    const colors = getThemeColors();

    // NPV Chart
    const npvCtx = document.getElementById('npvChart').getContext('2d');
    charts.npv = new Chart(npvCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Conservative', data: [], borderColor: colors.blue, backgroundColor: colors.blueBg, fill: false, tension: 0.3, pointRadius: 3 },
                { label: 'Recommended', data: [], borderColor: colors.green, backgroundColor: colors.greenBg, fill: false, tension: 0.3, pointRadius: 3, borderWidth: 3 },
                { label: 'Aggressive', data: [], borderColor: colors.orange, backgroundColor: colors.orangeBg, fill: false, tension: 0.3, pointRadius: 3 }
            ]
        },
        options: chartOptions(colors, 'NPV ($M)')
    });

    // Payback Waterfall Chart
    const paybackCtx = document.getElementById('paybackChart').getContext('2d');
    charts.payback = new Chart(paybackCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Cash Flow',
                data: [],
                backgroundColor: [],
                borderRadius: 4
            }]
        },
        options: chartOptions(colors, 'Cash Flow ($M)')
    });

    // TCO Chart
    const tcoCtx = document.getElementById('tcoChart').getContext('2d');
    charts.tco = new Chart(tcoCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                { label: 'Current State', data: [], backgroundColor: colors.red + '80', borderRadius: 4 },
                { label: 'With BDC', data: [], backgroundColor: colors.green + '80', borderRadius: 4 }
            ]
        },
        options: {
            ...chartOptions(colors, 'Cost ($M)'),
            plugins: {
                ...chartOptions(colors, 'Cost ($M)').plugins,
                legend: { display: true, position: 'top', labels: { color: colors.textSecondary, font: { size: 11 }, boxWidth: 12, padding: 16 } }
            }
        }
    });

    // ROI Comparison Chart
    const roiCtx = document.getElementById('roiChart').getContext('2d');
    charts.roi = new Chart(roiCtx, {
        type: 'doughnut',
        data: {
            labels: ['Conservative', 'Recommended', 'Aggressive'],
            datasets: [{
                data: [75, 134, 180],
                backgroundColor: [colors.blue, colors.green, colors.orange],
                borderWidth: 0,
                spacing: 4,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: colors.textSecondary, font: { size: 11 }, boxWidth: 12, padding: 16 }
                },
                tooltip: {
                    backgroundColor: colors.surface,
                    titleColor: colors.text,
                    bodyColor: colors.textSecondary,
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    callbacks: { label: (ctx) => ctx.label + ': ' + ctx.raw + '% ROI' }
                }
            }
        }
    });

    updateCharts();
}

function chartOptions(colors, yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: colors.surface,
                titleColor: colors.text,
                bodyColor: colors.textSecondary,
                borderColor: 'rgba(0,0,0,0.1)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => {
                        const val = ctx.raw;
                        return ctx.dataset.label + ': ' + (typeof val === 'number' ? fmt(val) : val);
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: colors.textSecondary, font: { size: 11 } },
                grid: { display: false }
            },
            y: {
                ticks: {
                    color: colors.textSecondary,
                    font: { size: 11 },
                    callback: (val) => fmt(val)
                },
                grid: { color: colors.grid },
                title: { display: false }
            }
        }
    };
}

function updateCharts() {
    if (!scenarioData || !scenarioData.chartData) return;
    const cd = scenarioData.chartData;
    const colors = getThemeColors();

    // NPV - backend sends npvCurves with {x,y} points per scenario
    if (charts.npv && cd.npvCurves) {
        charts.npv.data.datasets[0].data = cd.npvCurves.conservative || [];
        charts.npv.data.datasets[1].data = cd.npvCurves.recommended || [];
        charts.npv.data.datasets[2].data = cd.npvCurves.aggressive || [];
        // Highlight active
        charts.npv.data.datasets.forEach((ds, i) => {
            const keys = ['conservative', 'recommended', 'aggressive'];
            ds.borderWidth = keys[i] === activeScenario ? 3 : 1.5;
        });
        charts.npv.update('none');
    }

    // Payback - backend sends paybackWaterfall per scenario
    if (charts.payback && cd.paybackWaterfall) {
        const scenarioWaterfall = cd.paybackWaterfall[activeScenario];
        if (scenarioWaterfall) {
            charts.payback.data.labels = scenarioWaterfall.map(bar => bar.label);
            charts.payback.data.datasets[0].data = scenarioWaterfall.map(bar => bar.cumulative);
            charts.payback.data.datasets[0].backgroundColor = scenarioWaterfall.map(bar =>
                bar.type === 'cost' || bar.type === 'recovery' ? colors.red + '80' : colors.green + '80'
            );
            charts.payback.update('none');
        }
    }

    // TCO - backend sends tcoComparison with Chart.js-ready structure
    if (charts.tco && cd.tcoComparison) {
        charts.tco.data.labels = cd.tcoComparison.labels;
        charts.tco.data.datasets = cd.tcoComparison.datasets;
        charts.tco.update('none');
    }

    // ROI doughnut
    if (charts.roi) {
        const sc = scenarioData;
        charts.roi.data.datasets[0].data = [
            sc.conservative ? sc.conservative.roi : 75,
            sc.recommended ? sc.recommended.roi : 134,
            sc.aggressive ? sc.aggressive.roi : 180
        ];
        charts.roi.update('none');
    }
}

function updateChartsFromSliders(annualReturn) {
    if (!scenarioData || !scenarioData.chartData) return;
    const colors = getThemeColors();

    // Recalculate NPV curve with adjusted values
    const activeScenarioData = scenarioData[activeScenario];
    if (!activeScenarioData) return;

    const timeline = activeScenarioData.timeline;
    const investment = activeScenarioData.investment;
    const monthlyReturn = annualReturn / 12;

    // Generate NPV curve points
    const monthlyDiscount = 0.10 / 12;
    const adjustedNPVCurve = [];
    let cumNPV = -investment;

    for (let m = 0; m <= 36; m++) {
        if (m === 0) {
            adjustedNPVCurve.push({ x: 0, y: cumNPV });
        } else {
            const df = 1 / Math.pow(1 + monthlyDiscount, m);
            if (m <= timeline) {
                cumNPV += monthlyReturn * (m / timeline) * 0.5 * df;
            } else {
                cumNPV += monthlyReturn * df;
            }
            adjustedNPVCurve.push({ x: m, y: cumNPV });
        }
    }

    if (charts.npv) {
        const idx = ['conservative', 'recommended', 'aggressive'].indexOf(activeScenario);
        if (idx >= 0) {
            charts.npv.data.datasets[idx].data = adjustedNPVCurve;
            charts.npv.update('none');
        }
    }

    // Recalculate payback waterfall
    if (charts.payback) {
        const bars = [{ label: 'Investment', cumulative: -investment }];
        let cum = -investment;

        for (let q = 1; q <= 8; q++) {
            const qReturn = annualReturn / 4;
            cum += qReturn;
            bars.push({ label: `Q${q}`, cumulative: cum });
        }

        charts.payback.data.labels = bars.map(b => b.label);
        charts.payback.data.datasets[0].data = bars.map(b => b.cumulative);
        charts.payback.data.datasets[0].backgroundColor = bars.map(b =>
            b.cumulative < 0 ? colors.red + '80' : colors.green + '80'
        );
        charts.payback.update('none');
    }
}

function updateChartsTheme() {
    const colors = getThemeColors();

    Object.values(charts).forEach(chart => {
        if (!chart || !chart.options) return;

        // Update tooltip
        if (chart.options.plugins && chart.options.plugins.tooltip) {
            chart.options.plugins.tooltip.backgroundColor = colors.surface;
            chart.options.plugins.tooltip.titleColor = colors.text;
            chart.options.plugins.tooltip.bodyColor = colors.textSecondary;
        }

        // Update legend
        if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
            chart.options.plugins.legend.labels.color = colors.textSecondary;
        }

        // Update scales
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.color = colors.textSecondary;
                if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = colors.grid;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.color = colors.textSecondary;
                if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = colors.grid;
            }
        }

        // Update dataset colors
        if (chart.config.type === 'line') {
            chart.data.datasets[0].borderColor = colors.blue;
            chart.data.datasets[0].backgroundColor = colors.blueBg;
            chart.data.datasets[1].borderColor = colors.green;
            chart.data.datasets[1].backgroundColor = colors.greenBg;
            chart.data.datasets[2].borderColor = colors.orange;
            chart.data.datasets[2].backgroundColor = colors.orangeBg;
        }

        if (chart.config.type === 'doughnut') {
            chart.data.datasets[0].backgroundColor = [colors.blue, colors.green, colors.orange];
        }

        chart.update('none');
    });
}

// ---- AI Narrative ----
function requestNarrative(timeline, scope, investment, roi, payback) {
    const el = document.getElementById('narrativeText');
    el.innerHTML = '<div class="narrative-loading"><div class="spinner spinner-dark"></div><span>Generating analysis...</span></div>';

    const s = scenarioData[activeScenario];
    const t = timeline || (s ? s.timeline : 12);
    const r = roi || (s ? s.roi : 134);
    const inv = investment || (s ? s.investment : 2.5);
    const pb = payback || (s ? s.paybackMonths : 12);
    const sc = scope || 75;

    // Try live API first
    fetchNarrative(t, sc, inv, r, pb).then(text => {
        if (text) {
            el.innerHTML = text;
        } else {
            // Fallback to local generation
            el.innerHTML = generateLocalNarrative(t, sc, inv, r, pb);
        }
    });
}

async function fetchNarrative(timeline, scope, investment, roi, payback) {
    try {
        const params = new URLSearchParams({
            customerId: customerData ? customerData.id : '',
            scenario: activeScenario,
            timeline: timeline,
            scope: scope,
            investment: investment,
            roi: roi,
            payback: payback
        });

        const res = await fetch(`/api/generate-narrative?${params}`);
        if (!res.ok) return null;

        // Handle streaming
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let text = '';
        const el = document.getElementById('narrativeText');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // Parse SSE
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === 'text') {
                            text += data.content;
                            el.innerHTML = formatNarrative(text);
                        }
                    } catch (e) { /* skip non-JSON lines */ }
                }
            }
        }

        return text ? formatNarrative(text) : null;
    } catch (e) {
        return null;
    }
}

function generateLocalNarrative(timeline, scope, investment, roi, payback) {
    const name = customerData ? customerData.name : 'the customer';
    const scenarioLabel = activeScenario.charAt(0).toUpperCase() + activeScenario.slice(1);
    const driver = interviewAnswers ? interviewAnswers.businessDriver : 'revenue_growth';

    const driverText = {
        cost_reduction: 'cost optimization and TCO reduction',
        revenue_growth: 'revenue acceleration and competitive advantage',
        competitive_pressure: 'market competitiveness and peer parity',
        compliance: 'regulatory compliance and risk mitigation'
    }[driver] || 'strategic transformation';

    const cloud = interviewAnswers ? interviewAnswers.cloudPreference : 'multi_cloud';
    const cloudText = {
        sap_only: 'SAP-native architecture leveraging BTP and Datasphere',
        multi_cloud: 'hybrid multi-cloud strategy combining SAP with existing hyperscaler investments',
        cloud_agnostic: 'open, cloud-agnostic architecture for maximum flexibility'
    }[cloud] || 'modern cloud architecture';

    const coSell = customerData && customerData.otherDatalake &&
        ['Snowflake', 'Azure', 'Databricks'].some(p => (customerData.otherDatalake || '').includes(p));

    let narrative = `<strong>The ${scenarioLabel} scenario</strong> delivers <strong>${roi}% ROI</strong> on a `;
    narrative += `<strong>${fmt(investment)}</strong> investment with a <strong>${payback}-month payback period</strong>. `;
    narrative += `This approach is aligned with ${name}'s primary objective of ${driverText}, `;
    narrative += `using a ${cloudText}. `;

    if (timeline <= 9) {
        narrative += `The accelerated <strong>${timeline}-month timeline</strong> requires dedicated program resources but positions ${name} ahead of competitors. `;
    } else if (timeline <= 14) {
        narrative += `The <strong>${timeline}-month timeline</strong> balances speed with manageable execution risk. `;
    } else {
        narrative += `The extended <strong>${timeline}-month timeline</strong> minimizes disruption through careful phased rollout. `;
    }

    if (scope < 60) {
        narrative += `At ${scope}% scope, this targets the highest-value use cases first, with expansion planned for Phase 2. `;
    } else if (scope >= 90) {
        narrative += `The comprehensive ${scope}% scope ensures full platform value realization from day one. `;
    }

    if (coSell) {
        narrative += `<br><br><strong>ECIF Opportunity:</strong> ${name}'s existing ${customerData.otherDatalake} investment qualifies for <strong>20-30% co-sell funding</strong>, `;
        narrative += `potentially reducing net investment by ${fmt(investment * 0.25)}. `;
    }

    narrative += `<br><br>Moving the timeline slider will show how accelerating or extending the deployment `;
    narrative += `impacts both ROI and risk profile. Increasing scope captures more value but requires proportionally higher investment.`;

    return narrative;
}

function formatNarrative(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

// ---- Export ----
function exportMarkdown() {
    const s = scenarioData[activeScenario];
    if (!s) return;

    const name = customerData ? customerData.name : 'Customer';
    const timeline = document.getElementById('sliderTimeline').value;
    const scope = document.getElementById('sliderScope').value;
    const investment = document.getElementById('sliderInvestment').value;

    let md = `# BDC Strategic Assessment: ${name}\n`;
    md += `_Generated ${new Date().toISOString().split('T')[0]}_\n\n`;
    md += `## Selected Scenario: ${capitalize(activeScenario)}\n\n`;
    md += `| Metric | Value |\n|--------|-------|\n`;
    md += `| Investment | ${fmt(parseFloat(investment))} |\n`;
    md += `| ROI | ${document.getElementById('kpiROI').textContent} |\n`;
    md += `| Payback | ${document.getElementById('kpiPayback').textContent} |\n`;
    md += `| NPV | ${document.getElementById('kpiNPV').textContent} |\n`;
    md += `| Timeline | ${timeline} months |\n`;
    md += `| Scope | ${scope}% |\n\n`;

    if (interviewAnswers) {
        md += `## Interview Context\n\n`;
        md += `- **Business Driver:** ${interviewAnswers.businessDriver}\n`;
        md += `- **Timeline:** ${interviewAnswers.timeline}\n`;
        md += `- **Cloud Preference:** ${interviewAnswers.cloudPreference}\n`;
        md += `- **Risk Tolerance:** ${interviewAnswers.riskTolerance}\n`;
        if (interviewAnswers.dealContext) {
            md += `- **Deal Context:** ${interviewAnswers.dealContext}\n`;
        }
        md += '\n';
    }

    md += `## All Scenarios\n\n`;
    md += `| | Conservative | Recommended | Aggressive |\n`;
    md += `|---|---|---|---|\n`;
    ['investment', 'roi', 'paybackMonths', 'timeline'].forEach(key => {
        const labels = { investment: 'Investment', roi: 'ROI', paybackMonths: 'Payback', timeline: 'Timeline' };
        const c = scenarioData.conservative || {};
        const r = scenarioData.recommended || {};
        const a = scenarioData.aggressive || {};
        const format = (val, k) => {
            if (k === 'investment') return fmt(val);
            if (k === 'roi') return val + '%';
            if (k === 'paybackMonths') return val + ' mo';
            if (k === 'timeline') return val + ' months';
            return val;
        };
        md += `| ${labels[key]} | ${format(c[key], key)} | ${format(r[key], key)} | ${format(a[key], key)} |\n`;
    });
    md += '\n';

    md += `## AI Narrative\n\n`;
    const narrativeEl = document.getElementById('narrativeText');
    md += narrativeEl.textContent.trim() + '\n';

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BDC_Assessment_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportPDF() {
    // For now, trigger print dialog which produces PDF
    window.print();
}

// ---- Start ----
init();
