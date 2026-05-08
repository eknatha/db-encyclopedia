# 🗄️ DB Encyclopedia — db.eknathalabs.com

> **The complete database reference for DevOps & Platform Engineers.**
> Every database. Every pattern. Every command. Every tool. Fully offline. Single file.

[![Live](https://img.shields.io/badge/Live-db.eknathalabs.com-4f8ef7?style=flat-square&logo=github)](https://db.eknathalabs.com)
[![EknathaLabs](https://img.shields.io/badge/EknathaLabs-Ecosystem-00d4aa?style=flat-square)](https://eknathalabs.com)
[![Offline Ready](https://img.shields.io/badge/Offline-Ready-brightgreen?style=flat-square)](#offline-mode)
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-orange?style=flat-square)](#tech-stack)
[![Databases](https://img.shields.io/badge/Databases-40%2B-purple?style=flat-square)](#database-coverage)
[![Tutorials](https://img.shields.io/badge/Tutorials-16-blue?style=flat-square)](#11--full-tutorials-16-databases)
[![Tools](https://img.shields.io/badge/Tools-12%20Live-brightgreen?style=flat-square)](#10--db-tools-directory-12-fully-functional)
[![Quiz](https://img.shields.io/badge/Quiz-32%20Questions-yellow?style=flat-square)](#14--db-knowledge-quiz-32-questions)
[![Glossary](https://img.shields.io/badge/Glossary-73%20Terms-red?style=flat-square)](#13--glossary-73-terms)

---

## 📖 What is this?

**DB Encyclopedia** is a single-file HTML reference platform covering 40+ databases across 8 categories. Built for DevOps Engineers, Platform Engineers, and SREs who need fast, reliable database knowledge — online or offline.

No frameworks. No backend. No internet required after first load. Just open the file.

---

## ✨ Features at a Glance

| Section | Description |
|---|---|
| 🌐 Database Universe | Visual category map — click to filter 40+ databases |
| 📚 Encyclopedia | Expandable cards with full profiles for every database |
| 📊 Comparison Matrix | Sortable feature comparison across 11 key databases |
| ⚡ Decision Wizard | 5-step quiz → database recommendation with reasoning |
| ☁️ Cloud Services Map | AWS vs Azure vs GCP side-by-side service mapping |
| ☸️ K8s Operators | 9 operator deep-dives with production manifests |
| 📋 Cheatsheets | Copy-ready commands for 5 databases |
| 🛤️ Learning Paths | 4 structured paths from beginner to cloud expert |
| 🤖 Offline DB Advisor | Rule-based recommender — no internet needed |
| 🛠️ **12 Live Tools** | Fully functional interactive tools — all offline |
| 📖 16 Full Tutorials | Complete guides with K8s deployment for every DB |
| 🔍 Query Explainer | Paste SQL → plain-English clause breakdown + index tips |
| 📖 Glossary | 73 searchable database terms |
| 🧠 Quiz | 32 questions across 5 categories with explanations |
| 📅 Daily Challenge | Daily DB problem with hints, solutions, streak tracking |
| 🗂️ Data Type Picker | Right column type across 5 databases for 16 data types |

---

## 🛠️ DB Tools Directory — 12 Fully Functional

All tools open in a modal, work completely offline, and produce copy-ready output.

### 1. 🔧 PG Config Tuner
Input your server RAM, CPU cores, storage type, and workload → generates a complete, optimised `postgresql.conf` with calculated values for shared_buffers, work_mem, WAL settings, checkpoint tuning, parallelism, I/O, and logging.

### 2. 🐌 Slow Query Analyzer
Paste any `EXPLAIN ANALYZE` output → detects sequential scans, large filter removals, hash join disk batches, nested loop explosions → generates `CREATE INDEX CONCURRENTLY` statements and actionable next steps.

### 3. 🔌 Connection Pool Sizer
Input app servers × threads × avg query duration × target RPS → calculates recommended pool size → generates complete configuration for PgBouncer (`pgbouncer.ini`), ProxySQL, or RDS Proxy (Terraform snippet).

### 4. 🔄 DB Migration Planner
Select source and target database → step-by-step migration checklist with recommended tools, common gotchas, type mapping notes, and quick-start commands. Covers:

| Migration | Difficulty |
|---|---|
| MySQL → PostgreSQL | Medium |
| PostgreSQL → MySQL | Medium |
| MongoDB → PostgreSQL | Hard |
| SQLite → PostgreSQL | Easy |
| Oracle → PostgreSQL | Hard |
| Any → Any (generic) | Medium |

### 5. 📡 Replication Explainer
Choose database and replication mode (Async / Sync / Semi-Sync) → shows RPO, RTO, lag metric, how the mechanism works, setup commands, and critical gotchas. Covers PostgreSQL, MySQL, MongoDB, Redis, and Cassandra.

### 6. 📇 Index Strategy Advisor
Pick database, query pattern, table name, and columns → generates the exact `CREATE INDEX` DDL with explanation of why this index type, when to use it, and performance characteristics. Covers 9 patterns (equality, range, composite, full-text, JSON, array, unique, partial, covering) across PostgreSQL, MySQL, and MongoDB.

### 7. 🔐 DB Security Checklist
Interactive hardening checklist for PostgreSQL, MySQL, MongoDB, and Redis. Check off items as you secure each database — progress bar and completion state saved in `localStorage`. Survives page refreshes.

| Database | Items |
|---|---|
| PostgreSQL | 14 hardening steps |
| MySQL | 12 hardening steps |
| MongoDB | 11 hardening steps |
| Redis | 10 hardening steps |

### 8. 💾 Backup Strategy Guide
Pick database and RPO target → shows recommended backup tool, RTO estimate, complete backup commands, and key operational notes. Covers:

| RPO | PostgreSQL | MySQL | MongoDB | Redis |
|---|---|---|---|---|
| Zero | pgBackRest + sync replication | Galera + XtraBackup | Atlas continuous | AOF always |
| Minutes | pgBackRest WAL archiving | XtraBackup + binlog | mongodump --oplog | AOF everysec |
| Hours | pg_dump hourly | mysqldump hourly | mongodump hourly | RDB snapshots |
| Daily | pg_dumpall daily | mysqldump daily | mongodump daily | RDB daily |

### 9. ⚡ Cache Layer Picker
Select your use case → Redis vs Memcached vs DragonflyDB recommendation with working commands. Covers 8 patterns:

- Simple Cache, Session Store, Job Queue, Pub/Sub
- Leaderboard, Rate Limiting, Distributed Lock, Time Series

### 10. 💰 Cloud DB Cost Calculator
Select engine, cloud provider, instance size, storage, and replica count → monthly and annual cost breakdown + side-by-side comparison of managed vs Aurora/AlloyDB/Flex vs self-managed. Covers AWS, GCP, and Azure.

### 11. ☸️ DB Ops K8s Guide
Pick a database → complete operator install command + production-ready Custom Resource YAML manifest + verification commands. Covers:

| Database | Operator |
|---|---|
| PostgreSQL | CloudNativePG |
| MySQL | Percona Operator |
| MongoDB | MongoDB Community Operator |
| Redis | Bitnami Redis + Sentinel |
| Cassandra | K8ssandra Operator |
| Elasticsearch | ECK (Elastic Cloud on K8s) |

### 12. 🔁 SQL to NoSQL Mapper
Pick target database and SQL concept → side-by-side SQL vs NoSQL equivalent with explanation. Covers MongoDB, Cassandra, DynamoDB, and Redis across 9 SQL concepts:

- Table/Schema, SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, Index, Transaction

---

## 📖 Full Tutorials — 16 Databases

Complete step-by-step guides: install → config → core operations → K8s deployment → monitoring → troubleshooting.

| Database | Category | Tutorial Highlights |
|---|---|---|
| **PostgreSQL** | Relational | MVCC, RLS, streaming replication, pgBackRest PITR, CloudNativePG, pg_stat_statements |
| **MySQL** | Relational | GTID replication, XtraBackup, Percona Operator, Performance Schema |
| **MariaDB** | Relational | Galera Cluster multi-master setup and status verification |
| **SQLite** | Embedded | WAL mode, FTS5, JSON support, Litestream for production |
| **MongoDB** | Document | Aggregation pipeline, sharding, replica sets, Community Operator |
| **Redis** | Key-Value | All 5 data types, cache-aside, rate limiting, distributed lock, Sentinel, Cluster |
| **DynamoDB** | Key-Value | Single Table Design, conditional writes, atomic counters, DynamoDB Local |
| **Cassandra** | Wide-Column | One-table-per-query design, nodetool operations, K8ssandra Operator |
| **ClickHouse** | OLAP | MergeTree engines, materialized views, Altinity Operator |
| **TimescaleDB** | Time Series | Hypertables, continuous aggregates, 90% compression, retention policies |
| **InfluxDB** | Time Series | Line Protocol, Flux queries, tasks, retention buckets |
| **VictoriaMetrics** | Time Series | Prometheus remote_write, MetricsQL extensions, VMCluster Operator |
| **Elasticsearch** | Search | Query DSL, k-NN vector search, aggregations, ECK |
| **OpenSearch** | Search | Hybrid search, ISM policies, k-NN, OpenSearch Operator |
| **Neo4j** | Graph | Cypher, fraud detection, recommendations, access control patterns |
| **CockroachDB** | NewSQL | Raft consensus, geo-partitioning, follower reads, CockroachDB Operator |

---

## 🔍 Query Explainer

Paste any SQL query → instant plain-English breakdown of every clause:

- **Clause analysis** — SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, CTEs, window functions
- **Performance warnings** — leading `%` wildcards, `SELECT *`, missing LIMIT, OR conditions, functions on indexed columns
- **Performance checklist** — pass/warn/fail for each detected pattern
- **Index suggestions** — `CREATE INDEX CONCURRENTLY` statements based on WHERE and ORDER BY columns
- **5 preset examples** — Simple SELECT, JOIN query, Window function, CTE, Subquery

---

## 📖 Glossary — 73 Terms

Searchable database terminology across 6 categories:

| Category | Sample Terms |
|---|---|
| Core Concepts | ACID, BASE, CAP Theorem, MVCC, Transaction, Deadlock, Normalization, DDL/DML, CRUD |
| Storage & I/O | WAL, Checkpoint, Shared Buffers, InnoDB, SSTable, LSM Tree, B-tree, GIN, VACUUM, Bloom Filter |
| Replication & HA | Streaming Replication, Replication Slot, Failover, Split Brain, Raft, Patroni, CDC, PITR, Galera |
| Performance | Query Plan, EXPLAIN, Sequential Scan, Connection Pooling, PgBouncer, N+1 Problem, Cache Hit Rate |
| K8s & Cloud | StatefulSet, PVC, Operator, CRD, CloudNativePG, StorageClass, Sidecar |
| NoSQL | Sharding, Shard Key, Consistent Hashing, Eventual Consistency, HNSW, Embedding, Vector Database |

Each term includes a plain-English definition and clickable "See also" links.

---

## 🧠 DB Knowledge Quiz — 32 Questions

Scored, categorized quiz with instant feedback and detailed explanations per question.

| Category | Questions | Sample Topics |
|---|---|---|
| SQL & Relational | 8 | Isolation levels, MVCC, VACUUM, composite indexes, N+1 problem |
| NoSQL | 6 | CAP theorem, MongoDB embedding, shard keys, DynamoDB Single Table Design |
| Performance | 5 | EXPLAIN ANALYZE, connection pooling, cache hit ratio |
| K8s & Operators | 5 | StatefulSets vs Deployments, CloudNativePG, StorageClass, PodDisruptionBudget |
| Replication & HA | 6 | Sync vs async, split brain, Patroni, PITR, Galera Cluster |

Grade scale: 🏆 Expert (≥90%) · ⭐ Advanced (≥75%) · 📚 Intermediate (≥60%) · 🌱 Keep Learning

---

## 📅 Daily DB Challenge

One real-world challenge every day with streak tracking saved in `localStorage`.

| Challenge | Database | Difficulty |
|---|---|---|
| Top 5 customers by total order value | PostgreSQL | Medium |
| Redis caching strategy design | Redis | Medium |
| Diagnose 45-second replication lag | PostgreSQL | Hard |
| MongoDB schema for multi-tenant SaaS | MongoDB | Hard |
| CloudNativePG cluster manifest | Kubernetes | Hard |
| Optimize slow TimescaleDB query | TimescaleDB | Medium |
| Cassandra schema for messaging app | Cassandra | Hard |
| Atomic sliding window rate limiter (Lua) | Redis | Medium |

Each challenge includes a hint, full solution with working code, and a detailed explanation.

---

## 🗂️ Data Type Picker — 16 Data Types

Pick what you need to store → get the right column type for PostgreSQL, MySQL, MongoDB, Cassandra, and DynamoDB with sample DDL, caveats, and best practices.

| Data Type | Key Insight |
|---|---|
| Email | TEXT + LOWER() normalization + UNIQUE index |
| Price / Money | NUMERIC(19,4) — NEVER FLOAT. Or store as integer cents. |
| UUID / ID | UUID v7 > UUID v4 for B-tree index locality |
| Timestamp | ALWAYS TIMESTAMPTZ in PostgreSQL. DATETIME in MySQL (2038 bug). |
| Boolean | NOT NULL DEFAULT FALSE. Partial index WHERE is_deleted = FALSE. |
| JSON / Config | JSONB in PostgreSQL with GIN index — never plain JSON |
| IP Address | INET type in PostgreSQL. VARBINARY(16) in MySQL. |
| URL | TEXT — no reliable maximum length |
| Image / File | NEVER store in DB. S3 key as TEXT, serve via CDN. |
| Lat / Lng | PostGIS GEOGRAPHY. GeoJSON uses [lng, lat] — common bug. |
| Phone Number | E.164 format. Use libphonenumber, not regex. |
| Counter / Score | Atomic UPDATE. COUNTER type in Cassandra. |
| ML Vector / Embedding | pgvector + HNSW index. NEVER store in DynamoDB/MySQL. |
| Enum / Status | TEXT + CHECK in PostgreSQL (not ENUM type — hard to alter). |
| Full-Text Content | tsvector + GIN in PostgreSQL. ES/OpenSearch for complex needs. |
| Tags / Array | TEXT[] + GIN in PostgreSQL. Multikey index in MongoDB. |

---

## 🗂️ Database Coverage

| Category | Databases |
|---|---|
| **Relational** | PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, Oracle DB |
| **Document** | MongoDB, Couchbase, Firestore |
| **Key-Value** | Redis, Memcached, DynamoDB, etcd |
| **Wide-Column / OLAP** | Apache Cassandra, HBase, ClickHouse |
| **Graph** | Neo4j, Amazon Neptune |
| **Time Series** | InfluxDB, TimescaleDB, VictoriaMetrics |
| **NewSQL / Distributed** | CockroachDB, TiDB, YugabyteDB, Cloud Spanner |
| **Search** | Elasticsearch, OpenSearch |

---

## 📊 By the Numbers

| Metric | Value |
|---|---|
| File size | ~524 KB |
| Lines of code | ~8,600 |
| Databases covered | 40+ |
| Database categories | 8 |
| Fully functional tools | 12 |
| Full tutorials | 16 |
| Tutorial sections per database | 6–12 |
| Glossary terms | 73 |
| Quiz questions | 32 |
| Daily challenges | 8 (rotating daily) |
| Data type profiles | 16 |
| K8s operators covered | 9 |
| Cloud service mappings | 30+ |
| Cheatsheet commands | 100+ |
| External dependencies | 0 |

---

## 🔌 Offline Mode

Everything works without an internet connection after first load:

| Component | Status |
|---|---|
| External CDN / fonts | ✅ Zero — system font stack |
| API calls at runtime | ✅ None — all engines built-in |
| Service Worker caching | ✅ Inline Service Worker |
| Online/Offline badge | ✅ Live indicator in nav |
| All 40+ database profiles | ✅ Embedded in JS |
| All 16 tutorials | ✅ Embedded in JS |
| All 12 tools | ✅ Fully functional offline |
| Glossary, Quiz, Challenges | ✅ Embedded in JS |
| Security checklist progress | ✅ localStorage |
| Daily challenge streak | ✅ localStorage |

---

## 🏗️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | None | Zero dependencies, instant load |
| Styling | Vanilla CSS + CSS Variables | Full control, no build step |
| JavaScript | Vanilla ES6+ | No bundler, no npm |
| Fonts | System font stack | Offline safe |
| Hosting | GitHub Pages | Free, fast, custom domain |
| Persistence | localStorage | Streak/checklist without a server |
| Format | Single `.html` file | Deploy anywhere, share as a file |

---

## 🌐 EknathaLabs Ecosystem

| Tool | URL |
|---|---|
| 🏠 Main Hub | [eknathalabs.com](https://eknathalabs.com) |
| 🗄️ **DB Encyclopedia** | [db.eknathalabs.com](https://db.eknathalabs.com) |
| ☸️ KubeLab | [kubelab.eknathalabs.com](https://kubelab.eknathalabs.com) |
| 🏗️ Terraform Lab | [terraform.eknathalabs.com](https://terraform.eknathalabs.com) |
| 🐧 Linux Lab | [linux.eknathalabs.com](https://linux.eknathalabs.com) |
| 🐳 Docker Lab | [docker.eknathalabs.com](https://docker.eknathalabs.com) |
| 🔄 CI/CD Lab | [cicd.eknathalabs.com](https://cicd.eknathalabs.com) |
| 🎲 Chaos Lab | [chaoslab.eknathalabs.com](https://chaoslab.eknathalabs.com) |
| 📝 Interview Prep | [interview-prep.eknathalabs.com](https://interview-prep.eknathalabs.com) |
| 📊 Resumelytics | [resumelytics.eknathalabs.com](https://resumelytics.eknathalabs.com) |
| 🔍 GitHub Analyzer | [github-profile-analyzer.eknathalabs.com](https://github-profile-analyzer.eknathalabs.com) |
| 💻 Linux Explainer | [linux-command-explainer.eknathalabs.com](https://linux-command-explainer.eknathalabs.com) |
| 🏛️ Architecture Lab | [arch.eknathalabs.com](https://arch.eknathalabs.com) |
| 📖 Blog | [blog.eknathalabs.com](https://blog.eknathalabs.com) |
| 🎓 Learn | [learn.eknathalabs.com](https://learn.eknathalabs.com) |

---

## 🗺️ Roadmap

### Planned Features
- [ ] Connection String Builder — all databases × all languages (Python, Node, Go, Java, PHP)
- [ ] EXPLAIN Query Visualizer — PostgreSQL query plan as interactive visual tree
- [ ] Index Advisor — paste slow query + schema → get index recommendations
- [ ] CAP Theorem Interactive Map — visual placement of all 40+ databases
- [ ] Schema Designer — drag-and-drop ERD builder with SQL DDL export
- [ ] DB Cost Calculator expansion — reserved instance savings, spot pricing
- [ ] Error Code Library — PostgreSQL + MySQL error codes with plain-English fixes
- [ ] Migration Guides — step-by-step from self-hosted → RDS, MySQL → PostgreSQL

### Planned Tutorials
- [ ] YugabyteDB, TiDB (HTAP), HBase, Firestore, etcd, pgvector

### Planned Daily Challenges
- [ ] PostgreSQL audit logging with triggers
- [ ] Cassandra schema for a ride-sharing app
- [ ] ClickHouse materialized view optimization
- [ ] Redis-backed distributed job queue

---

## 🤝 Contributing

1. Fork the repository
2. Edit `index.html` directly
3. Test locally: `python3 -m http.server 8080`
4. Open a Pull Request

**Guidelines:**
- Verify technical content against official documentation
- Test all commands on the stated OS/version
- Validate K8s manifests against current operator versions
- Do not add external CDN links, fonts, or API calls
- Double-escape backslash commands in JS template literals (`\\x`, `\\G`, `\\l`, `\\c` etc.)
- Test that `</script>` does not appear inside JavaScript string literals — it terminates the script block

---

## 👤 Author

**Eknatha Reddy Puli** — Platform Engineer & DevOps Practitioner

- 🌐 [eknathalabs.com](https://eknathalabs.com)
- 💼 [LinkedIn](https://linkedin.com/in/eknathareddyp)
- 🐙 [GitHub](https://github.com/eknatha)
- ✍️ [Blog](https://blog.eknathalabs.com)


---

## 📄 License

MIT License — free to use, share, and modify. Attribution appreciated.

---

<div align="center">

**Built with ♥ as part of the EknathaLabs open DevOps , SRE & Platform learning platform**

[db.eknathalabs.com](https://db.eknathalabs.com) &nbsp;•&nbsp; [eknathalabs.com](https://eknathalabs.com) &nbsp;•&nbsp; [github.com/eknatha](https://github.com/eknatha)

</div>
