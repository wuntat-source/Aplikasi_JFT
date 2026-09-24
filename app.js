/* ================================================================
   SI JFT - app.js
   Navigation, Dynamic Data Rendering, Chart, Tabs, Modals, Toast
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   State
   ---------------------------------------------------------------- */
let currentPage = '';
let selectedPegawaiId = 1;
let individuCurrentPage = 1;
const individuPerPage = 10;
let dashboardChartInstance = null;
let isDarkMode = false;

/* ----------------------------------------------------------------
   INIT
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const pageLogin = document.getElementById('page-login');
  if (pageLogin) {
    pageLogin.style.display = 'flex';
    pageLogin.style.flexDirection = 'column';
  }
  const appLayout = document.getElementById('app-layout');
  if (appLayout) {
    appLayout.classList.add('hidden');
  }

  // Theme initialization
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    toggleTheme(true);
  }

  // Spotlight search keyboard listener
  initSpotlightSearch();

  if (typeof PEGAWAI_DATA !== 'undefined' && PEGAWAI_DATA.length > 0) {
    renderDashboard();
    renderDaftarJft();
    renderPetaJabatan();
    renderDaftarIndividu();
    renderDetailIndividu(selectedPegawaiId);
    renderUsulanPage();
    updateSidebarUsulanBadge();
  }
});

/* ----------------------------------------------------------------
   LOGIN & AUTH
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
  }, 900);
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

  document.querySelectorAll('.page-content').forEach(el => {
    el.style.display = 'none';
  });

  const target = document.getElementById('page-' + page);
  if (!target) {
    console.warn('Page not found:', page);
    return;
  }

  target.style.display = 'block';
  currentPage = page;

  document.querySelectorAll('#sidebar-nav .nav-item').forEach(el => {
    el.classList.remove('active');
  });

  document.querySelectorAll('.bottom-nav-item').forEach(el => {
    el.classList.remove('active');
  });

  const navMap = {
    'dashboard':       'nav-dashboard',
    'perhitungan-ak':  'nav-perhitungan-ak',
    'peta-jabatan':    'nav-peta-jabatan',
    'daftar-individu': 'nav-daftar-individu',
    'detail-individu': 'nav-daftar-individu',
    'usulan':          'nav-usulan',
    'laporan':         'nav-laporan',
    'pengaturan':      'nav-pengaturan',
  };

  const bnavMap = {
    'dashboard':       'bnav-dashboard',
    'perhitungan-ak':  'bnav-dashboard',
    'peta-jabatan':    'bnav-dashboard',
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

  const mainEl = document.querySelector('.app-main');
  if (mainEl) mainEl.scrollTop = 0;

  if (page === 'dashboard') {
    renderDashboard();
    setTimeout(initDashboardChart, 100);
  } else if (page === 'daftar-jft') {
    navigate('dashboard');
    setTimeout(() => {
      const el = document.getElementById('dashboard-jft-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return;
  } else if (page === 'perhitungan-ak') {
    renderPerhitunganAk();
  } else if (page === 'peta-jabatan') {
    renderPetaJabatan();
  } else if (page === 'daftar-individu') {
    renderDaftarIndividu();
  } else if (page === 'detail-individu') {
    renderDetailIndividu(selectedPegawaiId);
  } else if (page === 'usulan') {
    renderUsulanPage();
  }
}

/* ----------------------------------------------------------------
   DASHBOARD RENDERING & CHART
   ---------------------------------------------------------------- */
function renderDashboard() {
  if (typeof PEGAWAI_DATA === 'undefined') return;

  const totalEl = document.getElementById('kpi-total-jft');
  if (totalEl) totalEl.textContent = PEGAWAI_DATA.length;

  // Pegawai Terbaru on Dashboard (first 5)
  const tbodyPegawai = document.getElementById('tbody-dashboard-pegawai');
  if (tbodyPegawai) {
    const recent = PEGAWAI_DATA.slice(0, 5);
    tbodyPegawai.innerHTML = recent.map(p => `
      <tr>
        <td>
          <div class="avatar-cell">
            <div class="table-avatar ${p.avatar_color}">
              ${p.nip && p.nip !== '-' ? `<img src="foto/${p.nip}.jpg" alt="${p.nama}" onerror="this.remove();" loading="lazy">` : ''}
              <span>${p.initials}</span>
            </div>
            <div>
              <div class="cell-name">${p.nama}</div>
              <div style="font-size:11px;color:var(--text-muted)">NIP. ${p.nip}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:500">${p.jabatan}</div>
          <div style="font-size:11px;color:var(--text-muted)">Golongan: ${p.pagol}</div>
        </td>
        <td style="font-size:12px;color:var(--text-muted)">BBGTK Prov. Jawa Tengah</td>
        <td>
          <a href="#" class="link-action" onclick="viewPegawaiDetail(${p.id}); return false">Lihat Detail →</a>
        </td>
      </tr>
    `).join('');
  }

  // Render full integrated Daftar JFT table on Dashboard
  renderDashboardJft();
}

let dashboardJftCurrentPage = 1;
const dashboardJftPerPage = 10;

function handleDashboardJftFilter() {
  dashboardJftCurrentPage = 1;
  renderDashboardJft();
}

function renderDashboardJft() {
  const tbody = document.getElementById('tbody-dashboard-jft');
  if (!tbody) return;

  const searchInput = document.getElementById('search-dashboard-jft');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filterJenjang = document.getElementById('filter-dashboard-jft-jenjang');
  const jenjangVal = filterJenjang ? filterJenjang.value : 'Semua';

  const filterStatus = document.getElementById('filter-dashboard-jft-status');
  const statusVal = filterStatus ? filterStatus.value : 'Semua';

  const filtered = JFT_MASTER_LIST.filter(j => {
    const matchQuery = !query ||
      j.name.toLowerCase().includes(query) ||
      j.code.toLowerCase().includes(query) ||
      (j.rumpun && j.rumpun.toLowerCase().includes(query)) ||
      j.jenjang.toLowerCase().includes(query);

    const matchJenjang = (jenjangVal === 'Semua') || 
      j.jenjang.toLowerCase() === jenjangVal.toLowerCase() ||
      j.jenjang.toLowerCase().includes(jenjangVal.toLowerCase());

    const matchStatus = (statusVal === 'Semua') ||
      j.status.toLowerCase() === statusVal.toLowerCase();

    return matchQuery && matchJenjang && matchStatus;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / dashboardJftPerPage));

  if (dashboardJftCurrentPage > totalPages) {
    dashboardJftCurrentPage = totalPages;
  }

  const startIdx = (dashboardJftCurrentPage - 1) * dashboardJftPerPage;
  const endIdx = Math.min(startIdx + dashboardJftPerPage, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  // Update table info text
  const infoEl = document.getElementById('info-dashboard-jft');
  if (infoEl) {
    if (total === 0) {
      infoEl.textContent = 'Tidak ada jabatan fungsional yang cocok dengan filter.';
    } else {
      infoEl.textContent = `Menampilkan ${startIdx + 1} - ${endIdx} dari ${total} Jabatan Fungsional Tertentu`;
    }
  }

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:36px;color:var(--text-muted)">
          <div style="font-weight:500;color:var(--text)">Tidak ada jenis jabatan yang cocok dengan pencarian/filter.</div>
        </td>
      </tr>
    `;
    renderDashboardJftPagination(totalPages);
    return;
  }

  tbody.innerHTML = pageItems.map(j => {
    const asnCount = getJftAsnCount(j);
    return `
      <tr>
        <td><code style="font-size:11px;font-weight:600;color:var(--text-muted);background:var(--bg-secondary);padding:3px 6px;border-radius:4px;">${escapeHtml(j.code)}</code></td>
        <td>
          <strong style="color:var(--text);font-size:13.5px;">${escapeHtml(j.name)}</strong>
          ${j.rumpun ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Rumpun: ${escapeHtml(j.rumpun)}</div>` : ''}
        </td>
        <td>${getJenjangBadgeHtml(j.jenjang)}</td>
        <td><strong style="font-size:13px;color:var(--text)">${asnCount}</strong> <span style="font-size:11px;color:var(--text-muted)">Orang</span></td>
        <td><span style="font-weight:600;color:var(--primary)">${j.formasi}</span> <span style="font-size:11px;color:var(--text-muted)">Formasi</span></td>
        <td><span class="badge badge-aktif">${escapeHtml(j.status)}</span></td>
        <td>
          <a href="#" class="link-action" onclick="filterByJftAndNavigate('${escapeHtml(j.name)}'); return false">Lihat Pegawai →</a>
        </td>
      </tr>
    `;
  }).join('');

  renderDashboardJftPagination(totalPages);
}

function renderDashboardJftPagination(totalPages) {
  const container = document.getElementById('pagination-dashboard-jft');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <button class="page-btn" ${dashboardJftCurrentPage === 1 ? 'disabled' : ''} onclick="changeDashboardJftPage(${dashboardJftCurrentPage - 1})">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${i === dashboardJftCurrentPage ? 'active' : ''}" onclick="changeDashboardJftPage(${i})">${i}</button>
    `;
  }

  html += `
    <button class="page-btn" ${dashboardJftCurrentPage === totalPages ? 'disabled' : ''} onclick="changeDashboardJftPage(${dashboardJftCurrentPage + 1})">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
  `;

  container.innerHTML = html;
}

function changeDashboardJftPage(p) {
  dashboardJftCurrentPage = p;
  renderDashboardJft();
}

function initDashboardChart() {
  const canvas = document.getElementById('chart-distribusi');
  if (!canvas) return;

  if (dashboardChartInstance) {
    dashboardChartInstance.destroy();
    dashboardChartInstance = null;
  }

  if (typeof PEGAWAI_DATA === 'undefined') return;

  // 11 Definisi Kategori JFT Lengkap beserta Warna Unik Masing-Masing
  const JFT_CHART_CONFIG = [
    { key: 'ptp', label: 'PTP', fullName: 'Pengembang Teknologi Pembelajaran', color: '#0284C7', hoverColor: '#0369A1' },
    { key: 'wi', label: 'Widyaiswara', fullName: 'Widyaiswara', color: '#2563EB', hoverColor: '#1D4ED8' },
    { key: 'prakom', label: 'Pranata Komputer', fullName: 'Pranata Komputer', color: '#059669', hoverColor: '#047857' },
    { key: 'arsiparis', label: 'Arsiparis', fullName: 'Arsiparis', color: '#D97706', hoverColor: '#B45309' },
    { key: 'perencana', label: 'Perencana', fullName: 'Perencana', color: '#7C3AED', hoverColor: '#6D28D9' },
    { key: 'analis_sdm', label: 'Analis SDM', fullName: 'Analis SDM Aparatur', color: '#DC2626', hoverColor: '#B91C1C' },
    { key: 'analis_keu', label: 'Analis Keu', fullName: 'Analis Pengelolaan Keuangan APBN', color: '#0D9488', hoverColor: '#0F766E' },
    { key: 'analis_bangkom', label: 'Analis Bangkom', fullName: 'Analis Pengembangan Kompetensi ASN', color: '#EA580C', hoverColor: '#C2410C' },
    { key: 'statistisi', label: 'Statistisi', fullName: 'Statistisi', color: '#4F46E5', hoverColor: '#4338CA' },
    { key: 'pranata_humas', label: 'Pranata Humas', fullName: 'Pranata Hubungan Masyarakat', color: '#10B981', hoverColor: '#059669' },
    { key: 'pranata_sdm', label: 'Pranata SDM', fullName: 'Pranata SDM Aparatur', color: '#DB2777', hoverColor: '#BE185D' },
  ];

  const countMap = {};
  PEGAWAI_DATA.forEach(p => {
    const jab = (p.jabatan || '').toLowerCase();
    const kat = (p.kategori_jft || '').toLowerCase();
    if (jab.includes('pengembang teknologi') || kat === 'ptp') countMap['ptp'] = (countMap['ptp'] || 0) + 1;
    else if (jab.includes('widyaiswara') || kat === 'widyaiswara') countMap['wi'] = (countMap['wi'] || 0) + 1;
    else if (jab.includes('pranata komputer') || kat === 'pranata komputer') countMap['prakom'] = (countMap['prakom'] || 0) + 1;
    else if (jab.includes('arsiparis') || kat === 'arsiparis') countMap['arsiparis'] = (countMap['arsiparis'] || 0) + 1;
    else if (jab.includes('perencana') || kat === 'perencana') countMap['perencana'] = (countMap['perencana'] || 0) + 1;
    else if (jab.includes('sumber daya manusia aparatur') && jab.includes('analis')) countMap['analis_sdm'] = (countMap['analis_sdm'] || 0) + 1;
    else if (jab.includes('keuangan apbn') || jab.includes('keuangan')) countMap['analis_keu'] = (countMap['analis_keu'] || 0) + 1;
    else if (jab.includes('pengembangan kompetensi') || jab.includes('bangkom')) countMap['analis_bangkom'] = (countMap['analis_bangkom'] || 0) + 1;
    else if (jab.includes('statistisi') || kat === 'statistisi') countMap['statistisi'] = (countMap['statistisi'] || 0) + 1;
    else if (jab.includes('hubungan masyarakat') || jab.includes('humas') || kat.includes('humas')) countMap['pranata_humas'] = (countMap['pranata_humas'] || 0) + 1;
    else if (jab.includes('sumber daya manusia aparatur') && jab.includes('pranata')) countMap['pranata_sdm'] = (countMap['pranata_sdm'] || 0) + 1;
    else countMap['wi'] = (countMap['wi'] || 0) + 1;
  });

  const labels = JFT_CHART_CONFIG.map(item => item.label);
  const data = JFT_CHART_CONFIG.map(item => countMap[item.key] || 0);
  const bgColors = JFT_CHART_CONFIG.map(item => item.color);
  const hoverColors = JFT_CHART_CONFIG.map(item => item.hoverColor);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const tickColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : '#F1F5F9';

  const ctx = canvas.getContext('2d');
  dashboardChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Jumlah Pegawai JFT',
        data: data,
        backgroundColor: bgColors,
        hoverBackgroundColor: hoverColors,
        borderRadius: 6,
        borderSkipped: false,
        categoryPercentage: 0.88,
        barPercentage: 0.92,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#1E293B' : '#0F172A',
          titleColor: '#F8FAFC',
          titleFont: { size: 12, weight: '600', family: 'Inter' },
          bodyColor: '#E2E8F0',
          bodyFont: { size: 11, family: 'Inter' },
          borderColor: isDark ? '#334155' : '#475569',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              const idx = items[0].dataIndex;
              return JFT_CHART_CONFIG[idx].fullName;
            },
            label: (ctx) => {
              return ` ${ctx.parsed.y} Orang Pegawai`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: tickColor,
            font: { size: 11, family: 'Inter', weight: '500' },
            maxRotation: 40,
            minRotation: 20,
            autoSkip: false,
          }
        },
        y: {
          grid: {
            color: gridColor,
            lineWidth: 1,
          },
          border: { display: false, dash: [4, 4] },
          ticks: {
            color: tickColor,
            font: { size: 11, family: 'Inter' },
            stepSize: 5,
          },
          min: 0,
          max: 32,
        }
      },
      animation: {
        duration: 500,
        easing: 'easeInOutQuart',
      }
    }
  });
}

/* ----------------------------------------------------------------
   PERHITUNGAN AK & SIMULATOR PAGE
   ---------------------------------------------------------------- */
let pakCurrentPage = 1;
const pakItemsPerPage = 10;
let pakFilteredData = [];

function renderPerhitunganAk() {
  if (typeof PEGAWAI_DATA === 'undefined') return;

  // KPI Calculations
  let totalMemenuhi = 0;
  let totalKurang = 0;
  let sumAk = 0;

  PEGAWAI_DATA.forEach(p => {
    const totalAk = p.ak_total_2025 || 0;
    const target = p.kebutuhan_naik_pangkat || p.kebutuhan_naik_jenjang || 100;
    if (totalAk >= target) {
      totalMemenuhi++;
    } else {
      totalKurang++;
    }
    sumAk += totalAk;
  });

  const avgAk = PEGAWAI_DATA.length ? (sumAk / PEGAWAI_DATA.length).toFixed(1) : '0';

  const kpiTotal = document.getElementById('pak-kpi-total');
  const kpiMemenuhi = document.getElementById('pak-kpi-memenuhi');
  const kpiKurang = document.getElementById('pak-kpi-kurang');
  const kpiAvg = document.getElementById('pak-kpi-avg-ak');

  if (kpiTotal) kpiTotal.textContent = PEGAWAI_DATA.length;
  if (kpiMemenuhi) kpiMemenuhi.textContent = totalMemenuhi;
  if (kpiKurang) kpiKurang.textContent = totalKurang;
  if (kpiAvg) kpiAvg.textContent = avgAk;

  populateSimPegawaiDropdown();
  calcSimulasiAk();
  handlePakFilter();
}

function populateSimPegawaiDropdown() {
  const sel = document.getElementById('sim-pegawai-select');
  if (!sel || sel.options.length > 1) return;

  PEGAWAI_DATA.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.nama} (${p.jabatan} - Gol. ${p.pagol})`;
    sel.appendChild(opt);
  });
}

function handleSimPegawaiChange() {
  const sel = document.getElementById('sim-pegawai-select');
  if (!sel) return;
  const pId = parseInt(sel.value, 10);
  if (!pId) {
    resetSimulasiAk();
    return;
  }

  const p = PEGAWAI_DATA.find(item => item.id === pId);
  if (!p) return;

  // Set Jenjang
  const selJenjang = document.getElementById('sim-jenjang');
  if (selJenjang) {
    for (let i = 0; i < selJenjang.options.length; i++) {
      if (selJenjang.options[i].value === p.jenjang) {
        selJenjang.selectedIndex = i;
        break;
      }
    }
  }

  // Set Predikat
  const selPredikat = document.getElementById('sim-predikat');
  if (selPredikat) {
    const pred = (p.predikat_kinerja_2025 || '').toLowerCase();
    if (pred.includes('sangat baik')) selPredikat.value = '1.5';
    else if (pred.includes('baik')) selPredikat.value = '1.0';
    else if (pred.includes('cukup') || pred.includes('butuh perbaikan')) selPredikat.value = '0.75';
    else if (pred.includes('kurang')) selPredikat.value = '0.5';
    else selPredikat.value = '1.0';
  }

  // Set Bulan & AK Saat ini
  const inBulan = document.getElementById('sim-bulan');
  if (inBulan) inBulan.value = 12;

  const inAk = document.getElementById('sim-ak-saat-ini');
  if (inAk) inAk.value = p.ak_total_2025 || 0;

  calcSimulasiAk();
}

