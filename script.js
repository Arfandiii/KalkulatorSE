/* ============================================
   KALKULATOR SENSUS EKONOMI INDONESIA
   JavaScript - Pure Vanilla JS, No Dependencies
   ============================================ */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format number to Indonesian Rupiah currency format
 * @param {number} number - The number to format
 * @returns {string} Formatted Rupiah string
 */
function formatRupiah(number) {
    if (number === null || number === undefined || isNaN(number)) return 'Rp 0';
    return 'Rp ' + Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse Rupiah formatted string back to number
 * @param {string} str - The formatted string
 * @returns {number} Parsed number
 */
function parseRupiah(str) {
    if (!str) return 0;
    return parseInt(str.replace(/[^0-9]/g, '')) || 0;
}

/**
 * Format number with thousand separators
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
function formatNumber(number) {
    if (number === null || number === undefined || isNaN(number)) return '0';
    return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format percentage with 2 decimal places
 * @param {number} number - The number to format
 * @returns {string} Formatted percentage string
 */
function formatPercent(number) {
    if (number === null || number === undefined || isNaN(number)) return '0%';
    return number.toFixed(2) + '%';
}

/**
 * Get numeric value from input (handles both raw and formatted inputs)
 * @param {string} id - The input ID
 * @returns {number} Numeric value
 */
function getValue(id) {
    const el = document.getElementById(id);
    if (!el) return 0;

    // Check for raw hidden input first
    const rawEl = document.getElementById(id + 'Raw');
    if (rawEl) {
        return parseFloat(rawEl.value) || 0;
    }

    // Otherwise parse the visible value
    return parseRupiah(el.value);
}

/**
 * Set value to element with animation
 * @param {string} id - Element ID
 * @param {string} value - Value to set
 * @param {string} type - 'rupiah', 'number', 'percent', or 'text'
 */
function setValue(id, value, type = 'text') {
    const el = document.getElementById(id);
    if (!el) return;

    let formattedValue;
    switch (type) {
        case 'rupiah':
            formattedValue = formatRupiah(value);
            break;
        case 'number':
            formattedValue = formatNumber(value);
            break;
        case 'percent':
            formattedValue = formatPercent(value);
            break;
        default:
            formattedValue = value;
    }

    // Animate value change
    el.style.opacity = '0';
    el.style.transform = 'translateY(5px)';

    setTimeout(() => {
        el.textContent = formattedValue;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, 150);

    // Apply color classes based on value
    el.classList.remove('positive', 'negative', 'warning');
    if (type === 'rupiah' || type === 'number') {
        if (value > 0) el.classList.add('positive');
        else if (value < 0) el.classList.add('negative');
    } else if (type === 'percent') {
        if (value < 0) el.classList.add('negative');
        else if (value < 10) el.classList.add('warning');
        else el.classList.add('positive');
    }
}

// ============================================
// RUPIAH INPUT HANDLING
// ============================================

function initRupiahInputs() {
    const rupiahInputs = document.querySelectorAll('.rupiah-input');

    rupiahInputs.forEach(input => {
        const targetId = input.dataset.target;

        input.addEventListener('input', function(e) {
            // Remove non-numeric characters
            let value = this.value.replace(/[^0-9]/g, '');

            // Update raw value
            if (targetId) {
                const rawEl = document.getElementById(targetId);
                if (rawEl) rawEl.value = value || 0;
            }

            // Format with thousand separators
            if (value) {
                this.value = formatNumber(parseInt(value));
            } else {
                this.value = '';
            }

            // Trigger calculation
            calculateAll();
        });

        input.addEventListener('focus', function() {
            this.select();
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.value = '';
                if (targetId) {
                    const rawEl = document.getElementById(targetId);
                    if (rawEl) rawEl.value = 0;
                }
            }
        });
    });
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.section');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            const targetSection = this.dataset.section;

            // Update active menu
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');

            // Show target section
            sections.forEach(sec => sec.classList.remove('active'));
            const target = document.getElementById(targetSection);
            if (target) target.classList.add('active');

            // Close mobile sidebar
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('mobile-open');
            document.getElementById('sidebarOverlay').classList.remove('active');

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ============================================
// SIDEBAR TOGGLE
// ============================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');

    // Desktop toggle
    toggleBtn.addEventListener('click', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.toggle('collapsed');
        } else {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
        }
    });

    // Overlay click
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    });

    // Handle resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        }
    });
}

