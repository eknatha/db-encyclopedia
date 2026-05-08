# 🗄️ DB Encyclopedia — db.eknathalabs.com

> **The complete database reference for DevOps & Platform Engineers.**
> Every database. Every pattern. Every command. Fully offline. Single file.

[![Live](https://img.shields.io/badge/Live-db.eknathalabs.com-4f8ef7?style=flat-square&logo=github)](https://db.eknathalabs.com)
[![EknathaLabs](https://img.shields.io/badge/EknathaLabs-Ecosystem-00d4aa?style=flat-square)](https://eknathalabs.com)
[![Offline Ready](https://img.shields.io/badge/Offline-Ready-green?style=flat-square)](#offline-mode)
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-orange?style=flat-square)](#tech-stack)
[![Databases](https://img.shields.io/badge/Databases-40%2B-purple?style=flat-square)](#database-coverage)

---

## 📖 What is this?

**DB Encyclopedia** is a single-file HTML reference platform covering 40+ databases across 8 categories. Built specifically for DevOps Engineers, Platform Engineers, and SREs who need fast, reliable database knowledge — whether they're online or not.

No frameworks. No backend. No internet required. Just drop the file and go.

---

## ✨ Features

### 🌐 Database Universe
Visual map of 8 database categories — click any category to filter the full encyclopedia.

### 📚 Encyclopedia (40+ Databases)
Expandable profile cards for every major database with:
- Type, license, ACID compliance, horizontal scaling support
- Kubernetes operator availability
- Cloud managed service options
- Use cases, protocols, and descriptions

### 📊 Comparison Matrix
Sortable, filterable feature comparison table across 11 key databases — ACID, H-Scale, K8s operator, Cloud managed, Open Source.

### ⚡ Decision Wizard
5-step interactive quiz that recommends the right database for your use case — with reasoning. Covers PostgreSQL, MongoDB, Redis, Cassandra, ClickHouse, Neo4j, and more.

### ☁️ Cloud Services Map
AWS vs Azure vs GCP side-by-side managed database service mapping — organized by category (Relational, NoSQL, Cache, Analytics, Search, Graph).

### ☸️ Databases on Kubernetes
9 operator deep-dives: CloudNativePG, Percona, MongoDB Community, Redis Operator, K8ssandra, Altinity, ECK, CockroachDB Operator, and Velero backup patterns.

### 📋 Command Cheatsheets
Copy-ready command reference for:
- PostgreSQL (connection, operations, backup, replication, performance)
- MySQL (admin, replication, backup)
- MongoDB (CRUD, replica set, backup)
- Redis (data structures, cluster, sentinel)
- Cassandra (CQL, nodetool)

### 🛤️ Learning Paths
4 structured learning paths for DevOps engineers:
1. **DB Fundamentals for DevOps** — Beginner
2. **PostgreSQL for Production** — Intermediate
3. **Databases on Kubernetes** — Advanced
4. **Cloud Database Operations** — Cloud Expert

### 📖 Full Tutorials (16 Databases)
Complete step-by-step tutorials including install, config, core operations, K8s deployment, monitoring, and troubleshooting for:

| Database | Category |
|---|---|
| PostgreSQL | Relational |
| MySQL | Relational |
| MariaDB + Galera Cluster | Relational |
| SQLite | Embedded |
| MongoDB | Document |
| Redis | Key-Value / Cache |
| DynamoDB | Key-Value / Serverless |
| Apache Cassandra | Wide-Column |
| ClickHouse | Columnar OLAP |
| TimescaleDB | Time Series |
| InfluxDB | Time Series |
| VictoriaMetrics | Time Series / Prometheus |
| Elasticsearch | Search |
| OpenSearch | Search |
| Neo4j | Graph |
| CockroachDB | NewSQL / Distributed |

### 🤖 Offline DB Advisor
Built-in rule-based knowledge engine that recommends the right database for your use case — **no internet required**. Covers 10 use case categories:
- E-commerce, Social/Graph, IoT/Sensors
- Caching/Sessions, Analytics/BI, Multi-tenant SaaS
- Mobile/Real-time, Kubernetes-native, Logs/Search
- Financial/Banking, AI/ML/Vector

### 🛠️ Tools Directory
Links to all specialist DB tools in the EknathaLabs ecosystem (coming soon).

---

## 🗂️ Database Coverage

| Category | Databases |
|---|---|
| **Relational** | PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, Oracle DB |
| **Document** | MongoDB, Couchbase, Firestore |
| **Key-Value** | Redis, Memcached, DynamoDB, etcd |
| **Wide-Column** | Apache Cassandra, HBase, ClickHouse |
| **Graph** | Neo4j, Amazon Neptune |
| **Time Series** | InfluxDB, TimescaleDB, VictoriaMetrics |
| **NewSQL** | CockroachDB, TiDB, YugabyteDB, Cloud Spanner |
| **Search** | Elasticsearch, OpenSearch |

---



## 🔌 Offline Mode

This tool is **100% offline capable**:

- ✅ Zero external CDN dependencies
- ✅ No Google Fonts (system font stack)
- ✅ No API calls at runtime
- ✅ Built-in Service Worker for page caching
- ✅ DB Advisor uses local rule engine (no Claude API)
- ✅ All 40+ database profiles embedded in JS
- ✅ Nav badge shows live Online/Offline status

---

## 🏗️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | None | Zero dependencies, fast load |
| Styling | Vanilla CSS + CSS Variables | Full control, no build step |
| JavaScript | Vanilla ES6+ | No bundler needed |
| Fonts | System font stack | Offline safe |
| Hosting | GitHub Pages | Free, fast, custom domain |
| File format | Single `.html` | Deploy anywhere, share as file |

---

## 📁 Repository Structure

```
db-encyclopedia/
│
├── index.html          # The entire app — single file
└── README.md           # This file
```

That's it. One file = entire platform.

---

## 🌐 EknathaLabs Ecosystem

This tool is part of the **EknathaLabs** DevOps learning platform:

| Tool | URL | Description |
|---|---|---|
| 🏠 Main Hub | [eknathalabs.com](https://eknathalabs.com) | Platform home |
| 🗄️ DB Encyclopedia | [db.eknathalabs.com](https://db.eknathalabs.com) | This tool |
| ☸️ KubeLab | [kubelab.eknathalabs.com](https://kubelab.eknathalabs.com) | Kubernetes learning |
| 🏗️ Terraform Lab | [terraform.eknathalabs.com](https://terraform.eknathalabs.com) | IaC gamified learning |
| 🐧 Linux Lab | [linux.eknathalabs.com](https://linux.eknathalabs.com) | Linux for DevOps |
| 🐳 Docker Lab | [docker.eknathalabs.com](https://docker.eknathalabs.com) | Container learning |
| 🔄 CI/CD Lab | [cicd.eknathalabs.com](https://cicd.eknathalabs.com) | Pipeline patterns |
| 🎲 Chaos Lab | [chaoslab.eknathalabs.com](https://chaoslab.eknathalabs.com) | Chaos engineering |
| 📝 Interview Prep | [interview-prep.eknathalabs.com](https://interview-prep.eknathalabs.com) | 500+ interview questions |
| 📊 Resumelytics | [resumelytics.eknathalabs.com](https://resumelytics.eknathalabs.com) | Resume analyzer |
| 🔍 GitHub Analyzer | [github-profile-analyzer.eknathalabs.com](https://github-profile-analyzer.eknathalabs.com) | Profile scoring |
| 💻 Linux Explainer | [linux-command-explainer.eknathalabs.com](https://linux-command-explainer.eknathalabs.com) | Command reference |
| 🏛️ Architecture Lab | [arch.eknathalabs.com](https://arch.eknathalabs.com) | System design |
| 📖 Blog | [blog.eknathalabs.com](https://blog.eknathalabs.com) | DevOps writing |
| 🎓 Learn | [learn.eknathalabs.com](https://learn.eknathalabs.com) | Learning hub |

---

## 🗺️ Roadmap

### Coming Soon
- [ ] Connection String Builder — all databases × all languages
- [ ] EXPLAIN Query Visualizer — PostgreSQL query plan as visual tree
- [ ] Index Advisor — paste slow query → get index recommendations
- [ ] CAP Theorem Interactive Map — visual database placement
- [ ] DB Security Checklist — hardening guide with progress tracking
- [ ] Schema Designer — drag-and-drop ERD builder
- [ ] DB Cost Calculator — RDS vs Aurora vs self-managed comparison
- [ ] Error Code Library — PostgreSQL + MySQL error codes searchable
- [ ] pgtuning.eknathalabs.com — PostgreSQL config tuner
- [ ] slowquery.eknathalabs.com — Slow query analyzer

### Planned Tutorials
- [ ] YugabyteDB
- [ ] TiDB
- [ ] HBase
- [ ] Firestore
- [ ] etcd deep-dive

---

### What makes a good contribution
- Accurate technical content verified against official docs
- Commands tested on the stated OS/version
- K8s manifests validated against current operator versions
- No external dependencies added

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

**Built with ♥ as part of the EknathaLabs open DevOps learning platform**

[db.eknathalabs.com](https://db.eknathalabs.com) • [eknathalabs.com](https://eknathalabs.com)

</div>