function calcSimulasiAk() {
  const selJenjang = document.getElementById('sim-jenjang');
  const selPredikat = document.getElementById('sim-predikat');
  const inBulan = document.getElementById('sim-bulan');
  const inAk = document.getElementById('sim-ak-saat-ini');

  if (!selJenjang || !selPredikat) return;

  const opt = selJenjang.options[selJenjang.selectedIndex];
  const koef = parseFloat(opt.getAttribute('data-koef')) || 37.5;
  const targetKp = parseFloat(opt.getAttribute('data-kp')) || 150;
  const targetKj = parseFloat(opt.getAttribute('data-kj')) || 450;

  const faktor = parseFloat(selPredikat.value) || 1.0;
  const bulan = Math.min(12, Math.max(1, parseInt(inBulan?.value || '12', 10)));
  const akSaatIni = parseFloat(inAk?.value || '0') || 0;

  // Rumus Konversi PermenPAN-RB 1/2023: Faktor * Koefisien * (Bulan / 12)
  const perolehanAk = faktor * koef * (bulan / 12);
  const totalAkBaru = akSaatIni + perolehanAk;

  // Render Elements
  const elKoef = document.getElementById('res-koef');
  const elFaktor = document.getElementById('res-faktor');
  const elPerolehan = document.getElementById('res-perolehan-ak');
  const elRumus = document.getElementById('res-rumus-text');
  const elTotalBaru = document.getElementById('res-total-baru');
  const elTarget = document.getElementById('res-target-ak');
  const elBadge = document.getElementById('res-status-badge');
  const elDesc = document.getElementById('res-status-desc');

  if (elKoef) elKoef.textContent = koef.toFixed(3);
  if (elFaktor) elFaktor.textContent = `${Math.round(faktor * 100)}%`;
  if (elPerolehan) elPerolehan.textContent = `+${perolehanAk.toFixed(3)}`;
  if (elRumus) elRumus.textContent = `Rumus: ${Math.round(faktor * 100)}% × ${koef.toFixed(2)} × (${bulan}/12) bln`;
  if (elTotalBaru) elTotalBaru.textContent = totalAkBaru.toFixed(3);
  if (elTarget) elTarget.textContent = targetKj > 0 ? `${targetKp.toFixed(1)} (KP) / ${targetKj.toFixed(1)} (KJ)` : `${targetKp.toFixed(1)} (KP)`;

  if (elBadge && elDesc) {
    const memenuhiKp = totalAkBaru >= targetKp;
    const memenuhiKj = targetKj > 0 && totalAkBaru >= targetKj;

    if (targetKj > 0) {
      if (memenuhiKj) {
        elBadge.className = 'badge badge-aktif';
        elBadge.textContent = 'Memenuhi Syarat Kenaikan Jenjang & Pangkat ✓';
        elDesc.textContent = `Total AK ${totalAkBaru.toFixed(3)} melampaui target Jenjang (${targetKj.toFixed(1)}) & Pangkat (${targetKp.toFixed(1)})`;
      } else if (memenuhiKp) {
        elBadge.className = 'badge badge-info';
        elBadge.textContent = 'Memenuhi Syarat Kenaikan Pangkat ✓';
        const kurangKj = (targetKj - totalAkBaru).toFixed(3);
        elDesc.textContent = `Memenuhi KP (${targetKp.toFixed(1)}), butuh +${kurangKj} AK lagi menuju Kenaikan Jenjang (${targetKj.toFixed(1)})`;
      } else {
        const kurangKp = (targetKp - totalAkBaru).toFixed(3);
        elBadge.className = 'badge badge-proses';
        elBadge.textContent = `Belum Memenuhi Syarat`;
        elDesc.textContent = `Butuh +${kurangKp} AK lagi menuju Kenaikan Pangkat (${targetKp.toFixed(1)})`;
      }
    } else {
      if (memenuhiKp) {
        elBadge.className = 'badge badge-aktif';
        elBadge.textContent = 'Memenuhi Syarat Kenaikan Pangkat ✓';
        elDesc.textContent = `Surplus +${(totalAkBaru - targetKp).toFixed(3)} AK di atas target Kenaikan Pangkat (${targetKp.toFixed(1)})`;
      } else {
        const kurangKp = (targetKp - totalAkBaru).toFixed(3);
        elBadge.className = 'badge badge-proses';
        elBadge.textContent = `Perlu +${kurangKp} AK lagi`;
        elDesc.textContent = `Menuju target Kenaikan Pangkat (${targetKp.toFixed(1)})`;
      }
    }
  }
}

function resetSimulasiAk() {
  const selPeg = document.getElementById('sim-pegawai-select');
  if (selPeg) selPeg.value = '';
  const selJenjang = document.getElementById('sim-jenjang');
  if (selJenjang) selJenjang.selectedIndex = 0;
  const selPredikat = document.getElementById('sim-predikat');
  if (selPredikat) selPredikat.value = '1.0';
  const inBulan = document.getElementById('sim-bulan');
  if (inBulan) inBulan.value = 12;
  const inAk = document.getElementById('sim-ak-saat-ini');
  if (inAk) inAk.value = 0;
  calcSimulasiAk();
}

function loadPegawaiIntoSimulasi(id) {
  const sel = document.getElementById('sim-pegawai-select');
  if (sel) {
    sel.value = id;
    handleSimPegawaiChange();
    const simCard = document.getElementById('sim-pegawai-select');
    if (simCard) {
      simCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showToast('info', 'Simulasi Dimuat', 'Data pegawai telah dimuat ke dalam kalkulator simulasi.');
  }
}

function handlePakFilter() {
  if (typeof PEGAWAI_DATA === 'undefined') return;

  const query = (document.getElementById('search-pak')?.value || '').toLowerCase().trim();
  const kat = document.getElementById('filter-pak-kategori')?.value || 'Semua';
  const status = document.getElementById('filter-pak-status')?.value || 'Semua';

  pakFilteredData = PEGAWAI_DATA.filter(p => {
    // Search
    const matchQuery = !query ||
      (p.nama && p.nama.toLowerCase().includes(query)) ||
      (p.nip && p.nip.includes(query)) ||
      (p.jabatan && p.jabatan.toLowerCase().includes(query));

    // Kategori JFT
    let matchKat = true;
    if (kat !== 'Semua') {
      const pKat = (p.kategori_jft || '').toLowerCase();
      const pJab = (p.jabatan || '').toLowerCase();
      const targetKat = kat.toLowerCase();
      matchKat = pKat.includes(targetKat) || pJab.includes(targetKat);
    }

    // Status Kelayakan
    let matchStatus = true;
    if (status !== 'Semua') {
      const totalAk = p.ak_total_2025 || 0;
      const target = p.kebutuhan_naik_pangkat || p.kebutuhan_naik_jenjang || 100;
      const isMemenuhi = totalAk >= target;
      if (status === 'Memenuhi' && !isMemenuhi) matchStatus = false;
      if (status === 'Belum' && isMemenuhi) matchStatus = false;
    }

    return matchQuery && matchKat && matchStatus;
  });

  pakCurrentPage = 1;
  renderPakTable();
}

function renderPakTable() {
  const tbody = document.getElementById('tbody-rekap-pak');
  const infoEl = document.getElementById('info-rekap-pak');
  const paginEl = document.getElementById('pagination-rekap-pak');
  if (!tbody) return;

  const total = pakFilteredData.length;
  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--text-muted)">Tidak ada data pegawai yang sesuai dengan filter.</td></tr>`;
    if (infoEl) infoEl.textContent = 'Menampilkan 0 dari 0 data';
    if (paginEl) paginEl.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(total / pakItemsPerPage);
  if (pakCurrentPage > totalPages) pakCurrentPage = totalPages;

  const start = (pakCurrentPage - 1) * pakItemsPerPage;
  const end = Math.min(start + pakItemsPerPage, total);
  const pageData = pakFilteredData.slice(start, end);

  tbody.innerHTML = pageData.map((p, idx) => {
    const rowNo = start + idx + 1;
    const totalAk = p.ak_total_2025 || 0;
    const target = p.kebutuhan_naik_pangkat || p.kebutuhan_naik_jenjang || 100;
    const isMemenuhi = totalAk >= target;

    return `
      <tr>
        <td>${rowNo}</td>
        <td>
          <div class="avatar-cell">
            <div class="table-avatar ${p.avatar_color}">
              ${p.nip && p.nip !== '-' ? `<img src="foto/${p.nip}.jpg" alt="${p.nama}" onerror="this.remove();" loading="lazy">` : ''}
              <span>${p.initials}</span>
            </div>
            <div>
              <div class="cell-name">${p.nama}</div>
              <div class="cell-sub">NIP. ${p.nip}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:500; font-size:12px;">${p.jabatan}</div>
          <div class="cell-sub">Golongan ${p.pagol} (${p.jenjang})</div>
        </td>
        <td style="font-family:monospace;font-size:12px;">${(p.ak_integrasi_2022 || 0).toFixed(3)}</td>
        <td style="font-family:monospace;font-size:12px;">${(p.ak_konversi_2023 || 0).toFixed(3)}</td>
        <td style="font-family:monospace;font-size:12px;">${(p.ak_konversi_2024 || 0).toFixed(3)}</td>
        <td style="font-family:monospace;font-size:12px;color:var(--primary);font-weight:600;">+${(p.ak_konversi_2025 || 0).toFixed(3)}</td>
        <td>
          <span style="font-family:monospace;font-size:13px;font-weight:700;color:var(--text);">${totalAk.toFixed(3)}</span>
        </td>
        <td>
          <span class="badge ${p.predikat_kinerja_2025 === 'Sangat Baik' ? 'badge-aktif' : 'badge-info'}">${p.predikat_kinerja_2025 || 'Baik'}</span>
        </td>
        <td style="font-size:12px;color:var(--text-muted);">
          ${target.toFixed(1)}
        </td>
        <td>
          <span class="badge ${isMemenuhi ? 'badge-aktif' : 'badge-proses'}">
            ${isMemenuhi ? 'Memenuhi ✓' : 'Akumulasi'}
          </span>
        </td>
        <td>
          <div style="display:flex;gap:4px;align-items:center;flex-wrap:nowrap;">
            <button class="btn btn-ghost btn-sm" title="Simulasi Perolehan AK Mandiri" onclick="loadPegawaiIntoSimulasi(${p.id})" style="font-size:11.5px;padding:4px 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:13px;height:13px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              Hitung
            </button>
            <button class="btn btn-primary btn-sm" title="Ajukan Usulan PAK / KP / KJ ke Usulan & Pengajuan" onclick="ajukanUsulanDariPegawai(${p.id})" style="font-size:11.5px;padding:4px 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:13px;height:13px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Ajukan
            </button>
            <button class="btn-icon" title="Lihat Profil Pegawai" onclick="viewPegawaiDetail(${p.id})">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (infoEl) {
    infoEl.textContent = `Menampilkan ${start + 1}–${end} dari ${total} data`;
  }

  // Pagination buttons
  if (paginEl) {
    let html = '';
    html += `<button class="page-btn" ${pakCurrentPage === 1 ? 'disabled' : ''} onclick="goToPakPage(${pakCurrentPage - 1})"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg></button>`;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= pakCurrentPage - 1 && i <= pakCurrentPage + 1)) {
        html += `<button class="page-btn ${i === pakCurrentPage ? 'active' : ''}" onclick="goToPakPage(${i})">${i}</button>`;
      } else if (i === pakCurrentPage - 2 || i === pakCurrentPage + 2) {
        html += `<button class="page-btn" disabled>...</button>`;
      }
    }
    html += `<button class="page-btn" ${pakCurrentPage === totalPages ? 'disabled' : ''} onclick="goToPakPage(${pakCurrentPage + 1})"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button>`;
    paginEl.innerHTML = html;
  }
}

function goToPakPage(p) {
  pakCurrentPage = p;
  renderPakTable();
}

function exportAkTableCsv() {
  if (!pakFilteredData || !pakFilteredData.length) {
    showToast('error', 'Gagal', 'Tidak ada data untuk diekspor.');
    return;
  }

  let csv = 'NO,NAMA,NIP,JABATAN,GOLONGAN,JENJANG,AK_INTEGRASI_2022,AK_KONVERSI_2023,AK_KONVERSI_2024,AK_KONVERSI_2025,TOTAL_AK_2025,PREDIKAT_2025,TARGET_KEBUTUHAN,STATUS_KELAYAKAN\n';
  pakFilteredData.forEach((p, idx) => {
    const totalAk = p.ak_total_2025 || 0;
    const target = p.kebutuhan_naik_pangkat || p.kebutuhan_naik_jenjang || 100;
    const isMemenuhi = totalAk >= target ? 'Memenuhi Syarat' : 'Belum Memenuhi';
    const row = [
      idx + 1,
      `"${(p.nama || '').replace(/"/g, '""')}"`,
      `"${p.nip || ''}"`,
      `"${(p.jabatan || '').replace(/"/g, '""')}"`,
      `"${p.pagol || ''}"`,
      `"${p.jenjang || ''}"`,
      (p.ak_integrasi_2022 || 0).toFixed(3),
      (p.ak_konversi_2023 || 0).toFixed(3),
      (p.ak_konversi_2024 || 0).toFixed(3),
      (p.ak_konversi_2025 || 0).toFixed(3),
      totalAk.toFixed(3),
      `"${p.predikat_kinerja_2025 || 'Baik'}"`,
      target.toFixed(1),
      `"${isMemenuhi}"`
    ];
    csv += row.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Rekap_Perhitungan_Angka_Kredit_JFT.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('success', 'Berhasil', 'File CSV Rekapitulasi Angka Kredit berhasil diunduh.');
}

/* ----------------------------------------------------------------
   DAFTAR JFT PAGE (JENJANG TERPERINCI)
   ---------------------------------------------------------------- */
let daftarJftCurrentPage = 1;
const daftarJftPerPage = 10;

const JFT_MASTER_LIST = [
  // Pengembang Teknologi Pembelajaran (PTP)
  { code: 'JFT-PTP-01', name: 'Pengembang Teknologi Pembelajaran Ahli Pertama', rumpun: 'Pengembang Teknologi Pembelajaran', jenjang: 'Ahli Pertama', count: 8, formasi: 20, status: 'Aktif' },
  { code: 'JFT-PTP-02', name: 'Pengembang Teknologi Pembelajaran Ahli Muda', rumpun: 'Pengembang Teknologi Pembelajaran', jenjang: 'Ahli Muda', count: 14, formasi: 15, status: 'Aktif' },
  { code: 'JFT-PTP-03', name: 'Pengembang Teknologi Pembelajaran Ahli Madya', rumpun: 'Pengembang Teknologi Pembelajaran', jenjang: 'Ahli Madya', count: 7, formasi: 12, status: 'Aktif' },

  // Widyaiswara
  { code: 'JFT-WI-01', name: 'Widyaiswara Ahli Pertama', rumpun: 'Widyaiswara', jenjang: 'Ahli Pertama', count: 5, formasi: 16, status: 'Aktif' },
  { code: 'JFT-WI-02', name: 'Widyaiswara Ahli Muda', rumpun: 'Widyaiswara', jenjang: 'Ahli Muda', count: 4, formasi: 10, status: 'Aktif' },
  { code: 'JFT-WI-03', name: 'Widyaiswara Ahli Madya', rumpun: 'Widyaiswara', jenjang: 'Ahli Madya', count: 10, formasi: 13, status: 'Aktif' },

  // Pranata Komputer
  { code: 'JFT-PK-01', name: 'Pranata Komputer Terampil', rumpun: 'Pranata Komputer', jenjang: 'Terampil', count: 1, formasi: 1, status: 'Aktif' },
  { code: 'JFT-PK-02', name: 'Pranata Komputer Mahir', rumpun: 'Pranata Komputer', jenjang: 'Mahir', count: 1, formasi: 1, status: 'Aktif' },
  { code: 'JFT-PK-03', name: 'Pranata Komputer Penyelia', rumpun: 'Pranata Komputer', jenjang: 'Penyelia', count: 1, formasi: 1, status: 'Aktif' },
  { code: 'JFT-PK-04', name: 'Pranata Komputer Ahli Pertama', rumpun: 'Pranata Komputer', jenjang: 'Ahli Pertama', count: 1, formasi: 3, status: 'Aktif' },
  { code: 'JFT-PK-05', name: 'Pranata Komputer Ahli Muda', rumpun: 'Pranata Komputer', jenjang: 'Ahli Muda', count: 0, formasi: 1, status: 'Aktif' },

  // Arsiparis
  { code: 'JFT-ARS-01', name: 'Arsiparis Terampil', rumpun: 'Arsiparis', jenjang: 'Terampil', count: 0, formasi: 1, status: 'Aktif' },
  { code: 'JFT-ARS-02', name: 'Arsiparis Mahir', rumpun: 'Arsiparis', jenjang: 'Mahir', count: 1, formasi: 1, status: 'Aktif' },
  { code: 'JFT-ARS-03', name: 'Arsiparis Penyelia', rumpun: 'Arsiparis', jenjang: 'Penyelia', count: 0, formasi: 2, status: 'Aktif' },
  { code: 'JFT-ARS-04', name: 'Arsiparis Ahli Pertama', rumpun: 'Arsiparis', jenjang: 'Ahli Pertama', count: 1, formasi: 2, status: 'Aktif' },
  { code: 'JFT-ARS-05', name: 'Arsiparis Ahli Muda', rumpun: 'Arsiparis', jenjang: 'Ahli Muda', count: 1, formasi: 1, status: 'Aktif' },
  { code: 'JFT-ARS-06', name: 'Arsiparis Ahli Madya', rumpun: 'Arsiparis', jenjang: 'Ahli Madya', count: 0, formasi: 1, status: 'Aktif' },

  // SDM Aparatur
  { code: 'JFT-SDM-01', name: 'Pranata Sumber Daya Manusia Aparatur Terampil', rumpun: 'SDM Aparatur', jenjang: 'Terampil', count: 0, formasi: 1, status: 'Aktif' },
  { code: 'JFT-SDM-02', name: 'Pranata Sumber Daya Manusia Aparatur Mahir', rumpun: 'SDM Aparatur', jenjang: 'Mahir', count: 0, formasi: 1, status: 'Aktif' },
  { code: 'JFT-SDM-03', name: 'Pranata Sumber Daya Manusia Aparatur Penyelia', rumpun: 'SDM Aparatur', jenjang: 'Penyelia', count: 1, formasi: 1, status: 'Aktif' },
  { code: 'JFT-SDM-04', name: 'Analis Sumber Daya Manusia Aparatur Ahli Pertama', rumpun: 'SDM Aparatur', jenjang: 'Ahli Pertama', count: 1, formasi: 2, status: 'Aktif' },
  { code: 'JFT-SDM-05', name: 'Analis Sumber Daya Manusia Aparatur Ahli Muda', rumpun: 'SDM Aparatur', jenjang: 'Ahli Muda', count: 0, formasi: 2, status: 'Aktif' },

  // Pengelolaan Keuangan APBN
  { code: 'JFT-KUG-01', name: 'Pranata Keuangan APBN Penyelia', rumpun: 'Pengelolaan Keuangan APBN', jenjang: 'Penyelia', count: 0, formasi: 3, status: 'Aktif' },
  { code: 'JFT-KUG-02', name: 'Analis Pengelolaan Keuangan APBN Ahli Pertama', rumpun: 'Pengelolaan Keuangan APBN', jenjang: 'Ahli Pertama', count: 0, formasi: 1, status: 'Aktif' },
  { code: 'JFT-KUG-03', name: 'Analis Pengelolaan Keuangan APBN Ahli Muda', rumpun: 'Pengelolaan Keuangan APBN', jenjang: 'Ahli Muda', count: 1, formasi: 3, status: 'Aktif' },

  // Perencana
  { code: 'JFT-REN-01', name: 'Perencana Ahli Pertama', rumpun: 'Perencana', jenjang: 'Ahli Pertama', count: 2, formasi: 3, status: 'Aktif' },
  { code: 'JFT-REN-02', name: 'Perencana Ahli Muda', rumpun: 'Perencana', jenjang: 'Ahli Muda', count: 0, formasi: 2, status: 'Aktif' },

  // Pranata Laboratorium Pendidikan (PLP)
  { code: 'JFT-PLP-01', name: 'Pranata Laboratorium Pendidikan Terampil', rumpun: 'Pranata Laboratorium Pendidikan', jenjang: 'Terampil', count: 0, formasi: 2, status: 'Aktif' },
  { code: 'JFT-PLP-02', name: 'Pranata Laboratorium Pendidikan Mahir', rumpun: 'Pranata Laboratorium Pendidikan', jenjang: 'Mahir', count: 0, formasi: 1, status: 'Aktif' },
  { code: 'JFT-PLP-03', name: 'Pranata Laboratorium Pendidikan Penyelia', rumpun: 'Pranata Laboratorium Pendidikan', jenjang: 'Penyelia', count: 0, formasi: 1, status: 'Aktif' },
  { code: 'JFT-PLP-04', name: 'Pranata Laboratorium Pendidikan Ahli Pertama', rumpun: 'Pranata Laboratorium Pendidikan', jenjang: 'Ahli Pertama', count: 0, formasi: 1, status: 'Aktif' },
  { code: 'JFT-PLP-05', name: 'Pranata Laboratorium Pendidikan Ahli Muda', rumpun: 'Pranata Laboratorium Pendidikan', jenjang: 'Ahli Muda', count: 0, formasi: 1, status: 'Aktif' },

  // Pustakawan
  { code: 'JFT-PUS-01', name: 'Asisten Perpustakaan Terampil', rumpun: 'Pustakawan', jenjang: 'Terampil', count: 0, formasi: 2, status: 'Aktif' },
  { code: 'JFT-PUS-02', name: 'Pustakawan Ahli Pertama', rumpun: 'Pustakawan', jenjang: 'Ahli Pertama', count: 0, formasi: 2, status: 'Aktif' },
  { code: 'JFT-PUS-03', name: 'Pustakawan Ahli Muda', rumpun: 'Pustakawan', jenjang: 'Ahli Muda', count: 0, formasi: 1, status: 'Aktif' },

  // Pranata Hubungan Masyarakat
  { code: 'JFT-HUM-01', name: 'Pranata Hubungan Masyarakat Terampil', rumpun: 'Pranata Hubungan Masyarakat', jenjang: 'Terampil', count: 0, formasi: 1, status: 'Aktif' },
  { code: 'JFT-HUM-02', name: 'Pranata Hubungan Masyarakat Ahli Pertama', rumpun: 'Pranata Hubungan Masyarakat', jenjang: 'Ahli Pertama', count: 1, formasi: 1, status: 'Aktif' },

  // Statistisi
  { code: 'JFT-STA-01', name: 'Statistisi Ahli Pertama', rumpun: 'Statistisi', jenjang: 'Ahli Pertama', count: 1, formasi: 2, status: 'Aktif' },
  { code: 'JFT-STA-02', name: 'Statistisi Ahli Muda', rumpun: 'Statistisi', jenjang: 'Ahli Muda', count: 0, formasi: 1, status: 'Aktif' },

  // Analis Pengembangan Kompetensi ASN
  { code: 'JFT-APK-01', name: 'Analis Pengembangan Kompetensi ASN Ahli Pertama', rumpun: 'Analis Pengembangan Kompetensi ASN', jenjang: 'Ahli Pertama', count: 1, formasi: 1, status: 'Aktif' },

  // Penata Laksana Barang
  { code: 'JFT-PLB-01', name: 'Penata Laksana Barang Terampil', rumpun: 'Penata Laksana Barang', jenjang: 'Terampil', count: 0, formasi: 2, status: 'Aktif' }
];