// ============================================
// DARK MODE
// ============================================

function initDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');

    // Check saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeText.textContent = 'Light Mode';
    }

    themeToggle.addEventListener('click', function() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeText.textContent = 'Dark Mode';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeText.textContent = 'Light Mode';
        }
    });
}

// ============================================
// CALCULATION ENGINE
// ============================================

function calculateAll() {
    // ===== DATA MODAL =====
    const modalAwal = getValue('modalAwal');
    const nilaiAset = getValue('nilaiAset');
    const persediaanBarang = getValue('persediaanBarang');
    const hutangUsaha = getValue('hutangUsaha');
    const piutangUsaha = getValue('piutangUsaha');

    const totalModal = modalAwal + nilaiAset + persediaanBarang + piutangUsaha;
    const kekayaanBersih = totalModal - hutangUsaha;

    setValue('totalModal', totalModal, 'rupiah');
    setValue('kekayaanBersih', kekayaanBersih, 'rupiah');

    // ===== DATA PENDAPATAN =====
    const omzetHarian = getValue('omzetHarian');
    const hariOperasi = parseFloat(document.getElementById('hariOperasi').value) || 0;
    const jamOperasi = parseFloat(document.getElementById('jamOperasi').value) || 0;

    const omzetMingguan = omzetHarian * 7;
    const omzetBulanan = omzetHarian * hariOperasi;
    const omzetTahunan = omzetBulanan * 12;
    const omzetPerJam = jamOperasi > 0 ? omzetHarian / jamOperasi : 0;

    setValue('omzetMingguan', omzetMingguan, 'rupiah');
    setValue('omzetBulanan', omzetBulanan, 'rupiah');
    setValue('omzetTahunan', omzetTahunan, 'rupiah');
    setValue('omzetPerJam', omzetPerJam, 'rupiah');

    // ===== BIAYA OPERASIONAL =====
    const bahanBaku = getValue('bahanBaku');
    const gajiPegawai = getValue('gajiPegawai');
    const biayaListrik = getValue('biayaListrik');
    const biayaAir = getValue('biayaAir');
    const biayaInternet = getValue('biayaInternet');
    const biayaTransportasi = getValue('biayaTransportasi');
    const biayaSewa = getValue('biayaSewa');
    const biayaPajak = getValue('biayaPajak');
    const biayaPemasaran = getValue('biayaPemasaran');
    const biayaLainnya = getValue('biayaLainnya');

    const totalBiayaBulanan = bahanBaku + gajiPegawai + biayaListrik + biayaAir + 
                               biayaInternet + biayaTransportasi + biayaSewa + 
                               biayaPajak + biayaPemasaran + biayaLainnya;
    const totalBiayaTahunan = totalBiayaBulanan * 12;

    setValue('totalBiayaBulanan', totalBiayaBulanan, 'rupiah');
    setValue('totalBiayaTahunan', totalBiayaTahunan, 'rupiah');

    // ===== KEUNTUNGAN =====
    const labaKotor = omzetBulanan - totalBiayaBulanan;
    const labaBersih = labaKotor; // Same as laba kotor in this context
    const marginKeuntungan = omzetBulanan > 0 ? (labaBersih / omzetBulanan) * 100 : 0;
    const persentaseBiayaOmzet = omzetBulanan > 0 ? (totalBiayaBulanan / omzetBulanan) * 100 : 0;

    const keuntunganPerHari = hariOperasi > 0 ? labaBersih / hariOperasi : 0;
    const keuntunganPerBulan = labaBersih;
    const keuntunganPerTahun = labaBersih * 12;

    setValue('labaKotor', labaKotor, 'rupiah');
    setValue('labaBersih', labaBersih, 'rupiah');
    setValue('marginKeuntungan', marginKeuntungan, 'percent');
    setValue('persentaseBiayaOmzet', persentaseBiayaOmzet, 'percent');
    setValue('keuntunganPerHari', keuntunganPerHari, 'rupiah');
    setValue('keuntunganPerBulan', keuntunganPerBulan, 'rupiah');
    setValue('keuntunganPerTahun', keuntunganPerTahun, 'rupiah');

    // ===== PRODUKTIVITAS =====
    const tenagaKerjaTetap = parseFloat(document.getElementById('tenagaKerjaTetap').value) || 0;
    const tenagaKerjaTidakTetap = parseFloat(document.getElementById('tenagaKerjaTidakTetap').value) || 0;
    const totalKaryawan = tenagaKerjaTetap + tenagaKerjaTidakTetap;

    const omzetPerKaryawan = totalKaryawan > 0 ? omzetBulanan / totalKaryawan : 0;
    const labaPerKaryawan = totalKaryawan > 0 ? labaBersih / totalKaryawan : 0;

    let produktivitas = '-';
    if (totalKaryawan > 0) {
        const ratio = omzetBulanan / totalKaryawan;
        if (ratio >= 10000000) produktivitas = 'Sangat Tinggi';
        else if (ratio >= 5000000) produktivitas = 'Tinggi';
        else if (ratio >= 2000000) produktivitas = 'Sedang';
        else produktivitas = 'Rendah';
    }

    setValue('omzetPerKaryawan', omzetPerKaryawan, 'rupiah');
    setValue('labaPerKaryawan', labaPerKaryawan, 'rupiah');
    setValue('produktivitasTenagaKerja', produktivitas, 'text');

    // ===== SKALA USAHA =====
    let skalaUsaha = '-';
    if (omzetTahunan > 0 || totalKaryawan > 0) {
        if (omzetTahunan < 500000000 || totalKaryawan < 5) {
            skalaUsaha = 'Mikro';
        } else if (omzetTahunan < 2500000000 || totalKaryawan < 20) {
            skalaUsaha = 'Kecil';
        } else if (omzetTahunan < 50000000000 || totalKaryawan < 100) {
            skalaUsaha = 'Menengah';
        } else {
            skalaUsaha = 'Besar';
        }
    }

    // ===== ANALISIS TAMBAHAN =====
    const bepBulanan = totalBiayaBulanan; // Break even = total biaya
    const rasioBiayaOmzet = omzetBulanan > 0 ? (totalBiayaBulanan / omzetBulanan) * 100 : 0;
    const rasioAsetOmzet = nilaiAset > 0 ? (omzetBulanan / nilaiAset) * 100 : 0;
    const omzetPerJamOperasional = jamOperasi > 0 ? omzetHarian / jamOperasi : 0;

    setValue('bepBulanan', bepBulanan, 'rupiah');
    setValue('rasioBiayaOmzet', rasioBiayaOmzet, 'percent');
    setValue('rasioAsetOmzet', rasioAsetOmzet, 'percent');
    setValue('omzetPerJamOperasional', omzetPerJamOperasional, 'rupiah');

    // ===== DASHBOARD UPDATE =====
    setValue('dashModal', totalModal, 'rupiah');
    setValue('dashOmzetHarian', omzetHarian, 'rupiah');
    setValue('dashOmzetBulanan', omzetBulanan, 'rupiah');
    setValue('dashOmzetTahunan', omzetTahunan, 'rupiah');
    setValue('dashTotalBiaya', totalBiayaBulanan, 'rupiah');
    setValue('dashLabaBersih', labaBersih, 'rupiah');
    setValue('dashMargin', marginKeuntungan, 'percent');
    setValue('dashKaryawan', totalKaryawan, 'number');
    setValue('dashSkala', skalaUsaha, 'text');

    // Update card colors
    updateCardColors('cardLabaBersih', labaBersih);
    updateCardColors('cardMargin', marginKeuntungan, true);
    updateCardColors('cardTotalBiaya', totalBiayaBulanan);
    updateSkalaCard('cardSkala', skalaUsaha);

    // ===== WARNINGS =====
    updateWarnings(omzetBulanan, totalBiayaBulanan, totalKaryawan, omzetHarian, labaBersih);

    // ===== QUALITY SCORE =====
    updateQualityScore();

    // ===== CHARTS =====
    drawCharts(bahanBaku, gajiPegawai, biayaListrik, biayaAir, biayaInternet, 
               biayaTransportasi, biayaSewa, biayaPajak, biayaPemasaran, biayaLainnya,
               omzetBulanan, labaBersih);
}

