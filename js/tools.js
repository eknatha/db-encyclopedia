// ============================================================
// DB TOOLS DIRECTORY — 12 FULLY FUNCTIONAL OFFLINE TOOLS
// ============================================================

const toolsData = [
  { name:'PG Config Tuner', id:'pgtuning', icon:'🔧', color:'#336791', desc:'Input your server RAM & CPU — get optimised postgresql.conf values instantly.' },
  { name:'Slow Query Analyzer', id:'slowquery', icon:'🐌', color:'#f7724f', desc:'Paste an EXPLAIN output and get index recommendations and a performance diagnosis.' },
  { name:'Connection Pool Sizer', id:'connpool', icon:'🔌', color:'#4f8ef7', desc:'Calculate optimal PgBouncer / ProxySQL pool size for your app servers.' },
  { name:'DB Migration Planner', id:'dbmigration', icon:'🔄', color:'#00d4aa', desc:'Choose source and target databases — get a step-by-step migration checklist.' },
  { name:'Replication Explainer', id:'replication', icon:'📡', color:'#7c5fe6', desc:'Interactive visualiser: sync vs async replication, lag, failover patterns.' },
  { name:'Index Strategy Advisor', id:'indexlab', icon:'📇', color:'#f7c94f', desc:'Describe your query pattern — get the right index type with CREATE INDEX DDL.' },
  { name:'DB Security Checklist', id:'dbsecurity', icon:'🔐', color:'#e84f7e', desc:'Interactive hardening checklist for PostgreSQL, MySQL, MongoDB, and Redis.' },
  { name:'Backup Strategy Guide', id:'backupdb', icon:'💾', color:'#47A248', desc:'Pick your database and RPO/RTO goals — get a complete backup strategy.' },
  { name:'Cache Layer Picker', id:'cachelab', icon:'⚡', color:'#DC382D', desc:'Redis vs Memcached vs DragonflyDB — pick the right caching tool for your use case.' },
  { name:'Cloud DB Cost Calculator', id:'dbcost', icon:'💰', color:'#FF9900', desc:'Estimate and compare monthly costs: RDS vs Aurora vs self-managed on EC2.' },
  { name:'DB Ops K8s Guide', id:'dbops', icon:'☸️', color:'#326CE5', desc:'Interactive Kubernetes database deployment guide with operator selection.' },
  { name:'SQL to NoSQL Mapper', id:'sqlnosql', icon:'🔁', color:'#48A999', desc:'Translate SQL concepts to MongoDB, Cassandra, DynamoDB equivalents.' },
];

// Render tool cards
document.getElementById('tools-grid').innerHTML = toolsData.map(t => `
  <div class="tool-card" onclick="openTool('${t.id}')" style="--tc:${t.color}">
    <div class="tool-open-hint">↗ Open</div>
    <div class="tool-card-accent" style="background:${t.color}"></div>
    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${t.color};border-radius:var(--radius) var(--radius) 0 0"></div>
    <div class="tool-icon">${t.icon}</div>
    <div class="tool-name">${t.name}</div>
    <div class="tool-desc">${t.desc}</div>
    <span class="tool-badge tool-badge-live">● Live</span>
  </div>`).join('');