function getJenjangBadgeHtml(jenjang) {
  const j = (jenjang || '').toLowerCase().trim();
  if (j.includes('madya')) {
    return `<span class="badge" style="background:#EEF2FF;color:#4338CA;border:1px solid #C7D2FE;font-weight:600;font-size:11px;padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:#4F46E5;"></span>Ahli Madya</span>`;
  } else if (j.includes('muda')) {
    return `<span class="badge" style="background:#E0F2FE;color:#0369A1;border:1px solid #BAE6FD;font-weight:600;font-size:11px;padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:#0284C7;"></span>Ahli Muda</span>`;
  } else if (j.includes('pertama')) {
    return `<span class="badge" style="background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;font-weight:600;font-size:11px;padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:#059669;"></span>Ahli Pertama</span>`;
  } else if (j.includes('penyelia')) {
    return `<span class="badge" style="background:#FEF3C7;color:#B45309;border:1px solid #FDE68A;font-weight:600;font-size:11px;padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:#D97706;"></span>Penyelia</span>`;
  } else if (j.includes('mahir')) {
    return `<span class="badge" style="background:#FDF2F8;color:#BE185D;border:1px solid #FBCFE8;font-weight:600;font-size:11px;padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:#DB2777;"></span>Mahir</span>`;
  } else if (j.includes('terampil')) {
    return `<span class="badge" style="background:#F3F4F6;color:#374151;border:1px solid #E5E7EB;font-weight:600;font-size:11px;padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:#6B7280;"></span>Terampil</span>`;
  }
  return `<span class="badge badge-info">${escapeHtml(jenjang)}</span>`;
}