/**
 * Update card colors based on values
 */
function updateCardColors(cardId, value, isPercent = false) {
    const card = document.getElementById(cardId);
    if (!card) return;

    card.classList.remove('positive', 'negative', 'warning');

    if (isPercent) {
        if (value < 0) card.classList.add('negative');
        else if (value < 10) card.classList.add('warning');
        else card.classList.add('positive');
    } else {
        if (value < 0) card.classList.add('negative');
        else card.classList.add('positive');
    }
}

function updateSkalaCard(cardId, skala) {
    const card = document.getElementById(cardId);
    if (!card) return;

    card.classList.remove('positive', 'negative', 'warning', 'info');

    switch (skala) {
        case 'Mikro': card.classList.add('warning'); break;
        case 'Kecil': card.classList.add('info'); break;
        case 'Menengah': card.classList.add('positive'); break;
        case 'Besar': card.classList.add('positive'); break;
        default: card.classList.add('info');
    }
}

// ============================================
// WARNINGS SYSTEM
// ============================================

function updateWarnings(omzetBulanan, totalBiayaBulanan, totalKaryawan, omzetHarian, labaBersih) {
    const container = document.getElementById('warningsContainer');
    container.innerHTML = '';

    const warnings = [];

    // Warning: Biaya > Omzet
    if (totalBiayaBulanan > omzetBulanan && omzetBulanan > 0) {
        warnings.push({
            type: 'danger',
            icon: 'fa-exclamation-triangle',
            message: 'Biaya operasional melebihi omzet! Periksa kembali data biaya dan omzet.'
        });
    }

    // Warning: Omzet nol tapi biaya tinggi
    if (omzetBulanan === 0 && totalBiayaBulanan > 0) {
        warnings.push({
            type: 'warning',
            icon: 'fa-exclamation-circle',
            message: 'Omzet nol tetapi biaya operasional terdeteksi. Konfirmasi kembali dengan responden.'
        });
    }

    // Warning: Karyawan tidak wajar dibanding omzet
    if (totalKaryawan > 0 && omzetBulanan > 0) {
        const omzetPerKaryawan = omzetBulanan / totalKaryawan;
        if (omzetPerKaryawan < 500000 && totalKaryawan > 5) {
            warnings.push({
                type: 'warning',
                icon: 'fa-users',
                message: 'Jumlah karyawan tidak wajar dibanding omzet. Verifikasi data tenaga kerja.'
            });
        }
    }

    // Warning: Kerugian
    if (labaBersih < 0) {
        warnings.push({
            type: 'danger',
            icon: 'fa-chart-line',
            message: 'Usaha mengalami kerugian. Pastikan data biaya dan omzet sudah benar.'
        });
    }

    // Warning: Omzet sangat rendah
    if (omzetHarian > 0 && omzetHarian < 50000) {
        warnings.push({
            type: 'info',
            icon: 'fa-info-circle',
            message: 'Omzet harian sangat rendah. Pastikan satuan dan jumlah sudah benar.'
        });
    }

    // Render warnings
    warnings.forEach(w => {
        const div = document.createElement('div');
        div.className = `warning-item ${w.type}`;
        div.innerHTML = `<i class="fas ${w.icon}"></i><span>${w.message}</span>`;
        container.appendChild(div);
    });
}

