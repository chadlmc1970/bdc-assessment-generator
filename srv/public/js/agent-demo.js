/**
 * Agent Demo - Enhanced with Real Backend Integration
 */

let currentPhase = 1;
let phaseTimers = [];
let intelligenceData = null;
let eventSource = null;

function goToPhase(phase) {
  for (let i = 1; i <= 4; i++) {
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
  if (phase === 1) startPhase1();
  if (phase === 2) startPhase2();
  if (phase === 3) startPhase3();
  if (phase === 4) startPhase4();
}

function updateProgressDots() {
  for (let i = 1; i <= 4; i++) {
    const dot = document.querySelector(`.progress-dot[data-phase="${i}"]`);
    if (dot) {
      dot.classList.remove('progress-dot-active', 'progress-dot-complete');
      if (i < currentPhase) dot.classList.add('progress-dot-complete');
      else if (i === currentPhase) dot.classList.add('progress-dot-active');
    }
  }
}

async function startPhase1() {
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
    const res = await fetch('/api/intelligence/analyze-customer?customer=loves');
    intelligenceData = await res.json();
    sources.forEach((s) => {
      phaseTimers.push(setTimeout(() => markSourceComplete(s, intelligenceData.sources[s.id]), s.delay + 600));
    });
    phaseTimers.push(setTimeout(() => goToPhase(2), 4000));
  } catch (err) {
    console.error(err);
    alert('Failed to fetch intelligence data');
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
  const agents = [
    { id: 'financial', name: 'Financial Model Agent', color: '#007aff' },
    { id: 'ecif', name: 'ECIF Calculator Agent', color: '#2fa82f' },
    { id: 'narrative', name: 'Narrative Generator Agent', color: '#5856d6' }
  ];
  agents.forEach((a, i) => {
    phaseTimers.push(setTimeout(() => showAgentStatus(a, 'initializing', 0), i * 300));
  });
  try {
    eventSource = new EventSource('/api/narrative/stream-assessment?customer=loves');
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

document.addEventListener('DOMContentLoaded', () => goToPhase(1));
window.addEventListener('beforeunload', () => {
  phaseTimers.forEach(t => clearTimeout(t));
  if (eventSource) eventSource.close();
});
