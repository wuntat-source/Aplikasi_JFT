/* ================================================================
   SI JFT — app.js
   Navigation, Chart, Tabs, Modals, Toast
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   State
   ---------------------------------------------------------------- */
let currentPage = '';
let dashboardChartInstance = null;
let isDarkMode = false;

/* ----------------------------------------------------------------
   INIT
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Show login by default
  document.getElementById('page-login').style.display = 'flex';
  document.getElementById('page-login').style.flexDirection = 'column';
  document.getElementById('app-layout').classList.add('hidden');

  // Check saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    toggleTheme(true);
  }
});

/* ----------------------------------------------------------------
   LOGIN
   ---------------------------------------------------------------- */
function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-login');
  const username = document.getElementById('inp-username').value.trim();
  const password = document.getElementById('inp-password').value.trim();

  if (!username || !password) {
    showToast('error', 'Gagal Masuk', 'NIP/Username dan Password wajib diisi.');
    return;
  }

  // Loading state
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" style="animation:spin 1s linear infinite;width:18px;height:18px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
    Memverifikasi...
  `;
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = `Masuk <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>`;
    btn.disabled = false;
    showApp();
  }, 1200);
}

function showApp() {
  document.getElementById('page-login').style.display = 'none';
  document.getElementById('app-layout').classList.remove('hidden');
  navigate('dashboard');
  showToast('success', 'Berhasil Masuk', 'Selamat datang, Admin Pusat!');
}

function handleLogout() {
  document.getElementById('app-layout').classList.add('hidden');
  document.getElementById('page-login').style.display = 'flex';
  document.getElementById('page-login').style.flexDirection = 'column';
  currentPage = '';
  showToast('info', 'Keluar', 'Anda telah berhasil keluar dari sistem.');
}

function togglePassword() {
  const inp = document.getElementById('inp-password');
  const iconShow = document.getElementById('eye-icon-show');
  const iconHide = document.getElementById('eye-icon-hide');
  if (inp.type === 'password') {
    inp.type = 'text';
    iconShow.style.display = 'none';
    iconHide.style.display = 'block';
  } else {
    inp.type = 'password';
    iconShow.style.display = 'block';
    iconHide.style.display = 'none';
  }
}

/* ----------------------------------------------------------------
   NAVIGATION
   ---------------------------------------------------------------- */
function navigate(page) {
  if (currentPage === page) return;

  // Hide all pages
  document.querySelectorAll('.page-content').forEach(el => {
    el.style.display = 'none';
  });

  // Show target page
  const target = document.getElementById('page-' + page);
  if (!target) {
    console.warn('Page not found:', page);
    return;
  }

  target.style.display = 'block';
  currentPage = page;

  // Update nav active state (Desktop Sidebar)
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(el => {
    el.classList.remove('active');
  });
  
  // Update nav active state (Mobile Bottom Nav)
  document.querySelectorAll('.bottom-nav-item').forEach(el => {
    el.classList.remove('active');
  });

  const navMap = {
    'dashboard':       'nav-dashboard',
    'daftar-jft':      'nav-daftar-jft',
    'daftar-individu': 'nav-daftar-individu',
    'detail-individu': 'nav-daftar-individu',
    'usulan':          'nav-usulan',
    'laporan':         'nav-laporan',
    'pengaturan':      'nav-pengaturan',
  };
  
  const bnavMap = {
    'dashboard':       'bnav-dashboard',
    'daftar-jft':      'bnav-dashboard',
    'daftar-individu': 'bnav-daftar-individu',
    'detail-individu': 'bnav-daftar-individu',
    'usulan':          'bnav-usulan',
  };

  const navId = navMap[page];
  if (navId) {
    const navEl = document.getElementById(navId);
    if (navEl) navEl.classList.add('active');
  }
  
  const bnavId = bnavMap[page];
  if (bnavId) {
    const bnavEl = document.getElementById(bnavId);
    if (bnavEl) bnavEl.classList.add('active');
  }

  // Scroll to top
  const mainEl = document.querySelector('.app-main');
  if (mainEl) mainEl.scrollTop = 0;

  // Init chart on dashboard
  if (page === 'dashboard') {
    setTimeout(initDashboardChart, 100);
  }
}

/* ----------------------------------------------------------------
   DASHBOARD CHART
   ---------------------------------------------------------------- */
function initDashboardChart() {
  const canvas = document.getElementById('chart-distribusi');
  if (!canvas) return;

  // Destroy existing
  if (dashboardChartInstance) {
    dashboardChartInstance.destroy();
    dashboardChartInstance = null;
  }

  const ctx = canvas.getContext('2d');

  const labels = ['Widyaiswara', 'PTP', 'Pranata\nKomputer', 'Auditor', 'Pustakawan', 'Lainnya'];
  const data = [124, 86, 142, 128, 95, 272];

  const primaryColor = '#1A5F7A';
  const primaryDark = '#134B61';
  const lightBlue = '#E0F2FE';

  dashboardChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Widyaiswara', 'PTP', 'Pranata Komputer', 'Auditor', 'Pustakawan', 'Lainnya'],
      datasets: [{
        label: 'Jumlah JFT',
        data: data,
        backgroundColor: [
          primaryColor,
          primaryColor,
          primaryDark,
          primaryColor,
          primaryColor,
          '#6B9EAF',
        ],
        borderRadius: 4,
        borderSkipped: false,
        hoverBackgroundColor: primaryDark,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A1A2E',
          titleColor: '#E9ECEF',
          bodyColor: '#9CA3AF',
          borderColor: '#3D3D5C',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} Pegawai`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: '#6C757D',
            font: { size: 11, family: 'Inter' },
            maxRotation: 0,
          }
        },
        y: {
          grid: {
            color: '#F3F4F6',
            lineWidth: 1,
          },
          border: { display: false, dash: [4, 4] },
          ticks: {
            color: '#6C757D',
            font: { size: 11, family: 'Inter' },
            stepSize: 40,
          },
          min: 0,
          max: 320,
        }
      },
      animation: {
        duration: 600,
        easing: 'easeInOutQuart',
      }
    }
  });
}