// ============================================
// QUALITY SCORE
// ============================================

function updateQualityScore() {
    let score = 0;
    let totalFields = 0;
    let filledFields = 0;

    // Check all input fields
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], select');
    inputs.forEach(input => {
        if (input.id && !input.id.endsWith('Raw')) {
            totalFields++;
            if (input.value && input.value !== '' && input.value !== '0') {
                filledFields++;
            }
        }
    });

    // Calculate score (0-100)
    score = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

    // Update UI
    const scoreValue = document.getElementById('qualityScoreValue');
    const scoreFill = document.getElementById('qualityScoreFill');
    const scoreStatus = document.getElementById('qualityScoreStatus');

    scoreValue.textContent = score;
    scoreFill.style.width = score + '%';

    let status = 'Belum Lengkap';
    if (score >= 90) status = 'Sangat Baik';
    else if (score >= 70) status = 'Baik';
    else if (score >= 50) status = 'Cukup';
    else if (score >= 30) status = 'Kurang';

    scoreStatus.textContent = status;

    // Color coding
    scoreStatus.style.background = score >= 70 ? 'rgba(16, 185, 129, 0.3)' : 
                                   score >= 50 ? 'rgba(245, 158, 11, 0.3)' : 
                                   'rgba(239, 68, 68, 0.3)';
}