function openTool(id) {
  const t = toolsData.find(x => x.id === id);
  if (!t) return;
  document.getElementById('tool-modal-title').innerHTML = `${t.icon} ${t.name}`;
  document.getElementById('tool-modal-body').innerHTML = toolRenders[id] ? toolRenders[id]() : '<p>Tool coming soon.</p>';
  document.getElementById('tool-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  // Initialize tool UI after DOM is set
  const inits = {
    pgtuning:    ()=>pgTune(),
    connpool:    ()=>calcPool(),
    dbmigration: ()=>renderMigration(),
    replication: ()=>renderRep(),
    indexlab:    ()=>renderIdx(),
    backupdb:    ()=>renderBackup(),
    dbcost:      ()=>calcCost(),
    dbops:       ()=>renderK8sGuide(),
    sqlnosql:    ()=>renderMap(),
    cachelab:    ()=>{ /* cache picker: user clicks a use case button */ },
    slowquery:   ()=>{ /* slow query: user pastes and clicks analyze */ },
    dbsecurity:  ()=>{ /* security: checkboxes rendered with state from localStorage */ },
  };
  if (inits[id]) setTimeout(inits[id], 0);
}

function closeToolModal() {
  document.getElementById('tool-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeToolModal(); });

function toolCopy(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.innerText).then(() => {
    const btn = el.previousElementSibling;
    if (btn && btn.classList.contains('tool-copy-btn')) {
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.color = 'var(--accent3)';
      setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1500);
    }
  });
}

// ============================================================
const toolRenders = {

// ── 1. PG CONFIG TUNER ────────────────────────────────────────
pgtuning: () => `
<div class="tool-label">Server Specifications</div>
<div class="tool-row">
  <div style="flex:1">
    <div class="tool-label">RAM (GB)</div>
    <input class="tool-input" type="number" id="pg-ram" value="16" min="1" max="1024" oninput="pgTune()">
  </div>
  <div style="flex:1">
    <div class="tool-label">CPU Cores</div>
    <input class="tool-input" type="number" id="pg-cpu" value="8" min="1" max="256" oninput="pgTune()">
  </div>
  <div style="flex:1">
    <div class="tool-label">Storage Type</div>
    <select class="tool-select" id="pg-storage" onchange="pgTune()">
      <option value="ssd">SSD / NVMe</option>
      <option value="hdd">HDD</option>
    </select>
  </div>
  <div style="flex:1">
    <div class="tool-label">Workload</div>
    <select class="tool-select" id="pg-workload" onchange="pgTune()">
      <option value="oltp">OLTP (Web App)</option>
      <option value="olap">OLAP / Analytics</option>
      <option value="mixed">Mixed</option>
    </select>
  </div>
</div>
<div class="tool-label" style="margin-bottom:.4rem">Generated postgresql.conf
  <button class="tool-copy-btn" onclick="toolCopy('pg-output')">Copy</button>
</div>
<div class="tool-output" id="pg-output">Loading...</div>
`,

// ── 2. SLOW QUERY ANALYZER ────────────────────────────────────
slowquery: () => `
<div class="tool-label">Paste PostgreSQL EXPLAIN (ANALYZE) output</div>
<textarea class="tool-textarea" id="sq-input" rows="10" placeholder="Paste EXPLAIN ANALYZE output here...
Example:
Seq Scan on orders  (cost=0.00..18584.00 rows=1000000 width=72) (actual time=0.027..142.804 rows=1000000 loops=1)
  Filter: (status = 'pending')
  Rows Removed by Filter: 500000
Planning Time: 0.5 ms
Execution Time: 156.3 ms"></textarea>
<div class="tool-row" style="margin-top:.75rem">
  <button class="tool-btn" onclick="analyzeSQ()">Analyze ✦</button>
  <button class="tool-btn-sec" onclick="sqExample()">Load Example</button>
</div>
<div id="sq-result" style="margin-top:1rem"></div>
`,

// ── 3. CONNECTION POOL SIZER ──────────────────────────────────
connpool: () => `
<div class="tool-label">Your Environment</div>
<div class="tool-grid-2">
  <div>
    <div class="tool-label">App Servers / Pods</div>
    <input class="tool-input" type="number" id="cp-servers" value="10" min="1" oninput="calcPool()">
  </div>
  <div>
    <div class="tool-label">Threads / Workers per Server</div>
    <input class="tool-input" type="number" id="cp-threads" value="4" min="1" oninput="calcPool()">
  </div>
  <div>
    <div class="tool-label">Avg Query Duration (ms)</div>
    <input class="tool-input" type="number" id="cp-query-ms" value="20" min="1" oninput="calcPool()">
  </div>
  <div>
    <div class="tool-label">Target Max Requests/sec</div>
    <input class="tool-input" type="number" id="cp-rps" value="500" min="1" oninput="calcPool()">
  </div>
  <div>
    <div class="tool-label">DB Server RAM (GB)</div>
    <input class="tool-input" type="number" id="cp-ram" value="16" min="1" oninput="calcPool()">
  </div>
  <div>
    <div class="tool-label">Pooler</div>
    <select class="tool-select" id="cp-pooler" onchange="calcPool()">
      <option value="pgbouncer">PgBouncer</option>
      <option value="proxysql">ProxySQL (MySQL)</option>
      <option value="rdsproxy">RDS Proxy</option>
    </select>
  </div>
</div>
<div id="cp-result" style="margin-top:1.25rem"></div>
`,

// ── 4. DB MIGRATION PLANNER ───────────────────────────────────
dbmigration: () => `
<div class="tool-row">
  <div style="flex:1">
    <div class="tool-label">From Database</div>
    <select class="tool-select" style="width:100%" id="mig-from" onchange="renderMigration()">
      <option value="mysql">MySQL</option>
      <option value="postgresql" selected>PostgreSQL</option>
      <option value="mongodb">MongoDB</option>
      <option value="sqlite">SQLite</option>
      <option value="oracle">Oracle DB</option>
      <option value="mssql">SQL Server</option>
    </select>
  </div>
  <div style="font-size:2rem;align-self:flex-end;padding-bottom:.5rem">→</div>
  <div style="flex:1">
    <div class="tool-label">To Database</div>
    <select class="tool-select" style="width:100%" id="mig-to" onchange="renderMigration()">
      <option value="postgresql" selected>PostgreSQL</option>
      <option value="mysql">MySQL</option>
      <option value="mongodb">MongoDB</option>
      <option value="cockroachdb">CockroachDB</option>
      <option value="aurora">Aurora (AWS)</option>
      <option value="cloudsql">Cloud SQL (GCP)</option>
    </select>
  </div>
</div>
<div id="mig-result" style="margin-top:1.25rem"></div>
`,

// ── 5. REPLICATION EXPLAINER ──────────────────────────────────
replication: () => `
<div class="tool-row">
  <div style="flex:1">
    <div class="tool-label">Database</div>
    <select class="tool-select" style="width:100%" id="rep-db" onchange="renderRep()">
      <option value="postgresql">PostgreSQL</option>
      <option value="mysql">MySQL</option>
      <option value="mongodb">MongoDB</option>
      <option value="redis">Redis</option>
      <option value="cassandra">Cassandra</option>
    </select>
  </div>
  <div style="flex:1">
    <div class="tool-label">Replication Mode</div>
    <select class="tool-select" style="width:100%" id="rep-mode" onchange="renderRep()">
      <option value="async">Asynchronous</option>
      <option value="sync">Synchronous</option>
      <option value="semi">Semi-Synchronous</option>
    </select>
  </div>
</div>
<div id="rep-result" style="margin-top:1.25rem"></div>
`,

// ── 6. INDEX STRATEGY ADVISOR ─────────────────────────────────
indexlab: () => `
<div class="tool-grid-2">
  <div>
    <div class="tool-label">Database</div>
    <select class="tool-select" style="width:100%" id="idx-db" onchange="renderIdx()">
      <option value="postgresql">PostgreSQL</option>
      <option value="mysql">MySQL</option>
      <option value="mongodb">MongoDB</option>
    </select>
  </div>
  <div>
    <div class="tool-label">Query Pattern</div>
    <select class="tool-select" style="width:100%" id="idx-pattern" onchange="renderIdx()">
      <option value="equality">Equality (WHERE col = value)</option>
      <option value="range">Range (WHERE col > x AND col < y)</option>
      <option value="composite">Composite (WHERE a = x AND b > y ORDER BY c)</option>
      <option value="fulltext">Full-Text Search</option>
      <option value="json">JSON / Document Field</option>
      <option value="array">Array Containment</option>
      <option value="unique">Uniqueness Enforcement</option>
      <option value="partial">Partial (WHERE is_active = true)</option>
      <option value="covering">Covering / Index-Only Scan</option>
    </select>
  </div>
  <div>
    <div class="tool-label">Table / Collection Name</div>
    <input class="tool-input" id="idx-table" value="orders" oninput="renderIdx()">
  </div>
  <div>
    <div class="tool-label">Column(s)</div>
    <input class="tool-input" id="idx-col" value="user_id, created_at" oninput="renderIdx()">
  </div>
</div>
<div id="idx-result" style="margin-top:1.25rem"></div>
`,

// ── 7. DB SECURITY CHECKLIST ──────────────────────────────────
dbsecurity: () => {
  const items = {
    PostgreSQL:[
      'Change default postgres superuser password immediately',
      'Disable trust authentication in pg_hba.conf — use scram-sha-256',
      'Create dedicated application user — never connect as postgres',
      'Restrict app user: GRANT only SELECT/INSERT/UPDATE/DELETE, not DDL',
      'Enable Row-Level Security (RLS) for multi-tenant applications',
      'Enable SSL/TLS: ssl=on in postgresql.conf, hostssl in pg_hba.conf',
      'Enable pg_audit extension for comprehensive audit logging',
      'Set log_min_duration_statement=1000 to log slow queries',
      'Restrict network access: bind to specific IP, not 0.0.0.0',
      'Enable connection pooling (PgBouncer) to limit direct DB connections',
      'Rotate passwords regularly — use Vault for dynamic secrets',
      'Encrypt sensitive columns with pgcrypto extension',
      'Disable unnecessary extensions and languages',
      'Set password_encryption=scram-sha-256 in postgresql.conf',
    ],
    MySQL:[
      'Run mysql_secure_installation after fresh install',
      'Remove anonymous accounts and test database',
      'Disable remote root login — allow only from localhost',
      'Create dedicated application user with minimal privileges',
      'Enable SSL/TLS for all connections (require_secure_transport=ON)',
      'Enable binary logging for audit trail and PITR',
      'Set validate_password plugin with MEDIUM or STRONG policy',
      'Enable MySQL Enterprise Audit or open-source alternative',
      'Restrict file system access: secure_file_priv=/safe/path',
      'Bind to specific IP: bind-address in my.cnf',
      'Enable max_connect_errors to block brute-force attempts',
      'Regularly review and revoke unused user privileges',
    ],
    MongoDB:[
      'Enable authentication: security.authorization=enabled in mongod.conf',
      'Disable MongoDB listening on all interfaces — bind to specific IP',
      'Create admin user before enabling auth',
      'Create role-specific users: never use admin for applications',
      'Enable TLS/SSL for all connections',
      'Enable MongoDB audit logging',
      'Disable JavaScript execution if not needed: javascriptEnabled=false',
      'Enable field-level encryption for sensitive data',
      'Regularly rotate service account credentials',
      'Enable IP whitelisting on MongoDB Atlas',
      'Use scram-sha-256 authentication mechanism',
    ],
    Redis:[
      'Set a strong requirepass in redis.conf — never run without auth',
      'Bind to specific IP — never bind to 0.0.0.0 in production',
      'Enable TLS: tls-port 6380 with cert/key files',
      'Rename or disable dangerous commands: RENAME-COMMAND FLUSHALL ""',
      'Rename CONFIG, SLAVEOF, DEBUG commands in production',
      'Use ACL system (Redis 6+) for user-level access control',
      'Set maxmemory to prevent OOM: maxmemory 4gb',
      'Enable appendonly for persistence (prevents data loss)',
      'Put Redis behind a firewall — never expose port 6379 to internet',
      'Monitor for suspicious commands with MONITOR (dev only)',
    ]
  };
  const saved = (() => { try { return JSON.parse(localStorage.getItem('eknathalabs_sec_check') || '{}'); } catch(e){return {};} })();
  const tabs = Object.keys(items);
  let html = `<div style="display:flex;gap:0;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:1.25rem;flex-wrap:wrap">
    ${tabs.map(t=>`<button onclick="secTab(this,'sec-${t}')" class="sec-tab-btn${t===tabs[0]?' active':''}" style="padding:10px 18px;background:${t===tabs[0]?'var(--accent)':'transparent'};color:${t===tabs[0]?'#fff':'var(--text2)'};border:none;font-family:var(--font);font-size:.82rem;font-weight:600;cursor:pointer;white-space:nowrap">${t}</button>`).join('')}
  </div>`;
  tabs.forEach((db, di) => {
    const doneKey = `sec_${db}`;
    const doneSet = new Set(saved[doneKey] || []);
    const pct = Math.round(doneSet.size / items[db].length * 100);
    html += `<div id="sec-${db}" class="sec-panel" style="display:${di===0?'block':'none'}">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
        <div style="flex:1;height:8px;background:var(--bg3);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${pct===100?'var(--accent3)':'var(--accent)'};transition:width .3s;border-radius:4px"></div>
        </div>
        <div style="font-family:var(--mono);font-size:.78rem;color:${pct===100?'var(--accent3)':'var(--text2)'}${pct===100?';font-weight:700':''}">${pct}% ${pct===100?'✅ Complete':''}</div>
        <button onclick="secReset('${db}')" style="background:transparent;border:1px solid var(--border);color:var(--text3);padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.7rem;font-family:var(--font)">Reset</button>
      </div>
      ${items[db].map((item, i) => `
        <div class="checklist-item" onclick="secToggle('${db}',${i},this)">
          <input type="checkbox" class="checklist-cb" ${doneSet.has(i)?'checked':''} readonly>
          <span class="checklist-text${doneSet.has(i)?' done':''}">${item}</span>
        </div>`).join('')}
    </div>`;
  });
  return html;
},

// ── 8. BACKUP STRATEGY GUIDE ──────────────────────────────────
backupdb: () => `
<div class="tool-grid-2">
  <div>
    <div class="tool-label">Database</div>
    <select class="tool-select" style="width:100%" id="bk-db" onchange="renderBackup()">
      <option value="postgresql">PostgreSQL</option>
      <option value="mysql">MySQL</option>
      <option value="mongodb">MongoDB</option>
      <option value="redis">Redis</option>
    </select>
  </div>
  <div>
    <div class="tool-label">Recovery Point Objective (RPO)</div>
    <select class="tool-select" style="width:100%" id="bk-rpo" onchange="renderBackup()">
      <option value="zero">Zero (no data loss)</option>
      <option value="minutes">Minutes (< 5 min loss)</option>
      <option value="hour">Hours (< 1 hour loss)</option>
      <option value="day">Daily (up to 24h loss OK)</option>
    </select>
  </div>
</div>
<div id="bk-result" style="margin-top:1.25rem"></div>
`,

// ── 9. CACHE LAYER PICKER ─────────────────────────────────────
cachelab: () => `
<div class="tool-label">What is your primary use case?</div>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.5rem;margin-bottom:1.5rem">
  ${[['cache','⚡','Simple Cache'],['session','👤','Session Store'],['queue','📬','Job Queue'],['pubsub','📢','Pub/Sub'],['leaderboard','🏆','Leaderboard'],['ratelimit','🚦','Rate Limiting'],['lock','🔒','Distributed Lock'],['timeseries','📈','Time Series']]
  .map(([k,i,l])=>`<button onclick="cacheUseCase('${k}')" class="cache-uc-btn" data-uc="${k}" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:.75rem;cursor:pointer;font-family:var(--font);font-size:.78rem;color:var(--text2);text-align:center;transition:all .2s"><div style="font-size:1.3rem;margin-bottom:.25rem">${i}</div>${l}</button>`).join('')}
</div>
<div id="cache-result"></div>
`,

// ── 10. CLOUD DB COST CALCULATOR ─────────────────────────────
dbcost: () => `
<div class="tool-label">Configuration</div>
<div class="tool-grid-2">
  <div>
    <div class="tool-label">Database Engine</div>
    <select class="tool-select" style="width:100%" id="cost-engine" onchange="calcCost()">
      <option value="postgresql">PostgreSQL</option>
      <option value="mysql">MySQL</option>
    </select>
  </div>
  <div>
    <div class="tool-label">Cloud Provider</div>
    <select class="tool-select" style="width:100%" id="cost-cloud" onchange="calcCost()">
      <option value="aws">AWS</option>
      <option value="gcp">GCP</option>
      <option value="azure">Azure</option>
    </select>
  </div>
  <div>
    <div class="tool-label">Instance Size</div>
    <select class="tool-select" style="width:100%" id="cost-size" onchange="calcCost()">
      <option value="small">Small (2 vCPU, 8GB RAM)</option>
      <option value="medium" selected>Medium (4 vCPU, 16GB RAM)</option>
      <option value="large">Large (8 vCPU, 32GB RAM)</option>
      <option value="xlarge">XLarge (16 vCPU, 64GB RAM)</option>
    </select>
  </div>
  <div>
    <div class="tool-label">Storage (GB)</div>
    <input class="tool-input" type="number" id="cost-storage" value="100" min="20" oninput="calcCost()">
  </div>
  <div>
    <div class="tool-label">Replicas / Read Replicas</div>
    <input class="tool-input" type="number" id="cost-replicas" value="1" min="0" max="5" oninput="calcCost()">
  </div>
  <div>
    <div class="tool-label">Deployment</div>
    <select class="tool-select" style="width:100%" id="cost-deploy" onchange="calcCost()">
      <option value="managed">Managed (RDS/Cloud SQL)</option>
      <option value="aurora">Aurora / AlloyDB / Flex</option>
      <option value="selfmanaged">Self-Managed on EC2/VM</option>
    </select>
  </div>
</div>
<div id="cost-result" style="margin-top:1.5rem"></div>
`,

// ── 11. DB OPS K8S GUIDE ──────────────────────────────────────
dbops: () => `
<div class="tool-row">
  <div style="flex:1">
    <div class="tool-label">Database</div>
    <select class="tool-select" style="width:100%" id="k8s-db" onchange="renderK8sGuide()">
      <option value="postgresql">PostgreSQL</option>
      <option value="mysql">MySQL</option>
      <option value="mongodb">MongoDB</option>
      <option value="redis">Redis</option>
      <option value="cassandra">Cassandra</option>
      <option value="elasticsearch">Elasticsearch</option>
    </select>
  </div>
</div>
<div id="k8s-result" style="margin-top:1.25rem"></div>
`,

// ── 12. SQL TO NOSQL MAPPER ───────────────────────────────────
sqlnosql: () => `
<div class="tool-row">
  <div style="flex:1">
    <div class="tool-label">Target NoSQL Database</div>
    <select class="tool-select" style="width:100%" id="map-db" onchange="renderMap()">
      <option value="mongodb">MongoDB</option>
      <option value="cassandra">Cassandra</option>
      <option value="dynamodb">DynamoDB</option>
      <option value="redis">Redis</option>
    </select>
  </div>
  <div style="flex:1">
    <div class="tool-label">SQL Concept</div>
    <select class="tool-select" style="width:100%" id="map-concept" onchange="renderMap()">
      <option value="table">Table / Schema</option>
      <option value="query">SELECT Query</option>
      <option value="insert">INSERT</option>
      <option value="update">UPDATE</option>
      <option value="delete">DELETE</option>
      <option value="join">JOIN</option>
      <option value="aggregate">Aggregation / GROUP BY</option>
      <option value="index">Index</option>
      <option value="transaction">Transaction</option>
    </select>
  </div>
</div>
<div id="map-result" style="margin-top:1.25rem"></div>`


}; // end toolRenders




// ===== TOOL FUNCTIONS (extracted from renders) =====
function pgTune() {
  const ram = parseInt(document.getElementById('pg-ram').value) || 16;
  const cpu = parseInt(document.getElementById('pg-cpu').value) || 8;
  const ssd = document.getElementById('pg-storage').value === 'ssd';
  const wl = document.getElementById('pg-workload').value;
  const sb = Math.round(ram * 0.25);
  const ec = Math.round(ram * 0.75);
  const wm = wl === 'olap' ? Math.min(Math.round(ram * 0.05), 2048) : Math.min(Math.round(ram * 0.02 * 1024 / 100), 256);
  const mwm = Math.min(Math.round(ram * 0.05 * 1024), 2048);
  const mxc = wl === 'olap' ? 50 : Math.min(ram * 10, 500);
  const wks = wl === 'olap' ? Math.min(cpu, 8) : 0;
  document.getElementById('pg-output').textContent =
`# ─── postgresql.conf — Generated by EknathaLabs DB Tools ───
# Server: ${ram}GB RAM | ${cpu} CPU cores | ${ssd?'SSD':'HDD'} | ${wl.toUpperCase()} workload

# ── Memory ─────────────────────────────────────────
shared_buffers = ${sb}GB                # 25% of RAM
effective_cache_size = ${ec}GB          # 75% of RAM (planner hint)
work_mem = ${wm}MB                      # per sort/hash op
maintenance_work_mem = ${mwm}MB         # VACUUM, CREATE INDEX
huge_pages = try                         # use huge pages if available

# ── Connections ────────────────────────────────────
max_connections = ${mxc}               # use PgBouncer — don't raise this alone
superuser_reserved_connections = 3

# ── Parallelism ────────────────────────────────────
max_worker_processes = ${cpu}
max_parallel_workers_per_gather = ${wks || Math.min(Math.floor(cpu/2),4)}
max_parallel_workers = ${Math.min(cpu,16)}
max_parallel_maintenance_workers = ${Math.min(Math.floor(cpu/4),4)}

# ── WAL & Checkpoints ──────────────────────────────
wal_level = replica
max_wal_size = ${Math.min(ram,16)}GB
min_wal_size = ${Math.max(Math.round(ram*0.1),1)}GB
checkpoint_completion_target = 0.9
wal_compression = on
wal_buffers = ${Math.min(64,Math.round(sb*16))}MB

# ── I/O ────────────────────────────────────────────
random_page_cost = ${ssd?1.1:4.0}      # 1.1 for SSD, 4.0 for HDD
effective_io_concurrency = ${ssd?200:2} # 200 for SSD, 2 for HDD
synchronous_commit = on

# ── Logging ────────────────────────────────────────
log_min_duration_statement = 1000       # log queries > 1 second
log_checkpoints = on
log_lock_waits = on
log_temp_files = 0

# ── Statistics ─────────────────────────────────────
default_statistics_target = ${wl==='olap'?500:100}
track_io_timing = on`;
}

function sqExample() {
  document.getElementById('sq-input').value =
`Hash Join  (cost=21.50..58.95 rows=1000 width=64) (actual time=0.412..1.243 rows=1000 loops=1)
  Hash Cond: (o.user_id = u.id)
  ->  Seq Scan on orders o  (cost=0.00..29.00 rows=1900 width=48) (actual time=0.009..0.241 rows=1900 loops=1)
        Filter: (status = 'completed')
        Rows Removed by Filter: 100
  ->  Hash  (cost=14.00..14.00 rows=600 width=20) (actual time=0.298..0.298 rows=600 loops=1)
        Buckets: 1024  Batches: 1  Memory Usage: 36kB
        ->  Seq Scan on users u  (cost=0.00..14.00 rows=600 width=20) (actual time=0.004..0.121 rows=600 loops=1)
Planning Time: 1.2 ms
Execution Time: 1.9 ms`;
  analyzeSQ();
}
function analyzeSQ() {
  const txt = document.getElementById('sq-input').value;
  if (!txt.trim()) return;
  const res = document.getElementById('sq-result');
  const issues = [], tips = [], indexes = [];
  const execMatch = txt.match(/Execution Time:\s*([\d.]+)\s*ms/);
  const planMatch = txt.match(/Planning Time:\s*([\d.]+)\s*ms/);
  const execTime = execMatch ? parseFloat(execMatch[1]) : null;
  const seqScans = (txt.match(/Seq Scan on (\w+)/g) || []);
  const filters = (txt.match(/Rows Removed by Filter:\s*(\d+)/g) || []);
  const hashBatches = txt.match(/Batches:\s*([2-9]\d*)/);
  const nestedLoops = (txt.match(/Nested Loop/g) || []).length;
  const tables = [...new Set((txt.match(/(?:Seq Scan|Index Scan|Index Only Scan) on (\w+)/g) || []).map(m => m.split(' on ')[1]))];

  if (execTime !== null) {
    const grade = execTime < 10 ? {c:'var(--accent3)',g:'Fast'} : execTime < 100 ? {c:'var(--accent5)',g:'Acceptable'} : execTime < 1000 ? {c:'var(--accent4)',g:'Slow'} : {c:'#ff4444',g:'Very Slow'};
    res.innerHTML = `<div class="tool-grid-3" style="margin-bottom:1rem">
      <div class="tool-stat"><div class="tool-stat-num" style="color:${grade.c}">${execTime}ms</div><div class="tool-stat-lbl">Execution Time</div></div>
      <div class="tool-stat"><div class="tool-stat-num">${planMatch?planMatch[1]+'ms':'—'}</div><div class="tool-stat-lbl">Planning Time</div></div>
      <div class="tool-stat"><div class="tool-stat-num" style="color:${grade.c}">${grade.g}</div><div class="tool-stat-lbl">Grade</div></div>
    </div>`;
  } else res.innerHTML = '';

  if (seqScans.length) {
    seqScans.forEach(s => {
      const tbl = s.replace('Seq Scan on ','');
      issues.push(`Sequential scan on <strong>${tbl}</strong> — reads every row. Add an index on your WHERE clause columns.`);
      indexes.push(`CREATE INDEX CONCURRENTLY idx_${tbl}_<column> ON ${tbl}(<your_where_column>);`);
    });
  }
  if (filters.length) {
    filters.forEach(f => {
      const n = parseInt(f.match(/\d+/)[0]);
      if (n > 1000) issues.push(`<strong>${n.toLocaleString()} rows removed by filter</strong> — large number of rows scanned then discarded. This suggests a missing or unused index.`);
    });
  }
  if (hashBatches) issues.push(`Hash Join using disk batches (${hashBatches[1]}) — not enough work_mem. Increase <code>work_mem</code> or add <code>SET work_mem='256MB'</code> for this session.`);
  if (nestedLoops > 2) issues.push(`<strong>${nestedLoops} nested loops</strong> detected — can cause O(n²) execution. Ensure join columns are indexed on both tables.`);
  if (execTime && execTime > 1000) tips.push('Run <code>ANALYZE tablename</code> to update statistics — stale stats cause bad query plans.');
  tips.push('Run <code>EXPLAIN (ANALYZE, BUFFERS)</code> to see cache hit vs disk read ratio.');
  if (tables.length) tips.push(`Check index usage: <code>SELECT indexrelid::regclass, idx_scan FROM pg_stat_user_indexes WHERE relname IN ('${tables.join("','")}');</code>`);

  if (issues.length) {
    res.innerHTML += `<div class="tool-label">Issues Found</div>${issues.map(i=>`<div class="tool-warn">⚠️ ${i}</div>`).join('')}`;
  } else {
    res.innerHTML += '<div class="tool-good">✅ No obvious issues detected in this plan.</div>';
  }
  if (indexes.length) {
    res.innerHTML += `<div class="tool-label" style="margin-top:1rem">Suggested Indexes
      <button class="tool-copy-btn" onclick="toolCopy('sq-idx-out')">Copy</button>
    </div><div class="tool-output" id="sq-idx-out">${indexes.join('\n')}</div>`;
  }
  if (tips.length) {
    res.innerHTML += `<div class="tool-label" style="margin-top:1rem">Next Steps</div>${tips.map(t=>`<div class="tool-info">ℹ️ ${t}</div>`).join('')}`;
  }
}

function calcPool() {
  const servers = parseInt(document.getElementById('cp-servers').value)||10;
  const threads = parseInt(document.getElementById('cp-threads').value)||4;
  const qms = parseInt(document.getElementById('cp-query-ms').value)||20;
  const rps = parseInt(document.getElementById('cp-rps').value)||500;
  const ram = parseInt(document.getElementById('cp-ram').value)||16;
  const pooler = document.getElementById('cp-pooler').value;
  const totalWorkers = servers * threads;
  const connsNeededPerSec = Math.ceil(rps * qms / 1000);
  const rawConnections = totalWorkers;
  const pgMaxConn = Math.min(Math.floor(ram * 10), 500);
  const poolSize = Math.min(Math.ceil(connsNeededPerSec * 1.3), Math.floor(pgMaxConn * 0.9));
  const reserveSize = Math.max(5, Math.ceil(poolSize * 0.1));
  const maxClientConn = rawConnections + 10;
  document.getElementById('cp-result').innerHTML = `
    <div class="tool-grid-3" style="margin-bottom:1rem">
      <div class="tool-stat"><div class="tool-stat-num">${rawConnections}</div><div class="tool-stat-lbl">Total App Threads</div></div>
      <div class="tool-stat"><div class="tool-stat-num" style="color:var(--accent3)">${poolSize}</div><div class="tool-stat-lbl">Recommended Pool Size</div></div>
      <div class="tool-stat"><div class="tool-stat-num">${pgMaxConn}</div><div class="tool-stat-lbl">Suggested max_connections</div></div>
    </div>
    <div class="tool-label">Generated ${pooler==='pgbouncer'?'pgbouncer.ini':pooler==='proxysql'?'proxysql config':'RDS Proxy config'}
      <button class="tool-copy-btn" onclick="toolCopy('cp-cfg')">Copy</button>
    </div>
    <div class="tool-output" id="cp-cfg">${pooler==='pgbouncer'?`[databases]
mydb = host=127.0.0.1 port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction          ; highest multiplexing
max_client_conn = ${maxClientConn}
default_pool_size = ${poolSize}
reserve_pool_size = ${reserveSize}
reserve_pool_timeout = 5
server_idle_timeout = 600
client_idle_timeout = 0
max_db_connections = ${pgMaxConn}
auth_type = scram-sha-256
log_connections = 0
log_disconnections = 0`:pooler==='proxysql'?`# /etc/proxysql.cnf
mysql_variables=
{
  threads=4
  max_connections=${maxClientConn}
  default_query_delay=0
  stacksize=1048576
  server_version="8.0.28"
}

mysql_servers=
(
  { address="primary", port=3306, hostgroup=0, max_connections=${poolSize}, weight=1 },
  { address="replica", port=3306, hostgroup=1, max_connections=${poolSize}, weight=1 }
)`:`# RDS Proxy — CDK / Terraform snippet
resource "aws_db_proxy" "main" {
  name           = "my-proxy"
  engine_family  = "POSTGRESQL"
  max_connections_percent   = ${Math.min(90, Math.round(poolSize/pgMaxConn*100))}
  max_idle_connections_percent = 50
  connection_borrow_timeout = 120
  require_tls = true
}`
}</div>
    <div class="tool-info" style="margin-top:.75rem">ℹ️ With ${poolSize} pool connections serving ${rawConnections} app threads, each DB connection services ~${(rawConnections/poolSize).toFixed(1)}x threads. At ${qms}ms avg query time this handles ~${Math.round(poolSize*1000/qms)} req/sec safely.</div>
    ${rawConnections > pgMaxConn ? '<div class="tool-warn">⚠️ App threads (' + rawConnections + ') exceed max_connections (' + pgMaxConn + ') — the pooler is essential here.</div>' : ''}
  `;
}

const migPlans = {
  'mysql→postgresql': {
    difficulty:'Medium', time:'1–4 weeks',
    tools:['pgloader','AWS DMS','pg_chameleon'],
    steps:[
      'Audit schema: identify MySQL-specific types (ENUM, SET, TINYINT booleans, UNSIGNED)',
      'Map data types: TINYINT(1)→BOOLEAN, INT UNSIGNED→BIGINT, DATETIME→TIMESTAMPTZ, LONGTEXT→TEXT',
      'Convert AUTO_INCREMENT to BIGSERIAL or GENERATED ALWAYS AS IDENTITY',
      'Re-write MySQL-specific SQL: LIMIT x,y → LIMIT y OFFSET x, IF()→CASE WHEN, GROUP_CONCAT→string_agg()',
      'Export via mysqldump --compatible=postgresql or use pgloader for live migration',
      'Run pgloader with a config file against a test PostgreSQL instance',
      'Validate row counts and checksums between source and target',
      'Update application connection strings and test in staging',
      'Run both DBs in parallel (dual-write) for 48–72 hours',
      'Switch DNS/load balancer to PostgreSQL, keep MySQL as hot standby for 1 week',
    ],
    gotchas:['MySQL is case-insensitive by default for string comparisons — PostgreSQL is case-sensitive','ENUM types become TEXT with CHECK constraints in PostgreSQL','Stored procedures need rewriting in PL/pgSQL','Zero dates (0000-00-00) in MySQL are invalid in PostgreSQL'],
    tool:'pgloader: load data from mysql://user:pass@host/db into postgresql://user:pass@host/db'
  },
  'postgresql→mysql': {
    difficulty:'Medium', time:'1–3 weeks',
    tools:['AWS DMS','Striim','manual pg_dump + transform'],
    steps:[
      'Audit PostgreSQL-specific features in use: arrays, JSONB, custom types, inheritance, lateral joins',
      'Replace arrays with junction tables or JSON columns (MySQL 5.7.8+)',
      'Replace JSONB with JSON column type (loses indexing capabilities)',
      'Re-write PostgreSQL SQL: RETURNING→workaround, UPSERT ON CONFLICT→ON DUPLICATE KEY UPDATE',
      'Export with pg_dump --column-inserts, transform with sed/awk for MySQL compatibility',
      'Use AWS DMS for live migration with CDC (Change Data Capture)',
      'Test all queries in staging — PostgreSQL functions often have no direct MySQL equivalent',
      'Validate data integrity with row count and checksum comparison',
    ],
    gotchas:['PostgreSQL arrays have no MySQL equivalent — redesign required','TIMESTAMPTZ becomes DATETIME (lose timezone handling)','Window functions: most work in MySQL 8+, but syntax differs slightly','Sequences become AUTO_INCREMENT — no direct equivalent for sequences shared across tables'],
    tool:'AWS DMS: create replication instance → source (PostgreSQL) → target (MySQL) → migration task'
  },
  'mongodb→postgresql': {
    difficulty:'Hard', time:'4–12 weeks',
    tools:['AWS DMS','custom ETL scripts','Airbyte'],
    steps:[
      'Analyse document structure: identify varying schemas, deeply nested objects, arrays',
      'Design relational schema: embed→junction tables, arrays→child tables or JSONB',
      'Decide: full normalization vs JSONB for flexible attributes (often a hybrid)',
      'Write ETL script to transform BSON documents → PostgreSQL INSERT statements',
      'Handle _id: map ObjectId to UUID or BIGSERIAL',
      'Migrate references: $lookup patterns → foreign keys with JOIN',
      'Re-write application queries: MongoDB operators → SQL equivalents',
      'Run migration in batches — use mongodump for source, psycopg2/asyncpg for target',
      'Validate: compare document counts and spot-check specific records',
      'Application testing: entire data access layer changes (ORM models, queries)',
    ],
    gotchas:['Schema-less MongoDB → strict PostgreSQL schema requires upfront design decisions','Documents with varying fields: consider JSONB for the variable portion','Nested arrays become child tables — significantly more complex','MongoDB aggregation pipeline has no direct SQL equivalent — rewrite required'],
    tool:'Airbyte: source connector (MongoDB) → destination connector (PostgreSQL) with field mapping'
  },
  'sqlite→postgresql': {
    difficulty:'Easy', time:'1–3 days',
    tools:['pgloader','sqlite3 + psql','custom script'],
    steps:[
      'Export SQLite schema: sqlite3 mydb.db .schema',
      'Convert types: INTEGER PRIMARY KEY→BIGSERIAL, TEXT→TEXT (same), REAL→DOUBLE PRECISION, BLOB→BYTEA',
      'Export data: sqlite3 mydb.db .dump > dump.sql',
      'Clean dump: remove SQLite-specific pragmas, fix INSERT syntax if needed',
      'Use pgloader for automatic conversion: load data from sqlite:///mydb.db into postgresql://...',
      'Validate row counts match',
      'Add missing indexes, constraints, and foreign keys (SQLite often lacks these)',
    ],
    gotchas:['SQLite is flexible with types — "integer" column might have text stored in it. Validate.','SQLite foreign keys are OFF by default — you may have orphaned records','SQLite AUTOINCREMENT ≠ SERIAL — slight behaviour difference in gap handling'],
    tool:'pgloader load data from sqlite:///path/to/mydb.db into postgresql://user:pass@host/db'
  },
};
const defaultPlan = {
  difficulty:'Medium', time:'Varies',
  tools:['AWS DMS','Striim','Airbyte','custom ETL'],
  steps:[
    'Audit source schema and identify database-specific features',
    'Map data types between source and target',
    'Set up target schema in the destination database',
    'Choose migration tool (AWS DMS for AWS, Airbyte for open-source)',
    'Run a test migration with a sample dataset',
    'Validate data integrity: row counts, checksums, spot checks',
    'Update application code: connection strings, ORM models, queries',
    'Run parallel dual-write period to verify consistency',
    'Switch traffic to new database',
    'Monitor for 1 week before decommissioning source',
  ],
  gotchas:['Test in staging first — never migrate directly to production','Always keep the source running as rollback for at least 1 week','Measure migration time with production data volume — not just test data'],
  tool:''
};
function renderMigration() {
  const from = document.getElementById('mig-from').value;
  const to = document.getElementById('mig-to').value;
  const plan = migPlans[`${from}→${to}`] || defaultPlan;
  const diffColor = {Easy:'var(--accent3)',Medium:'var(--accent5)',Hard:'var(--accent4)'}[plan.difficulty]||'var(--text2)';
  document.getElementById('mig-result').innerHTML = `
    <div class="tool-grid-3" style="margin-bottom:1rem">
      <div class="tool-stat"><div class="tool-stat-num" style="color:${diffColor}">${plan.difficulty}</div><div class="tool-stat-lbl">Difficulty</div></div>
      <div class="tool-stat"><div class="tool-stat-num" style="font-size:1rem;padding-top:.4rem">${plan.time}</div><div class="tool-stat-lbl">Estimated Time</div></div>
      <div class="tool-stat"><div class="tool-stat-num" style="font-size:.85rem;padding-top:.3rem">${plan.tools[0]}</div><div class="tool-stat-lbl">Recommended Tool</div></div>
    </div>
    <div class="tool-label">Migration Steps</div>
    ${plan.steps.map((s,i)=>`<div class="tool-result-card" style="display:flex;gap:.75rem;align-items:flex-start"><span style="background:rgba(79,142,247,.15);color:var(--accent);font-family:var(--mono);font-size:.7rem;font-weight:700;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">${i+1}</span><div class="tool-result-body">${s}</div></div>`).join('')}
    <div class="tool-label" style="margin-top:1rem">⚠️ Common Gotchas</div>
    ${plan.gotchas.map(g=>`<div class="tool-warn">${g}</div>`).join('')}
    ${plan.tool?`<div class="tool-label" style="margin-top:1rem">Quick Start Command<button class="tool-copy-btn" onclick="toolCopy('mig-cmd')">Copy</button></div><div class="tool-output" id="mig-cmd">${plan.tool}</div>`:''}
    <div class="tool-label" style="margin-top:1rem">All Available Tools</div>
    <div style="display:flex;gap:.5rem;flex-wrap:wrap">${plan.tools.map(t=>`<span style="font-size:.75rem;padding:4px 12px;border-radius:20px;background:var(--bg3);border:1px solid var(--border);color:var(--text2)">${t}</span>`).join('')}</div>
  `;
}

const repData = {
  postgresql: {
    async:{ rpo:'Seconds to minutes', rto:'30s–2min (with Patroni)', lag:'Bytes behind primary (pg_stat_replication)', mechanism:'WAL streaming — primary sends WAL bytes, replica replays them', setup:`-- Primary postgresql.conf
wal_level = replica
max_wal_senders = 5
wal_keep_size = 1GB

-- Create replication user
CREATE ROLE replicator REPLICATION LOGIN PASSWORD 'pass';

-- pg_hba.conf
host replication replicator 10.0.0.0/8 scram-sha-256

-- Start replica
pg_basebackup -h primary -U replicator -D /data -R --checkpoint=fast

-- Check lag on primary
SELECT client_addr, replay_lag FROM pg_stat_replication;`, gotcha:'Replica slot can cause WAL accumulation if replica disconnects.' },
    sync:{ rpo:'Zero (RPO=0)', rto:'30s–2min', lag:'None — write not confirmed until replica ACKs', mechanism:'synchronous_commit = remote_apply — primary waits for replica write confirmation', setup:`-- Primary postgresql.conf
synchronous_commit = remote_apply
synchronous_standby_names = 'replica1'

-- Or ANY 1 replica
synchronous_standby_names = 'ANY 1 (replica1, replica2)'`, gotcha:'Write latency increases by network RTT to replica. Replica failure blocks ALL writes if synchronous.' },
    semi:{ rpo:'Near-zero', rto:'30s–2min', lag:'At most 1 WAL chunk', mechanism:'synchronous_commit = remote_write — primary waits for replica to receive WAL but not apply', setup:`-- Compromise between async and sync
synchronous_commit = remote_write   -- waits for OS write on replica
-- OR
synchronous_commit = on             -- waits for local WAL flush only`, gotcha:'remote_write is safer than async but still allows data loss if replica crashes before applying WAL.' }
  },
  mysql: {
    async:{ rpo:'Seconds', rto:'1–5 minutes (manual failover)', lag:'Seconds_Behind_Source in SHOW REPLICA STATUS', mechanism:'Binary log streaming — primary writes binlog, replica\'s IO thread fetches it, SQL thread applies', setup:`-- Primary my.cnf
server-id = 1
log_bin = mysql-bin
binlog_format = ROW

-- Replica
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='primary', SOURCE_USER='replicator',
  SOURCE_AUTO_POSITION=1;   -- GTID mode
START REPLICA;
SHOW REPLICA STATUS\\G`, gotcha:'Replica lag can grow during heavy writes. Monitor Seconds_Behind_Source.' },
    sync:{ rpo:'Zero', rto:'Automatic (Galera / Group Replication)', lag:'Zero — Galera uses synchronous certification', mechanism:'Galera Cluster: wsrep protocol commits on ALL nodes simultaneously before returning', setup:`-- Galera my.cnf
wsrep_on=ON
wsrep_provider=/usr/lib/galera/libgalera_smm.so
wsrep_cluster_address="gcomm://node1,node2,node3"
wsrep_sst_method=rsync

-- Check
SHOW STATUS LIKE 'wsrep_cluster_size';   -- should be 3
SHOW STATUS LIKE 'wsrep_local_state_comment';  -- Synced`, gotcha:'Galera adds write latency (~1-2x network RTT). All nodes must be reachable for writes.' },
    semi:{ rpo:'Near-zero', rto:'1–5 minutes', lag:'At most 1 transaction', mechanism:'Semi-sync: primary waits for ACK from at least 1 replica before confirming commit', setup:`INSTALL PLUGIN rpl_semi_sync_source SONAME 'semisync_source.so';
SET GLOBAL rpl_semi_sync_source_enabled = 1;
SET GLOBAL rpl_semi_sync_source_timeout = 1000;  -- 1s timeout

-- On replica
INSTALL PLUGIN rpl_semi_sync_replica SONAME 'semisync_replica.so';
SET GLOBAL rpl_semi_sync_replica_enabled = 1;`, gotcha:'Falls back to async if no semi-sync replica acknowledges within timeout.' }
  },
  mongodb: {
    async:{ rpo:'Seconds', rto:'10–30s (automatic election)', lag:'rs.printReplicationInfo() — oplog lag in seconds', mechanism:'Oplog streaming — primary writes to oplog, secondaries tail the oplog and apply operations', setup:`rs.initiate({ _id:"rs0", members:[
  {_id:0, host:"mongo1:27017", priority:2},
  {_id:1, host:"mongo2:27017", priority:1},
  {_id:2, host:"mongo3:27017", arbiterOnly:false}
]})

// Check lag
rs.printReplicationInfo()
rs.printSecondaryReplicationInfo()`, gotcha:'Default write concern w:1 (primary only). Use w:"majority" for important writes.' },
    sync:{ rpo:'Zero (with w:majority)', rto:'10–30s', lag:'Zero for majority-committed writes', mechanism:'Write concern w:majority — write blocked until majority of replica set confirms', setup:`// Connection string with majority write concern
mongodb://user:pass@host/db?w=majority&j=true

// Per-operation write concern
db.orders.insertOne(doc, { writeConcern: { w: "majority", j: true } })

// Or set on collection level
db.runCommand({ collMod: "orders", writeConcern: { w: "majority" } })`, gotcha:'w:majority adds latency proportional to network RTT to replica. Still async replication under the hood — just confirmed.' },
    semi:{ rpo:'Near-zero', rto:'10–30s', lag:'Variable', mechanism:'w:2 — confirmed by primary + 1 replica', setup:`// Write concern: primary + 1 replica
db.col.insertOne(doc, { writeConcern: { w: 2, j: true, wtimeout: 5000 } })`, gotcha:'wtimeout=5000: if 2nd replica is slow, write times out and returns error.' }
  },
  redis: {
    async:{ rpo:'Seconds', rto:'Sentinel: 10–30s, Cluster: automatic', lag:'redis-cli -p 26379 SENTINEL slaves mymaster — repl_offset difference', mechanism:'PSYNC protocol — replica sends replication offset, primary streams commands since that offset', setup:`# redis.conf (primary)
appendonly yes
# No special replication config needed — replica initiates

# redis.conf (replica)
replicaof 192.168.1.10 6379
replica-read-only yes

# Sentinel (for HA)
sentinel monitor mymaster 192.168.1.10 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000`, gotcha:'Redis replication is always async. RPO is not zero — some data may be lost on failover.' },
    sync:{ rpo:'Near-zero', rto:'Sentinel: 10–30s', lag:'Configurable via WAIT command', mechanism:'WAIT numreplicas timeout — blocks until N replicas confirm sync, or timeout', setup:`# Force sync before critical operation
redis-cli WAIT 1 1000   # wait for 1 replica to sync, max 1s

# Or in application code
await redis.wait(1, 1000)   # returns number of synced replicas`, gotcha:'WAIT is per-command, not global. Not zero data loss — just reduces the window.' },
    semi:{ rpo:'Seconds', rto:'10–30s', lag:'Variable', mechanism:'Default Redis replication with min-replicas-to-write setting', setup:`# Primary refuses writes if fewer than N replicas are connected
min-replicas-to-write 1
min-replicas-max-lag 10   # replica must be < 10s behind`, gotcha:'This prevents writes when replicas disconnect — tradeoff between consistency and availability.' }
  },
  cassandra: {
    async:{ rpo:'Depends on consistency level', rto:'Automatic (peer-to-peer, no single primary)', lag:'nodetool netstats — pending operations', mechanism:'Hinted handoff and read repair — if a node is down, hints are stored and replayed when it comes back', setup:`-- Consistency level ONE (fastest, most available)
CONSISTENCY ONE;
INSERT INTO events (id, data) VALUES (uuid(), 'test');

-- Check replication status
nodetool status
nodetool netstats
nodetool tpstats`, gotcha:'ONE consistency: if you read immediately after write from a different node, you may get stale data.' },
    sync:{ rpo:'Zero', rto:'Automatic', lag:'None — QUORUM waits for majority', mechanism:'QUORUM consistency: write must be acknowledged by (RF/2)+1 nodes before returning success', setup:`-- Quorum consistency (recommended for production)
CONSISTENCY LOCAL_QUORUM;  -- for multi-DC deployments
-- or
CONSISTENCY QUORUM;        -- across all DCs

-- Verify
SELECT * FROM system.local;
nodetool status`, gotcha:'QUORUM adds latency proportional to the slowest node in the quorum. ALL consistency is safest but blocks on any node failure.' },
    semi:{ rpo:'Near-zero', rto:'Automatic', lag:'Minimal', mechanism:'LOCAL_QUORUM: majority within local DC only, avoiding cross-DC latency', setup:`CONSISTENCY LOCAL_QUORUM;

-- Create keyspace with multi-DC replication
CREATE KEYSPACE myapp WITH replication = {
  'class': 'NetworkTopologyStrategy',
  'dc1': 3, 'dc2': 3
};`, gotcha:'LOCAL_QUORUM means reads/writes can diverge across DCs temporarily.' }
  }
};
function renderRep() {
  const db = document.getElementById('rep-db').value;
  const mode = document.getElementById('rep-mode').value;
  const d = repData[db]?.[mode];
  if (!d) { document.getElementById('rep-result').innerHTML='<div class="tool-warn">Configuration not available for this combination.</div>'; return; }
  document.getElementById('rep-result').innerHTML = `
    <div class="tool-grid-3" style="margin-bottom:1rem">
      <div class="tool-stat"><div class="tool-stat-num" style="font-size:.85rem;padding-top:.5rem">${d.rpo}</div><div class="tool-stat-lbl">RPO (Data Loss)</div></div>
      <div class="tool-stat"><div class="tool-stat-num" style="font-size:.85rem;padding-top:.5rem">${d.rto}</div><div class="tool-stat-lbl">RTO (Recovery Time)</div></div>
      <div class="tool-stat"><div class="tool-stat-num" style="font-size:.85rem;padding-top:.5rem">${d.lag}</div><div class="tool-stat-lbl">Lag Metric</div></div>
    </div>
    <div class="tool-result-card"><div class="tool-result-title">How it works</div><div class="tool-result-body">${d.mechanism}</div></div>
    <div class="tool-label">Setup Commands<button class="tool-copy-btn" onclick="toolCopy('rep-cmd')">Copy</button></div>
    <div class="tool-output" id="rep-cmd">${d.setup}</div>
    <div class="tool-warn" style="margin-top:.75rem">⚠️ ${d.gotcha}</div>
  `;
}

