// ===== DECISION WIZARD =====
const wizardSteps = [
  {
    q:'What type of data will you store?',
    hint:'Think about the structure and relationships in your data.',
    opts:[
      { label:'📊 Structured & relational', next:1 },
      { label:'📄 Documents / JSON / flexible schema', next:2 },
      { label:'🔑 Simple key-value / cache', next:3 },
      { label:'🕸️ Highly connected / graph data', result:'Neo4j', reason:'Your data is naturally modeled as nodes and edges — relationships ARE the data. Neo4j\'s Cypher query language makes traversing connections 100-1000x faster than SQL JOINs.' }
    ]
  },
  {
    q:'Do you need ACID transactions?',
    hint:'ACID = Atomicity, Consistency, Isolation, Durability.',
    opts:[
      { label:'✅ Yes, strong consistency required', next:4 },
      { label:'📈 Time-series / metrics data primarily', result:'TimescaleDB', reason:'TimescaleDB gives you PostgreSQL\'s full SQL + ACID + automatic time-based partitioning. Best of both worlds: relational joins on time-series data.' },
      { label:'🌍 Global distribution, massive scale', result:'CockroachDB', reason:'CockroachDB gives you distributed SQL with ACID guarantees across regions. PostgreSQL-compatible wire protocol makes migration easier.' }
    ]
  },
  {
    q:'What scale are you targeting?',
    hint:'How much data and how many requests per second?',
    opts:[
      { label:'📱 Small-medium, single region', result:'MongoDB', reason:'MongoDB\'s flexible document model lets your schema evolve with your product. Excellent tooling, large ecosystem, and straightforward horizontal sharding when you need it.' },
      { label:'⚡ High write throughput, any scale', result:'Apache Cassandra', reason:'Cassandra\'s peer-to-peer architecture and partition key design enables linear scalability. No single point of failure and tuneable consistency make it ideal for high-volume writes.' },
      { label:'🔥 Real-time sync, serverless/mobile', result:'Cloud Firestore', reason:'Firestore\'s real-time listeners and offline persistence make it ideal for mobile-first apps. Serverless billing means no infrastructure management.' }
    ]
  },
  {
    q:'What is your primary use case?',
    hint:'This determines the most cost-effective caching strategy.',
    opts:[
      { label:'⚡ High-performance cache + data structures', result:'Redis', reason:'Redis is the gold standard for caching. Beyond simple cache, it supports pub/sub, queues, leaderboards, rate limiting, and distributed locking — essential for microservices.' },
      { label:'🔋 Pure object cache, horizontal scale', result:'Memcached', reason:'Memcached is simpler and faster for pure caching workloads. Its multi-threaded architecture and straightforward model make it ideal when you just need a fast, distributed cache.' },
      { label:'🌐 AWS-native, serverless key-value', result:'Amazon DynamoDB', reason:'DynamoDB\'s serverless model means zero infrastructure management. Single-digit millisecond latency at any scale, built-in global tables, and AWS ecosystem integration.' }
    ]
  },
  {
    q:'What workload type dominates?',
    hint:'OLTP = transactions. OLAP = analytics. HTAP = both.',
    opts:[
      { label:'💳 OLTP — high concurrency transactions', result:'PostgreSQL', reason:'PostgreSQL is the best all-around OLTP database. ACID, full SQL, JSON support, extensions (pgvector, TimescaleDB, PostGIS), and a massive ecosystem. The default choice for 80% of use cases.' },
      { label:'📊 OLAP — analytics, reporting, BI', result:'ClickHouse', reason:'ClickHouse processes billions of rows per second on a single server. Its columnar storage and vectorized execution make it 100-1000x faster than row-oriented databases for analytical queries.' },
      { label:'🔍 Full-text search + analytics', result:'Elasticsearch', reason:'Elasticsearch\'s inverted index enables sub-second full-text search across billions of documents. Combined with Kibana, it\'s the standard for log analytics (ELK stack) and application search.' }
    ]
  }
];

let wizardHistory = [];

function initWizard() {
  wizardHistory = [];
  renderWizardStep(0);
}

function renderWizardStep(stepIndex) {
  const step = wizardSteps[stepIndex];
  const container = document.getElementById('wizard-container');
  const progress = document.getElementById('wizard-progress');
  progress.innerHTML = wizardSteps.map((_,i) => `<div class="wizard-dot ${i < wizardHistory.length ? 'done' : i === stepIndex ? 'active' : ''}"></div>`).join('');
  container.innerHTML = `
  <div class="wizard-question">${step.q}</div>
  <div class="wizard-hint">${step.hint}</div>
  <div class="wizard-options">
    ${step.opts.map((opt,i) => `
    <button class="wizard-option" onclick="wizardChoose(${stepIndex},${i})">${opt.label}</button>
    `).join('')}
  </div>
  ${wizardHistory.length > 0 ? '<br><button class="wizard-restart" onclick="wizardBack()">← Back</button>' : ''}`;
}

function wizardChoose(stepIndex, optIndex) {
  const opt = wizardSteps[stepIndex].opts[optIndex];
  wizardHistory.push(stepIndex);
  if (opt.result) {
    showWizardResult(opt.result, opt.reason);
  } else {
    renderWizardStep(opt.next);
  }
}

function wizardBack() {
  if (wizardHistory.length > 0) {
    const prev = wizardHistory.pop();
    renderWizardStep(prev);
  }
}

function showWizardResult(dbName, reason) {
  const db = databases.find(d => d.name === dbName || d.name.includes(dbName));
  const container = document.getElementById('wizard-container');
  document.getElementById('wizard-progress').innerHTML = wizardSteps.map(() => '<div class="wizard-dot done"></div>').join('');
  container.innerHTML = `
  <div class="wizard-result">
    <div style="font-size:3rem;margin-bottom:0.5rem">${db ? db.icon : '🗄️'}</div>
    <div class="wizard-result-name">${dbName}</div>
    <div class="wizard-result-reason">${reason}</div>
    ${db ? `<div class="db-badges" style="justify-content:center;margin-bottom:1.5rem">
      <span class="badge badge-type">${db.type.split(' ')[0]}</span>
      ${db.acid ? '<span class="badge badge-acid">ACID</span>' : ''}
      ${db.cloud ? '<span class="badge badge-cloud">Cloud Managed</span>' : ''}
    </div>` : ''}
    <button class="wizard-restart" onclick="initWizard()">↺ Start Over</button>
  </div>`;
}

initWizard();

