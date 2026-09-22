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

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    toggleTheme(true);
  }

  if (typeof PEGAWAI_DATA !== 'undefined' && PEGAWAI_DATA.length > 0) {
    renderDashboard();
    renderDaftarJft();
    renderDaftarIndividu();
    renderDetailIndividu(selectedPegawaiId);
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
    'daftar-jft':      'nav-daftar-jft',
    'daftar-individu': 'nav-daftar-individu',
    'detail-individu': 'nav-daftar-individu',
    'usulan':          'nav-usulan',
    'laporan':         'nav-laporan',
    'pengaturan':      'nav-pengaturan',
  };

  const bnavMap = {
    'dashboard':       'bnav-dashboard',
    'perhitungan-ak':  'bnav-dashboard',
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

  const mainEl = document.querySelector('.app-main');
  if (mainEl) mainEl.scrollTop = 0;

  if (page === 'dashboard') {
    renderDashboard();
    setTimeout(initDashboardChart, 100);
  } else if (page === 'perhitungan-ak') {
    renderPerhitunganAk();
  } else if (page === 'daftar-jft') {
    renderDaftarJft();
  } else if (page === 'daftar-individu') {
    renderDaftarIndividu();
  } else if (page === 'detail-individu') {
    renderDetailIndividu(selectedPegawaiId);
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

  // Ringkasan JFT summary table
  const tbodySummary = document.getElementById('tbody-dashboard-jft-summary');
  if (tbodySummary) {
    const catMap = {};
    PEGAWAI_DATA.forEach(p => {
      const cat = p.kategori_jft;
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const categories = [
      { name: 'Pengembang Teknologi Pembelajaran (PTP)', count: catMap['PTP'] || 0, key: 'Pengembang Teknologi Pembelajaran' },
      { name: 'Widyaiswara (WI)', count: catMap['Widyaiswara'] || 0, key: 'Widyaiswara' },
      { name: 'Pranata Komputer (Prakom)', count: catMap['Pranata Komputer'] || 0, key: 'Pranata Komputer' },
      { name: 'Arsiparis', count: catMap['Arsiparis'] || 0, key: 'Arsiparis' },
      { name: 'Analis (SDM / Keuangan / Bangkom)', count: (catMap['Analis'] || 0), key: 'Analis' },
    ];

    tbodySummary.innerHTML = categories.map(cat => `
      <tr>
        <td><strong>${cat.name}</strong></td>
        <td>${cat.count} Pegawai</td>
        <td>BBGTK Prov. Jawa Tengah</td>
        <td><span class="badge badge-aktif">AKTIF</span></td>
        <td>
          <button class="btn-icon" title="Lihat Daftar Pegawai" onclick="filterByJftAndNavigate('${cat.key}')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');
  }
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
    const primaryTarget = targetKj > 0 ? targetKj : targetKp;
    if (totalAkBaru >= primaryTarget) {
      elBadge.className = 'badge badge-aktif';
      elBadge.textContent = 'Memenuhi Syarat Kenaikan ✓';
      elDesc.textContent = `Surplus +${(totalAkBaru - primaryTarget).toFixed(3)} AK di atas target (${primaryTarget})`;
    } else {
      const def = (primaryTarget - totalAkBaru).toFixed(3);
      elBadge.className = 'badge badge-proses';
      elBadge.textContent = `Perlu +${def} AK lagi`;
      elDesc.textContent = `Menuju target kumulatif ${primaryTarget.toFixed(1)}`;
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
          <div style="display:flex;gap:4px;">
            <button class="btn btn-ghost btn-sm" title="Simulasi Perolehan AK" onclick="loadPegawaiIntoSimulasi(${p.id})">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:14px;height:14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              Hitung
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
   DAFTAR JFT PAGE
   ---------------------------------------------------------------- */
const JFT_MASTER_LIST = [
  { code: 'JFT-001', name: 'Pengembang Teknologi Pembelajaran', jenjang: 'Madya, Muda, Pertama', count: 29, formasi: 35, status: 'Aktif' },
  { code: 'JFT-002', name: 'Widyaiswara', jenjang: 'Madya, Muda, Pertama', count: 19, formasi: 25, status: 'Aktif' },
  { code: 'JFT-003', name: 'Pranata Komputer', jenjang: 'Pertama, Penyelia, Mahir, Terampil', count: 4, formasi: 8, status: 'Aktif' },
  { code: 'JFT-004', name: 'Arsiparis', jenjang: 'Muda, Pertama, Mahir', count: 3, formasi: 5, status: 'Aktif' },
  { code: 'JFT-005', name: 'Analis Sumber Daya Manusia Aparatur', jenjang: 'Ahli Pertama', count: 1, formasi: 2, status: 'Aktif' },
  { code: 'JFT-006', name: 'Analis Pengelolaan Keuangan APBN', jenjang: 'Ahli Muda', count: 1, formasi: 2, status: 'Aktif' },
  { code: 'JFT-007', name: 'Analis Pengembangan Kompetensi ASN', jenjang: 'Ahli Pertama', count: 1, formasi: 2, status: 'Aktif' },
  { code: 'JFT-008', name: 'Perencana', jenjang: 'Ahli Pertama', count: 2, formasi: 3, status: 'Aktif' },
  { code: 'JFT-009', name: 'Statistisi', jenjang: 'Ahli Pertama', count: 1, formasi: 2, status: 'Aktif' },
  { code: 'JFT-010', name: 'Pranata Hubungan Masyarakat', jenjang: 'Ahli Pertama', count: 1, formasi: 2, status: 'Aktif' },
  { code: 'JFT-011', name: 'Pranata Sumber Daya Manusia Aparatur', jenjang: 'Penyelia', count: 1, formasi: 2, status: 'Aktif' },
];

function handleDaftarJftFilter() {
  renderDaftarJft();
}

function renderDaftarJft() {
  const tbody = document.getElementById('tbody-daftar-jft');
  if (!tbody) return;

  const searchInput = document.getElementById('search-daftar-jft');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filterJenjang = document.getElementById('filter-jft-jenjang');
  const jenjangVal = filterJenjang ? filterJenjang.value : 'Semua';

  const filtered = JFT_MASTER_LIST.filter(j => {
    const matchQuery = !query ||
      j.name.toLowerCase().includes(query) ||
      j.code.toLowerCase().includes(query) ||
      j.jenjang.toLowerCase().includes(query);

    const matchJenjang = (jenjangVal === 'Semua') || j.jenjang.toLowerCase().includes(jenjangVal.toLowerCase());
    return matchQuery && matchJenjang;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">
          Tidak ada jenis jabatan yang cocok dengan pencarian.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(j => `
    <tr>
      <td><code style="font-size:11px;color:var(--text-muted)">${j.code}</code></td>
      <td><strong>${j.name}</strong></td>
      <td>${j.jenjang}</td>
      <td><strong>${j.count}</strong></td>
      <td>${j.formasi}</td>
      <td><span class="badge badge-aktif">${j.status}</span></td>
      <td>
        <a href="#" class="link-action" onclick="filterByJftAndNavigate('${j.name}'); return false">Lihat Pegawai →</a>
      </td>
    </tr>
  `).join('');
}

/* ----------------------------------------------------------------
   FILTER BY JFT & DIRECT NAVIGATION
   ---------------------------------------------------------------- */
function filterByJftAndNavigate(jabatanName) {
  // 1. Reset text search
  const searchInput = document.getElementById('search-individu');
  if (searchInput) searchInput.value = '';

  // 2. Reset Golongan & Status filter
  const filterGol = document.getElementById('filter-gol');
  if (filterGol) filterGol.value = 'Semua';

  const filterStatus = document.getElementById('filter-status');
  if (filterStatus) filterStatus.value = 'Semua';

  // 3. Set JFT dropdown filter
  const filterSelect = document.getElementById('filter-jft');
  if (filterSelect) {
    let matched = false;
    const targetLow = jabatanName.toLowerCase().trim();
    for (let opt of filterSelect.options) {
      const optValLow = opt.value.toLowerCase().trim();
      const optTxtLow = opt.text.toLowerCase().trim();
      if (optValLow === targetLow ||
          optValLow.includes(targetLow) ||
          targetLow.includes(optValLow) ||
          optTxtLow.includes(targetLow) ||
          targetLow.includes(optTxtLow)) {
        filterSelect.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched) {
      filterSelect.value = 'Semua';
      if (searchInput) searchInput.value = jabatanName;
    }
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
