/**
 * CV Optimizer Demo Application
 * Showcases all 30+ features interactively
 */

// Simulated data and state
let streamingActive = false;
let streamInterval = null;
let mlTrainingData = 0;
let currentProvider = 'openai';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initKeyboardShortcuts();
  showNotification('success', 'Demo loaded! Press Ctrl+/ for shortcuts');
});

// Theme Management
function initTheme() {
  const selector = document.getElementById('theme-selector');
  const savedTheme = localStorage.getItem('demo-theme') || 'light';
  
  selector.value = savedTheme;
  applyTheme(savedTheme);
  
  selector.addEventListener('change', (e) => {
    applyTheme(e.target.value);
    localStorage.setItem('demo-theme', e.target.value);
  });
}

function applyTheme(theme) {
  const themes = {
    light: {
      '--color-background': '#f9fafb',
      '--color-text-primary': '#111827'
    },
    dark: {
      '--color-background': '#111827',
      '--color-text-primary': '#f9fafb'
    },
    highContrast: {
      '--color-background': '#000000',
      '--color-text-primary': '#ffffff'
    },
    solarized: {
      '--color-background': '#fdf6e3',
      '--color-text-primary': '#073642'
    }
  };

  const colors = themes[theme];
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  document.body.style.background = colors['--color-background'];
  document.body.style.color = colors['--color-text-primary'];
}

// Tab Switching
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update sections
  document.querySelectorAll('.demo-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case '/':
          e.preventDefault();
          showShortcutsHelp();
          break;
        case 'o':
          e.preventDefault();
          if (document.getElementById('streaming').classList.contains('active')) {
            startStreaming();
          }
          break;
        case 's':
          e.preventDefault();
          if (document.getElementById('streaming').classList.contains('active')) {
            startStreaming();
          }
          break;
        case 'm':
          e.preventDefault();
          switchTab('ml');
          runMLDemo();
          break;
      }
    } else if (e.key === 'j') {
      // Next tab
      const tabs = Array.from(document.querySelectorAll('.tab'));
      const activeIndex = tabs.findIndex(t => t.classList.contains('active'));
      const nextIndex = (activeIndex + 1) % tabs.length;
      tabs[nextIndex].click();
    } else if (e.key === 'k') {
      // Previous tab
      const tabs = Array.from(document.querySelectorAll('.tab'));
      const activeIndex = tabs.findIndex(t => t.classList.contains('active'));
      const prevIndex = (activeIndex - 1 + tabs.length) % tabs.length;
      tabs[prevIndex].click();
    } else if (e.key === 'Escape') {
      hideShortcutsHelp();
    }
  });
}

function showShortcutsHelp() {
  document.getElementById('shortcuts-help').classList.add('visible');
  document.getElementById('overlay').classList.add('visible');
}

function hideShortcutsHelp() {
  document.getElementById('shortcuts-help').classList.remove('visible');
  document.getElementById('overlay').classList.remove('visible');
}

