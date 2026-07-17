// ============================================================
// DAILY CHALLENGE
// ============================================================
const dailyChallenges = [
  {id:1,title:'Write a query to find the top 5 customers by total order value',db:'PostgreSQL',difficulty:'Medium',category:'SQL',
   prompt:'You have two tables: <code>customers(id, name, email)</code> and <code>orders(id, customer_id, total, created_at, status)</code>.\n\nWrite a SQL query to find the top 5 customers by total completed order value, showing their name, email, order count, and total spent.',
   hint:'Use a JOIN between customers and orders, filter on status=\'completed\', GROUP BY customer fields, SUM the total, and ORDER BY the sum DESC with LIMIT 5.',
   solution:`SELECT c.name, c.email,
  COUNT(o.id) AS order_count,
  SUM(o.total) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.id, c.name, c.email
ORDER BY total_spent DESC
LIMIT 5;`,
   explanation:'The JOIN links customers to their orders. WHERE filters before grouping (efficient). GROUP BY collapses multiple orders per customer. SUM aggregates their spend. LIMIT 5 returns only top results. Add an index on orders(customer_id, status) for best performance.'},
  {id:2,title:'Design a Redis caching strategy for an API endpoint',db:'Redis',difficulty:'Medium',category:'Caching',
   prompt:'You have an API endpoint <code>GET /products/{id}</code> that queries PostgreSQL and takes ~200ms. It receives 10,000 requests/minute, with product data changing only a few times per day.\n\nDesign a Redis caching strategy. What key, TTL, and invalidation approach would you use?',
   hint:'Think about: cache key naming, appropriate TTL for data that changes a few times/day, cache-aside vs write-through, and how to invalidate when a product is updated.',
   solution:`# Cache key naming
KEY = "product:{product_id}"  # e.g. "product:42"

# Read path (cache-aside pattern)
data = redis.GET(KEY)
if not data:
    data = postgres.query("SELECT * FROM products WHERE id = %s", product_id)
    redis.SET(KEY, json.dumps(data), EX=3600)  # 1 hour TTL
return data

# Write/update path (cache invalidation)
def update_product(product_id, updates):
    postgres.update(product_id, updates)
    redis.DEL(f"product:{product_id}")  # invalidate immediately

# Alternative: short TTL approach (no explicit invalidation)
redis.SET(KEY, data, EX=300)  # 5 min TTL — stale for max 5 min`,
   explanation:'Cache-aside: check cache first, populate on miss. TTL 1-4 hours for data changing a few times/day. Explicit DEL on update ensures immediate consistency. Alternative: short TTL (5 min) for simpler code at cost of brief staleness. Key format product:{id} is clear and avoids collisions.'},
  {id:3,title:'Explain and fix a replication lag issue',db:'PostgreSQL',difficulty:'Hard',category:'Replication',
   prompt:'Your monitoring shows a PostgreSQL replica is 45 seconds behind the primary. The replica is handling read queries from your application.\n\nList the 5 most likely causes and for each, describe how you would diagnose and fix it.',
   hint:'Think about: network bandwidth, replica resources (CPU/IO), large transactions, hot standby conflicts, and wal_keep_size settings.',
   solution:`# 1. Check current lag
SELECT now() - pg_last_xact_replay_timestamp() AS lag;
SELECT client_addr, replay_lag FROM pg_stat_replication;

# 2. Causes & fixes:

# Slow replica disk I/O
iostat -x 1 10  # on replica — check util%
# Fix: upgrade storage to SSD, reduce replica query load

# Large transactions blocking WAL replay
SELECT pid, query, state FROM pg_stat_activity WHERE state = 'idle in transaction';
# Fix: break large transactions into smaller batches

# Hot standby conflicts (queries blocking WAL apply)
SELECT * FROM pg_stat_replication_conflicts;
# Fix: set max_standby_streaming_delay = 30s or hot_standby_feedback = on

# Network bandwidth saturation
iftop  # check primary-to-replica bandwidth
# Fix: use wal_compression = on on primary

# wal_keep_size too small causing replica to fall behind
SHOW wal_keep_size;
# Fix: increase wal_keep_size or use replication slots`,
   explanation:'Replica lag has many causes. Always check pg_stat_replication for lag bytes first. Hot standby conflicts are common — long-running replica queries block WAL apply. wal_compression reduces network usage significantly. If lag is chronic, consider a dedicated replica for reads separate from the failover standby.'},
  {id:4,title:'Design a MongoDB schema for a multi-tenant SaaS',db:'MongoDB',difficulty:'Hard',category:'Schema Design',
   prompt:'You\'re building a project management SaaS. Each tenant (company) has users, projects, and tasks. Projects have many tasks. Tasks have comments.\n\nDesign the MongoDB schema. What should be embedded vs referenced? Justify your choices.',
   hint:'Think about the most common read patterns: viewing a project with tasks, viewing task details with comments, listing projects for a user.',
   solution:`// Tenant — separate collection, referenced by tenant_id
{ _id: ObjectId, name: "Acme Corp", plan: "pro", created: Date }

// User — referenced (updated independently, shared across projects)
{ _id: ObjectId, tenant_id: ObjectId, name: String, email: String, role: String }

// Project — referenced from tasks
{ _id: ObjectId, tenant_id: ObjectId, name: String,
  owner_id: ObjectId, members: [ObjectId],  // user refs
  status: String, created: Date }

// Task — embed recent comments (< 10), reference old ones
{
  _id: ObjectId,
  tenant_id: ObjectId,
  project_id: ObjectId,       // reference — projects queried separately
  title: String, description: String,
  assignee_id: ObjectId,       // reference — user updated independently
  status: String, priority: String,
  due_date: Date,
  comments: [                  // EMBED latest comments — always read together
    { author_id: ObjectId, text: String, created: Date }
  ],  // cap at 20 embedded, paginate older ones separately
  comment_count: Number,
  tags: [String],
  created: Date, updated: Date
}

// Indexes
db.tasks.createIndex({ tenant_id: 1, project_id: 1, status: 1 })
db.tasks.createIndex({ tenant_id: 1, assignee_id: 1, due_date: 1 })`,
   explanation:'Embed comments in tasks (read together, limited count). Reference users and projects (updated independently, large documents). tenant_id on every document enables multi-tenant queries. Index on (tenant_id, project_id, status) covers the most common query: all tasks for a project by status.'},
  {id:5,title:'Set up a CloudNativePG cluster on Kubernetes',db:'Kubernetes',difficulty:'Hard',category:'K8s Operators',
   prompt:'You need to deploy a production-ready PostgreSQL cluster on Kubernetes using the CloudNativePG operator.\n\nWrite the Kubernetes manifest for a 3-instance cluster with: S3 backup, Prometheus monitoring, connection pooling, and 50Gi SSD storage.',
   hint:'CloudNativePG uses the Cluster CRD. Key fields: instances, storage, backup.barmanObjectStore, monitoring.enablePodMonitor.',
   solution:`apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgres-prod
  namespace: databases
spec:
  instances: 3
  primaryUpdateStrategy: unsupervised

  postgresql:
    parameters:
      shared_buffers: "512MB"
      max_connections: "200"
      wal_level: "logical"
      log_min_duration_statement: "1000"

  bootstrap:
    initdb:
      database: myapp
      owner: app_user
      secret:
        name: postgres-credentials

  storage:
    size: 50Gi
    storageClass: fast-ssd

  backup:
    barmanObjectStore:
      destinationPath: "s3://my-backups/postgres/"
      s3Credentials:
        accessKeyId:
          name: s3-creds
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: s3-creds
          key: SECRET_ACCESS_KEY
    retentionPolicy: "30d"

  monitoring:
    enablePodMonitor: true

  resources:
    requests:
      memory: "2Gi"
      cpu: "1"
    limits:
      memory: "4Gi"
      cpu: "2"`,
   explanation:'CloudNativePG manages the entire lifecycle. instances:3 creates 1 primary + 2 replicas. barmanObjectStore enables WAL archiving + base backups to S3. enablePodMonitor creates a Prometheus PodMonitor automatically. Always use SSD StorageClass for databases. Monitor with: kubectl cnpg status postgres-prod'},
  {id:6,title:'Optimize a slow time-series query in TimescaleDB',db:'TimescaleDB',difficulty:'Medium',category:'Performance',
   prompt:'You have a TimescaleDB hypertable with 2 billion IoT sensor readings. This query takes 45 seconds:\n\n<code>SELECT AVG(value) FROM sensor_data WHERE device_id=101 AND time > NOW()-INTERVAL \'30 days\'</code>\n\nHow would you optimize it?',
   hint:'Think about: hypertable chunk interval, indexes on device_id, continuous aggregates for pre-computed results.',
   solution:`-- 1. Check current chunk interval (default 7 days)
SELECT * FROM timescaledb_information.dimensions WHERE hypertable_name = 'sensor_data';

-- 2. Add index if missing
CREATE INDEX ON sensor_data (device_id, time DESC);

-- 3. Check how many chunks the query hits
EXPLAIN SELECT AVG(value) FROM sensor_data
  WHERE device_id=101 AND time > NOW()-INTERVAL '30 days';
-- Look for "Chunks excluded" in EXPLAIN output

-- 4. Create a continuous aggregate (pre-compute hourly averages)
CREATE MATERIALIZED VIEW hourly_device_avg
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', time) AS hour,
       device_id,
       AVG(value) AS avg_value,
       COUNT(*) AS samples
FROM sensor_data
GROUP BY hour, device_id WITH NO DATA;

SELECT add_continuous_aggregate_policy('hourly_device_avg',
  start_offset => INTERVAL '2 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');

-- 5. Query the aggregate instead (instant)
SELECT AVG(avg_value) FROM hourly_device_avg
WHERE device_id=101 AND hour > NOW()-INTERVAL '30 days';`,
   explanation:'The composite index (device_id, time DESC) enables chunk exclusion and index scans within chunks. The continuous aggregate pre-computes hourly averages — the optimized query now reads at most 720 pre-aggregated rows instead of millions of raw readings. 30-day query goes from 45s to <10ms.'},
  {id:7,title:'Write a Cassandra data model for a messaging app',db:'Cassandra',difficulty:'Hard',category:'NoSQL Design',
   prompt:'Design a Cassandra schema for a messaging app with these access patterns:\n1. Get all messages in a conversation, newest first\n2. Get unread message count per user\n3. Get all conversations for a user\n\nCassandra has no JOINs — one table per query pattern.',
   hint:'Each table is designed for exactly one query. Partition key determines distribution, clustering columns determine sort order within a partition.',
   solution:`-- Query 1: Get messages in a conversation, newest first
CREATE TABLE messages_by_conversation (
  conversation_id UUID,
  sent_at         TIMEUUID,    -- TIMEUUID = time-based UUID, automatically sorted
  sender_id       UUID,
  message_text    TEXT,
  message_type    TEXT,        -- text, image, file
  PRIMARY KEY (conversation_id, sent_at)
) WITH CLUSTERING ORDER BY (sent_at DESC)
  AND default_time_to_live = 7776000;  -- 90 days auto-expiry

-- Query 2: Unread count per user
CREATE TABLE unread_counts (
  user_id         UUID,
  conversation_id UUID,
  unread_count    COUNTER,
  PRIMARY KEY (user_id, conversation_id)
);
UPDATE unread_counts SET unread_count = unread_count + 1
  WHERE user_id=? AND conversation_id=?;

-- Query 3: All conversations for a user
CREATE TABLE conversations_by_user (
  user_id         UUID,
  last_message_at TIMEUUID,
  conversation_id UUID,
  other_user_id   UUID,
  last_message    TEXT,
  PRIMARY KEY (user_id, last_message_at)
) WITH CLUSTERING ORDER BY (last_message_at DESC);`,
   explanation:'Three tables, three queries. TIMEUUID for messages gives automatic time-ordering without secondary sort. COUNTER type for unread counts enables atomic increments. conversations_by_user is sorted by last_message_at so the most recent conversation appears first. Each table is denormalized — data is duplicated across tables by design.'},
  {id:8,title:'Implement a sliding window rate limiter with Redis',db:'Redis',difficulty:'Medium',category:'Patterns',
   prompt:'Implement a sliding window rate limiter that allows max 100 requests per user per minute using Redis.\n\nThe solution must be atomic (no race conditions) and accurate (not just fixed window).',
   hint:'Use a Sorted Set where the score is the timestamp. ZADD adds the request, ZREMRANGEBYSCORE removes old ones, ZCARD counts current requests. Wrap in a Lua script for atomicity.',
   solution:`-- Lua script for atomic sliding window rate limit
-- KEYS[1] = rate_limit:{user_id}
-- ARGV[1] = current timestamp (milliseconds)
-- ARGV[2] = window size (60000ms = 1 minute)
-- ARGV[3] = max requests (100)

local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local min_score = now - window

-- Remove requests outside the window
redis.call('ZREMRANGEBYSCORE', key, '-inf', min_score)

-- Count current requests in window
local count = redis.call('ZCARD', key)

if count < limit then
  -- Add current request with timestamp as score
  redis.call('ZADD', key, now, now .. '-' .. math.random())
  redis.call('PEXPIRE', key, window)
  return {1, limit - count - 1}  -- allowed, remaining
else
  return {0, 0}  -- rejected, 0 remaining
end

-- Call from application:
-- EVAL script 1 "rate_limit:user123" 1699000000000 60000 100`,
   explanation:'Sorted Set with timestamp as score enables precise sliding window. ZREMRANGEBYSCORE removes entries older than 1 minute. ZCARD counts remaining. Lua script is atomic — executed as a single Redis command, preventing race conditions. PEXPIRE auto-cleans keys for inactive users. More accurate than fixed window which resets counts abruptly.'},
];

