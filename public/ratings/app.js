/* ===========================
   API Base (Next.js routes instead of Supabase)
   =========================== */
const API_BASE = '/api/watchlist';
const STATS_API = '/api/ratings-stats';

/* ===========================
   State
   =========================== */
let recentMovies = []; // آخر 5 فقط للعرض
let recentSeries = []; // آخر 5 فقط للعرض
let allMoviesForStats = []; // كل الأفلام للإحصائيات + picker + print
let allSeriesForStats = []; // كل المسلسلات

let movieSearchTimer = null;
let seriesSearchTimer = null;

/* ===========================
   DOM
   =========================== */
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const moviesList = document.getElementById('movies-list');
const moviesCount = document.getElementById('movies-count');
const movieForm = document.getElementById('movie-form');
const movieIdInput = document.getElementById('movie-id');
const movieFormTitle = document.getElementById('movie-form-title');
const movieSubmitBtn = document.getElementById('movie-submit-btn');
const movieCancelEdit = document.getElementById('movie-cancel-edit');

const seriesList = document.getElementById('series-list');
const seriesCount = document.getElementById('series-count');
const seriesForm = document.getElementById('series-form');
const seriesIdInput = document.getElementById('series-id');
const seriesFormTitle = document.getElementById('series-form-title');
const seriesSubmitBtn = document.getElementById('series-submit-btn');
const seriesCancelEdit = document.getElementById('series-cancel-edit');

const movieSearch = document.getElementById('movie-search');
const filterGenre = document.getElementById('filter-genre');
const filterYear = document.getElementById('filter-year');
const filterMinRating = document.getElementById('filter-min-rating');
const sortMovies = document.getElementById('sort-movies');
const clearMovieFiltersBtn = document.getElementById('clear-movie-filters');
const printMovieFiltersBtn = document.getElementById('print-movie-filters');
const printLimitSelect = document.getElementById('print-limit');

const seriesSearch = document.getElementById('series-search');
const filterSeriesYear = document.getElementById('filter-series-year');
const filterSeriesMinRating = document.getElementById('filter-series-min-rating');
const sortSeries = document.getElementById('sort-series');
const clearSeriesFiltersBtn = document.getElementById('clear-series-filters');

const movieNightBtn = document.getElementById('movie-night-btn');
const movieNightResult = document.getElementById('movie-night-result');

const statTotal = document.getElementById('stat-total');
const statTopGenre = document.getElementById('stat-top-genre');
const statAvgRating = document.getElementById('stat-avg-rating');
const statTopYear = document.getElementById('stat-top-year');
const statThisMonth = document.getElementById('stat-this-month');



/* ===========================
   Helpers
   =========================== */
function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 2200);
}
function escapeHtml(text = '') {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
function formatRating(num) {
  const n = Math.round(Number(num) * 100) / 100;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}
function getRatingClass(rating) {
  if (rating >= 70) return 'rating-high';
  if (rating >= 40) return 'rating-mid';
  return 'rating-low';
}
function validYear(y) {
  const maxY = new Date().getFullYear() + 5;
  return Number.isInteger(y) && y >= 1900 && y <= maxY;
}
function validRating(r) {
  return Number.isFinite(r) && r >= 0 && r <= 100;
}


/* ===========================
   PWA / Standalone detection
   =========================== */
function detectStandaloneMode() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    document.body.classList.add('ios-standalone');
  } else {
    document.body.classList.remove('ios-standalone');
  }
}

/* ===========================
   Tabs
   =========================== */
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tabContents.forEach((c) => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`${tab.dataset.tab}-section`).classList.add('active');
  });
});

/* ===========================
   Map Prisma item → Supabase-like shape for compatibility
   =========================== */
function mapMovie(item) {
  // genres can be an array (from API) or a string (legacy)
  let genre = '';
  if (Array.isArray(item.genres)) {
    genre = item.genres[0] || '';
  } else if (typeof item.genres === 'string') {
    genre = item.genres.split(',')[0] || '';
  }
  return {
    id: item.id,
    title: item.title,
    year: item.year,
    genre: genre,
    rating: item.userRating,
    created_at: item.addedAt || item.updatedAt,
  };
}
function mapSeries(item) {
  return {
    id: item.id,
    title: item.title,
    year: item.year,
    seasons: item.seasons,
    rating: item.userRating,
    created_at: item.addedAt || item.updatedAt,
  };
}

