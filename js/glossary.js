const glossaryTerms = [
  // Core Concepts
  {term:'ACID',cat:'core',def:'Atomicity, Consistency, Isolation, Durability — the four properties that guarantee database transactions are processed reliably. Atomicity: all or nothing. Consistency: data always valid. Isolation: concurrent transactions don\'t interfere. Durability: committed data survives crashes.',also:['BASE','Transaction','WAL']},
  {term:'BASE',cat:'core',def:'Basically Available, Soft state, Eventually consistent — the alternative to ACID used by many NoSQL databases. Prioritizes availability and partition tolerance over immediate consistency. Data will become consistent eventually, but may be stale immediately after a write.',also:['ACID','CAP Theorem','Eventual Consistency']},
  {term:'CAP Theorem',cat:'core',def:'Consistency, Availability, Partition Tolerance — Brewer\'s theorem states a distributed system can only guarantee 2 of these 3 at any time. CA: PostgreSQL (single node). CP: HBase, etcd, Zookeeper. AP: Cassandra, DynamoDB, CouchDB.',also:['Consistency','Availability','Partition Tolerance']},
  {term:'MVCC',cat:'core',def:'Multi-Version Concurrency Control — a database technique where multiple versions of a row exist simultaneously. Readers see a consistent snapshot without blocking writers. PostgreSQL and MySQL InnoDB both use MVCC. Dead row versions must be cleaned up by VACUUM.',also:['VACUUM','Snapshot Isolation','Transaction']},
  {term:'Transaction',cat:'core',def:'A unit of work that is executed atomically — either all operations succeed (COMMIT) or all are rolled back (ROLLBACK). Defined by BEGIN and COMMIT/ROLLBACK statements. Transactions enforce ACID properties.',also:['ACID','MVCC','Deadlock']},
  {term:'Deadlock',cat:'core',def:'A situation where two or more transactions are each waiting for the other to release a lock, causing both to wait forever. Databases detect deadlocks and automatically abort one transaction. Prevented by always acquiring locks in the same order.',also:['Lock','Transaction','MVCC']},
  {term:'Lock',cat:'core',def:'A mechanism to control concurrent access to data. Row-level locks (most granular), table-level locks (coarser). Shared locks allow concurrent reads. Exclusive locks block all others. PostgreSQL uses advisory locks for application-level coordination.',also:['Deadlock','MVCC','Transaction']},
  {term:'Normalization',cat:'core',def:'The process of organizing a database schema to reduce data redundancy and improve data integrity. 1NF: atomic values. 2NF: no partial dependencies. 3NF: no transitive dependencies. BCNF: stricter 3NF. Denormalization sacrifices this for read performance.',also:['Schema','Foreign Key','Index']},
  {term:'Schema',cat:'core',def:'The structure/blueprint of a database — defines tables, columns, data types, constraints, indexes, and relationships. In PostgreSQL, a schema is also a namespace within a database (public, private). "Schema-on-read" (NoSQL) vs "schema-on-write" (SQL).',also:['Normalization','Migration','DDL']},
  {term:'DDL',cat:'core',def:'Data Definition Language — SQL statements that define structure: CREATE, ALTER, DROP, TRUNCATE. DDL statements are auto-committed in most databases (except PostgreSQL which wraps them in transactions). Changes are immediate and hard to roll back.',also:['DML','Schema','Migration']},
  {term:'DML',cat:'core',def:'Data Manipulation Language — SQL statements that manipulate data: SELECT, INSERT, UPDATE, DELETE. DML runs within transactions and can be rolled back. SELECT is technically DQL (Data Query Language) but commonly grouped with DML.',also:['DDL','Transaction','CRUD']},
  {term:'CRUD',cat:'core',def:'Create, Read, Update, Delete — the four basic operations of persistent storage. Maps to SQL INSERT, SELECT, UPDATE, DELETE. Also maps to HTTP POST, GET, PUT/PATCH, DELETE in REST APIs.',also:['DML','API','SQL']},
  {term:'Foreign Key',cat:'core',def:'A constraint that enforces referential integrity — a column\'s value must match a value in another table\'s primary key. Prevents orphaned records. ON DELETE CASCADE automatically deletes related rows. Performance cost: FK checks on every write.',also:['Primary Key','Join','Constraint']},
  {term:'Primary Key',cat:'core',def:'A column (or set of columns) that uniquely identifies each row. Cannot be NULL or duplicate. Automatically creates a unique index. Single column (surrogate key like BIGSERIAL/UUID) or composite (natural key from business data).',also:['Foreign Key','Index','UUID']},
  {term:'Constraint',cat:'core',def:'A rule enforced by the database engine: PRIMARY KEY (unique, not null), UNIQUE, NOT NULL, CHECK (custom condition), FOREIGN KEY (referential integrity), EXCLUSION (PostgreSQL — no overlapping ranges). Constraints are validated on every write.',also:['Primary Key','Foreign Key','Normalization']},

  // Storage & I/O
  {term:'WAL',cat:'storage',def:'Write-Ahead Log — every change is written to the WAL before being applied to data files. This ensures durability (crash recovery) and enables streaming replication. PostgreSQL WAL files live in pg_wal/. MySQL equivalent is binary log (binlog).',also:['Checkpoint','Replication','PITR']},
  {term:'Checkpoint',cat:'storage',def:'The process of writing all dirty pages from shared_buffers to disk, creating a consistent on-disk state. PostgreSQL checkpoints happen every checkpoint_timeout seconds or when max_wal_size is reached. Frequent checkpoints cause I/O spikes.',also:['WAL','Shared Buffers','VACUUM']},
  {term:'Shared Buffers',cat:'storage',def:'PostgreSQL\'s in-memory page cache — the primary buffer pool where hot data pages live. Set to 25% of RAM. A cache hit means data is served from memory; a cache miss requires a disk read. Target cache hit ratio > 99%.',also:['Checkpoint','Buffer Pool','Cache Hit Rate']},
  {term:'Buffer Pool',cat:'storage',def:'MySQL InnoDB\'s equivalent of PostgreSQL\'s shared_buffers. Caches table and index data. Set innodb_buffer_pool_size to 70-80% of RAM. The most important MySQL performance tuning parameter.',also:['Shared Buffers','Cache Hit Rate','InnoDB']},
  {term:'InnoDB',cat:'storage',def:'MySQL\'s default storage engine since 5.5. Provides ACID transactions, row-level locking, MVCC, foreign keys, and crash recovery. Each table stored as .ibd file with innodb_file_per_table. The only engine you should use in production MySQL.',also:['Buffer Pool','MVCC','MyISAM']},
  {term:'SSTable',cat:'storage',def:'Sorted String Table — an immutable, sorted file of key-value pairs used by LSM-tree databases (Cassandra, RocksDB, LevelDB). SSTables are written sequentially (fast writes), periodically merged via compaction, and read with bloom filters to avoid unnecessary reads.',also:['LSM Tree','Compaction','Bloom Filter']},
  {term:'LSM Tree',cat:'storage',def:'Log-Structured Merge Tree — a write-optimized data structure used by Cassandra, RocksDB, ClickHouse. Writes go to memory (memtable) then flush to immutable SSTables. Read requires checking multiple SSTables. Read amplification vs write amplification tradeoff.',also:['SSTable','Compaction','Memtable']},
  {term:'B-tree Index',cat:'storage',def:'The default index type in PostgreSQL and MySQL. A self-balancing tree where each node has multiple children, keeping data sorted. Supports equality (=), range (<, >, BETWEEN), prefix LIKE, and ORDER BY efficiently. Most indexes should be B-trees.',also:['Index','GIN Index','Hash Index']},
  {term:'GIN Index',cat:'storage',def:'Generalized Inverted Index — PostgreSQL index type for composite values: JSONB, arrays, full-text search (tsvector), and extensions like pg_trgm. Maps each element to a list of rows containing it. Faster reads than GiST, slower to build.',also:['B-tree Index','JSONB','Full-Text Search']},
  {term:'VACUUM',cat:'storage',def:'PostgreSQL process that reclaims storage occupied by dead row versions (from MVCC updates/deletes). autovacuum runs automatically. VACUUM ANALYZE also updates query planner statistics. VACUUM FULL rewrites the table but takes an exclusive lock.',also:['MVCC','Bloat','autovacuum']},
  {term:'Bloat',cat:'storage',def:'Wasted space in PostgreSQL tables and indexes from dead tuples not yet reclaimed by VACUUM. High bloat causes table scans to read many useless rows. Caused by high UPDATE/DELETE rates without sufficient vacuuming.',also:['VACUUM','Dead Tuple','MVCC']},
  {term:'Compaction',cat:'storage',def:'Background process in LSM-tree databases (Cassandra, ClickHouse, RocksDB) that merges SSTables to reclaim space, remove tombstones, and improve read performance. Multiple strategies: STCS (size-tiered), LCS (leveled), TWCS (time-window for time-series).',also:['SSTable','LSM Tree','Tombstone']},
  {term:'Tombstone',cat:'storage',def:'A marker left when a record is deleted in a distributed database (Cassandra) or LSM-tree store. The actual data is not immediately removed — tombstones are cleaned up during compaction after gc_grace_seconds. Excessive tombstones slow reads.',also:['Compaction','Cassandra','SSTable']},
  {term:'Bloom Filter',cat:'storage',def:'A probabilistic data structure that can definitively say "this key is NOT in this SSTable" — eliminating unnecessary disk reads. May return false positives (says key is present when it\'s not) but never false negatives. Used by Cassandra, RocksDB, ClickHouse.',also:['SSTable','LSM Tree','Cassandra']},

  // Replication & HA
  {term:'Replication',cat:'replication',def:'Copying data from one database server (primary) to one or more servers (replicas/standbys). Provides high availability (automatic failover if primary fails) and read scaling (distribute read queries to replicas). Two modes: synchronous (waits for replica ack) or asynchronous.',also:['WAL','Failover','Read Replica']},
  {term:'Streaming Replication',cat:'replication',def:'PostgreSQL\'s native replication where WAL records are streamed from primary to standby in real time. The standby applies WAL records and stays in sync. Standbys can serve read queries (hot standby mode). Lag measured by LSN difference.',also:['WAL','Hot Standby','Replication Slot']},
  {term:'Logical Replication',cat:'replication',def:'Replicates individual data changes (row-level) rather than WAL byte streams. Allows replication between different PostgreSQL versions, selective table replication, and replications to other systems. Used by pglogical, AWS DMS, Debezium.',also:['Streaming Replication','WAL','CDC']},
  {term:'Replication Slot',cat:'replication',def:'PostgreSQL mechanism that ensures the primary keeps WAL segments until the replica has consumed them. Prevents replicas from falling too far behind and losing data. Risk: if a slot goes unused, WAL accumulates and can fill disk. Monitor slot lag!',also:['Streaming Replication','WAL','Lag']},
  {term:'Failover',cat:'replication',def:'The process of promoting a replica to primary when the primary fails. Automatic failover requires a HA manager like Patroni (PostgreSQL), MHA (MySQL), or Sentinel (Redis). Recovery Point Objective (RPO) and Recovery Time Objective (RTO) measure quality of failover.',also:['Replication','Patroni','Split Brain']},
  {term:'Split Brain',cat:'replication',def:'A dangerous scenario in distributed databases where two nodes both believe they are the primary and accept writes simultaneously. Causes data divergence that\'s hard to reconcile. Prevented by quorum-based leader election (Raft, Paxos) and STONITH (Shoot The Other Node In The Head).',also:['Failover','Quorum','Raft']},
  {term:'Quorum',cat:'replication',def:'The minimum number of nodes that must agree for an operation to succeed in a distributed system. For RF=3, quorum = 2 (majority). Used by Cassandra (QUORUM consistency), Raft consensus, etcd. Quorum prevents split-brain and ensures consistency.',also:['Raft','Split Brain','Consensus']},
  {term:'Raft',cat:'replication',def:'A consensus algorithm for distributed systems that ensures a cluster of nodes agrees on a sequence of values. Used by CockroachDB, etcd, TiDB, CockroachDB. Elects a leader, replicates log entries, only commits when majority acknowledges. Easier to understand than Paxos.',also:['Quorum','Leader Election','etcd']},
  {term:'Patroni',cat:'replication',def:'A high-availability solution for PostgreSQL that manages automatic failover using etcd, Consul, or ZooKeeper as a distributed configuration store (DCS). Patroni monitors health, promotes the best replica when primary fails, and fences the old primary.',also:['Failover','Replication','etcd']},
  {term:'CDC',cat:'replication',def:'Change Data Capture — capturing every INSERT, UPDATE, DELETE as a stream of events. Used for real-time sync to data warehouses, search indexes, caches. Tools: Debezium (Kafka), AWS DMS, PostgreSQL logical replication. Based on WAL (PostgreSQL) or binlog (MySQL).',also:['Logical Replication','WAL','Debezium']},
  {term:'PITR',cat:'replication',def:'Point-in-Time Recovery — restoring a database to a specific moment in time by replaying WAL/binlog from a base backup. Essential for recovering from data corruption, accidental deletes. Requires continuous WAL archiving. Tools: pgBackRest, Barman (PostgreSQL).',also:['WAL','Backup','pgBackRest']},
  {term:'Galera Cluster',cat:'replication',def:'Synchronous multi-master replication for MySQL/MariaDB. Every node accepts writes and every write is committed on ALL nodes before returning success. Uses wsrep (write set replication) API. Provides true multi-master with no replication lag.',also:['Replication','MariaDB','MySQL']},

  // Performance
  {term:'Query Plan',cat:'performance',def:'The execution strategy chosen by the query planner/optimizer. Shows which indexes are used, join order, join algorithms (Hash Join, Nested Loop, Merge Join), and estimated vs actual row counts. View with EXPLAIN ANALYZE in PostgreSQL/MySQL.',also:['EXPLAIN','Index','Query Planner']},
  {term:'EXPLAIN',cat:'performance',def:'SQL command that shows the query execution plan without running the query. EXPLAIN ANALYZE actually runs the query and shows real timing. EXPLAIN (ANALYZE, BUFFERS) also shows cache hits/misses. Essential for query optimization.',also:['Query Plan','Index','Sequential Scan']},
  {term:'Sequential Scan',cat:'performance',def:'Reading every row in a table from disk. Unavoidable for full-table operations or when no useful index exists. Expected for small tables (<1000 rows) where a scan is faster than index lookup. For large tables: add a WHERE clause index.',also:['Index Scan','Query Plan','EXPLAIN']},
  {term:'Index Scan',cat:'performance',def:'Using an index to find matching rows rather than scanning all rows. Much faster than sequential scan for selective queries. Requires a WHERE clause that matches the index definition. Index-Only Scan is even faster — reads data from index without visiting the table.',also:['Sequential Scan','B-tree Index','Query Plan']},
  {term:'Connection Pooling',cat:'performance',def:'Reusing database connections rather than creating a new one per request. Opening a PostgreSQL connection takes ~50ms and consumes ~5MB RAM. Poolers (PgBouncer, ProxySQL, RDS Proxy) maintain a pool of connections and multiplex application requests.',also:['PgBouncer','max_connections','N+1 Problem']},
  {term:'PgBouncer',cat:'performance',def:'Lightweight PostgreSQL connection pooler. Transaction mode: connection returned to pool after each transaction (highest multiplexing). Session mode: connection held for entire session. Statement mode: after each statement (most aggressive, limited compatibility).',also:['Connection Pooling','max_connections','PostgreSQL']},
  {term:'N+1 Problem',cat:'performance',def:'A common ORM performance issue where fetching N records then loading related data for each one results in N+1 queries instead of 1. Solved by eager loading (JOIN, IN clause) or GraphQL DataLoader batching. EXPLAIN shows many identical queries in slow query log.',also:['Query Plan','JOIN','ORM']},
  {term:'Cache Hit Rate',cat:'performance',def:'Percentage of data reads served from memory (buffer pool / shared_buffers) without disk I/O. Target > 99%. Below 95% means your buffer pool is too small or working set is too large. Monitor: PostgreSQL — pg_statio_user_tables; MySQL — Innodb_buffer_pool_reads.',also:['Shared Buffers','Buffer Pool','I/O']},
  {term:'Slow Query Log',cat:'performance',def:'Database feature that logs queries exceeding a time threshold. PostgreSQL: log_min_duration_statement. MySQL: slow_query_log + long_query_time. Analyze with pg_stat_statements (PostgreSQL) or pt-query-digest (MySQL Percona Toolkit).',also:['Query Plan','EXPLAIN','pg_stat_statements']},
  {term:'Cardinality',cat:'performance',def:'The number of unique values in a column. High cardinality (e.g., user_id): B-tree index very effective. Low cardinality (e.g., status: active/inactive): B-tree index often skipped by planner, partial indexes or bitmap scans work better.',also:['Index','Query Plan','Statistics']},
  {term:'Statistics',cat:'performance',def:'Data the query planner uses to estimate row counts and choose execution plans. Collected by ANALYZE. Stored in pg_statistic. Stale statistics cause bad plans. Increase default_statistics_target for complex columns. autovacuum runs ANALYZE automatically.',also:['Query Plan','ANALYZE','Cardinality']},
  {term:'Partitioning',cat:'performance',def:'Splitting a large table into smaller physical pieces (partitions) by a key (range, list, hash). Queries that filter on the partition key skip irrelevant partitions (partition pruning). PostgreSQL declarative partitioning, MySQL PARTITION clause, TimescaleDB hypertables.',also:['Sharding','Index','TimescaleDB']},

  // K8s & Cloud
  {term:'StatefulSet',cat:'k8s',def:'Kubernetes workload controller for stateful applications (databases). Unlike Deployments, StatefulSets provide: stable network identity (pod-0, pod-1), stable persistent storage (PVCs follow pods), ordered startup/shutdown. Required for databases on K8s.',also:['PVC','Operator','Deployment']},
  {term:'PVC',cat:'k8s',def:'PersistentVolumeClaim — a request for storage in Kubernetes. Databases need PVCs to survive pod restarts. StorageClass defines the storage type (SSD, HDD, NFS). RWO (ReadWriteOnce) for databases — one pod mounts the volume at a time.',also:['StatefulSet','StorageClass','Operator']},
  {term:'Operator',cat:'k8s',def:'A Kubernetes controller that automates the lifecycle of complex stateful applications. Encodes operational knowledge (deployment, scaling, failover, backup, upgrades) as code. Database operators: CloudNativePG, K8ssandra, MongoDB Community Operator, ECK.',also:['StatefulSet','CRD','CloudNativePG']},
  {term:'CRD',cat:'k8s',def:'Custom Resource Definition — extends the Kubernetes API with application-specific resource types. Database operators define CRDs like PostgreSQLCluster, MongoDBReplicaSet. You interact with these via kubectl just like built-in resources.',also:['Operator','StatefulSet','Kubernetes']},
  {term:'CloudNativePG',cat:'k8s',def:'The CNCF-listed Kubernetes operator for PostgreSQL. Manages cluster topology, automatic failover, WAL archiving, connection pooling (PgBouncer sidecar), rolling updates, and monitoring. Configured via PostgreSQL CRD. The recommended way to run PostgreSQL on K8s.',also:['Operator','PostgreSQL','StatefulSet']},
  {term:'StorageClass',cat:'k8s',def:'Defines the type and parameters of storage provisioned for PVCs in Kubernetes. Parameters: provisioner (AWS EBS, GCE PD, Azure Disk), type (gp3, pd-ssd), reclaim policy (Delete, Retain). Databases always need SSD storage classes — never use default HDD.',also:['PVC','StatefulSet','Operator']},
  {term:'Managed Database',cat:'k8s',def:'A cloud-provided database service where the provider handles installation, patching, backups, failover, and scaling. Examples: AWS RDS/Aurora, Azure Database, Google Cloud SQL. Tradeoff: less control, higher cost, simpler operations.',also:['RDS','Aurora','Cloud SQL']},
  {term:'Connection String',cat:'k8s',def:'A URL or DSN (Data Source Name) containing all parameters to connect to a database: host, port, database name, user, password, SSL mode. Format varies: PostgreSQL uses URI (postgresql://user:pass@host:5432/db), MySQL uses host=... syntax.',also:['Managed Database','PgBouncer','SSL']},
  {term:'Sidecar',cat:'k8s',def:'A secondary container in a Kubernetes pod that assists the main container. Common database patterns: PgBouncer sidecar for connection pooling, exporter sidecar for Prometheus metrics, backup agent sidecar for backup coordination.',also:['Operator','StatefulSet','Prometheus']},

  // NoSQL
  {term:'Sharding',cat:'nosql',def:'Horizontal partitioning of data across multiple nodes (shards). Each shard holds a subset of data determined by the shard key. Enables linear scaling of storage and throughput. MongoDB sharding, Cassandra consistent hashing, DynamoDB automatic sharding.',also:['Partitioning','Shard Key','Consistent Hashing']},
  {term:'Shard Key',cat:'nosql',def:'The field(s) used to determine which shard stores a document/row. Critical design decision — cannot change without resharding. Bad shard key causes hotspots (all writes to one shard). Good shard key: high cardinality, uniform distribution, aligned with query patterns.',also:['Sharding','Consistent Hashing','MongoDB']},
  {term:'Consistent Hashing',cat:'nosql',def:'A distributed hashing scheme where adding/removing nodes redistributes only a minimal fraction of data. Used by Cassandra, DynamoDB. Data is assigned to nodes by hashing the key onto a ring. Each node is responsible for a range of the ring.',also:['Sharding','Cassandra','DynamoDB']},
  {term:'Eventual Consistency',cat:'nosql',def:'A consistency model where, given no new updates, all replicas will eventually converge to the same value. Reads may see stale data temporarily after a write. Used by Cassandra (ONE/LOCAL_ONE), DynamoDB (eventually consistent reads), DNS.',also:['BASE','ACID','Strong Consistency']},
  {term:'Strong Consistency',cat:'nosql',def:'Every read sees the most recently written value. Requires coordination between nodes (quorum, synchronous replication). Provided by: PostgreSQL, CockroachDB, Google Spanner, etcd. Higher latency than eventual consistency.',also:['Eventual Consistency','Quorum','Linearizability']},
  {term:'Document Model',cat:'nosql',def:'Stores data as JSON/BSON documents. Each document is self-contained with nested objects and arrays. No fixed schema — each document can have different fields. Used by MongoDB, Firestore, CouchDB. Best for hierarchical data without complex cross-document queries.',also:['MongoDB','JSONB','Schema']},
  {term:'Wide Column',cat:'nosql',def:'Data model where rows have a variable number of columns organized into column families. Rows share a row key but can have different columns. Used by Cassandra, HBase (based on Google Bigtable). Optimized for high write throughput and time-series data.',also:['Cassandra','HBase','Column Family']},
  {term:'Graph Database',cat:'nosql',def:'Stores data as nodes (entities) and edges (relationships). Native graph storage traverses relationships in O(1) per hop regardless of total graph size. SQL requires O(n) JOINs for the same. Used for social networks, fraud detection, recommendations.',also:['Neo4j','Cypher','Property Graph']},
  {term:'Vector Database',cat:'nosql',def:'Stores and queries high-dimensional vector embeddings (from ML models like OpenAI, Cohere). Uses ANN (Approximate Nearest Neighbor) algorithms like HNSW or IVFFlat for similarity search. Used for semantic search, RAG, recommendations. Examples: pgvector, Pinecone, Weaviate, Qdrant.',also:['pgvector','HNSW','Embedding']},
  {term:'HNSW',cat:'nosql',def:'Hierarchical Navigable Small World — an ANN (Approximate Nearest Neighbor) index algorithm for vector search. Builds a multi-layer graph where upper layers provide coarse navigation and lower layers provide fine-grained search. Used by pgvector, OpenSearch, Weaviate.',also:['Vector Database','pgvector','Embedding']},
  {term:'Embedding',cat:'nosql',def:'A numerical vector representation of data (text, image, audio) produced by an ML model. Semantically similar items have vectors that are close in high-dimensional space. Stored in vector databases for similarity search. OpenAI text-embedding-3-small produces 1536-dimensional vectors.',also:['Vector Database','HNSW','pgvector']},
];