function getTodayChallenge(){
  // Pick challenge based on day of year for consistent daily rotation
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  return dailyChallenges[dayOfYear % dailyChallenges.length];
}

function loadDailyState(){
  try {
    return JSON.parse(localStorage.getItem('eknathalabs_daily') || '{}');
  } catch(e){ return {}; }
}

function saveDailyState(state){
  try { localStorage.setItem('eknathalabs_daily', JSON.stringify(state)); } catch(e){}
}

function getStreak(state){
  if(!state.dates || !state.dates.length) return 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now()-86400000).toDateString();
  const sorted = [...state.dates].sort((a,b)=>new Date(b)-new Date(a));
  if(sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 0;
  let check = new Date(sorted[0]);
  for(let i=0;i<sorted.length;i++){
    if(sorted[i] === check.toDateString()){ streak++; check = new Date(check - 86400000); }
    else break;
  }
  return streak;
}

function renderDailyChallenge(){
  const challenge = getTodayChallenge();
  const state = loadDailyState();
  const today = new Date().toDateString();
  const done = state.completed && state.completed.includes(today + '-' + challenge.id);
  const diffColors = {Easy:'var(--accent3)',Medium:'var(--accent5)',Hard:'var(--accent4)'};

  document.getElementById('daily-card').innerHTML = `
    <div class="daily-badge">📅 Today's Challenge — ${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
    <div class="daily-title">${challenge.title}</div>
    <div class="daily-meta">
      <span class="daily-tag" style="color:${diffColors[challenge.difficulty]};border-color:${diffColors[challenge.difficulty]}">
        ${challenge.difficulty}
      </span>
      <span class="daily-tag">${challenge.db}</span>
      <span class="daily-tag">${challenge.category}</span>
    </div>
    <div class="daily-prompt">${challenge.prompt}</div>
    <textarea class="daily-textarea" id="daily-answer" placeholder="Write your answer here..."></textarea>
    <div class="daily-btn-row">
      <button class="daily-submit-btn" onclick="submitDailyChallenge()" ${done?'disabled':''}>
        ${done ? '✅ Submitted Today' : 'Submit Answer'}
      </button>
      <button class="daily-hint-btn" onclick="toggleDailyHint()">💡 Show Hint</button>
      <button class="daily-hint-btn" onclick="toggleDailySolution()">📖 Show Solution</button>
    </div>
    <div class="daily-solution" id="daily-hint">
      <strong style="color:var(--accent5)">Hint:</strong> ${challenge.hint}
    </div>
    <div class="daily-solution" id="daily-solution">
      <strong style="color:var(--accent3)">Solution:</strong>
      <div class="daily-solution-code">${challenge.solution}</div>
      <div style="margin-top:.75rem;font-size:.83rem;color:var(--text2);line-height:1.7">${challenge.explanation}</div>
    </div>`;

  // Streak
  document.getElementById('streak-num').textContent = getStreak(state);

  // History
  const dates = (state.dates||[]).slice(-7).reverse();
  document.getElementById('daily-history').innerHTML = dates.length ?
    dates.map(d => {
      const isToday = d===today;
      return `<div class="daily-hist-item">
        <span class="daily-hist-date">${isToday?'Today':new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
        <span class="daily-hist-status daily-hist-done">Done ✓</span>
      </div>`;
    }).join('') :
    '<div style="font-size:.78rem;color:var(--text3);padding:.5rem 0">No history yet — complete today\'s challenge!</div>';

  // Topics
  const topics = [...new Set(dailyChallenges.map(c=>c.category))];
  document.getElementById('daily-topics').innerHTML = topics.map(t =>
    `<span class="daily-topic-tag">${t}</span>`).join('');
}

function toggleDailyHint(){
  document.getElementById('daily-hint').classList.toggle('show');
}
function toggleDailySolution(){
  document.getElementById('daily-solution').classList.toggle('show');
}

function submitDailyChallenge(){
  const state = loadDailyState();
  const today = new Date().toDateString();
  const challenge = getTodayChallenge();

  if(!state.completed) state.completed = [];
  if(!state.dates) state.dates = [];

  const key = today + '-' + challenge.id;
  if(!state.completed.includes(key)){
    state.completed.push(key);
    if(!state.dates.includes(today)) state.dates.push(today);
    saveDailyState(state);
  }

  renderDailyChallenge();
  // Show solution
  document.getElementById('daily-solution').classList.add('show');
}

// Add new nav links
(function(){
  // Nav links are declared statically in index.html (grouped dropdowns).
  // Runtime injection removed: it duplicated entries and cluttered the bar.
})();

renderDailyChallenge();