/* ===========================
   Load data via API
   =========================== */
async function loadMoviesRecent() {
  moviesList.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin fa-3x"></i><p>جاري تحميل الأفلام...</p></div>';

  try {
    const res = await fetch(`${API_BASE}?type=movie&hasRating=true`);
    const data = await res.json();
    let items = [];
    if (data.items && Array.isArray(data.items)) {
      items = data.items;
    } else if (Array.isArray(data)) {
      items = data;
    }

    // Only rated movies (with userRating)
    const ratedMovies = items.filter(i => i.userRating != null).map(mapMovie);
    // Sort by created_at desc and take last 5
    ratedMovies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    recentMovies = ratedMovies.slice(0, 5);
    renderMovies();
  } catch (error) {
    console.error(error);
    showToast('خطأ في تحميل آخر الأفلام', 'error');
    moviesList.innerHTML = '';
  }
}

async function loadSeriesRecent() {
  seriesList.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin fa-3x"></i><p>جاري تحميل المسلسلات...</p></div>';

  try {
    const res = await fetch(`${API_BASE}?type=series&hasRating=true`);
    const data = await res.json();
    let items = [];
    if (data.items && Array.isArray(data.items)) {
      items = data.items;
    } else if (Array.isArray(data)) {
      items = data;
    }

    const ratedSeries = items.filter(i => i.userRating != null).map(mapSeries);
    ratedSeries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    recentSeries = ratedSeries.slice(0, 5);
    renderSeries();
  } catch (error) {
    console.error(error);
    showToast('خطأ في تحميل آخر المسلسلات', 'error');
    seriesList.innerHTML = '';
  }
}

async function loadStatsData() {
  try {
    // Fetch all items for stats
    const [moviesRes, seriesRes] = await Promise.all([
      fetch(`${API_BASE}?type=movie&hasRating=true`),
      fetch(`${API_BASE}?type=series&hasRating=true`),
    ]);
    const moviesData = await moviesRes.json();
    const seriesData = await seriesRes.json();

    let moviesItems = [];
    if (moviesData.items && Array.isArray(moviesData.items)) {
      moviesItems = moviesData.items;
    } else if (Array.isArray(moviesData)) {
      moviesItems = moviesData;
    }

    let seriesItems = [];
    if (seriesData.items && Array.isArray(seriesData.items)) {
      seriesItems = seriesData.items;
    } else if (Array.isArray(seriesData)) {
      seriesItems = seriesData;
    }

    allMoviesForStats = moviesItems.filter(i => i.userRating != null).map(mapMovie);
    allSeriesForStats = seriesItems.filter(i => i.userRating != null).map(mapSeries);
    updateDashboard();
  } catch (error) {
    console.error(error);
    showToast('تعذر تحميل إحصائيات كاملة', 'error');
  }
}

/* ===========================
   Filters movies
   =========================== */