function renderIdx() {
  const db = document.getElementById('idx-db').value;
  const pat = document.getElementById('idx-pattern').value;
  const tbl = document.getElementById('idx-table').value || 'orders';
  const cols = document.getElementById('idx-col').value || 'col';
  const colArr = cols.split(',').map(c=>c.trim());
  const c1 = colArr[0], c2 = colArr[1]||'col2', c3 = colArr[2]||'col3';

  const configs = {
    postgresql: {
      equality:   { type:'B-tree', ddl:`CREATE INDEX CONCURRENTLY idx_${tbl}_${c1}\n  ON ${tbl}(${c1});`, why:'B-tree default index handles equality (=) and also ranges, sorting, and IS NULL.', perf:'O(log n) lookup. Index scan instead of sequential scan.', when:'Any column in a WHERE col = value clause with >1% selectivity.' },
      range:      { type:'B-tree', ddl:`CREATE INDEX CONCURRENTLY idx_${tbl}_${c1}\n  ON ${tbl}(${c1} DESC);\n\n-- For time-based (latest first)\nCREATE INDEX CONCURRENTLY idx_${tbl}_${c1}_desc\n  ON ${tbl}(${c1} DESC NULLS LAST);`, why:'B-tree stores data in sorted order — range queries walk the tree without scanning all rows.', perf:'O(log n + k) where k is matching rows.', when:'Timestamp columns, numeric ranges, date ranges.' },
      composite:  { type:'B-tree Composite', ddl:`-- ESR Rule: Equality → Sort → Range\nCREATE INDEX CONCURRENTLY idx_${tbl}_composite\n  ON ${tbl}(${c1}, ${c2} DESC, ${c3});\n\n-- Example for: WHERE user_id=? AND status=? ORDER BY created_at DESC\nCREATE INDEX CONCURRENTLY idx_${tbl}_user_status_created\n  ON ${tbl}(user_id, status, created_at DESC);`, why:'Columns in left-to-right order. Equality columns first, sort columns next, range columns last (ESR rule).', perf:'Can satisfy WHERE + ORDER BY in a single index scan.', when:'Multi-column WHERE clauses with ORDER BY. Most important production index type.' },
      fulltext:   { type:'GIN (tsvector)', ddl:`-- Add generated tsvector column (PostgreSQL 12+)\nALTER TABLE ${tbl} ADD COLUMN search_vector\n  tsvector GENERATED ALWAYS AS (\n    setweight(to_tsvector('english', coalesce(${c1},'')), 'A') ||\n    setweight(to_tsvector('english', coalesce(${c2},'')), 'B')\n  ) STORED;\n\nCREATE INDEX idx_${tbl}_fts ON ${tbl}\n  USING GIN(search_vector);\n\n-- Query\nSELECT * FROM ${tbl}\nWHERE search_vector @@ plainto_tsquery('english','your search');`, why:'GIN inverted index maps each lexeme to a list of rows containing it.', perf:'O(log n) for each search term. Very fast on large text corpora.', when:'Article body, product descriptions, any free-text search.' },
      json:       { type:'GIN (JSONB)', ddl:`-- GIN index for containment (@>) and key existence (?)\nCREATE INDEX CONCURRENTLY idx_${tbl}_${c1}_gin\n  ON ${tbl} USING GIN(${c1});\n\n-- Expression index for a specific JSON path\nCREATE INDEX CONCURRENTLY idx_${tbl}_${c1}_plan\n  ON ${tbl}((${c1}->>'plan'));\n\n-- Queries\nSELECT * FROM ${tbl} WHERE ${c1} @> '{"plan":"pro"}';\nSELECT * FROM ${tbl} WHERE ${c1}->>'plan' = 'pro';`, why:'GIN creates index entries for each key/value in the JSONB document.', perf:'O(log n) for containment and existence queries.', when:'JSONB columns queried by specific keys or containment.' },
      array:      { type:'GIN (array)', ddl:`-- GIN index for array containment (@>) and overlap (&&)\nCREATE INDEX CONCURRENTLY idx_${tbl}_${c1}_gin\n  ON ${tbl} USING GIN(${c1});\n\n-- Queries\nSELECT * FROM ${tbl} WHERE ${c1} @> ARRAY['kubernetes'];\nSELECT * FROM ${tbl} WHERE ${c1} && ARRAY['devops','k8s'];`, why:'GIN indexes each array element separately.', perf:'O(log n) for containment and overlap queries.', when:'Tags, permissions, multi-value columns.' },
      unique:     { type:'Unique B-tree', ddl:`-- Unique index (also enforces constraint)\nCREATE UNIQUE INDEX CONCURRENTLY idx_${tbl}_${c1}_unique\n  ON ${tbl}(${c1});\n\n-- Case-insensitive unique (e.g. email)\nCREATE UNIQUE INDEX CONCURRENTLY idx_${tbl}_${c1}_lower\n  ON ${tbl}(LOWER(${c1}));\n\n-- Conditional unique (partial)\nCREATE UNIQUE INDEX CONCURRENTLY idx_${tbl}_${c1}_active\n  ON ${tbl}(${c1}) WHERE is_deleted = FALSE;`, why:'Unique indexes enforce uniqueness AND serve as B-tree indexes for queries.', perf:'O(log n). Validated on every INSERT and UPDATE.', when:'Email, username, external reference IDs, business keys.' },
      partial:    { type:'Partial B-tree', ddl:`-- Index only active rows (most queries filter on is_active=true)\nCREATE INDEX CONCURRENTLY idx_${tbl}_${c1}_active\n  ON ${tbl}(${c1})\n  WHERE is_active = TRUE;\n\n-- Soft-delete pattern: index only non-deleted rows\nCREATE INDEX CONCURRENTLY idx_${tbl}_${c1}_notdeleted\n  ON ${tbl}(${c1})\n  WHERE is_deleted = FALSE;`, why:'Indexes only rows matching the WHERE condition — much smaller, faster to build and query.', perf:'Tiny index size if most rows are filtered out. Extremely fast for targeted queries.', when:'Boolean filters on mostly-one-value columns (is_active, is_deleted, status=\'active\').' },
      covering:   { type:'Covering / Index-Only', ddl:`-- Include all SELECT columns in the index\n-- so PostgreSQL never needs to visit the table heap\nCREATE INDEX CONCURRENTLY idx_${tbl}_covering\n  ON ${tbl}(${c1}) INCLUDE (${c2}, ${c3});\n\n-- EXPLAIN shows "Index Only Scan" instead of "Index Scan"\n-- No heap fetch = much faster for read-heavy queries`, why:'All data needed to answer the query is in the index — no table reads required.', perf:'Fastest possible read. Eliminates heap fetches entirely.', when:'Frequently read columns alongside a highly selective WHERE column.' }
    },
    mysql: {
      equality:   { type:'B-tree', ddl:`CREATE INDEX idx_${tbl}_${c1} ON ${tbl}(${c1});`, why:'Standard B-tree index for equality and range queries.', perf:'O(log n).', when:'Any WHERE col = value with good selectivity.' },
      composite:  { type:'Composite B-tree', ddl:`-- Leftmost prefix rule: queries must use from the left\nCREATE INDEX idx_${tbl}_composite ON ${tbl}(${c1}, ${c2}, ${c3});\n\n-- Covering index\nCREATE INDEX idx_${tbl}_covering ON ${tbl}(${c1}) INCLUDE (${c2},${c3});  -- MySQL 8.0+`, why:'MySQL uses leftmost prefix — ensure your WHERE clause includes the first column.', perf:'O(log n) when leftmost columns used.', when:'Multi-column WHERE clauses.' },
      fulltext:   { type:'FULLTEXT', ddl:`ALTER TABLE ${tbl} ADD FULLTEXT INDEX idx_${tbl}_fts(${c1},${c2});\n\n-- Natural language search\nSELECT *, MATCH(${c1},${c2}) AGAINST('search term') AS score\nFROM ${tbl}\nWHERE MATCH(${c1},${c2}) AGAINST('search term')\nORDER BY score DESC;\n\n-- Boolean mode\nWHERE MATCH(${c1},${c2}) AGAINST('+must -exclude \"exact phrase\"' IN BOOLEAN MODE);`, why:'Inverted index for full-text with stemming, stop words, and relevance scoring.', perf:'Fast for text search. Slower to build than B-tree.', when:'Article body, product descriptions.' },
      json:       { type:'Generated Column + B-tree', ddl:`-- MySQL: index JSON path via generated column\nALTER TABLE ${tbl}\n  ADD COLUMN ${c1}_plan VARCHAR(50)\n    GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(${c1},'$.plan'))) VIRTUAL;\n\nCREATE INDEX idx_${tbl}_plan ON ${tbl}(${c1}_plan);\n\n-- Query\nSELECT * FROM ${tbl} WHERE ${c1}_plan = 'pro';`, why:'MySQL cannot index JSON directly — generated column workaround.', perf:'O(log n) for the indexed path.', when:'Frequently queried JSON fields.' },
      unique:     { type:'Unique B-tree', ddl:`ALTER TABLE ${tbl} ADD UNIQUE INDEX idx_${tbl}_${c1}(${c1});`, why:'Enforces uniqueness and enables fast lookups.', perf:'O(log n).', when:'Email, username, external IDs.' },
      partial:    { type:'Not natively supported', ddl:`-- MySQL 8 workaround: use generated column + partial-like logic\n-- OR use standard index + rely on WHERE clause\n-- No WHERE clause support in MySQL CREATE INDEX\n\nCREATE INDEX idx_${tbl}_${c1} ON ${tbl}(${c1});\n-- MySQL cannot filter index to active rows only`, why:'MySQL does not support partial indexes with WHERE conditions.', perf:'Full index — larger than PostgreSQL partial equivalent.', when:'Use PostgreSQL for partial index support.' },
      range:      { type:'B-tree', ddl:`CREATE INDEX idx_${tbl}_${c1} ON ${tbl}(${c1});\n-- For composite with sort:\nCREATE INDEX idx_${tbl}_${c1}_${c2} ON ${tbl}(${c1},${c2});`, why:'B-tree handles range queries. Ensure range column is rightmost in composite.', perf:'O(log n + k).', when:'Date/time ranges, numeric ranges.' },
      array:      { type:'JSON_CONTAINS (no dedicated index)', ddl:`-- MySQL has no array type. Use JSON array + JSON_CONTAINS\n-- Index the JSON column (limited support)\nCREATE INDEX idx_${tbl}_${c1}_path\n  ON ${tbl}((CAST(${c1} AS CHAR(1000) ARRAY)));  -- MySQL 8.0.17+\n\nSELECT * FROM ${tbl}\nWHERE JSON_CONTAINS(${c1}, '"kubernetes"');`, why:'MySQL multi-valued index (8.0.17+) can index JSON arrays.', perf:'Better than full scan but limited functionality vs PostgreSQL GIN.', when:'Tag lists stored as JSON arrays.' },
      covering:   { type:'Covering B-tree', ddl:`CREATE INDEX idx_${tbl}_covering ON ${tbl}(${c1}) INCLUDE (${c2},${c3});  -- MySQL 8.0+\n\n-- Pre-MySQL 8: include all columns in the index key\nCREATE INDEX idx_${tbl}_covering ON ${tbl}(${c1},${c2},${c3});`, why:'Index contains all SELECT columns — index-only scan, no table lookup.', perf:'Fastest reads. EXPLAIN shows "Using index".', when:'High-frequency SELECTs on a small set of columns.' }
    },
    mongodb: {
      equality:   { type:'Single Field', ddl:`db.${tbl}.createIndex({ ${c1}: 1 })\n\n// -1 for descending (useful for latest-first queries)\ndb.${tbl}.createIndex({ ${c1}: -1 })`, why:'Standard B-tree equivalent index on a single field.', perf:'O(log n).', when:'Any find() with { field: value } filter.' },
      range:      { type:'Single Field (sorted)', ddl:`// Ascending for oldest-first, descending for newest-first\ndb.${tbl}.createIndex({ ${c1}: -1 })\n\n// Compound with equality + range\ndb.${tbl}.createIndex({ ${c1}: 1, ${c2}: -1 })`, why:'MongoDB B-tree index supports range queries ($gt, $lt, $gte, $lte, $between).', perf:'O(log n + k).', when:'Date ranges, numeric comparisons.' },
      composite:  { type:'Compound', ddl:`// ESR rule: Equality fields first, Sort next, Range last\ndb.${tbl}.createIndex({ ${c1}: 1, ${c2}: -1, ${c3}: 1 })\n\n// Example: { userId: 1, status: 1, createdAt: -1 }\n// Supports: find({userId:x, status:'paid'}).sort({createdAt:-1})`, why:'MongoDB compound index follows ESR (Equality-Sort-Range) rule like SQL.', perf:'O(log n) when prefix fields are used.', when:'Multi-field filters with sort.' },
      fulltext:   { type:'Text Index', ddl:`db.${tbl}.createIndex(\n  { ${c1}: "text", ${c2}: "text" },\n  { weights: { ${c1}: 10, ${c2}: 1 }, name: "${tbl}_search" }\n)\n\n// Query\ndb.${tbl}.find(\n  { \\$text: { \\$search: "your search terms" } },\n  { score: { \\$meta: "textScore" } }\n).sort({ score: { \\$meta: "textScore" } })`, why:'Inverted index with stop words, stemming, and relevance scoring.', perf:'Fast for text search. One text index per collection.', when:'Article body, product descriptions.' },
      json:       { type:'Dot-notation field index', ddl:`// Index a nested field\ndb.${tbl}.createIndex({ "${c1}.plan": 1 })\ndb.${tbl}.createIndex({ "${c1}.status": 1, "${c1}.created": -1 })\n\n// Query uses the index automatically\ndb.${tbl}.find({ "${c1}.plan": "pro" })`, why:'MongoDB allows indexing any nested field using dot notation.', perf:'O(log n) for the indexed nested path.', when:'Frequently queried fields inside embedded documents.' },
      array:      { type:'Multikey Index', ddl:`// Automatically created as multikey when field is an array\ndb.${tbl}.createIndex({ ${c1}: 1 })\n\n// Supports\ndb.${tbl}.find({ ${c1}: "kubernetes" })           // has value\ndb.${tbl}.find({ ${c1}: { \\$all: ["k8s","aws"] } }) // has all\ndb.${tbl}.find({ ${c1}: { \\$in: ["k8s","devops"] }}) // has any`, why:'MongoDB automatically creates a multikey index when the field is an array — one entry per element.', perf:'O(log n) for element lookup in array.', when:'Tags, categories, permissions arrays.' },
      unique:     { type:'Unique Index', ddl:`db.${tbl}.createIndex({ ${c1}: 1 }, { unique: true })\n\n// Sparse unique: allows multiple documents with null/missing field\ndb.${tbl}.createIndex({ ${c1}: 1 }, { unique: true, sparse: true })`, why:'Enforces uniqueness across the collection.', perf:'O(log n). Checked on every insert/update.', when:'Email, username, external reference IDs.' },
      partial:    { type:'Partial Index', ddl:`// Index only active documents\ndb.${tbl}.createIndex(\n  { ${c1}: 1 },\n  { partialFilterExpression: { isActive: true } }\n)\n\n// TTL index: auto-delete expired documents\ndb.${tbl}.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 })`, why:'Indexes only documents matching the filter expression — much smaller index.', perf:'Very fast for targeted queries. Small index size.', when:'Status-filtered queries, active-only lookups.' },
      covering:   { type:'Projection Covered', ddl:`// Include all projected fields in compound index\ndb.${tbl}.createIndex({ ${c1}: 1, ${c2}: 1, ${c3}: 1 })\n\n// Query that is covered (all fields in index)\ndb.${tbl}.find(\n  { ${c1}: "value" },         // filter on indexed field\n  { ${c2}: 1, ${c3}: 1, _id: 0 }  // project only indexed fields\n)\n// EXPLAIN shows totalDocsExamined: 0 (covered!)`, why:'All returned fields are in the index — no document reads.', perf:'Fastest possible reads. Zero document fetches.', when:'High-frequency reads returning a predictable small set of fields.' },
      range:      { type:'Single/Compound Field', ddl:`db.${tbl}.createIndex({ ${c1}: 1 })\ndb.${tbl}.createIndex({ ${c1}: 1, ${c2}: -1 })`, why:'Standard range queries.', perf:'O(log n + k).', when:'Date/numeric ranges.' }
    }
  };
  const dbKey = document.getElementById('idx-db').value;
  const c = configs[dbKey]?.[pat];
  if (!c) return;
  document.getElementById('idx-result').innerHTML = `
    <div class="tool-grid-3" style="margin-bottom:1rem">
      <div class="tool-stat"><div class="tool-stat-num" style="font-size:.9rem;padding-top:.4rem">${c.type}</div><div class="tool-stat-lbl">Index Type</div></div>
      <div class="tool-stat"><div class="tool-stat-num" style="font-size:.85rem;padding-top:.4rem">${c.perf}</div><div class="tool-stat-lbl">Performance</div></div>
    </div>
    <div class="tool-result-card"><div class="tool-result-title">Why this index?</div><div class="tool-result-body">${c.why}</div></div>
    <div class="tool-result-card"><div class="tool-result-title">When to use</div><div class="tool-result-body">${c.when}</div></div>
    <div class="tool-label">Generated DDL<button class="tool-copy-btn" onclick="toolCopy('idx-ddl')">Copy</button></div>
    <div class="tool-output" id="idx-ddl">${c.ddl}</div>
  `;
}

