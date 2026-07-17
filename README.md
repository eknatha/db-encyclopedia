# DB Encyclopedia

> A complete, offline-first database reference — 44 databases, 211 quiz questions, 16 tutorials, 13 interactive tools, and a transaction isolation visualizer.

**Live:** https://db.eknathalabs.com

Part of the [EknathaLabs](https://github.com/eknatha) ecosystem. Zero external dependencies. No build step. No tracking. Works fully offline once loaded.

---

## What's Inside

| Section | Contents |
|---|---|
| **Encyclopedia** | 44 database profiles across 10 families |
| **Comparison Matrix** | 18 databases, sortable across 11 dimensions |
| **Decision Wizard** | Guided database selection by workload |
| **AI Advisor** | Offline rule-based recommendation engine |
| **Cloud Services** | Managed offerings across AWS / Azure / GCP |
| **K8s Operators** | Running databases on Kubernetes |
| **Cheat Sheets** | psql, mysql, redis, cassandra |
| **Tutorials** | 16 hands-on guides |
| **Query Explainer** | Plain-English SQL breakdown |
| **Glossary** | 73 terms |
| **Isolation Lab** | Step-through transaction anomaly visualizer |
| **Quiz** | 211 questions across 9 categories |
| **Daily Challenge** | 29 challenges with streak tracking |
| **Data Type Picker** | Choose the right column type |
| **Tools** | 12 interactive calculators and planners |

## Theming

Dark by default, with a light theme toggled from the nav. Resolution order: saved choice → OS `prefers-color-scheme` → dark. The choice persists in `localStorage`; if storage is unavailable the toggle still works for the session.

An inline snippet in `<head>` applies the theme before first paint, so there is no flash of the wrong theme on load. All colour is defined as CSS custom properties on `:root` and overridden under `[data-theme="light"]` — accents keep their hue across themes so the isolation lab and badges retain their semantic colour coding. Both palettes pass WCAG AA (light: 27/27 text-on-surface pairs).

---

## The 44 Databases

**Relational (9)** — PostgreSQL, MySQL, MariaDB, SQL Server, Oracle, SQLite, Neon, Supabase, PlanetScale
**Document (3)** — MongoDB, Couchbase, Firestore
**Key-Value (6)** — Redis, Memcached, DynamoDB, etcd, Valkey, DragonflyDB
**Columnar (5)** — Cassandra, HBase, ClickHouse, DuckDB, ScyllaDB
**Graph (2)** — Neo4j, Neptune
**Time-Series (3)** — InfluxDB, TimescaleDB, VictoriaMetrics
**NewSQL (4)** — CockroachDB, TiDB, YugabyteDB, Spanner
**Search (2)** — Elasticsearch, OpenSearch
**Vector / AI (6)** — pgvector, Qdrant, Milvus, Weaviate, Pinecone, Chroma
**Cloud Warehouse (4)** — Snowflake, BigQuery, Redshift, Databricks

---

## Isolation Lab

An interactive visualizer for transaction isolation. Pick an anomaly and an isolation level, then step through two concurrent sessions to see exactly what each transaction observes at every moment.

**Anomalies:** Dirty Read · Non-Repeatable Read · Phantom Read · Lost Update · Write Skew
**Levels:** Read Uncommitted · Read Committed · Repeatable Read · Serializable

Behaviour reflects **PostgreSQL** semantics — including the details most references skip: Read Uncommitted is silently upgraded to Read Committed, Repeatable Read is snapshot isolation and therefore prevents phantoms (unlike the ANSI standard), and Serializable uses SSI, aborting conflicting transactions with `SQLSTATE 40001` rather than blocking.

---

## Quiz — 211 Questions

| Category | Count |
|---|---|
| SQL & Relational | 30 |
| NoSQL | 25 |
| Performance | 25 |
| Transactions & Isolation | 25 |
| Vector & AI | 25 |
| K8s & Operators | 21 |
| Replication & HA | 20 |
| Cloud & Warehouse | 20 |
| Security & Ops | 20 |

Every question ships with a detailed explanation, not just an answer key.


Validate all modules before committing:

```bash
for f in $(find js -name '*.js'); do node --check "$f" || echo "FAIL: $f"; done
```

---

## Design Principles

- **Offline-first** — no CDNs, no external fonts, no runtime fetches
- **Themeable** — dark (default) and light, both WCAG AA; all colour flows through CSS custom properties
- **Zero dependencies** — vanilla JS, no framework, no bundler
- **Data/logic separation** — content lives in `js/data/`, behaviour in modules
- **Progressive enhancement** — every section degrades gracefully in isolation

---

## Deployment

GitHub Pages from the default branch root. `CNAME` sets the custom domain; `.nojekyll` prevents Jekyll from ignoring paths.

---

## License

MIT — content and code free to use with attribution.

Built by [Eknatha](https://github.com/eknatha) · [EknathaLabs](https://eknathalabs.com)