// ============================================
// CHARTS (Canvas-based, no external libraries)
// ============================================

function drawCharts(bahanBaku, gajiPegawai, biayaListrik, biayaAir, biayaInternet, 
                    biayaTransportasi, biayaSewa, biayaPajak, biayaPemasaran, biayaLainnya,
                    omzetBulanan, labaBersih) {
    drawPieChart(bahanBaku, gajiPegawai, biayaListrik, biayaAir, biayaInternet, 
                 biayaTransportasi, biayaSewa, biayaPajak, biayaPemasaran, biayaLainnya);
    drawBarChart(omzetBulanan, labaBersih);
}

function drawPieChart(...values) {
    const canvas = document.getElementById('biayaChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const radius = Math.min(width, height) / 2 - 40;

    const labels = ['Bahan Baku', 'Gaji', 'Listrik', 'Air', 'Internet', 'Transportasi', 'Sewa', 'Pajak', 'Pemasaran', 'Lainnya'];
    const colors = ['#1e40af', '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];

    const total = values.reduce((a, b) => a + b, 0);

    ctx.clearRect(0, 0, width, height);

    if (total === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Belum ada data biaya', centerX, centerY);
        return;
    }

    let startAngle = -Math.PI / 2;

    // Draw pie slices
    values.forEach((value, i) => {
        if (value > 0) {
            const sliceAngle = (value / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.fill();

            // Draw border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            startAngle += sliceAngle;
        }
    });

    // Draw center hole (donut chart)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff';
    ctx.fill();

    // Center text
    ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Total', centerX, centerY - 5);
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(formatRupiah(total), centerX, centerY + 15);

    // Draw legend
    let legendY = height - 30;
    let legendX = 20;
    const legendItemWidth = width / 5;

    values.forEach((value, i) => {
        if (value > 0) {
            const percent = ((value / total) * 100).toFixed(1);

            ctx.fillStyle = colors[i];
            ctx.fillRect(legendX, legendY - 8, 10, 10);

            ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#94a3b8' : '#64748b';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${labels[i]} (${percent}%)`, legendX + 14, legendY);

            legendX += legendItemWidth;
            if (legendX > width - 100) {
                legendX = 20;
                legendY += 18;
            }
        }
    });
}

function drawBarChart(omzetBulanan, labaBersih) {
    const canvas = document.getElementById('omzetLabaChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(omzetBulanan, Math.abs(labaBersih), 1);
    const barWidth = chartWidth / 4;
    const barGap = barWidth;

    ctx.clearRect(0, 0, width, height);

    if (omzetBulanan === 0 && labaBersih === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Belum ada data omzet dan laba', width / 2, height / 2);
        return;
    }

    // Draw axes
    ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#334155' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = height - padding - (chartHeight / gridLines) * i;
        ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#334155' : '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y-axis labels
        const labelValue = (maxValue / gridLines) * i;
        ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#94a3b8' : '#64748b';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(formatRupiah(labelValue), padding - 8, y + 4);
    }

    // Draw bars
    const bars = [
        { label: 'Omzet', value: omzetBulanan, color: '#3b82f6' },
        { label: 'Biaya', value: omzetBulanan - labaBersih, color: '#ef4444' },
        { label: 'Laba', value: labaBersih, color: labaBersih >= 0 ? '#10b981' : '#f59e0b' }
    ];

    bars.forEach((bar, i) => {
        const barHeight = (Math.abs(bar.value) / maxValue) * chartHeight;
        const x = padding + barGap + i * (barWidth + barGap / 2);
        const y = bar.value >= 0 ? height - padding - barHeight : height - padding;

        // Draw bar
        ctx.fillStyle = bar.color;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw bar shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 4, y + 4, barWidth, barHeight);

        // Redraw bar on top
        ctx.fillStyle = bar.color;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw value on top
        ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(formatRupiah(bar.value), x + barWidth / 2, y - 8);

        // Draw label
        ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#94a3b8' : '#64748b';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(bar.label, x + barWidth / 2, height - padding + 20);
    });
}

// ============================================
// RESET & BUTTONS
// ============================================

function initButtons() {
    // Reset button
    document.getElementById('btnReset').addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin menghapus semua data?')) {
            resetForm();
        }
    });

    // Hitung button
    document.getElementById('btnHitung').addEventListener('click', function() {
        calculateAll();

        // Visual feedback
        this.classList.add('animate-pulse');
        setTimeout(() => this.classList.remove('animate-pulse'), 1000);
    });
}