function secTab(btn, id) {
  document.querySelectorAll('.sec-tab-btn').forEach(b=>{b.style.background='transparent';b.style.color='var(--text2)';});
  btn.style.background='var(--accent)'; btn.style.color='#fff';
  document.querySelectorAll('.sec-panel').forEach(p=>p.style.display='none');
  document.getElementById(id).style.display='block';
}
function secToggle(db, idx, row) {
  const cb = row.querySelector('input');
  const txt = row.querySelector('.checklist-text');
  cb.checked = !cb.checked;
  txt.classList.toggle('done', cb.checked);
  const saved = (() => { try { return JSON.parse(localStorage.getItem('eknathalabs_sec_check')||'{}'); } catch(e){return{};} })();
  const key = 'sec_' + db;
  const arr = new Set(saved[key]||[]);
  cb.checked ? arr.add(idx) : arr.delete(idx);
  saved[key] = [...arr];
  localStorage.setItem('eknathalabs_sec_check', JSON.stringify(saved));
  // Update progress
  const panel = document.getElementById('sec-' + db);
  const allCBs = panel.querySelectorAll('input[type=checkbox]');
  const done = [...allCBs].filter(c=>c.checked).length;
  const pct = Math.round(done/allCBs.length*100);
  const bar = panel.querySelector('div[style*="width"]');
  if (bar) bar.style.width = pct + '%';
}
function secReset(db) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('eknathalabs_sec_check')||'{}'); } catch(e){return{};} })();
  delete saved['sec_'+db];
  localStorage.setItem('eknathalabs_sec_check', JSON.stringify(saved));
  const panel = document.getElementById('sec-'+db);
  panel.querySelectorAll('input[type=checkbox]').forEach(cb=>{cb.checked=false;});
  panel.querySelectorAll('.checklist-text').forEach(t=>t.classList.remove('done'));
  const bar = panel.querySelector('div[style*="width"]');
  if (bar) bar.style.width='0%';
}