function applyMovieFilters(arr) {
  let result = [...arr];

  const q = movieSearch.value.trim().toLowerCase();
  const g = filterGenre.value;
  const y = Number(filterYear.value);
  const minR = Number(filterMinRating.value);
  const sort = sortMovies.value;

  if (q) result = result.filter((m) => (m.title || '').toLowerCase().includes(q));
  if (g) result = result.filter((m) => m.genre === g);
  if (filterYear.value) result = result.filter((m) => Number(m.year) === y);
  if (filterMinRating.value) result = result.filter((m) => Number(m.rating) >= minR);

  switch (sort) {
    case 'rating_desc': result.sort((a, b) => Number(b.rating) - Number(a.rating)); break;
    case 'year_desc': result.sort((a, b) => Number(b.year) - Number(a.year)); break;
    case 'year_asc': result.sort((a, b) => Number(a.year) - Number(b.year)); break;
    case 'title_asc': result.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
    default: result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return result;
}

function applyMovieFiltersOnAll(arr) {
  let result = [...arr];

  const q = movieSearch.value.trim().toLowerCase();
  const g = filterGenre.value;
  const y = Number(filterYear.value);
  const minR = Number(filterMinRating.value);

  if (q) result = result.filter((m) => (m.title || '').toLowerCase().includes(q));
  if (g) result = result.filter((m) => m.genre === g);
  if (filterYear.value) result = result.filter((m) => Number(m.year) === y);
  if (filterMinRating.value) result = result.filter((m) => Number(m.rating) >= minR);

  return result;
}

function renderMovies() {
  const filtered = applyMovieFilters(recentMovies);
  moviesCount.textContent = filtered.length;

  if (!filtered.length) {
    moviesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-film fa-3x"></i>
        <p>لا يوجد نتائج ضمن آخر 5 أفلام</p>
      </div>
    `;
    return;
  }

  moviesList.innerHTML = filtered.map((m) => {
    return `
      <div class="item-card">
        <div class="item-rating ${getRatingClass(m.rating)}">${formatRating(m.rating)}</div>
        <div class="item-info">
          <div class="item-title">${escapeHtml(m.title)}</div>
          <div class="item-meta">
            <span><i class="fas fa-calendar"></i> ${m.year}</span>
            <span class="genre-badge">${escapeHtml(m.genre || 'Other')}</span>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn-icon" onclick="editMovie('${m.id}')" title="تعديل"><i class="fas fa-pen"></i></button>
          <button class="btn-icon btn-delete" onclick="deleteMovie('${m.id}')" title="حذف"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

/* ===========================
   Print filtered movies
   =========================== */
function printFilteredMovies() {
  let filtered = applyMovieFiltersOnAll(allMoviesForStats || []);

  if (!filtered.length) {
    showToast('لا توجد نتائج للطباعة حسب الفلاتر الحالية', 'error');
    return;
  }

  const limitValue = printLimitSelect ? printLimitSelect.value : 'all';
  const isTopMode = limitValue !== 'all';
  const limit = isTopMode ? Number(limitValue) : null;

  if (isTopMode) {
    filtered = filtered
      .sort((a, b) => {
        const r = Number(b.rating) - Number(a.rating);
        if (r !== 0) return r;
        return (a.title || '').localeCompare((b.title || ''), 'en', { sensitivity: 'base' });
      })
      .slice(0, limit);
  } else {
    filtered = filtered.sort((a, b) =>
      (a.title || '').localeCompare((b.title || ''), 'en', { sensitivity: 'base' })
    );
  }

  const modeLabel = isTopMode ? `أفضل ${limit} حسب التقييم` : 'طباعة الكل (أبجدي)';
  const filtersSummary = `
    النمط: ${escapeHtml(modeLabel)} |
    السنة: ${escapeHtml(filterYear.value || 'الكل')} |
    النوع: ${escapeHtml(filterGenre.value || 'الكل')} |
    أعلى من تقييم: ${escapeHtml(filterMinRating.value || 'بدون')} |
    بحث: ${escapeHtml(movieSearch.value || 'بدون')}
  `;

  const rows = filtered.map((m, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${escapeHtml(m.title || '')}</td>
      <td>${m.year ?? '-'}</td>
      <td>${escapeHtml(m.genre || '-')}</td>
      <td>${formatRating(m.rating)}</td>
    </tr>
  `).join('');

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    showToast('المتصفح منع فتح نافذة الطباعة', 'error');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <title>طباعة الأفلام المفلترة</title>
      <style>
        body { font-family: Tahoma, Arial, sans-serif; padding: 22px; color: #111; }
        h1 { margin: 0 0 6px; font-size: 22px; }
        .meta { color: #444; margin-bottom: 12px; font-size: 13px; line-height: 1.7; }
        .count { margin: 8px 0 12px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #888; padding: 8px; font-size: 12px; text-align: center; }
        th { background: #f1f1f1; }
      </style>
    </head>
    <body>
      <h1>قائمة الأفلام المفلترة</h1>
      <div class="meta">${filtersSummary}</div>
      <div class="count">عدد النتائج المطبوعة: ${filtered.length}</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>اسم الفيلم</th>
            <th>السنة</th>
            <th>النوع</th>
            <th>تقييمي</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

/* ===========================
   Filters series
   =========================== */
function applySeriesFilters(arr) {
  let result = [...arr];

  const q = seriesSearch.value.trim().toLowerCase();
  const y = Number(filterSeriesYear.value);
  const minR = Number(filterSeriesMinRating.value);
  const sort = sortSeries.value;

  if (q) result = result.filter((s) => (s.title || '').toLowerCase().includes(q));
  if (filterSeriesYear.value) result = result.filter((s) => Number(s.year) === y);
  if (filterSeriesMinRating.value) result = result.filter((s) => Number(s.rating) >= minR);

  switch (sort) {
    case 'rating_desc': result.sort((a, b) => Number(b.rating) - Number(a.rating)); break;
    case 'year_desc': result.sort((a, b) => Number(b.year) - Number(a.year)); break;
    case 'year_asc': result.sort((a, b) => Number(a.year) - Number(b.year)); break;
    case 'title_asc': result.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
    default: result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return result;
}

function renderSeries() {
  const filtered = applySeriesFilters(recentSeries);
  seriesCount.textContent = filtered.length;

  if (!filtered.length) {
    seriesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-tv fa-3x"></i>
        <p>لا يوجد نتائج ضمن آخر 5 مسلسلات</p>
      </div>
    `;
    return;
  }

  seriesList.innerHTML = filtered.map((s) => {
    const seasonWord = Number(s.seasons) === 1 ? 'موسم' : 'مواسم';
    return `
      <div class="item-card">
        <div class="item-rating ${getRatingClass(s.rating)}">${formatRating(s.rating)}</div>
        <div class="item-info">
          <div class="item-title">${escapeHtml(s.title)}</div>
          <div class="item-meta">
            <span><i class="fas fa-calendar"></i> ${s.year}</span>
            <span><i class="fas fa-layer-group"></i> ${s.seasons} ${seasonWord}</span>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn-icon" onclick="editSeries('${s.id}')" title="تعديل"><i class="fas fa-pen"></i></button>
          <button class="btn-icon btn-delete" onclick="deleteSeries('${s.id}')" title="حذف"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

/* ===========================
   Dashboard
   =========================== */
function updateDashboard() {
  const movies = allMoviesForStats || [];
  const series = allSeriesForStats || [];

  statTotal.textContent = movies.length + series.length;

  const genreMap = {};
  movies.forEach((m) => {
    const g = m.genre || 'Other';
    genreMap[g] = (genreMap[g] || 0) + 1;
  });
  statTopGenre.textContent = Object.keys(genreMap).sort((a, b) => genreMap[b] - genreMap[a])[0] || '-';

  const ratings = [...movies, ...series]
    .map((x) => Number(x.rating))
    .filter((x) => Number.isFinite(x));
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  statAvgRating.textContent = formatRating(avg);

  const yearMap = {};
  movies.forEach((m) => {
    const y = Number(m.year);
    if (Number.isInteger(y)) yearMap[y] = (yearMap[y] || 0) + 1;
  });
  statTopYear.textContent = Object.keys(yearMap).sort((a, b) => yearMap[b] - yearMap[a])[0] || '-';

  const now = new Date();
  const all = [...movies, ...series];
  const monthly = all.filter((x) => {
    if (!x.created_at) return false;
    const d = new Date(x.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  statThisMonth.textContent = monthly;
}

/* ===========================
   Duplicate checks (via API)
   =========================== */
async function isDuplicateMovie(title, year, excludeId = null) {
  try {
    const res = await fetch(`${API_BASE}?type=movie&hasRating=true&search=${encodeURIComponent(title)}`);
    const data = await res.json();
    let items = data.items || data;
    if (!Array.isArray(items)) return false;
    const matches = items.filter(i => i.title === title && i.year === String(year));
    if (excludeId) return matches.some(i => i.id !== excludeId);
    return matches.length > 0;
  } catch {
    return false;
  }
}
async function isDuplicateSeries(title, year, excludeId = null) {
  try {
    const res = await fetch(`${API_BASE}?type=series&hasRating=true&search=${encodeURIComponent(title)}`);
    const data = await res.json();
    let items = data.items || data;
    if (!Array.isArray(items)) return false;
    const matches = items.filter(i => i.title === title && i.year === String(year));
    if (excludeId) return matches.some(i => i.id !== excludeId);
    return matches.length > 0;
  } catch {
    return false;
  }
}

/* ===========================
   Movies CRUD (via API)
   =========================== */
movieForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = movieIdInput.value || null;
  const title = document.getElementById('movie-title').value.trim();
  const year = parseInt(document.getElementById('movie-year').value, 10);
  const genre = document.getElementById('movie-genre').value;
  const rating = parseFloat(document.getElementById('movie-rating').value);

  if (!title) return showToast('اسم الفيلم مطلوب', 'error');
  if (!validYear(year)) return showToast('سنة غير صالحة', 'error');
  if (!genre) return showToast('اختر النوع', 'error');
  if (!validRating(rating)) return showToast('التقييم يجب يكون بين 0 و 100', 'error');

  const duplicate = await isDuplicateMovie(title, year, id);
  if (duplicate) return showToast('الفيلم موجود مسبقًا بنفس الاسم والسنة', 'error');

  try {
    if (id) {
      // Update
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          originalTitle: title,
          year: String(year),
          type: 'movie',
          genres: genre,
          userRating: rating,
          ratingStatus: 'watched',
          rewatch: false,
        })
      });
      if (!res.ok) throw new Error('Update failed');
      showToast('تم تحديث الفيلم', 'success');
    } else {
      // Create
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          originalTitle: title,
          year: String(year),
          type: 'movie',
          genres: genre,
          userRating: rating,
          ratingStatus: 'watched',
          rewatch: false,
        })
      });
      if (res.status === 409) {
        showToast('الفيلم موجود مسبقًا!', 'error');
        return;
      }
      if (!res.ok) throw new Error('Create failed');
      showToast('تمت إضافة الفيلم', 'success');
    }

    resetMovieForm();
    await Promise.all([loadMoviesRecent(), loadStatsData()]);
  } catch (error) {
    console.error(error);
    showToast('فشلت العملية', 'error');
  }
});

async function editMovie(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    if (!data) return showToast('تعذر تحميل بيانات الفيلم للتعديل', 'error');

    movieIdInput.value = data.id;
    document.getElementById('movie-title').value = data.title || '';
    document.getElementById('movie-year').value = data.year || '';
    document.getElementById('movie-genre').value = Array.isArray(data.genres) ? (data.genres[0] || '') : ((data.genres || '').split(',')[0] || '');
    document.getElementById('movie-rating').value = data.userRating ?? '';

    movieFormTitle.textContent = 'تعديل فيلم';
    movieSubmitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ التعديل';
    movieCancelEdit.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error(error);
    showToast('تعذر تحميل بيانات الفيلم', 'error');
  }
}
window.editMovie = editMovie;

movieCancelEdit.addEventListener('click', resetMovieForm);
function resetMovieForm() {
  movieForm.reset();
  movieIdInput.value = '';
  movieFormTitle.textContent = 'إضافة فيلم جديد';
  movieSubmitBtn.innerHTML = '<i class="fas fa-plus"></i> إضافة الفيلم';
  movieCancelEdit.hidden = true;
}

async function deleteMovie(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الفيلم؟')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    showToast('تم حذف الفيلم', 'success');
    await Promise.all([loadMoviesRecent(), loadStatsData()]);
  } catch (error) {
    console.error(error);
    showToast('فشل حذف الفيلم', 'error');
  }
}
window.deleteMovie = deleteMovie;

/* ===========================
   Series CRUD (via API)
   =========================== */
seriesForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = seriesIdInput.value || null;
  const title = document.getElementById('series-title').value.trim();
  const year = parseInt(document.getElementById('series-year').value, 10);
  const seasons = parseInt(document.getElementById('series-seasons').value, 10);
  const rating = parseFloat(document.getElementById('series-rating').value);
  if (!title) return showToast('اسم المسلسل مطلوب', 'error');
  if (!validYear(year)) return showToast('سنة غير صالحة', 'error');
  if (!Number.isInteger(seasons) || seasons < 1 || seasons > 100) return showToast('عدد المواسم غير صحيح', 'error');
  if (!validRating(rating)) return showToast('التقييم يجب يكون بين 0 و 100', 'error');

  const duplicate = await isDuplicateSeries(title, year, id);
  if (duplicate) return showToast('المسلسل موجود مسبقًا بنفس الاسم والسنة', 'error');

  try {
    if (id) {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          originalTitle: title,
          year: String(year),
          type: 'series',
          seasons,
          userRating: rating,
          rewatch: false,
          ratingStatus: 'watched',
        })
      });
      if (!res.ok) throw new Error('Update failed');
      showToast('تم تحديث المسلسل', 'success');
    } else {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          originalTitle: title,
          year: String(year),
          type: 'series',
          seasons,
          userRating: rating,
          rewatch: false,
          ratingStatus: 'watched',
        })
      });
      if (res.status === 409) {
        showToast('المسلسل موجود مسبقًا!', 'error');
        return;
      }
      if (!res.ok) throw new Error('Create failed');
      showToast('تمت إضافة المسلسل', 'success');
    }

    resetSeriesForm();
    await Promise.all([loadSeriesRecent(), loadStatsData()]);
  } catch (error) {
    console.error(error);
    showToast('فشلت العملية', 'error');
  }
});

async function editSeries(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    if (!data) return showToast('تعذر تحميل بيانات المسلسل للتعديل', 'error');

    seriesIdInput.value = data.id;
    document.getElementById('series-title').value = data.title || '';
    document.getElementById('series-year').value = data.year || '';
    document.getElementById('series-seasons').value = data.seasons || '';
    document.getElementById('series-rating').value = data.userRating ?? '';

    seriesFormTitle.textContent = 'تعديل مسلسل';
    seriesSubmitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ التعديل';
    seriesCancelEdit.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error(error);
    showToast('تعذر تحميل بيانات المسلسل', 'error');
  }
}
window.editSeries = editSeries;

seriesCancelEdit.addEventListener('click', resetSeriesForm);
function resetSeriesForm() {
  seriesForm.reset();
  seriesIdInput.value = '';
  seriesFormTitle.textContent = 'إضافة مسلسل جديد';
  seriesSubmitBtn.innerHTML = '<i class="fas fa-plus"></i> إضافة المسلسل';
  seriesCancelEdit.hidden = true;
}

async function deleteSeries(id) {
  if (!confirm('هل أنت متأكد من حذف هذا المسلسل؟')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    showToast('تم حذف المسلسل', 'success');
    await Promise.all([loadSeriesRecent(), loadStatsData()]);
  } catch (error) {
    console.error(error);
    showToast('فشل حذف المسلسل', 'error');
  }
}
window.deleteSeries = deleteSeries;

/* ===========================
   Bind filters
   =========================== */
function bindFilters() {
  movieSearch.addEventListener('input', () => {
    clearTimeout(movieSearchTimer);
    movieSearchTimer = setTimeout(renderMovies, 250);
  });

  [filterGenre, filterYear, filterMinRating, sortMovies].forEach((el) => {
    el.addEventListener('change', renderMovies);
    el.addEventListener('input', renderMovies);
  });

  clearMovieFiltersBtn.addEventListener('click', () => {
    movieSearch.value = '';
    filterGenre.value = '';
    filterYear.value = '';
    filterMinRating.value = '';
    sortMovies.value = 'latest_added';
    if (printLimitSelect) printLimitSelect.value = 'all';
    renderMovies();
  });

  if (printMovieFiltersBtn) {
    printMovieFiltersBtn.addEventListener('click', printFilteredMovies);
  }

  seriesSearch.addEventListener('input', () => {
    clearTimeout(seriesSearchTimer);
    seriesSearchTimer = setTimeout(renderSeries, 250);
  });

  [filterSeriesYear, filterSeriesMinRating, sortSeries].forEach((el) => {
    el.addEventListener('change', renderSeries);
    el.addEventListener('input', renderSeries);
  });

  clearSeriesFiltersBtn.addEventListener('click', () => {
    seriesSearch.value = '';
    filterSeriesYear.value = '';
    filterSeriesMinRating.value = '';
    sortSeries.value = 'latest_added';
    renderSeries();
  });
}

/* ===========================
   Movie Night Picker
   =========================== */
movieNightBtn.addEventListener('click', () => {
  const all = allMoviesForStats;
  if (!all.length) {
    movieNightResult.hidden = false;
    movieNightResult.innerHTML = 'ماكو أفلام مقيّمة حاليًا 😅';
    return;
  }
  const picked = all[Math.floor(Math.random() * all.length)];

  movieNightResult.hidden = false;
  movieNightResult.innerHTML = `
    <b>🎬 اختيار الليلة:</b> ${escapeHtml(picked.title)}<br>
    <small>${picked.year} • ${escapeHtml(picked.genre || 'Other')} • تقييمك: ${formatRating(picked.rating)}</small>
  `;
});

/* ===========================
   Init
   =========================== */
async function init() {
  var auth = localStorage.getItem('hussamvision_auth');
  if (auth !== 'true') {
    document.getElementById('auth-overlay').style.display = 'flex';
    document.querySelector('.container').style.display = 'none';
    return;
  }

  detectStandaloneMode();
  bindFilters();

  await Promise.all([
    loadMoviesRecent(),
    loadSeriesRecent(),
    loadStatsData()
  ]);
}
init();