let glosActiveCategory = 'all';
let glosSearchQuery = '';

function renderGlossary(){
  const grid = document.getElementById('glos-grid');
  if(!grid) return;
  const filtered = glossaryTerms.filter(t => {
    const catOk = glosActiveCategory === 'all' || t.cat === glosActiveCategory;
    const searchOk = !glosSearchQuery ||
      t.term.toLowerCase().includes(glosSearchQuery) ||
      t.def.toLowerCase().includes(glosSearchQuery);
    return catOk && searchOk;
  });
  if(!filtered.length){
    grid.innerHTML = '<div style="color:var(--text3);font-size:.88rem;padding:2rem;grid-column:1/-1">No terms found. Try a different search.</div>';
    return;
  }
  grid.innerHTML = filtered.map(t => `
    <div class="glos-card">
      <div class="glos-card-header">
        <div class="glos-term">${t.term}</div>
        <div class="glos-cat">${({core:'Core',storage:'Storage',replication:'Replication',performance:'Performance',k8s:'K8s/Cloud',nosql:'NoSQL'})[t.cat]||t.cat}</div>
      </div>
      <div class="glos-def">${t.def}</div>
      ${t.also ? `<div class="glos-also">See also: ${t.also.map(a=>`<span onclick="searchGlosTerm('${a}')">${a}</span>`).join(', ')}</div>` : ''}
    </div>`).join('');
}

function filterGlossary(val){
  glosSearchQuery = val.toLowerCase();
  renderGlossary();
}

function glosCategory(btn, cat){
  glosActiveCategory = cat;
  document.querySelectorAll('.glos-filter-row .filter-tag').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGlossary();
}

function searchGlosTerm(term){
  document.getElementById('glos-search').value = term;
  glosSearchQuery = term.toLowerCase();
  glosActiveCategory = 'all';
  document.querySelectorAll('.glos-filter-row .filter-tag').forEach(b => b.classList.remove('active'));
  document.querySelector('.glos-filter-row .filter-tag').classList.add('active');
  renderGlossary();
  document.getElementById('glossary').scrollIntoView({behavior:'smooth'});
}

renderGlossary();


// ============================================================
// QUIZ