const backupPlans = {
  postgresql: {
    zero:    { tool:'pgBackRest + streaming replication + synchronous_commit=on', rto:'30s–2min (failover)', cmd:`# Continuous WAL archiving to S3
pgbackrest --stanza=mydb backup --type=full    # weekly
pgbackrest --stanza=mydb backup --type=diff    # daily
pgbackrest --stanza=mydb backup --type=incr    # hourly

# PITR restore to exact timestamp
pgbackrest --stanza=mydb restore \\
  --target="2025-05-08 14:00:00" \\
  --target-action=promote

# Verify backup integrity
pgbackrest --stanza=mydb check`, notes:['Enable synchronous replication + synchronous_commit=remote_apply','Archive WAL continuously to S3/GCS','Maintain at least 2 sync standbys for HA','Test restore monthly — verify RTO is achievable'] },
    minutes: { tool:'pgBackRest continuous WAL archiving', rto:'5–30min', cmd:`# pgbackrest.conf
[global]
repo1-path=/backup
repo1-type=s3
repo1-s3-bucket=my-pg-backups
repo1-retention-full=2
archive-async=y

[mydb]
pg1-path=/var/lib/postgresql/16/main

# Full backup weekly, WAL streaming continuously
pgbackrest --stanza=mydb backup --type=full
pgbackrest --stanza=mydb start`, notes:['WAL is archived every 60 seconds (configurable)','Use replica for backups to avoid primary I/O impact','Encrypt backups: repo1-cipher-type=aes-256-cbc','Verify: pgbackrest info'] },
    hour:    { tool:'pg_dump hourly cron + async replication', rto:'15–60min', cmd:`#!/bin/bash
# /etc/cron.d/pg-backup
0 * * * * postgres pg_dump -Fc -Z9 mydb > \\
  /backup/mydb_\$(date +\\%Y\\%m\\%d_\\%H).dump

# Keep 7 days
find /backup -name "*.dump" -mtime +7 -delete

# Restore
pg_restore -d mydb_new -j4 mydb_20250508_14.dump`, notes:['pg_dump is consistent (uses MVCC snapshot) — safe while app runs','Upload to S3 after dump: aws s3 cp dump s3://bucket/','Test restore quarterly'] },
    day:     { tool:'pg_dumpall daily cron', rto:'1–4 hours (for large DBs)', cmd:`#!/bin/bash
# Daily backup at 2am
pg_dumpall -U postgres | gzip > \\
  /backup/all_\$(date +\\%Y\\%m\\%d).sql.gz

# Upload to S3 with lifecycle policy
aws s3 cp /backup/all_\$(date +\\%Y\\%m\\%d).sql.gz \\
  s3://my-backups/postgres/

# S3 lifecycle: keep 30 daily, 12 monthly`, notes:['pg_dumpall includes all databases + roles + tablespaces','Suitable only for non-critical or dev/staging databases','Always store offsite — not just on the DB server'] }
  },
  mysql: {
    zero:    { tool:'Galera Cluster (multi-master sync) + XtraBackup', rto:'Automatic (seconds)', cmd:`# XtraBackup — hot physical backup (no table locks)
xtrabackup --backup --user=root --password=pass \\
  --target-dir=/backup/full/

xtrabackup --prepare --target-dir=/backup/full/

# Point-in-time restore using binary logs
mysqlbinlog --start-datetime="2025-05-08 14:00:00" \\
  --stop-datetime="2025-05-08 15:00:00" \\
  /var/log/mysql/mysql-bin.* | mysql -u root -p`, notes:['Enable binary logging: log_bin=mysql-bin, binlog_format=ROW','Archive binary logs to S3 continuously','Full XtraBackup weekly, binlog streaming always','Galera Cluster: all nodes always in sync'] },
    minutes: { tool:'XtraBackup + binary log shipping', rto:'10–30min', cmd:`# Scheduled XtraBackup
0 2 * * 0 xtrabackup --backup --target-dir=/backup/full  # weekly full
0 2 * * 1-6 xtrabackup --backup --target-dir=/backup/incr \\
  --incremental-basedir=/backup/full  # daily incremental

# Binary logs shipped to S3 continuously`, notes:['Incremental XtraBackup is much faster than full','Binary logs fill the gap between backups','Combine: weekly full + daily incremental + continuous binlog'] },
    hour:    { tool:'mysqldump hourly', rto:'30min–2hours', cmd:`mysqldump -u root -p \\
  --single-transaction --routines --triggers \\
  --all-databases | gzip > \\
  /backup/all_\$(date +\\%Y\\%m\\%d_\\%H).sql.gz`, notes:['--single-transaction: consistent dump without table locks (InnoDB only)','For large tables: use --where or dump per-table','Upload to S3 immediately after dump'] },
    day:     { tool:'mysqldump daily cron', rto:'Hours', cmd:`# /etc/cron.d/mysql-backup
0 2 * * * root mysqldump -u root -p"\$MYSQL_ROOT_PASSWORD" \\
  --all-databases --single-transaction \\
  | gzip > /backup/mysql_\$(date +\\%Y\\%m\\%d).sql.gz`, notes:['Test restore quarterly on a separate server','Store backups in a different availability zone','Enable binary logs even for daily backups — allows PITR in an emergency'] }
  },
  mongodb: {
    zero:    { tool:'MongoDB Ops Manager / Atlas continuous backup', rto:'Minutes', cmd:`# Cloud Manager / Atlas: continuous backup with PITR
# Self-hosted: enable oplog tailing backup

# mongodump with oplog (consistent snapshot)
mongodump --uri="mongodb://user:pass@host:27017" \\
  --oplog --gzip --out=/backup/\$(date +\\%Y\\%m\\%d)/

# Restore with oplog replay for PITR
mongorestore --uri="mongodb://..." \\
  --oplogReplay --gzip /backup/20250508/`, notes:['Replica set oplog gives you PITR capability','Atlas: enable continuous cloud backup in cluster settings','Self-hosted: use mongodump --oplog for consistent cluster backup'] },
    minutes: { tool:'mongodump every 15 min + oplog tailing', rto:'15–30min', cmd:`# Cron every 15 minutes
*/15 * * * * mongodump --uri="\$MONGO_URI" \\
  --oplog --gzip --out=/backup/\$(date +\\%Y\\%m\\%d_\\%H\\%M)`, notes:['--oplog ensures consistent backup across shards','Upload to S3 with lifecycle policy','Keep 48h of 15-min backups'] },
    hour:    { tool:'Hourly mongodump', rto:'30min–1hour', cmd:`0 * * * * mongodump --uri="\$MONGO_URI" \\
  --gzip --out=/backup/\$(date +\\%Y\\%m\\%d_\\%H)`, notes:['Simple, reliable for most use cases','Logical backup — works across MongoDB versions'] },
    day:     { tool:'Daily mongodump', rto:'1–4 hours', cmd:`0 2 * * * mongodump --uri="\$MONGO_URI" \\
  --gzip --archive > /backup/mongo_\$(date +\\%Y\\%m\\%d).archive`, notes:['Archive format: single file, easier to manage','Suitable for dev/staging or low-volume production'] }
  },
  redis: {
    zero:    { tool:'Redis with AOF (appendonly) + Sentinel', rto:'10–30s (Sentinel failover)', cmd:`# redis.conf
appendonly yes
appendfsync always       # every write synced to disk
aof-rewrite-incremental-fsync yes
no-appendfsync-on-rewrite yes

# Sentinel config
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 5000`, notes:['appendfsync=always: safest but ~30% performance hit','appendfsync=everysec: 1 second max data loss — recommended for most cases','Sentinel handles automatic failover in 5–30 seconds','Use Redis 7+ with replica for zero data loss on failover'] },
    minutes: { tool:'AOF + everysec + RDB snapshots', rto:'30s–2min', cmd:`# redis.conf — recommended production settings
appendonly yes
appendfsync everysec     # 1 second max data loss
save 3600 1              # RDB snapshot hourly
save 300 100             # or every 5min if 100 keys changed`, notes:['AOF handles data safety, RDB handles fast restarts','Combine both: AOF for recovery, RDB for fast startup','Copy RDB files offsite for disaster recovery'] },
    hour:    { tool:'RDB snapshots hourly', rto:'Minutes (restart + load RDB)', cmd:`# redis.conf
save 3600 1
save 300 100
save 60 10000
dir /data
dbfilename dump.rdb\n\n# Manual backup\nredis-cli BGSAVE
cp /data/dump.rdb /backup/redis_\$(date +\\%Y\\%m\\%d_\\%H).rdb`, notes:['RDB is a point-in-time snapshot — can lose up to 1h of data','Fast to create (fork + copy-on-write) — minimal performance impact','Great for caches where losing recent data is acceptable'] },
    day:     { tool:'Daily RDB copy', rto:'Minutes', cmd:`0 2 * * * redis-cli BGSAVE && sleep 5 && \\
  cp /data/dump.rdb /backup/redis_\$(date +\\%Y\\%m\\%d).rdb`, notes:['Only for non-critical data or cache-only Redis','If Redis is the source of truth: use AOF always'] }
  }
};
function renderBackup() {
  const db = document.getElementById('bk-db').value;
  const rpo = document.getElementById('bk-rpo').value;
  const p = backupPlans[db]?.[rpo];
  if (!p) return;
  document.getElementById('bk-result').innerHTML = `
    <div class="tool-grid-2" style="margin-bottom:1rem">
      <div class="tool-stat"><div class="tool-stat-num" style="font-size:.8rem;padding-top:.5rem">${p.tool}</div><div class="tool-stat-lbl">Recommended Approach</div></div>
      <div class="tool-stat"><div class="tool-stat-num" style="font-size:.9rem;padding-top:.4rem">${p.rto}</div><div class="tool-stat-lbl">RTO (Recovery Time)</div></div>
    </div>
    <div class="tool-label">Backup Commands<button class="tool-copy-btn" onclick="toolCopy('bk-cmd')">Copy</button></div>
    <div class="tool-output" id="bk-cmd">${p.cmd}</div>
    <div class="tool-label" style="margin-top:1rem">Key Notes</div>
    ${p.notes.map(n=>`<div class="tool-info">ℹ️ ${n}</div>`).join('')}
  `;
}