function getJftAsnCount(jItem) {
  if (typeof PEGAWAI_DATA === 'undefined' || !Array.isArray(PEGAWAI_DATA)) {
    return jItem.count || 0;
  }
  const nameNorm = (jItem.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const matched = PEGAWAI_DATA.filter(p => {
    const pJabNorm = (p.jabatan || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return pJabNorm === nameNorm || 
      (nameNorm.includes(pJabNorm) && pJabNorm.length > 6) ||
      (pJabNorm.includes(nameNorm) && nameNorm.length > 6);
  });
  return matched.length;
}

function handleDaftarJftFilter() {
  daftarJftCurrentPage = 1;
  renderDaftarJft();
}

function renderDaftarJft() {
  const tbody = document.getElementById('tbody-daftar-jft');
  if (!tbody) return;

  const searchInput = document.getElementById('search-daftar-jft');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filterJenjang = document.getElementById('filter-jft-jenjang');
  const jenjangVal = filterJenjang ? filterJenjang.value : 'Semua';

  const filterStatus = document.getElementById('filter-jft-status');
  const statusVal = filterStatus ? filterStatus.value : 'Semua';

  const filtered = JFT_MASTER_LIST.filter(j => {
    const matchQuery = !query ||
      j.name.toLowerCase().includes(query) ||
      j.code.toLowerCase().includes(query) ||
      (j.rumpun && j.rumpun.toLowerCase().includes(query)) ||
      j.jenjang.toLowerCase().includes(query);

    const matchJenjang = (jenjangVal === 'Semua') || 
      j.jenjang.toLowerCase() === jenjangVal.toLowerCase() ||
      j.jenjang.toLowerCase().includes(jenjangVal.toLowerCase());

    const matchStatus = (statusVal === 'Semua') ||
      j.status.toLowerCase() === statusVal.toLowerCase();

    return matchQuery && matchJenjang && matchStatus;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / daftarJftPerPage));

  if (daftarJftCurrentPage > totalPages) {
    daftarJftCurrentPage = totalPages;
  }

  const startIdx = (daftarJftCurrentPage - 1) * daftarJftPerPage;
  const endIdx = Math.min(startIdx + daftarJftPerPage, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  // Update table info text
  const infoEl = document.getElementById('info-daftar-jft');
  if (infoEl) {
    if (total === 0) {
      infoEl.textContent = 'Tidak ada jabatan fungsional yang cocok dengan filter.';
    } else {
      infoEl.textContent = `Menampilkan ${startIdx + 1} - ${endIdx} dari ${total} Jabatan Fungsional Tertentu`;
    }
  }

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:36px;color:var(--text-muted)">
          <div style="font-weight:500;color:var(--text)">Tidak ada jenis jabatan yang cocok dengan pencarian/filter.</div>
        </td>
      </tr>
    `;
    renderDaftarJftPagination(totalPages);
    return;
  }

  tbody.innerHTML = pageItems.map(j => {
    const asnCount = getJftAsnCount(j);
    return `
      <tr>
        <td><code style="font-size:11px;font-weight:600;color:var(--text-muted);background:var(--bg-secondary);padding:3px 6px;border-radius:4px;">${escapeHtml(j.code)}</code></td>
        <td>
          <strong style="color:var(--text);font-size:13.5px;">${escapeHtml(j.name)}</strong>
          ${j.rumpun ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Rumpun: ${escapeHtml(j.rumpun)}</div>` : ''}
        </td>
        <td>${getJenjangBadgeHtml(j.jenjang)}</td>
        <td><strong style="font-size:13px;color:var(--text)">${asnCount}</strong> <span style="font-size:11px;color:var(--text-muted)">Orang</span></td>
        <td><span style="font-weight:600;color:var(--primary)">${j.formasi}</span> <span style="font-size:11px;color:var(--text-muted)">Formasi</span></td>
        <td><span class="badge badge-aktif">${escapeHtml(j.status)}</span></td>
        <td>
          <a href="#" class="link-action" onclick="filterByJftAndNavigate('${escapeHtml(j.name)}'); return false">Lihat Pegawai →</a>
        </td>
      </tr>
    `;
  }).join('');

  renderDaftarJftPagination(totalPages);
}

function renderDaftarJftPagination(totalPages) {
  const container = document.getElementById('pagination-daftar-jft');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <button class="page-btn" ${daftarJftCurrentPage === 1 ? 'disabled' : ''} onclick="changeDaftarJftPage(${daftarJftCurrentPage - 1})">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${i === daftarJftCurrentPage ? 'active' : ''}" onclick="changeDaftarJftPage(${i})">${i}</button>
    `;
  }

  html += `
    <button class="page-btn" ${daftarJftCurrentPage === totalPages ? 'disabled' : ''} onclick="changeDaftarJftPage(${daftarJftCurrentPage + 1})">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
  `;

  container.innerHTML = html;
}

function changeDaftarJftPage(p) {
  daftarJftCurrentPage = p;
  renderDaftarJft();
}

/* ----------------------------------------------------------------
   FILTER BY JFT & DIRECT NAVIGATION
   ---------------------------------------------------------------- */
function filterByJftAndNavigate(jabatanName) {
  // 1. Set text search to specific jabatan
  const searchInput = document.getElementById('search-individu');
  if (searchInput) searchInput.value = jabatanName;

  // 2. Reset Golongan & Status filter
  const filterGol = document.getElementById('filter-gol');
  if (filterGol) filterGol.value = 'Semua';

  const filterStatus = document.getElementById('filter-status');
  if (filterStatus) filterStatus.value = 'Semua';

  // 3. Reset or match category filter
  const filterSelect = document.getElementById('filter-jft');
  if (filterSelect) {
    filterSelect.value = 'Semua';
  }

  // 4. Reset pagination to page 1
  individuCurrentPage = 1;

  // 5. Navigate to Daftar Individu and explicitly render
  navigate('daftar-individu');
  renderDaftarIndividu();

  // 6. Provide clear feedback toast
  showToast('info', 'Filter Jabatan', `Menampilkan data pegawai untuk: ${jabatanName}`);
}

/* ----------------------------------------------------------------
   DAFTAR INDIVIDU PAGE (FILTERING & PAGINATION)
   ---------------------------------------------------------------- */
function getFilteredIndividuData() {
  if (typeof PEGAWAI_DATA === 'undefined') return [];

  const searchInput = document.getElementById('search-individu');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filterJft = document.getElementById('filter-jft');
  const catVal = filterJft ? filterJft.value : 'Semua';

  const filterGol = document.getElementById('filter-gol');
  const golVal = filterGol ? filterGol.value : 'Semua';

  const filterStatus = document.getElementById('filter-status');
  const statusVal = filterStatus ? filterStatus.value : 'Semua';

  return PEGAWAI_DATA.filter(p => {
    // 1. Text Search matches Nama, NIP, Jabatan, Golongan, Satker
    const matchQuery = !query ||
      (p.nama && p.nama.toLowerCase().includes(query)) ||
      (p.nip && p.nip.toLowerCase().includes(query)) ||
      (p.jabatan && p.jabatan.toLowerCase().includes(query)) ||
      (p.pagol && p.pagol.toLowerCase().includes(query)) ||
      (p.satker && p.satker.toLowerCase().includes(query));

    // 2. Filter JFT / Jabatan
    let matchCat = (catVal === 'Semua');
    if (!matchCat) {
      const cLow = catVal.toLowerCase().trim();
      const jabLow = (p.jabatan || '').toLowerCase().trim();
      const katLow = (p.kategori_jft || '').toLowerCase().trim();

      if (cLow.includes('pengembang teknologi') || cLow === 'ptp') {
        matchCat = jabLow.includes('pengembang teknologi') || katLow === 'ptp';
      } else if (cLow === 'widyaiswara' || cLow === 'pranata komputer' || cLow === 'arsiparis' || cLow === 'perencana' || cLow === 'statistisi') {
        matchCat = jabLow.includes(cLow) || katLow.includes(cLow);
      } else if (jabLow.includes(cLow)) {
        matchCat = true;
      } else if (katLow === cLow) {
        matchCat = true;
      }
    }

    // 3. Filter Golongan
    const matchGol = (golVal === 'Semua') ||
      (p.pagol && p.pagol.toLowerCase() === golVal.toLowerCase()) ||
      (p.pangkat_golongan && p.pangkat_golongan.toLowerCase().includes(golVal.toLowerCase()));

    // 4. Filter Status
    const matchStatus = (statusVal === 'Semua') ||
      (p.status_pegawai && p.status_pegawai.toLowerCase() === statusVal.toLowerCase());

    return matchQuery && matchCat && matchGol && matchStatus;
  });
}

function handleIndividuFilter() {
  individuCurrentPage = 1;
  renderDaftarIndividu();
}

function renderDaftarIndividu() {
  const tbody = document.getElementById('tbody-daftar-individu');
  if (!tbody || typeof PEGAWAI_DATA === 'undefined') return;

  const filtered = getFilteredIndividuData();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / individuPerPage));

  if (individuCurrentPage > totalPages) {
    individuCurrentPage = totalPages;
  }

  const startIdx = (individuCurrentPage - 1) * individuPerPage;
  const endIdx = Math.min(startIdx + individuPerPage, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  // Update table info text
  const infoEl = document.getElementById('info-daftar-individu');
  if (infoEl) {
    if (total === 0) {
      infoEl.textContent = 'Tidak ada data pegawai yang sesuai filter.';
    } else {
      infoEl.textContent = `Menampilkan ${startIdx + 1} - ${endIdx} dari ${total} data pegawai`;
    }
  }

  // Render rows
  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:36px;color:var(--text-muted)">
          <svg xmlns="http://www.w3.org/2000/svg" style="width:36px;height:36px;margin-bottom:8px;stroke:var(--border)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01"/>
          </svg>
          <div style="font-weight:500;color:var(--text)">Tidak ada data pegawai yang cocok dengan filter.</div>
          <button class="btn btn-secondary btn-sm" style="margin-top:10px;" onclick="resetIndividuFilters()">Reset Semua Filter</button>
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = pageItems.map(p => {
      let badgeClass = 'badge-ptp';
      if (p.kategori_jft === 'Widyaiswara' || (p.jabatan && p.jabatan.includes('Widyaiswara'))) badgeClass = 'badge-wi';
      else if (p.kategori_jft === 'Pranata Komputer' || (p.jabatan && p.jabatan.includes('Pranata Komputer'))) badgeClass = 'badge-pk';
      else if (p.kategori_jft === 'Arsiparis' || (p.jabatan && p.jabatan.includes('Arsiparis'))) badgeClass = 'badge-pustak';
      else if (p.kategori_jft === 'Analis' || (p.jabatan && p.jabatan.includes('Analis'))) badgeClass = 'badge-analis';

      return `
        <tr>
          <td><input type="checkbox" style="accent-color:var(--primary)" value="${p.id}"></td>
          <td style="font-size:12px;color:var(--text-muted);font-family:monospace">${p.nip}</td>
          <td>
            <div class="avatar-cell">
              <div class="table-avatar ${p.avatar_color}">
                ${p.nip && p.nip !== '-' ? `<img src="foto/${p.nip}.jpg" alt="${p.nama}" onerror="this.remove();" loading="lazy">` : ''}
                <span>${p.initials}</span>
              </div>
              <div class="cell-name">${p.nama}</div>
            </div>
          </td>
          <td><span class="badge ${badgeClass}">${p.jabatan}</span></td>
          <td><strong>${p.pagol}</strong></td>
          <td style="font-size:12px;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.satker}">BBGTK Jawa Tengah</td>
          <td><span class="badge badge-aktif">${p.status_pegawai}</span></td>
          <td>
            <a href="#" class="link-action" onclick="viewPegawaiDetail(${p.id}); return false">Detail →</a>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render pagination
  renderPaginationButtons(totalPages);
}

function resetIndividuFilters() {
  const searchInput = document.getElementById('search-individu');
  if (searchInput) searchInput.value = '';

  const filterJft = document.getElementById('filter-jft');
  if (filterJft) filterJft.value = 'Semua';

  const filterGol = document.getElementById('filter-gol');
  if (filterGol) filterGol.value = 'Semua';

  const filterStatus = document.getElementById('filter-status');
  if (filterStatus) filterStatus.value = 'Semua';

  individuCurrentPage = 1;
  renderDaftarIndividu();
}

function renderPaginationButtons(totalPages) {
  const container = document.getElementById('pagination-daftar-individu');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <button class="page-btn" ${individuCurrentPage === 1 ? 'disabled' : ''} onclick="changeIndividuPage(${individuCurrentPage - 1})">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${i === individuCurrentPage ? 'active' : ''}" onclick="changeIndividuPage(${i})">${i}</button>
    `;
  }

  html += `
    <button class="page-btn" ${individuCurrentPage === totalPages ? 'disabled' : ''} onclick="changeIndividuPage(${individuCurrentPage + 1})">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
  `;

  container.innerHTML = html;
}

function changeIndividuPage(p) {
  individuCurrentPage = p;
  renderDaftarIndividu();
  const mainEl = document.querySelector('.app-main');
  if (mainEl) mainEl.scrollTop = 0;
}

/* ----------------------------------------------------------------
   DETAIL INDIVIDU DYNAMIC BINDING
   ---------------------------------------------------------------- */
function viewPegawaiDetail(id) {
  selectedPegawaiId = id;
  renderDetailIndividu(id);
  navigate('detail-individu');
}

function renderDetailIndividu(id) {
  if (typeof PEGAWAI_DATA === 'undefined') return;

  const p = PEGAWAI_DATA.find(x => x.id === id) || PEGAWAI_DATA[0];
  if (!p) return;

  // 1. Header Card
  const photoWrap = document.getElementById('detail-photo-wrap');
  if (photoWrap) {
    const fotoSrc = p.foto || (p.nip && p.nip !== '-' ? `foto/${p.nip}.jpg` : null);
    photoWrap.innerHTML = `
      <div id="detail-avatar" class="${p.avatar_color}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-size:22px;font-weight:700;position:relative;overflow:hidden;border-radius:8px;">
        ${fotoSrc ? `<img src="${fotoSrc}" alt="${p.nama}" onerror="this.remove();" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;border-radius:8px;">` : ''}
        <span>${p.initials}</span>
      </div>
    `;
  }

  const namaEl = document.getElementById('detail-nama');
  if (namaEl) namaEl.textContent = p.nama;

  const nipEl = document.getElementById('detail-nip');
  if (nipEl) nipEl.textContent = 'NIP. ' + p.nip;

  // 2. Status Cards
  const golEl = document.getElementById('detail-golongan');
  if (golEl) golEl.textContent = `${p.pangkat_golongan} (${p.pagol})`;

  const jabEl = document.getElementById('detail-jabatan');
  if (jabEl) jabEl.textContent = p.jabatan;

  const satkerEl = document.getElementById('detail-satker');
  if (satkerEl) satkerEl.textContent = p.satker;

  // Angka kredit progress
  const akCurrent = p.ak_total_2025 || p.ak_konversi_2024 || p.ak_integrasi_2022 || 0;
  const akTarget = p.kebutuhan_naik_pangkat || p.kebutuhan_naik_jenjang || 450;
  const akValEl = document.getElementById('detail-ak-val');
  const akBarEl = document.getElementById('detail-ak-bar');
  const akKekuranganEl = document.getElementById('detail-ak-kekurangan');
  const akPctEl = document.getElementById('detail-ak-pct');

  if (typeof akCurrent === 'number' && typeof akTarget === 'number') {
    const pct = Math.min(100, Math.round((akCurrent / akTarget) * 100));
    const sisa = Math.max(0, akTarget - akCurrent);

    if (akValEl) akValEl.innerHTML = `<span>${akCurrent.toLocaleString('id-ID', { minimumFractionDigits: 3 })}</span> / ${akTarget.toLocaleString('id-ID', { minimumFractionDigits: 3 })}`;
    if (akBarEl) akBarEl.style.width = pct + '%';
    if (akPctEl) akPctEl.textContent = pct + '%';

    if (akKekuranganEl) {
      if (sisa <= 0) {
        akKekuranganEl.innerHTML = `Status: <strong style="color:var(--success)">Memenuhi Syarat (${akCurrent.toLocaleString('id-ID', { minimumFractionDigits: 3 })} AK)</strong>`;
      } else {
        akKekuranganEl.innerHTML = `Kekurangan: <strong class="ak-kekurangan-val">${sisa.toLocaleString('id-ID', { minimumFractionDigits: 3 })} AK</strong>`;
      }
    }
  } else {
    if (akValEl) akValEl.innerHTML = `<span>${akCurrent || '-'}</span> / ${akTarget || '-'}`;
    if (akBarEl) akBarEl.style.width = '50%';
    if (akPctEl) akPctEl.textContent = '-';
    if (akKekuranganEl) akKekuranganEl.innerHTML = `Kekurangan: <strong>-</strong>`;
  }

  // 3. Tab 1: Identitas Personal
  const setTxt = (elemId, val) => {
    const el = document.getElementById(elemId);
    if (el) el.textContent = val || '-';
  };

  setTxt('dt-nama', p.nama);
  setTxt('dt-nip', p.nip);
  setTxt('dt-karpeg', p.karpeg || (p.nip && p.nip !== '-' ? (`L ${p.nip.substring(8, 14)}`) : '-'));
  setTxt('dt-nik', p.nik);
  setTxt('dt-ttl', `${p.tempat_lahir}, ${p.tgl_lahir_indo}`);
  setTxt('dt-jk', p.jenis_kelamin);
  setTxt('dt-usia', p.usia);
  setTxt('dt-pensiun', p.tgl_pensiun_indo);
  setTxt('dt-agama', p.agama);
  setTxt('dt-pendidikan', p.pendidikan);
  setTxt('dt-nohp', p.no_hp);
  setTxt('dt-darurat', p.no_darurat);
  setTxt('dt-email', p.email);
  setTxt('dt-email-dikbud', p.email_dikbud);

  // Tab 1: Administrasi Jabatan
  setTxt('dt-jenis-jab', p.jenis_jab);
  setTxt('dt-jabatan-jenjang', `${p.jabatan} (${p.jenjang})`);
  setTxt('dt-kelas-jab', p.kelas_jab);
  setTxt('dt-pangkat-gol', `${p.pangkat_golongan} (${p.pagol})`);
  setTxt('dt-tmt', p.tmt_indo);
  setTxt('dt-no-sk', p.nomor_sk);
  setTxt('dt-tgl-sk', p.tgl_sk_indo);
  setTxt('dt-lantik', p.tmt_lantik ? p.tmt_lantik : '-');
  setTxt('dt-satker', p.satker);
  setTxt('dt-usul-kp', p.usul_kp || '-');

  const predikatEl = document.getElementById('dt-predikat');
  if (predikatEl) {
    predikatEl.innerHTML = `<span class="badge badge-aktif">${p.predikat_kinerja_2025 || 'Baik'}</span>`;
  }

  // 4. Tab 2: Riwayat Jabatan
  const tbodyJab = document.getElementById('tbody-riwayat-jabatan');
  if (tbodyJab) {
    tbodyJab.innerHTML = `
      <tr class="jabatan-active-row">
        <td>1.</td>
        <td><strong>${p.jabatan}</strong></td>
        <td>${p.pagol}</td>
        <td>${p.satker}</td>
        <td>${p.tmt_indo || '-'}</td>
        <td><code>${p.nomor_sk || '-'}</code></td>
        <td><span class="badge badge-aktif">${p.status_pegawai}</span></td>
      </tr>
    `;
  }

  // 5. Tab 3: Riwayat Kinerja
  const tbodyKinerja = document.getElementById('tbody-riwayat-kinerja');
  if (tbodyKinerja) {
    tbodyKinerja.innerHTML = `
      <tr>
        <td>1.</td>
        <td><strong>2025</strong></td>
        <td>Januari - Desember 2025</td>
        <td><span class="badge badge-aktif">${p.predikat_kinerja_2025 || 'Sangat Baik'}</span></td>
        <td>${p.jenjang.includes('Madya') ? '37,5 (150%)' : (p.jenjang.includes('Muda') ? '25,0 (100%)' : '12,5 (100%)')}</td>
        <td><strong>${p.ak_konversi_2025 ? p.ak_konversi_2025.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : '-'}</strong></td>
        <td><span class="badge badge-aktif">Terverifikasi</span></td>
      </tr>
      <tr>
        <td>2.</td>
        <td><strong>2024</strong></td>
        <td>Januari - Desember 2024</td>
        <td><span class="badge badge-aktif">Baik</span></td>
        <td>${p.jenjang.includes('Madya') ? '37,5' : (p.jenjang.includes('Muda') ? '25,0' : '12,5')}</td>
        <td><strong>${p.ak_konversi_2024 ? (typeof p.ak_konversi_2024 === 'number' ? p.ak_konversi_2024.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : p.ak_konversi_2024) : '-'}</strong></td>
        <td><span class="badge badge-aktif">Terverifikasi</span></td>
      </tr>
      <tr>
        <td>3.</td>
        <td><strong>2023</strong></td>
        <td>Januari - Desember 2023</td>
        <td><span class="badge badge-aktif">Baik</span></td>
        <td>${p.jenjang.includes('Madya') ? '37,5' : (p.jenjang.includes('Muda') ? '25,0' : '12,5')}</td>
        <td><strong>${p.ak_konversi_2023 ? (typeof p.ak_konversi_2023 === 'number' ? p.ak_konversi_2023.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : p.ak_konversi_2023) : '-'}</strong></td>
        <td><span class="badge badge-aktif">Terverifikasi</span></td>
      </tr>
    `;
  }

  // 6. Tab 4: Riwayat Angka Kredit
  const tbodyAk = document.getElementById('tbody-riwayat-ak');
  if (tbodyAk) {
    tbodyAk.innerHTML = `
      <tr>
        <td><strong>AK Total 2025</strong></td>
        <td>Akumulasi Konversi Kinerja sd. Tahun 2025</td>
        <td><strong style="color:var(--primary)">${p.ak_total_2025 ? (typeof p.ak_total_2025 === 'number' ? p.ak_total_2025.toLocaleString('id-ID', { minimumFractionDigits: 3 }) : p.ak_total_2025) : '-'}</strong></td>
        <td><span class="badge badge-aktif">Ditetapkan</span></td>
      </tr>
      <tr>
        <td><strong>AK Konversi 2024</strong></td>
        <td>Penetapan Angka Kredit Konversi Periode 2024</td>
        <td><strong>${p.ak_konversi_2024 ? (typeof p.ak_konversi_2024 === 'number' ? p.ak_konversi_2024.toLocaleString('id-ID', { minimumFractionDigits: 3 }) : p.ak_konversi_2024) : '-'}</strong></td>
        <td><span class="badge badge-aktif">Ditetapkan</span></td>
      </tr>
      <tr>
        <td><strong>AK Konversi 2023</strong></td>
        <td>Penetapan Angka Kredit Konversi Periode 2023</td>
        <td><strong>${p.ak_konversi_2023 ? (typeof p.ak_konversi_2023 === 'number' ? p.ak_konversi_2023.toLocaleString('id-ID', { minimumFractionDigits: 3 }) : p.ak_konversi_2023) : '-'}</strong></td>
        <td><span class="badge badge-aktif">Ditetapkan</span></td>
      </tr>
      <tr>
        <td><strong>AK Integrasi 2022</strong></td>
        <td>PAK Integrasi PermenPAN-RB No. 1 Tahun 2023</td>
        <td><strong>${p.ak_integrasi_2022 ? (typeof p.ak_integrasi_2022 === 'number' ? p.ak_integrasi_2022.toLocaleString('id-ID', { minimumFractionDigits: 3 }) : p.ak_integrasi_2022) : '-'}</strong></td>
        <td><span class="badge badge-aktif">Ditetapkan</span></td>
      </tr>
      <tr style="background:var(--bg-card)">
        <td><strong>Kebutuhan Naik Jenjang</strong></td>
        <td>Target Angka Kredit Minimal Kenaikan Jenjang Jabatan</td>
        <td><strong>${p.kebutuhan_naik_jenjang ? p.kebutuhan_naik_jenjang.toLocaleString('id-ID') : '-'}</strong></td>
        <td><span class="badge badge-pk">Target Jenjang</span></td>
      </tr>
      <tr style="background:var(--bg-card)">
        <td><strong>Kebutuhan Naik Pangkat</strong></td>
        <td>Target Angka Kredit Minimal Kenaikan Pangkat/Golongan</td>
        <td><strong>${p.kebutuhan_naik_pangkat ? p.kebutuhan_naik_pangkat.toLocaleString('id-ID') : '-'}</strong></td>
        <td><span class="badge badge-pk">Target Pangkat</span></td>
      </tr>
    `;
  }
}

/* ----------------------------------------------------------------
   TABS (Detail Individu)
   ---------------------------------------------------------------- */
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

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

  if (currentPage === 'dashboard') {
    initDashboardChart();
  }
}

/* ----------------------------------------------------------------
   SETTINGS TABS
   ---------------------------------------------------------------- */
function switchSettingsTab(clickedBtn, targetId) {
  document.querySelectorAll('.settings-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#page-pengaturan > div:not(.page-head):not(.settings-tabs)').forEach(el => {
    el.style.display = 'none';
  });

  clickedBtn.classList.add('active');
  const target = document.getElementById(targetId);
  if (target) target.style.display = 'block';
}

/* ----------------------------------------------------------------
   DYNAMIC PROFILE EDIT & DEACTIVATE HANDLERS
   ---------------------------------------------------------------- */
function openEditProfilModal() {
  if (typeof PEGAWAI_DATA === 'undefined') return;
  const p = PEGAWAI_DATA.find(x => x.id === selectedPegawaiId) || PEGAWAI_DATA[0];
  if (!p) return;

  const setVal = (elemId, val) => {
    const el = document.getElementById(elemId);
    if (el) el.value = val || '';
  };

  setVal('edit-nama', p.nama);
  setVal('edit-nip', p.nip);
  setVal('edit-karpeg', p.karpeg || (p.nip && p.nip !== '-' ? (`L ${p.nip.substring(8, 14)}`) : ''));
  setVal('edit-gol', p.pagol || 'IV/c');
  setVal('edit-jabatan', p.jabatan);
  setVal('edit-satker', p.satker || 'Balai Besar GTK Provinsi Jawa Tengah, Kemendikdasmen');
  setVal('edit-status', p.status_pegawai || 'Aktif');
  setVal('edit-email-dikbud', p.email_dikbud !== '-' ? p.email_dikbud : '');
  setVal('edit-email', p.email !== '-' ? p.email : '');
  setVal('edit-nohp', p.no_hp !== '-' ? p.no_hp : '');
  setVal('edit-darurat', p.no_darurat !== '-' ? p.no_darurat : '');
  setVal('edit-pendidikan', p.pendidikan !== '-' ? p.pendidikan : '');
  setVal('edit-no-sk', p.nomor_sk !== '-' ? p.nomor_sk : '');

  openModal('modal-edit-profil');
}

function saveEditProfil() {
  if (typeof PEGAWAI_DATA === 'undefined') return;
  const p = PEGAWAI_DATA.find(x => x.id === selectedPegawaiId);
  if (!p) return;

  const getVal = (elemId) => {
    const el = document.getElementById(elemId);
    return el ? el.value.trim() : '';
  };

  const newNama = getVal('edit-nama');
  if (!newNama) {
    showToast('error', 'Validasi Gagal', 'Nama lengkap tidak boleh kosong.');
    return;
  }

  p.nama = newNama;
  p.karpeg = getVal('edit-karpeg') || p.karpeg || '-';
  p.pagol = getVal('edit-gol') || p.pagol;

  const golMap = {
    'IV/c': 'Pembina Utama Muda IV/c',
    'IV/b': 'Pembina Tingkat I IV/b',
    'IV/a': 'Pembina IV/a',
    'III/d': 'Penata Tingkat I III/d',
    'III/c': 'Penata III/c',
    'III/b': 'Penata Muda Tingkat I III/b',
    'III/a': 'Penata Muda III/a',
    'II/d': 'Pengatur Tingkat I II/d'
  };
  p.pangkat_golongan = golMap[p.pagol] || p.pagol;

  p.jabatan = getVal('edit-jabatan') || p.jabatan;

  if (p.jabatan.includes('Widyaiswara')) p.kategori_jft = 'Widyaiswara';
  else if (p.jabatan.includes('Pengembang Teknologi Pembelajaran')) p.kategori_jft = 'PTP';
  else if (p.jabatan.includes('Pranata Komputer')) p.kategori_jft = 'Pranata Komputer';
  else if (p.jabatan.includes('Arsiparis')) p.kategori_jft = 'Arsiparis';
  else if (p.jabatan.includes('Analis')) p.kategori_jft = 'Analis';
  else if (p.jabatan.includes('Perencana')) p.kategori_jft = 'Perencana';
  else if (p.jabatan.includes('Statistisi')) p.kategori_jft = 'Statistisi';

  p.satker = getVal('edit-satker') || p.satker;
  p.status_pegawai = getVal('edit-status') || p.status_pegawai;
  p.email_dikbud = getVal('edit-email-dikbud') || '-';
  p.email = getVal('edit-email') || '-';
  p.no_hp = getVal('edit-nohp') || '-';
  p.no_darurat = getVal('edit-darurat') || '-';
  p.pendidikan = getVal('edit-pendidikan') || '-';
  p.nomor_sk = getVal('edit-no-sk') || '-';

  closeModal('modal-edit-profil');
  renderDetailIndividu(selectedPegawaiId);
  renderDaftarIndividu();
  renderDashboard();
  showToast('success', 'Profil Diperbarui', `Data profil ASN ${p.nama} berhasil diperbarui.`);
}

function openNonaktifkanModal() {
  if (typeof PEGAWAI_DATA === 'undefined') return;
  const p = PEGAWAI_DATA.find(x => x.id === selectedPegawaiId) || PEGAWAI_DATA[0];
  if (!p) return;

  const txtEl = document.getElementById('nonaktif-text');
  if (txtEl) {
    txtEl.innerHTML = `Apakah Anda yakin ingin menonaktifkan <strong>${p.nama}</strong> (NIP. ${p.nip}) dari status aktif sistem JFT?`;
  }

  const alasanEl = document.getElementById('nonaktif-alasan');
  if (alasanEl) alasanEl.value = '';

  openModal('modal-nonaktifkan');
}

function confirmNonaktifkanPegawai() {
  if (typeof PEGAWAI_DATA === 'undefined') return;
  const p = PEGAWAI_DATA.find(x => x.id === selectedPegawaiId);
  if (!p) return;

  p.status_pegawai = 'Nonaktif';
  closeModal('modal-nonaktifkan');
  renderDetailIndividu(selectedPegawaiId);
  renderDaftarIndividu();
  renderDashboard();
  showToast('warning', 'Status Dinonaktifkan', `Status ASN ${p.nama} telah diubah menjadi Nonaktif.`);
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
  setTimeout(() => removeToast(id), 5000);
}

function removeToast(id) {
  const toast = document.getElementById(id);
  if (!toast) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 350);
}

/* ----------------------------------------------------------------
   SPINNER CSS
   ---------------------------------------------------------------- */
(function addSpinnerStyle() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
})();

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
   ACCESSIBILITY: Focus visible
   ---------------------------------------------------------------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

/* ----------------------------------------------------------------
   OFFICIAL REPORTS: PENETAPAN ANGKA KREDIT (PAK), AKUMULASI AK & KONVERSI
   (Sesuai Dokumen Resmi BKN / 29.PAK Konversi 2025- Manikowati.xlsx - PAK.pdf)
   ---------------------------------------------------------------- */
let currentDocPegawaiId = 20; // Default to Pegawai ID 20 (Astuti Subekti, M.Pd.)
let currentDocType = 'pak'; // 'pak', 'akumulasi', or 'konversi'

function openPakReportModal(pegawaiId) {
  currentDocType = 'pak';
  openOfficialDocModal(pegawaiId);
}

function openAkumulasiReportModal(pegawaiId) {
  currentDocType = 'akumulasi';
  openOfficialDocModal(pegawaiId);
}

function openKonversiReportModal(pegawaiId) {
  currentDocType = 'konversi';
  openOfficialDocModal(pegawaiId);
}

function openOfficialDocModal(pegawaiId, docType) {
  if (typeof PEGAWAI_DATA === 'undefined' || !PEGAWAI_DATA.length) return;

  populateDocPegawaiDropdown();

  if (docType) {
    currentDocType = docType;
  }

  if (pegawaiId) {
    currentDocPegawaiId = pegawaiId;
  } else if (!currentDocPegawaiId) {
    currentDocPegawaiId = PEGAWAI_DATA[19] ? PEGAWAI_DATA[19].id : PEGAWAI_DATA[0].id;
  }

  const selType = document.getElementById('doc-type-select');
  if (selType) selType.value = currentDocType;

  const sel = document.getElementById('doc-pegawai-select');
  if (sel) sel.value = currentDocPegawaiId;

  handleDocTypeChange();
  openModal('modal-laporan-konversi');
}

function handleDocTypeChange() {
  const selType = document.getElementById('doc-type-select');
  if (selType) currentDocType = selType.value;

  const titleEl = document.getElementById('modal-doc-title');
  const mainTitleEl = document.getElementById('print-doc-main-title');
  const sec1TitleEl = document.getElementById('print-doc-sec1-title');
  const periodeLabelEl = document.getElementById('print-doc-periode-label');
  const viewPak = document.getElementById('doc-view-pak');
  const viewAkumulasi = document.getElementById('doc-view-akumulasi');
  const viewKonversi = document.getElementById('doc-view-konversi');

  if (currentDocType === 'pak') {
    if (titleEl) titleEl.textContent = 'Penetapan Angka Kredit (PAK)';
    if (mainTitleEl) mainTitleEl.textContent = 'PENETAPAN ANGKA KREDIT';
    if (sec1TitleEl) sec1TitleEl.textContent = 'KETERANGAN PERORANGAN';
    if (periodeLabelEl) periodeLabelEl.textContent = 'Masa Penilaian:';
    if (viewPak) viewPak.style.display = 'block';
    if (viewAkumulasi) viewAkumulasi.style.display = 'none';
    if (viewKonversi) viewKonversi.style.display = 'none';
  } else if (currentDocType === 'akumulasi') {
    if (titleEl) titleEl.textContent = 'Laporan Akumulasi Angka Kredit';
    if (mainTitleEl) mainTitleEl.textContent = 'AKUMULASI ANGKA KREDIT';
    if (sec1TitleEl) sec1TitleEl.textContent = 'KETERANGAN PERORANGAN';
    if (periodeLabelEl) periodeLabelEl.textContent = 'Masa Penilaian:';
    if (viewPak) viewPak.style.display = 'none';
    if (viewAkumulasi) viewAkumulasi.style.display = 'block';
    if (viewKonversi) viewKonversi.style.display = 'none';
  } else {
    if (titleEl) titleEl.textContent = 'Laporan Konversi Predikat Kinerja ke Angka Kredit';
    if (mainTitleEl) mainTitleEl.textContent = 'KONVERSI PREDIKAT KINERJA KE ANGKA KREDIT';
    if (sec1TitleEl) sec1TitleEl.textContent = 'PEJABAT FUNGSIONAL YANG DINILAI';
    if (periodeLabelEl) periodeLabelEl.textContent = 'Periode :';
    if (viewPak) viewPak.style.display = 'none';
    if (viewAkumulasi) viewAkumulasi.style.display = 'none';
    if (viewKonversi) viewKonversi.style.display = 'block';
  }

  handleDocPegawaiChange();
}

function populateDocPegawaiDropdown() {
  const sel = document.getElementById('doc-pegawai-select');
  if (!sel || sel.options.length > 0) return;

  PEGAWAI_DATA.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.no}. ${p.nama} (${p.jabatan})`;
    sel.appendChild(opt);
  });
}