function resetForm() {
    // Clear all inputs
    document.querySelectorAll('input[type="text"]').forEach(input => {
        if (!input.classList.contains('rupiah-input')) {
            input.value = '';
        }
    });

    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.value = '';
    });

    document.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
    });

    // Clear rupiah inputs
    document.querySelectorAll('.rupiah-input').forEach(input => {
        input.value = '';
    });

    document.querySelectorAll('input[type="hidden"]').forEach(input => {
        input.value = '0';
    });

    // Recalculate
    calculateAll();
}

// ============================================
// INPUT LISTENERS
// ============================================

function initInputListeners() {
    // Number inputs
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            calculateAll();
        });
    });

    // Select inputs
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', function() {
            calculateAll();
        });
    });

    // Text inputs (non-rupiah)
    document.querySelectorAll('input[type="text"]:not(.rupiah-input)').forEach(input => {
        input.addEventListener('input', function() {
            calculateAll();
        });
    });
}

// ============================================
// CHART RESIZE HANDLER
// ============================================

function initChartResize() {
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            calculateAll();
        }, 250);
    });
}

// ============================================
// AUTO-SAVE TO LOCALSTORAGE
// ============================================

function saveToLocalStorage() {
    const data = {};
    document.querySelectorAll('input, select').forEach(el => {
        if (el.id) {
            data[el.id] = el.value;
        }
    });
    localStorage.setItem('kalkulatorSensusData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('kalkulatorSensusData');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = data[id];
            }
        });
    } catch (e) {
        console.error('Error loading saved data:', e);
    }
}

function initAutoSave() {
    // Load saved data
    loadFromLocalStorage();

    // Save on input
    let saveTimeout;
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', function() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveToLocalStorage, 500);
        });

        el.addEventListener('change', function() {
            saveToLocalStorage();
        });
    });
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter to calculate
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            calculateAll();
        }

        // Ctrl+R to reset
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            if (confirm('Reset semua data?')) {
                resetForm();
            }
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initRupiahInputs();
    initNavigation();
    initSidebar();
    initDarkMode();
    initButtons();
    initInputListeners();
    initChartResize();
    initAutoSave();
    initKeyboardShortcuts();

    // Initial calculation
    calculateAll();

    console.log('Kalkulator Sensus Ekonomi Indonesia v1.0 - Ready');
    console.log('Shortcuts: Ctrl+Enter = Hitung, Ctrl+R = Reset');
});
