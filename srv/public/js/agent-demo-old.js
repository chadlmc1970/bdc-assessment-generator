/**
 * BDC Assessment Generator - Agent Demo Animations
 * Handles timed reveals and phase transitions for the agent-guided experience
 */

// Timer management
let activeTimers = [];
let isTransitioning = false;

// Clear all pending timers
function clearAllTimers() {
  activeTimers.forEach(id => clearTimeout(id));
  activeTimers = [];
}

// Reveal an element with animation
function revealElement(selector, delay) {
  const timerId = setTimeout(() => {
    const el = document.querySelector(selector);
    if (el) {
      el.style.display = 'block';
      el.classList.add('agent-animate-in');

      // Smooth scroll to keep content visible
      // NOTE: Nested 100ms setTimeout not tracked in activeTimers (tradeoff: simpler code vs. cleanup precision)
      // Risk: Low - only causes 100ms delay on cleanup edge cases (phase transition during scroll)
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, delay);

  activeTimers.push(timerId);
  return timerId;
}

// Update progress indicator
function updateProgress(currentPhase) {
  // Map phase names to progress indicator steps
  const phaseMap = {
    'discovery': 'discovery',
    'briefing': 'briefing',
    'scenarios': 'generation',
    'generation': 'generation',
    'narrative': 'results',
    'results': 'results'
  };

  const mappedPhase = phaseMap[currentPhase] || currentPhase;
  const phases = ['discovery', 'briefing', 'generation', 'results'];
  const currentIndex = phases.indexOf(mappedPhase);

  phases.forEach((phase, index) => {
    const dot = document.querySelector(`[data-step="${phase}"]`);
    if (dot) {
      dot.classList.remove('active', 'completed');
      if (index < currentIndex) {
        dot.classList.add('completed');
      } else if (index === currentIndex) {
        dot.classList.add('active');
      }
    }
  });
}

// Discovery phase animation sequence
function startDiscoveryAnimation() {
  // Clear any existing timers
  clearAllTimers();

  // Show customer context immediately
  const contextCard = document.querySelector('.agent-context-card');
  if (contextCard) {
    contextCard.style.display = 'block';
    contextCard.classList.add('agent-animate-in');
  }

  // Q&A pairs with 2-second intervals
  const delays = {
    q1: 1000,   // 1s after context
    a1: 3000,   // 2s after Q1
    q2: 5000,   // 2s after A1
    a2: 7000,   // 2s after Q2
    q3: 9000,   // 2s after A2
    a3: 11000,  // 2s after Q3
    q4: 13000,  // 2s after A3
    a4: 15000,  // 2s after Q4
    q5: 17000,  // 2s after A4
    a5: 19000,  // 2s after Q5
    button: 21000 // 2s after A5
  };

  // Reveal Q1
  revealElement('[data-qa="q1"]', delays.q1);

  // Reveal A1
  revealElement('[data-qa="a1"]', delays.a1);

  // Reveal Q2
  revealElement('[data-qa="q2"]', delays.q2);

  // Reveal A2
  revealElement('[data-qa="a2"]', delays.a2);

  // Reveal Q3
  revealElement('[data-qa="q3"]', delays.q3);

  // Reveal A3
  revealElement('[data-qa="a3"]', delays.a3);

  // Reveal Q4
  revealElement('[data-qa="q4"]', delays.q4);

  // Reveal A4
  revealElement('[data-qa="a4"]', delays.a4);

  // Reveal Q5
  revealElement('[data-qa="q5"]', delays.q5);

  // Reveal A5
  revealElement('[data-qa="a5"]', delays.a5);

  // Show "Continue to Briefing" button with pulse
  const buttonTimerId = setTimeout(() => {
    const button = document.querySelector('[data-action="continue-briefing"]');
    if (button) {
      button.style.display = 'inline-block';
      button.classList.add('agent-animate-in', 'pulse-animation');

      // Scroll to button
      setTimeout(() => {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, delays.button);

  activeTimers.push(buttonTimerId);
}

// Phase transition handler
function advancePhase(nextPhase) {
  // Prevent double-clicks during transition
  if (isTransitioning) {
    console.log('Phase transition already in progress');
    return;
  }

  isTransitioning = true;

  // Clear all pending timers
  clearAllTimers();

  // Hide current phase (use agent-phase-container class)
  const currentPhase = document.querySelector('.agent-phase-container:not([style*="display: none"])');
  if (currentPhase) {
    currentPhase.style.opacity = '0';
    setTimeout(() => {
      currentPhase.style.display = 'none';
    }, 300);
  }

  // Show next phase after fade out
  setTimeout(() => {
    // Map phase name to actual HTML ID
    const phaseIdMap = {
      'discovery': 'discovery-phase',
      'briefing': 'briefing-phase',
      'scenarios': 'generation-phase',
      'generation': 'generation-phase',
      'narrative': 'results-phase',
      'results': 'results-phase'
    };

    const phaseId = phaseIdMap[nextPhase] || `${nextPhase}-phase`;
    const nextPhaseCard = document.getElementById(phaseId);

    if (nextPhaseCard) {
      nextPhaseCard.style.display = 'block';
      nextPhaseCard.style.opacity = '0';

      // Fade in
      setTimeout(() => {
        nextPhaseCard.style.opacity = '1';
      }, 50);

      // Update progress indicator
      updateProgress(nextPhase);

      // Scroll to top of new phase
      setTimeout(() => {
        nextPhaseCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      // Start phase-specific animations
      if (nextPhase === 'discovery') {
        startDiscoveryAnimation();
      } else if (nextPhase === 'briefing') {
        startBriefingAnimation();
      } else if (nextPhase === 'scenarios' || nextPhase === 'generation') {
        startScenariosAnimation();
      } else if (nextPhase === 'narrative' || nextPhase === 'results') {
        startNarrativeAnimation();
      }

      isTransitioning = false;
    } else {
      console.error(`Phase content not found: ${nextPhase} (tried ID: ${phaseId})`);

      // Show user-facing error message
      const errorContainer = document.createElement('div');
      errorContainer.className = 'agent-error-message';
      errorContainer.style.cssText = 'background: #fee; border: 1px solid #fcc; padding: 1rem; margin: 1rem; border-radius: 4px; color: #c33;';
      errorContainer.innerHTML = `
        <strong>⚠️ Navigation Error</strong>
        <p>Unable to load the ${nextPhase} phase. Please refresh the page or contact support.</p>
      `;

      const mainContent = document.querySelector('.agent-demo-container') || document.body;
      mainContent.insertBefore(errorContainer, mainContent.firstChild);

      isTransitioning = false;
    }
  }, 350);
}

// Briefing phase animation sequence
function startBriefingAnimation() {
  // Clear any existing timers
  clearAllTimers();

  // Update progress to show briefing as active
  updateProgress('briefing');

  // Sequenced reveals with delays
  const delays = [
    { selector: '.briefing-executive-summary', delay: 500 },
    { selector: '.briefing-quantified-impact', delay: 1500 },
    { selector: '[data-action="continue-scenarios"]', delay: 3000, pulse: true }
  ];

  delays.forEach(({ selector, delay, pulse }) => {
    if (pulse) {
      // Button with pulse animation
      const buttonTimerId = setTimeout(() => {
        const button = document.querySelector(selector);
        if (button) {
          button.style.display = 'inline-block';
          button.classList.add('agent-animate-in', 'pulse-animation');

          // Scroll to button
          setTimeout(() => {
            button.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      }, delay);

      activeTimers.push(buttonTimerId);
    } else {
      // Regular card reveal
      revealElement(selector, delay);
    }
  });
}

function startScenariosAnimation() {
  // Clear any existing timers
  clearAllTimers();

  // Update progress to show generation as active
  updateProgress('generation');

  // Phase 1: Analysis (complete immediately at 0s)
  updateSubPhase('analysis', 'completed');

  // Phase 2: Financial Model (starts immediately, completes at 3s)
  updateSubPhase('financial-model', 'processing');

  const timerId1 = setTimeout(() => {
    updateSubPhase('financial-model', 'completed');
  }, 3000);
  activeTimers.push(timerId1);

  // Phase 3: ROI Calculator (starts at 3s, completes at 6s)
  const timerId2 = setTimeout(() => {
    updateSubPhase('roi-calculator', 'processing');
  }, 3000);
  activeTimers.push(timerId2);

  const timerId3 = setTimeout(() => {
    updateSubPhase('roi-calculator', 'completed');
  }, 6000);
  activeTimers.push(timerId3);

  // Phase 4: Narrative (starts at 6s, completes at 8s)
  const timerId4 = setTimeout(() => {
    updateSubPhase('narrative', 'processing');
  }, 6000);
  activeTimers.push(timerId4);

  const timerId5 = setTimeout(() => {
    updateSubPhase('narrative', 'completed');
  }, 8000);
  activeTimers.push(timerId5);

  // Show "View Results" button at 8s
  const timerId6 = setTimeout(() => {
    const btn = document.querySelector('[data-action="continue-results"]');
    if (btn) {
      btn.style.display = 'inline-block';
      btn.classList.add('agent-animate-in', 'pulse-animation');

      // Scroll to button
      setTimeout(() => {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, 8000);
  activeTimers.push(timerId6);
}

// Update sub-phase status (for generation pipeline)
function updateSubPhase(phaseId, status) {
  const card = document.querySelector(`[data-phase-id="${phaseId}"]`);
  if (!card) {
    console.warn(`Phase card not found: ${phaseId}`);
    return;
  }

  const badge = card.querySelector('.agent-status-badge');
  const icon = card.querySelector('.phase-icon');

  if (!badge || !icon) {
    console.warn(`Badge or icon not found for phase: ${phaseId}`);
    return;
  }

  // Update badge
  badge.className = 'agent-status-badge';
  badge.classList.add(status);

  const badgeText = badge.querySelector('span');
  if (badgeText) {
    // Null guard: Ensure badgeText has textContent property before updating
    if (status === 'processing') {
      badgeText.textContent = 'Running (Active)';
    } else if (status === 'completed') {
      badgeText.textContent = 'Done (Complete)';
    } else {
      badgeText.textContent = 'Queued (Waiting)';
    }
  } else {
    console.warn(`Badge text span not found for phase: ${phaseId}`);
  }

  // Update icon
  if (status === 'completed') {
    icon.textContent = '✓';
    icon.classList.remove('agent-spinner', 'pipeline-icon-processing', 'pipeline-icon-waiting');
    icon.classList.add('pipeline-icon-complete');
  } else if (status === 'processing') {
    // Replace icon content with spinner
    icon.innerHTML = '<div class="agent-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>';
    icon.classList.remove('pipeline-icon-complete', 'pipeline-icon-waiting');
    icon.classList.add('pipeline-icon-processing');
  }
}

function startNarrativeAnimation() {
  // Clear any existing timers
  clearAllTimers();

  // Update progress to show results as active
  updateProgress('results');

  // Sequenced reveals with delays
  const delays = [
    { selector: '.results-success-message', delay: 500 },  // Success message
    { selector: '[data-scenario="conservative"]', delay: 1000 },  // Conservative
    { selector: '[data-scenario="recommended"]', delay: 1500 },  // Recommended (highlighted)
    { selector: '[data-scenario="aggressive"]', delay: 2000 },  // Aggressive
    { selector: '.results-pdf-downloads', delay: 2500 },  // PDF downloads
    { selector: '.results-actions', delay: 3000 }  // Action buttons
  ];

  delays.forEach(({ selector, delay }) => {
    revealElement(selector, delay);
  });
}

// Attach event listeners
function attachEventListeners() {
  // Continue to Briefing button
  const briefingBtn = document.querySelector('[data-action="continue-briefing"]');
  if (briefingBtn) {
    briefingBtn.addEventListener('click', () => advancePhase('briefing'));
  }

  // Continue to Scenarios button
  const scenariosBtn = document.querySelector('[data-action="continue-scenarios"]');
  if (scenariosBtn) {
    scenariosBtn.addEventListener('click', () => advancePhase('scenarios'));
  }

  // Continue to Narrative button
  const narrativeBtn = document.querySelector('[data-action="continue-narrative"]');
  if (narrativeBtn) {
    narrativeBtn.addEventListener('click', () => advancePhase('narrative'));
  }

  // Export Assessment button
  const exportBtn = document.querySelector('[data-action="export-assessment"]');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      // Export functionality will be implemented later
      console.log('Export assessment clicked');
      alert('Export functionality coming soon!');
    });
  }

  // Progress indicator clicks (optional navigation)
  const progressDots = document.querySelectorAll('.progress-dot');
  progressDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const phase = dot.dataset.phase;
      if (dot.classList.contains('completed') || dot.classList.contains('active')) {
        advancePhase(phase);
      }
    });
  });

  // PDF download handlers
  document.querySelectorAll('[data-download-pdf]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pdfPath = btn.getAttribute('data-download-pdf');
      if (pdfPath) {
        window.open(pdfPath, '_blank');
      } else {
        console.error('PDF path not specified for download button');
      }
    });
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Agent demo initialized');

  // Attach all event listeners
  attachEventListeners();

  // Start Discovery animation if on agent demo page
  const discoveryPhase = document.querySelector('[data-phase-content="discovery"]');
  if (discoveryPhase && getComputedStyle(discoveryPhase).display !== 'none') {
    updateProgress('discovery');
    startDiscoveryAnimation();
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  clearAllTimers();
});

// Export functions for external use
window.AgentDemo = {
  advancePhase,
  startDiscoveryAnimation,
  clearAllTimers,
  updateProgress
};