function handleDocPegawaiChange() {
  const sel = document.getElementById('doc-pegawai-select');
  if (!sel) return;

  const pId = parseInt(sel.value, 10) || currentDocPegawaiId || 1;
  currentDocPegawaiId = pId;

  const p = PEGAWAI_DATA.find(item => item.id === pId);
  if (!p) return;

  renderOfficialDoc(p);
}

function renderOfficialDoc(p) {
  if (!p) return;

  // 1. Header Jabatan
  const elJabUpper = document.getElementById('print-doc-jabatan-upper');
  if (elJabUpper) {
    const jabStr = (p.jabatan || 'Pengembang Teknologi Pembelajaran').toUpperCase();
    elJabUpper.textContent = `JABATAN FUNGSIONAL ${jabStr}`;
  }

  // 2. Identitas 8 Butir
  const elNama = document.getElementById('print-doc-nama');
  const elNip = document.getElementById('print-doc-nip');
  const elKarpeg = document.getElementById('print-doc-karpeg');
  const elTtl = document.getElementById('print-doc-ttl');
  const elJk = document.getElementById('print-doc-jk');
  const elPangkatTmt = document.getElementById('print-doc-pangkat-tmt');
  const elJabatanTmt = document.getElementById('print-doc-jabatan-tmt');
  const elUnitKerja = document.getElementById('print-doc-unit-kerja');

  if (elNama) elNama.textContent = p.nama || '-';
  if (elNip) elNip.textContent = p.nip || '-';
  if (elKarpeg) {
    if (p.karpeg && p.karpeg !== '-') elKarpeg.textContent = p.karpeg;
    else if (p.id === 20) elKarpeg.textContent = 'L 202063';
    else if (p.nip && p.nip !== '-') elKarpeg.textContent = `L ${p.nip.substring(8, 14)}`;
    else elKarpeg.textContent = '-';
  }

  if (elTtl) {
    const tgl = p.tgl_lahir ? p.tgl_lahir.split('-').reverse().join('-') : '-';
    elTtl.textContent = `${p.tempat_lahir || '-'} ${tgl}`;
  }

  if (elJk) {
    elJk.textContent = (p.jk_code === 'F' || p.jenis_kelamin === 'Perempuan') ? 'Wanita' : 'Pria';
  }

  if (elPangkatTmt) {
    const tmtPangkat = p.tmt ? p.tmt.split('-').reverse().join('-') : '-';
    elPangkatTmt.textContent = `${p.pangkat_golongan || '-'} /${tmtPangkat}`;
  }

  if (elJabatanTmt) {
    const tmtJab = p.tmt ? p.tmt.split('-').reverse().join('-') : '-';
    elJabatanTmt.textContent = `${p.jabatan || '-'} / ${tmtJab}`;
  }

  if (elUnitKerja) {
    elUnitKerja.textContent = 'Balai Besar Guru dan Tenaga Kependidikan Provinsi Jawa Tengah';
  }

  // 3. Section Perhitungan Nilai (PermenPAN-RB No. 1/2023)
  const jenjang = (p.jenjang || '').toLowerCase();
  let koef = 37.5;
  if (jenjang.includes('utama')) koef = 50.0;
  else if (jenjang.includes('madya')) koef = 37.5;
  else if (jenjang.includes('muda') || jenjang.includes('penyelia')) koef = 25.0;
  else if (jenjang.includes('pertama') || jenjang.includes('mahir')) koef = 12.5;
  else if (jenjang.includes('terampil')) koef = 5.0;

  const pred = (p.predikat_kinerja_2025 || 'Sangat Baik').toUpperCase();
  let pct = 150;
  let multiplier = 1.5;
  let predikatLabel = 'SANGAT BAIK';

  if (pred.includes('SANGAT')) {
    pct = 150;
    multiplier = 1.5;
    predikatLabel = 'SANGAT BAIK';
  } else if (pred.includes('BAIK')) {
    pct = 100;
    multiplier = 1.0;
    predikatLabel = 'BAIK';
  } else if (pred.includes('CUKUP') || pred.includes('PERBAIKAN')) {
    pct = 75;
    multiplier = 0.75;
    predikatLabel = 'CUKUP';
  } else if (pred.includes('KURANG')) {
    pct = 50;
    multiplier = 0.5;
    predikatLabel = 'KURANG';
  }

  const akDidapat = (p.ak_konversi_2025 && p.ak_konversi_2025 > 0) ? p.ak_konversi_2025 : (koef * multiplier);
  const akLama = (p.ak_konversi_2024 && p.ak_konversi_2024 > 0) ? p.ak_konversi_2024 : (p.ak_integrasi_2022 || 0);
  const akTotal = (p.ak_total_2025 && p.ak_total_2025 > 0) ? p.ak_total_2025 : (akLama + akDidapat);

  // Template A: Akumulasi Table fields
  const elThLama = document.getElementById('print-ak-th-lama');
  const elValLama = document.getElementById('print-ak-val-lama');
  const elThBaru = document.getElementById('print-ak-th-baru');
  const elPeriodikBaru = document.getElementById('print-ak-periodik-baru');
  const elPredBaru = document.getElementById('print-ak-pred-baru');
  const elPersenBaru = document.getElementById('print-ak-persen-baru');
  const elKoefBaru = document.getElementById('print-ak-koef-baru');
  const elValBaru = document.getElementById('print-ak-val-baru');
  const elValTotal = document.getElementById('print-ak-val-total');

  if (elThLama) elThLama.textContent = '2024';
  if (elValLama) elValLama.textContent = akLama.toFixed(3).replace('.', ',');
  if (elThBaru) elThBaru.textContent = '2025';
  if (elPeriodikBaru) elPeriodikBaru.textContent = 'JANUARI-DESEMBER';
  if (elPredBaru) elPredBaru.textContent = predikatLabel;
  if (elPersenBaru) elPersenBaru.textContent = `${pct}%`;
  if (elKoefBaru) elKoefBaru.textContent = koef.toFixed(2).replace('.', ',');
  if (elValBaru) elValBaru.textContent = akDidapat.toFixed(3).replace('.', ',');
  if (elValTotal) elValTotal.textContent = akTotal.toFixed(3).replace('.', ',');

  // Template B: Konversi Table fields
  const elPred = document.getElementById('print-doc-predikat');
  const elPct = document.getElementById('print-doc-prosentase');
  const elKoef = document.getElementById('print-doc-koefisien');
  const elAk = document.getElementById('print-doc-ak-didapat');

  if (elPred) elPred.textContent = predikatLabel;
  if (elPct) elPct.textContent = `${pct}%`;
  if (elKoef) elKoef.textContent = koef.toFixed(2).replace('.', ',');
  if (elAk) elAk.textContent = akDidapat.toFixed(3).replace('.', ',');

  // Template C: PAK (Penetapan Angka Kredit Resmi BKN)
  const elPakLama = document.getElementById('print-pak-lama');
  const elPakLamaJml = document.getElementById('print-pak-lama-jml');
  const elPakKonversiBaru = document.getElementById('print-pak-konversi-baru');
  const elPakKonversiJml = document.getElementById('print-pak-konversi-jml');
  const elPakTotalLama = document.getElementById('print-pak-total-lama');
  const elPakTotalBaru = document.getElementById('print-pak-total-baru');
  const elPakTotalKumulatif = document.getElementById('print-pak-total-kumulatif');
  const elPakMinKp = document.getElementById('print-pak-min-kp');
  const elPakMinKj = document.getElementById('print-pak-min-kj');
  const elPakSelisihKp = document.getElementById('print-pak-selisih-kp');
  const elPakSelisihKj = document.getElementById('print-pak-selisih-kj');
  const elPakStatusKelayakan = document.getElementById('print-pak-status-kelayakan');

  const minKpVal = p.kebutuhan_naik_pangkat || (p.pagol && p.pagol.startsWith('IV') ? 150 : 50);
  const minKjVal = p.kebutuhan_naik_jenjang || 450;
  const selisihKpVal = akTotal - minKpVal;
  const selisihKjVal = akTotal - minKjVal;

  if (elPakLama) elPakLama.textContent = akLama.toFixed(3).replace('.', ',');
  if (elPakLamaJml) elPakLamaJml.textContent = akLama.toFixed(3).replace('.', ',');
  if (elPakKonversiBaru) elPakKonversiBaru.textContent = akDidapat.toFixed(3).replace('.', ',');
  if (elPakKonversiJml) elPakKonversiJml.textContent = akDidapat.toFixed(3).replace('.', ',');
  if (elPakTotalLama) elPakTotalLama.textContent = akLama.toFixed(3).replace('.', ',');
  if (elPakTotalBaru) elPakTotalBaru.textContent = akDidapat.toFixed(3).replace('.', ',');
  if (elPakTotalKumulatif) elPakTotalKumulatif.textContent = akTotal.toFixed(3).replace('.', ',');
  if (elPakMinKp) elPakMinKp.textContent = minKpVal.toFixed(3).replace('.', ',');
  if (elPakMinKj) elPakMinKj.textContent = minKjVal.toFixed(3).replace('.', ',');
  if (elPakSelisihKp) {
    const formattedKp = (selisihKpVal > 0 ? '+' : '') + selisihKpVal.toFixed(3).replace('.', ',');
    elPakSelisihKp.textContent = formattedKp;
    elPakSelisihKp.style.color = selisihKpVal >= 0 ? '#059669' : '#DC2626';
  }
  if (elPakSelisihKj) {
    const formattedKj = (selisihKjVal > 0 ? '+' : '') + selisihKjVal.toFixed(3).replace('.', ',');
    elPakSelisihKj.textContent = formattedKj;
    elPakSelisihKj.style.color = selisihKjVal >= 0 ? '#059669' : '#DC2626';
  }
  if (elPakStatusKelayakan) {
    if (selisihKpVal >= 0 || selisihKjVal >= 0) {
      elPakStatusKelayakan.textContent = "'DAPAT DIPERTIMBANGKAN UNTUK KENAIKAN PANGKAT/JENJANG JABATAN SETINGKAT LEBIH TINGGI";
      elPakStatusKelayakan.style.color = '#059669';
    } else {
      elPakStatusKelayakan.textContent = "'BELUM DAPAT DIPERTIMBANGKAN UNTUK KENAIKAN PANGKAT/JENJANG JABATAN SETINGKAT LEBIH TINGGI";
      elPakStatusKelayakan.style.color = '#DC2626';
    }
  }

  updateDocValues();
}

function handlePeriodePresetChange() {
  const preset = document.getElementById('doc-periode-preset');
  const input = document.getElementById('doc-input-periode');
  if (!preset || !input) return;

  if (preset.value !== 'custom') {
    input.value = preset.value;
  }
  updateDocValues();
}

function syncPeriodeFromDoc(el) {
  const text = el.innerText || el.textContent;
  const input = document.getElementById('doc-input-periode');
  const preset = document.getElementById('doc-periode-preset');
  
  if (input) input.value = text.trim();
  if (preset) {
    let matched = false;
    for (let opt of preset.options) {
      if (opt.value === text.trim()) {
        preset.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched) {
      preset.value = 'custom';
    }
  }
}

function updateDocValues() {
  const inNomor = document.getElementById('doc-input-nomor')?.value || 'NOMOR :           /B7.3/KP.08.00/2025';
  const inPeriode = document.getElementById('doc-input-periode')?.value || '01-01-2025 s.d. 31-12-2025';
  const inTempat = document.getElementById('doc-input-tempat')?.value || 'Karanganyar';
  const inTgl = document.getElementById('doc-input-tgl-penetapan')?.value || '31 Desember 2025';
  const inPejabat = document.getElementById('doc-input-pejabat')?.value || 'Darmadi,S.Pd., M.Pd.';

  const elNomor = document.getElementById('print-doc-nomor');
  const elPeriode = document.getElementById('print-doc-periode');
  const elTempat = document.getElementById('print-doc-tempat');
  const elTgl = document.getElementById('print-doc-tgl-penetapan');
  const elPejabat = document.getElementById('print-doc-pejabat-ttd');

  if (elNomor) elNomor.textContent = inNomor;
  if (elPeriode && document.activeElement !== elPeriode) {
    elPeriode.textContent = inPeriode;
  }
  if (elTempat) elTempat.textContent = inTempat;
  if (elTgl) elTgl.textContent = inTgl;
  if (elPejabat) elPejabat.textContent = inPejabat;

  // Sync preset dropdown when typing directly into input
  const preset = document.getElementById('doc-periode-preset');
  if (preset && document.activeElement === document.getElementById('doc-input-periode')) {
    let matched = false;
    for (let opt of preset.options) {
      if (opt.value === inPeriode) {
        preset.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched) {
      preset.value = 'custom';
    }
  }
}

function toggleDocSettings() {
  const el = document.getElementById('doc-advanced-settings');
  if (el) {
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
  }
}

function printOfficialDoc() {
  window.print();
}

/* ================================================================
   THEME TOGGLE (DARK / LIGHT MODE)
   ================================================================ */
function toggleTheme(forceDark) {
  if (typeof forceDark === 'boolean') {
    isDarkMode = forceDark;
  } else {
    isDarkMode = !isDarkMode;
  }

  const sunIcon = document.getElementById('icon-sun');
  const moonIcon = document.getElementById('icon-moon');

  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    if (sunIcon) sunIcon.style.display = 'block';
    if (moonIcon) moonIcon.style.display = 'none';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
  }

  // Update chart if on dashboard
  if (currentPage === 'dashboard' && dashboardChartInstance) {
    setTimeout(initDashboardChart, 100);
  }
}

/* ================================================================
   MOBILE SIDEBAR DRAWER
   ================================================================ */
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.toggle('mobile-open');
    backdrop.classList.toggle('active');
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
}

// Automatically close mobile sidebar when navigating
const origNavigate = navigate;
navigate = function(page) {
  closeMobileSidebar();
  origNavigate(page);
};

/* ================================================================
   USULAN & PENGAJUAN SYSTEM (TERINTEGRASI DARI ANGKA KREDIT)
   ================================================================ */
const USULAN_STORAGE_KEY = 'si_jft_usulan_pengajuan_v1';
let usulanCurrentPage = 1;
const usulanPerPage = 10;

function generateDefaultUsulanData() {
  if (typeof PEGAWAI_DATA === 'undefined' || !Array.isArray(PEGAWAI_DATA)) return [];

  const list = [];
  let currentId = 1;

  // 1. Pegawai yang memiliki Usul KP eksplisit di data resmi
  PEGAWAI_DATA.forEach(p => {
    if (p.usul_kp && p.usul_kp !== '-' && p.usul_kp.trim() !== '') {
      list.push({
        id: currentId++,
        pegawai_id: p.id,
        nama: p.nama,
        nip: p.nip,
        jabatan: p.jabatan,
        pagol: p.pagol,
        jenis_usulan: 'Kenaikan Pangkat',
        rincian: `Kenaikan Pangkat (Periode ${p.usul_kp.replace('00:00:00', '').trim()}) • AK: ${p.ak_total_2025 ? p.ak_total_2025.toFixed(2) : '-'}`,
        ak_terakhir: p.ak_total_2025 || 0,
        target_ak: p.kebutuhan_naik_pangkat || 0,
        tanggal: '2026-08-15',
        tanggal_indo: '15 Agustus 2026',
        status: 'Menunggu Verifikasi',
        catatan: 'Dokumen SKP tahunan dan akumulasi PAK konversi telah lengkap.'
      });
    }
  });

  // 2. Pegawai yang AK Totalnya melampaui kebutuhan Kenaikan Jenjang (KJ)
  PEGAWAI_DATA.forEach(p => {
    if (p.ak_total_2025 >= p.kebutuhan_naik_jenjang && p.kebutuhan_naik_jenjang > 0 && list.length < 16) {
      let targetJenjang = 'Ahli Madya';
      if ((p.jenjang || '').includes('Pertama')) targetJenjang = 'Ahli Muda';
      else if ((p.jenjang || '').includes('Muda')) targetJenjang = 'Ahli Madya';
      else if ((p.jenjang || '').includes('Madya')) targetJenjang = 'Ahli Utama';

      list.push({
        id: currentId++,
        pegawai_id: p.id,
        nama: p.nama,
        nip: p.nip,
        jabatan: p.jabatan,
        pagol: p.pagol,
        jenis_usulan: 'Kenaikan Jenjang',
        rincian: `Kenaikan Jenjang ke ${targetJenjang} • AK Total: ${p.ak_total_2025.toFixed(2)} / Butuh: ${p.kebutuhan_naik_jenjang.toFixed(1)}`,
        ak_terakhir: p.ak_total_2025,
        target_ak: p.kebutuhan_naik_jenjang,
        tanggal: '2026-08-10',
        tanggal_indo: '10 Agustus 2026',
        status: 'Dalam Proses',
        catatan: 'Telah memenuhi syarat perolehan Angka Kredit dan formasi pada Peta Jabatan tersedia.'
      });
    }
  });

  // 3. Pegawai dengan Penetapan PAK Konversi 2025
  const samplePak = PEGAWAI_DATA.slice(0, 8);
  samplePak.forEach((p, idx) => {
    const statuses = ['Disetujui', 'Menunggu Verifikasi', 'Dalam Proses', 'Perlu Revisi'];
    const st = statuses[idx % statuses.length];
    list.push({
      id: currentId++,
      pegawai_id: p.id,
      nama: p.nama,
      nip: p.nip,
      jabatan: p.jabatan,
      pagol: p.pagol,
      jenis_usulan: 'Penetapan Angka Kredit',
      rincian: `Penetapan PAK Konversi 2025 (+${(p.ak_konversi_2025 || 0).toFixed(2)} AK • Predikat: ${p.predikat_kinerja_2025 || 'Baik'})`,
      ak_terakhir: p.ak_total_2025 || 0,
      target_ak: p.kebutuhan_naik_pangkat || 0,
      tanggal: `2026-07-${15 + (idx % 12)}`,
      tanggal_indo: `${15 + (idx % 12)} Juli 2026`,
      status: st,
      catatan: st === 'Perlu Revisi' ? 'Harap perbarui dokumen pendukung laporan kinerja SKP.' : 'Penetapan angka kredit konversi telah diverifikasi Tim Penilai.'
    });
  });

  return list;
}

