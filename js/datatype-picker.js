// ============================================================
// DATA TYPE PICKER
// ============================================================

const dtpData = {
  // ---- TEXT / STRING ----
  'email': {
    title: 'Email Address',
    desc: 'A user\'s email address. Must be unique per user, lowercase-normalized, and validated. Max length 254 characters per RFC 5321.',
    categories: ['text'],
    dbs: {
      postgresql: { type:'TEXT', detail:'Use TEXT with a CHECK constraint for format validation. Add UNIQUE index. Normalize to lowercase with LOWER() before insert.', code:'email TEXT NOT NULL CHECK (email ~* \'^[^@]+@[^@]+\\.[^@]+$\'),\nCREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));', caveat:'', good:'TEXT is unlimited length — no need for VARCHAR(255). Store lowercase always.' },
      mysql:      { type:'VARCHAR(254)', detail:'VARCHAR(254) matches RFC 5321 limit. Add UNIQUE constraint. Use utf8mb4 charset. Normalize to lowercase in app or with generated column.', code:'email VARCHAR(254) NOT NULL UNIQUE,\nCONSTRAINT chk_email CHECK (email REGEXP \'^[^@]+@[^@]+\\\\.[^@]+$\')', caveat:'MySQL REGEXP is not as powerful as PostgreSQL — validate in application code too.', good:'' },
      mongodb:    { type:'String', detail:'Store as lowercase String. Add a unique sparse index. Validate format in application layer or using MongoDB schema validation.', code:'{ email: { type: "string", pattern: "^[^@]+@[^@]+\\\\.[^@]+$" } }\ndb.users.createIndex({ email: 1 }, { unique: true, sparse: true })', caveat:'', good:'Sparse index allows null/missing email without uniqueness conflicts.' },
      cassandra:  { type:'TEXT', detail:'Store as TEXT. Cassandra has no built-in constraints — validate in application. Use as partition key if querying users by email (e.g. login lookup table).', code:'CREATE TABLE users_by_email (\n  email TEXT PRIMARY KEY,\n  user_id UUID,\n  name TEXT\n);', caveat:'No uniqueness enforcement — application must handle duplicate prevention.', good:'' },
      dynamodb:   { type:'String (S)', detail:'Use as a GSI partition key for "get user by email" queries. Store lowercase. DynamoDB is case-sensitive — normalize before storing.', code:'AttributeType: S\nGSI: { IndexName: "EmailIndex", KeySchema: [{ email: HASH }] }', caveat:'No uniqueness enforcement at DB level — use conditional writes.', good:'Conditional write: attribute_not_exists(email) prevents duplicates.' },
    },
    rules: ['Always normalize to lowercase before storing','Validate format in the application — do not rely solely on DB constraints','Index the email column — it\'s always a lookup key','Maximum 254 characters (RFC 5321)','Never store plaintext passwords alongside emails'],
    examples: ['user@example.com', 'admin+tag@company.org', 'name.surname@mail.co.uk'],
    seeAlso: ['phone', 'uuid', 'full-text']
  },

  'price': {
    title: 'Price / Money / Currency',
    desc: 'Monetary values like product prices, order totals, account balances. Requires exact decimal precision — floating point types (FLOAT, DOUBLE) must NEVER be used for money.',
    categories: ['numeric'],
    dbs: {
      postgresql: { type:'NUMERIC(19,4)', detail:'NUMERIC(19,4) stores exact decimal values. 19 total digits, 4 after decimal. For multi-currency: add a currency_code column. Use integer pence/cents if only one currency.', code:'price NUMERIC(19,4) NOT NULL CHECK (price >= 0),\ncurrency_code CHAR(3) NOT NULL DEFAULT \'USD\'', caveat:'', good:'NUMERIC arithmetic is exact — no floating point rounding. Safe for financial calculations.' },
      mysql:      { type:'DECIMAL(19,4)', detail:'DECIMAL(19,4) is MySQL\'s exact numeric type. Equivalent to PostgreSQL NUMERIC. Never use FLOAT or DOUBLE for money.', code:'price DECIMAL(19,4) NOT NULL DEFAULT 0.0000,\nCHECK (price >= 0)', caveat:'FLOAT and DOUBLE have rounding errors — never use for currency.', good:'' },
      mongodb:    { type:'Decimal128 or Integer (cents)', detail:'Use Decimal128 type for exact decimal storage, or store as integer cents (multiply by 100). Decimal128 requires explicit use in drivers.', code:'// Option 1: Decimal128\n{ price: Decimal128("19.9900") }\n\n// Option 2: Integer cents (recommended)\n{ price_cents: 1999, currency: "USD" }', caveat:'Standard JavaScript Number loses precision above 2^53 — never use for money.', good:'Integer cents approach is simplest, fastest, and works in all drivers.' },
      cassandra:  { type:'DECIMAL or INT (cents)', detail:'DECIMAL for exact decimal values. Alternatively store as INT (cents). Add currency as separate column.', code:'price DECIMAL,\ncurrency_code TEXT,\n-- OR --\nprice_cents INT,\ncurrency_code TEXT', caveat:'No arithmetic functions in CQL — compute in application.', good:'' },
      dynamodb:   { type:'Number (N) — store as string', detail:'DynamoDB Number type has 38 significant digits of precision. For safety, store monetary values as strings representing exact decimal values, or as integers (cents).', code:'// Store as integer cents\n{ price_cents: { N: "1999" }, currency: { S: "USD" } }\n\n// Or as exact string\n{ price: { S: "19.99" } }', caveat:'DynamoDB Number type can lose precision with very large floats — use string or integer.', good:'' },
    },
    rules: ['NEVER use FLOAT, DOUBLE, or REAL for monetary values — they have rounding errors','Use NUMERIC/DECIMAL with enough precision — NUMERIC(19,4) is standard','Consider storing as integer cents (multiply by 100) — simplest and fastest approach','Always store currency code alongside the amount for multi-currency systems','For arithmetic: sum in database, not in application code (avoid float accumulation)'],
    examples: ['19.9900 (NUMERIC)','1999 (integer cents for $19.99)','Decimal128("19.99") (MongoDB)'],
    seeAlso: ['counter', 'boolean', 'timestamp']
  },

  'uuid': {
    title: 'UUID / Primary Key / ID',
    desc: 'Unique identifier for records. Choose between auto-increment integers, UUIDs, and time-ordered UUIDs (ULIDs/UUID v7) depending on your needs.',
    categories: ['identifier'],
    dbs: {
      postgresql: { type:'UUID or BIGSERIAL', detail:'UUID: globally unique, safe for distributed systems, no coordination needed. BIGSERIAL: sequential, compact (8 bytes vs 16), faster index insertions. Use gen_random_uuid() or uuid_generate_v4().', code:'-- UUID (distributed, no coordination)\nid UUID PRIMARY KEY DEFAULT gen_random_uuid()\n\n-- BIGSERIAL (single DB, compact)\nid BIGSERIAL PRIMARY KEY\n\n-- UUID v7 (time-ordered, better index perf)\nid UUID PRIMARY KEY DEFAULT uuidv7() -- pg_uuidv7 extension', caveat:'Random UUID v4 causes index fragmentation. Use UUID v7 or ULID for better index locality.', good:'gen_random_uuid() is built-in from PostgreSQL 13+. No extension needed.' },
      mysql:      { type:'CHAR(36) or BIGINT UNSIGNED', detail:'MySQL has no native UUID type. Store as CHAR(36) with dashes or BINARY(16) without. BIGINT UNSIGNED AUTO_INCREMENT for sequential IDs.', code:'-- UUID as string\nid CHAR(36) PRIMARY KEY DEFAULT (UUID())\n\n-- UUID as binary (compact, faster)\nid BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID(), TRUE))\n\n-- Auto-increment\nid BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY', caveat:'UUID() generates v1 UUIDs (time-based). Use UUID_TO_BIN(..., TRUE) for time-ordered byte swap.', good:'BINARY(16) is half the size of CHAR(36) and much faster for indexes.' },
      mongodb:    { type:'ObjectId or UUID', detail:'ObjectId is MongoDB\'s native 12-byte ID — includes timestamp, machine ID, process ID, and counter. Auto-generated as _id. Alternatively use UUID strings.', code:'// ObjectId (default, auto-generated)\n{ _id: ObjectId() }  // 12 bytes, time-ordered\n\n// UUID string\n{ _id: "550e8400-e29b-41d4-a716-446655440000" }\n\n// UUID binary (compact)\n{ _id: new UUID("550e8400...") }', caveat:'', good:'ObjectId has the timestamp embedded — ObjectId.getTimestamp() returns creation time.' },
      cassandra:  { type:'UUID or TIMEUUID', detail:'UUID: random, for static identifiers. TIMEUUID: time-based UUID v1, automatically time-ordered — ideal for clustering columns where you want natural time ordering.', code:'-- Static identifier\nuser_id UUID PRIMARY KEY\n\n-- Time-ordered clustering column\nCREATE TABLE events (\n  partition_id UUID,\n  event_id TIMEUUID,\n  PRIMARY KEY (partition_id, event_id)\n) WITH CLUSTERING ORDER BY (event_id DESC);', caveat:'', good:'TIMEUUID as clustering column gives free time-based ordering — no need for separate timestamp.' },
      dynamodb:   { type:'String (S)', detail:'Store UUID as a String. Generate in application (crypto.randomUUID() in Node.js, uuid4() in Python). For time-ordered IDs, use ULID or UUID v7.', code:'// UUID v4 (random)\n{ id: { S: "550e8400-e29b-41d4-a716-446655440000" } }\n\n// ULID (time-ordered, sortable)\n{ id: { S: "01ARZ3NDEKTSV4RRFFQ69G5FAV" } }', caveat:'', good:'ULID is lexicographically sortable — better for range queries and pagination than random UUID.' },
    },
    rules: ['Use UUID v7 or ULID over UUID v4 — time-ordered UUIDs have better B-tree index locality','Never expose sequential integer IDs in public APIs — reveals business metrics','UUID is 16 bytes vs BIGINT 8 bytes — matters at billions of rows','ObjectId in MongoDB already embeds creation timestamp','For distributed systems: UUID/ULID requires no coordination, auto-increment does'],
    examples: ['550e8400-e29b-41d4-a716-446655440000 (UUID v4)','01ARZ3NDEKTSV4RRFFQ69G5FAV (ULID)','018e4c66-3c7e-7000-af7f-ea2e26b1e4b7 (UUID v7)'],
    seeAlso: ['timestamp', 'counter', 'enum']
  },

  'timestamp': {
    title: 'Timestamp / Datetime / Date',
    desc: 'Point in time — creation dates, event times, scheduling. Always store in UTC. Never store local time in the database.',
    categories: ['datetime'],
    dbs: {
      postgresql: { type:'TIMESTAMPTZ', detail:'TIMESTAMPTZ (timestamp with time zone) stores UTC internally and converts to local time on output. Never use TIMESTAMP (without tz) — it stores no timezone info and causes bugs in multi-timezone apps.', code:'created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\nupdated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\nscheduled_at TIMESTAMPTZ,\n\n-- Triggers for auto-updated_at\nCREATE OR REPLACE FUNCTION update_updated_at()\nRETURNS TRIGGER AS $$ BEGIN\n  NEW.updated_at = NOW();\n  RETURN NEW;\nEND; $$ LANGUAGE plpgsql;', caveat:'TIMESTAMP without timezone is ambiguous — which timezone? Avoid it.', good:'TIMESTAMPTZ is stored as UTC internally — timezone-safe across regions.' },
      mysql:      { type:'DATETIME(6) or TIMESTAMP', detail:'DATETIME(6): stores literal date+time, no timezone conversion, up to microsecond precision. TIMESTAMP: converts to UTC on store, back to session timezone on read — limited to 2038-01-19.', code:'created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),\nupdated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)\n                         ON UPDATE CURRENT_TIMESTAMP(6),\nscheduled_at DATETIME(6) NULL', caveat:'TIMESTAMP type has the year 2038 problem — max value is 2038-01-19. Use DATETIME for future dates.', good:'DATETIME(6) gives microsecond precision. Always store UTC in application before insert.' },
      mongodb:    { type:'Date (ISODate)', detail:'MongoDB\'s Date type stores millisecond-precision UTC timestamps internally as a 64-bit integer. Always use ISODate or new Date() — never store timestamps as strings.', code:'{ \n  created_at: new Date(),          // ISODate — UTC\n  updated_at: ISODate("2025-05-08T10:00:00Z"),\n  expires_at: new Date(Date.now() + 86400000)  // +1 day\n}', caveat:'Storing dates as strings makes range queries and sorting impossible.', good:'ISODate enables range queries: { $gte: ISODate("2025-01-01") }' },
      cassandra:  { type:'TIMESTAMP', detail:'CQL TIMESTAMP stores UTC millisecond precision. TIMEUUID encodes a UUID v1 with the timestamp — useful for event ordering without a separate timestamp column.', code:'-- Simple timestamp\ncreated_at TIMESTAMP,\n\n-- Time-ordered UUID (preferred for clustering)\nevent_id TIMEUUID DEFAULT now(),\n\n-- Extract timestamp from TIMEUUID\nSELECT toTimestamp(event_id) FROM events;', caveat:'', good:'toTimestamp(timeuuid) extracts the time component from a TIMEUUID.' },
      dynamodb:   { type:'String (ISO 8601) or Number (epoch)', detail:'DynamoDB has no native Date type. Store as ISO 8601 string for human readability, or as Unix epoch (Number) for range queries and sorting.', code:'// ISO 8601 string (human readable, sortable)\n{ created_at: { S: "2025-05-08T10:00:00.000Z" } }\n\n// Unix epoch milliseconds (Number — fast range queries)\n{ created_at: { N: "1746691200000" } }\n\n// Use as sort key for time-range queries\n{ PK: "USER#u1", SK: "ORDER#2025-05-08T10:00:00Z" }', caveat:'Epoch numbers require client-side conversion for display.', good:'ISO 8601 strings are lexicographically sortable — works as DynamoDB sort key.' },
    },
    rules: ['ALWAYS store timestamps in UTC — convert to local time only in the presentation layer','Use TIMESTAMPTZ in PostgreSQL — never plain TIMESTAMP','Add created_at and updated_at to every table — it\'s free and invaluable for debugging','Use a trigger or ORM hook to auto-update updated_at on every UPDATE','Index timestamp columns used in WHERE clauses with DESC ordering for latest-first queries'],
    examples: ['2025-05-08T10:00:00.000Z (ISO 8601 UTC)','1746691200000 (Unix epoch ms)','NOW() / CURRENT_TIMESTAMP (SQL)'],
    seeAlso: ['uuid', 'boolean', 'counter']
  },

  'boolean': {
    title: 'Boolean / Flag / Toggle',
    desc: 'True/false values like is_active, is_verified, is_deleted. Simple but with important nuances around NULL handling and soft-delete patterns.',
    categories: ['primitive'],
    dbs: {
      postgresql: { type:'BOOLEAN', detail:'Native BOOLEAN type. Values: TRUE/FALSE/NULL. NULL means unknown — do not use NULL for is_active, use FALSE. Add NOT NULL DEFAULT FALSE for flag columns.', code:'is_active   BOOLEAN NOT NULL DEFAULT TRUE,\nis_verified  BOOLEAN NOT NULL DEFAULT FALSE,\nis_deleted   BOOLEAN NOT NULL DEFAULT FALSE,\n\n-- Soft delete pattern\nCREATE INDEX idx_active_users ON users(id) WHERE is_deleted = FALSE;', caveat:'', good:'Partial index WHERE is_deleted = FALSE makes queries on active records extremely fast.' },
      mysql:      { type:'TINYINT(1) or BOOLEAN', detail:'MySQL BOOLEAN is an alias for TINYINT(1). Stores 0 (false) or 1 (true). Values 2-127 are also valid and truthy — validate at application layer.', code:'is_active  BOOLEAN NOT NULL DEFAULT TRUE,\n-- equivalent to:\nis_active  TINYINT(1) NOT NULL DEFAULT 1,\n\n-- Query\nSELECT * FROM users WHERE is_active = 1;\nSELECT * FROM users WHERE is_active = TRUE;', caveat:'Any non-zero integer is truthy in MySQL — if you accidentally store 2, it reads as true.', good:'' },
      mongodb:    { type:'Boolean', detail:'Native Boolean type. Stored efficiently. Be careful with schema-less collections — some documents might have the field as a string "true" instead of true. Use schema validation.', code:'{ is_active: true, is_verified: false }\n\n// Schema validation\n{ $jsonSchema: { properties: {\n  is_active: { bsonType: "bool" },\n  is_verified: { bsonType: "bool" }\n}}}', caveat:'"true" (string) !== true (boolean) — validate types explicitly.', good:'' },
      cassandra:  { type:'BOOLEAN', detail:'Native BOOLEAN type. No NULL handling nuances — NULL means the column is simply absent in Cassandra. Default value must be set in application logic.', code:'is_active  BOOLEAN,\nis_verified BOOLEAN,\n\n-- Querying requires ALLOW FILTERING or indexed column\nCREATE INDEX ON users(is_active);', caveat:'Cassandra secondary indexes on low-cardinality columns like booleans are inefficient. Use with care.', good:'' },
      dynamodb:   { type:'Boolean (BOOL)', detail:'Native BOOL type. False attributes should be omitted rather than stored to save storage costs. Use presence/absence of attribute for flags where possible.', code:'// Store boolean\n{ is_active: { BOOL: true }, is_verified: { BOOL: false } }\n\n// Alternative: omit the attribute for false\n// (saves space, but queries must handle missing attribute)\n{ is_active: { BOOL: true } }  // is_verified implicitly false', caveat:'Filtering on boolean attributes requires a scan unless it\'s a GSI key.', good:'' },
    },
    rules: ['Use NOT NULL DEFAULT FALSE — NULL booleans mean "unknown" which is rarely what you want','Soft-delete: add is_deleted BOOLEAN with a partial index WHERE is_deleted = FALSE','Never store "true"/"false" as strings — use native boolean types','Low-cardinality indexes (boolean) are inefficient in Cassandra — design around this','Three-valued logic: NULL AND TRUE = NULL, NULL OR FALSE = NULL — be aware in complex conditions'],
    examples:['is_active = TRUE','is_verified = FALSE','is_deleted = FALSE (soft delete)'],
    seeAlso:['enum','counter','timestamp']
  },

  'json': {
    title: 'JSON / Config / Flexible Data',
    desc: 'Semi-structured data like user preferences, feature flags, API responses, product attributes. Choose between native JSON types for queryable data and text blobs for opaque storage.',
    categories: ['document'],
    dbs: {
      postgresql: { type:'JSONB', detail:'JSONB (binary JSON) is the right choice — it\'s indexed, faster to query, and supports containment operators (@>, ?). JSON type stores raw text — use JSONB always unless you need to preserve key order.', code:'metadata    JSONB NOT NULL DEFAULT \'{}\',\nsettings    JSONB NOT NULL DEFAULT \'{}\',\n\n-- GIN index for fast containment queries\nCREATE INDEX idx_metadata ON users USING GIN(metadata);\n\n-- Query\nSELECT * FROM users WHERE metadata @> \'{"plan":"pro"}\';\nSELECT metadata->>\'city\' FROM users WHERE metadata ? \'city\';', caveat:'', good:'JSONB GIN index enables O(log n) queries on any key inside the JSON. Use @> for containment queries.' },
      mysql:      { type:'JSON', detail:'MySQL 5.7.8+ has native JSON type with validation, path expressions (->), and generated columns for indexing specific keys. Cannot index the whole JSON column — index generated columns instead.', code:'config JSON,\nsettings JSON,\n\n-- Generated column + index for specific JSON key\nALTER TABLE users ADD COLUMN plan VARCHAR(50)\n  GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(settings, "$.plan"))) VIRTUAL;\nCREATE INDEX idx_plan ON users(plan);\n\n-- Query\nSELECT settings->>"$.theme" AS theme FROM users;', caveat:'Cannot create a direct index on a JSON column — must use generated column workaround.', good:'Generated columns let you index specific JSON paths efficiently.' },
      mongodb:    { type:'Object (embedded document)', detail:'MongoDB\'s native format is BSON (binary JSON). Objects and arrays are first-class citizens. Every field is queryable and indexable without any special syntax.',  code:'{ \n  preferences: {\n    theme: "dark",\n    language: "en",\n    notifications: { email: true, push: false }\n  },\n  tags: ["devops", "kubernetes"]\n}\n\n// Index nested field\ndb.users.createIndex({ "preferences.theme": 1 })\n\n// Query nested field\ndb.users.find({ "preferences.theme": "dark" })', caveat:'', good:'Deeply nested documents are fully queryable. No JSON parsing overhead — it\'s native BSON.' },
      cassandra:  { type:'TEXT (JSON string)', detail:'Cassandra has no native JSON query support. Store JSON as TEXT. Use the JSON INSERT/SELECT syntax for convenience but data is stored as a text blob — not queryable by field.', code:'config TEXT,   -- stores JSON as raw string\n\n-- Cassandra JSON convenience syntax\nINSERT INTO users JSON \'{"id": "u1", "name": "Eknatha"}\';\nSELECT JSON * FROM users WHERE id = \'u1\';\n\n-- But config field is just text -- cannot query inside it', caveat:'JSON stored as TEXT cannot be queried by field in Cassandra. Parse in application.', good:'' },
      dynamodb:   { type:'Map (M)', detail:'DynamoDB Map type is its native equivalent of a JSON object. Nested maps and lists are first-class types. Any attribute can contain a map. Filter expressions can query nested attributes.', code:'{ \n  config: {\n    M: {\n      theme: { S: "dark" },\n      notifications: { M: {\n        email: { BOOL: true },\n        push: { BOOL: false }\n      }}\n    }\n  }\n}\n\n// Filter on nested attribute\nFilterExpression: "config.theme = :theme"\nExpressionAttributeValues: { ":theme": { S: "dark" } }', caveat:'Cannot create GSI on nested map attributes — only top-level attributes.', good:'' },
    },
    rules:['In PostgreSQL: always use JSONB over JSON — it\'s indexed and faster','Add GIN index on JSONB columns you query frequently','Keep JSON shallow — 2-3 levels max. Deep nesting makes queries painful','For frequently-queried fields: promote them to real columns instead of burying in JSON','Set a NOT NULL DEFAULT \'{}\' so JSON columns never return NULL unexpectedly'],
    examples:['{"plan":"pro","seats":5}','{"theme":"dark","language":"en"}','{"lat":12.97,"lng":77.59}'],
    seeAlso:['full-text','tags','enum']
  },

  'ip': {
    title: 'IP Address',
    desc: 'IPv4 or IPv6 addresses for logging, access control, geolocation, and rate limiting.',
    categories: ['network'],
    dbs: {
      postgresql: { type:'INET or CIDR', detail:'PostgreSQL has native INET (stores host/network) and CIDR (stores network) types. Supports subnet containment operators (<<, >>). Far superior to storing as VARCHAR.', code:'ip_address  INET NOT NULL,\nip_range    CIDR,\n\n-- Create GiST index for range queries\nCREATE INDEX idx_ip ON access_log USING GIST(ip_address inet_ops);\n\n-- Query: is IP in subnet?\nSELECT * FROM access_log WHERE ip_address << \'192.168.0.0/24\';\n-- All IPs in range\nSELECT * FROM access_log WHERE ip_address BETWEEN \'10.0.0.1\'::inet AND \'10.0.0.255\'::inet;', caveat:'', good:'<< operator checks if IP is within a subnet. Works for both IPv4 and IPv6.' },
      mysql:      { type:'VARBINARY(16)', detail:'No native IP type. Store IPv4 as INT UNSIGNED using INET_ATON()/INET_NTOA(). Store IPv4+IPv6 as VARBINARY(16). VARCHAR is the worst option — no range queries.', code:'-- IPv4 only (4 bytes)\nip_address INT UNSIGNED,\nINSERT INTO logs (ip_address) VALUES (INET_ATON(\'192.168.1.100\'));\nSELECT INET_NTOA(ip_address) FROM logs;\n\n-- IPv4 + IPv6 (16 bytes)\nip_address VARBINARY(16),\nINSERT INTO logs (ip_address) VALUES (INET6_ATON(\'2001:db8::1\'));', caveat:'VARCHAR IP cannot be used for range queries or subnet matching.', good:'INT UNSIGNED for IPv4-only is compact (4 bytes) and supports range queries.' },
      mongodb:    { type:'String or Int32/Int64', detail:'No native IP type. Store IPv4 as string ("192.168.1.1") for readability or as 32-bit integer for compact storage and range queries. IPv6 as string or Binary.', code:'// String (readable)\n{ ip: "192.168.1.100" }\n\n// Integer (compact, range queries)\n{ ip_int: 3232235876 }  // = 192.168.1.100\n\n// Range query with integer\ndb.logs.find({ ip_int: { $gte: 3232235776, $lte: 3232236031 } })', caveat:'String IPs: "192.168.1.100" sorts lexicographically, not numerically — range queries break.', good:'Integer representation enables correct numerical range queries.' },
      cassandra:  { type:'INET', detail:'CQL INET type stores IPv4 (4 bytes) and IPv6 (16 bytes) natively. Cannot be a partition key or clustering column — store as TEXT if you need to use it in the primary key.', code:'ip_address INET,\n\n-- INET as data column (not PK)\nCREATE TABLE access_log (\n  log_id TIMEUUID PRIMARY KEY,\n  ip_address INET,\n  path TEXT\n);', caveat:'INET cannot be used as partition key or clustering column.', good:'' },
      dynamodb:   { type:'String (S)', detail:'Store as String. For range queries on IPv4, store as zero-padded string ("192.168.001.100") or as an integer in Number type.', code:'// String (simple)\n{ ip: { S: "192.168.1.100" } }\n\n// Zero-padded for lexicographic range queries\n{ ip: { S: "192.168.001.100" } }\n\n// Integer for numeric range\n{ ip_int: { N: "3232235876" } }', caveat:'Unpadded IP strings sort lexicographically incorrectly (192.168.9 > 192.168.10).', good:'' },
    },
    rules:['PostgreSQL: always use INET — never VARCHAR for IP','MySQL: VARBINARY(16) handles both IPv4 and IPv6; INT UNSIGNED for IPv4-only','Always plan for IPv6 — IPv4-only solutions are increasingly a problem','For subnet range queries, only PostgreSQL has native support via << operator','For rate limiting by IP: store as integer for fast equality lookups'],
    examples:['192.168.1.100 (IPv4)','2001:db8::1 (IPv6)','10.0.0.0/8 (CIDR range)'],
    seeAlso:['url','timestamp','counter']
  },

  'url': {
    title: 'URL / URI / Link',
    desc: 'Website URLs, API endpoints, file paths, deep links. Variable length — can be long (2083 chars for IE, no limit in modern browsers).',
    categories: ['text'],
    dbs: {
      postgresql: { type:'TEXT', detail:'Use TEXT — URLs have no standard maximum length and TEXT is unlimited in PostgreSQL. Add a CHECK constraint to validate format. Add an index only if you search by exact URL.', code:'url TEXT NOT NULL,\nCONSTRAINT chk_url CHECK (url ~ \'^https?://\'),\n\n-- Functional index for normalized URL (lowercase, no trailing slash)\nCREATE INDEX idx_urls ON resources(LOWER(RTRIM(url, \'/\')));', caveat:'', good:'TEXT is more appropriate than VARCHAR(2083) — no arbitrary length limit.' },
      mysql:      { type:'VARCHAR(2048) or TEXT', detail:'VARCHAR(2048) covers most URLs. TEXT for unlimited length but cannot be fully indexed (index prefix only). Add CHECK constraint for validation (MySQL 8.0.16+).', code:'url VARCHAR(2048) NOT NULL,\nCONSTRAINT chk_url CHECK (url REGEXP \'^https?://\'),\n\n-- Prefix index (only first 768 bytes indexed)\nCREATE INDEX idx_url ON resources(url(768));', caveat:'TEXT columns in MySQL cannot be fully indexed — a prefix index covers only first N bytes.', good:'' },
      mongodb:    { type:'String', detail:'Store as String. No length limit in MongoDB documents (up to 16MB total document size). Validate format in application or with JSON Schema validation.', code:'{ url: "https://eknathalabs.com/db" }\n\n// Schema validation\n{ $jsonSchema: { properties: {\n  url: { bsonType: "string", pattern: "^https?://" }\n}}}', caveat:'', good:'' },
      cassandra:  { type:'TEXT', detail:'Store as TEXT. No built-in URL validation. Use as a regular column or as part of a primary key if querying by URL (note: long partition keys affect performance).', code:'url TEXT,\n\n-- URL as part of composite key\nCREATE TABLE url_metadata (\n  domain TEXT,\n  url TEXT,\n  title TEXT,\n  crawled_at TIMESTAMP,\n  PRIMARY KEY (domain, url)\n);', caveat:'Very long URLs as partition keys affect gossip and storage efficiency.', good:'' },
      dynamodb:   { type:'String (S)', detail:'Store as String. For lookups by URL, use as GSI partition key. For prefix queries (all URLs from a domain), store domain and path separately.', code:'{ url: { S: "https://eknathalabs.com/db" } }\n\n// For domain-based queries, split it:\n{ domain: { S: "eknathalabs.com" }, path: { S: "/db" } }', caveat:'Full URL as partition key: DynamoDB partition key max size is 2048 bytes.', good:'' },
    },
    rules:['Use TEXT not VARCHAR for URLs — no reliable maximum length','Normalize URLs before storing: lowercase scheme+host, strip trailing slashes','Store protocol (https://) always — "eknathalabs.com" is ambiguous','For domain-based queries: store domain and path in separate columns','Consider storing URL hash (SHA256) alongside URL for fast exact-match lookups'],
    examples:['https://db.eknathalabs.com','https://api.example.com/v2/users?id=42','s3://my-bucket/uploads/file.png'],
    seeAlso:['email','full-text','json']
  },

  'image': {
    title: 'Image / File / Binary Data',
    desc: 'Profile pictures, documents, videos, attachments. The database should almost never store binary file data directly — store the file in object storage (S3/GCS/Azure Blob) and the reference (URL/key) in the database.',
    categories: ['binary'],
    dbs: {
      postgresql: { type:'TEXT (URL) — not BYTEA', detail:'Store only the object storage reference (S3 URL or key) as TEXT. BYTEA (binary) in PostgreSQL works but bloats the database, makes backups huge, and bypasses CDN caching. Use BYTEA only for small thumbnails (<100KB) or encryption keys.', code:'-- Recommended: store reference only\nprofile_image_url TEXT,\nprofile_image_key  TEXT,   -- S3 object key\n\n-- Avoid for large files (but valid for small binary)\nlogo_thumbnail BYTEA,    -- OK if < 100KB\n\n-- Columns for file metadata\nfile_name     TEXT NOT NULL,\nfile_size     BIGINT,\nmime_type     TEXT,\nstorage_path  TEXT NOT NULL', caveat:'Storing large files in BYTEA bloats WAL, makes backups slow, and prevents CDN delivery.', good:'S3 object key as TEXT is simple, fast, and works with any CDN or signed URL pattern.' },
      mysql:      { type:'VARCHAR/TEXT (URL) — not BLOB', detail:'Store S3/GCS URL or key as VARCHAR/TEXT. MySQL BLOB/MEDIUMBLOB/LONGBLOB types exist but carry the same problems as BYTEA — only use for very small binary data.', code:'-- Recommended\nimage_url  VARCHAR(2048),\nimage_key  VARCHAR(1024),   -- S3 key\n\n-- File metadata\nfile_name  VARCHAR(255) NOT NULL,\nfile_size  BIGINT UNSIGNED,\nmime_type  VARCHAR(100),\n\n-- Avoid: BLOB for large files\nthumb_data BLOB,        -- OK if small < 64KB', caveat:'LONGBLOB allows up to 4GB — but this crushes database performance at scale.', good:'' },
      mongodb:    { type:'String (URL) or GridFS', detail:'For files <16MB: use Binary type (BinData). For files >16MB: use GridFS, which splits files into 255KB chunks stored across two collections. For anything served via HTTP, store URL instead.', code:'// Reference only (recommended)\n{ profile_image: "https://cdn.example.com/images/user42.jpg" }\n\n// Small inline binary (< 1MB)\n{ icon: { $binary: { base64: "...", subType: "00" } } }\n\n// GridFS for large files\nconst bucket = new GridFSBucket(db);\nbucket.openUploadStream("filename.jpg")', caveat:'GridFS has higher read latency than direct S3 access.', good:'MongoDB GridFS is useful for file versioning alongside document metadata.' },
      cassandra:  { type:'TEXT (URL) or BLOB', detail:'Store S3/GCS URL as TEXT. Cassandra BLOB type (alias: BINARY) stores arbitrary binary. Individual cell size limit is ~2GB but practical limit is much lower for performance.', code:'image_url  TEXT,\nimage_key  TEXT,\n\n-- For small thumbnails\nthumb_data BLOB,\n\n-- File metadata\nfile_name  TEXT,\nfile_size  BIGINT,\nmime_type  TEXT', caveat:'Large BLOBs in Cassandra cause compaction and read issues. Keep per-cell data small.', good:'' },
      dynamodb:   { type:'String (S) — URL only', detail:'DynamoDB item size limit is 400KB — you cannot store images. Always store S3/GCS URL or key as a String attribute. Use S3 pre-signed URLs for temporary secure access.', code:'{ \n  image_key: { S: "uploads/users/42/profile.jpg" },\n  image_url: { S: "https://cdn.example.com/..." },\n  mime_type: { S: "image/jpeg" },\n  file_size: { N: "48291" }\n}', caveat:'400KB item limit — impossible to store images in DynamoDB items.', good:'Use S3 pre-signed URLs for time-limited secure access to private files.' },
    },
    rules:['NEVER store large files (>100KB) in the database — use S3, GCS, or Azure Blob Storage','Store the S3 object key (not full URL) — URLs can change if you change CDN, keys do not','Always store file metadata: name, size, mime_type, uploaded_at alongside the key','Generate pre-signed URLs at request time — do not store signed URLs (they expire)','For image processing: use a dedicated service (Cloudinary, imgix, AWS Lambda) triggered on upload'],
    examples:['uploads/users/42/profile.jpg (S3 key)','https://cdn.example.com/img/42.jpg (CDN URL)'],
    seeAlso:['url','uuid','json']
  },

  'coordinates': {
    title: 'Geographic Coordinates (Lat/Lng)',
    desc: 'Latitude and longitude for maps, geofencing, nearby search, and distance calculations.',
    categories: ['numeric','special'],
    dbs: {
      postgresql: { type:'POINT or GEOGRAPHY (PostGIS)', detail:'Native POINT type for simple storage. PostGIS extension adds GEOGRAPHY type with earth-aware distance calculations, geofencing, and spatial indexes. PostGIS is the most powerful geospatial option.', code:'-- Without PostGIS (simple storage)\nlat DOUBLE PRECISION NOT NULL CHECK (lat BETWEEN -90 AND 90),\nlng DOUBLE PRECISION NOT NULL CHECK (lng BETWEEN -180 AND 180),\n\n-- With PostGIS (recommended for geo queries)\nCREATE EXTENSION postgis;\nlocation GEOGRAPHY(POINT, 4326),\n\nINSERT INTO places (location)\nVALUES (ST_GeogFromText(\'SRID=4326;POINT(77.5946 12.9716)\'));\n\n-- Distance in meters\nSELECT name FROM places\nWHERE ST_DWithin(location, ST_GeogFromText(\'POINT(77.5946 12.9716)\'), 5000);\n\n-- Create spatial index\nCREATE INDEX idx_location ON places USING GIST(location);', caveat:'', good:'ST_DWithin with spatial GIST index makes nearby search extremely fast even at millions of rows.' },
      mysql:      { type:'POINT (spatial)', detail:'MySQL 5.7+ has native spatial types and functions. POINT stores lat/lng. SPATIAL INDEX enables fast geographic queries using MBR (Minimum Bounding Rectangle) intersection.', code:'location POINT NOT NULL SRID 4326,\nCREATE SPATIAL INDEX idx_location ON places(location);\n\nINSERT INTO places (location)\nVALUES (ST_GeomFromText(\'POINT(77.5946 12.9716)\', 4326));\n\n-- Distance in meters\nSELECT name,\n  ST_Distance_Sphere(location, ST_GeomFromText(\'POINT(77.5946 12.9716)\', 4326)) AS dist\nFROM places ORDER BY dist LIMIT 10;', caveat:'MySQL spatial functions are less complete than PostGIS — complex geospatial analysis requires PostGIS.', good:'SRID 4326 = WGS 84 — the standard coordinate system used by GPS.' },
      mongodb:    { type:'GeoJSON (2dsphere index)', detail:'MongoDB stores coordinates as GeoJSON objects and supports 2dsphere indexes for earth-aware distance queries. $near, $geoWithin, $geoIntersects operators built-in.', code:'{ \n  location: {\n    type: "Point",\n    coordinates: [77.5946, 12.9716]  // [lng, lat] — note ORDER!\n  }\n}\n\n// 2dsphere index\ndb.places.createIndex({ location: "2dsphere" })\n\n// Nearby search (within 5km)\ndb.places.find({\n  location: {\n    $near: {\n      $geometry: { type: "Point", coordinates: [77.5946, 12.9716] },\n      $maxDistance: 5000\n    }\n  }\n})', caveat:'GeoJSON uses [longitude, latitude] order — the OPPOSITE of the usual lat,lng convention. This is a common source of bugs.', good:'$geoWithin with $centerSphere for radius search, $geoIntersects for polygon geofencing.' },
      cassandra:  { type:'DOUBLE (separate lat/lng columns)', detail:'No native geospatial support. Store lat/lng as separate DOUBLE columns. For geo queries, use DataStax Astra DB (has geosearch) or do client-side filtering.', code:'lat DOUBLE,\nlng DOUBLE,\n\n-- Approximate bounding box query (not accurate for large distances)\nSELECT * FROM places\nWHERE lat > 12.9 AND lat < 13.0\n  AND lng > 77.5 AND lng < 77.7\nALLOW FILTERING;', caveat:'ALLOW FILTERING is slow on large datasets. No native spatial index or earth-accurate distance.', good:'' },
      dynamodb:   { type:'Number (N) — separate lat/lng', detail:'No native geospatial support. Store lat/lng as Number attributes. Use the DynamoDB Geo Library (open source, Uber) for geohash-based indexing and nearby search.', code:'{ lat: { N: "12.9716" }, lng: { N: "77.5946" } }\n\n// DynamoDB Geo Library (geohash approach)\n// Stores geohash as the sort key for range-based geo queries\n{ PK: { S: "PLACE" }, SK: { S: "tjp8gr#place-id-123" } }', caveat:'No built-in geo queries. For production geo search, use a dedicated service or Elasticsearch.', good:'' },
    },
    rules:['GeoJSON uses [longitude, latitude] — opposite of the common lat,lng convention. Very common bug.','Use WGS 84 (SRID 4326) — the coordinate system used by GPS and Google Maps','PostgreSQL + PostGIS is the gold standard for geospatial data','For nearby search at scale, also consider Elasticsearch geo_point + geo_distance','Always validate: lat ∈ [-90, 90], lng ∈ [-180, 180]'],
    examples:['lat: 12.9716, lng: 77.5946 (Bengaluru)','[77.5946, 12.9716] (GeoJSON — lng,lat order!)','POINT(77.5946 12.9716) (WKT format)'],
    seeAlso:['json','price','timestamp']
  },

  'phone': {
    title: 'Phone Number',
    desc: 'Mobile and landline numbers. International formats vary wildly — store in E.164 format (+919876543210) and never try to parse or validate with simple regex.',
    categories: ['text'],
    dbs: {
      postgresql: { type:'VARCHAR(20) or TEXT', detail:'Store in E.164 format (+[country code][number]). E.164 max is 15 digits + "+" prefix = 16 chars. Use VARCHAR(20) for safety. Never store formatted strings like "(080) 123-4567".', code:'phone VARCHAR(20),\nCONSTRAINT chk_phone CHECK (phone ~ \'^\\+[1-9]\\d{6,14}$\'),\n\n-- Separate country code if needed for filtering\nphone_e164    VARCHAR(20) NOT NULL,   -- +919876543210\ncountry_code  CHAR(2) NOT NULL,       -- IN\n\n-- Index for exact lookup\nCREATE UNIQUE INDEX idx_phone ON users(phone_e164);', caveat:'', good:'E.164: +[country][number], no spaces/dashes. Universal format that works with all SMS/call APIs.' },
      mysql:      { type:'VARCHAR(20)', detail:'Store E.164 format in VARCHAR(20). Add CHECK constraint (MySQL 8.0.16+) for basic validation. Use libphonenumber in application for authoritative validation.', code:'phone VARCHAR(20) NOT NULL,\nCONSTRAINT chk_phone CHECK (phone REGEXP \'^\\\\+[1-9][0-9]{6,14}$\'),\n\n-- Add index if you query by phone\nCREATE UNIQUE INDEX idx_phone ON users(phone);', caveat:'Regex cannot fully validate phone numbers — different countries have different formats. Use libphonenumber.', good:'' },
      mongodb:    { type:'String', detail:'Store E.164 as String with format validation. Use JSON Schema validation in MongoDB to enforce format on insert.', code:'{ phone: "+919876543210" }\n\n// Schema validation\n{ $jsonSchema: { properties: {\n  phone: {\n    bsonType: "string",\n    pattern: "^\\\\+[1-9][0-9]{6,14}$",\n    description: "E.164 format required"\n  }\n}}}', caveat:'', good:'' },
      cassandra:  { type:'TEXT', detail:'Store E.164 format as TEXT. Validate in application. Can be used as partition key for phone-based lookups (e.g. OTP verification table).', code:'CREATE TABLE users_by_phone (\n  phone TEXT PRIMARY KEY,\n  user_id UUID,\n  name TEXT\n);\n\n-- OTP table\nCREATE TABLE otp_codes (\n  phone TEXT,\n  code TEXT,\n  expires_at TIMESTAMP,\n  PRIMARY KEY (phone)\n) WITH default_time_to_live = 300;', caveat:'', good:'TTL on OTP table auto-expires codes after 5 minutes — no cleanup job needed.' },
      dynamodb:   { type:'String (S)', detail:'Store E.164 as String. Use as GSI partition key for "get user by phone" lookups. Store without formatting for consistent queries.', code:'{ phone: { S: "+919876543210" } }\n\n// GSI for phone-based lookup\nGSI: { IndexName: "PhoneIndex", KeySchema: [{ phone: HASH }] }', caveat:'', good:'' },
    },
    rules:['Store in E.164 format: +[country code][number] — no spaces, dashes, or parentheses','Use libphonenumber (Google) for validation — simple regex misses many valid formats','Store raw digits for programmatic use; format for display only in the UI','Keep country_code as a separate column if you need to filter by country','Phone numbers are PII — encrypt at rest if regulatory compliance requires it'],
    examples:['+919876543210 (India)','+14155552671 (US)','+442071838750 (UK)'],
    seeAlso:['email','boolean','uuid']
  },

  'counter': {
    title: 'Counter / Score / Sequence',
    desc: 'Incrementing numbers: page views, vote counts, inventory levels, leaderboard scores. Requires atomic operations to avoid race conditions.',
    categories: ['numeric'],
    dbs: {
      postgresql: { type:'BIGINT or NUMERIC', detail:'BIGINT for counts/scores (8 bytes, up to 9 quintillion). Use atomic UPDATE with no SELECT-then-UPDATE pattern. PostgreSQL advisory locks or FOR UPDATE for complex counting logic.', code:'-- Simple counter column\nview_count  BIGINT NOT NULL DEFAULT 0,\nlike_count  BIGINT NOT NULL DEFAULT 0,\nstock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),\n\n-- Atomic increment (safe from race conditions)\nUPDATE posts SET view_count = view_count + 1 WHERE id = $1;\n\n-- Atomic decrement with floor (prevent negative stock)\nUPDATE products\nSET stock = GREATEST(stock - $qty, 0)\nWHERE id = $1 AND stock >= $qty\nRETURNING stock;', caveat:'SELECT count, then UPDATE in separate query has a race condition — always use single-statement UPDATE.', good:'RETURNING clause gives you the new value after update without a second SELECT.' },
      mysql:      { type:'BIGINT UNSIGNED', detail:'BIGINT UNSIGNED for non-negative counters (0 to 18.4 quintillion). Atomic UPDATE in a single statement. Use transactions for conditional decrements.', code:'view_count BIGINT UNSIGNED NOT NULL DEFAULT 0,\nstock      INT UNSIGNED NOT NULL DEFAULT 0,\n\n-- Atomic increment\nUPDATE posts SET view_count = view_count + 1 WHERE id = ?;\n\n-- Conditional decrement (prevent negative)\nUPDATE products\nSET stock = stock - ?\nWHERE id = ? AND stock >= ?;', caveat:'', good:'BIGINT UNSIGNED prevents negative values at the type level — extra safety.' },
      mongodb:    { type:'Int32 or Int64 (NumberLong)', detail:'Use $inc operator for atomic increments — never read-modify-write. findOneAndUpdate with $inc is atomic and returns the new value.', code:'// Atomic increment\ndb.posts.updateOne(\n  { _id: postId },\n  { $inc: { viewCount: 1 } }\n)\n\n// Atomic decrement with floor (no negative stock)\ndb.products.findOneAndUpdate(\n  { _id: productId, stock: { $gte: qty } },\n  { $inc: { stock: -qty } },\n  { returnDocument: "after" }\n)', caveat:'Never read the count then update it in a separate operation — race condition.', good:'$inc is atomic at the document level — safe for high-concurrency counters.' },
      cassandra:  { type:'COUNTER', detail:'Cassandra has a dedicated COUNTER column type that supports distributed atomic increments across nodes. Counter tables cannot have non-counter, non-key columns.', code:'-- Counter table (separate from main data table)\nCREATE TABLE post_counters (\n  post_id UUID PRIMARY KEY,\n  views   COUNTER,\n  likes   COUNTER,\n  shares  COUNTER\n);\n\n-- Atomic increment\nUPDATE post_counters SET views = views + 1 WHERE post_id = ?;\n\n-- Cannot SET a counter to a specific value (only +/- delta)', caveat:'COUNTER columns must be in a dedicated table — cannot mix with regular columns. Cannot reset to exact value.', good:'Distributed atomic increments — safe across all Cassandra nodes without coordination.' },
      dynamodb:   { type:'Number (N) with ADD update expression', detail:'Use ADD update expression for atomic increments. Set condition expression to prevent negative values. For high-traffic counters, use sharded counters pattern.', code:'// Atomic increment\naws dynamodb update-item \\\n  --key \'{"postId":{"S":"p1"}}\' \\\n  --update-expression "ADD viewCount :one" \\\n  --expression-attribute-values \'{ ":one": {"N":"1"} }\'\n\n// Atomic decrement with floor\n--update-expression "ADD stock :neg" \\\n--condition-expression "stock >= :qty" \\\n--expression-attribute-values \'{ ":neg":{"N":"-5"}, ":qty":{"N":"5"} }\'', caveat:'Very high-frequency counters (>1000/sec on same key) can cause hot partitions.', good:'Conditional expression prevents over-decrement. For viral counters: use sharded counter pattern.' },
    },
    rules:['Always use atomic single-statement increments — never SELECT-then-UPDATE','Use BIGINT not INT — counters grow unexpectedly','For high-frequency counters: buffer increments in Redis, flush to DB periodically','Cassandra COUNTER type is atomic across distributed nodes — ideal for global view counts','Prevent negative inventory: add a CHECK (stock >= 0) constraint or conditional update'],
    examples:['view_count = view_count + 1','like_count BIGINT DEFAULT 0','COUNTER type in Cassandra'],
    seeAlso:['price','boolean','uuid']
  },

  'vector': {
    title: 'ML Vector / Embedding',
    desc: 'High-dimensional float arrays produced by ML models (OpenAI, Cohere, HuggingFace) for semantic search, recommendations, and RAG pipelines.',
    categories: ['special'],
    dbs: {
      postgresql: { type:'vector(dimensions) — pgvector', detail:'pgvector extension adds a native vector type with HNSW and IVFFlat indexes for fast approximate nearest neighbor (ANN) search. Keeps vectors alongside your relational data — no separate vector database needed.', code:'-- Install extension\nCREATE EXTENSION IF NOT EXISTS vector;\n\n-- Add vector column (OpenAI text-embedding-3-small = 1536 dims)\narticle_embedding vector(1536),\n\n-- HNSW index (best for most use cases)\nCREATE INDEX ON articles\n  USING hnsw (article_embedding vector_cosine_ops)\n  WITH (m = 16, ef_construction = 64);\n\n-- Semantic similarity search (cosine distance)\nSELECT title, 1 - (article_embedding <=> $query_vector) AS similarity\nFROM articles\nORDER BY article_embedding <=> $query_vector\nLIMIT 10;', caveat:'Exact kNN search (no index) is O(n) — always create an HNSW index for production.', good:'<=> cosine distance, <-> L2 distance, <#> inner product. HNSW gives excellent recall at scale.' },
      mysql:      { type:'JSON or BLOB (no native support)', detail:'MySQL has no native vector type or ANN index. For small datasets (<100K vectors), store as JSON array and do exact search in application. For production vector search, use a dedicated vector DB alongside MySQL.', code:'-- Store as JSON array (limited, no ANN index)\nembedding JSON,\n\n-- Or as BLOB (compact but no query support)\nembedding BLOB,\n\n-- For production: store ID + metadata in MySQL,\n-- actual vectors in pgvector/Pinecone/Weaviate', caveat:'No ANN index — any similarity search requires loading all vectors into application memory. Not viable at scale.', good:'' },
      mongodb:    { type:'Array + Atlas Vector Search', detail:'MongoDB Atlas has built-in Vector Search with HNSW indexing. Self-hosted MongoDB stores vectors as arrays but has no ANN index — use Atlas for production vector search.', code:'// Store as array\n{ \n  _id: "doc1",\n  content: "Kubernetes best practices...",\n  embedding: [0.023, -0.014, 0.891, ...]  // 1536 floats\n}\n\n// Atlas Vector Search index\n{ "fields": [{\n  "type": "vector",\n  "path": "embedding",\n  "numDimensions": 1536,\n  "similarity": "cosine"\n}]}\n\n// $vectorSearch aggregation stage\n{ $vectorSearch: { queryVector: [...], path: "embedding", numCandidates: 100, limit: 10 }}', caveat:'Self-hosted MongoDB has no vector index — Atlas only. Self-hosted: load all into memory for brute-force search.', good:'Atlas Vector Search supports hybrid search: combine vector similarity with metadata filters.' },
      cassandra:  { type:'list<float> (no ANN index)', detail:'Store as list<float>. No native ANN index in open-source Cassandra. DataStax Astra DB (managed Cassandra) has vector search support. Self-hosted: use alongside pgvector or Weaviate.', code:'embedding list<float>,\n\n-- DataStax Astra DB (managed) has vector search:\nCREATE TABLE docs (\n  id UUID PRIMARY KEY,\n  content TEXT,\n  embedding vector<float, 1536>\n) WITH additional_write_policy = \'99p\';\n\nCREATE CUSTOM INDEX ON docs(embedding)\n  USING \'StorageAttachedIndex\';', caveat:'Open-source Cassandra has no ANN index. Similarity search requires full scan.', good:'' },
      dynamodb:   { type:'List (L) or String (compressed) — use external vector DB', detail:'DynamoDB has no vector support. Store vector ID and metadata in DynamoDB, actual vectors in a dedicated vector database (Pinecone, Weaviate, Qdrant, pgvector). DynamoDB item size limit (400KB) also limits vector size.', code:'// DynamoDB: store metadata + vector ID\n{ id: { S: "doc1" }, content: { S: "..." }, vector_id: { S: "doc1" } }\n\n// Actual vector in pgvector/Pinecone:\nvector_db.upsert("doc1", embedding=[0.023, ...])\n\n// Query flow:\n// 1. vector_db.query(query_embedding, top_k=10) → [ids]\n// 2. dynamodb.batch_get_item(ids) → [metadata]', caveat:'400KB item limit: a 1536-dim float32 vector = 6KB — theoretically fits but wastes DynamoDB capacity units.', good:'Best pattern: DynamoDB for metadata + pgvector/Pinecone for vectors.' },
    },
    rules:['PostgreSQL + pgvector is the simplest production choice — no separate vector DB infrastructure','HNSW index is faster for search; IVFFlat uses less memory — HNSW recommended for most cases','Normalize embeddings before storing if using cosine similarity (divide by L2 norm)','Chunk long documents to 512 tokens before embedding for best recall','Store the model name/version alongside the embedding — re-embed when you upgrade models'],
    examples:['vector(1536) — OpenAI text-embedding-3-small','vector(768) — Cohere embed-english-v3','vector(384) — BAAI/bge-small-en'],
    seeAlso:['json','image','full-text']
  },

  'enum': {
    title: 'Enum / Status / Category',
    desc: 'Fixed set of allowed string values: order status (pending, processing, shipped, delivered), user role (admin, editor, viewer), subscription plan (free, pro, enterprise).',
    categories: ['primitive'],
    dbs: {
      postgresql: { type:'TEXT with CHECK or enum type', detail:'Two options: CREATE TYPE as enum (fast, enforced by DB) or TEXT with CHECK constraint (flexible, easier to migrate). TEXT + CHECK is recommended — adding new values to a DB enum requires ALTER TYPE which can lock tables.', code:'-- Option 1: TEXT + CHECK (recommended for flexibility)\nstatus TEXT NOT NULL DEFAULT \'pending\'\n  CHECK (status IN (\'pending\',\'processing\',\'shipped\',\'delivered\',\'cancelled\')),\n\n-- Option 2: CREATE TYPE enum (strict, but harder to alter)\nCREATE TYPE order_status AS ENUM (\'pending\',\'processing\',\'shipped\',\'delivered\');\nstatus order_status NOT NULL DEFAULT \'pending\',\n\n-- Index for status-based queries\nCREATE INDEX idx_orders_status ON orders(status);', caveat:'ALTER TYPE ... ADD VALUE requires ACCESS EXCLUSIVE lock in older PostgreSQL. Use TEXT+CHECK for frequently-changing enums.', good:'TEXT+CHECK is easier to evolve — just update the CHECK constraint. New values work immediately.' },
      mysql:      { type:"ENUM('val1','val2',...)", detail:"MySQL has a native ENUM type that stores values as integers internally — compact storage but painful to alter. Adding/removing values requires ALTER TABLE which locks the table. Consider VARCHAR with application-level validation instead.", code:"status ENUM('pending','processing','shipped','delivered','cancelled')\n  NOT NULL DEFAULT 'pending',\n\n-- Alternative: VARCHAR with application constraint\nstatus VARCHAR(20) NOT NULL DEFAULT 'pending',\n\n-- Index\nCREATE INDEX idx_status ON orders(status);", caveat:'ALTER TABLE to add ENUM values requires table reconstruction in older MySQL — can be slow on large tables.', good:'Native ENUM uses 1-2 bytes vs VARCHAR. Compact and enforced by DB.' },
      mongodb:    { type:'String with validation', detail:'No native enum type. Store as String and enforce via JSON Schema validation ($jsonSchema). Validation is enforced at insert/update time.', code:'// JSON Schema validation\ndb.runCommand({ collMod: "orders",\n  validator: {\n    $jsonSchema: { properties: {\n      status: {\n        bsonType: "string",\n        enum: ["pending","processing","shipped","delivered","cancelled"],\n        description: "must be a valid status"\n      }\n    }}\n  }\n})\n\n// Query by status\ndb.orders.find({ status: "shipped" })\ndb.orders.createIndex({ status: 1 })', caveat:'Without validation, any string can be stored — validation is optional, not enforced at the storage layer.', good:'' },
      cassandra:  { type:'TEXT', detail:'No native enum type. Store as TEXT. Validation must happen in the application layer. Low-cardinality columns like status should not have secondary indexes in Cassandra — design tables around status-based access patterns.', code:'status TEXT,\n\n-- Table per status for high-volume queries\nCREATE TABLE orders_by_status (\n  status TEXT,\n  order_id TIMEUUID,\n  user_id UUID,\n  total DECIMAL,\n  PRIMARY KEY (status, order_id)\n) WITH CLUSTERING ORDER BY (order_id DESC);', caveat:'Secondary index on low-cardinality status column is inefficient. Model a separate table instead.', good:'Partition by status enables fast "get all pending orders" queries — Cassandra\'s strength.' },
      dynamodb:   { type:'String (S)', detail:'Store as String. Use condition expressions to validate on write. For status-based queries, create a GSI with status as the partition key.', code:'{ status: { S: "pending" } }\n\n// Condition expression to validate on write\n--condition-expression "attribute_not_exists(id) OR\n  status IN (:s1,:s2,:s3,:s4)"\n\n// GSI for status-based queries\nGSI: { IndexName: "StatusIndex",\n  KeySchema: [{ status: HASH }, { created_at: RANGE }] }', caveat:'No native enum enforcement — application must validate values.', good:'GSI on (status, created_at) enables "get all pending orders sorted by date" efficiently.' },
    },
    rules:['Prefer TEXT+CHECK over database enum types — easier to evolve the list of values','Always index status/category columns — they are almost always used in WHERE clauses','In Cassandra: model a separate table per status value for high-cardinality access patterns','Keep enum values lowercase_with_underscores — consistent format prevents bugs','Document all valid values and their meaning — enum values become implicit business logic'],
    examples:['status: pending → processing → shipped → delivered','role: admin | editor | viewer','plan: free | pro | enterprise'],
    seeAlso:['boolean','json','counter']
  },

  'full-text': {
    title: 'Full-Text / Long Content',
    desc: 'Article body, blog posts, product descriptions, comments, documents. Needs full-text search with ranking, stemming, and stop word filtering.',
    categories: ['text'],
    dbs: {
      postgresql: { type:'TEXT + tsvector index', detail:'Store content as TEXT. Add a generated tsvector column for full-text search. GIN index on tsvector enables fast ranked full-text search. For complex search, consider Elasticsearch alongside PostgreSQL.', code:'-- Content column\ncontent TEXT NOT NULL,\ntitle   TEXT NOT NULL,\n\n-- Generated tsvector for search (pg 12+)\nsearch_vector tsvector GENERATED ALWAYS AS (\n  setweight(to_tsvector(\'english\', coalesce(title, \'\')), \'A\') ||\n  setweight(to_tsvector(\'english\', coalesce(content, \'\')), \'B\')\n) STORED,\n\n-- GIN index on the vector\nCREATE INDEX idx_search ON articles USING GIN(search_vector);\n\n-- Full-text search with ranking\nSELECT title, ts_rank(search_vector, query) AS rank\nFROM articles, plainto_tsquery(\'english\', \'kubernetes devops\') query\nWHERE search_vector @@ query\nORDER BY rank DESC\nLIMIT 20;', caveat:'PostgreSQL FTS has no fuzzy/typo tolerance. For typo-tolerant search: pg_trgm extension or Elasticsearch.', good:'setweight gives title matches (A) higher rank than body (B) — results feel relevant.' },
      mysql:      { type:'TEXT/LONGTEXT + FULLTEXT index', detail:'MySQL FULLTEXT index on TEXT/LONGTEXT columns. Natural language mode (default) and boolean mode (+must, -exclude). Only InnoDB and MyISAM support FULLTEXT.', code:'title   VARCHAR(500) NOT NULL,\ncontent LONGTEXT NOT NULL,\n\n-- Full-text index\nALTER TABLE articles ADD FULLTEXT INDEX idx_fts (title, content);\n\n-- Natural language search\nSELECT *, MATCH(title, content) AGAINST (\'kubernetes devops\') AS score\nFROM articles\nWHERE MATCH(title, content) AGAINST (\'kubernetes devops\')\nORDER BY score DESC;\n\n-- Boolean mode\nSELECT * FROM articles\nWHERE MATCH(title,content) AGAINST (\'+kubernetes -docker\' IN BOOLEAN MODE);', caveat:'Words shorter than ft_min_word_len (default 4) are ignored. Very common short words are stopwords.', good:'Boolean mode: +word (must have), -word (must not), "phrase" (exact), word* (prefix).' },
      mongodb:    { type:'String + text index', detail:'MongoDB text indexes support full-text search with language stemming, stop words, and weighted fields. Single text index per collection. For advanced search, use Atlas Search (Lucene-based) on MongoDB Atlas.', code:'{ title: "Kubernetes Tutorial", content: "A guide to..." }\n\n// Text index with field weights\ndb.articles.createIndex(\n  { title: "text", content: "text" },\n  { weights: { title: 10, content: 1 }, name: "article_search" }\n)\n\n// Full-text search\ndb.articles.find(\n  { $text: { $search: "kubernetes devops" } },\n  { score: { $meta: "textScore" } }\n).sort({ score: { $meta: "textScore" } })', caveat:'Only one text index per collection. $text search cannot combine with most other query operators.', good:'Atlas Search (on Atlas) is far more powerful — fuzzy, autocomplete, facets, highlighting.' },
      cassandra:  { type:'TEXT (no built-in FTS)', detail:'Cassandra has no full-text search. Store content as TEXT. For full-text search, use Elasticsearch or OpenSearch alongside Cassandra — Cassandra stores the data, Elasticsearch provides search.', code:'title   TEXT,\ncontent TEXT,\n\n-- No full-text index in Cassandra.\n-- Use dual-write to Elasticsearch:\n-- 1. Write to Cassandra (primary store)\n-- 2. Index in Elasticsearch (search layer)\n-- 3. Search: ES → get IDs → Cassandra.get(ids)\n\n-- DataStax Search (DSE) adds Solr FTS to Cassandra\n-- but requires DataStax Enterprise license', caveat:'No built-in full-text search in Apache Cassandra. Requires external search engine.', good:'' },
      dynamodb:   { type:'String (S) — use Elasticsearch for search', detail:'DynamoDB has no full-text search. Store content in DynamoDB. Stream changes to Elasticsearch or OpenSearch via DynamoDB Streams + Lambda for full-text indexing.', code:'{ title: { S: "K8s Tutorial" }, content: { S: "..." } }\n\n// DynamoDB Streams → Lambda → OpenSearch pattern:\n// 1. Item written to DynamoDB\n// 2. DynamoDB Stream triggers Lambda\n// 3. Lambda indexes item in OpenSearch\n// 4. Search query → OpenSearch → get IDs → DynamoDB.get(ids)', caveat:'No built-in full-text search in DynamoDB.', good:'DynamoDB Streams → Lambda → OpenSearch is the standard AWS pattern for DynamoDB + search.' },
    },
    rules:['Store content as TEXT — never truncate article body in the database','Add a full-text search column (tsvector in PostgreSQL) alongside raw content','For complex search needs: Elasticsearch/OpenSearch is superior to database FTS','Index title with higher weight than body — title matches should rank higher','Consider pg_trgm extension for fuzzy/typo-tolerant search in PostgreSQL'],
    examples:['TEXT column for article body','tsvector generated column in PostgreSQL','text index in MongoDB'],
    seeAlso:['json','url','tags']
  },

  'tags': {
    title: 'Tags / Array / Multi-value',
    desc: 'List of strings — article tags, user interests, product categories, permissions. Querying "find all items with tag X" is the key access pattern.',
    categories: ['array'],
    dbs: {
      postgresql: { type:'TEXT[] (array) or junction table', detail:'TEXT[] for simple tag arrays with GIN index for fast containment queries. Junction table (many-to-many) for tags with their own attributes (color, description) or when tags are shared entities.', code:'-- Simple array (recommended for simple tags)\ntags TEXT[] NOT NULL DEFAULT \'{}\',\n\n-- GIN index for fast containment queries\nCREATE INDEX idx_tags ON articles USING GIN(tags);\n\n-- Query: articles tagged "kubernetes"\nSELECT * FROM articles WHERE tags @> ARRAY[\'kubernetes\'];\n\n-- Query: articles with any of these tags\nSELECT * FROM articles WHERE tags && ARRAY[\'kubernetes\',\'devops\'];\n\n-- Junction table (tags are shared entities)\nCREATE TABLE article_tags (article_id BIGINT, tag_id INT, PRIMARY KEY (article_id, tag_id));\nCREATE INDEX idx_tag_articles ON article_tags(tag_id);', caveat:'Arrays cannot have foreign key constraints. Junction table is more normalized but more complex.', good:'@> (contains) and && (overlap) operators with GIN index are O(log n) — very fast.' },
      mysql:      { type:'JSON array or junction table', detail:'No native array type in MySQL. Store as JSON array (MySQL 5.7.8+) with a generated column + index for specific tag queries. Junction table is the standard relational approach.', code:'-- JSON array\ntags JSON NOT NULL DEFAULT \'[]\',\n\n-- Cannot directly index JSON array for containment queries\n-- Use JSON_CONTAINS for queries (slow without generated column)\nSELECT * FROM articles WHERE JSON_CONTAINS(tags, \'"kubernetes"\');\n\n-- Better: junction table\nCREATE TABLE article_tags (\n  article_id BIGINT NOT NULL,\n  tag        VARCHAR(100) NOT NULL,\n  PRIMARY KEY (article_id, tag),\n  INDEX idx_tag (tag)\n);', caveat:'JSON_CONTAINS without a generated column index does a full table scan.', good:'Junction table with index on tag column enables fast "get all articles with tag X".' },
      mongodb:    { type:'Array of strings', detail:'Arrays are first-class in MongoDB. Create a multikey index on the array field — MongoDB automatically creates an index entry for each array element.', code:'{ tags: ["kubernetes", "devops", "platform-engineering"] }\n\n// Multikey index (auto-created for array fields)\ndb.articles.createIndex({ tags: 1 })\n\n// Query: has tag\ndb.articles.find({ tags: "kubernetes" })\n\n// Query: has all these tags\ndb.articles.find({ tags: { $all: ["kubernetes", "devops"] } })\n\n// Query: has any of these tags\ndb.articles.find({ tags: { $in: ["kubernetes", "docker"] } })\n\n// Aggregation: most popular tags\ndb.articles.aggregate([\n  { $unwind: "$tags" },\n  { $group: { _id: "$tags", count: { $sum: 1 } } },\n  { $sort: { count: -1 } }, { $limit: 20 }\n])', caveat:'Multikey indexes cannot have compound indexes where both fields are arrays.', good:'MongoDB arrays are the most natural way to store tags — no junction table needed.' },
      cassandra:  { type:'SET<TEXT> or LIST<TEXT>', detail:'SET<TEXT> stores unique tags (no duplicates). LIST<TEXT> maintains insertion order. Both support element-level mutations (add/remove single tag without rewriting the whole collection).', code:'tags SET<TEXT>,\n\n-- Add a tag\nUPDATE articles SET tags = tags + {\'kubernetes\'} WHERE id = ?;\n\n-- Remove a tag\nUPDATE articles SET tags = tags - {\'outdated\'} WHERE id = ?;\n\n-- Cannot query by tag without ALLOW FILTERING (full scan)\n-- Model a separate inverted index table:\nCREATE TABLE articles_by_tag (\n  tag        TEXT,\n  article_id UUID,\n  title      TEXT,\n  PRIMARY KEY (tag, article_id)\n);', caveat:'Cannot query "find articles with tag X" without ALLOW FILTERING — model an inverted index table.', good:'SET<TEXT> automatically deduplicates tags. Use it over LIST<TEXT> for tags.' },
      dynamodb:   { type:'String Set (SS) or List (L)', detail:'String Set (SS) type natively stores unique string values — perfect for tags. Supports atomic ADD/DELETE of individual elements. Use CONTAINS filter expression for tag queries (requires scan without GSI).', code:'{ tags: { SS: ["kubernetes", "devops", "platform-engineering"] } }\n\n// Add a tag atomically\n--update-expression "ADD tags :tag"\n--expression-attribute-values \'{ ":tag": { "SS": ["cloud"] } }\'\n\n// Remove a tag atomically\n--update-expression "DELETE tags :tag"\n\n// Filter by tag (scans table -- use GSI if querying by tag often)\nFilterExpression: "contains(tags, :tag)"\nExpressionAttributeValues: { ":tag": { S: "kubernetes" } }', caveat:'FilterExpression with contains() scans the full table. For tag-based queries at scale, maintain a separate inverted index table.', good:'String Set (SS) automatically deduplicates — same guarantee as PostgreSQL array with UNIQUE.' },
    },
    rules:['PostgreSQL arrays with GIN index are the simplest and fastest solution for tags','For tag counts/analytics: maintain a separate tag_counts table, updated on write','MongoDB multikey index on array fields makes tag queries O(log n) — very fast','In Cassandra: always model an inverted index table (tag → articles) for tag-based lookups','Normalize tag values before storing: lowercase, trim whitespace, singular form'],
    examples:['tags: ["kubernetes","devops","cka"]','TEXT[] in PostgreSQL','SET<TEXT> in Cassandra'],
    seeAlso:['full-text','json','enum']
  },
};

