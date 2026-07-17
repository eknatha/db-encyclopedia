// ===== RENDER ENCYCLOPEDIA =====
const matrixData = databases.filter(d => ['pg','mysql','mongo','redis','valkey','cassandra','scylla','clickhouse','duckdb','elastic','cockroach','dynamodb','neo4j','timescale','qdrant','milvus','snowflake','bigquery'].includes(d.id));

function renderDB(db) {
  const typeColor = {
    'relational':'badge-type','document':'badge-type','keyvalue':'badge-cloud',
    'columnar':'badge-type','graph':'badge-acid','timeseries':'badge-type',
    'newsql':'badge-popular','search':'badge-type',
    'vector':'badge-acid','warehouse':'badge-popular'
  };
  const accentColors = {
    'relational':'#336791','document':'#47A248','keyvalue':'#DC382D',
    'columnar':'#FFCC00','graph':'#008CC1','timeseries':'#22ADF6',
    'newsql':'#6933FF','search':'#005571',
    'vector':'#DC244C','warehouse':'#29B5E8'
  };
  const col = db.color || accentColors[db.category] || '#4f8ef7';
  return `
  <div class="db-card" onclick="toggleCard(this)"
    data-category="${db.category}"
    data-acid="${db.acid}"
    data-cloud="${db.cloud}"
    data-popular="${db.popular}"
    data-k8s="${db.k8s}"
    data-opensource="${db.opensource}"
    data-name="${db.name.toLowerCase()}"
    data-tagline="${db.tagline.toLowerCase()}"
    data-bestfor="${db.bestFor.toLowerCase()}"
    style="--card-color:${col}">
    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${col};border-radius:var(--radius-lg) var(--radius-lg) 0 0;opacity:0.8"></div>
    <div class="db-card-header">
      <div>
        <div class="db-logo" style="background:${col}22;font-size:1.8rem">${db.icon}</div>
      </div>
      <div class="db-badges">
        <span class="badge badge-type">${db.type.split(' ')[0]}</span>
        ${db.acid ? '<span class="badge badge-acid">ACID</span>' : '<span class="badge badge-noac">BASE</span>'}
        ${db.popular ? '<span class="badge badge-popular">Popular</span>' : ''}
        ${db.k8s ? '<span class="badge badge-cloud">K8s ✓</span>' : ''}
      </div>
    </div>
    <div class="db-name">${db.name}</div>
    <div class="db-tagline">${db.tagline}</div>
    <div class="db-meta">
      <div class="db-meta-item">
        <span class="db-meta-label">License</span>
        <span class="db-meta-value">${db.license}</span>
      </div>
      <div class="db-meta-item">
        <span class="db-meta-label">K8s Operator</span>
        <span class="db-meta-value">${db.k8sOp}</span>
      </div>
      <div class="db-meta-item">
        <span class="db-meta-label">H-Scale</span>
        <span class="db-meta-value">${db.hscale ? '✅ Yes' : '❌ Limited'}</span>
      </div>
      <div class="db-meta-item">
        <span class="db-meta-label">Cloud</span>
        <span class="db-meta-value">${db.cloud ? '✅ Managed' : '❌ Self-host'}</span>
      </div>
    </div>
    <div class="db-card-expanded">
      <div class="db-detail-section">
        <div class="db-detail-label">Overview</div>
        <div class="db-detail-content">${db.description}</div>
      </div>
      <div class="db-detail-section">
        <div class="db-detail-label">Best For</div>
        <div class="db-use-cases">${db.usecases.map(u=>`<span class="use-case-tag">${u}</span>`).join('')}</div>
      </div>
      <div class="db-detail-section">
        <div class="db-detail-label">Cloud Services</div>
        <div class="db-detail-content">${db.cloudServices}</div>
      </div>
      <div class="db-detail-section">
        <div class="db-detail-label">Protocols</div>
        <div class="db-detail-content">${db.protocols.join(' · ')}</div>
      </div>
    </div>
  </div>`;
}

document.getElementById('db-grid').innerHTML = databases.map(renderDB).join('');

// ===== RENDER MATRIX =====
function renderMatrix(data) {
  document.getElementById('matrix-body').innerHTML = data.map(db => `
  <tr>
    <td><div class="matrix-db-name"><span>${db.icon}</span> ${db.name}</div></td>
    <td><span class="badge badge-type">${db.type.split('(')[0].trim()}</span></td>
    <td>${db.acid ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}</td>
    <td>${db.hscale ? '<span class="check">✓</span>' : '<span class="partial">~</span>'}</td>
    <td>${db.k8s ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}</td>
    <td>${db.cloud ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}</td>
    <td>${db.opensource ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}</td>
    <td style="font-size:0.78rem;color:var(--text2)">${db.bestFor.split(',')[0]}</td>
  </tr>`).join('');
}
renderMatrix(matrixData);



// ===== FILTERS =====
let activeCategory = 'all';
let activeTag = 'all';
let searchQuery = '';

function filterByCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.universe-card').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
  applyFilters();
}

function filterTag(btn, tag) {
  activeTag = tag;
  document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function searchDBs(query) {
  searchQuery = query.toLowerCase();
  applyFilters();
}

function applyFilters() {
  document.querySelectorAll('.db-card').forEach(card => {
    const catMatch = activeCategory === 'all' || card.dataset.category === activeCategory;
    const tagMatch = activeTag === 'all' ||
      (activeTag === 'acid' && card.dataset.acid === 'true') ||
      (activeTag === 'cloud' && card.dataset.cloud === 'true') ||
      (activeTag === 'popular' && card.dataset.popular === 'true') ||
      (activeTag === 'k8s' && card.dataset.k8s === 'true') ||
      (activeTag === 'open' && card.dataset.opensource === 'true');
    const searchMatch = !searchQuery ||
      card.dataset.name.includes(searchQuery) ||
      card.dataset.tagline.includes(searchQuery) ||
      card.dataset.bestfor.includes(searchQuery) ||
      card.dataset.category.includes(searchQuery);
    card.style.display = (catMatch && tagMatch && searchMatch) ? '' : 'none';
  });
}

function toggleCard(card) {
  card.classList.toggle('open');
}

// ===== MATRIX FILTER =====
function matrixFilter(btn, type) {
  document.querySelectorAll('.matrix-filters .filter-tag').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  let filtered = matrixData;
  if (type === 'relational') filtered = matrixData.filter(d => d.category === 'relational');
  else if (type === 'nosql') filtered = matrixData.filter(d => d.category !== 'relational' && d.category !== 'newsql');
  else if (type === 'cloud') filtered = matrixData.filter(d => d.cloud);
  renderMatrix(filtered);
}

function sortMatrix(field) {
  const body = document.getElementById('matrix-body');
  const rows = Array.from(body.querySelectorAll('tr'));
  rows.sort((a,b) => {
    const aVal = a.querySelector('td').textContent.trim();
    const bVal = b.querySelector('td').textContent.trim();
    return aVal.localeCompare(bVal);
  });
  rows.forEach(r => body.appendChild(r));
}

// ===== CHEATSHEETS =====
function switchCheat(btn, id) {
  document.querySelectorAll('.cheat-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.cheat-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('cheat-'+id).classList.add('active');
}

function copyCode(btn) {
  const code = btn.closest('.cheat-block').querySelector('.cheat-code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.color = 'var(--accent3)';
    setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1500);
  });
}