function getUsulanData() {
  try {
    const raw = localStorage.getItem(USULAN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse usulan data from localStorage:', e);
  }
  const defaultList = generateDefaultUsulanData();
  saveUsulanData(defaultList);
  return defaultList;
}

function saveUsulanData(data) {
  try {
    localStorage.setItem(USULAN_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save usulan data:', e);
  }
  updateSidebarUsulanBadge();
}

function updateSidebarUsulanBadge() {
  const data = getUsulanData();
  const pendingCount = data.filter(u => u.status === 'Menunggu Verifikasi' || u.status === 'Diajukan').length;
  document.querySelectorAll('.nav-badge').forEach(badge => {
    badge.textContent = pendingCount;
  });
}

function getUsulanStatusBadgeHtml(status) {
  const s = (status || '').toLowerCase().trim();
  if (s.includes('menunggu') || s === 'diajukan') {
    return `<span class="badge badge-proses"><span style="width:6px;height:6px;border-radius:50%;background:#D97706;display:inline-block;margin-right:4px;"></span>Menunggu Verifikasi</span>`;
  } else if (s.includes('proses') || s.includes('diverifikasi')) {
    return `<span class="badge badge-info"><span style="width:6px;height:6px;border-radius:50%;background:#0284C7;display:inline-block;margin-right:4px;"></span>Dalam Proses</span>`;
  } else if (s.includes('disetujui') || s.includes('sk terbit') || s.includes('selesai')) {
    return `<span class="badge badge-aktif"><span style="width:6px;height:6px;border-radius:50%;background:#059669;display:inline-block;margin-right:4px;"></span>Disetujui ✓</span>`;
  } else if (s.includes('revisi') || s.includes('ditolak')) {
    return `<span class="badge badge-nonaktif"><span style="width:6px;height:6px;border-radius:50%;background:#DC2626;display:inline-block;margin-right:4px;"></span>Perlu Revisi</span>`;
  }
  return `<span class="badge badge-draft">${escapeHtml(status)}</span>`;
}

function handleUsulanFilter() {
  usulanCurrentPage = 1;
  renderUsulanPage();
}

function renderUsulanPage() {
  const tbody = document.getElementById('tbody-usulan');
  if (!tbody) return;

  populateUsulanPegawaiDropdown();
  const data = getUsulanData();

  // 1. Update Workflow Metric Cards
  const countMenunggu = data.filter(u => u.status === 'Menunggu Verifikasi' || u.status === 'Diajukan').length;
  const countProses = data.filter(u => u.status === 'Dalam Proses' || u.status === 'Diverifikasi').length;
  const countDisetujui = data.filter(u => u.status === 'Disetujui' || u.status === 'Disetujui ✓' || u.status === 'SK Terbit').length;
  const countRevisi = data.filter(u => u.status === 'Perlu Revisi' || u.status === 'Ditolak').length;

  const elMenunggu = document.getElementById('wf-num-menunggu');
  const elProses = document.getElementById('wf-num-proses');
  const elDisetujui = document.getElementById('wf-num-disetujui');
  const elRevisi = document.getElementById('wf-num-revisi');

  if (elMenunggu) elMenunggu.textContent = countMenunggu;
  if (elProses) elProses.textContent = countProses;
  if (elDisetujui) elDisetujui.textContent = countDisetujui;
  if (elRevisi) elRevisi.textContent = countRevisi;

  // 2. Filter data
  const searchInput = document.getElementById('search-usulan');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filterStatus = document.getElementById('filter-usulan-status');
  const statusVal = filterStatus ? filterStatus.value : 'Semua';

  const filterJenis = document.getElementById('filter-usulan-jenis');
  const jenisVal = filterJenis ? filterJenis.value : 'Semua';

  const filtered = data.filter(u => {
    const matchQuery = !query ||
      (u.nama && u.nama.toLowerCase().includes(query)) ||
      (u.nip && u.nip.includes(query)) ||
      (u.jenis_usulan && u.jenis_usulan.toLowerCase().includes(query)) ||
      (u.rincian && u.rincian.toLowerCase().includes(query));

    let matchStatus = (statusVal === 'Semua');
    if (!matchStatus) {
      if (statusVal === 'Menunggu Verifikasi') matchStatus = (u.status === 'Menunggu Verifikasi' || u.status === 'Diajukan');
      else if (statusVal === 'Dalam Proses') matchStatus = (u.status === 'Dalam Proses' || u.status === 'Diverifikasi');
      else if (statusVal === 'Disetujui') matchStatus = (u.status === 'Disetujui' || u.status === 'Disetujui ✓' || u.status === 'SK Terbit');
      else if (statusVal === 'Perlu Revisi') matchStatus = (u.status === 'Perlu Revisi' || u.status === 'Ditolak');
      else matchStatus = (u.status === statusVal);
    }

    let matchJenis = (jenisVal === 'Semua');
    if (!matchJenis) {
      matchJenis = (u.jenis_usulan && u.jenis_usulan.toLowerCase().includes(jenisVal.toLowerCase()));
    }

    return matchQuery && matchStatus && matchJenis;
  });

  // 3. Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / usulanPerPage));

  if (usulanCurrentPage > totalPages) {
    usulanCurrentPage = totalPages;
  }

  const startIdx = (usulanCurrentPage - 1) * usulanPerPage;
  const endIdx = Math.min(startIdx + usulanPerPage, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  const infoEl = document.getElementById('info-usulan');
  if (infoEl) {
    if (total === 0) {
      infoEl.textContent = 'Tidak ada usulan yang sesuai filter.';
    } else {
      infoEl.textContent = `Menampilkan ${startIdx + 1} - ${endIdx} dari ${total} Usulan & Pengajuan`;
    }
  }

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:36px;color:var(--text-muted)">
          <div style="font-weight:500;color:var(--text)">Tidak ada data usulan yang cocok dengan filter.</div>
        </td>
      </tr>
    `;
    renderUsulanPagination(totalPages);
    return;
  }

  tbody.innerHTML = pageItems.map((u, idx) => {
    let actionButtons = '';
    if (u.status === 'Menunggu Verifikasi' || u.status === 'Diajukan') {
      actionButtons = `
        <button class="btn btn-primary btn-sm" onclick="verifikasiUsulan(${u.id})">Verifikasi</button>
        <button class="btn btn-ghost btn-sm" onclick="revisiUsulan(${u.id})">Minta Revisi</button>
      `;
    } else if (u.status === 'Dalam Proses' || u.status === 'Diverifikasi') {
      actionButtons = `
        <button class="btn btn-success btn-sm" style="background:#059669;color:#fff;border:none;" onclick="setujuiUsulan(${u.id})">Setujui / Terbitkan SK</button>
        <button class="btn btn-ghost btn-sm" style="color:#D97706;" onclick="batalkanVerifikasiUsulan(${u.id})" title="Batalkan status verifikasi dan kembalikan ke status Menunggu Verifikasi">Batal Verifikasi</button>
        <button class="btn btn-ghost btn-sm" onclick="revisiUsulan(${u.id})">Revisi</button>
      `;
    } else if (u.status === 'Perlu Revisi') {
      actionButtons = `
        <button class="btn btn-secondary btn-sm" onclick="verifikasiUsulan(${u.id})">Ajukan Ulang</button>
      `;
    } else {
      actionButtons = `
        <button class="btn btn-ghost btn-sm" onclick="showToast('info', 'SK Terbit', 'Usulan telah berstatus SK Terbit / Disetujui.')">Lihat SK</button>
        <button class="btn btn-ghost btn-sm" style="color:#DC2626;" onclick="batalkanPersetujuanUsulan(${u.id})" title="Batalkan status persetujuan SK">Batal Setuju</button>
      `;
    }

    const docButtons = u.pegawai_id ? `
      <button class="btn btn-ghost btn-sm" title="Lihat Dokumen Penetapan Angka Kredit (PAK) Resmi BKN" onclick="openPakReportModal(${u.pegawai_id})" style="color:#059669;font-weight:600;padding:4px 7px;font-size:11.5px;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:13px;height:13px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        PAK
      </button>
      <button class="btn btn-ghost btn-sm" title="Lihat Laporan Akumulasi Angka Kredit Resmi BKN" onclick="openAkumulasiReportModal(${u.pegawai_id})" style="color:#0284c7;font-weight:600;padding:4px 7px;font-size:11.5px;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:13px;height:13px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Akumulasi AK
      </button>
      <button class="btn btn-ghost btn-sm" title="Lihat Laporan Konversi Predikat Kinerja ke Angka Kredit" onclick="openKonversiReportModal(${u.pegawai_id})" style="color:var(--primary);font-weight:600;padding:4px 7px;font-size:11.5px;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:13px;height:13px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Konversi SKP
      </button>
    ` : '';

    const pegawaiLink = u.pegawai_id ? `viewPegawaiDetail(${u.pegawai_id})` : `filterByJftAndNavigate('${escapeHtml(u.jabatan || '')}')`;

    return `
      <tr>
        <td>${startIdx + idx + 1}</td>
        <td>
          <div class="cell-name"><a href="#" style="color:var(--primary);text-decoration:none;font-weight:600;" onclick="${pegawaiLink}; return false;">${escapeHtml(u.nama)}</a></div>
          <div class="cell-sub" style="font-family:monospace;font-size:11px;color:var(--text-muted);">NIP. ${escapeHtml(u.nip || '-')} • Gol. ${escapeHtml(u.pagol || '-')}</div>
        </td>
        <td>
          <strong style="color:var(--text);font-size:13px;">${escapeHtml(u.jenis_usulan)}</strong>
          <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(u.jabatan || '')}</div>
        </td>
        <td>
          <div style="font-size:12.5px;color:var(--text);">${escapeHtml(u.rincian)}</div>
          ${u.catatan ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;"><em>${escapeHtml(u.catatan)}</em></div>` : ''}
        </td>
        <td style="font-size:12px;color:var(--text-muted);white-space:nowrap;">${escapeHtml(u.tanggal_indo || u.tanggal)}</td>
        <td>${getUsulanStatusBadgeHtml(u.status)}</td>
        <td>
          <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">
            ${actionButtons}
            ${docButtons}
            <button class="btn btn-ghost btn-sm" title="Lihat Profil & Angka Kredit Pegawai" onclick="${pegawaiLink}; return false;" style="padding:4px 7px;font-size:11.5px;">Profil →</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderUsulanPagination(totalPages);
}

function renderUsulanPagination(totalPages) {
  const container = document.getElementById('pagination-usulan');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <button class="page-btn" ${usulanCurrentPage === 1 ? 'disabled' : ''} onclick="changeUsulanPage(${usulanCurrentPage - 1})">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${i === usulanCurrentPage ? 'active' : ''}" onclick="changeUsulanPage(${i})">${i}</button>
    `;
  }

  html += `
    <button class="page-btn" ${usulanCurrentPage === totalPages ? 'disabled' : ''} onclick="changeUsulanPage(${usulanCurrentPage + 1})">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
  `;

  container.innerHTML = html;
}

function changeUsulanPage(p) {
  usulanCurrentPage = p;
  renderUsulanPage();
}

function verifikasiUsulan(id) {
  const list = getUsulanData();
  const item = list.find(u => u.id === id);
  if (!item) return;

  item.status = 'Dalam Proses';
  item.catatan = 'Usulan telah diverifikasi oleh Tim Penilai Angka Kredit dan diteruskan untuk proses SK.';
  saveUsulanData(list);
  renderUsulanPage();
  showToast('success', 'Verifikasi Berhasil', `Usulan untuk ${item.nama} telah diverifikasi dan masuk tahap penetapan.`);
}

function batalkanVerifikasiUsulan(id) {
  const list = getUsulanData();
  const item = list.find(u => u.id === id);
  if (!item) return;

  item.status = 'Menunggu Verifikasi';
  item.catatan = 'Verifikasi dibatalkan. Usulan dikembalikan ke antrean Menunggu Verifikasi.';
  saveUsulanData(list);
  renderUsulanPage();
  showToast('info', 'Verifikasi Dibatalkan', `Status usulan untuk ${item.nama} telah dikembalikan ke Menunggu Verifikasi.`);
}

function setujuiUsulan(id) {
  const list = getUsulanData();
  const item = list.find(u => u.id === id);
  if (!item) return;

  item.status = 'Disetujui ✓';
  item.catatan = 'SK Penetapan Angka Kredit / Kenaikan telah diterbitkan dan tercatat resmi.';
  saveUsulanData(list);
  renderUsulanPage();
  showToast('success', 'Usulan Disetujui', `SK Resmi untuk ${item.nama} telah disetujui & diterbitkan.`);
}

function batalkanPersetujuanUsulan(id) {
  const list = getUsulanData();
  const item = list.find(u => u.id === id);
  if (!item) return;

  item.status = 'Dalam Proses';
  item.catatan = 'Persetujuan SK dibatalkan dan status dikembalikan ke tahap Dalam Proses Penetapan.';
  saveUsulanData(list);
  renderUsulanPage();
  showToast('warning', 'Persetujuan Dibatalkan', `Status persetujuan SK untuk ${item.nama} dibatalkan dan dikembalikan ke tahap Dalam Proses.`);
}

function revisiUsulan(id) {
  const list = getUsulanData();
  const item = list.find(u => u.id === id);
  if (!item) return;

  item.status = 'Perlu Revisi';
  item.catatan = 'Harap melengkapi dokumen bukti fisik SKP dan konversi AK tahun berjalan.';
  saveUsulanData(list);
  renderUsulanPage();
  showToast('warning', 'Permintaan Revisi', `Catatan perbaikan telah dikirimkan untuk usulan ${item.nama}.`);
}

function populateUsulanPegawaiDropdown() {
  const sel = document.getElementById('inp-usulan-pegawai');
  if (!sel || sel.options.length > 1) return;
  if (typeof PEGAWAI_DATA === 'undefined') return;

  PEGAWAI_DATA.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.nama} (NIP: ${p.nip} - ${p.jabatan})`;
    sel.appendChild(opt);
  });
}

function handleUsulanPegawaiSelectChange() {
  const sel = document.getElementById('inp-usulan-pegawai');
  const txtRincian = document.getElementById('inp-usulan-keterangan');
  const selJenis = document.getElementById('inp-usulan-jenis');
  if (!sel || !sel.value || typeof PEGAWAI_DATA === 'undefined') return;

  const pId = parseInt(sel.value, 10);
  const p = PEGAWAI_DATA.find(item => item.id === pId);
  if (!p) return;

  if (p.ak_total_2025 >= (p.kebutuhan_naik_jenjang || 9999)) {
    if (selJenis) selJenis.value = 'Kenaikan Jenjang';
    if (txtRincian) txtRincian.value = `Akumulasi AK Total (${p.ak_total_2025.toFixed(2)}) melampaui target Kenaikan Jenjang (${p.kebutuhan_naik_jenjang.toFixed(1)}).`;
  } else if (p.ak_total_2025 >= (p.kebutuhan_naik_pangkat || 9999)) {
    if (selJenis) selJenis.value = 'Kenaikan Pangkat';
    if (txtRincian) txtRincian.value = `Akumulasi AK Total (${p.ak_total_2025.toFixed(2)}) memenuhi target Kenaikan Pangkat (${p.kebutuhan_naik_pangkat.toFixed(1)}).`;
  } else {
    if (selJenis) selJenis.value = 'Penetapan Angka Kredit';
    if (txtRincian) txtRincian.value = `Pengajuan Penetapan PAK Konversi 2025 dengan Predikat Kinerja ${p.predikat_kinerja_2025 || 'Baik'}.`;
  }
}

function handleSimpanUsulan() {
  const selPeg = document.getElementById('inp-usulan-pegawai');
  const selJenis = document.getElementById('inp-usulan-jenis');
  const txtKet = document.getElementById('inp-usulan-keterangan');

  if (!selPeg || !selPeg.value) {
    showToast('error', 'Validasi Gagal', 'Silakan pilih pegawai yang akan diajukan usulannya.');
    return;
  }

  const pId = parseInt(selPeg.value, 10);
  const p = PEGAWAI_DATA.find(item => item.id === pId);
  if (!p) return;

  const list = getUsulanData();
  const today = new Date();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const tglIndo = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  const newUsulan = {
    id: Date.now(),
    pegawai_id: p.id,
    nama: p.nama,
    nip: p.nip,
    jabatan: p.jabatan,
    pagol: p.pagol,
    jenis_usulan: selJenis ? selJenis.value : 'Penetapan Angka Kredit',
    rincian: txtKet && txtKet.value.trim() ? txtKet.value.trim() : `Pengajuan ${selJenis ? selJenis.value : 'Usulan'} (AK Total: ${(p.ak_total_2025 || 0).toFixed(2)})`,
    ak_terakhir: p.ak_total_2025 || 0,
    target_ak: p.kebutuhan_naik_pangkat || 0,
    tanggal: today.toISOString().split('T')[0],
    tanggal_indo: tglIndo,
    status: 'Menunggu Verifikasi',
    catatan: 'Usulan baru berhasil diajukan melalui sistem.'
  };

  list.unshift(newUsulan);
  saveUsulanData(list);
  closeModal('modal-tambah-usulan');
  renderUsulanPage();
  showToast('success', 'Usulan Berhasil Dibuat', `Usulan ${newUsulan.jenis_usulan} untuk ${p.nama} berhasil masuk ke antrean verifikasi.`);
}

function ajukanUsulanDariSimulasiCurrent() {
  const selPeg = document.getElementById('sim-pegawai-select');
  const pId = selPeg ? parseInt(selPeg.value, 10) : 0;
  
  if (!pId || typeof PEGAWAI_DATA === 'undefined') {
    showToast('info', 'Pilih Pegawai', 'Silakan pilih pegawai pada dropdown kalkulator simulasi terlebih dahulu sebelum mengajukan.');
    if (selPeg) selPeg.focus();
    return;
  }

  const p = PEGAWAI_DATA.find(item => item.id === pId);
  if (!p) return;

  // Open modal and prefill
  populateUsulanPegawaiDropdown();
  openModal('modal-tambah-usulan');
  const inpPeg = document.getElementById('inp-usulan-pegawai');
  if (inpPeg) {
    inpPeg.value = p.id;
    handleUsulanPegawaiSelectChange();
  }
}

function ajukanUsulanDariPegawai(pegawaiId) {
  if (typeof PEGAWAI_DATA === 'undefined') return;
  const p = PEGAWAI_DATA.find(item => item.id === pegawaiId);
  if (!p) return;

  populateUsulanPegawaiDropdown();
  openModal('modal-tambah-usulan');
  const inpPeg = document.getElementById('inp-usulan-pegawai');
  if (inpPeg) {
    inpPeg.value = p.id;
    handleUsulanPegawaiSelectChange();
  }
}

/* ================================================================
   GLOBAL SPOTLIGHT SEARCH SYSTEM (Ctrl + K)
   ================================================================ */
let currentSpotlightFilter = 'all';
let currentSpotlightResults = [];
let currentSpotlightIndex = -1;

function initSpotlightSearch() {
  window.addEventListener('keydown', (e) => {
    // Open on Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      openGlobalSearch();
      return;
    }

    // Open on '/' key if not typing in an input
    if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
      e.preventDefault();
      openGlobalSearch();
      return;
    }

    // Close on Escape
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal-global-search');
      if (modal && modal.style.display !== 'none') {
        closeGlobalSearch();
      }
    }
  });
}

