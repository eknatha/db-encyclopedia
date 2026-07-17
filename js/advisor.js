// ===== AI ADVISOR =====
function setAdvisorPrompt(text) {
  document.getElementById('advisor-input').value = text;
}

// ===== OFFLINE AI ADVISOR ENGINE =====
// Full rule-based knowledge base — zero network requests

const advisorKB = {
  rules: [
    // E-COMMERCE
    { match: ['ecommerce','e-commerce','shop','store','cart','product catalog','retail','orders','inventory','checkout','woocommerce','magento','shopify'],
      primary:'PostgreSQL', primaryWhy:'E-commerce demands ACID transactions for order placement and inventory deduction. PostgreSQL handles complex product queries, JSON for flexible attributes, and full-text search (pg_trgm). Scales to tens of millions of products.',
      alt:'MySQL', altWhy:'Proven at massive scale (Shopify, Amazon early years). Strong ecosystem with Vitess for horizontal sharding when PostgreSQL replication isn\'t enough.',
      avoid:'MongoDB', avoidWhy:'Lack of multi-document ACID (without 4.0+ transactions) makes inventory deductions dangerous. Financial consistency requires relational guarantees.',
      tips:['Add Redis for session storage, cart caching, and rate limiting','Use Elasticsearch for product search with facets and autocomplete','Consider read replicas early — product listings are read-heavy','Use pgvector for AI-powered product recommendations','RDS Aurora or CloudNativePG on K8s for managed HA'] },

    // SOCIAL NETWORK / GRAPH
    { match: ['social','friend','follower','follow','graph','relationship','network','linkedin','connection','recommendation','knowledge graph','fraud detection'],
      primary:'Neo4j', primaryWhy:'Graph relationships ARE your data model. Neo4j\'s native graph engine traverses billions of relationships in milliseconds — queries that would require dozens of JOINs in SQL run in a single Cypher hop.',
      alt:'PostgreSQL with ltree/recursive CTEs', altWhy:'If graph queries are a minority use case and you already have Postgres, recursive CTEs handle tree-depth traversal. Simpler ops than running a separate graph DB.',
      avoid:'MongoDB', avoidWhy:'Document stores require manual relationship management. Deeply nested friend-of-friend queries become unmanageable at scale.',
      tips:['AuraDB (Neo4j cloud) for zero-ops graph','Use Kafka to stream graph mutations at high write rates','Combine with Redis for caching heavily-read graph paths (homepage feed)','Fraud detection: run real-time Cypher queries on transaction nodes','Neo4j Helm chart for K8s deployment'] },

    // IOT / SENSOR DATA
    { match: ['iot','sensor','telemetry','device','mqtt','time series','timeseries','metrics','monitoring','temperature','pressure','readings','influx','victoria'],
      primary:'TimescaleDB', primaryWhy:'PostgreSQL extension = full SQL on time-series data. Hypertables auto-partition by time, continuous aggregates pre-compute rollups, and data tiering moves old data to cheap storage. Familiar tooling, no new query language.',
      alt:'InfluxDB', altWhy:'Purpose-built for metrics with native line protocol ingest, retention policies, and Flux for complex temporal calculations. Better for very high cardinality.',
      avoid:'MySQL', avoidWhy:'Row-oriented storage is inefficient for time-series. Full table scans on billions of timestamp rows are painfully slow without specialized partitioning.',
      tips:['VictoriaMetrics as Prometheus long-term storage — 5-10x less disk than InfluxDB','Cassandra for extreme write throughput (millions of writes/sec) with time-based partition keys','Use Grafana on top of any of these for dashboards','TimescaleDB compression achieves 90-95% space savings on numerical time series','Deploy TimescaleDB with CloudNativePG operator on Kubernetes'] },

    // CACHING / SESSION
    { match: ['cache','caching','session','rate limit','rate limiting','queue','pub/sub','pubsub','leaderboard','real-time','realtime','fast read','low latency','millisecond'],
      primary:'Redis', primaryWhy:'The universal caching standard. Supports strings, hashes, lists, sets, sorted sets (leaderboards), pub/sub, streams, and Lua scripts. Single-threaded but extremely fast — sub-millisecond P99 latency.',
      alt:'Memcached', altWhy:'Pure key-value cache with multi-threaded architecture. Simpler than Redis, slightly faster for pure get/set workloads at extreme concurrency. No persistence.',
      avoid:'PostgreSQL as cache', avoidWhy:'Disk-based databases cannot replace in-memory caches. Network round-trips + disk I/O will add 10-100ms per operation vs <1ms with Redis.',
      tips:['Redis Cluster for >100GB datasets','Redis Sentinel for HA on smaller deployments','Use Redis as a sidecar cache in front of PostgreSQL/MySQL','Implement cache-aside pattern — never write cache before DB commit','DragonflyDB: Redis-compatible but multi-threaded, 25x more throughput on same hardware','On K8s: Redis Operator by Spotahome or Operator by Redis'] },

    // ANALYTICS / BI / DATA WAREHOUSE
    { match: ['analytics','reporting','bi','business intelligence','dashboard','warehouse','olap','clickhouse','big data','data lake','aggregation','sum','count','group by','historical','redshift','bigquery'],
      primary:'ClickHouse', primaryWhy:'Processes 100 billion rows per second per server using columnar storage and vectorized execution. Real-time analytics on live data — no ETL pipeline needed. SQL interface with familiar semantics.',
      alt:'BigQuery / Redshift / Synapse', altWhy:'Fully managed cloud DWH — zero infra to manage. Auto-scaling, serverless billing. Ideal if you don\'t want to operate ClickHouse.',
      avoid:'PostgreSQL for OLAP', avoidWhy:'Row-oriented storage scans every column for analytical queries. Acceptable for small datasets (<10M rows) but degrades badly at scale.',
      tips:['Use dbt for transformation on top of any DWH','Combine ClickHouse (analytics) + PostgreSQL (OLTP) — separate read/write paths','Altinity Operator for ClickHouse on Kubernetes','Apache Parquet + DuckDB for local analytical workloads without a server','Materialized views / continuous aggregates reduce query time by 99%'] },

    // MULTI-TENANT SAAS
    { match: ['saas','multi-tenant','multitenant','subscription','tenant','per-customer','isolation','organization','workspace'],
      primary:'PostgreSQL', primaryWhy:'Row-level security (RLS) enables tenant isolation at the DB level — one schema, one table, one RLS policy per tenant. Logical replication lets you shard tenants to separate clusters as you grow.',
      alt:'CockroachDB', altWhy:'Built-in geo-partitioning lets you pin tenant data to specific regions for compliance (GDPR, data residency) without application changes.',
      avoid:'Single MongoDB cluster', avoidWhy:'Without careful schema design, tenant data bleeds between queries. Lack of RLS means isolation must be 100% in application code — one bug leaks all tenant data.',
      tips:['Schema-per-tenant vs row-per-tenant — schema isolation is stronger but harder to manage at 1000+ tenants','Use pgBouncer for connection pooling — SaaS has bursty connection patterns','CloudNativePG operator handles tenant DB provisioning via Kubernetes CRDs','Add Redis for per-tenant rate limiting and caching','Implement tenant-aware query routing at the application layer'] },

    // MOBILE / REAL-TIME
    { match: ['mobile','app','firebase','offline','sync','real-time','realtime','flutter','react native','ios','android'],
      primary:'Firestore', primaryWhy:'Built-in real-time listeners mean the UI auto-updates when data changes — no polling. Offline persistence with conflict resolution baked in. Serverless = no DB servers to manage.',
      alt:'Supabase (PostgreSQL)', altWhy:'Open-source Firebase alternative. PostgreSQL under the hood with real-time via logical replication, auto-generated REST API, and built-in auth. Full SQL power without vendor lock-in.',
      avoid:'Self-hosted MongoDB', avoidWhy:'Ops burden is too high for mobile-first teams. No built-in real-time, offline sync, or mobile SDKs.',
      tips:['Combine Firestore (real-time/mobile) with BigQuery (analytics) — native Firestore → BigQuery export','Use Firestore security rules as your authorization layer','SQLite on-device + Firestore/Supabase for sync architecture','DynamoDB is another option for AWS-native mobile backends'] },

    // KUBERNETES / CLOUD NATIVE
    { match: ['kubernetes','k8s','cloud native','container','microservices','operator','statefulset','helm','gitops','devops','platform engineer','platform engineering'],
      primary:'PostgreSQL (CloudNativePG)', primaryWhy:'CloudNativePG is the CNCF-listed PostgreSQL operator. Manages primary/replica topology, WAL archiving to S3/GCS/Azure, connection pooling, automated failover, and rolling updates — all via Kubernetes CRDs.',
      alt:'CockroachDB (CockroachDB Operator)', altWhy:'Natively distributed — no primary/replica concept. Every node is equal. Ideal for multi-zone/multi-region K8s clusters where you can\'t afford primary failover time.',
      avoid:'Running databases in plain Deployments', avoidWhy:'Deployments don\'t guarantee stable network identity or ordered startup/shutdown. Always use StatefulSets or operators for stateful databases.',
      tips:['CloudNativePG: cnpg.io — 1 command to deploy HA PostgreSQL on K8s','Use PodDisruptionBudgets to prevent simultaneous DB pod eviction','StorageClass matters: use SSDs (gp3, Premium SSD) — not standard HDD','Velero + DB-specific backup hooks for consistent point-in-time recovery','Separate DB nodes with taints/tolerations to avoid noisy neighbor effects'] },

    // LOGS / SEARCH
    { match: ['log','logs','logging','search','full text','fulltext','elk','elasticsearch','opensearch','kibana','audit','text search','documents search'],
      primary:'Elasticsearch', primaryWhy:'Inverted index enables sub-second full-text search across billions of documents. Built for log analytics (ELK stack), application search, and APM. Rich aggregations for dashboards in Kibana.',
      alt:'OpenSearch', altWhy:'Apache 2.0 licensed Elasticsearch fork backed by AWS. Feature-parity with ES 7.10, includes ML plugin, k-NN vector search, and Security plugin. Best for AWS environments.',
      avoid:'PostgreSQL full-text search at scale', avoidWhy:'pg_trgm and tsvector work well up to ~10M documents. Beyond that, Elasticsearch\'s distributed inverted index is orders of magnitude faster.',
      tips:['ECK (Elastic Cloud on K8s) — official operator, manages ES + Kibana lifecycle','Index Lifecycle Management (ILM) for hot-warm-cold data tiering — massive cost savings','Use Logstash or Vector for log ingestion pipeline','OpenSearch for AWS-native environments — integrates with IAM, Kinesis','Combine Elasticsearch search + PostgreSQL OLTP — each does what it\'s best at'] },

    // FINANCIAL / BANKING
    { match: ['financial','finance','banking','bank','transaction','payment','ledger','accounting','money','currency','transfer','fraud','trading','stock'],
      primary:'PostgreSQL', primaryWhy:'ACID transactions are non-negotiable for financial data. PostgreSQL\'s serializable isolation prevents double-spend, phantom reads, and dirty reads. Mature, battle-tested at banks and fintech globally.',
      alt:'CockroachDB', altWhy:'Distributed ACID across regions for global financial apps. Serializable isolation by default, 5-nines availability. Used by Bose, Comcast, and major fintech companies.',
      avoid:'MongoDB (without careful design)', avoidWhy:'BASE semantics and eventual consistency are incompatible with financial ledgers. A network partition during a money transfer can result in inconsistent account balances.',
      tips:['Event sourcing + PostgreSQL: store all transactions as immutable events, derive account balances','Use FOR UPDATE SKIP LOCKED for job queues without separate message brokers','Partition tables by date for historical financial data — keep hot data fast','Consider YugabyteDB for geo-distributed compliance (GDPR, data residency)','Audit log: append-only table with PostgreSQL triggers'] },

    // AI / ML / VECTOR
    { match: ['ai','ml','machine learning','vector','embedding','semantic search','llm','chatbot','rag','recommendation','similarity','pgvector','neural'],
      primary:'PostgreSQL + pgvector', primaryWhy:'pgvector extension adds vector similarity search to PostgreSQL. Store embeddings alongside structured data in one database. IVFFlat and HNSW indexes enable sub-millisecond nearest-neighbor search on millions of vectors.',
      alt:'Weaviate / Pinecone / Qdrant', altWhy:'Purpose-built vector databases with HNSW indexing, hybrid search (vector + keyword), and native ML model integrations. Better for 100M+ vector workloads.',
      avoid:'MySQL for vectors', avoidWhy:'No native vector type or index. Workarounds (JSON arrays) require full table scans for similarity search — O(n) cost at every query.',
      tips:['pgvector HNSW index for <10M vectors — excellent latency with minimal ops overhead','Combine pgvector (vectors) + PostgreSQL (structured metadata) — one query, no joins across services','TimescaleDB + pgvector for time-aware vector search (recent documents more relevant)','Chunk documents to 512 tokens before embedding for best recall','Use cosine distance for normalized embeddings (OpenAI, Cohere), L2 for unnormalized'] },

    // GENERAL / DEFAULT
    { match: [],
      primary:'PostgreSQL', primaryWhy:'PostgreSQL is the right answer for ~80% of use cases. Full SQL, ACID, JSON, arrays, full-text search, extensibility (PostGIS, pgvector, TimescaleDB), and the largest open-source DB ecosystem. When in doubt, start here.',
      alt:'MongoDB', altWhy:'If your schema is genuinely unknown/evolving rapidly, or you are storing heterogeneous documents, MongoDB\'s flexible model reduces early-stage friction.',
      avoid:'Over-engineering', avoidWhy:'Don\'t choose a distributed database before you need it. PostgreSQL on a single server handles 10,000 TPS. Optimize the simple solution first.',
      tips:['Start with PostgreSQL + Redis — covers 90% of patterns','Add Elasticsearch only when you have real full-text search requirements','Evaluate NewSQL (CockroachDB, YugabyteDB) only when you hit PostgreSQL\'s limits','Prefer managed cloud services (RDS, Cloud SQL) over self-hosted for most teams','Measure before you migrate — benchmark your actual workload, not synthetic benchmarks'] }
  ]
};