const cacheData = {
  cache:{ winner:'Redis', alt:'Memcached', pass:'DragonflyDB',
    verdict:'Redis wins for caching with support for complex data types, TTL per key, atomic operations, and Lua scripting. Memcached is simpler but Redis adds almost no overhead for pure caching.',
    redis:`SET user:42 "{\\"name\\":\\"Eknatha\\"}" EX 3600  # with TTL\\nGET user:42\\nMSET k1 v1 k2 v2 k3 v3            # multi-set\\nDEL user:42                          # evict`,
    memo:`set user_42 <json> 3600   # simple string cache\\nget user_42              # no data types beyond strings\\ndelete user_42`,
    dragonfly:`# DragonflyDB: Redis API, 25x higher throughput\\n# Drop-in Redis replacement for high-concurrency cache\\nSET user:42 "json" EX 3600\\nGET user:42` },
  session:{ winner:'Redis', alt:'Memcached', pass:'DragonflyDB',
    verdict:'Redis is the universal session store. HSET stores session fields individually so you can update one field without rewriting the whole session. EXPIRE sets session timeout.',
    redis:`HSET session:abc123 user_id 42 email "e@lab.com" role "admin"\\nHGET session:abc123 role\\nHGETALL session:abc123\\nEXPIRE session:abc123 3600      # 1 hour TTL\\nHDEL session:abc123 temp_field  # remove single field`,
    memo:`# Memcached: store full session JSON as single value\\n# Can't update individual fields\\nset session_abc123 <json_blob> 3600`,
    dragonfly:`# DragonflyDB: same Redis API, better throughput\\n# Ideal for millions of concurrent sessions` },
  queue:{ winner:'Redis', alt:'RabbitMQ / SQS', pass:'Memcached (not suitable)',
    verdict:'Redis Lists or Streams are perfect for job queues. BRPOP (blocking pop) lets workers wait for jobs without polling. Redis Streams add consumer groups, acknowledgments, and replay.',
    redis:`# Simple queue with Lists\\nLPUSH queue:emails "job:1"     # enqueue\\nBRPOP queue:emails 30          # blocking dequeue (worker)\\n\\n# Streams (for ack + replay)\\nXADD mystream * job_id 1 data "..."\\nXREAD COUNT 10 STREAMS mystream 0\\nXACK mystream mygroup <message-id>`,
    memo:`# Memcached has no queue semantics\\n# Use Redis or a dedicated queue (RabbitMQ, SQS)`,
    dragonfly:`# DragonflyDB supports all Redis queue operations\\n# Higher throughput — better for high-volume queues` },
  pubsub:{ winner:'Redis', alt:'Kafka / NATS', pass:'Memcached (not suitable)',
    verdict:'Redis Pub/Sub is simple and fast for real-time messaging within a single cluster. For persistence, replay, or multi-consumer patterns, use Redis Streams or Kafka.',
    redis:`# Publisher\\nPUBLISH notifications:user:42 '{"type":"message","text":"Hello"}'\\n\\n# Subscriber\\nSUBSCRIBE notifications:user:42\\nPSUBSCRIBE notifications:*     # pattern subscribe\\n\\n# Streams (with persistence and replay)\\nXADD events * type "login" user_id "42"\\nXREAD COUNT 10 BLOCK 0 STREAMS events $`,
    memo:`# Memcached has no pub/sub\\n# Use Redis for pub/sub`,
    dragonfly:`# DragonflyDB supports Redis Pub/Sub\\n# Better for high-throughput event streams` },
  leaderboard:{ winner:'Redis Sorted Sets', alt:'PostgreSQL + materialized view', pass:'Memcached (not suitable)',
    verdict:'Redis Sorted Sets are purpose-built for leaderboards. ZADD, ZREVRANGE, ZREVRANK, and ZINCRBY are O(log n) and atomic. No other caching layer matches this.',
    redis:`ZADD leaderboard 9500 "alice" 8200 "bob" 7100 "charlie"\\nZREVRANGE leaderboard 0 9 WITHSCORES  # top 10\\nZREVRANK leaderboard "alice"           # alice's rank\\nZINcrby leaderboard 500 "bob"          # add 500 points\\nZRANGEBYSCORE leaderboard 5000 +inf   # players > 5000`,
    memo:`# Memcached cannot implement leaderboards natively`,
    dragonfly:`# Same Sorted Set API as Redis\\n# Handle millions of leaderboard updates/sec` },
  ratelimit:{ winner:'Redis', alt:'DragonflyDB', pass:'Memcached (basic fixed window only)',
    verdict:'Redis atomic operations (INCR + EXPIRE, Lua scripts) enable precise rate limiting. DragonflyDB handles higher concurrency for extreme-scale rate limiting.',
    redis:`# Fixed window\nINCR ratelimit:192.168.1.1:2025-05-08-14-00\\nEXPIRE ratelimit:192.168.1.1:2025-05-08-14-00 60\\n\\n# Sliding window (Sorted Set)\nZADD ratelimit:user:42 <now_ms> <now_ms>:<random>\\nZREMRANGEBYSCORE ratelimit:user:42 -inf <60s_ago>\\nZCARD ratelimit:user:42                # current request count\\nEXPIRE ratelimit:user:42 60`,
    memo:`# Basic fixed window only\\nINCR ratelimit_ip_minute\\n# No atomic check+increment — race condition risk`,
    dragonfly:`# Same Redis API for rate limiting\\n# Multi-threaded — better for millions of rate limit keys` },
  lock:{ winner:'Redis (SET NX EX)', alt:'etcd / ZooKeeper', pass:'Memcached (not safe)',
    verdict:'Redis SET NX EX is the standard distributed lock. Atomic: either you get the lock or you don\'t. Use Redlock for multi-node safety. Never use SETNX + EXPIRE (two commands = not atomic).',
    redis:`# Acquire lock — atomic (single command)\nSET lock:payment:123 "worker-id-uuid" NX EX 30\\n# NX = only if not exists, EX = 30 second TTL\\n\\n# Release lock (only if you own it)\nIF GET lock:payment:123 == "worker-id-uuid":\\n  DEL lock:payment:123\\n# (use Lua script for atomic check+delete)\nEVAL "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end" 1 lock:key worker-id`,
    memo:`# Memcached add() command is CAS — basic locking\\n# Not safe for distributed locks — use Redis`,
    dragonfly:`# Redis-compatible distributed lock API\\n# Stronger consistency than Redis in cluster mode` },
  timeseries:{ winner:'Redis TimeSeries module', alt:'InfluxDB / TimescaleDB', pass:'Memcached (not suitable)',
    verdict:'For time-series in Redis, use the RedisTimeSeries module (included in Redis Stack). For serious time-series workloads (billions of points), use InfluxDB or TimescaleDB.',
    redis:`# Redis TimeSeries (Redis Stack / redis-ts module)\\nTS.CREATE temperature:sensor1 RETENTION 86400000 LABELS region us\\nTS.ADD temperature:sensor1 * 23.5    # * = current timestamp\\nTS.RANGE temperature:sensor1 - + COUNT 100\\nTS.MRANGE - + FILTER region=us`,
    memo:`# Memcached has no time-series capability`,
    dragonfly:`# DragonflyDB doesn't support Redis modules\\n# Use InfluxDB or TimescaleDB for time-series` }
};
function cacheUseCase(uc) {
  document.querySelectorAll('.cache-uc-btn').forEach(b=>{
    b.style.borderColor=b.dataset.uc===uc?'var(--accent)':'var(--border)';
    b.style.color=b.dataset.uc===uc?'var(--accent)':'var(--text2)';
    b.style.background=b.dataset.uc===uc?'rgba(79,142,247,.08)':'var(--bg3)';
  });
  const d = cacheData[uc];
  if (!d) return;
  document.getElementById('cache-result').innerHTML = `
    <div class="tool-result-card" style="margin-bottom:1rem">
      <div style="display:flex;gap:.75rem;align-items:center;margin-bottom:.5rem">
        <span style="font-size:1.2rem">🏆</span>
        <div class="tool-result-title" style="margin:0">Recommended: ${d.winner}</div>
      </div>
      <div class="tool-result-body">${d.verdict}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
      <div>
        <div class="tool-label">📦 Redis Commands<button class="tool-copy-btn" onclick="toolCopy('cache-redis')">Copy</button></div>
        <div class="tool-output" id="cache-redis" style="font-size:.72rem">${d.redis}</div>
      </div>
      <div>
        <div class="tool-label">⚡ Memcached / Alternative</div>
        <div class="tool-output" style="font-size:.72rem;color:var(--text3)">${d.memo}</div>
      </div>
    </div>
    <div class="tool-label" style="margin-top:.75rem">🐉 DragonflyDB Note</div>
    <div class="tool-info">${d.dragonfly}</div>
  `;
}

const costData = {
  aws: { small:{rds:180,aurora:220,ec2:70}, medium:{rds:350,aurora:430,ec2:140}, large:{rds:700,aurora:860,ec2:280}, xlarge:{rds:1400,aurora:1720,ec2:560}, storage:0.115, iops:0.1 },
  gcp: { small:{rds:165,aurora:200,ec2:60}, medium:{rds:320,aurora:390,ec2:125}, large:{rds:640,aurora:780,ec2:250}, xlarge:{rds:1280,aurora:1560,ec2:500}, storage:0.17, iops:0 },
  azure:{ small:{rds:175,aurora:210,ec2:65}, medium:{rds:340,aurora:415,ec2:135}, large:{rds:680,aurora:830,ec2:270}, xlarge:{rds:1360,aurora:1660,ec2:540}, storage:0.115, iops:0 },
};
const svcNames = {
  aws:{managed:'Amazon RDS',aurora:'Amazon Aurora',selfmanaged:'EC2 + self-managed'},
  gcp:{managed:'Cloud SQL',aurora:'AlloyDB',selfmanaged:'Compute Engine + self-managed'},
  azure:{managed:'Azure Database',aurora:'Azure Flexible Server',selfmanaged:'Azure VM + self-managed'},
};
function calcCost() {
  const cloud = document.getElementById('cost-cloud').value;
  const size = document.getElementById('cost-size').value;
  const storage = parseInt(document.getElementById('cost-storage').value)||100;
  const replicas = parseInt(document.getElementById('cost-replicas').value)||0;
  const deploy = document.getElementById('cost-deploy').value;
  const d = costData[cloud];
  const deployKey = deploy==='managed'?'rds':deploy==='aurora'?'aurora':'ec2';
  const baseCost = d[size][deployKey];
  const storageCost = storage * d.storage;
  const replicaCost = baseCost * replicas * (deploy==='aurora'?0.6:1.0);
  const total = baseCost + storageCost + replicaCost;
  const managedTotal = d[size]['rds'] + storageCost;
  const auroraTotal = d[size]['aurora'] + storageCost;
  const selfTotal = d[size]['ec2'] + storageCost + 50; // +50 for ops overhead estimate
  const svcs = svcNames[cloud];
  document.getElementById('cost-result').innerHTML = `
    <div class="tool-grid-3" style="margin-bottom:1.25rem">
      <div class="tool-stat"><div class="tool-stat-num" style="color:var(--accent3)">$${Math.round(total)}</div><div class="tool-stat-lbl">Your Config / Month</div></div>
      <div class="tool-stat"><div class="tool-stat-num">$${Math.round(total*12).toLocaleString()}</div><div class="tool-stat-lbl">Annual Cost</div></div>
      <div class="tool-stat"><div class="tool-stat-num" style="font-size:.85rem;padding-top:.4rem">${svcs[deployKey]}</div><div class="tool-stat-lbl">Service</div></div>
    </div>
    <div class="tool-label">Cost Breakdown</div>
    <div class="tool-result-card">
      <div style="display:flex;justify-content:space-between;font-size:.82rem;color:var(--text2);margin-bottom:.3rem"><span>Instance (${size})</span><span style="color:var(--text)">$${Math.round(baseCost)}/mo</span></div>
      <div style="display:flex;justify-content:space-between;font-size:.82rem;color:var(--text2);margin-bottom:.3rem"><span>Storage (${storage}GB × $${d.storage}/GB)</span><span style="color:var(--text)">$${Math.round(storageCost)}/mo</span></div>
      ${replicas>0?`<div style="display:flex;justify-content:space-between;font-size:.82rem;color:var(--text2);margin-bottom:.3rem"><span>Read replicas (${replicas}×)</span><span style="color:var(--text)">$${Math.round(replicaCost)}/mo</span></div>`:''}
      <div style="display:flex;justify-content:space-between;font-size:.88rem;font-weight:700;border-top:1px solid var(--border);padding-top:.4rem;margin-top:.3rem"><span>Total</span><span style="color:var(--accent3)">$${Math.round(total)}/mo</span></div>
    </div>
    <div class="tool-label" style="margin-top:1rem">Comparison (same size, no replicas)</div>
    <div class="tool-result-card">
      <div style="display:flex;justify-content:space-between;font-size:.82rem;padding:.2rem 0"><span style="color:var(--text2)">${svcs.managed}</span><span style="color:var(--text)">~$${Math.round(managedTotal)}/mo</span></div>
      <div style="display:flex;justify-content:space-between;font-size:.82rem;padding:.2rem 0"><span style="color:var(--text2)">${svcs.aurora}</span><span style="color:var(--text)">~$${Math.round(auroraTotal)}/mo</span></div>
      <div style="display:flex;justify-content:space-between;font-size:.82rem;padding:.2rem 0"><span style="color:var(--text2)">${svcs.selfmanaged}</span><span style="color:var(--accent5)">~$${Math.round(selfTotal)}/mo + ops time</span></div>
    </div>
    <div class="tool-info" style="margin-top:.75rem">ℹ️ Estimates based on on-demand pricing. Reserved instances (1yr) save ~30-40%. Prices vary by region. Always verify current pricing at the cloud provider's pricing calculator.</div>
    <div class="tool-warn">⚠️ Self-managed saves ~50-60% on instance cost but adds engineering time (~4-8h/month for patches, backups, monitoring setup) — worth it only at scale.</div>
  `;
}