const dtpCategoryMeta = [
  {id:'text',       icon:'📝', label:'Text & String'},
  {id:'numeric',    icon:'🔢', label:'Numbers'},
  {id:'datetime',   icon:'🕐', label:'Date & Time'},
  {id:'identifier', icon:'🔑', label:'IDs & Keys'},
  {id:'primitive',  icon:'⚡', label:'Primitives'},
  {id:'document',   icon:'📄', label:'Documents'},
  {id:'network',    icon:'🌐', label:'Network'},
  {id:'binary',     icon:'📦', label:'Files & Binary'},
  {id:'array',      icon:'🗃️', label:'Arrays & Lists'},
  {id:'special',    icon:'✨', label:'Special Types'},
];

let dtpActive = null;

function dtpBuildCategories() {
  const grid = document.getElementById('dtp-categories');
  if (!grid) return;
  grid.innerHTML = dtpCategoryMeta.map(c => `
    <button class="dtp-cat-btn" data-cat="${c.id}" onclick="dtpCategory('${c.id}')">
      <span>${c.icon}</span> ${c.label}
    </button>`).join('');
}

function dtpCategory(cat) {
  document.querySelectorAll('.dtp-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  // Find first datatype matching this category
  const match = Object.entries(dtpData).find(([k, v]) => v.categories && v.categories.includes(cat));
  if (match) dtpRender(match[0]);
}

function dtpSearch(val) {
  if (!val || val.length < 2) return;
  const q = val.toLowerCase();
  const match = Object.entries(dtpData).find(([k, v]) =>
    k.includes(q) || v.title.toLowerCase().includes(q) ||
    v.desc.toLowerCase().includes(q) ||
    (v.rules && v.rules.some(r => r.toLowerCase().includes(q)))
  );
  if (match) dtpRender(match[0]);
}

function dtpLoad(key) {
  document.querySelectorAll('.dtp-cat-btn').forEach(b => b.classList.remove('active'));
  dtpRender(key);
}

function dtpRender(key) {
  dtpActive = key;
  const d = dtpData[key];
  if (!d) return;

  const dbMeta = {
    postgresql: { icon:'🐘', name:'PostgreSQL' },
    mysql:      { icon:'🐬', name:'MySQL' },
    mongodb:    { icon:'🍃', name:'MongoDB' },
    cassandra:  { icon:'🪨', name:'Cassandra' },
    dynamodb:   { icon:'⚙️', name:'DynamoDB' },
  };

  const dbCards = Object.entries(d.dbs).map(([dbKey, db]) => {
    const meta = dbMeta[dbKey] || { icon:'🗄️', name:dbKey };
    return `
    <div class="dtp-db-card">
      <div class="dtp-db-header">
        <span class="dtp-db-icon">${meta.icon}</span>
        <span class="dtp-db-name">${meta.name}</span>
      </div>
      <div class="dtp-type-badge">${db.type}</div>
      <div class="dtp-type-detail">${db.detail}</div>
      ${db.code ? `<div style="font-family:var(--mono);font-size:.72rem;color:var(--accent3);background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:.6rem .85rem;margin-top:.5rem;white-space:pre-wrap;overflow-x:auto;line-height:1.8">${db.code}</div>` : ''}
      ${db.caveat ? `<div class="dtp-caveat">⚠️ ${db.caveat}</div>` : ''}
      ${db.good  ? `<div class="dtp-good">✅ ${db.good}</div>` : ''}
    </div>`;
  }).join('');

  const rules = d.rules ? `
    <div class="dtp-section-title">Rules & Best Practices</div>
    <ul class="dtp-rules">${d.rules.map(r => `<li>${r}</li>`).join('')}</ul>` : '';

  const examples = d.examples ? `
    <div class="dtp-section-title">Examples</div>
    <div class="dtp-examples-grid">${d.examples.map(e => `<div class="dtp-example-tag">${e}</div>`).join('')}</div>` : '';

  const seeAlso = d.seeAlso ? `
    <div class="dtp-section-title">See Also</div>
    <div class="dtp-see-also">${d.seeAlso.map(s => {
      const other = dtpData[s];
      return `<button class="dtp-see-also-tag" onclick="dtpLoad('${s}')">${other ? other.title : s}</button>`;
    }).join('')}</div>` : '';

  document.getElementById('dtp-result').innerHTML = `
    <div class="dtp-result-title">${d.title}</div>
    <div class="dtp-result-desc">${d.desc}</div>
    <div class="dtp-section-title">Type Recommendations by Database</div>
    <div class="dtp-db-grid">${dbCards}</div>
    ${rules}
    ${examples}
    ${seeAlso}`;
}

// Add Data Type Picker to nav
(function(){
  const nav = document.querySelector('.nav-links');
  if (nav) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="#datatype-picker">Types</a>';
    nav.insertBefore(li, nav.lastElementChild);
  }
})();

dtpBuildCategories();