function offlineAdvisor(input) {
  const q = input.toLowerCase();
  // score each rule by keyword matches
  let bestRule = null;
  let bestScore = -1;
  for (const rule of advisorKB.rules) {
    if (rule.match.length === 0) continue; // skip default
    const score = rule.match.reduce((acc, kw) => acc + (q.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; bestRule = rule; }
  }
  // fall back to default if no match
  const rule = (bestScore > 0 && bestRule) ? bestRule : advisorKB.rules[advisorKB.rules.length - 1];
  return `🏆 Primary Recommendation: ${rule.primary}
${rule.primaryWhy}

🥈 Alternative: ${rule.alt}
${rule.altWhy}

⚠️ Avoid: ${rule.avoid} — ${rule.avoidWhy}

💡 Key Considerations:
${rule.tips.map(t => '• ' + t).join('\n')}

──────────────────────────────
ℹ️  Offline mode — analysis based on built-in knowledge base.
    This covers: e-commerce, social/graph, IoT, caching, analytics,
    multi-tenant SaaS, mobile, Kubernetes, logs/search, financial, AI/ML.`;
}

function askAdvisor() {
  const input = document.getElementById('advisor-input').value.trim();
  if (!input) return;
  const output = document.getElementById('advisor-output');
  output.className = 'advisor-output thinking';
  output.textContent = '✦ Analyzing your use case...';

  // Simulate brief thinking delay for UX
  setTimeout(() => {
    const result = offlineAdvisor(input);
    output.className = 'advisor-output';
    output.textContent = result;
  }, 350);
}

document.getElementById('advisor-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') askAdvisor();
});