const k8sGuides = {
  postgresql:{ op:'CloudNativePG', install:`kubectl apply -f \\
  https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/main/releases/cnpg-1.22.0.yaml`, cr:`apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgres-prod
  namespace: databases
spec:
  instances: 3
  storage:
    size: 50Gi
    storageClass: fast-ssd
  backup:
    barmanObjectStore:
      destinationPath: "s3://my-bucket/postgres/"
      s3Credentials:
        accessKeyId: { name: s3-secret, key: ACCESS_KEY_ID }
        secretAccessKey: { name: s3-secret, key: SECRET_ACCESS_KEY }
  monitoring:
    enablePodMonitor: true
  resources:
    requests: { memory: 2Gi, cpu: "1" }
    limits:   { memory: 4Gi, cpu: "2" }`, checks:['kubectl get cluster postgres-prod -n databases','kubectl cnpg status postgres-prod','kubectl get pods -n databases -l cnpg.io/cluster=postgres-prod'] },
  mysql:{ op:'Percona Operator', install:`helm repo add percona https://percona.github.io/percona-helm-charts/
helm install ps-operator percona/ps-operator -n databases --create-namespace`, cr:`apiVersion: ps.percona.com/v1alpha1
kind: PerconaServerMySQL
metadata:
  name: mysql-cluster
  namespace: databases
spec:
  crVersion: 0.7.0
  mysql:
    clusterType: group-replication
    size: 3
    image: percona/percona-server:8.0
    resources:
      requests: { memory: 2Gi, cpu: "1" }
    volumeSpec:
      persistentVolumeClaim:
        resources:
          requests: { storage: 30Gi }
  proxy:
    router: { enabled: true, size: 2 }`, checks:['kubectl get ps mysql-cluster -n databases','kubectl get pods -n databases -l app.kubernetes.io/name=mysql-cluster'] },
  mongodb:{ op:'MongoDB Community Operator', install:`helm repo add mongodb https://mongodb.github.io/helm-charts
helm install community-operator mongodb/community-operator -n mongodb --create-namespace`, cr:`apiVersion: mongodbcommunity.mongodb.com/v1
kind: MongoDBCommunity
metadata:
  name: mongodb-rs
  namespace: mongodb
spec:
  members: 3
  type: ReplicaSet
  version: "7.0.4"
  security:
    authentication: { modes: ["SCRAM"] }
  users:
    - name: appuser
      db: myapp
      passwordSecretRef: { name: mongo-secret }
      roles: [{ name: readWrite, db: myapp }]
  statefulSet:
    spec:
      volumeClaimTemplates:
        - metadata: { name: data-volume }
          spec:
            accessModes: ["ReadWriteOnce"]
            resources: { requests: { storage: 20Gi } }
            storageClassName: fast-ssd`, checks:['kubectl get mongodbcommunity mongodb-rs -n mongodb','kubectl get pods -n mongodb'] },
  redis:{ op:'Bitnami Redis Helm', install:`helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis \\
  --set auth.password=mypassword \\
  --set replica.replicaCount=2 \\
  --set sentinel.enabled=true \\
  -n databases --create-namespace`, cr:`# values.yaml for customisation
auth:
  password: myStrongPassword
architecture: replication
replica:
  replicaCount: 2
sentinel:
  enabled: true
  quorum: 2
master:
  persistence:
    size: 10Gi
    storageClass: fast-ssd
  resources:
    requests: { memory: 1Gi, cpu: 500m }`, checks:['kubectl get pods -n databases -l app.kubernetes.io/name=redis','redis-cli -h redis-master.databases.svc.cluster.local -a mypassword ping'] },
  cassandra:{ op:'K8ssandra Operator', install:`helm repo add k8ssandra https://helm.k8ssandra.io/stable
helm install k8ssandra-operator k8ssandra/k8ssandra-operator \\
  -n k8ssandra-operator --create-namespace`, cr:`apiVersion: k8ssandra.io/v1alpha1
kind: K8ssandraCluster
metadata:
  name: cassandra-cluster
  namespace: databases
spec:
  cassandra:
    serverVersion: "4.1.3"
    datacenters:
      - metadata: { name: dc1 }
        size: 3
        storageConfig:
          cassandraDataVolumeClaimSpec:
            storageClassName: fast-ssd
            accessModes: ["ReadWriteOnce"]
            resources: { requests: { storage: 100Gi } }
        resources:
          requests: { cpu: "2", memory: 8Gi }
  reaper: { deploymentMode: SINGLE }`, checks:['kubectl get k8cs cassandra-cluster -n databases','kubectl exec -n databases cassandra-cluster-dc1-default-sts-0 -- nodetool status'] },
  elasticsearch:{ op:'ECK (Elastic Cloud on K8s)', install:`kubectl create -f https://download.elastic.co/downloads/eck/2.11.0/crds.yaml
kubectl apply -f https://download.elastic.co/downloads/eck/2.11.0/operator.yaml`, cr:`apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: es-cluster
  namespace: databases
spec:
  version: 8.12.0
  nodeSets:
    - name: masters
      count: 3
      config:
        node.roles: ["master"]
      volumeClaimTemplates:
        - metadata: { name: elasticsearch-data }
          spec: { resources: { requests: { storage: 10Gi } } }
    - name: data
      count: 3
      config:
        node.roles: ["data","ingest"]
      podTemplate:
        spec:
          containers:
            - name: elasticsearch
              resources:
                requests: { memory: 4Gi, cpu: 2 }
      volumeClaimTemplates:
        - metadata: { name: elasticsearch-data }
          spec:
            resources: { requests: { storage: 100Gi } }
            storageClassName: fast-ssd`, checks:['kubectl get elasticsearch es-cluster -n databases','curl -k -u "elastic:$(kubectl get secret es-cluster-es-elastic-user -o jsonpath=\'{.data.elastic}\' | base64 -d)" https://es-cluster-es-http:9200/_cluster/health'] }
};
function renderK8sGuide() {
  const dbKey2 = document.getElementById('k8s-db').value;
  const g = k8sGuides[dbKey2];
  if (!g) return;
  document.getElementById('k8s-result').innerHTML = `
    <div class="tool-result-card" style="margin-bottom:1rem">
      <div class="tool-result-title">Operator: ${g.op}</div>
      <div class="tool-label" style="margin-top:.75rem">Install Operator<button class="tool-copy-btn" onclick="toolCopy('k8s-install')">Copy</button></div>
      <div class="tool-output" id="k8s-install">${g.install}</div>
    </div>
    <div class="tool-label">Custom Resource (CR) Manifest<button class="tool-copy-btn" onclick="toolCopy('k8s-cr')">Copy</button></div>
    <div class="tool-output" id="k8s-cr">${g.cr}</div>
    <div class="tool-label" style="margin-top:1rem">Verify Deployment</div>
    ${g.checks.map(c=>`<div class="tool-output" style="margin-bottom:.4rem;min-height:auto;padding:.5rem 1rem">${c}</div>`).join('')}
    <div class="tool-info" style="margin-top:.75rem">ℹ️ Always use a dedicated namespace for databases. Use SSD StorageClass (gp3, pd-ssd, Premium SSD). Add PodDisruptionBudget to prevent simultaneous pod evictions.</div>
  `;
}