function openGlobalSearch() {
  const modal = document.getElementById('modal-global-search');
  const input = document.getElementById('spotlight-search-input');
  if (!modal || !input) return;

  modal.style.display = 'flex';
  input.value = '';
  currentSpotlightIndex = -1;
  currentSpotlightFilter = 'all';
  
  // Reset filter buttons
  document.querySelectorAll('.spotlight-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === 'all');
  });

  renderSpotlightResults('', 'all');
  
  setTimeout(() => {
    input.focus();
  }, 50);
}

function closeGlobalSearch() {
  const modal = document.getElementById('modal-global-search');
  if (modal) {
    modal.style.display = 'none';
  }
}

function handleSpotlightBackdropClick(e) {
  if (e.target.id === 'modal-global-search') {
    closeGlobalSearch();
  }
}

function setSpotlightFilter(filter) {
  currentSpotlightFilter = filter;
  document.querySelectorAll('.spotlight-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  const input = document.getElementById('spotlight-search-input');
  const query = input ? input.value : '';
  renderSpotlightResults(query, filter);
}

function handleSpotlightInput(e) {
  const query = e.target.value;
  renderSpotlightResults(query, currentSpotlightFilter);
}

function handleSpotlightKeydown(e) {
  const container = document.getElementById('spotlight-results-container');
  if (!container || currentSpotlightResults.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentSpotlightIndex = (currentSpotlightIndex + 1) % currentSpotlightResults.length;
    updateSpotlightActiveItem();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentSpotlightIndex = (currentSpotlightIndex - 1 + currentSpotlightResults.length) % currentSpotlightResults.length;
    updateSpotlightActiveItem();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (currentSpotlightIndex >= 0 && currentSpotlightIndex < currentSpotlightResults.length) {
      const item = currentSpotlightResults[currentSpotlightIndex];
      executeSpotlightItem(item);
    }
  }
}

function updateSpotlightActiveItem() {
  const items = document.querySelectorAll('.spotlight-item');
  items.forEach((el, idx) => {
    el.classList.toggle('active', idx === currentSpotlightIndex);
    if (idx === currentSpotlightIndex) {
      el.scrollIntoView({ block: 'nearest' });
    }
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSpotlightResults(query, filter) {
  const container = document.getElementById('spotlight-results-container');
  if (!container) return;

  const q = query.trim().toLowerCase();
  currentSpotlightResults = [];
  currentSpotlightIndex = 0;

  // System Modules
  const systemPages = [
    { type: 'menu', id: 'dashboard', title: 'Dashboard Utama', sub: 'Ringkasan data, statistik KPI, dan grafik formasi JFT', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z' },
    { type: 'menu', id: 'perhitungan-ak', title: 'Kalkulator Perhitungan AK', sub: 'Simulasi dan konversi predikat SKP ke Angka Kredit PermenPAN-RB No. 1/2023', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { type: 'menu', id: 'daftar-jft', title: 'Daftar Jenis JFT', sub: 'Katalog rumpun jabatan fungsional (PTP, WI, Prakom, Arsiparis, Analis)', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { type: 'menu', id: 'peta-jabatan', title: 'Peta Jabatan & Formasi ASN', sub: 'Dokumen DUK BBGTK Jawa Tengah, struktur formasi dan peta jenjang', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { type: 'menu', id: 'daftar-individu', title: 'Daftar Individu ASN (63 Pegawai)', sub: 'Database lengkap ASN, data profil, AK integrasi, dan PAK konversi', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { type: 'menu', id: 'usulan', title: 'Usulan & Pengajuan', sub: 'Monitoring usulan pengangkatan, kenaikan jenjang, dan penetapan PAK', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { type: 'menu', id: 'laporan', title: 'Laporan & Rekapitulasi', sub: 'Cetak dan ekspor dokumen resmi BKN, rekapitulasi capaian AK tahunan', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { type: 'menu', id: 'pengaturan', title: 'Pengaturan Sistem', sub: 'Manajemen pengguna, audit log, dan parameter regulasi', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  // Official BKN Reports Quick Actions
  const officialReports = [
    { type: 'laporan', id: 'report-akumulasi', title: 'Format BKN: Akumulasi Angka Kredit', sub: 'Tabel lengkap akumulasi AK lama + konversi periodik tahun berjalan', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { type: 'laporan', id: 'report-konversi', title: 'Format BKN: Konversi Predikat Kinerja', sub: 'Lampiran penetapan konversi predikat SKP ke Angka Kredit', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  // Match Pegawai
  let matchedPegawai = [];
  if (filter === 'all' || filter === 'pegawai') {
    matchedPegawai = (typeof PEGAWAI_DATA !== 'undefined' ? PEGAWAI_DATA : []).filter(p => {
      if (!q) return true;
      return (p.nama && p.nama.toLowerCase().includes(q)) ||
             (p.nip && p.nip.toLowerCase().includes(q)) ||
             (p.jabatan && p.jabatan.toLowerCase().includes(q)) ||
             (p.pangkat_golongan && p.pangkat_golongan.toLowerCase().includes(q)) ||
             (p.karpeg && p.karpeg.toLowerCase().includes(q));
    }).slice(0, 15);
  }

  // Match Menus
  let matchedMenus = [];
  if (filter === 'all' || filter === 'menu') {
    matchedMenus = systemPages.filter(m => {
      if (!q) return filter === 'menu';
      return m.title.toLowerCase().includes(q) || m.sub.toLowerCase().includes(q);
    });
  }

  // Match Reports
  let matchedReports = [];
  if (filter === 'all' || filter === 'laporan') {
    matchedReports = officialReports.filter(r => {
      if (!q) return filter === 'laporan';
      return r.title.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q);
    });
  }

  // Build Output HTML
  let html = '';

  if (matchedPegawai.length > 0) {
    html += `<div class="spotlight-section-title">Pegawai ASN (${matchedPegawai.length})</div>`;
    matchedPegawai.forEach(p => {
      currentSpotlightResults.push({ type: 'pegawai', id: p.id, data: p });
      const itemIdx = currentSpotlightResults.length - 1;
      html += `
        <div class="spotlight-item ${itemIdx === 0 ? 'active' : ''}" onclick="executeSpotlightItemByIndex(${itemIdx})">
          <div class="spotlight-item-icon">
            ${p.nip && p.nip !== '-' ? `<img src="foto/${p.nip}.jpg" alt="${p.nama}" onerror="this.remove();" loading="lazy">` : ''}
            <span>${p.initials || 'ASN'}</span>
          </div>
          <div class="spotlight-item-content">
            <div class="spotlight-item-title">
              <span>${p.nama}</span>
              <span class="badge badge-pk" style="font-size:10px;padding:1px 6px;">${p.pangkat_golongan || p.pagol || ''}</span>
            </div>
            <div class="spotlight-item-sub">NIP. ${p.nip} • ${p.jabatan} • AK: ${p.ak_total_2025 || p.ak_konversi_2025 || '0'}</div>
          </div>
          <div class="spotlight-item-action">Lihat Detail →</div>
        </div>
      `;
    });
  }

  if (matchedMenus.length > 0) {
    html += `<div class="spotlight-section-title">Menu &amp; Modul Sistem</div>`;
    matchedMenus.forEach(m => {
      currentSpotlightResults.push({ type: 'menu', id: m.id });
      const itemIdx = currentSpotlightResults.length - 1;
      html += `
        <div class="spotlight-item ${itemIdx === 0 ? 'active' : ''}" onclick="executeSpotlightItemByIndex(${itemIdx})">
          <div class="spotlight-item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="${m.icon}"/>
            </svg>
          </div>
          <div class="spotlight-item-content">
            <div class="spotlight-item-title">${m.title}</div>
            <div class="spotlight-item-sub">${m.sub}</div>
          </div>
          <div class="spotlight-item-action">Buka Menu →</div>
        </div>
      `;
    });
  }

  if (matchedReports.length > 0) {
    html += `<div class="spotlight-section-title">Format Dokumen Resmi BKN</div>`;
    matchedReports.forEach(r => {
      currentSpotlightResults.push({ type: 'laporan', id: r.id });
      const itemIdx = currentSpotlightResults.length - 1;
      html += `
        <div class="spotlight-item ${itemIdx === 0 ? 'active' : ''}" onclick="executeSpotlightItemByIndex(${itemIdx})">
          <div class="spotlight-item-icon" style="background:#FEF3C7;color:#D97706;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="${r.icon}"/>
            </svg>
          </div>
          <div class="spotlight-item-content">
            <div class="spotlight-item-title">${r.title}</div>
            <div class="spotlight-item-sub">${r.sub}</div>
          </div>
          <div class="spotlight-item-action">Buka Dokumen →</div>
        </div>
      `;
    });
  }

  if (currentSpotlightResults.length === 0) {
    html = `
      <div class="spotlight-empty">
        <svg class="spotlight-empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>Tidak ada hasil untuk "<strong>${escapeHtml(query)}</strong>"</div>
        <div style="font-size:11px;color:var(--text-light);margin-top:4px;">Coba gunakan kata kunci nama, NIP, atau jenis jabatan lain.</div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function executeSpotlightItemByIndex(idx) {
  if (idx >= 0 && idx < currentSpotlightResults.length) {
    executeSpotlightItem(currentSpotlightResults[idx]);
  }
}

function executeSpotlightItem(item) {
  closeGlobalSearch();
  if (!item) return;

  if (item.type === 'pegawai') {
    viewPegawaiDetail(item.id);
  } else if (item.type === 'menu') {
    navigate(item.id);
  } else if (item.type === 'laporan') {
    if (item.id === 'report-akumulasi') {
      openModalLaporanKonversi(selectedPegawaiId, 'akumulasi');
    } else {
      openModalLaporanKonversi(selectedPegawaiId, 'konversi');
    }
  }
}

/* ================================================================
   PETA JABATAN INTERACTIVE ENGINE (B, K, +/-)
   ================================================================ */
/* ================================================================
   PETA JABATAN INTERACTIVE ENGINE (B, K, +/-)
   Dikelompokkan Berdasarkan Rumpun Jabatan & Jenjang
   ================================================================ */
const PETA_JABATAN_STORAGE_KEY = 'peta_jabatan_grouped_duk_v3';

const DEFAULT_PETA_JABATAN_DATA = [
  // 1 & 2: Pimpinan Struktural
  { "id": 1, "no": 1, "nama_jabatan": "Kepala", "keterangan": "JPT Pratama", "rumpun": "Pimpinan", "kelas_jabatan": 15, "b": 1, "k": 1, "selisih": 0 },
  { "id": 2, "no": 2, "nama_jabatan": "Kepala Bagian Umum", "keterangan": "Administrator", "rumpun": "Pimpinan", "kelas_jabatan": 12, "b": 1, "k": 1, "selisih": 0 },

  // Widyaiswara (Pertama -> Muda -> Madya)
  { "id": 3, "no": 3, "nama_jabatan": "Widyaiswara Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Widyaiswara", "kelas_jabatan": 8, "b": 5, "k": 16, "selisih": -11 },
  { "id": 4, "no": 4, "nama_jabatan": "Widyaiswara Ahli Muda", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Widyaiswara", "kelas_jabatan": 10, "b": 4, "k": 9, "selisih": -5 },
  { "id": 5, "no": 5, "nama_jabatan": "Widyaiswara Ahli Muda #5", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Widyaiswara", "kelas_jabatan": 10, "b": 0, "k": 1, "selisih": -1 },
  { "id": 6, "no": 6, "nama_jabatan": "Widyaiswara Ahli Madya", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Widyaiswara", "kelas_jabatan": 12, "b": 9, "k": 12, "selisih": -3 },
  { "id": 7, "no": 7, "nama_jabatan": "Widyaiswara Ahli Madya #5", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Widyaiswara", "kelas_jabatan": 12, "b": 0, "k": 1, "selisih": -1 },

  // Pengembang Teknologi Pembelajaran / PTP (Pertama -> Muda -> Madya)
  { "id": 8, "no": 8, "nama_jabatan": "Pengembang Teknologi Pembelajaran Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pengembang Teknologi Pembelajaran", "kelas_jabatan": 8, "b": 6, "k": 20, "selisih": -14 },
  { "id": 9, "no": 9, "nama_jabatan": "Pengembang Teknologi Pembelajaran Ahli Muda", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pengembang Teknologi Pembelajaran", "kelas_jabatan": 10, "b": 15, "k": 15, "selisih": 0 },
  { "id": 10, "no": 10, "nama_jabatan": "Pengembang Teknologi Pembelajaran Ahli Madya", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pengembang Teknologi Pembelajaran", "kelas_jabatan": 12, "b": 6, "k": 12, "selisih": -6 },

  // Arsiparis (Terampil -> Mahir -> Penyelia -> Pertama -> Muda -> Madya)
  { "id": 11, "no": 11, "nama_jabatan": "Arsiparis Terampil", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Arsiparis", "kelas_jabatan": 6, "b": 0, "k": 1, "selisih": -1 },
  { "id": 12, "no": 12, "nama_jabatan": "Arsiparis Mahir", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Arsiparis", "kelas_jabatan": 7, "b": 1, "k": 1, "selisih": 0 },
  { "id": 13, "no": 13, "nama_jabatan": "Arsiparis Penyelia", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Arsiparis", "kelas_jabatan": 8, "b": 0, "k": 2, "selisih": -2 },
  { "id": 14, "no": 14, "nama_jabatan": "Arsiparis Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Arsiparis", "kelas_jabatan": 8, "b": 1, "k": 2, "selisih": -1 },
  { "id": 15, "no": 15, "nama_jabatan": "Arsiparis Ahli Muda", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Arsiparis", "kelas_jabatan": 9, "b": 1, "k": 1, "selisih": 0 },
  { "id": 16, "no": 16, "nama_jabatan": "Arsiparis Ahli Madya", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Arsiparis", "kelas_jabatan": 11, "b": 0, "k": 1, "selisih": -1 },

  // Pranata Komputer (Terampil -> Mahir -> Penyelia -> Pertama -> Muda)
  { "id": 17, "no": 17, "nama_jabatan": "Pranata Komputer Terampil", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Komputer", "kelas_jabatan": 6, "b": 1, "k": 1, "selisih": 0 },
  { "id": 18, "no": 18, "nama_jabatan": "Pranata Komputer Mahir", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Komputer", "kelas_jabatan": 7, "b": 1, "k": 1, "selisih": 0 },
  { "id": 19, "no": 19, "nama_jabatan": "Pranata Komputer Penyelia", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Komputer", "kelas_jabatan": 8, "b": 1, "k": 1, "selisih": 0 },
  { "id": 20, "no": 20, "nama_jabatan": "Pranata Komputer Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Komputer", "kelas_jabatan": 8, "b": 1, "k": 3, "selisih": -2 },
  { "id": 21, "no": 21, "nama_jabatan": "Pranata Komputer Ahli Muda", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Komputer", "kelas_jabatan": 9, "b": 0, "k": 1, "selisih": -1 },

  // SDM Aparatur (Terampil -> Mahir -> Penyelia -> Pertama -> Muda)
  { "id": 22, "no": 22, "nama_jabatan": "Pranata SDM Aparatur Terampil", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "SDM Aparatur", "kelas_jabatan": 6, "b": 0, "k": 1, "selisih": -1 },
  { "id": 23, "no": 23, "nama_jabatan": "Pranata SDM Aparatur Mahir", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "SDM Aparatur", "kelas_jabatan": 7, "b": 0, "k": 1, "selisih": -1 },
  { "id": 24, "no": 24, "nama_jabatan": "Pranata SDM Aparatur Penyelia", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "SDM Aparatur", "kelas_jabatan": 8, "b": 1, "k": 1, "selisih": 0 },
  { "id": 25, "no": 25, "nama_jabatan": "Analis SDM Aparatur Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "SDM Aparatur", "kelas_jabatan": 8, "b": 1, "k": 2, "selisih": -1 },
  { "id": 26, "no": 26, "nama_jabatan": "Analis SDM Aparatur Ahli Muda", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "SDM Aparatur", "kelas_jabatan": 10, "b": 0, "k": 2, "selisih": -2 },

  // Pengelolaan Keuangan & Anggaran APBN (Penyelia -> Pertama -> Muda)
  { "id": 27, "no": 27, "nama_jabatan": "Pranata Keuangan APBN Penyelia", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pengelolaan Keuangan APBN", "kelas_jabatan": 9, "b": 0, "k": 3, "selisih": -3 },
  { "id": 28, "no": 28, "nama_jabatan": "Analis Pengelolaan Keuangan APBN Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pengelolaan Keuangan APBN", "kelas_jabatan": 8, "b": 0, "k": 1, "selisih": -1 },
  { "id": 29, "no": 29, "nama_jabatan": "Analis Pengelolaan Keuangan APBN Ahli Muda", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pengelolaan Keuangan APBN", "kelas_jabatan": 10, "b": 1, "k": 3, "selisih": -2 },

  // Perencana (Pertama -> Muda)
  { "id": 30, "no": 30, "nama_jabatan": "Perencana Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Perencana", "kelas_jabatan": 8, "b": 2, "k": 3, "selisih": -1 },
  { "id": 31, "no": 31, "nama_jabatan": "Perencana Ahli Muda", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Perencana", "kelas_jabatan": 10, "b": 0, "k": 2, "selisih": -2 },

  // Pustakawan & Perpustakaan (Terampil -> Pertama -> Muda)
  { "id": 32, "no": 32, "nama_jabatan": "Asisten Perpustakaan Terampil", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pustakawan", "kelas_jabatan": 6, "b": 0, "k": 2, "selisih": -2 },
  { "id": 33, "no": 33, "nama_jabatan": "Pustakawan Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pustakawan", "kelas_jabatan": 8, "b": 0, "k": 2, "selisih": -2 },
  { "id": 34, "no": 34, "nama_jabatan": "Pustakawan Ahli Muda", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pustakawan", "kelas_jabatan": 9, "b": 0, "k": 1, "selisih": -1 },

  // Pranata Hubungan Masyarakat (Terampil -> Pertama)
  { "id": 35, "no": 35, "nama_jabatan": "Pranata Hubungan Masyarakat Terampil", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Hubungan Masyarakat", "kelas_jabatan": 6, "b": 0, "k": 1, "selisih": -1 },
  { "id": 36, "no": 36, "nama_jabatan": "Pranata Hubungan Masyarakat Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Hubungan Masyarakat", "kelas_jabatan": 8, "b": 1, "k": 1, "selisih": 0 },

  // Pranata Laboratorium Pendidikan / PLP (Terampil -> Mahir -> Penyelia -> Pertama -> Muda)
  { "id": 37, "no": 37, "nama_jabatan": "Pranata Laboratorium Pendidikan Terampil", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Laboratorium Pendidikan", "kelas_jabatan": 6, "b": 1, "k": 2, "selisih": -1 },
  { "id": 38, "no": 38, "nama_jabatan": "Pranata Laboratorium Pendidikan Mahir", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Laboratorium Pendidikan", "kelas_jabatan": 7, "b": 0, "k": 1, "selisih": -1 },
  { "id": 39, "no": 39, "nama_jabatan": "Pranata Laboratorium Pendidikan Penyelia", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Laboratorium Pendidikan", "kelas_jabatan": 8, "b": 1, "k": 1, "selisih": 0 },
  { "id": 40, "no": 40, "nama_jabatan": "Pranata Laboratorium Pendidikan Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Laboratorium Pendidikan", "kelas_jabatan": 8, "b": 1, "k": 1, "selisih": 0 },
  { "id": 41, "no": 41, "nama_jabatan": "Pranata Laboratorium Pendidikan Ahli Muda", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Pranata Laboratorium Pendidikan", "kelas_jabatan": 9, "b": 1, "k": 1, "selisih": 0 },

  // Statistisi (Pertama -> Muda)
  { "id": 42, "no": 42, "nama_jabatan": "Statistisi Ahli Pertama", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Statistisi", "kelas_jabatan": 8, "b": 1, "k": 2, "selisih": -1 },
  { "id": 43, "no": 43, "nama_jabatan": "Statistisi Ahli Muda", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Statistisi", "kelas_jabatan": 10, "b": 0, "k": 1, "selisih": -1 },

  // Analis Pengembangan Kompetensi (Pertama)
  { "id": 44, "no": 44, "nama_jabatan": "Analis Pengembangan Kompetensi Ahli Pertama #27", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Analis Pengembangan Kompetensi", "kelas_jabatan": 8, "b": 1, "k": 1, "selisih": 0 },

  // Penata Laksana Barang (Terampil)
  { "id": 45, "no": 45, "nama_jabatan": "Penata Laksana Barang Terampil", "keterangan": "Jabatan Fungsional (JF)", "rumpun": "Penata Laksana Barang", "kelas_jabatan": 7, "b": 0, "k": 2, "selisih": -2 },

  // Pelaksana
  { "id": 46, "no": 46, "nama_jabatan": "Penata Layanan Operasional #20", "keterangan": "Pelaksana", "rumpun": "Pelaksana", "kelas_jabatan": 7, "b": 15, "k": 15, "selisih": 0 },
  { "id": 47, "no": 47, "nama_jabatan": "Penata Kelola Sistem dan Teknologi Informasi", "keterangan": "Pelaksana", "rumpun": "Pelaksana", "kelas_jabatan": 7, "b": 1, "k": 1, "selisih": 0 },
  { "id": 48, "no": 48, "nama_jabatan": "Penelaah Teknis Kebijakan", "keterangan": "Pelaksana", "rumpun": "Pelaksana", "kelas_jabatan": 7, "b": 18, "k": 25, "selisih": -7 },
  { "id": 49, "no": 49, "nama_jabatan": "Pengelola Layanan Operasional", "keterangan": "Pelaksana", "rumpun": "Pelaksana", "kelas_jabatan": 6, "b": 1, "k": 1, "selisih": 0 },
  { "id": 50, "no": 50, "nama_jabatan": "Pengolah Data dan Informasi", "keterangan": "Pelaksana", "rumpun": "Pelaksana", "kelas_jabatan": 6, "b": 17, "k": 22, "selisih": -5 },
  { "id": 51, "no": 51, "nama_jabatan": "Pengadministrasi Perkantoran", "keterangan": "Pelaksana", "rumpun": "Pelaksana", "kelas_jabatan": 5, "b": 4, "k": 8, "selisih": -4 },
  { "id": 52, "no": 52, "nama_jabatan": "Operator Layanan Operasional #20", "keterangan": "Pelaksana", "rumpun": "Pelaksana", "kelas_jabatan": 5, "b": 8, "k": 8, "selisih": 0 },
  { "id": 53, "no": 53, "nama_jabatan": "Operator Layanan Operasional", "keterangan": "Pelaksana", "rumpun": "Pelaksana", "kelas_jabatan": 5, "b": 1, "k": 4, "selisih": -3 },
  { "id": 54, "no": 54, "nama_jabatan": "Operator Laboratorium", "keterangan": "Pelaksana", "rumpun": "Pelaksana", "kelas_jabatan": 5, "b": 1, "k": 1, "selisih": 0 }
];

function getPetaJabatanData() {
  try {
    const raw = localStorage.getItem(PETA_JABATAN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 40) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read peta jabatan data from localStorage:', err);
  }

  // Fallback to DEFAULT_PETA_JABATAN_DATA
  const copy = JSON.parse(JSON.stringify(DEFAULT_PETA_JABATAN_DATA));
  savePetaJabatanData(copy);
  return copy;
}

function savePetaJabatanData(data) {
  try {
    localStorage.setItem(PETA_JABATAN_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save peta jabatan data:', err);
  }
}

function renderPetaJabatan() {
  const tbodyMain = document.getElementById('tbody-peta-jabatan');
  if (!tbodyMain) return;

  const data = getPetaJabatanData();
  const search = (document.getElementById('search-peta-jabatan')?.value || '').trim().toLowerCase();
  const filterKet = document.getElementById('filter-peta-keterangan')?.value || 'Semua';
  const filterStat = document.getElementById('filter-peta-status')?.value || 'Semua';
  const filterKelas = document.getElementById('filter-peta-kelas')?.value || 'Semua';

  let totalB = 0;
  let totalK = 0;
  let totalSelisih = 0;
  let countPas = 0;
  let countKurang = 0;
  let countLebih = 0;

  // Calculate overall totals from complete data
  data.forEach(item => {
    const bVal = parseInt(item.b, 10) || 0;
    const kVal = parseInt(item.k, 10) || 0;
    const sVal = bVal - kVal;
    totalB += bVal;
    totalK += kVal;
    totalSelisih += sVal;

    if (sVal === 0) countPas++;
    else if (sVal < 0) countKurang++;
    else countLebih++;
  });

  // Update KPI Cards
  const kpiB = document.getElementById('kpi-peta-total-b');
  const kpiK = document.getElementById('kpi-peta-total-k');
  const kpiSelisih = document.getElementById('kpi-peta-total-selisih');
  const kpiBadgeSelisih = document.getElementById('kpi-peta-badge-selisih');
  const kpiRasio = document.getElementById('kpi-peta-rasio');
  const kpiPct = document.getElementById('kpi-peta-pct');

  const footB = document.getElementById('foot-total-b');
  const footK = document.getElementById('foot-total-k');
  const footSelisih = document.getElementById('foot-total-selisih');

  if (kpiB) kpiB.textContent = totalB;
  if (kpiK) kpiK.textContent = totalK;
  if (kpiSelisih) {
    kpiSelisih.textContent = totalSelisih > 0 ? `+${totalSelisih}` : totalSelisih;
    kpiSelisih.style.color = totalSelisih < 0 ? '#DC2626' : (totalSelisih === 0 ? '#16A34A' : '#4F46E5');
  }
  if (kpiBadgeSelisih) {
    kpiBadgeSelisih.textContent = totalSelisih > 0 ? `+${totalSelisih}` : totalSelisih;
    kpiBadgeSelisih.className = `badge ${totalSelisih < 0 ? 'badge-deficit' : (totalSelisih === 0 ? 'badge-balanced' : 'badge-surplus')}`;
  }
  if (kpiRasio) {
    kpiRasio.textContent = `${countPas} Pas / ${countKurang} Kurang${countLebih > 0 ? ` / ${countLebih} Lebih` : ''}`;
  }
  if (kpiPct) {
    const pct = totalK > 0 ? ((totalB / totalK) * 100).toFixed(1) : 0;
    kpiPct.textContent = `${pct}% Terpenuhi`;
  }

  if (footB) footB.textContent = totalB;
  if (footK) footK.textContent = totalK;
  if (footSelisih) {
    const badgeText = totalSelisih > 0 ? `+${totalSelisih}` : totalSelisih;
    footSelisih.textContent = badgeText;
    footSelisih.className = `duk-cell-selisih ${totalSelisih === 0 ? 'duk-selisih-zero' : (totalSelisih < 0 ? 'duk-selisih-minus' : 'duk-selisih-plus')}`;
  }

  // Filter items for table view
  const filtered = data.filter(item => {
    const bVal = parseInt(item.b, 10) || 0;
    const kVal = parseInt(item.k, 10) || 0;
    const sVal = bVal - kVal;

    // Search query
    if (search) {
      const matchName = (item.nama_jabatan || '').toLowerCase().includes(search);
      const matchKet = (item.keterangan || '').toLowerCase().includes(search);
      const matchRumpun = (item.rumpun || '').toLowerCase().includes(search);
      if (!matchName && !matchKet && !matchRumpun) return false;
    }

    // Filter Keterangan
    if (filterKet !== 'Semua') {
      if (item.keterangan !== filterKet && item.rumpun !== filterKet) return false;
    }

    // Filter Status
    if (filterStat === 'Kurang' && sVal >= 0) return false;
    if (filterStat === 'Pas' && sVal !== 0) return false;
    if (filterStat === 'Lebih' && sVal <= 0) return false;

    // Filter Kelas
    if (filterKelas !== 'Semua') {
      if (String(item.kelas_jabatan) !== filterKelas) return false;
    }

    return true;
  });

  const infoEl = document.getElementById('info-peta-jabatan');
  if (infoEl) {
    infoEl.textContent = `Menampilkan ${filtered.length} dari ${data.length} formasi jabatan`;
  }

  // Generate HTML for Authentic Main Table
  if (filtered.length === 0) {
    tbodyMain.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:36px 16px;color:var(--text-muted);">
          <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Tidak ada formasi jabatan yang sesuai dengan filter</div>
          <div style="font-size:12px;color:var(--text-light);">Coba ubah kata kunci pencarian atau opsi filter di atas.</div>
        </td>
      </tr>
    `;
  } else {
    tbodyMain.innerHTML = filtered.map((item, index) => {
      const bVal = parseInt(item.b, 10) || 0;
      const kVal = parseInt(item.k, 10) || 0;
      const sVal = bVal - kVal;

      // Color coding matching authentic document
      let selisihColorClass = 'duk-selisih-zero';
      if (sVal < 0) selisihColorClass = 'duk-selisih-minus';
      else if (sVal > 0) selisihColorClass = 'duk-selisih-plus';

      const isJf = item.keterangan === 'Jabatan Fungsional (JF)';

      return `
        <tr>
          <td style="text-align:center;font-weight:600;color:var(--text);">${item.no || (index + 1)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-weight:600;color:var(--text);">${escapeHtml(item.nama_jabatan)}</span>
              ${isJf && item.rumpun ? `<span class="badge" style="font-size:10.5px;padding:1px 7px;background:rgba(2,132,199,0.08);color:var(--info);border:1px solid rgba(2,132,199,0.2);border-radius:4px;font-weight:500;">${escapeHtml(item.rumpun)}</span>` : ''}
            </div>
          </td>
          <td style="color:var(--text-muted);font-size:11.5px;">
            ${escapeHtml(item.keterangan)}
          </td>
          <td style="text-align:center;font-weight:700;">
            ${item.kelas_jabatan || '-'}
          </td>
          <td style="text-align:center;">
            <div class="duk-stepper">
              <button type="button" class="duk-step-btn" onclick="stepPetaValue(${item.id}, 'b', -1)" title="Kurangi">-</button>
              <input type="number" class="duk-input-num" value="${bVal}" min="0" onchange="changePetaValue(${item.id}, 'b', this.value)">
              <button type="button" class="duk-step-btn" onclick="stepPetaValue(${item.id}, 'b', 1)" title="Tambah">+</button>
            </div>
          </td>
          <td style="text-align:center;">
            <div class="duk-stepper">
              <button type="button" class="duk-step-btn" onclick="stepPetaValue(${item.id}, 'k', -1)" title="Kurangi">-</button>
              <input type="number" class="duk-input-num" value="${kVal}" min="0" onchange="changePetaValue(${item.id}, 'k', this.value)">
              <button type="button" class="duk-step-btn" onclick="stepPetaValue(${item.id}, 'k', 1)" title="Tambah">+</button>
            </div>
          </td>
          <td class="duk-cell-selisih ${selisihColorClass}">
            ${sVal}
          </td>
          <td style="text-align:center;white-space:nowrap;">
            <button class="btn-icon" title="Edit Formasi" onclick="openEditPetaJabatanModal(${item.id})" style="width:24px;height:24px;color:var(--primary);margin-right:2px;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:13px;height:13px;"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="btn-icon" title="Hapus Formasi" onclick="deletePetaJabatanRow(${item.id})" style="width:24px;height:24px;color:#EF4444;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:13px;height:13px;"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function stepPetaValue(id, field, delta) {
  const data = getPetaJabatanData();
  const target = data.find(x => x.id === id);
  if (!target) return;

  let current = parseInt(target[field], 10) || 0;
  let next = current + delta;
  if (next < 0) next = 0;

  target[field] = next;
  target.selisih = (parseInt(target.b, 10) || 0) - (parseInt(target.k, 10) || 0);

  savePetaJabatanData(data);
  renderPetaJabatan();
}

function changePetaValue(id, field, val) {
  const data = getPetaJabatanData();
  const target = data.find(x => x.id === id);
  if (!target) return;

  let next = parseInt(val, 10);
  if (isNaN(next) || next < 0) next = 0;

  target[field] = next;
  target.selisih = (parseInt(target.b, 10) || 0) - (parseInt(target.k, 10) || 0);

  savePetaJabatanData(data);
  renderPetaJabatan();
}

function handlePetaFilter() {
  renderPetaJabatan();
}

function resetPetaJabatanDefault() {
  const copy = JSON.parse(JSON.stringify(DEFAULT_PETA_JABATAN_DATA));
  savePetaJabatanData(copy);
  renderPetaJabatan();
  showToast('success', 'Reset Berhasil', 'Data peta jabatan telah dikembalikan ke standar DUK BBGTK Jateng.');
}

function deletePetaJabatanRow(id) {
  let data = getPetaJabatanData();
  const item = data.find(x => x.id === id);
  const name = item ? item.nama_jabatan : 'Jabatan';

  data = data.filter(x => x.id !== id);
  savePetaJabatanData(data);
  renderPetaJabatan();
  showToast('info', 'Dihapus', `Formasi "${name}" telah dihapus.`);
}

function handleAddPetaJabatanSubmit() {
  const inpNama = document.getElementById('inp-peta-nama');
  const inpRumpun = document.getElementById('inp-peta-rumpun');
  const inpKet = document.getElementById('inp-peta-keterangan');
  const inpKelas = document.getElementById('inp-peta-kelas');
  const inpB = document.getElementById('inp-peta-b');
  const inpK = document.getElementById('inp-peta-k');

  const nama = inpNama ? inpNama.value.trim() : '';
  const rumpun = inpRumpun ? inpRumpun.value.trim() : '';
  const keterangan = inpKet ? inpKet.value : 'Jabatan Fungsional (JF)';
  const kelas = inpKelas ? parseInt(inpKelas.value, 10) : 10;
  const b = inpB ? Math.max(0, parseInt(inpB.value, 10) || 0) : 0;
  const k = inpK ? Math.max(1, parseInt(inpK.value, 10) || 1) : 1;

  if (!nama) {
    showToast('error', 'Gagal', 'Nama jabatan wajib diisi.');
    return;
  }

  const data = getPetaJabatanData();
  const nextId = data.length > 0 ? Math.max(...data.map(x => x.id || 0)) + 1 : 1;
  const nextNo = data.length + 1;

  data.push({
    id: nextId,
    no: nextNo,
    nama_jabatan: nama,
    rumpun: rumpun,
    keterangan: keterangan,
    kelas_jabatan: kelas,
    b: b,
    k: k,
    selisih: b - k
  });

  savePetaJabatanData(data);
  closeModal('modal-tambah-peta-jabatan');
  if (inpNama) inpNama.value = '';
  if (inpRumpun) inpRumpun.value = '';
  renderPetaJabatan();
  showToast('success', 'Berhasil', `Formasi "${nama}" berhasil ditambahkan.`);
}

function openEditPetaJabatanModal(id) {
  const data = getPetaJabatanData();
  const item = data.find(x => x.id === id);
  if (!item) {
    showToast('error', 'Gagal', 'Data formasi tidak ditemukan.');
    return;
  }

  const inpId = document.getElementById('edit-peta-id');
  const inpNama = document.getElementById('edit-peta-nama');
  const inpRumpun = document.getElementById('edit-peta-rumpun');
  const inpKet = document.getElementById('edit-peta-keterangan');
  const inpKelas = document.getElementById('edit-peta-kelas');
  const inpB = document.getElementById('edit-peta-b');
  const inpK = document.getElementById('edit-peta-k');

  if (inpId) inpId.value = item.id;
  if (inpNama) inpNama.value = item.nama_jabatan || '';
  if (inpRumpun) inpRumpun.value = (item.rumpun && item.rumpun !== 'Pimpinan' && item.rumpun !== 'Pelaksana') ? item.rumpun : (item.rumpun || '');
  if (inpKet) inpKet.value = item.keterangan || 'Jabatan Fungsional (JF)';
  if (inpKelas) inpKelas.value = String(item.kelas_jabatan || 10);
  if (inpB) inpB.value = parseInt(item.b, 10) || 0;
  if (inpK) inpK.value = parseInt(item.k, 10) || 0;

  openModal('modal-edit-peta-jabatan');
}

function handleEditPetaJabatanSubmit() {
  const inpId = document.getElementById('edit-peta-id');
  const inpNama = document.getElementById('edit-peta-nama');
  const inpRumpun = document.getElementById('edit-peta-rumpun');
  const inpKet = document.getElementById('edit-peta-keterangan');
  const inpKelas = document.getElementById('edit-peta-kelas');
  const inpB = document.getElementById('edit-peta-b');
  const inpK = document.getElementById('edit-peta-k');

  const id = inpId ? parseInt(inpId.value, 10) : null;
  const nama = inpNama ? inpNama.value.trim() : '';
  const rumpun = inpRumpun ? inpRumpun.value.trim() : '';
  const keterangan = inpKet ? inpKet.value : 'Jabatan Fungsional (JF)';
  const kelas = inpKelas ? parseInt(inpKelas.value, 10) : 10;
  const b = inpB ? Math.max(0, parseInt(inpB.value, 10) || 0) : 0;
  const k = inpK ? Math.max(0, parseInt(inpK.value, 10) || 0) : 0;

  if (!nama) {
    showToast('error', 'Gagal', 'Nama jabatan tidak boleh kosong.');
    return;
  }

  const data = getPetaJabatanData();
  const target = data.find(x => x.id === id);
  if (!target) {
    showToast('error', 'Gagal', 'Formasi tidak ditemukan.');
    return;
  }

  target.nama_jabatan = nama;
  target.rumpun = rumpun;
  target.keterangan = keterangan;
  target.kelas_jabatan = kelas;
  target.b = b;
  target.k = k;
  target.selisih = b - k;

  savePetaJabatanData(data);
  closeModal('modal-edit-peta-jabatan');
  renderPetaJabatan();
  showToast('success', 'Tersimpan', `Formasi "${nama}" berhasil diperbarui.`);
}

function exportPetaJabatanCsv() {
  const data = getPetaJabatanData();
  if (!data || data.length === 0) {
    showToast('error', 'Gagal', 'Tidak ada data peta jabatan untuk diekspor.');
    return;
  }

  let csv = 'NO,NAMA JABATAN,KETERANGAN,KELAS JABATAN,BEZETTING (B),KEBUTUHAN (K),SELISIH (+/-)\n';
  data.forEach(item => {
    const b = parseInt(item.b, 10) || 0;
    const k = parseInt(item.k, 10) || 0;
    const s = b - k;
    const cleanName = `"${(item.nama_jabatan || '').replace(/"/g, '""')}"`;
    const cleanKet = `"${(item.keterangan || '').replace(/"/g, '""')}"`;
    csv += `${item.no || item.id},${cleanName},${cleanKet},${item.kelas_jabatan || ''},${b},${k},${s}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'PETA_JABATAN_BBGTK_JATENG.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('success', 'Berhasil Ekspor', 'File CSV Peta Jabatan berhasil diunduh.');
}



