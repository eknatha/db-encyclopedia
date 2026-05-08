# 🗄️ DB Encyclopedia — db.eknathalabs.com

> **The complete database reference for DevOps, SRE & Platform Engineers.**
> Every database. Every pattern. Every command. Fully offline. Single file.

[![Live](https://img.shields.io/badge/Live-db.eknathalabs.com-4f8ef7?style=flat-square&logo=github)](https://db.eknathalabs.com)
[![EknathaLabs](https://img.shields.io/badge/EknathaLabs-Ecosystem-00d4aa?style=flat-square)](https://eknathalabs.com)
[![Offline Ready](https://img.shields.io/badge/Offline-Ready-brightgreen?style=flat-square)](#offline-mode)
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-orange?style=flat-square)](#tech-stack)
[![Databases](https://img.shields.io/badge/Databases-40%2B-purple?style=flat-square)](#database-coverage)
[![Tutorials](https://img.shields.io/badge/Tutorials-16-blue?style=flat-square)](#11--full-tutorials-16-databases)
[![Quiz](https://img.shields.io/badge/Quiz-32%20Questions-yellow?style=flat-square)](#14--db-knowledge-quiz-32-questions)
[![Glossary](https://img.shields.io/badge/Glossary-73%20Terms-red?style=flat-square)](#13--glossary-73-terms)

---

## 📖 What is this?

**DB Encyclopedia** is a  reference platform covering 40+ databases across 8 categories. Built for DevOps Engineers, Platform Engineers, and SREs who need fast, reliable database knowledge — online or offline.

---

## ✨ Features

### 01 — 🌐 Database Universe
Visual category map of 8 database families. Click any category to instantly filter the encyclopedia — Relational, Document, Key-Value, Wide-Column, Graph, Time Series, NewSQL, and Search Engines.

### 02 — 📚 Encyclopedia (40+ Databases)
Expandable profile cards for every major database with type, license, ACID compliance, horizontal scaling, Kubernetes operator availability, cloud managed service options, use cases, and protocols. Live search and tag filters (ACID, Cloud Native, Popular, K8s Operator, Open Source).

### 03 — 📊 Comparison Matrix
Sortable, filterable feature comparison across 11 key databases — ACID, H-Scale, K8s Operator, Cloud Managed, Open Source. Filter by Relational, NoSQL, or Cloud.

### 04 — ⚡ Decision Wizard
5-step interactive quiz recommending the right database for your use case with clear reasoning. Covers PostgreSQL, MongoDB, Redis, Cassandra, ClickHouse, Neo4j, Firestore, DynamoDB, CockroachDB, Elasticsearch, and more.

### 05 — ☁️ Cloud Services Map
AWS vs Azure vs GCP side-by-side managed database service mapping across Relational, NoSQL, Key-Value, Analytics, Time Series, Graph, and Search categories.

### 06 — ☸️ Databases on Kubernetes
9 operator deep-dives with production-ready manifests:

| Database | Operator |
|---|---|
| PostgreSQL | CloudNativePG |
| MySQL | Percona Operator |
| MongoDB | MongoDB Community Operator |
| Redis | Spotahome Redis Operator |
| Cassandra | K8ssandra Operator |
| ClickHouse | Altinity Operator |
| Elasticsearch | ECK (Elastic Cloud on K8s) |
| CockroachDB | CockroachDB Operator |
| Backup | Velero + DB hooks |

### 07 — 📋 Command Cheatsheets
Copy-ready command reference with syntax highlighting for PostgreSQL, MySQL, MongoDB, Redis, and Cassandra.

### 08 — 🛤️ Learning Paths
4 structured paths from zero to production-ready:

| Path | Level | Focus |
|---|---|---|
| DB Fundamentals for DevOps | 🌱 Beginner | ACID, SQL vs NoSQL, indexes, backup basics |
| PostgreSQL for Production | 🔧 Intermediate | Tuning, replication, Patroni HA, pgBackRest |
| Databases on Kubernetes | ☸️ Advanced | StatefulSets, operators, Velero, Prometheus |
| Cloud Database Operations | ☁️ Cloud Expert | RDS, Aurora, Terraform, DynamoDB, cost optimization |

### 09 — 🤖 Offline DB Advisor
Built-in rule-based recommendation engine — **no internet required**. Covers 11 use case categories including e-commerce, IoT, caching, analytics, multi-tenant SaaS, mobile, Kubernetes-native, financial, and AI/ML/Vector workloads.

### 10 — 🛠️ Tools Directory
Links to all specialist DB sub-tools in the EknathaLabs ecosystem.

### 11 — 📖 Full Tutorials (16 Databases)
Complete step-by-step guides covering install → config → core operations → K8s deployment → monitoring → troubleshooting:

| Database | Category | Key Topics |
|---|---|---|
| **PostgreSQL** | Relational | MVCC, RLS, streaming replication, pgBackRest PITR, CloudNativePG, pg_stat_statements |
| **MySQL** | Relational | GTID replication, XtraBackup, Percona Operator, Performance Schema |
| **MariaDB** | Relational | Galera Cluster multi-master setup and verification |
| **SQLite** | Embedded | WAL mode, FTS5, JSON, Litestream for production |
| **MongoDB** | Document | Aggregation pipeline, sharding, replica sets, Community Operator |
| **Redis** | Key-Value | All 5 data types, cache-aside, rate limiting, distributed lock, Sentinel, Cluster |
| **DynamoDB** | Key-Value | Single Table Design, conditional writes, atomic counters, local dev |
| **Cassandra** | Wide-Column | Data modeling rules (one table per query), nodetool ops, K8ssandra Operator |
| **ClickHouse** | OLAP | MergeTree engines, materialized views, Altinity Operator |
| **TimescaleDB** | Time Series | Hypertables, continuous aggregates, 90% compression, retention policies |
| **InfluxDB** | Time Series | Line Protocol, Flux queries, tasks, retention |
| **VictoriaMetrics** | Time Series | Prometheus remote_write, MetricsQL, VMCluster Operator |
| **Elasticsearch** | Search | Query DSL, k-NN vector search, aggregations, ECK |
| **OpenSearch** | Search | Hybrid search, ISM policies, k-NN, OpenSearch Operator |
| **Neo4j** | Graph | Cypher, fraud detection, recommendations, access control patterns |
| **CockroachDB** | NewSQL | Raft consensus, geo-partitioning, follower reads, CockroachDB Operator |

### 12 — 🔍 Query Explainer
Paste any SQL query and get an instant plain-English breakdown of every clause with performance warnings, a checklist, and suggested indexes. Covers SELECT, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, CTEs, and window functions. 5 preset examples to try instantly.

### 13 — 📖 Glossary (73 Terms)
Searchable database terminology across 6 categories:

| Category | Sample Terms |
|---|---|
| Core Concepts | ACID, BASE, CAP Theorem, MVCC, Transaction, Deadlock, Normalization |
| Storage & I/O | WAL, Checkpoint, Shared Buffers, InnoDB, SSTable, LSM Tree, B-tree, GIN, VACUUM, Bloom Filter |
| Replication & HA | Streaming Replication, Replication Slot, Failover, Split Brain, Raft, Patroni, CDC, PITR, Galera |
| Performance | Query Plan, EXPLAIN, Sequential Scan, Connection Pooling, PgBouncer, N+1 Problem, Cache Hit Rate |
| K8s & Cloud | StatefulSet, PVC, Operator, CRD, CloudNativePG, StorageClass, Sidecar |
| NoSQL | Sharding, Shard Key, Consistent Hashing, Eventual Consistency, HNSW, Embedding, Vector Database |

Each term includes a definition and clickable "See also" links to related terms.

### 14 — 🧠 DB Knowledge Quiz (32 Questions)
Scored, categorized quiz with instant feedback and detailed explanations:

| Category | Questions |
|---|---|
| SQL & Relational | 8 — isolation levels, MVCC, VACUUM, composite indexes, N+1 |
| NoSQL | 6 — CAP theorem, MongoDB embedding, shard keys, DynamoDB Single Table Design |
| Performance | 5 — EXPLAIN ANALYZE, connection pooling, cache hit ratio, slow queries |
| K8s & Operators | 5 — StatefulSets, CloudNativePG, Operators, StorageClass, PodDisruptionBudget |
| Replication & HA | 6 — sync vs async, split brain, Patroni, PITR, Galera |

Grade scale: 🏆 Expert (≥90%) • ⭐ Advanced (≥75%) • 📚 Intermediate (≥60%) • 🌱 Keep Learning

### 15 — 📅 Daily DB Challenge
One real-world challenge every day with streak tracking:

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

Each challenge includes a hint, full solution with working code, and a detailed explanation. Streak and history saved in localStorage — no server required.

---

## 🗂️ Database Coverage

| Category | Databases Covered |
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

## 🚀 Quick Start

Everything works without an internet connection after the first load:

| Component | Status |
|---|---|
| External CDN dependencies | ✅ Zero |
| Google Fonts | ✅ Replaced with system font stack |
| API calls at runtime | ✅ None — DB Advisor uses built-in rule engine |
| Service Worker | ✅ Inline Service Worker for page caching |
| Online/Offline badge | ✅ Live indicator in nav bar |
| All database profiles, tutorials, glossary, quiz, challenges | ✅ All embedded in JavaScript |
| Daily challenge streak tracking | ✅ localStorage — no server needed |

---

## 🏗️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | None | Zero dependencies, instant load |
| Styling | Vanilla CSS + CSS Variables | Full control, no build step |
| JavaScript | Vanilla ES6+ | No bundler, no npm, no node_modules |
| Fonts | System font stack | Offline safe — Segoe UI, SF Pro, Consolas |
| Hosting | GitHub Pages | Free, fast, custom domain support |
| Persistence | localStorage | Streak/history tracking without a server |
| Format | Single `.html` file | Deploy anywhere, share as a file |

---

## 📁 Repository Structure

```
db-encyclopedia/
│
├── index.html      # The entire application — ~330KB, ~6,200 lines
└── README.md       # This file
```

One file. The entire platform. No build step. No dependencies.

---

## 📊 By the Numbers

| Metric | Value |
|---|---|
| File size | ~330 KB |
| Lines of code | ~6,200 |
| Databases covered | 40+ |
| Database categories | 8 |
| Full tutorials | 16 |
| Tutorial sections per database | 6–12 |
| Glossary terms | 73 |
| Quiz questions | 32 |
| Daily challenges | 8 (rotating daily) |
| K8s operators covered | 9 |
| Cloud service mappings | 30+ |
| Cheatsheet commands | 100+ |
| External dependencies | 0 |

---

## 🌐 EknathaLabs Ecosystem

This tool is part of the **EknathaLabs** open DevOps learning platform:

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
- [ ] DB Security Checklist — per-database hardening guide with progress tracking
- [ ] Schema Designer — drag-and-drop ERD builder with SQL DDL export
- [ ] DB Cost Calculator — RDS vs Aurora vs self-managed cost comparison
- [ ] Error Code Library — PostgreSQL + MySQL error codes with plain-English fixes
- [ ] Migration Guides — MySQL → PostgreSQL, MongoDB → PostgreSQL, self-hosted → RDS

### Planned Tutorials
- [ ] YugabyteDB, TiDB (HTAP), HBase, Firestore, etcd, pgvector

### Planned Daily Challenges
- [ ] PostgreSQL audit logging with triggers
- [ ] Cassandra schema for a ride-sharing app
- [ ] ClickHouse materialized view optimization
- [ ] Redis-backed distributed job queue

---

## 🤝 Contributing

Contributions are welcome. If you spot an error, want to add a database, improve a tutorial, or add quiz questions:

1. Fork the repository
2. Edit `index.html` directly
3. Test locally: `python3 -m http.server 8080`
4. Open a Pull Request with a clear description

**Guidelines:**
- Verify content against official documentation
- Test all commands on the stated OS/version
- Validate K8s manifests against current operator versions
- Do not add external CDN links, fonts, or API calls
- Double-escape backslash commands inside JS template literals (`\\x`, `\\G`, `\\l`, `\\c`)

---

## 👤 Author

**Eknatha Reddy Puli** — Platform Engineer & DevOps Practitioner, Bengaluru

- 🌐 [eknathalabs.com](https://eknathalabs.com)
- 💼 [LinkedIn](https://linkedin.com/in/eknathareddyp)
- 🐙 [GitHub](https://github.com/eknatha)
- ✍️ [Blog](https://blog.eknathalabs.com)


---

## 📄 License

MIT License — free to use, share, and modify. Attribution appreciated.

---

<div align="center">

**Built with ♥ as part of the EknathaLabs open DevOps & SRE & Platform learning platform**

[db.eknathalabs.com](https://db.eknathalabs.com) &nbsp;•&nbsp; [eknathalabs.com](https://eknathalabs.com) &nbsp;•&nbsp; [github.com/eknatha](https://github.com/eknathareddyp)

</div>