/* ----------------------------------------------------------------
   TABS (Detail Individu)
   ---------------------------------------------------------------- */
function switchTab(tabId) {
  // Deactivate all tabs
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

  // Activate target
  const btn = document.getElementById('tab-' + tabId + '-btn');
  const pane = document.getElementById('tab-' + tabId);

  if (btn) btn.classList.add('active');
  if (pane) pane.classList.add('active');
}

/* ----------------------------------------------------------------
   THEME TOGGLE
   ---------------------------------------------------------------- */
function toggleTheme(forceDark = false) {
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');
  
  isDarkMode = forceDark || !isDarkMode;
  
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (iconSun) iconSun.style.display = 'block';
    if (iconMoon) iconMoon.style.display = 'none';
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (iconSun) iconSun.style.display = 'none';
    if (iconMoon) iconMoon.style.display = 'block';
    localStorage.setItem('theme', 'light');
  }
  
  // Refresh chart if it exists to update colors
  if (currentPage === 'dashboard') {
    initDashboardChart();
  }
}

/* ----------------------------------------------------------------
   SETTINGS TABS
   ---------------------------------------------------------------- */
function switchSettingsTab(clickedBtn, targetId) {
  // Deactivate all
  document.querySelectorAll('.settings-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#page-pengaturan > div:not(.page-head):not(.settings-tabs)').forEach(el => {
    el.style.display = 'none';
  });

  // Activate
  clickedBtn.classList.add('active');
  const target = document.getElementById(targetId);
  if (target) target.style.display = 'block';
}

/* ----------------------------------------------------------------
   MODALS
   ---------------------------------------------------------------- */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function closeModalOutside(event, id) {
  if (event.target.classList.contains('modal-overlay')) {
    closeModal(id);
  }
}

function saveModal(modalId, toastType, toastTitle, toastMsg) {
  closeModal(modalId);
  showToast(toastType, toastTitle, toastMsg);
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      if (modal.style.display === 'flex') {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }
});

/* ----------------------------------------------------------------
   TOAST NOTIFICATIONS
   ---------------------------------------------------------------- */
let toastCounter = 0;

function showToast(type, title, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  toastCounter++;
  const id = 'toast-' + toastCounter;

  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    error:   `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
    info:    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  };

  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <div class="toast-close" onclick="removeToast('${id}')">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
    </div>
  `;

  container.appendChild(toast);

  // Auto dismiss after 5s
  setTimeout(() => removeToast(id), 5000);
}

function removeToast(id) {
  const toast = document.getElementById(id);
  if (!toast) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 350);
}

/* ----------------------------------------------------------------
   SPINNER CSS (for login loading button)
   ---------------------------------------------------------------- */
(function addSpinnerStyle() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
})();

/* ----------------------------------------------------------------
   SEARCH FILTER (live filter on tables)
   ---------------------------------------------------------------- */
document.addEventListener('input', (e) => {
  if (!e.target.classList.contains('search-input')) return;

  const searchWrap = e.target.closest('.filter-bar') || e.target.closest('.card-header');
  if (!searchWrap) return;

  // Find the nearest table
  const card = searchWrap.nextElementSibling;
  if (!card) return;

  const rows = card.querySelectorAll('tbody tr');
  const query = e.target.value.toLowerCase();

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
});

/* ----------------------------------------------------------------
   PAGINATION BUTTONS (demo interaction)
   ---------------------------------------------------------------- */
document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('page-btn') || e.target.disabled) return;
  if (e.target.classList.contains('active')) return;

  // Text content check (only number buttons)
  const text = e.target.textContent.trim();
  if (!text || text === '…') return;

  const pagination = e.target.closest('.pagination');
  if (!pagination) return;

  pagination.querySelectorAll('.page-btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
});

/* ----------------------------------------------------------------
   CHECKBOX SELECT ALL
   ---------------------------------------------------------------- */
document.addEventListener('change', (e) => {
  if (e.target.type !== 'checkbox') return;

  const thead = e.target.closest('thead');
  if (!thead) return;

  const table = thead.closest('table');
  if (!table) return;

  const checked = e.target.checked;
  table.querySelectorAll('tbody input[type="checkbox"]').forEach(cb => {
    cb.checked = checked;
  });
});

/* ----------------------------------------------------------------
   ACCESSIBILITY: Focus visible skip link
   ---------------------------------------------------------------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});