const mapData = {
  mongodb:{
    table:{ sql:`CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`, nosql:`// MongoDB: no schema definition needed (dynamic)
// Optional: enforce schema via validator
db.createCollection("users", {
  validator: { \\$jsonSchema: {
    required: ["name", "email"],
    properties: {
      name: { bsonType: "string" },
      email: { bsonType: "string" }
    }
  }}
})

// Document equivalent:
{ _id: ObjectId(), name: "Alice", email: "a@b.com", createdAt: new Date() }`, note:'MongoDB has no fixed schema. Every document can have different fields. ObjectId replaces BIGSERIAL — it\'s auto-generated and includes a timestamp.' },
    query:{ sql:`SELECT id, name, email FROM users
WHERE email = 'alice@example.com'
  AND created_at > '2025-01-01'
ORDER BY created_at DESC
LIMIT 20;`, nosql:`db.users.find(
  {
    email: "alice@example.com",
    createdAt: { \\$gt: new Date("2025-01-01") }
  },
  { _id: 1, name: 1, email: 1 }   // projection (SELECT)
).sort({ createdAt: -1 }).limit(20)`, note:'find() = SELECT + WHERE. Second arg = projection (which fields). sort() = ORDER BY. limit() = LIMIT.' },
    insert:{ sql:`INSERT INTO users (name, email)
VALUES ('Alice', 'alice@example.com')
RETURNING id;`, nosql:`const result = await db.users.insertOne({
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date()
})
console.log(result.insertedId)  // equivalent of RETURNING id`, note:'insertOne() returns the generated _id. insertMany() for bulk inserts.' },
    update:{ sql:`UPDATE users
SET name = 'Alice Smith', updated_at = NOW()
WHERE id = 42;`, nosql:`db.users.updateOne(
  { _id: ObjectId("...") },           // filter
  { \\$set: { name: "Alice Smith", updatedAt: new Date() } }  // update
)
// $inc, $push, $pull, $addToSet are other operators`, note:'$set modifies specific fields. Without $set, the entire document is replaced.' },
    delete:{ sql:`DELETE FROM users WHERE id = 42;
DELETE FROM users WHERE last_login < '2024-01-01';`, nosql:`db.users.deleteOne({ _id: ObjectId("...") })
db.users.deleteMany({ lastLogin: { \\$lt: new Date("2024-01-01") } })`, note:'deleteOne/deleteMany mirror SQL DELETE. No cascade — manage related data in application.' },
    join:{ sql:`SELECT u.name, o.total, o.status
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.id = 42;`, nosql:`// Option 1: $lookup (equivalent to LEFT JOIN)
db.users.aggregate([
  { \\$match: { _id: ObjectId("...") } },
  { \\$lookup: {
    from: "orders",
    localField: "_id",
    foreignField: "userId",
    as: "orders"
  }},
  { \\$unwind: "\\$orders" },
  { \\$project: { name: 1, "orders.total": 1, "orders.status": 1 } }
])

// Option 2 (better): embed orders in user document`, note:'$lookup is MongoDB\'s JOIN — use sparingly. Better design: embed data that is always read together.' },
    aggregate:{ sql:`SELECT status, COUNT(*) AS count, SUM(total) AS revenue
FROM orders
WHERE created_at > '2025-01-01'
GROUP BY status
HAVING COUNT(*) > 10
ORDER BY revenue DESC;`, nosql:`db.orders.aggregate([
  { \\$match: { createdAt: { \\$gt: new Date("2025-01-01") } } },  // WHERE
  { \\$group: {
    _id: "\\$status",                   // GROUP BY status
    count: { \\$sum: 1 },              // COUNT(*)
    revenue: { \\$sum: "\\$total" }     // SUM(total)
  }},
  { \\$match: { count: { \\$gt: 10 } } },                         // HAVING
  { \\$sort: { revenue: -1 } }                                    // ORDER BY
])`, note:'Pipeline stages mirror SQL clauses. $match early to reduce documents. $group = GROUP BY. Second $match after $group = HAVING.' },
    index:{ sql:`CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);`, nosql:`db.users.createIndex({ email: 1 })                    // single field
db.orders.createIndex({ userId: 1, status: 1 })       // compound (like composite SQL)
db.articles.createIndex({ tags: 1 })                  // multikey (array)
db.users.createIndex({ email: 1 }, { unique: true })  // unique`, note:'Compound index field order matters — queries must use leftmost fields. Multikey index auto-created for arrays.' },
    transaction:{ sql:`BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;`, nosql:`// MongoDB multi-document transactions (4.0+, replica set required)
const session = client.startSession()
session.startTransaction()
try {
  await accounts.updateOne({ _id: 1 }, { \\$inc: { balance: -100 } }, { session })
  await accounts.updateOne({ _id: 2 }, { \\$inc: { balance: 100  } }, { session })
  await session.commitTransaction()
} catch(e) {
  await session.abortTransaction()
} finally { session.endSession() }`, note:'Multi-document transactions require a replica set. Single-document operations are always atomic without transactions.' }
  },
  cassandra:{
    table:{ sql:`CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2),
  status VARCHAR(20),
  created_at TIMESTAMPTZ
);`, nosql:`-- Cassandra: design around queries, not data
-- Query: "get orders for user, newest first"
CREATE TABLE orders_by_user (
  user_id  UUID,
  order_id TIMEUUID,      -- time-based UUID = auto sorted by time
  total    DECIMAL,
  status   TEXT,
  PRIMARY KEY (user_id, order_id)
) WITH CLUSTERING ORDER BY (order_id DESC);`, note:'Cassandra tables are designed for one specific query pattern. No JOINs — duplicate data across tables instead.' },
    query:{ sql:`SELECT * FROM orders WHERE user_id = 42
ORDER BY created_at DESC LIMIT 20;`, nosql:`-- Must include partition key in WHERE
SELECT * FROM orders_by_user
WHERE user_id = a1b2c3d4-e5f6-7890-abcd-ef1234567890
LIMIT 20;
-- TIMEUUID clustering gives you DESC order for free`, note:'Cassandra queries MUST include the partition key. Clustering columns can be used in ORDER BY and range conditions.' },
    insert:{ sql:`INSERT INTO orders (user_id, total, status) VALUES (42, 99.99, 'pending');`, nosql:`-- INSERT is always an UPSERT in Cassandra
INSERT INTO orders_by_user (user_id, order_id, total, status)
VALUES (uuid(), now(), 99.99, 'pending');
-- now() generates a TIMEUUID with current timestamp`, note:'All Cassandra INSERTs are upserts. If the primary key matches, the row is replaced. Use IF NOT EXISTS for true insert-only.' },
    update:{ sql:`UPDATE orders SET status = 'shipped' WHERE id = 1;`, nosql:`UPDATE orders_by_user
SET status = 'shipped'
WHERE user_id = ? AND order_id = ?;

-- Lightweight transaction (compare-and-set)
UPDATE orders_by_user SET status = 'shipped'
WHERE user_id = ? AND order_id = ?
IF status = 'processing';`, note:'IF conditions use Paxos — much slower. Only use when strictly needed.' },
    delete:{ sql:`DELETE FROM orders WHERE id = 1;`, nosql:`-- Delete specific row
DELETE FROM orders_by_user
WHERE user_id = ? AND order_id = ?;

-- Delete entire partition
DELETE FROM orders_by_user WHERE user_id = ?;

-- Tombstone warning: deletes create tombstones, not immediate removal`, note:'Tombstones accumulate until gc_grace_seconds (10 days default). High delete rates cause tombstone warnings and slow reads.' },
    join:{ sql:`SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id;`, nosql:`-- NO JOINS in Cassandra
-- Solution 1: denormalize — store user name in orders table
-- Solution 2: application-side join (2 queries)

-- Table 1
SELECT order_id, total, user_name FROM orders_by_user WHERE user_id=?;
-- user_name is stored redundantly (denormalized)`, note:'Cassandra has no JOINs. Design tables to contain all data needed for each query. Data duplication is intentional and expected.' },
    aggregate:{ sql:`SELECT COUNT(*), SUM(total) FROM orders WHERE status='completed';`, nosql:`-- Limited aggregation in CQL
SELECT COUNT(*) FROM orders_by_user WHERE user_id=?;

-- For complex aggregation: use Spark Cassandra Connector
-- or pre-aggregate in a separate table:
CREATE TABLE order_stats (
  user_id UUID PRIMARY KEY,
  order_count COUNTER,
  -- cannot mix COUNTER with regular columns
);
UPDATE order_stats SET order_count = order_count + 1 WHERE user_id=?;`, note:'Cassandra has very limited aggregation. For analytics, stream data to ClickHouse or Spark.' },
    index:{ sql:`CREATE INDEX idx_orders_status ON orders(status);`, nosql:`-- Secondary indexes (use sparingly)
CREATE INDEX ON orders_by_user(status);
-- WARNING: low cardinality + secondary index = bad performance

-- Better: create a dedicated table
CREATE TABLE orders_by_status (
  status   TEXT,
  order_id TIMEUUID,
  user_id  UUID,
  PRIMARY KEY (status, order_id)
);`, note:'Secondary indexes on low-cardinality columns are inefficient. Model a separate table with status as partition key instead.' },
    transaction:{ sql:`BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;`, nosql:`-- Cassandra has no multi-row transactions
-- Use BATCH for atomicity within same partition:
BEGIN BATCH
  UPDATE users_by_id SET last_order=? WHERE user_id=?;
  UPDATE users_by_email SET last_order=? WHERE email=?;
APPLY BATCH;

-- Lightweight transactions (single-row CAS only)
UPDATE accounts SET balance = balance - 100
WHERE id = ? IF balance >= 100;`, note:'BATCH in Cassandra is NOT like SQL transactions — it only guarantees atomicity for same-partition rows. LWT (IF) uses Paxos and is 4-10x slower.' }
  },
  dynamodb:{
    table:{ sql:`CREATE TABLE users (id BIGSERIAL PRIMARY KEY, email VARCHAR UNIQUE, name VARCHAR, created_at TIMESTAMPTZ);`, nosql:`aws dynamodb create-table \\
  --table-name Users \\
  --attribute-definitions \\
    AttributeName=userId,AttributeType=S \\
    AttributeName=email,AttributeType=S \\
  --key-schema \\
    AttributeName=userId,KeyType=HASH \\
  --global-secondary-indexes '[{
    "IndexName":"EmailIndex",
    "KeySchema":[{"AttributeName":"email","KeyType":"HASH"}],
    "Projection":{"ProjectionType":"ALL"}
  }]' \\
  --billing-mode PAY_PER_REQUEST`, note:'DynamoDB: define only key attributes upfront. All other attributes are schema-free. Plan GSIs carefully — they cannot be changed after creation.' },
    query:{ sql:`SELECT * FROM orders WHERE user_id=42 AND created_at > '2025-01-01' LIMIT 20;`, nosql:`aws dynamodb query \\
  --table-name Orders \\
  --key-condition-expression "userId = :uid AND createdAt > :date" \\
  --expression-attribute-values '{
    ":uid":  {"S":"user-42"},
    ":date": {"S":"2025-01-01T00:00:00Z"}
  }' \\
  --scan-index-forward false \\  # DESC order
  --limit 20`, note:'Query requires partition key. Sort key enables range conditions. Never use Scan in production — it reads the entire table.' },
    insert:{ sql:`INSERT INTO users (name, email) VALUES ('Alice', 'a@b.com') RETURNING id;`, nosql:`aws dynamodb put-item \\
  --table-name Users \\
  --item '{
    "userId": {"S": "user-abc123"},
    "email":  {"S": "alice@example.com"},
    "name":   {"S": "Alice"},
    "createdAt": {"S": "2025-05-08T10:00:00Z"}
  }' \\
  --condition-expression "attribute_not_exists(userId)"  # prevent duplicate`, note:'put-item is an upsert. Use condition-expression attribute_not_exists() to make it an INSERT-only.' },
    update:{ sql:`UPDATE orders SET status='shipped' WHERE id=1;`, nosql:`aws dynamodb update-item \\
  --table-name Orders \\
  --key '{"orderId":{"S":"order-1"}}' \\
  --update-expression "SET #s = :status, updatedAt = :now" \\
  --expression-attribute-names '{"#s":"status"}' \\
  --expression-attribute-values '{
    ":status": {"S":"shipped"},
    ":now":    {"S":"2025-05-08T10:00:00Z"}
  }'`, note:'update-item only modifies specified attributes — other attributes unchanged. Use ADD for atomic counter increments.' },
    delete:{ sql:`DELETE FROM orders WHERE id=1;`, nosql:`aws dynamodb delete-item \\
  --table-name Orders \\
  --key '{"orderId":{"S":"order-1"}}'

# Conditional delete
aws dynamodb delete-item \\
  --table-name Orders \\
  --key '{"orderId":{"S":"order-1"}}' \\
  --condition-expression "#s = :status" \\
  --expression-attribute-names '{"#s":"status"}' \\
  --expression-attribute-values '{":status":{"S":"cancelled"}}'`, note:'delete-item is instantaneous and permanent. No soft-delete natively — add a deletedAt attribute pattern.' },
    join:{ sql:`SELECT u.name, o.total FROM users u JOIN orders o ON u.id=o.user_id;`, nosql:`# No JOINs in DynamoDB
# Solution 1: Single Table Design — store all entity types in one table
# PK=USER#u1  SK=PROFILE       → user data
# PK=USER#u1  SK=ORDER#2025-05 → order data
# Query: get user + orders in one request
aws dynamodb query \\
  --table-name MyApp \\
  --key-condition-expression "PK = :pk" \\
  --expression-attribute-values '{":pk":{"S":"USER#u1"}}'`, note:'Single Table Design is the DynamoDB way. All entity types in one table using PK/SK prefixes. One query returns user + all their orders.' },
    aggregate:{ sql:`SELECT COUNT(*), SUM(total) FROM orders GROUP BY status;`, nosql:`# No GROUP BY in DynamoDB
# Option 1: Scan with FilterExpression (slow — avoid)
# Option 2: Maintain aggregate items in the same table
# PK=STATS  SK=orders#completed → { count: 42, total: 9999.99 }

# Atomic counter update on each order:
aws dynamodb update-item \\
  --table-name MyApp \\
  --key '{"PK":{"S":"STATS"},"SK":{"S":"orders#completed"}}' \\
  --update-expression "ADD #cnt :one, #tot :amount" \\
  --expression-attribute-names '{"#cnt":"count","#tot":"total"}' \\
  --expression-attribute-values '{":one":{"N":"1"},":amount":{"N":"99.99"}}'`, note:'DynamoDB has no server-side aggregation. Pre-aggregate during writes using atomic ADD operations on a dedicated stats item.' },
    index:{ sql:`CREATE INDEX idx_orders_status ON orders(status, created_at);`, nosql:`# Global Secondary Index (GSI) — defined at table creation or added later
# Only supports HASH (partition) and RANGE (sort) key patterns
# No arbitrary column indexing like B-tree

aws dynamodb update-table \\
  --table-name Orders \\
  --global-secondary-index-updates '[{"Create":{
    "IndexName":"StatusCreatedIndex",
    "KeySchema":[
      {"AttributeName":"status","KeyType":"HASH"},
      {"AttributeName":"createdAt","KeyType":"RANGE"}
    ],
    "Projection":{"ProjectionType":"ALL"}
  }}]' \\
  --billing-mode PAY_PER_REQUEST`, note:'GSI max 20 per table. Plan carefully — GSIs replicate data and cost money. Cannot delete and recreate without downtime.' },
    transaction:{ sql:`BEGIN;\nUPDATE accounts SET balance=balance-100 WHERE id=1;\nUPDATE accounts SET balance=balance+100 WHERE id=2;\nCOMMIT;`, nosql:`aws dynamodb transact-write \\
  --transact-items '[
    {"Update":{
      "TableName":"Accounts",
      "Key":{"id":{"S":"acc-1"}},
      "UpdateExpression":"ADD balance :dec",
      "ConditionExpression":"balance >= :amt",
      "ExpressionAttributeValues":{":dec":{"N":"-100"},":amt":{"N":"100"}}
    }},
    {"Update":{
      "TableName":"Accounts",
      "Key":{"id":{"S":"acc-2"}},
      "UpdateExpression":"ADD balance :inc",
      "ExpressionAttributeValues":{":inc":{"N":"100"}}
    }}
  ]'`, note:'transact-write: up to 100 items across multiple tables in one atomic operation. 2x cost vs regular writes. Use condition expressions to prevent overdraft.' }
  },
  redis:{
    table:{ sql:`CREATE TABLE sessions (id VARCHAR PRIMARY KEY, user_id INT, data JSONB, expires_at TIMESTAMPTZ);`, nosql:`# Redis has no tables — use key naming conventions
# Pattern: type:id:field

# Session as Hash
HSET session:abc123 user_id 42 data '{"role":"admin"}' expires 1746691200
EXPIRE session:abc123 3600      # auto-delete in 1 hour

# Session as String (JSON)
SET session:abc123 '{"user_id":42,"role":"admin"}' EX 3600`, note:'Redis key naming convention is critical — it IS your schema. type:id or type:id:subtype. EXPIRE handles session cleanup automatically.' },
    query:{ sql:`SELECT * FROM sessions WHERE id = 'abc123';`, nosql:`# Exact key lookup — O(1)
GET session:abc123               # String
HGETALL session:abc123           # Hash (all fields)
HMGET session:abc123 user_id data # Hash (specific fields)

# Scan for keys (avoid in production)
SCAN 0 MATCH session:* COUNT 100`, note:'Redis has no WHERE clause. Only exact key lookups (O(1)) or SCAN (O(n)). Design keys to support your access patterns.' },
    insert:{ sql:`INSERT INTO cache (key, value, ttl) VALUES ('user:42', '...', 3600);`, nosql:`SET user:42 '{"name":"Alice","email":"a@b.com"}' EX 3600
HSET user:42 name Alice email a@b.com
EXPIRE user:42 3600

# Only insert if not exists
SET user:42 "value" NX EX 3600    # NX = only if not exists`, note:'NX flag makes SET an insert-only (fails if key exists). EX sets TTL in seconds. PX for milliseconds.' },
    update:{ sql:`UPDATE users SET name='Alice Smith' WHERE id=42;`, nosql:`# Update single hash field
HSET user:42 name "Alice Smith"

# Atomic increment
INCR page:42:views
INCRBY product:42:stock -5

# Append to list
LPUSH user:42:activity "login:2025-05-08"`, note:'HSET updates specific fields without rewriting the whole value. INCR is atomic — safe for concurrent counters.' },
    delete:{ sql:`DELETE FROM cache WHERE key='user:42';\nDELETE FROM sessions WHERE expires_at < NOW();`, nosql:`DEL user:42                   # delete key
DEL key1 key2 key3           # delete multiple

# Auto-delete with TTL (preferred for sessions/cache)
EXPIRE user:42 0             # delete immediately via TTL=0
SET session:abc NX EX 3600   # auto-deletes in 1h`, note:'Use TTL (EXPIRE) for cache/session cleanup instead of manual DELETE — Redis handles expiry automatically and efficiently.' },
    join:{ sql:`SELECT u.name, s.data FROM users u JOIN sessions s ON u.id = s.user_id;`, nosql:`# Redis has no JOINs
# Solution 1: embed related data
SET session:abc123 '{"user_id":42,"user_name":"Alice","role":"admin"}'

# Solution 2: application-side join (2 round trips)
user_id = HGET session:abc123 user_id
user_data = HGETALL user:\${user_id}

# Solution 3: cache the join result
SET user_session:42 '{"session_id":"abc","name":"Alice","role":"admin"}' EX 300`, note:'Redis is not relational. Denormalize data into the value (embed related data). Cache join results with appropriate TTL.' },
    aggregate:{ sql:`SELECT COUNT(*), SUM(amount) FROM orders GROUP BY status;`, nosql:`# Redis: use data structures designed for aggregation
# Sorted Set for ranked counts
ZADD order_status_counts 0 pending
ZINCRBY order_status_counts 1 completed   # atomic increment
ZINCRBY order_status_counts 1 pending

# HyperLogLog for unique counts (approximate)
PFADD daily_active_users:2025-05-08 user:42 user:43
PFCOUNT daily_active_users:2025-05-08    # ~1% error

# Running sum
INCRBYFLOAT revenue:today 99.99`, note:'Redis is not for ad-hoc analytics. Pre-aggregate during writes using ZINCRBY, INCR, INCRBYFLOAT. HyperLogLog for approximate unique counts at 12KB memory.' },
    index:{ sql:`CREATE INDEX idx_users_email ON users(email);`, nosql:`# Redis has no secondary indexes
# Solution: maintain an explicit reverse-lookup key

# When storing user
SET user:42 '{"email":"alice@example.com",...}'
SET email:alice@example.com 42    # reverse index

# Lookup by email:
user_id = GET email:alice@example.com
user = GET user:\${user_id}

# Sets for category index
SADD tag:kubernetes article:1 article:2 article:5
SMEMBERS tag:kubernetes      # all articles with tag`, note:'Explicit reverse-lookup keys ARE Redis indexes. Maintain them atomically with MULTI/EXEC or Lua scripts when updating primary data.' },
    transaction:{ sql:`BEGIN;\nUPDATE accounts SET balance=balance-100 WHERE id=1;\nUPDATE accounts SET balance=balance+100 WHERE id=2;\nCOMMIT;`, nosql:`# Redis MULTI/EXEC — queues commands, executes atomically
MULTI
DECRBY account:1 100
INCRBY account:2 100
EXEC

# Watch for optimistic locking (CAS pattern)
WATCH account:1
balance = GET account:1
if balance >= 100:
  MULTI
  DECRBY account:1 100
  INCRBY account:2 100
  result = EXEC  # returns nil if WATCH key changed`, note:'MULTI/EXEC is atomic but not ACID — no isolation. WATCH implements optimistic locking. For true atomic conditional: use Lua scripts (EVAL).' }
  }
};
function renderMap() {
  const db = document.getElementById('map-db').value;
  const concept = document.getElementById('map-concept').value;
  const d = mapData[db]?.[concept];
  if (!d) return;
  document.getElementById('map-result').innerHTML = `
    <div class="tool-grid-2">
      <div>
        <div class="tool-label">SQL<button class="tool-copy-btn" onclick="toolCopy('map-sql')">Copy</button></div>
        <div class="tool-output" id="map-sql">${d.sql}</div>
      </div>
      <div>
        <div class="tool-label">${document.getElementById('map-db').options[document.getElementById('map-db').selectedIndex].text}<button class="tool-copy-btn" onclick="toolCopy('map-nosql')">Copy</button></div>
        <div class="tool-output" id="map-nosql">${d.nosql}</div>
      </div>
    </div>
    <div class="tool-info" style="margin-top:.75rem">ℹ️ ${d.note}</div>
  `;
}