// Streaming Demo
function startStreaming() {
  if (streamingActive) return;

  streamingActive = true;
  document.getElementById('start-streaming').disabled = true;
  document.getElementById('stop-streaming').disabled = false;

  const output = document.getElementById('stream-output');
  const progress = document.getElementById('stream-progress');
  
  output.innerHTML = '<div class="log-entry" style="color: #3b82f6;">🚀 Streaming started...</div>';

  const messages = [
    "Analyzing CV structure...",
    "Extracting keywords from job description...",
    "Calculating ATS compatibility score...",
    "Generating optimization suggestions...",
    "Optimizing experience section...",
    "Enhancing skills section...",
    "Adding quantifiable achievements...",
    "Improving action verbs...",
    "Finalizing recommendations...",
    "✓ Complete! Generated 12 optimizations."
  ];

  let currentProgress = 0;
  let messageIndex = 0;

  streamInterval = setInterval(() => {
    if (messageIndex < messages.length) {
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${messages[messageIndex]}`;
      output.appendChild(entry);
      output.scrollTop = output.scrollHeight;

      currentProgress += 10;
      progress.style.width = currentProgress + '%';

      messageIndex++;

      if (messageIndex === messages.length) {
        stopStreaming();
        showNotification('success', 'Streaming completed successfully!');
      }
    }
  }, 500);
}

function stopStreaming() {
  streamingActive = false;
  document.getElementById('start-streaming').disabled = false;
  document.getElementById('stop-streaming').disabled = true;
  
  if (streamInterval) {
    clearInterval(streamInterval);
    streamInterval = null;
  }

  document.getElementById('stream-progress').style.width = '100%';
}

// ML Demo
function runMLDemo() {
  if (mlTrainingData < 20) {
    showNotification('warning', 'Insufficient training data. Train with sample data first!');
    return;
  }

  const output = document.getElementById('ml-output');
  output.innerHTML = '<div class="log-entry" style="color: #3b82f6;">🤖 Running ML provider selection...</div>';

  setTimeout(() => {
    const providers = ['openai', 'gemini', 'claude'];
    const scores = {
      openai: Math.random(),
      gemini: Math.random(),
      claude: Math.random()
    };

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    
    document.getElementById('ml-best-provider').textContent = best[0];
    document.getElementById('ml-confidence').textContent = (best[1] * 100).toFixed(0) + '%';

    providers.forEach(provider => {
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.innerHTML = `${provider}: <span style="color: ${provider === best[0] ? '#10b981' : '#6b7280'}">${(scores[provider] * 100).toFixed(1)}% confidence</span>`;
      output.appendChild(entry);
    });

    const finalEntry = document.createElement('div');
    finalEntry.className = 'log-entry';
    finalEntry.style.color = '#10b981';
    finalEntry.textContent = `✓ Selected ${best[0]} (${(best[1] * 100).toFixed(0)}% confidence)`;
    output.appendChild(entry);

    showNotification('success', `ML selected ${best[0]} as optimal provider`);
  }, 1000);
}

function trainML() {
  const output = document.getElementById('ml-output');
  output.innerHTML = '<div class="log-entry" style="color: #f59e0b;">📚 Training ML model with sample data...</div>';

  let count = 0;
  const interval = setInterval(() => {
    count += 5;
    mlTrainingData += 5;
    document.getElementById('ml-training-data').textContent = mlTrainingData;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `Processed ${count} training samples...`;
    output.appendChild(entry);

    if (count >= 50) {
      clearInterval(interval);
      const finalEntry = document.createElement('div');
      finalEntry.className = 'log-entry';
      finalEntry.style.color = '#10b981';
      finalEntry.textContent = '✓ Training complete! Model ready for predictions.';
      output.appendChild(finalEntry);
      showNotification('success', 'ML model trained successfully!');
    }
  }, 200);
}

// Web Workers Demo
function testWorker() {
  document.getElementById('worker-status').textContent = 'Processing...';
  const output = document.getElementById('worker-output');
  output.innerHTML = '<div class="log-entry" style="color: #3b82f6;">⚙️ Processing in Web Worker (background thread)...</div>';

  const startTime = Date.now();

  // Simulate heavy processing in worker
  setTimeout(() => {
    const duration = Date.now() - startTime;
    document.getElementById('worker-time').textContent = duration + 'ms';
    document.getElementById('worker-status').textContent = 'Idle';

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.style.color = '#10b981';
    entry.textContent = `✓ Processed 10,000 CV entries in ${duration}ms (UI remained responsive!)`;
    output.appendChild(entry);

    showNotification('success', 'Worker processing complete!');
  }, 1500);
}

function testMainThread() {
  const output = document.getElementById('worker-output');
  output.innerHTML = '<div class="log-entry" style="color: #f59e0b;">🐌 Processing on main thread (UI will freeze)...</div>';

  // Simulate blocking operation
  setTimeout(() => {
    const startTime = Date.now();
    
    // CPU-intensive operation
    let sum = 0;
    for (let i = 0; i < 100000000; i++) {
      sum += Math.sqrt(i);
    }

    const duration = Date.now() - startTime;
    document.getElementById('worker-time').textContent = duration + 'ms';

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.style.color = '#ef4444';
    entry.textContent = `⚠️ Processed in ${duration}ms (UI was blocked!)`;
    output.appendChild(entry);

    showNotification('warning', 'Main thread processing caused UI freeze!');
  }, 100);
}

// Metrics Demo
function refreshMetrics() {
  const animate = (element, target) => {
    const current = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
    const increment = (target - current) / 20;
    let value = current;

    const interval = setInterval(() => {
      value += increment;
      if ((increment > 0 && value >= target) || (increment < 0 && value <= target)) {
        element.textContent = element.textContent.replace(/[0-9,]+/, target.toLocaleString());
        clearInterval(interval);
      } else {
        element.textContent = element.textContent.replace(/[0-9,]+/, Math.floor(value).toLocaleString());
      }
    }, 50);
  };

  animate(document.getElementById('metrics-requests'), Math.floor(Math.random() * 500) + 1000);
  document.getElementById('metrics-latency').textContent = (Math.random() * 3 + 1).toFixed(1) + 's';
  document.getElementById('metrics-cost').textContent = '$' + (Math.random() * 10 + 5).toFixed(2);
  animate(document.getElementById('metrics-cache'), Math.floor(Math.random() * 30) + 60);

  showNotification('success', 'Metrics refreshed');
}

// Security Demo
async function encryptDemo() {
  const input = document.getElementById('encrypt-input').value;
  const password = document.getElementById('encrypt-password').value;

  if (!password) {
    showNotification('error', 'Please enter a password');
    return;
  }

  const output = document.getElementById('encrypt-output');
  output.innerHTML = '<div class="log-entry" style="color: #3b82f6;">🔒 Encrypting with AES-GCM 256...</div>';

  setTimeout(() => {
    // Simulate encryption
    const encrypted = btoa(input + '::encrypted::' + Date.now());
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.style.color = '#10b981';
    entry.textContent = '✓ Encrypted successfully!';
    output.appendChild(entry);

    const resultEntry = document.createElement('div');
    resultEntry.className = 'log-entry';
    resultEntry.style.wordBreak = 'break-all';
    resultEntry.textContent = 'Encrypted: ' + encrypted.substring(0, 100) + '...';
    output.appendChild(resultEntry);

    showNotification('success', 'Data encrypted successfully!');
  }, 500);
}

async function decryptDemo() {
  const password = document.getElementById('encrypt-password').value;

  if (!password) {
    showNotification('error', 'Please enter a password');
    return;
  }

  const output = document.getElementById('encrypt-output');
  const lastEntry = output.querySelector('.log-entry:last-child');
  
  if (!lastEntry || !lastEntry.textContent.includes('Encrypted:')) {
    showNotification('error', 'No encrypted data found. Encrypt first!');
    return;
  }

  output.innerHTML += '<div class="log-entry" style="color: #3b82f6;">🔓 Decrypting...</div>';

  setTimeout(() => {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.style.color = '#10b981';
    entry.textContent = '✓ Decrypted successfully! Original data restored.';
    output.appendChild(entry);

    showNotification('success', 'Data decrypted successfully!');
  }, 500);
}

// Plugins Demo
function loadPlugin(pluginName) {
  const statusElement = document.getElementById(`plugin-${pluginName}`);
  statusElement.textContent = 'Loading...';
  statusElement.style.color = '#f59e0b';

  const output = document.getElementById('plugin-output');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = `Loading ${pluginName} plugin...`;
  output.appendChild(entry);

  setTimeout(() => {
    statusElement.textContent = '✓ Loaded';
    statusElement.style.color = '#10b981';

    const successEntry = document.createElement('div');
    successEntry.className = 'log-entry';
    successEntry.style.color = '#10b981';
    successEntry.textContent = `✓ ${pluginName} plugin loaded successfully!`;
    output.appendChild(successEntry);

    showNotification('success', `${pluginName} plugin loaded!`);
  }, 1000);
}

// Notifications
function showNotification(type, message) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <strong>${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
    <p style="margin-top: 4px; color: #6b7280; font-size: 14px;">${message}</p>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Provider selector
document.getElementById('provider-selector').addEventListener('change', (e) => {
  currentProvider = e.target.value;
  showNotification('info', `Switched to ${currentProvider}`);
});

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
