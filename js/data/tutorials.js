// ===== TUTORIAL HELPERS =====
function cb(lang,code){return`<div class="code-block"><div class="code-block-header"><span class="code-lang">${lang}</span><button class="code-copy" onclick="copyTutCode(this)">Copy</button></div><div class="code-body">${code}</div></div>`;}
function tip(h){return`<div class="tip-box"><strong>💡 Tip:</strong> ${h}</div>`;}
function warn(h){return`<div class="warn-box"><strong>⚠️ Warning:</strong> ${h}</div>`;}
function info(h){return`<div class="info-box"><strong>ℹ️ Note:</strong> ${h}</div>`;}
function h2(id,icon,title){return`<h2 class="tut-h2" id="${id}">${icon} ${title}</h2>`;}
function h3(t){return`<h3 class="tut-h3">${t}</h3>`;}
function p(t){return`<p class="tut-p">${t}</p>`;}
function ul(...items){return`<ul class="tut-ul">${items.map(i=>`<li>${i}</li>`).join('')}</ul>`;}
function ol(...items){return`<ol class="tut-ol">${items.map(i=>`<li>${i}</li>`).join('')}</ol>`;}
function toc(...items){return`<div class="tut-toc"><div class="tut-toc-title">📋 Table of Contents</div><ol class="tut-toc-list">${items.map(([id,label])=>`<li><a onclick="document.getElementById('${id}').scrollIntoView({behavior:'smooth'})">${label}</a></li>`).join('')}</ol></div>`;}
function table(headers,rows){return`<div style="overflow-x:auto"><table class="tut-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function header(icon,name,tagline,badges){return`<div class="tut-header"><div style="font-size:2.5rem">${icon}</div><div class="tut-db-title">${name}</div><p class="tut-p" style="margin-top:.4rem">${tagline}</p><div class="tut-db-meta">${badges.map(b=>`<span class="badge badge-type">${b}</span>`).join('')}</div></div>`;}

const tutorials = {};

tutorials.postgresql = {
name:'PostgreSQL', icon:'🐘', category:'relational',
content:()=>`
${header('🐘','PostgreSQL','The world\'s most advanced open source relational database — ACID, full SQL, extensible, battle-tested.',['Relational','ACID','Open Source','K8s Ready'])}
${toc(['pg-intro','1. Introduction'],['pg-install','2. Installation'],['pg-config','3. Configuration'],['pg-users','4. Users & Roles'],['pg-ops','5. Core SQL Operations'],['pg-index','6. Indexes'],['pg-replication','7. Replication'],['pg-backup','8. Backup & Restore'],['pg-perf','9. Performance Tuning'],['pg-k8s','10. Kubernetes (CloudNativePG)'],['pg-monitor','11. Monitoring'],['pg-trouble','12. Troubleshooting'])}
<div class="tut-section" id="pg-intro">
${h2('pg-intro','📖','Introduction')}
${p('PostgreSQL is a powerful, open source object-relational database. It extends SQL with many features for safely storing complex data workloads and has been ACID-compliant since 2001. It is the default database choice for most product companies — SaaS, fintech, healthcare, and AI applications.')}
${h3('Why PostgreSQL')}
${ul('Full ACID with MVCC — no read locks, high concurrency','Native JSONB — document storage without a separate NoSQL DB','Extensibility — pgvector (AI), PostGIS (geo), TimescaleDB (time-series)','Row-Level Security — multi-tenant isolation in the database','Logical replication, table partitioning, parallel queries','World-class ecosystem — ORMs, cloud managed services, K8s operators')}
${h3('Architecture')}
${table(['Component','Purpose'],
[['postmaster','Master daemon — forks a backend process per connection'],
['shared_buffers','Shared memory page cache — target 25% of RAM'],
['WAL','Write-Ahead Log — durability + streaming replication'],
['pg_hba.conf','Host-Based Authentication — controls who can connect'],
['autovacuum','Background dead-tuple cleanup — critical for performance'],
['pg_stat_*','System views for monitoring queries, connections, I/O']])}
</div>
<div class="tut-section" id="pg-install">
${h2('pg-install','⚙️','Installation')}
${h3('Ubuntu / Debian')}
${cb('bash',`# Add official PostgreSQL apt repo
sudo apt install -y curl ca-certificates
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \\
  --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc
sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \\
  https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > \\
  /etc/apt/sources.list.d/pgdg.list'
sudo apt update && sudo apt install -y postgresql-16
sudo systemctl enable --now postgresql
sudo systemctl status postgresql`)}
${h3('Docker (Development)')}
${cb('bash',`docker run -d \\
  --name postgres \\
  -e POSTGRES_PASSWORD=mysecretpassword \\
  -e POSTGRES_USER=myuser \\
  -e POSTGRES_DB=mydb \\
  -p 5432:5432 \\
  -v pgdata:/var/lib/postgresql/data \\
  postgres:16-alpine

# Connect
docker exec -it postgres psql -U myuser -d mydb`)}
${tip('Always pin a version tag — <code>postgres:16.3-alpine</code> not <code>latest</code> — to prevent surprise upgrades in production.')}
</div>
<div class="tut-section" id="pg-config">
${h2('pg-config','🔧','Configuration')}
${cb('ini',`# /etc/postgresql/16/main/postgresql.conf

# Memory — shared_buffers = 25% of RAM
shared_buffers = 4GB
effective_cache_size = 12GB        # 75% of RAM (query planner hint)
work_mem = 64MB                    # per sort/hash op — beware with many connections
maintenance_work_mem = 1GB         # VACUUM, CREATE INDEX

# WAL
wal_level = replica                # needed for replication
max_wal_size = 4GB
checkpoint_completion_target = 0.9
wal_compression = on

# Connections
max_connections = 200              # use PgBouncer, not raising this alone
superuser_reserved_connections = 3

# Logging
log_min_duration_statement = 1000  # log queries slower than 1 second
log_checkpoints = on
log_lock_waits = on

# SSD tuning
random_page_cost = 1.1             # default 4.0 is for HDD
effective_io_concurrency = 200`)}
${cb('conf',`# /etc/postgresql/16/main/pg_hba.conf
# TYPE  DATABASE  USER  ADDRESS          METHOD
local   all       postgres               peer
host    all       all   127.0.0.1/32     scram-sha-256
hostssl all       all   0.0.0.0/0        scram-sha-256
host    replication replicator 10.0.0.0/8 scram-sha-256`)}
${warn('Never use <code>trust</code> authentication in production. Always use <code>scram-sha-256</code> (PostgreSQL 14+).')}
</div>
<div class="tut-section" id="pg-users">
${h2('pg-users','👤','Users & Roles')}
${cb('sql',`-- Application user
CREATE USER app_user WITH PASSWORD 'Str0ng@Pass!' CONNECTION LIMIT 50;
CREATE DATABASE myapp OWNER app_user;
GRANT CONNECT ON DATABASE myapp TO app_user;

-- Schema permissions
\\c myapp
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO app_user;

-- Read-only user for analytics/reporting
CREATE ROLE readonly;
GRANT CONNECT ON DATABASE myapp TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
CREATE USER analyst WITH PASSWORD 'read0nly!' IN ROLE readonly;

-- Row Level Security — multi-tenant isolation
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id')::int);`)}
</div>
<div class="tut-section" id="pg-ops">
${h2('pg-ops','🗃️','Core SQL Operations')}
${h3('psql Quick Reference')}
${cb('sql',`\\l            -- list databases
\\c dbname     -- connect to database
\\dt           -- list tables
\\d tablename  -- describe table (columns, indexes, constraints)
\\di           -- list indexes
\\du           -- list users/roles
\timing       -- toggle query execution time
\\x            -- toggle expanded (vertical) output
\\e            -- open query in $EDITOR

-- Create table with best practices
CREATE TABLE users (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  tenant_id   INT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','banned')),
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- JSONB queries
SELECT metadata->>'city' AS city FROM users
WHERE metadata @> '{"active": true}';
SELECT * FROM users WHERE metadata ? 'phone';   -- has key

-- Window functions
SELECT name, salary, dept,
  RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dept_rank,
  SUM(salary) OVER (PARTITION BY dept) AS dept_total
FROM employees;

-- CTE
WITH monthly AS (
  SELECT date_trunc('month', created_at) AS month, SUM(amount) AS total
  FROM orders GROUP BY 1
)
SELECT month, total, SUM(total) OVER (ORDER BY month) AS running_total
FROM monthly;

-- UPSERT
INSERT INTO users (email, name) VALUES ('a@b.com','Alice')
ON CONFLICT (email) DO UPDATE
  SET name = EXCLUDED.name, updated_at = NOW();`)}
</div>
<div class="tut-section" id="pg-index">
${h2('pg-index','📇','Indexes')}
${cb('sql',`-- B-tree (default) — equality and range queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_date ON orders(created_at DESC);

-- Partial index — index only subset of rows
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Composite — column order matters (most selective first)
CREATE INDEX idx_tenant_created ON orders(tenant_id, created_at DESC);

-- GIN — JSONB and full-text search
CREATE INDEX idx_metadata ON users USING GIN(metadata);
CREATE INDEX idx_content_fts ON articles
  USING GIN(to_tsvector('english', title || ' ' || content));

-- Full-text search query
SELECT * FROM articles
WHERE to_tsvector('english', title || ' ' || content)
      @@ plainto_tsquery('english', 'kubernetes devops');

-- EXPLAIN ANALYZE — understand query plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE tenant_id=1 AND created_at > NOW()-INTERVAL '7 days';

-- Find unused indexes (safe to drop candidates)
SELECT indexrelid::regclass AS index, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND NOT indisprimary AND NOT indisunique;`)}
${tip('Always use <code>CREATE INDEX CONCURRENTLY</code> on production tables to avoid locking. Never run plain <code>CREATE INDEX</code> on a live table.')}
</div>
<div class="tut-section" id="pg-replication">
${h2('pg-replication','📡','Replication')}
${h3('Streaming Replication Setup')}
${cb('bash',`# PRIMARY — create replication user
sudo -u postgres psql -c "CREATE ROLE replicator REPLICATION LOGIN PASSWORD 'replpass';"

# postgresql.conf additions
echo "wal_level=replica
max_wal_senders=5
wal_keep_size=1GB
hot_standby=on" | sudo tee -a /etc/postgresql/16/main/postgresql.conf

# pg_hba.conf addition
echo "host replication replicator 10.0.0.0/8 scram-sha-256" >> /etc/postgresql/16/main/pg_hba.conf
sudo systemctl reload postgresql

# REPLICA — take base backup
sudo -u postgres pg_basebackup -h primary-ip -U replicator \\
  -D /var/lib/postgresql/16/main \\
  --wal-method=stream --checkpoint=fast --progress -R
sudo systemctl start postgresql`)}
${cb('sql',`-- On primary: check connected standbys
SELECT client_addr, state, sent_lsn, replay_lsn,
       (sent_lsn - replay_lsn) AS lag_bytes
FROM pg_stat_replication;

-- On replica: check replication lag
SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;
SELECT pg_is_in_recovery();  -- should be TRUE on replica`)}
</div>
<div class="tut-section" id="pg-backup">
${h2('pg-backup','💾','Backup & Restore')}
${cb('bash',`# pg_dump — logical backup (single database)
pg_dump -h localhost -U postgres -Fc -Z9 mydb > mydb_$(date +%Y%m%d).dump
pg_dump -h localhost -U postgres -Fd -j4 mydb -f /backup/mydb_dir/  # parallel

# pg_dumpall — all databases + globals
pg_dumpall -h localhost -U postgres > all.sql

# Restore
pg_restore -h localhost -U postgres -d mydb -j4 mydb_20250101.dump
psql -U postgres mydb < mydb.sql

# pgBackRest — production PITR backup
sudo apt install pgbackrest
cat > /etc/pgbackrest/pgbackrest.conf << 'EOF'
[global]
repo1-path=/var/lib/pgbackrest
repo1-retention-full=2
log-level-console=info
[mydb]
pg1-path=/var/lib/postgresql/16/main
EOF
pgbackrest --stanza=mydb stanza-create
pgbackrest --stanza=mydb backup --type=full
pgbackrest --stanza=mydb backup --type=incr

# PITR restore to specific timestamp
pgbackrest --stanza=mydb restore \\
  --target="2025-05-01 14:00:00" \\
  --target-action=promote`)}
</div>
<div class="tut-section" id="pg-perf">
${h2('pg-perf','⚡','Performance Tuning')}
${cb('sql',`-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries
SELECT query,
       calls,
       mean_exec_time::numeric(10,2) AS avg_ms,
       total_exec_time::numeric(10,2) AS total_ms,
       rows / calls AS avg_rows
FROM pg_stat_statements
WHERE calls > 10
ORDER BY mean_exec_time DESC LIMIT 10;

-- Table bloat — tables needing VACUUM
SELECT relname, n_dead_tup, n_live_tup,
  round(n_dead_tup::numeric/nullif(n_live_tup+n_dead_tup,0)*100,2) AS dead_pct,
  last_autovacuum
FROM pg_stat_user_tables WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Cache hit ratio — target > 99%
SELECT round(sum(heap_blks_hit)*100.0/
  nullif(sum(heap_blks_hit+heap_blks_read),0),2) AS cache_hit_pct
FROM pg_statio_user_tables;

-- Active locks and waiters
SELECT pid, query, wait_event_type, wait_event, state
FROM pg_stat_activity WHERE wait_event IS NOT NULL;

-- Connection count per user
SELECT usename, count(*) FROM pg_stat_activity
GROUP BY usename ORDER BY count DESC;`)}
${tip('Run <code>VACUUM ANALYZE tablename;</code> after bulk loads. Set <code>autovacuum_vacuum_scale_factor=0.01</code> on large tables so autovacuum triggers more frequently.')}
</div>
<div class="tut-section" id="pg-k8s">
${h2('pg-k8s','☸️','Kubernetes — CloudNativePG')}
${cb('yaml',`# Install CloudNativePG operator
# kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/main/releases/cnpg-1.22.0.yaml

---
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgres-cluster
  namespace: databases
spec:
  instances: 3            # 1 primary + 2 replicas

  postgresql:
    parameters:
      shared_buffers: "256MB"
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
      destinationPath: s3://my-bucket/postgres/
      s3Credentials:
        accessKeyId:
          name: s3-secret
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: s3-secret
          key: SECRET_ACCESS_KEY
    retentionPolicy: "30d"

  monitoring:
    enablePodMonitor: true   # Prometheus scraping

  resources:
    requests:
      memory: "2Gi"
      cpu: "1"
    limits:
      memory: "4Gi"
      cpu: "2"

---
# Check status
# kubectl get cluster postgres-cluster -n databases
# kubectl cnpg status postgres-cluster`)}
${tip('Install the cnpg kubectl plugin: <code>kubectl cnpg status postgres-cluster</code> shows replication lag, backup status, and switchover history in one command.')}
</div>
<div class="tut-section" id="pg-monitor">
${h2('pg-monitor','📊','Monitoring')}
${cb('bash',`# postgres_exporter for Prometheus
DATA_SOURCE_NAME="postgresql://postgres:pass@localhost:5432/postgres?sslmode=disable" \\
  postgres_exporter --web.listen-address=:9187

# Grafana dashboard: ID 9628 (PostgreSQL Database)

# Key alerts to configure:
# pg_up == 0                                     → PostgreSQL down
# pg_stat_replication_pg_wal_lsn_diff > 52428800 → Replica lag > 50MB
# pg_locks_count > 50                            → Lock contention
# pg_stat_bgwriter_checkpoint_sync_time > 5000   → Checkpoint too slow
# (1 - pg_stat_bgwriter_buffers_clean/pg_stat_bgwriter_buffers_alloc) → Cache miss rate`)}
</div>
<div class="tut-section" id="pg-trouble">
${h2('pg-trouble','🔬','Troubleshooting')}
${table(['Problem','Diagnosis','Fix'],
[['Connection refused','<code>systemctl status postgresql</code>','Check logs /var/log/postgresql/, check pg_hba.conf, check bind address'],
['Too many connections','<code>SELECT count(*) FROM pg_stat_activity</code>','Deploy PgBouncer pooler; do NOT just raise max_connections blindly'],
['Slow queries','<code>SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC</code>','Add missing indexes, run ANALYZE, increase work_mem for sort-heavy queries'],
['Replication lag','<code>SELECT * FROM pg_stat_replication</code>','Increase wal_keep_size; check network between primary and replica'],
['Table bloat / disk full','<code>SELECT n_dead_tup FROM pg_stat_user_tables</code>','VACUUM ANALYZE; tune autovacuum_vacuum_scale_factor'],
['Deadlocks','<code>grep deadlock /var/log/postgresql/*.log</code>','Enforce consistent lock ordering in application transactions']])}
</div>`
};

tutorials.mysql = {
name:'MySQL', icon:'🐬', category:'relational',
content:()=>`
${header('🐬','MySQL','World\'s most popular open source RDBMS. Powers WordPress, Shopify, GitHub, and millions of web apps.',['Relational','ACID','Open Source','K8s Ready'])}
${toc(['my-install','1. Installation'],['my-config','2. Configuration'],['my-users','3. Users'],['my-ops','4. Core Operations'],['my-replication','5. Replication'],['my-backup','6. Backup'],['my-perf','7. Performance'],['my-k8s','8. Kubernetes'])}
<div class="tut-section" id="my-install">
${h2('my-install','⚙️','Installation')}
${cb('bash',`# Ubuntu
sudo apt update && sudo apt install -y mysql-server
sudo mysql_secure_installation   # interactive security hardening
sudo systemctl status mysql

# Docker
docker run -d --name mysql \\
  -e MYSQL_ROOT_PASSWORD=rootpass \\
  -e MYSQL_DATABASE=mydb \\
  -e MYSQL_USER=myuser \\
  -e MYSQL_PASSWORD=mypass \\
  -p 3306:3306 \\
  -v mysql-data:/var/lib/mysql \\
  mysql:8.0

# Connect
mysql -u myuser -p mydb
mysql -h 127.0.0.1 -u root -p`)}
</div>
<div class="tut-section" id="my-config">
${h2('my-config','🔧','Configuration')}
${cb('ini',`# /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
# Memory — innodb_buffer_pool_size = 70-80% of RAM
innodb_buffer_pool_size = 4G
innodb_buffer_pool_instances = 4
innodb_log_file_size = 1G
innodb_flush_log_at_trx_commit = 1   # 1=safe ACID, 2=faster but risk 1s loss
innodb_flush_method = O_DIRECT

# Connections
max_connections = 300
wait_timeout = 600

# Slow query log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1

# Binary log (replication + PITR)
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
expire_logs_days = 7

# Character set — always use utf8mb4
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci`)}
</div>
<div class="tut-section" id="my-users">
${h2('my-users','👤','Users & Permissions')}
${cb('sql',`CREATE USER 'appuser'@'%' IDENTIFIED BY 'StrongPass123!';
GRANT SELECT,INSERT,UPDATE,DELETE ON mydb.* TO 'appuser'@'%';
GRANT CREATE,DROP,INDEX,ALTER ON mydb.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

-- Read-only replica user
CREATE USER 'readonly'@'%' IDENTIFIED BY 'ReadOnly123!';
GRANT SELECT ON mydb.* TO 'readonly'@'%';

-- Replication user
CREATE USER 'replicator'@'%' IDENTIFIED BY 'ReplPass!';
GRANT REPLICATION SLAVE ON *.* TO 'replicator'@'%';
FLUSH PRIVILEGES;

SHOW GRANTS FOR 'appuser'@'%';`)}
</div>
<div class="tut-section" id="my-ops">
${h2('my-ops','🗃️','Core Operations')}
${cb('sql',`SHOW DATABASES;
CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mydb; SHOW TABLES; DESCRIBE users;

-- Create table
CREATE TABLE users (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  name       VARCHAR(255) NOT NULL,
  status     ENUM('active','inactive') DEFAULT 'active',
  data       JSON,
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_status(status),
  INDEX idx_created(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- UPSERT
INSERT INTO users (email,name) VALUES ('a@b.com','Alice')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- JSON (MySQL 8)
SELECT JSON_EXTRACT(data,'$.city') AS city FROM users;
SELECT * FROM users WHERE JSON_CONTAINS(data,'"Chennai"','$.city');

-- Admin
SHOW FULL PROCESSLIST;
SHOW ENGINE INNODB STATUS\\G
SHOW STATUS LIKE 'Threads_connected';`)}
</div>
<div class="tut-section" id="my-replication">
${h2('my-replication','📡','Replication')}
${cb('bash',`# Primary my.cnf
server-id = 1
log_bin = mysql-bin
binlog_format = ROW

# Replica my.cnf
server-id = 2
relay-log = relay-bin
read_only = 1`)}
${cb('sql',`-- PRIMARY: get binary log coordinates
FLUSH TABLES WITH READ LOCK;
SHOW MASTER STATUS;   -- note File and Position
UNLOCK TABLES;

-- REPLICA: configure
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='primary-ip',
  SOURCE_USER='replicator',
  SOURCE_PASSWORD='ReplPass!',
  SOURCE_AUTO_POSITION=1;   -- GTID mode (MySQL 8 recommended)
START REPLICA;
SHOW REPLICA STATUS\\G`)}
</div>
<div class="tut-section" id="my-backup">
${h2('my-backup','💾','Backup & Restore')}
${cb('bash',`# Logical backup — mysqldump
mysqldump -u root -p --single-transaction --routines --triggers \\
  mydb > mydb_$(date +%Y%m%d).sql

# All databases
mysqldump -u root -p --all-databases --single-transaction > all.sql

# Restore
mysql -u root -p mydb < mydb_20250101.sql

# Physical hot backup — Percona XtraBackup (no locking)
sudo apt install percona-xtrabackup-80
xtrabackup --backup --user=root --password=pass --target-dir=/backup/full/
xtrabackup --prepare --target-dir=/backup/full/
xtrabackup --copy-back --target-dir=/backup/full/`)}
</div>
<div class="tut-section" id="my-perf">
${h2('my-perf','⚡','Performance Tuning')}
${cb('sql',`-- Top slow queries via Performance Schema
SELECT digest_text, count_star AS calls,
       round(avg_timer_wait/1e9,2) AS avg_ms,
       sum_rows_examined/count_star AS avg_rows_scanned
FROM performance_schema.events_statements_summary_by_digest
ORDER BY avg_timer_wait DESC LIMIT 10;

-- InnoDB buffer pool hit rate (target > 99%)
SHOW STATUS LIKE 'Innodb_buffer_pool_reads';
SHOW STATUS LIKE 'Innodb_buffer_pool_read_requests';

-- EXPLAIN a slow query
EXPLAIN FORMAT=JSON
SELECT * FROM orders WHERE user_id=1 AND status='paid'\\G

-- Index usage
SHOW INDEX FROM orders;`)}
</div>
<div class="tut-section" id="my-k8s">
${h2('my-k8s','☸️','Kubernetes — Percona Operator')}
${cb('yaml',`# helm repo add percona https://percona.github.io/percona-helm-charts/
# helm install percona-operator percona/ps-operator -n databases

apiVersion: ps.percona.com/v1alpha1
kind: PerconaServerMySQL
metadata:
  name: mysql-cluster
  namespace: databases
spec:
  crVersion: 0.7.0
  secretsName: mysql-secrets
  mysql:
    clusterType: group-replication
    size: 3
    image: percona/percona-server:8.0
    resources:
      requests:
        memory: 2Gi
        cpu: "1"
    volumeSpec:
      persistentVolumeClaim:
        resources:
          requests:
            storage: 30Gi
  proxy:
    router:
      enabled: true
      size: 2`)}
</div>`
};

tutorials.mongodb = {
name:'MongoDB', icon:'🍃', category:'document',
content:()=>`
${header('🍃','MongoDB','The leading document database — flexible JSON schema, native horizontal scaling, rich aggregation.',['Document','NoSQL','Open Source','K8s Ready'])}
${toc(['mg-concepts','1. Core Concepts'],['mg-install','2. Installation'],['mg-crud','3. CRUD'],['mg-aggregation','4. Aggregation Pipeline'],['mg-index','5. Indexes'],['mg-replication','6. Replica Sets'],['mg-sharding','7. Sharding'],['mg-backup','8. Backup'],['mg-k8s','9. Kubernetes'])}
<div class="tut-section" id="mg-concepts">
${h2('mg-concepts','🧠','Core Concepts')}
${table(['MongoDB','SQL Equivalent','Notes'],
[['Database','Database','Container for collections'],
['Collection','Table','No fixed schema — each document can differ'],
['Document','Row','JSON/BSON — max 16MB'],
['Field','Column','Key-value pair inside document'],
['_id','Primary Key','Auto ObjectId if not set'],
['Embedded doc','Denormalized join','Read together → embed'],
['$lookup','JOIN','Aggregation stage'],
['Replica Set','Primary + standbys','HA with auto-failover'],
['Shard','Horizontal partition','Scale-out across nodes']])}
${warn('MongoDB is NOT ideal for complex multi-document transactions (use PostgreSQL), deeply relational data, or financial ledgers requiring strict consistency.')}
</div>
<div class="tut-section" id="mg-install">
${h2('mg-install','⚙️','Installation')}
${cb('bash',`# Ubuntu 22.04
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \\
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \\
  https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \\
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable --now mongod

# Docker
docker run -d --name mongodb \\
  -e MONGO_INITDB_ROOT_USERNAME=admin \\
  -e MONGO_INITDB_ROOT_PASSWORD=adminpass \\
  -p 27017:27017 -v mongodata:/data/db mongo:7.0

# Connect
mongosh "mongodb://admin:adminpass@localhost:27017"`)}
</div>
<div class="tut-section" id="mg-crud">
${h2('mg-crud','🗃️','CRUD Operations')}
${cb('javascript',`use myapp

// INSERT
db.users.insertOne({name:"Eknatha",email:"e@lab.com",role:"admin",tags:["devops","k8s"],joined:new Date()})
db.users.insertMany([{name:"Alice"},{name:"Bob"}])

// FIND
db.users.find({role:"admin"})
db.users.find({role:"admin"},{name:1,email:1,_id:0})       // projection
db.users.find({joined:{$gt:new Date("2025-01-01")}})        // date range
db.users.find({tags:{$in:["devops","k8s"]}})                // array match
db.users.find({$or:[{role:"admin"},{role:"editor"}]})       // OR
db.users.find().sort({joined:-1}).limit(10).skip(0)         // paginate

// UPDATE
db.users.updateOne({email:"e@lab.com"},{$set:{role:"superadmin"}})
db.users.updateMany({role:"user"},{$inc:{loginCount:1}})
db.users.updateOne({email:"e@lab.com"},{$push:{tags:"cloud"}})

// UPSERT
db.users.updateOne(
  {email:"new@lab.com"},
  {$setOnInsert:{createdAt:new Date()},$set:{name:"New"}},
  {upsert:true}
)

// DELETE
db.users.deleteOne({_id:ObjectId("...")})
db.users.deleteMany({active:false,joined:{$lt:new Date("2020-01-01")}})`)}
</div>
<div class="tut-section" id="mg-aggregation">
${h2('mg-aggregation','🔗','Aggregation Pipeline')}
${cb('javascript',`// Revenue by category, last 30 days
db.orders.aggregate([
  {$match:{
    createdAt:{$gte:new Date(Date.now()-30*86400000)},
    status:"completed"
  }},
  {$lookup:{from:"products",localField:"productId",foreignField:"_id",as:"product"}},
  {$unwind:"$product"},
  {$group:{
    _id:"$product.category",
    revenue:{$sum:{$multiply:["$quantity","$price"]}},
    orders:{$sum:1},
    avgOrder:{$avg:"$price"}
  }},
  {$sort:{revenue:-1}},
  {$limit:10},
  {$project:{category:"$_id",revenue:1,orders:1,avgOrder:{$round:["$avgOrder",2]},_id:0}}
])

// Faceted search (categories + price ranges in one query)
db.products.aggregate([
  {$match:{status:"active"}},
  {$facet:{
    byCategory:[{$group:{_id:"$category",count:{$sum:1}}}],
    byPriceRange:[{$bucket:{groupBy:"$price",
      boundaries:[0,100,500,1000,5000],default:"5000+",
      output:{count:{$sum:1}}}}]
  }}
])`)}
</div>
<div class="tut-section" id="mg-index">
${h2('mg-index','📇','Indexes')}
${cb('javascript',`// Unique index
db.users.createIndex({email:1},{unique:true})

// Compound index (order matters — ESR rule: Equality, Sort, Range)
db.orders.createIndex({userId:1,status:1,createdAt:-1})

// Partial index — only active users
db.users.createIndex({email:1},{partialFilterExpression:{active:true}})

// TTL index — auto-delete sessions after 24h
db.sessions.createIndex({createdAt:1},{expireAfterSeconds:86400})

// Text search index
db.articles.createIndex({title:"text",content:"text"},{weights:{title:10,content:1}})
db.articles.find({$text:{$search:"kubernetes devops"}},{score:{$meta:"textScore"}})
  .sort({score:{$meta:"textScore"}})

// Check query plan
db.orders.find({userId:"u1",status:"paid"}).explain("executionStats")

// List & drop indexes
db.orders.getIndexes()
db.orders.dropIndex("index_name")`)}
</div>
<div class="tut-section" id="mg-replication">
${h2('mg-replication','📡','Replica Sets')}
${cb('javascript',`// Initialize 3-node replica set
rs.initiate({
  _id:"rs0",
  members:[
    {_id:0,host:"mongo1:27017",priority:2},
    {_id:1,host:"mongo2:27017",priority:1},
    {_id:2,host:"mongo3:27017",priority:0}
  ]
})

rs.status()
rs.isMaster()
rs.printReplicationInfo()

// Connection string
// mongodb://user:pass@mongo1,mongo2,mongo3/mydb?replicaSet=rs0&authSource=admin`)}
</div>
<div class="tut-section" id="mg-sharding">
${h2('mg-sharding','🌐','Sharding')}
${cb('javascript',`sh.enableSharding("myapp")

// Hashed sharding — even distribution
sh.shardCollection("myapp.orders",{_id:"hashed"})

// Range sharding — targeted queries per tenant
db.tenantData.createIndex({tenantId:1,_id:1})
sh.shardCollection("myapp.tenantData",{tenantId:1,_id:1})

sh.status()
db.orders.getShardDistribution()`)}
${tip('Hashed sharding gives even distribution and is safe for most use cases. Range sharding enables targeted queries but risks hotspots if your shard key is monotonically increasing (like timestamps).')}
</div>
<div class="tut-section" id="mg-backup">
${h2('mg-backup','💾','Backup & Restore')}
${cb('bash',`# mongodump — logical backup
mongodump --uri="mongodb://user:pass@host:27017" --gzip --out=/backup/$(date +%Y%m%d)

# Single collection
mongodump --uri="mongodb://..." --db=mydb --collection=orders --out=/backup/

# Restore
mongorestore --uri="mongodb://user:pass@host:27017" --gzip /backup/20250101/
mongorestore --uri="..." --nsInclude="mydb.orders" /backup/20250101/`)}
</div>
<div class="tut-section" id="mg-k8s">
${h2('mg-k8s','☸️','Kubernetes — MongoDB Community Operator')}
${cb('bash',`helm repo add mongodb https://mongodb.github.io/helm-charts
helm install community-operator mongodb/community-operator -n mongodb --create-namespace`)}
${cb('yaml',`apiVersion: mongodbcommunity.mongodb.com/v1
kind: MongoDBCommunity
metadata:
  name: mongodb-rs
  namespace: mongodb
spec:
  members: 3
  type: ReplicaSet
  version: "7.0.4"
  security:
    authentication:
      modes: ["SCRAM"]
  users:
    - name: appuser
      db: myapp
      passwordSecretRef:
        name: mongo-secret
      roles:
        - name: readWrite
          db: myapp
  statefulSet:
    spec:
      volumeClaimTemplates:
        - metadata:
            name: data-volume
          spec:
            accessModes: ["ReadWriteOnce"]
            resources:
              requests:
                storage: 20Gi
            storageClassName: fast-ssd`)}
</div>`
};

tutorials.redis = {
name:'Redis', icon:'📦', category:'keyvalue',
content:()=>`
${header('📦','Redis','In-memory data structure store — cache, sessions, queues, pub/sub, leaderboards. Sub-millisecond latency.',['Key-Value','In-Memory','Open Source','K8s Ready'])}
${toc(['rd-install','1. Installation'],['rd-config','2. Configuration'],['rd-datatypes','3. Data Types'],['rd-patterns','4. Patterns'],['rd-persistence','5. Persistence'],['rd-cluster','6. Cluster & Sentinel'],['rd-k8s','7. Kubernetes'],['rd-monitor','8. Monitoring'],['rd-trouble','9. Troubleshooting'])}
<div class="tut-section" id="rd-install">
${h2('rd-install','⚙️','Installation')}
${cb('bash',`# Ubuntu
sudo apt install -y redis-server
sudo systemctl enable --now redis-server
redis-cli ping   # PONG

# Docker with password
docker run -d --name redis -p 6379:6379 \\
  -v redis-data:/data \\
  redis:7-alpine redis-server --requirepass mypassword --appendonly yes

# Connect
redis-cli -h localhost -p 6379 -a mypassword
redis-cli --tls -h redis.example.com -p 6380`)}
</div>
<div class="tut-section" id="rd-config">
${h2('rd-config','🔧','Configuration')}
${cb('conf',`# /etc/redis/redis.conf
bind 0.0.0.0
port 6379
requirepass YourStrongPassword123!

# Memory management
maxmemory 4gb
maxmemory-policy allkeys-lru    # evict LRU keys when full
# Policies: noeviction, allkeys-lru, volatile-lru,
#           allkeys-lfu, volatile-lfu, volatile-ttl, allkeys-random

# Persistence
appendonly yes
appendfsync everysec             # fsync every 1s — safe + fast balance
save 3600 1
save 300 100
save 60 10000

# Slow log
slowlog-log-slower-than 10000   # 10ms in microseconds
slowlog-max-len 128`)}
</div>
<div class="tut-section" id="rd-datatypes">
${h2('rd-datatypes','🏗️','Data Types & Commands')}
${h3('Strings — Cache, Counters, Locks')}
${cb('bash',`SET user:1:name "Eknatha" EX 3600       # with 1-hour TTL
GET user:1:name
MSET k1 v1 k2 v2 k3 v3
MGET k1 k2 k3
INCR page:views                         # atomic counter
INCRBY product:1:stock -5               # atomic decrement
SET lock:payment:123 "worker-1" NX EX 30  # distributed lock`)}
${h3('Hashes — Sessions, User Objects')}
${cb('bash',`HSET session:abc user_id 42 email "e@lab.com" role "admin"
HGET session:abc role
HGETALL session:abc
HMGET session:abc user_id email
EXPIRE session:abc 3600`)}
${h3('Lists — Queues, Feeds')}
${cb('bash',`LPUSH queue:email "job:1" "job:2"    # push to head
RPUSH queue:email "job:3"            # push to tail
BRPOP queue:email 30                 # blocking pop — perfect for workers
LRANGE feed:user:1 0 49              # 50 most recent items
LTRIM feed:user:1 0 999              # keep only 1000 items`)}
${h3('Sorted Sets — Leaderboards')}
${cb('bash',`ZADD leaderboard 9500 "alice" 8200 "bob" 7100 "charlie"
ZREVRANGE leaderboard 0 9 WITHSCORES   # top 10
ZREVRANK leaderboard "alice"           # rank from top (0-indexed)
ZINCRBY leaderboard 500 "bob"          # add points
ZRANGEBYSCORE leaderboard 5000 +inf    # score > 5000`)}
${h3('Pub/Sub — Real-time Messaging')}
${cb('bash',`# Subscriber terminal
SUBSCRIBE notifications:user:42
PSUBSCRIBE notifications:*           # pattern subscribe

# Publisher terminal
PUBLISH notifications:user:42 '{"type":"message","text":"Hello!"}'`)}
</div>
<div class="tut-section" id="rd-patterns">
${h2('rd-patterns','🎯','Common Patterns')}
${h3('Cache-Aside (most common)')}
${cb('bash',`# Pseudocode flow:
# 1. Check Redis first
# 2. Cache HIT → return value
# 3. Cache MISS → query DB → SET in Redis with TTL → return value

RESULT=$(redis-cli GET "cache:user:42")
if [ -z "$RESULT" ]; then
  RESULT=$(psql -c "SELECT row_to_json(u) FROM users u WHERE id=42" -tA)
  redis-cli SET "cache:user:42" "$RESULT" EX 300
fi`)}
${h3('Rate Limiting')}
${cb('bash',`# Fixed window: 100 req/min per IP
KEY="ratelimit:$(echo $IP):$(date +%Y%m%d%H%M)"
COUNT=$(redis-cli INCR "$KEY")
[ "$COUNT" -eq 1 ] && redis-cli EXPIRE "$KEY" 60
[ "$COUNT" -gt 100 ] && echo "429 Too Many Requests"`)}
${h3('Distributed Lock')}
${cb('bash',`# Atomic: SET NX EX — only succeeds if key does not exist
LOCK=$(redis-cli SET "lock:daily-job" "worker-1" NX EX 300)
if [ "$LOCK" = "OK" ]; then
  # Do work...
  redis-cli DEL "lock:daily-job"
else
  echo "Another worker holds the lock"
fi`)}
</div>
<div class="tut-section" id="rd-persistence">
${h2('rd-persistence','💾','RDB vs AOF')}
${table(['Feature','RDB Snapshot','AOF Append-Only'],
[['Data loss risk','Minutes (last save)','< 1 second (everysec)'],
['Restart speed','Fast','Slower (replays all ops)'],
['File size','Compact binary','Larger, grows over time'],
['Use for','Backups, non-critical cache','Production, data you cannot lose']])}
${tip('Enable BOTH: <code>appendonly yes</code> + <code>save</code> directives. AOF handles data safety, RDB enables fast restarts and serves as a backup.')}
</div>
<div class="tut-section" id="rd-cluster">
${h2('rd-cluster','🌐','Cluster & Sentinel')}
${h3('Sentinel — HA for single primary')}
${cb('conf',`# sentinel.conf
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel auth-pass mymaster YourPassword
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000`)}
${h3('Redis Cluster — multi-shard horizontal scale')}
${cb('bash',`# Create cluster: 3 primaries + 3 replicas
redis-cli --cluster create \\
  node1:6379 node2:6379 node3:6379 \\
  node4:6379 node5:6379 node6:6379 \\
  --cluster-replicas 1 -a password

redis-cli -c -h node1 CLUSTER INFO
redis-cli -c -h node1 CLUSTER NODES`)}
</div>
<div class="tut-section" id="rd-k8s">
${h2('rd-k8s','☸️','Kubernetes')}
${cb('bash',`# Bitnami Redis with Sentinel
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis \\
  --set auth.password=mypassword \\
  --set replica.replicaCount=2 \\
  --set sentinel.enabled=true \\
  -n databases`)}
</div>
<div class="tut-section" id="rd-monitor">
${h2('rd-monitor','📊','Monitoring')}
${cb('bash',`redis-cli INFO memory       # used_memory, maxmemory, evicted_keys
redis-cli INFO replication  # role, connected_slaves, repl_offset
redis-cli INFO keyspace     # key count and TTL stats per DB
redis-cli INFO stats        # instantaneous_ops_per_sec, rejected_connections
redis-cli SLOWLOG GET 20    # recent slow commands
redis-cli --bigkeys         # find largest keys
redis-cli MEMORY DOCTOR     # memory health recommendations`)}
${h3('Key Alerts')}
${ul('Memory > 80% of maxmemory','evicted_keys > 0 — means memory pressure','rejected_connections > 0 — maxclients reached','Replication lag > 5s','P99 latency > 10ms')}
</div>
<div class="tut-section" id="rd-trouble">
${h2('rd-trouble','🔬','Troubleshooting')}
${table(['Problem','Diagnosis','Fix'],
[['High memory / evictions','<code>INFO memory</code>, <code>redis-cli --bigkeys</code>','Find keys missing TTL; increase maxmemory; switch to allkeys-lru'],
['Slow commands','<code>SLOWLOG GET 20</code>','Replace KEYS * with SCAN; avoid SMEMBERS on large sets'],
['Data loss after restart','No AOF file present','Enable <code>appendonly yes</code>; set <code>appendfsync everysec</code>'],
['Connection refused','Check requirepass, bind config','Verify firewall, bind address, password'],
['Replication lag','<code>INFO replication</code> lag bytes','Check network; increase output-buffer-limit']])}
</div>`
};

tutorials.cassandra = {
name:'Cassandra', icon:'🪨', category:'columnar',
content:()=>`
${header('🪨','Apache Cassandra','Linearly scalable, peer-to-peer distributed wide-column store. No single point of failure. Write anywhere, read anywhere.',['Wide-Column','NoSQL','Open Source','K8s Ready'])}
${toc(['ca-concepts','1. Core Concepts'],['ca-install','2. Installation'],['ca-cql','3. CQL Operations'],['ca-datamodel','4. Data Modeling'],['ca-ops','5. Operations'],['ca-k8s','6. Kubernetes'])}
<div class="tut-section" id="ca-concepts">
${h2('ca-concepts','🧠','Core Concepts')}
${table(['Concept','Description'],
[['Keyspace','Container (like a database). Defines replication strategy and RF.'],
['Table','Rows with mandatory primary key.'],
['Partition Key','Determines which node stores the row. Critical for distribution.'],
['Clustering Columns','Sort order within a partition. Determines on-disk ordering.'],
['Replication Factor','Copies of data across nodes. RF=3 recommended for production.'],
['Gossip','Peer-to-peer protocol — all nodes are equal, no master.'],
['Compaction','Background SSTable merging. Reclaims space and improves reads.'],
['Tombstone','Marker for deleted data. Cleaned after gc_grace_seconds (10d default).']])}
${table(['Consistency','Write Quorum','Read Quorum','Use Case'],
[['ONE','1 node','1 node','Logs, analytics (eventual OK)'],
['LOCAL_QUORUM','(RF/2)+1 local','(RF/2)+1 local','Production, multi-DC apps'],
['QUORUM','(RF/2)+1 nodes','(RF/2)+1 nodes','Strong consistency, single DC'],
['ALL','All replicas','All replicas','Highest safety, availability risk']])}
${warn('Cassandra is AP (Available + Partition Tolerant). Design your schema around your query patterns — there are no JOINs and limited WHERE clause flexibility.')}
</div>
<div class="tut-section" id="ca-install">
${h2('ca-install','⚙️','Installation')}
${cb('bash',`# Ubuntu — requires Java 11
sudo apt install -y openjdk-11-jdk
echo "deb https://debian.cassandra.apache.org 41x main" | sudo tee /etc/apt/sources.list.d/cassandra.list
curl https://downloads.apache.org/cassandra/KEYS | sudo apt-key add -
sudo apt update && sudo apt install -y cassandra
sudo systemctl enable --now cassandra

nodetool status     # UN = Up/Normal
cqlsh               # CQL shell

# Docker (single node dev)
docker run -d --name cassandra \\
  -e CASSANDRA_CLUSTER_NAME=MyCluster \\
  -p 9042:9042 -v cass-data:/var/lib/cassandra \\
  cassandra:4.1`)}
</div>
<div class="tut-section" id="ca-cql">
${h2('ca-cql','🗃️','CQL Operations')}
${cb('sql',`-- Create keyspace
CREATE KEYSPACE myapp
  WITH replication = {'class':'NetworkTopologyStrategy','datacenter1':3}
  AND durable_writes = true;
USE myapp;

-- IoT sensor readings table
CREATE TABLE sensor_readings (
  device_id   UUID,
  read_time   TIMESTAMP,
  temperature FLOAT,
  humidity    FLOAT,
  PRIMARY KEY (device_id, read_time)
) WITH CLUSTERING ORDER BY (read_time DESC)
  AND default_time_to_live = 2592000   -- 30-day auto-expiry
  AND compaction = {
    'class':'TimeWindowCompactionStrategy',
    'compaction_window_unit':'DAYS',
    'compaction_window_size':1
  };

-- INSERT (always an upsert in Cassandra)
INSERT INTO sensor_readings (device_id,read_time,temperature,humidity)
VALUES (uuid(), toTimestamp(now()), 23.5, 65.2);

-- SELECT — must include partition key
SELECT * FROM sensor_readings
WHERE device_id = a1b2c3d4-e5f6-7890-abcd-ef1234567890 LIMIT 100;

SELECT * FROM sensor_readings
WHERE device_id = ? AND read_time > '2025-01-01' AND read_time < '2025-02-01';

-- Lightweight transaction (compare-and-set)
INSERT INTO users (id,email,name) VALUES (uuid(),'e@lab.com','Eknatha')
IF NOT EXISTS;

-- Batch (same partition for atomicity)
BEGIN BATCH
  INSERT INTO users (id,name) VALUES (1,'Alice');
  INSERT INTO users_by_email (email,id) VALUES ('a@b.com',1);
APPLY BATCH;`)}
</div>
<div class="tut-section" id="ca-datamodel">
${h2('ca-datamodel','🎯','Data Modeling — One Table Per Query')}
${p('In Cassandra, you design a table for EACH query your application needs. There are no JOINs.')}
${cb('sql',`-- Query 1: Get user by ID
CREATE TABLE users_by_id (
  user_id UUID PRIMARY KEY, name TEXT, email TEXT
);

-- Query 2: Get user by email (login)
CREATE TABLE users_by_email (
  email TEXT PRIMARY KEY, user_id UUID, name TEXT
);

-- Query 3: Get all orders for user, newest first
CREATE TABLE orders_by_user (
  user_id  UUID,
  order_id TIMEUUID,    -- time-UUID → automatically sorted by time
  total    DECIMAL,
  status   TEXT,
  PRIMARY KEY (user_id, order_id)
) WITH CLUSTERING ORDER BY (order_id DESC);

-- Keep tables in sync with logged batches or application dual-writes`)}
</div>
<div class="tut-section" id="ca-ops">
${h2('ca-ops','🔧','Operations')}
${cb('bash',`nodetool status           # cluster node states (UN/DN)
nodetool ring             # token ring and data distribution
nodetool tpstats          # thread pools — check dropped messages
nodetool compactionstats  # background compaction progress
nodetool cfstats myapp    # per-table read/write/latency stats

# Repair — ensure consistency (run weekly)
nodetool repair myapp
nodetool repair -pr myapp  # primary range only — faster

# Snapshot backup
nodetool snapshot myapp --tag backup_$(date +%Y%m%d)
# Snapshots: /var/lib/cassandra/data/keyspace/table/snapshots/

# Cleanup after adding nodes
nodetool cleanup

# Decommission a node (run on the node to remove)
nodetool decommission`)}
</div>
<div class="tut-section" id="ca-k8s">
${h2('ca-k8s','☸️','Kubernetes — K8ssandra Operator')}
${cb('bash',`helm repo add k8ssandra https://helm.k8ssandra.io/stable
helm install k8ssandra-operator k8ssandra/k8ssandra-operator \\
  -n k8ssandra-operator --create-namespace`)}
${cb('yaml',`apiVersion: k8ssandra.io/v1alpha1
kind: K8ssandraCluster
metadata:
  name: cassandra-cluster
  namespace: databases
spec:
  cassandra:
    serverVersion: "4.1.3"
    datacenters:
      - metadata:
          name: dc1
        size: 3
        storageConfig:
          cassandraDataVolumeClaimSpec:
            storageClassName: fast-ssd
            accessModes: ["ReadWriteOnce"]
            resources:
              requests:
                storage: 100Gi
        resources:
          requests:
            cpu: "2"
            memory: 8Gi
  reaper:              # automated repair
    deploymentMode: SINGLE
  medusa:              # S3 backup
    storageProperties:
      storageProvider: s3
      bucketName: my-cassandra-backups
      region: ap-south-1`)}
</div>`
};

tutorials.clickhouse = {
name:'ClickHouse', icon:'⚡', category:'columnar',
content:()=>`
${header('⚡','ClickHouse','Fastest OLAP database. Columnar storage + vectorized execution = billions of rows per second per server.',['Columnar OLAP','Open Source','K8s Ready','Cloud Native'])}
${toc(['ch-intro','1. Introduction'],['ch-install','2. Installation'],['ch-engines','3. Table Engines'],['ch-ops','4. Core Operations'],['ch-perf','5. Performance Patterns'],['ch-k8s','6. Kubernetes'])}
<div class="tut-section" id="ch-intro">
${h2('ch-intro','📖','Introduction')}
${p('ClickHouse stores data column-by-column rather than row-by-row. When you run <code>SELECT sum(revenue) FROM orders</code>, ClickHouse only reads the revenue column — skipping all other data. This combined with vectorized execution (SIMD CPU instructions) enables 100-1000x speedups over PostgreSQL/MySQL for analytical queries.')}
${table(['Metric','ClickHouse','PostgreSQL'],
[['1B row scan + aggregate','~0.3 seconds','~45 seconds'],
['Compression ratio','5-10x','2-3x'],
['Ingest speed','500K-1M rows/sec','50K rows/sec'],
['Best for','Analytics, OLAP','OLTP, transactions']])}
${warn('ClickHouse is NOT for OLTP. No UPDATE/DELETE of individual rows by design. Use PostgreSQL for transactions and ClickHouse for analytics.')}
</div>
<div class="tut-section" id="ch-install">
${h2('ch-install','⚙️','Installation')}
${cb('bash',`# Ubuntu
sudo apt-get install -y apt-transport-https ca-certificates curl
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | \\
  sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg] \\
  https://packages.clickhouse.com/deb lts main" | \\
  sudo tee /etc/apt/sources.list.d/clickhouse.list
sudo apt update && sudo apt install -y clickhouse-server clickhouse-client
sudo service clickhouse-server start
clickhouse-client   # connect

# Docker
docker run -d --name clickhouse \\
  -p 8123:8123 -p 9000:9000 \\
  -v ch-data:/var/lib/clickhouse \\
  -e CLICKHOUSE_PASSWORD=mypass \\
  clickhouse/clickhouse-server:latest`)}
</div>
<div class="tut-section" id="ch-engines">
${h2('ch-engines','🏗️','Table Engines')}
${table(['Engine','Use Case'],
[['MergeTree','General analytics — partitioning, sorting, background merges'],
['ReplacingMergeTree','Deduplication — replaces old versions during merge'],
['SummingMergeTree','Pre-aggregated inserts — sums numeric fields during merge'],
['AggregatingMergeTree','Incremental aggregates — stores AggregateFunction states'],
['ReplicatedMergeTree','HA replication via ZooKeeper/ClickHouse Keeper'],
['Distributed','Query router across shards'],
['MaterializedView','Auto-updated derived table — aggregate on insert']])}
${cb('sql',`-- Production analytics table
CREATE TABLE page_views
(
  event_time  DateTime,
  user_id     UInt64,
  page_url    String,
  country     LowCardinality(String),  -- 10x faster for low-cardinality columns
  duration_ms UInt32,
  date        Date MATERIALIZED toDate(event_time)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_time)    -- partition by month
ORDER BY (country, user_id, event_time)
TTL event_time + INTERVAL 1 YEAR    -- auto-delete old data
SETTINGS index_granularity = 8192;`)}
</div>
<div class="tut-section" id="ch-ops">
${h2('ch-ops','🗃️','Core Operations')}
${cb('sql',`-- Bulk insert (always prefer large batches)
INSERT INTO page_views SELECT * FROM file('events.csv', CSV);
INSERT INTO page_views VALUES (now(), 1001, '/home', 'IN', 2500);

-- Real-time analytics — ClickHouse specialty
SELECT
  country,
  uniq(user_id)          AS unique_users,
  count()                AS page_views,
  avg(duration_ms)       AS avg_duration_ms,
  quantile(0.95)(duration_ms) AS p95_duration_ms
FROM page_views
WHERE event_time >= now() - INTERVAL 7 DAY
GROUP BY country
ORDER BY page_views DESC
LIMIT 20;

-- Time-series bucketing
SELECT
  toStartOfHour(event_time) AS hour,
  count()                    AS events,
  uniq(user_id)              AS users
FROM page_views
WHERE event_time >= today() - 7
GROUP BY hour ORDER BY hour;

-- Materialized View — aggregate on insert automatically
CREATE MATERIALIZED VIEW hourly_stats
ENGINE = SummingMergeTree()
ORDER BY (hour, country)
AS SELECT
  toStartOfHour(event_time) AS hour,
  country,
  count()         AS views,
  sum(duration_ms) AS total_duration
FROM page_views GROUP BY hour, country;

-- Check query performance
SELECT query, elapsed, read_rows, read_bytes, memory_usage
FROM system.query_log
WHERE type='QueryFinish' AND event_time > now()-3600
ORDER BY elapsed DESC LIMIT 10;`)}
</div>
<div class="tut-section" id="ch-perf">
${h2('ch-perf','⚡','Performance Patterns')}
${ul('Insert in large batches (>10K rows). Small inserts create too many parts and slow merges.','Use <code>LowCardinality(String)</code> for columns with &lt;10K unique values (country, status, type) — 10x compression.','Partition by time — queries skip irrelevant partitions entirely.','<code>ORDER BY (most_filtered_col, time_col)</code> — queries on sort key use primary index.','Use <code>PREWHERE</code> instead of <code>WHERE</code> for selective filters on large columns.','MaterializedViews pre-compute heavy aggregations at insert time — dashboard queries become instant.')}
</div>
<div class="tut-section" id="ch-k8s">
${h2('ch-k8s','☸️','Kubernetes — Altinity Operator')}
${cb('bash',`helm repo add altinity https://kubernetes.charts.altinity.com
helm install clickhouse-operator altinity/altinity-clickhouse-operator -n kube-system`)}
${cb('yaml',`apiVersion: clickhouse.altinity.com/v1
kind: ClickHouseInstallation
metadata:
  name: ch-cluster
  namespace: databases
spec:
  configuration:
    clusters:
      - name: cluster1
        layout:
          shardsCount: 2
          replicasCount: 2
  templates:
    volumeClaimTemplates:
      - name: data-volume
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 200Gi
          storageClassName: fast-ssd
    podTemplates:
      - name: pod-template
        spec:
          containers:
            - name: clickhouse
              resources:
                requests:
                  cpu: "4"
                  memory: 16Gi`)}
</div>`
};

tutorials.elasticsearch = {
name:'Elasticsearch', icon:'🔍', category:'search',
content:()=>`
${header('🔍','Elasticsearch','Distributed search and analytics engine. Full-text search, log analytics, k-NN vector search at scale.',['Search Engine','Open Source','K8s Ready','Cloud Native'])}
${toc(['es-install','1. Installation'],['es-concepts','2. Core Concepts'],['es-ops','3. Index Operations'],['es-query','4. Query DSL'],['es-agg','5. Aggregations'],['es-k8s','6. Kubernetes (ECK)'],['es-trouble','7. Troubleshooting'])}
<div class="tut-section" id="es-install">
${h2('es-install','⚙️','Installation')}
${cb('bash',`# Docker — single node dev
docker run -d --name elasticsearch \\
  -e "discovery.type=single-node" \\
  -e "xpack.security.enabled=false" \\
  -p 9200:9200 \\
  -v es-data:/usr/share/elasticsearch/data \\
  elasticsearch:8.12.0

# Test cluster health
curl http://localhost:9200/_cluster/health?pretty
curl http://localhost:9200/_cat/indices?v`)}
</div>
<div class="tut-section" id="es-concepts">
${h2('es-concepts','🧠','Core Concepts')}
${table(['Concept','SQL Equivalent','Description'],
[['Index','Table','Container for documents'],
['Document','Row','JSON record in an index'],
['Field','Column','Key-value pair in document'],
['Mapping','Schema','Field type definitions'],
['Shard','Partition','Horizontal index division across nodes'],
['Replica','Standby copy','HA and read scaling'],
['Inverted index','Full-text index','Maps terms → document IDs for fast search']])}
${h3('Field Types')}
${ul('<code>text</code> — analyzed for full-text search (tokenized, lowercased, stemmed)','<code>keyword</code> — exact match only — use for IDs, status, enum values, sorting','<code>date</code> — ISO 8601 dates with format support','<code>long, integer, float, double</code> — numeric types','<code>boolean</code> — true/false','<code>nested</code> — array of objects maintaining inner relationship','<code>dense_vector</code> — for k-NN semantic search')}
</div>
<div class="tut-section" id="es-ops">
${h2('es-ops','🗃️','Index & Document Operations')}
${cb('bash',`# Create index with explicit mapping
curl -X PUT "localhost:9200/products" -H 'Content-Type: application/json' -d '{
  "settings": {"number_of_shards":2,"number_of_replicas":1},
  "mappings": {
    "properties": {
      "title":      {"type":"text","analyzer":"english"},
      "category":   {"type":"keyword"},
      "price":      {"type":"float"},
      "in_stock":   {"type":"boolean"},
      "created_at": {"type":"date"},
      "tags":       {"type":"keyword"}
    }
  }
}'

# Index a document
curl -X POST "localhost:9200/products/_doc/1" -H 'Content-Type: application/json' -d '{
  "title":"MacBook Pro M3","category":"laptops","price":1999.99,"in_stock":true
}'

# Bulk index (much faster — always prefer bulk for large datasets)
curl -X POST "localhost:9200/_bulk" -H 'Content-Type: application/json' -d '
{"index":{"_index":"products","_id":"2"}}
{"title":"Dell XPS 15","category":"laptops","price":1599.99}
{"index":{"_index":"products","_id":"3"}}
{"title":"iPad Pro","category":"tablets","price":999.99}
'

# Get, Update, Delete
curl "localhost:9200/products/_doc/1"
curl -X POST "localhost:9200/products/_update/1" -H 'Content-Type: application/json' -d '{"doc":{"price":1899.99}}'
curl -X DELETE "localhost:9200/products/_doc/1"`)}
</div>
<div class="tut-section" id="es-query">
${h2('es-query','🔎','Query DSL')}
${cb('bash',`# Full-text search with highlighting
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d '{
  "query": {
    "multi_match": {
      "query": "macbook laptop",
      "fields": ["title^3","description"],
      "fuzziness": "AUTO"
    }
  },
  "highlight": {"fields":{"title":{}}},
  "size": 10, "from": 0
}'

# Boolean query — must + filter + must_not
# (filter context is faster — no relevance scoring)
{
  "query": {
    "bool": {
      "must":    [{"match":{"title":"laptop"}}],
      "filter":  [{"term":{"in_stock":true}},
                  {"range":{"price":{"gte":500,"lte":2000}}}],
      "must_not":[{"term":{"category":"refurbished"}}]
    }
  },
  "sort": [{"_score":"desc"},{"price":"asc"}]
}

# k-NN vector search (semantic search)
{
  "knn": {
    "field": "embedding",
    "query_vector": [0.1, 0.2, 0.3],
    "k": 10,
    "num_candidates": 100
  }
}`)}
</div>
<div class="tut-section" id="es-agg">
${h2('es-agg','📊','Aggregations')}
${cb('bash',`# Sales by category with stats
curl -X GET "localhost:9200/products/_search" -H 'Content-Type: application/json' -d '{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": {"field":"category","size":10},
      "aggs": {
        "avg_price": {"avg":{"field":"price"}},
        "price_stats": {"stats":{"field":"price"}}
      }
    },
    "price_histogram": {
      "histogram": {"field":"price","interval":200}
    }
  }
}'`)}
</div>
<div class="tut-section" id="es-k8s">
${h2('es-k8s','☸️','Kubernetes — ECK (Elastic Cloud on K8s)')}
${cb('bash',`kubectl create -f https://download.elastic.co/downloads/eck/2.11.0/crds.yaml
kubectl apply -f https://download.elastic.co/downloads/eck/2.11.0/operator.yaml`)}
${cb('yaml',`apiVersion: elasticsearch.k8s.elastic.co/v1
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
        - metadata:
            name: elasticsearch-data
          spec:
            resources:
              requests:
                storage: 10Gi
    - name: data
      count: 3
      config:
        node.roles: ["data","ingest"]
      podTemplate:
        spec:
          containers:
            - name: elasticsearch
              resources:
                requests:
                  memory: 4Gi
                  cpu: 2
      volumeClaimTemplates:
        - metadata:
            name: elasticsearch-data
          spec:
            resources:
              requests:
                storage: 100Gi
            storageClassName: fast-ssd`)}
</div>
<div class="tut-section" id="es-trouble">
${h2('es-trouble','🔬','Troubleshooting')}
${table(['Problem','Check','Fix'],
[['Red cluster status','<code>GET /_cluster/health</code>','Unassigned shards — check disk space, node count vs replicas'],
['Unassigned shards','<code>GET /_cat/shards?v</code>','Reduce replicas: <code>PUT /index/_settings {"number_of_replicas":0}</code>'],
['High JVM heap','<code>GET /_nodes/stats/jvm</code>','Increase heap (max 31GB), check for large aggregations'],
['Slow queries','<code>GET /_nodes/hot_threads</code>','Use filter context, add keyword field for sorting, avoid wildcards'],
['Disk full','<code>GET /_cat/allocation?v</code>','Add nodes, set ILM retention policy, delete old indices']])}
</div>`
};

tutorials.neo4j = {
name:'Neo4j', icon:'🕸️', category:'graph',
content:()=>`
${header('🕸️','Neo4j','The world\'s leading graph database — native graph storage with Cypher for relationship-heavy data at millisecond speed.',['Graph','ACID','Open Source','K8s Ready'])}
${toc(['nj-install','1. Installation'],['nj-concepts','2. Core Concepts'],['nj-cypher','3. Cypher Queries'],['nj-patterns','4. Graph Patterns'],['nj-ops','5. Operations'],['nj-k8s','6. Kubernetes'])}
<div class="tut-section" id="nj-install">
${h2('nj-install','⚙️','Installation')}
${cb('bash',`# Docker
docker run -d --name neo4j \\
  -p 7474:7474 -p 7687:7687 \\
  -e NEO4J_AUTH=neo4j/mypassword \\
  -v neo4j-data:/data \\
  neo4j:5-community

# Browser: http://localhost:7474
# cypher-shell
cypher-shell -u neo4j -p mypassword`)}
</div>
<div class="tut-section" id="nj-concepts">
${h2('nj-concepts','🧠','Core Concepts')}
${table(['Concept','Description','Cypher Example'],
[['Node','Entity or object','<code>(p:Person {name:"Alice"})</code>'],
['Relationship','Directed connection','<code>[:FOLLOWS {since:2023}]</code>'],
['Property','Key-value on node/rel','<code>{name:"Alice", age:30}</code>'],
['Label','Node category/type','<code>:Person, :Product, :Order</code>'],
['Pattern','Subgraph to match','<code>(a)-[:KNOWS]->(b)</code>'],
['Path','Sequence of nodes+rels','Shortest path between two nodes']])}
${p('A 2-hop friend-of-friend query that requires 3-4 JOINs in SQL runs as a single Cypher pattern match in milliseconds — even at billion-node scale.')}
</div>
<div class="tut-section" id="nj-cypher">
${h2('nj-cypher','🗃️','Cypher Query Language')}
${cb('cypher',`// CREATE nodes
CREATE (alice:Person {name:"Alice", age:30, email:"alice@lab.com"})
CREATE (bob:Person {name:"Bob", age:28})
CREATE (neo4j:Technology {name:"Neo4j", category:"database"})

// CREATE relationships
MATCH (a:Person {name:"Alice"}), (b:Person {name:"Bob"})
CREATE (a)-[:KNOWS {since:2023, strength:"strong"}]->(b)

// MERGE — create if not exists (upsert)
MERGE (u:Person {email:"charlie@lab.com"})
ON CREATE SET u.name="Charlie", u.created=datetime()
ON MATCH  SET u.lastSeen=datetime()

// MATCH — find nodes and patterns
MATCH (p:Person) RETURN p LIMIT 25;
MATCH (p:Person {name:"Alice"})-[:KNOWS]->(friend) RETURN friend.name;

// Variable-length paths — friends of friends (1-3 hops)
MATCH (alice:Person {name:"Alice"})-[:KNOWS*1..3]->(fof)
WHERE NOT (alice)-[:KNOWS]->(fof) AND fof <> alice
RETURN fof.name ORDER BY rand() LIMIT 10;

// Shortest path
MATCH (a:Person {name:"Alice"}), (b:Person {name:"Charlie"}),
      path = shortestPath((a)-[:KNOWS*]-(b))
RETURN path, length(path) AS hops;

// Update properties
MATCH (p:Person {name:"Alice"}) SET p.age=31, p.updated=datetime();

// Delete node and all its relationships
MATCH (p:Person {name:"OldUser"}) DETACH DELETE p;`)}
</div>
<div class="tut-section" id="nj-patterns">
${h2('nj-patterns','🎯','Graph Pattern Recipes')}
${h3('Fraud Detection — Transaction Rings')}
${cb('cypher',`// Find accounts forming a transfer ring (cycle)
MATCH path = (a:Account)-[:TRANSFERRED_TO*2..5]->(a)
WHERE ALL(r IN relationships(path) WHERE r.amount > 10000)
RETURN path, length(path) AS ring_size ORDER BY ring_size;

// Accounts sharing same device or IP — suspicious clustering
MATCH (a1:Account)-[:USES_DEVICE]->(d:Device)<-[:USES_DEVICE]-(a2:Account)
WHERE a1 <> a2
RETURN a1.id, a2.id, d.device_id, count(*) AS sessions;`)}
${h3('Recommendation Engine')}
${cb('cypher',`// Collaborative filtering: bought-X also bought-Y
MATCH (me:User {id:"u1"})-[:PURCHASED]->(p:Product)
      <-[:PURCHASED]-(similar:User)-[:PURCHASED]->(rec:Product)
WHERE NOT (me)-[:PURCHASED]->(rec)
RETURN rec.name, count(similar) AS score
ORDER BY score DESC LIMIT 10;`)}
${h3('Access Control Graph')}
${cb('cypher',`// Does user have permission through role hierarchy?
MATCH (u:User {name:"Alice"})-[:HAS_ROLE]->(r:Role)
      -[:HAS_PERMISSION*1..]->(p:Permission {name:"delete:orders"})
RETURN count(p) > 0 AS hasPermission;`)}
</div>
<div class="tut-section" id="nj-ops">
${h2('nj-ops','🔧','Indexes & Operations')}
${cb('cypher',`// Create indexes
CREATE INDEX person_name FOR (p:Person) ON (p.name);
CREATE INDEX person_email FOR (p:Person) ON (p.email);
SHOW INDEXES;

// Uniqueness constraint
CREATE CONSTRAINT unique_email FOR (p:Person) REQUIRE p.email IS UNIQUE;

// Database info
CALL db.labels();
CALL db.relationshipTypes();
CALL dbms.queryJmx('org.neo4j:instance=kernel#0,name=Store file sizes') YIELD attributes;`)}
${cb('bash',`# Backup / Restore
neo4j-admin database dump neo4j --to-path=/backup/neo4j.dump
neo4j-admin database load --from-path=/backup/neo4j.dump neo4j --overwrite-destination=true`)}
</div>
<div class="tut-section" id="nj-k8s">
${h2('nj-k8s','☸️','Kubernetes')}
${cb('bash',`helm repo add neo4j https://helm.neo4j.com/neo4j
helm install neo4j neo4j/neo4j \\
  --set neo4j.name=my-graph \\
  --set neo4j.password=mypassword \\
  --set volumes.data.requests.storage=50Gi \\
  -n databases --create-namespace`)}
${tip('For production on Kubernetes, consider Neo4j AuraDB (cloud-managed). It handles clustering, certificates, and failover automatically. There is a free tier for development.')}
</div>`
};

tutorials.timescaledb = {
name:'TimescaleDB', icon:'⏱️', category:'timeseries',
content:()=>`
${header('⏱️','TimescaleDB','PostgreSQL extension for time-series. Full SQL + auto time partitioning + 90% compression + continuous aggregates.',['Time Series','PostgreSQL','Open Source','K8s Ready'])}
${toc(['ts-install','1. Installation'],['ts-hypertable','2. Hypertables'],['ts-query','3. Time-Series Queries'],['ts-continuous','4. Continuous Aggregates'],['ts-compress','5. Compression & Retention'],['ts-k8s','6. Kubernetes'])}
<div class="tut-section" id="ts-install">
${h2('ts-install','⚙️','Installation')}
${cb('bash',`# Ubuntu — add TimescaleDB repo
echo "deb https://packagecloud.io/timescale/timescaledb/ubuntu/ $(lsb_release -c -s) main" | \\
  sudo tee /etc/apt/sources.list.d/timescaledb.list
wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | \\
  sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/timescaledb.gpg
sudo apt update && sudo apt install -y timescaledb-2-postgresql-16
sudo timescaledb-tune --quiet --yes   # auto-tune postgresql.conf
sudo systemctl restart postgresql

# Enable extension
psql -U postgres -d mydb -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

# Docker
docker run -d --name timescaledb \\
  -e POSTGRES_PASSWORD=password -p 5432:5432 \\
  -v ts-data:/var/lib/postgresql/data \\
  timescale/timescaledb:latest-pg16`)}
</div>
<div class="tut-section" id="ts-hypertable">
${h2('ts-hypertable','🏗️','Hypertables')}
${cb('sql',`-- Step 1: Create regular PostgreSQL table
CREATE TABLE sensor_data (
  time        TIMESTAMPTZ NOT NULL,
  device_id   INTEGER NOT NULL,
  sensor_type TEXT NOT NULL,
  value       DOUBLE PRECISION,
  metadata    JSONB
);

-- Step 2: Convert to hypertable (auto-partitions by time)
SELECT create_hypertable('sensor_data', by_range('time', INTERVAL '1 day'));

-- Step 3: Add indexes on non-time columns
CREATE INDEX ON sensor_data (device_id, time DESC);
CREATE INDEX ON sensor_data (sensor_type, time DESC);

-- Insert — same as PostgreSQL
INSERT INTO sensor_data VALUES (NOW(), 101, 'temperature', 23.5, '{"location":"rack-1"}');

-- View auto-created chunks
SELECT * FROM timescaledb_information.chunks
WHERE hypertable_name = 'sensor_data'
ORDER BY range_start DESC LIMIT 10;`)}
</div>
<div class="tut-section" id="ts-query">
${h2('ts-query','🗃️','Time-Series Queries')}
${cb('sql',`-- time_bucket — aggregate into intervals
SELECT time_bucket('1 hour', time) AS hour,
       device_id,
       avg(value)       AS avg_temp,
       max(value)       AS max_temp,
       min(value)       AS min_temp,
       count(*)         AS readings
FROM sensor_data
WHERE time > NOW() - INTERVAL '7 days'
  AND sensor_type = 'temperature'
GROUP BY hour, device_id
ORDER BY device_id, hour DESC;

-- Last known value per device (latest reading)
SELECT DISTINCT ON (device_id)
  device_id, time, value
FROM sensor_data
WHERE sensor_type = 'temperature'
ORDER BY device_id, time DESC;

-- Moving average (6-point rolling)
SELECT time, value,
  avg(value) OVER (
    ORDER BY time
    ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
  ) AS moving_avg_6
FROM sensor_data WHERE device_id = 101
ORDER BY time DESC LIMIT 100;

-- Rate of change (delta between readings)
SELECT time, value,
  value - lag(value) OVER (PARTITION BY device_id ORDER BY time) AS delta
FROM sensor_data WHERE device_id = 101;`)}
</div>
<div class="tut-section" id="ts-continuous">
${h2('ts-continuous','⚡','Continuous Aggregates')}
${cb('sql',`-- Create continuous aggregate — auto-refreshes as data arrives
CREATE MATERIALIZED VIEW hourly_stats
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', time) AS hour,
       device_id,
       avg(value)  AS avg_value,
       max(value)  AS max_value,
       min(value)  AS min_value,
       count(*)    AS samples
FROM sensor_data
GROUP BY hour, device_id
WITH NO DATA;

-- Auto-refresh policy (refresh last 3 hours every 30 minutes)
SELECT add_continuous_aggregate_policy('hourly_stats',
  start_offset    => INTERVAL '3 hours',
  end_offset      => INTERVAL '1 hour',
  schedule_interval => INTERVAL '30 minutes');

-- Query the aggregate (pre-computed — instant response)
SELECT * FROM hourly_stats
WHERE hour > NOW() - INTERVAL '24 hours'
ORDER BY hour DESC;

-- Hierarchical aggregate: daily from hourly
CREATE MATERIALIZED VIEW daily_stats
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 day', hour) AS day,
       device_id,
       avg(avg_value) AS avg_value,
       max(max_value) AS max_value,
       sum(samples)   AS total_samples
FROM hourly_stats
GROUP BY day, device_id WITH NO DATA;`)}
</div>
<div class="tut-section" id="ts-compress">
${h2('ts-compress','💾','Compression & Retention')}
${cb('sql',`-- Enable compression
ALTER TABLE sensor_data SET (
  timescaledb.compress,
  timescaledb.compress_orderby = 'time DESC',
  timescaledb.compress_segmentby = 'device_id'
);

-- Auto-compress chunks older than 7 days
SELECT add_compression_policy('sensor_data', INTERVAL '7 days');

-- Check compression savings
SELECT hypertable_name,
  pg_size_pretty(before_compression_total_bytes) AS before,
  pg_size_pretty(after_compression_total_bytes)  AS after,
  round((1 - after_compression_total_bytes::numeric /
             before_compression_total_bytes) * 100, 1) AS pct_saved
FROM chunk_compression_stats('sensor_data');

-- Data retention — auto-drop chunks older than 1 year
SELECT add_retention_policy('sensor_data', INTERVAL '1 year');

-- View all background jobs
SELECT * FROM timescaledb_information.jobs;
SELECT * FROM timescaledb_information.job_stats;`)}
</div>
<div class="tut-section" id="ts-k8s">
${h2('ts-k8s','☸️','Kubernetes')}
${cb('bash',`# Timescale Helm chart
helm repo add timescale https://charts.timescale.com
helm install timescaledb timescale/timescaledb-single \\
  --set replicaCount=3 \\
  --set image.tag=pg16-latest \\
  --set persistentVolumes.data.size=100Gi \\
  -n databases`)}
${tip('Alternatively use CloudNativePG with <code>imageName: timescale/timescaledb-ha:pg16</code> and add <code>CREATE EXTENSION timescaledb;</code> in <code>postInitSQL</code> — you get full CloudNativePG HA features with TimescaleDB.')}
</div>`
};

tutorials.cockroachdb = {
name:'CockroachDB', icon:'🪲', category:'newsql',
content:()=>`
${header('🪲','CockroachDB','Cloud-native distributed SQL. PostgreSQL-compatible, globally distributed, strongly consistent, automatic HA.',['NewSQL','Distributed','Open Source','K8s Native'])}
${toc(['cr-install','1. Installation'],['cr-concepts','2. Core Concepts'],['cr-ops','3. Operations'],['cr-geo','4. Geo-Distribution'],['cr-k8s','5. Kubernetes'],['cr-trouble','6. Troubleshooting'])}
<div class="tut-section" id="cr-install">
${h2('cr-install','⚙️','Installation')}
${cb('bash',`# Single node dev
curl https://binaries.cockroachdb.com/cockroach-v23.2.0.linux-amd64.tgz | tar -xz
sudo cp cockroach-v23.2.0.linux-amd64/cockroach /usr/local/bin/

cockroach start-single-node --insecure \\
  --listen-addr=localhost:26257 \\
  --http-addr=localhost:8080 --background

# Connect
cockroach sql --insecure --host=localhost:26257

# Admin UI: http://localhost:8080`)}
</div>
<div class="tut-section" id="cr-concepts">
${h2('cr-concepts','🧠','Core Concepts')}
${table(['Concept','Description'],
[['Ranges','Data split into 512MB ranges. Each replicated 3x across nodes via Raft.'],
['Raft consensus','Writes require quorum (2/3 nodes). Automatic leader election.'],
['Leaseholder','One replica per range serves reads/writes — rotates for locality.'],
['Locality','Node tags (region/zone/rack) for geo-aware replica placement.'],
['Geo-partitioning','Pin specific rows/tables to specific regions for compliance.'],
['Follower reads','Slightly stale reads from any replica — zero cross-region latency.']])}
${info('CockroachDB uses <strong>serializable isolation by default</strong> — stronger than PostgreSQL\'s default read committed. This prevents all anomalies including write skew.')}
</div>
<div class="tut-section" id="cr-ops">
${h2('cr-ops','🗃️','Operations')}
${cb('sql',`-- PostgreSQL-compatible SQL
CREATE DATABASE myapp;
USE myapp;

CREATE TABLE orders (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL,
  amount     DECIMAL(10,2),
  status     STRING DEFAULT 'pending',
  region     STRING NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  INDEX idx_user_status (user_id, status)
);

-- Transactions — serializable by default
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 'acc-1';
UPDATE accounts SET balance = balance + 100 WHERE id = 'acc-2';
COMMIT;

-- Follower reads (low latency, slightly stale)
SELECT * FROM orders
AS OF SYSTEM TIME follower_read_timestamp()
WHERE user_id = 'u1' ORDER BY created_at DESC LIMIT 50;

-- Cluster info
SHOW RANGES FROM TABLE orders;
SELECT node_id, address, locality, is_live
FROM crdb_internal.gossip_nodes;`)}
${warn('CockroachDB may return <strong>transaction retry errors</strong> (40001 SQLSTATE) under contention — implement retry loops in application code. This is by design for distributed serializable transactions.')}
</div>
<div class="tut-section" id="cr-geo">
${h2('cr-geo','🌍','Geo-Distribution')}
${cb('sql',`-- Start nodes with locality:
-- cockroach start --locality=region=ap-south,zone=ap-south-1a
-- cockroach start --locality=region=us-east,zone=us-east-1b

-- Geo-partition: India users' data stays in India
ALTER TABLE users PARTITION BY LIST (region) (
  PARTITION india VALUES IN ('IN'),
  PARTITION us    VALUES IN ('US'),
  PARTITION eu    VALUES IN ('EU')
);

ALTER PARTITION india OF TABLE users CONFIGURE ZONE USING
  num_replicas = 3,
  constraints = '{"+region=ap-south": 3}',
  lease_preferences = '[[+region=ap-south]]';

-- Global table — replicated everywhere, served locally
ALTER TABLE products SET LOCALITY GLOBAL;

-- Regional by row — each row pinned to its region
ALTER TABLE orders SET LOCALITY REGIONAL BY ROW AS region;`)}
</div>
<div class="tut-section" id="cr-k8s">
${h2('cr-k8s','☸️','Kubernetes — CockroachDB Operator')}
${cb('bash',`kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/install/crds.yaml
kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/install/operator.yaml`)}
${cb('yaml',`apiVersion: crdb.cockroachlabs.com/v1alpha1
kind: CrdbCluster
metadata:
  name: cockroachdb
  namespace: databases
spec:
  dataStore:
    pvc:
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: "60Gi"
        storageClassName: fast-ssd
  resources:
    requests:
      cpu: "2"
      memory: "8Gi"
    limits:
      cpu: "4"
      memory: "16Gi"
  tlsEnabled: true
  image:
    name: cockroachdb/cockroach:v23.2.0
  nodes: 3
  additionalArgs:
    - "--max-sql-memory=.25"
    - "--cache=.25"`)}
</div>
<div class="tut-section" id="cr-trouble">
${h2('cr-trouble','🔬','Troubleshooting')}
${table(['Problem','Diagnosis','Fix'],
[['Node not joining','<code>cockroach node status --insecure</code>','Check --join flag, firewall, TLS certs'],
['Under-replicated ranges','Admin UI → Replication dashboard','Add more nodes; check dead/decommissioned nodes'],
['Retry errors 40001','Application logs','Implement retry loop — required for distributed serializable SQL'],
['High latency reads','Admin UI → SQL Activity','Use follower reads; check leaseholder placement'],
['Clock skew errors','Logs: "clock skew"','Sync NTP on all nodes; target < 200ms skew']])}
</div>`
};

tutorials.influxdb = {
name:'InfluxDB', icon:'📈', category:'timeseries',
content:()=>`
${header('📈','InfluxDB','Purpose-built time series platform. Line Protocol ingest, Flux query language, native retention policies.',['Time Series','Open Source','Cloud Native'])}
${toc(['idb-concepts','1. Concepts'],['idb-install','2. Installation'],['idb-write','3. Writing Data'],['idb-query','4. Querying'],['idb-tasks','5. Tasks & Retention'])}
<div class="tut-section" id="idb-concepts">
${h2('idb-concepts','🧠','Core Concepts')}
${table(['Concept','Description'],
[['Organization','Top-level namespace — like a company/team'],
['Bucket','Data container with a retention policy (database + retention)'],
['Measurement','Equivalent to a table name'],
['Tags','Indexed string metadata (device_id, host, region) — used for filtering'],
['Fields','Actual numeric/string values — not indexed'],
['Timestamp','Nanosecond precision'],
['Line Protocol','Ingest format: <code>measurement,tag=val field=val timestamp</code>']])}
</div>
<div class="tut-section" id="idb-install">
${h2('idb-install','⚙️','Installation')}
${cb('bash',`# Docker
docker run -d --name influxdb -p 8086:8086 \\
  -e DOCKER_INFLUXDB_INIT_MODE=setup \\
  -e DOCKER_INFLUXDB_INIT_USERNAME=admin \\
  -e DOCKER_INFLUXDB_INIT_PASSWORD=adminpass123 \\
  -e DOCKER_INFLUXDB_INIT_ORG=myorg \\
  -e DOCKER_INFLUXDB_INIT_BUCKET=mybucket \\
  -v influxdb-data:/var/lib/influxdb2 \\
  influxdb:2.7

# UI: http://localhost:8086
# Get auth token from UI → Load Data → API Tokens`)}
</div>
<div class="tut-section" id="idb-write">
${h2('idb-write','✍️','Writing Data')}
${cb('bash',`# Line Protocol format: measurement,tag_key=tag_val field_key=field_val timestamp_ns
# measurement,tags fields timestamp

# Write via CLI
influx write --bucket mybucket --org myorg \\
  'cpu,host=server01,region=ap-south usage_idle=89.5,usage_user=10.5'

# Write via HTTP API
TOKEN="your-token-here"
curl -X POST "http://localhost:8086/api/v2/write?org=myorg&bucket=mybucket&precision=s" \\
  -H "Authorization: Token $TOKEN" \\
  -H "Content-Type: text/plain" \\
  --data-binary "
cpu,host=srv01,region=ap usage_idle=82.3,usage_user=12.1 $(date +%s)
mem,host=srv01 used_percent=68.5,available_gb=8.0 $(date +%s)
disk,host=srv01,path=/ used_percent=45.2 $(date +%s)
"`)}
</div>
<div class="tut-section" id="idb-query">
${h2('idb-query','🔎','Querying with Flux')}
${cb('javascript',`// Basic query — CPU usage last 1 hour
from(bucket: "mybucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r._field == "usage_user")
  |> filter(fn: (r) => r.host == "server01")

// Aggregate: mean CPU per 5-minute window
from(bucket: "mybucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "cpu" and r._field == "usage_user")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> yield(name: "mean_cpu")

// Join two measurements
cpuData = from(bucket: "mybucket") |> range(start: -1h) |> filter(fn:(r) => r._measurement == "cpu")
memData = from(bucket: "mybucket") |> range(start: -1h) |> filter(fn:(r) => r._measurement == "mem")
join(tables: {cpu: cpuData, mem: memData}, on: ["_time", "host"])

// Anomaly — values > 2 standard deviations from mean
from(bucket: "mybucket")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> zscore()
  |> filter(fn: (r) => r._value > 2.0 or r._value < -2.0)`)}
</div>
<div class="tut-section" id="idb-tasks">
${h2('idb-tasks','⏰','Tasks & Retention')}
${cb('javascript',`// Scheduled downsampling task — runs every hour
option task = {name: "Downsample CPU hourly", every: 1h}

from(bucket: "mybucket")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> aggregateWindow(every: 5m, fn: mean)
  |> to(bucket: "mybucket-downsampled", org: "myorg")`)}
${cb('bash',`# Create task via CLI
influx task create --name "Downsample CPU" --org myorg --file downsample.flux

# Create bucket with 90-day retention
influx bucket create --name metrics-90d --retention 2160h --org myorg

# List tasks and check status
influx task list --org myorg
influx task run list --task-id TASK_ID`)}
</div>`
};

tutorials.victoria = {
name:'VictoriaMetrics', icon:'📊', category:'timeseries',
content:()=>`
${header('📊','VictoriaMetrics','Fast, cost-effective Prometheus-compatible monitoring. 5-10x less disk space, 10x faster ingestion.',['Time Series','Prometheus','Open Source','K8s Ready'])}
${toc(['vm-install','1. Installation'],['vm-integration','2. Prometheus Integration'],['vm-query','3. MetricsQL Queries'],['vm-k8s','4. Kubernetes Operator'])}
<div class="tut-section" id="vm-install">
${h2('vm-install','⚙️','Installation')}
${cb('bash',`# Single-node (handles ~1M metrics/sec on modest hardware)
wget https://github.com/VictoriaMetrics/VictoriaMetrics/releases/latest/download/victoria-metrics-linux-amd64.tar.gz
tar -xzf victoria-metrics-*.tar.gz
./victoria-metrics-prod \\
  -storageDataPath=/data/victoria \\
  -retentionPeriod=12 \\
  -httpListenAddr=:8428

# Docker
docker run -d --name victoriametrics \\
  -p 8428:8428 \\
  -v victoria-data:/storage \\
  victoriametrics/victoria-metrics:stable \\
  -storageDataPath=/storage -retentionPeriod=12

# Health check
curl http://localhost:8428/health`)}
</div>
<div class="tut-section" id="vm-integration">
${h2('vm-integration','🔌','Prometheus Integration')}
${cb('yaml',`# prometheus.yml — send all metrics to VictoriaMetrics
global:
  scrape_interval: 15s

remote_write:
  - url: http://victoriametrics:8428/api/v1/write

# Optional: use VM as remote_read (for Grafana queries via Prometheus)
remote_read:
  - url: http://victoriametrics:8428/api/v1/read
    read_recent: true`)}
${tip('VictoriaMetrics accepts <strong>Prometheus remote_write</strong>, OpenTSDB, InfluxDB line protocol, Graphite, and CSV. Drop-in replace Prometheus by just updating the remote_write URL.')}
</div>
<div class="tut-section" id="vm-query">
${h2('vm-query','📊','MetricsQL Queries')}
${cb('promql',`# Standard PromQL works unchanged
rate(http_requests_total[5m])
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
100 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100

# MetricsQL extensions (VM-specific enhancements)
# median_over_time — robust average (ignores outliers)
median_over_time(node_cpu_seconds_total[1h])

# running_max — running maximum value
running_max(node_memory_MemUsed_bytes[7d])

# topk_avg — top-K series by average value
topk_avg(5, rate(http_requests_total[5m]))`)}
</div>
<div class="tut-section" id="vm-k8s">
${h2('vm-k8s','☸️','Kubernetes Operator')}
${cb('bash',`helm repo add vm https://victoriametrics.github.io/helm-charts/
helm install victoria-metrics-operator vm/victoria-metrics-operator \\
  -n monitoring --create-namespace`)}
${cb('yaml',`apiVersion: operator.victoriametrics.com/v1beta1
kind: VMCluster
metadata:
  name: vmcluster
  namespace: monitoring
spec:
  retentionPeriod: "12"
  vmstorage:
    replicaCount: 2
    storage:
      volumeClaimTemplate:
        spec:
          resources:
            requests:
              storage: 100Gi
  vmselect:
    replicaCount: 2
    cacheMountPath: /select-cache
    storage:
      volumeClaimTemplate:
        spec:
          resources:
            requests:
              storage: 2Gi
  vminsert:
    replicaCount: 2`)}
</div>`
};

tutorials.opensearch = {
name:'OpenSearch', icon:'🔎', category:'search',
content:()=>`
${header('🔎','OpenSearch','Apache 2.0 Elasticsearch fork. Full-text search, k-NN vector search, ML, Security — all free and open source.',['Search Engine','Open Source','K8s Ready','AWS Native'])}
${toc(['os-install','1. Installation'],['os-concepts','2. vs Elasticsearch'],['os-ops','3. Operations'],['os-vector','4. K-NN Vector Search'],['os-k8s','5. Kubernetes'])}
<div class="tut-section" id="os-install">
${h2('os-install','⚙️','Installation')}
${cb('bash',`# Docker — single node
docker run -d --name opensearch \\
  -e "discovery.type=single-node" \\
  -e "OPENSEARCH_INITIAL_ADMIN_PASSWORD=Admin@1234!" \\
  -p 9200:9200 -p 9600:9600 \\
  -v opensearch-data:/usr/share/opensearch/data \\
  opensearchproject/opensearch:2.12.0

# OpenSearch Dashboards (Kibana equivalent)
docker run -d --name opensearch-dashboards \\
  -p 5601:5601 \\
  -e 'OPENSEARCH_HOSTS=["https://opensearch:9200"]' \\
  opensearchproject/opensearch-dashboards:2.12.0

# Test
curl -ku admin:Admin@1234! https://localhost:9200/_cluster/health?pretty`)}
</div>
<div class="tut-section" id="os-concepts">
${h2('os-concepts','🔄','OpenSearch vs Elasticsearch')}
${table(['Feature','OpenSearch','Elasticsearch'],
[['License','Apache 2.0','SSPL / Elastic License 2.0'],
['Security plugin','Free built-in','Paid X-Pack subscription'],
['ML/AI features','ML Commons (free)','Paid subscription'],
['k-NN vector search','Built-in','Available (newer versions)'],
['API compatibility','ES 7.x compatible','N/A'],
['Managed cloud','Amazon OpenSearch Service','Elastic Cloud']])}
</div>
<div class="tut-section" id="os-ops">
${h2('os-ops','🗃️','Core Operations')}
${cb('bash',`HOST="https://localhost:9200"
AUTH="-ku admin:Admin@1234!"

# Create index with mapping
curl -X PUT "$HOST/logs" $AUTH -H 'Content-Type: application/json' -d '{
  "settings": {"number_of_shards":2,"number_of_replicas":1},
  "mappings": {
    "properties": {
      "timestamp": {"type":"date"},
      "level":     {"type":"keyword"},
      "service":   {"type":"keyword"},
      "message":   {"type":"text","analyzer":"standard"},
      "host":      {"type":"keyword"}
    }
  }
}'

# Index documents
curl -X POST "$HOST/logs/_doc" $AUTH -H 'Content-Type: application/json' -d '{
  "timestamp":"2025-05-08T10:00:00Z",
  "level":"ERROR",
  "service":"api-gateway",
  "message":"Connection timeout to database",
  "host":"pod-abc123"
}'

# Search
curl -X GET "$HOST/logs/_search" $AUTH -H 'Content-Type: application/json' -d '{
  "query": {
    "bool": {
      "must":   [{"match":{"message":"timeout"}}],
      "filter": [{"term":{"level":"ERROR"}},
                 {"range":{"timestamp":{"gte":"now-1h"}}}]
    }
  },
  "sort": [{"timestamp":"desc"}],
  "size": 50
}'

# Index lifecycle (ISM) policy — auto-delete old indices
curl -X PUT "$HOST/_plugins/_ism/policies/logs-policy" $AUTH \\
  -H 'Content-Type: application/json' -d '{
    "policy": {
      "states": [{
        "name": "hot",
        "transitions": [{"state_name":"delete","conditions":{"min_index_age":"30d"}}]
      },{
        "name": "delete",
        "actions": [{"delete":{}}]
      }]
    }
  }'`)}
</div>
<div class="tut-section" id="os-vector">
${h2('os-vector','🤖','K-NN Vector Search')}
${cb('bash',`# Create k-NN enabled index
curl -X PUT "$HOST/products-semantic" $AUTH -H 'Content-Type: application/json' -d '{
  "settings": {"index": {"knn":true}},
  "mappings": {
    "properties": {
      "title":     {"type":"text"},
      "embedding": {
        "type":"knn_vector",
        "dimension":384,
        "method": {"engine":"faiss","name":"hnsw","space_type":"cosinesimil"}
      }
    }
  }
}'

# Search by vector (semantic similarity)
curl -X POST "$HOST/products-semantic/_search" $AUTH -H 'Content-Type: application/json' -d '{
  "query": {
    "knn": {
      "embedding": {
        "vector": [0.1, 0.2, 0.3],
        "k": 10
      }
    }
  }
}'

# Hybrid search — combine keyword + vector
{
  "query": {
    "hybrid": {
      "queries": [
        {"match": {"title": "laptop"}},
        {"knn":  {"embedding": {"vector":[0.1,0.2],"k":10}}}
      ]
    }
  }
}`)}
</div>
<div class="tut-section" id="os-k8s">
${h2('os-k8s','☸️','Kubernetes — OpenSearch Operator')}
${cb('bash',`helm repo add opensearch https://opensearch-project.github.io/helm-charts
helm install opensearch-operator opensearch/opensearch-operator \\
  -n opensearch --create-namespace`)}
${cb('yaml',`apiVersion: opensearch.opster.io/v1
kind: OpenSearchCluster
metadata:
  name: opensearch-cluster
  namespace: opensearch
spec:
  general:
    version: 2.12.0
    httpPort: 9200
  dashboards:
    enable: true
    replicas: 1
  nodePools:
    - component: masters
      replicas: 3
      roles: ["master"]
    - component: data
      replicas: 3
      roles: ["data","ingest"]
      resources:
        requests:
          memory: "4Gi"
          cpu: "1"
      persistence:
        pvc:
          accessModes: ["ReadWriteOnce"]
          storageClass: fast-ssd
          storage: "100Gi"`)}
</div>`
};

tutorials.dynamodb = {
name:'DynamoDB', icon:'⚙️', category:'keyvalue',
content:()=>`
${header('⚙️','Amazon DynamoDB','Serverless NoSQL key-value database. Single-digit ms latency at any scale. AWS-native.',['Key-Value','Serverless','AWS Managed','NoSQL'])}
${toc(['ddb-concepts','1. Core Concepts'],['ddb-setup','2. Setup'],['ddb-ops','3. Operations'],['ddb-design','4. Table Design'])}
<div class="tut-section" id="ddb-concepts">
${h2('ddb-concepts','🧠','Core Concepts')}
${table(['Concept','Description'],
[['Table','Top-level data container'],
['Item','Record — max 400KB. Equivalent to a row.'],
['Partition Key','Required. Determines the physical partition (node) for the item.'],
['Sort Key','Optional. Enables range queries within a partition.'],
['GSI','Global Secondary Index — query by non-primary-key attributes'],
['LSI','Local Secondary Index — alternate sort key, same partition key'],
['On-Demand','Pay per request — auto-scales to any load. Best for unpredictable traffic.'],
['Provisioned','Set RCU/WCU manually + auto-scaling. Better for predictable traffic.'],
['DynamoDB Streams','Change data capture — triggers Lambda on item changes']])}
</div>
<div class="tut-section" id="ddb-setup">
${h2('ddb-setup','⚙️','Local Development')}
${cb('bash',`# DynamoDB Local — no AWS account needed for dev
docker run -d --name dynamodb-local -p 8000:8000 amazon/dynamodb-local

# Configure AWS CLI for local endpoint
aws configure set aws_access_key_id local
aws configure set aws_secret_access_key local
aws configure set region ap-south-1

# Test
aws dynamodb list-tables --endpoint-url http://localhost:8000`)}
</div>
<div class="tut-section" id="ddb-ops">
${h2('ddb-ops','🗃️','Core Operations')}
${cb('bash',`# Create table (AWS or local)
ENDPOINT="--endpoint-url http://localhost:8000"   # remove for real AWS

aws dynamodb create-table $ENDPOINT \\
  --table-name Users \\
  --attribute-definitions \\
    AttributeName=userId,AttributeType=S \\
    AttributeName=email,AttributeType=S \\
  --key-schema AttributeName=userId,KeyType=HASH \\
  --global-secondary-indexes '[{
    "IndexName":"EmailIndex",
    "KeySchema":[{"AttributeName":"email","KeyType":"HASH"}],
    "Projection":{"ProjectionType":"ALL"}
  }]' \\
  --billing-mode PAY_PER_REQUEST

# Put item
aws dynamodb put-item $ENDPOINT --table-name Users --item '{
  "userId":{"S":"u1"},
  "email":{"S":"e@lab.com"},
  "name":{"S":"Eknatha"},
  "role":{"S":"admin"},
  "createdAt":{"S":"2025-05-08T10:00:00Z"}
}'

# Get item by primary key
aws dynamodb get-item $ENDPOINT --table-name Users \\
  --key '{"userId":{"S":"u1"}}'

# Query (requires partition key)
aws dynamodb query $ENDPOINT \\
  --table-name Orders \\
  --key-condition-expression "userId = :uid AND createdAt > :date" \\
  --expression-attribute-values '{":uid":{"S":"u1"},":date":{"S":"2025-01-01"}}'

# Update — atomic counter
aws dynamodb update-item $ENDPOINT \\
  --table-name Products \\
  --key '{"productId":{"S":"p1"}}' \\
  --update-expression "ADD stockCount :dec" \\
  --condition-expression "stockCount > :zero" \\
  --expression-attribute-values '{":dec":{"N":"-1"},":zero":{"N":"0"}}'

# Conditional put — prevent duplicate
aws dynamodb put-item $ENDPOINT \\
  --table-name Users \\
  --item '{"userId":{"S":"u2"},"email":{"S":"b@lab.com"}}' \\
  --condition-expression "attribute_not_exists(userId)"`)}
</div>
<div class="tut-section" id="ddb-design">
${h2('ddb-design','🎯','Single Table Design')}
${p('DynamoDB shines with Single Table Design — store all entity types in one table using PK/SK prefixes to separate entity types and enable access patterns.')}
${cb('bash',`# Entity type   PK                SK                 Data
# User profile:  USER#u1           PROFILE            {name, email, ...}
# User orders:   USER#u1           ORDER#2025-05-01   {total, status}
# Order items:   ORDER#o1          ITEM#i1            {product, qty, price}
# Product:       PRODUCT#p1        METADATA           {name, price, stock}

# Query: get user + all their orders in one request
aws dynamodb query $ENDPOINT \\
  --table-name MyApp \\
  --key-condition-expression "PK = :pk AND begins_with(SK, :sk)" \\
  --expression-attribute-values '{
    ":pk":{"S":"USER#u1"},
    ":sk":{"S":"ORDER#"}
  }'`)}
${ul('Design around your access patterns — DynamoDB has no ad-hoc queries','Use composite sort keys for range queries: <code>ORDER#2025-05-08#00001</code>','GSIs for querying by non-primary-key attributes — plan them upfront','Condition expressions for optimistic locking and idempotency','DynamoDB Streams + Lambda for event-driven architectures')}
</div>`
};

tutorials.sqlite = {
name:'SQLite', icon:'🪶', category:'relational',
content:()=>`
${header('🪶','SQLite','Serverless, zero-config embedded SQL. No server — just a file. The most deployed database in the world.',['Relational','ACID','Embedded','Zero Config'])}
${toc(['sq-overview','1. Overview'],['sq-ops','2. Core Operations'],['sq-perf','3. Performance Tuning'],['sq-usecases','4. Production Use Cases'])}
<div class="tut-section" id="sq-overview">
${h2('sq-overview','📖','Overview')}
${p('SQLite is a C library that implements a self-contained, serverless, zero-configuration SQL database. The entire database is a single cross-platform file. It is the most widely deployed database engine in the world — built into every Android device, iPhone, Mac, Windows 10, most web browsers, and hundreds of applications.')}
${table(['Feature','Details'],
[['File-based','Single .db file — copy it to back up the entire database'],
['Serverless','No daemon, no config, no installation — just import and use'],
['ACID','Full ACID compliance — WAL mode enables concurrent reads during writes'],
['Max DB size','281 TB theoretical'],
['Concurrent writes','One writer at a time (WAL mode allows concurrent reads during write'],
['Best for','Embedded apps, dev/test, edge computing, low-traffic websites']])}
</div>
<div class="tut-section" id="sq-ops">
${h2('sq-ops','🗃️','Core Operations')}
${cb('bash',`sudo apt install -y sqlite3
sqlite3 myapp.db      # create or open database

.databases            # show attached databases
.tables               # list all tables
.schema tablename     # show CREATE statement
.mode column          # tabular output
.headers on           # show column headers
.quit`)}
${cb('sql',`-- Always set these PRAGMAs for production use
PRAGMA journal_mode=WAL;         -- concurrent reads during writes
PRAGMA synchronous=NORMAL;       -- safe with WAL, much faster than FULL
PRAGMA foreign_keys=ON;          -- FK enforcement is OFF by default!
PRAGMA cache_size=-64000;        -- 64MB page cache
PRAGMA mmap_size=134217728;      -- 128MB memory-mapped I/O

-- Create table (STRICT mode — SQLite 3.37+)
CREATE TABLE users (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  email     TEXT UNIQUE NOT NULL,
  name      TEXT NOT NULL,
  created   TEXT DEFAULT (datetime('now'))
) STRICT;

-- JSON support (3.38+)
CREATE TABLE events (id INTEGER PRIMARY KEY, data TEXT CHECK(json_valid(data)));
INSERT INTO events (data) VALUES ('{"type":"login","ip":"1.2.3.4","user_id":42}');
SELECT json_extract(data,'$.type') AS type,
       json_extract(data,'$.user_id') AS user FROM events;

-- Full-text search (FTS5)
CREATE VIRTUAL TABLE articles_fts USING fts5(title, content, content=articles);
INSERT INTO articles_fts(rowid, title, content)
  SELECT id, title, content FROM articles;
SELECT * FROM articles_fts WHERE articles_fts MATCH 'kubernetes devops';

-- Window functions
SELECT name, salary,
  rank() OVER (PARTITION BY dept ORDER BY salary DESC) AS dept_rank
FROM employees;`)}
</div>
<div class="tut-section" id="sq-perf">
${h2('sq-perf','⚡','Performance Tuning')}
${ul('WAL mode is critical — enables concurrent reads while a write is in progress','Use transactions for batch inserts — 10K rows in a transaction is 100x faster than 10K individual inserts','Indexes work exactly as in other SQL databases — EXPLAIN QUERY PLAN to verify','<code>ANALYZE</code> periodically to update query planner statistics','Memory-mapped I/O (<code>mmap_size</code>) reduces syscalls for read-heavy workloads')}
${cb('sql',`-- Batch insert (transaction is critical for performance)
BEGIN TRANSACTION;
INSERT INTO logs VALUES (1,'event1','2025-05-08');
INSERT INTO logs VALUES (2,'event2','2025-05-08');
-- ... thousands more
COMMIT;

-- Explain query plan
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE user_id=1 AND status='paid';

-- Create covering index
CREATE INDEX idx_orders_user_status ON orders(user_id, status, created_at DESC);

-- Analyze statistics
ANALYZE;
SELECT * FROM sqlite_stat1;`)}
</div>
<div class="tut-section" id="sq-usecases">
${h2('sq-usecases','🚀','Production Use Cases')}
${ul('Edge computing — <strong>Litestream</strong> continuously replicates SQLite to S3 for disaster recovery','Multi-region read replicas — <strong>LiteFS</strong> distributes SQLite across Kubernetes pods via FUSE','Application file format — store structured app config/data alongside the binary','Serverless functions — SQLite embedded in Lambda/Cloud Functions for fast local queries','Test environments — replace PostgreSQL/MySQL with SQLite for unit tests with zero setup','Low-traffic websites — SQLite handles thousands of requests/day easily on a VPS')}
${tip('<strong>Litestream</strong> (open source) streams SQLite WAL changes to S3/GCS/Azure Blob in real-time — giving you sub-second RPO with zero operational overhead. Excellent for production SQLite deployments.')}
</div>`
};

tutorials.mariadb = {
name:'MariaDB', icon:'🦭', category:'relational',
content:()=>`
${header('🦭','MariaDB','MySQL fork with Galera Cluster for synchronous multi-master replication, enhanced performance, and open governance.',['Relational','ACID','Open Source','K8s Ready'])}
${toc(['ma-overview','1. Overview'],['ma-install','2. Installation'],['ma-galera','3. Galera Cluster'],['ma-ops','4. Core Operations'],['ma-k8s','5. Kubernetes'])}
<div class="tut-section" id="ma-overview">
${h2('ma-overview','📖','Overview')}
${p('MariaDB is a community-developed fork of MySQL created in 2009 by MySQL founder Monty Widenius after Oracle acquired MySQL. It is a drop-in replacement for MySQL with additional features unavailable in MySQL Community edition.')}
${table(['Feature','MariaDB','MySQL'],
[['Multi-master HA','Galera Cluster (built-in)','Group Replication (added in 8.0)'],
['Temporal Tables','System-versioned tables (built-in)','Not native'],
['Storage Engines','Aria, ColumnStore, Spider, Connect','InnoDB, MyRocks (limited)'],
['License','GPL v2 (fully open)','GPL v2 (Oracle controlled)'],
['JSON performance','Comparable to MySQL 8','Optimized in MySQL 8'],
['Wire protocol','MySQL protocol compatible','N/A']])}
</div>
<div class="tut-section" id="ma-install">
${h2('ma-install','⚙️','Installation')}
${cb('bash',`# Ubuntu
sudo apt install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mysql_secure_installation

# Docker
docker run -d --name mariadb \\
  -e MARIADB_ROOT_PASSWORD=rootpass \\
  -e MARIADB_DATABASE=mydb \\
  -e MARIADB_USER=myuser \\
  -e MARIADB_PASSWORD=mypass \\
  -p 3306:3306 -v mariadb-data:/var/lib/mysql \\
  mariadb:11.2

# Connect
mysql -u myuser -p mydb`)}
</div>
<div class="tut-section" id="ma-galera">
${h2('ma-galera','🌐','Galera Cluster — Synchronous Multi-Master')}
${p('Galera Cluster provides synchronous multi-master replication — every write is committed on ALL nodes simultaneously. Any node can accept writes, and reads are always up-to-date.')}
${cb('bash',`# /etc/mysql/mariadb.conf.d/galera.cnf (all nodes)
[mysqld]
binlog_format=ROW
default-storage-engine=innodb
innodb_autoinc_lock_mode=2
bind-address=0.0.0.0

wsrep_on=ON
wsrep_provider=/usr/lib/galera/libgalera_smm.so
wsrep_cluster_name="prod_cluster"
wsrep_cluster_address="gcomm://192.168.1.10,192.168.1.11,192.168.1.12"
wsrep_sst_method=rsync
wsrep_node_address="192.168.1.10"   # change per node

# Bootstrap FIRST node only
sudo galera_new_cluster

# Start remaining nodes normally
sudo systemctl start mariadb`)}
${cb('sql',`-- Verify cluster health
SHOW STATUS LIKE 'wsrep_cluster_size';       -- should be 3
SHOW STATUS LIKE 'wsrep_local_state_comment'; -- should be "Synced"
SHOW STATUS LIKE 'wsrep_ready';              -- should be ON
SHOW STATUS LIKE 'wsrep_flow_control_paused'; -- should be ~0`)}
</div>
<div class="tut-section" id="ma-ops">
${h2('ma-ops','🗃️','Core Operations')}
${cb('sql',`-- System-versioned (temporal) tables — track all history
CREATE TABLE employees (
  id   INT PRIMARY KEY,
  name VARCHAR(100),
  salary DECIMAL(10,2)
) WITH SYSTEM VERSIONING;

-- Query as of a past time
SELECT * FROM employees FOR SYSTEM_TIME AS OF '2024-01-01 00:00:00';

-- Query all history for a row
SELECT *, ROW_START, ROW_END FROM employees
FOR SYSTEM_TIME ALL WHERE id = 42;

-- Spider storage engine — horizontal sharding
CREATE TABLE shard1 ENGINE=Spider
  CONNECTION='host "node1", port "3306", database "mydb", table "orders"';`)}
</div>
<div class="tut-section" id="ma-k8s">
${h2('ma-k8s','☸️','Kubernetes')}
${cb('bash',`# MariaDB Operator
helm repo add mariadb-operator https://helm.mariadb.com/mariadb-operator
helm install mariadb-operator mariadb-operator/mariadb-operator \\
  -n databases --create-namespace`)}
${cb('yaml',`apiVersion: k8s.mariadb.com/v1alpha1
kind: MariaDB
metadata:
  name: mariadb-galera
  namespace: databases
spec:
  rootPasswordSecretKeyRef:
    name: mariadb-secret
    key: root-password
  image: mariadb:11.2
  replicas: 3
  galera:
    enabled: true
  storage:
    size: 20Gi
    storageClassName: fast-ssd
  resources:
    requests:
      cpu: "1"
      memory: 2Gi`)}
</div>`
};

