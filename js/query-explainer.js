// ============================================================
// QUERY EXPLAINER
// ============================================================
const qexExamples = {
  simple:`SELECT id, name, email, created_at
FROM users
WHERE status = 'active'
  AND created_at > '2025-01-01'
ORDER BY created_at DESC
LIMIT 50;`,
  join:`SELECT u.name, COUNT(o.id) AS order_count, SUM(o.total) AS revenue
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2025-01-01'
  AND o.status = 'completed'
GROUP BY u.name
HAVING COUNT(o.id) > 5
ORDER BY revenue DESC
LIMIT 20;`,
  window:`SELECT name, dept, salary,
  RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dept_rank,
  SUM(salary) OVER (PARTITION BY dept) AS dept_total,
  AVG(salary) OVER (ORDER BY hire_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg
FROM employees
WHERE active = true;`,
  cte:`WITH monthly_revenue AS (
  SELECT DATE_TRUNC('month', created_at) AS month,
         SUM(total) AS revenue,
         COUNT(*) AS orders
  FROM orders
  WHERE status = 'completed'
  GROUP BY 1
),
ranked AS (
  SELECT *, RANK() OVER (ORDER BY revenue DESC) AS rank
  FROM monthly_revenue
)
SELECT * FROM ranked WHERE rank <= 3
ORDER BY revenue DESC;`,
  subquery:`SELECT name, email, total_spent
FROM users
WHERE id IN (
  SELECT user_id
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
  HAVING SUM(total) > 10000
)
AND created_at > (
  SELECT AVG(created_at) FROM users
)
ORDER BY total_spent DESC;`
};

function qexLoad(type){
  document.getElementById('qex-input').value = qexExamples[type];
}

function explainQuery(){
  const sql = document.getElementById('qex-input').value.trim();
  if(!sql){ return; }
  const out = document.getElementById('qex-output');
  out.innerHTML = '<div class="qex-placeholder"><div style="font-size:1.5rem;margin-bottom:.5rem">⚙️</div><div style="color:var(--text2)">Analyzing query...</div></div>';

  setTimeout(()=>{
    const result = parseAndExplainSQL(sql);
    out.innerHTML = result;
  }, 300);
}

function parseAndExplainSQL(sql){
  const s = sql.trim().replace(/\s+/g,' ');
  const su = s.toUpperCase();
  let html = '';
  const clauses = [];

  // Detect query type
  let qtype = 'SELECT';
  if(su.startsWith('INSERT')) qtype='INSERT';
  else if(su.startsWith('UPDATE')) qtype='UPDATE';
  else if(su.startsWith('DELETE')) qtype='DELETE';
  else if(su.startsWith('CREATE')) qtype='CREATE';
  else if(su.startsWith('WITH')) qtype='CTE';

  html += `<div style="margin-bottom:1rem"><span class="qex-tag qex-tag-info">Query Type: ${qtype}</span>`;

  // Detect features
  const features = [];
  if(/\bJOIN\b/i.test(s)) features.push('JOIN');
  if(/\bLEFT JOIN\b/i.test(s)) features.push('LEFT JOIN');
  if(/\bGROUP BY\b/i.test(s)) features.push('GROUP BY');
  if(/\bHAVING\b/i.test(s)) features.push('HAVING');
  if(/\bORDER BY\b/i.test(s)) features.push('ORDER BY');
  if(/\bLIMIT\b/i.test(s)) features.push('LIMIT');
  if(/\bOVER\s*\(/i.test(s)) features.push('Window Function');
  if(/\bWITH\b.*\bAS\b/i.test(s)) features.push('CTE');
  if(/\bSELECT\b.*\bFROM\b.*\bSELECT\b/i.test(s)) features.push('Subquery');
  if(/\bDISTINCT\b/i.test(s)) features.push('DISTINCT');
  if(/\bUNION\b/i.test(s)) features.push('UNION');
  if(/\bEXISTS\b/i.test(s)) features.push('EXISTS');
  features.forEach(f => html += ` <span class="qex-tag qex-tag-info">${f}</span>`);
  html += '</div>';

  html += '<div class="qex-divider"></div>';
  html += '<div class="qex-section-title">Clause Breakdown</div>';

  // WITH / CTE
  const cteMatch = s.match(/WITH\s+([\w\s,()]+?)\s+AS\s*\(/i);
  if(cteMatch){
    const names = s.match(/WITH\s+(\w+)\s+AS/i);
    clauses.push({
      name:'WITH (CTE)',
      sql: names ? `WITH ${names[1]} AS (...)` : 'WITH ... AS (...)',
      desc:`Defines a Common Table Expression — a named temporary result set. The query inside the CTE runs first and its result is available by name in the main query. CTEs improve readability and can be referenced multiple times. In PostgreSQL, CTEs are optimization fences — the planner treats them as black boxes unless you add <code>NOT MATERIALIZED</code>.`,
      tips:['CTEs are evaluated once — good for expensive subqueries reused multiple times','RECURSIVE CTEs can traverse trees and graphs','Multiple CTEs: <code>WITH a AS (...), b AS (...) SELECT ...</code>']
    });
  }

  // SELECT clause
  const selMatch = s.match(/SELECT\s+(.*?)\s+FROM/i);
  if(selMatch){
    const cols = selMatch[1].trim();
    let desc = 'Specifies which columns to return. ';
    const tips = [];
    if(cols === '*') {
      desc += '<span class="qex-tag qex-tag-warn">SELECT * in production</span> — selects all columns which wastes bandwidth, prevents index-only scans, and breaks if schema changes.';
      tips.push('Specify only needed columns: <code>SELECT id, name, email</code>');
    }
    if(/COUNT\s*\(/i.test(cols)) tips.push('<code>COUNT(id)</code> is faster than <code>COUNT(*)</code> when id is indexed');
    if(/SUM|AVG|MIN|MAX/i.test(cols)) tips.push('Aggregate functions require a GROUP BY unless applied to the full result set');
    if(/OVER\s*\(/i.test(cols)) tips.push('Window functions run AFTER GROUP BY and WHERE — they see the filtered, grouped result set');
    if(/DISTINCT/i.test(cols)) tips.push('<code>DISTINCT</code> sorts all rows to deduplicate — can be slow on large tables without an index');
    clauses.push({name:'SELECT', sql:cols.length > 80 ? cols.substring(0,77)+'...' : cols, desc, tips});
  }

  // FROM clause
  const fromMatch = s.match(/FROM\s+([\w."`]+)/i);
  if(fromMatch){
    clauses.push({
      name:'FROM',
      sql: fromMatch[1],
      desc:`The primary table to read from. The query planner starts here and decides whether to do a sequential scan (read every row) or use an index. For large tables (>100K rows), ensure your WHERE clause columns have indexes.`,
      tips:['Check table row count: <code>SELECT COUNT(*) FROM '+fromMatch[1]+'</code>','Use EXPLAIN ANALYZE to see if a sequential scan is happening on a large table']
    });
  }

  // JOIN clauses
  const joins = s.match(/(?:LEFT|RIGHT|INNER|FULL|CROSS)?\s*JOIN\s+[\w."`]+\s+(?:\w+\s+)?ON\s+[^()WHERE]*/gi);
  if(joins){
    joins.forEach(j => {
      const jtype = j.match(/^(LEFT|RIGHT|INNER|FULL|CROSS)?/i)[1] || 'INNER';
      const descs = {
        'LEFT':'Returns ALL rows from the left table + matching rows from right. Non-matching right rows get NULL. Use when some records may have no related data.',
        'RIGHT':'Returns ALL rows from the right table. Rarely used — usually rewritten as a LEFT JOIN.',
        'INNER':'Returns only rows where both tables have a match. Most common and fastest JOIN type.',
        'FULL':'Returns all rows from both tables, NULLs where no match. Rare — expensive.',
        'CROSS':'Cartesian product — every row × every row. Rarely intentional!'
      };
      clauses.push({
        name: jtype + ' JOIN',
        sql: j.trim().substring(0, 80),
        desc: descs[jtype] || descs['INNER'],
        tips:['JOIN columns should always be indexed on both sides','Each additional JOIN multiplies the potential rows — filter with WHERE early','EXPLAIN ANALYZE shows which join algorithm PostgreSQL chose (Hash Join, Nested Loop, Merge Join)']
      });
    });
  }

  // WHERE clause
  const whereMatch = s.match(/WHERE\s+(.*?)(?:\s+GROUP BY|\s+ORDER BY|\s+HAVING|\s+LIMIT|$)/i);
  if(whereMatch){
    const cond = whereMatch[1].trim();
    const tips = [];
    if(/LIKE\s+'%/i.test(cond)) tips.push('<span class="qex-tag qex-tag-warn">Leading wildcard LIKE \'%..\'</span> cannot use a B-tree index — full table scan!');
    if(/OR\b/i.test(cond)) tips.push('<code>OR</code> conditions prevent index usage — consider <code>UNION</code> or <code>IN()</code>');
    if(/!=|<>/i.test(cond)) tips.push('Inequality operators (<code>!=</code>) skip indexes — try to restructure as positive conditions');
    if(/NOW\(\)|CURRENT_/i.test(cond)) tips.push('Functions on indexed columns prevent index use: avoid <code>DATE(created_at) = today</code>, use <code>created_at >= today AND created_at < tomorrow</code>');
    tips.push('Create a composite index matching your WHERE column order: most selective column first');
    clauses.push({name:'WHERE', sql:cond.length>80?cond.substring(0,77)+'...':cond, desc:'Filters rows BEFORE grouping and aggregation. Only rows matching ALL conditions are kept. This is where indexes make the biggest difference — a good WHERE clause index can reduce a full table scan to a single index lookup.', tips});
  }

  // GROUP BY
  const groupMatch = s.match(/GROUP BY\s+(.*?)(?:\s+HAVING|\s+ORDER BY|\s+LIMIT|$)/i);
  if(groupMatch){
    clauses.push({
      name:'GROUP BY',
      sql: groupMatch[1].trim(),
      desc:'Collapses rows with the same value(s) into a single row. Required when using aggregate functions (COUNT, SUM, AVG, MAX, MIN). Every column in SELECT that is not an aggregate must appear in GROUP BY.',
      tips:['GROUP BY triggers a sort/hash operation — can be expensive without an index','Adding too many columns to GROUP BY increases cardinality — fewer rows get grouped together','PostgreSQL can use indexes for GROUP BY if the column order matches the index']
    });
  }

  // HAVING
  const havingMatch = s.match(/HAVING\s+(.*?)(?:\s+ORDER BY|\s+LIMIT|$)/i);
  if(havingMatch){
    clauses.push({
      name:'HAVING',
      sql: havingMatch[1].trim(),
      desc:'Filters AFTER grouping — like WHERE but for aggregated results. Because it runs after GROUP BY, it cannot use indexes. If possible, pre-filter with WHERE before grouping to reduce rows.',
      tips:['HAVING operates on grouped rows — WHERE is faster for non-aggregate conditions','<code>HAVING COUNT(*) > 0</code> is equivalent to using INNER JOIN instead of LEFT JOIN + HAVING','Move non-aggregate filters to WHERE for better performance']
    });
  }

  // ORDER BY
  const orderMatch = s.match(/ORDER BY\s+(.*?)(?:\s+LIMIT|$)/i);
  if(orderMatch){
    const orderCols = orderMatch[1].trim();
    clauses.push({
      name:'ORDER BY',
      sql: orderCols,
      desc:'Sorts the result set. Without an index on the ORDER BY column, PostgreSQL must sort all rows in memory (or spill to disk) — expensive for large result sets. With a matching index, the rows come pre-sorted.',
      tips:['Create an index on ORDER BY columns: <code>CREATE INDEX ON orders(created_at DESC)</code>','Increase <code>work_mem</code> if sorts spill to disk (visible in EXPLAIN: "Sort Method: external merge")','NULLS FIRST / NULLS LAST controls where NULLs appear in sorted output']
    });
  }

  // LIMIT
  const limitMatch = s.match(/LIMIT\s+(\d+)/i);
  if(limitMatch){
    clauses.push({
      name:'LIMIT',
      sql: limitMatch[0],
      desc:`Returns only the first ${limitMatch[1]} rows after all filtering, grouping, and sorting. Dramatically reduces network transfer and client memory. For pagination, use LIMIT + OFFSET or keyset pagination.`,
      tips:['OFFSET pagination gets slower as offset grows: <code>LIMIT 20 OFFSET 10000</code> still processes 10,020 rows','Keyset pagination is faster: <code>WHERE id > :last_seen_id ORDER BY id LIMIT 20</code>','Always combine LIMIT with ORDER BY — without ORDER BY, result order is undefined']
    });
  }

  // Render clauses
  clauses.forEach(c => {
    html += `<div class="qex-clause">
      <div class="qex-clause-name">${c.name}</div>
      <div class="qex-clause-sql">${c.sql}</div>
      <div class="qex-clause-desc">${c.desc}</div>`;
    if(c.tips && c.tips.length){
      html += `<ul style="margin-top:.5rem;padding-left:1rem;list-style:none">`;
      c.tips.forEach(t => html += `<li style="font-size:.78rem;color:var(--text3);padding:.15rem 0;padding-left:1rem;position:relative"><span style="position:absolute;left:0;color:var(--accent)">→</span>${t}</li>`);
      html += `</ul>`;
    }
    html += `</div><div class="qex-divider"></div>`;
  });

  // Performance summary
  html += `<div class="qex-section-title">Performance Checklist</div>`;
  const checks = [];
  if(!/LIMIT\b/i.test(s)) checks.push({ok:false, msg:'No LIMIT — could return unbounded rows'});
  else checks.push({ok:true, msg:'LIMIT present — result set bounded'});
  if(/SELECT\s+\*/i.test(s)) checks.push({ok:false, msg:'SELECT * — specify only needed columns'});
  else checks.push({ok:true, msg:'Specific columns selected — good'});
  if(/LIKE\s+'%/i.test(s)) checks.push({ok:false, msg:'Leading wildcard LIKE — cannot use index'});
  if(/ORDER BY/i.test(s)) checks.push({ok:null, msg:'ORDER BY present — ensure index exists on sort column'});
  if(/JOIN/i.test(s)) checks.push({ok:null, msg:'JOIN detected — ensure both join columns are indexed'});
  if(/GROUP BY/i.test(s)) checks.push({ok:null, msg:'GROUP BY — filter with WHERE before grouping when possible'});
  if(/'WITH\b|CTE/i.test(s)||/WITH\s+\w+\s+AS/i.test(s)) checks.push({ok:true, msg:'CTE used — improves readability'});

  checks.forEach(c => {
    const icon = c.ok===true ? '✅' : c.ok===false ? '⚠️' : 'ℹ️';
    const color = c.ok===true ? 'var(--accent3)' : c.ok===false ? 'var(--accent5)' : 'var(--text2)';
    html += `<div style="display:flex;gap:.5rem;font-size:.8rem;padding:.3rem 0;color:${color}">${icon} ${c.msg}</div>`;
  });

  // Index suggestions
  html += `<div class="qex-section-title" style="margin-top:1rem">Suggested Indexes</div>`;
  const idxSuggestions = [];
  if(whereMatch){
    const cols = whereMatch[1].match(/\b\w+\b(?=\s*[=><])/g);
    if(cols) idxSuggestions.push(...cols.slice(0,3));
  }
  if(orderMatch){
    const cols = orderMatch[1].match(/\b\w+\b/g);
    if(cols) idxSuggestions.push(cols[0]);
  }
  const uniqueIdx = [...new Set(idxSuggestions)].filter(c => !['AND','OR','NOT','IS','NULL','TRUE','FALSE','IN'].includes(c.toUpperCase()));
  if(uniqueIdx.length){
    const table = fromMatch ? fromMatch[1] : 'your_table';
    html += `<div style="font-family:var(--mono);font-size:.76rem;color:var(--accent3);background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:.75rem 1rem;line-height:2">`;
    if(uniqueIdx.length > 1) html += `CREATE INDEX CONCURRENTLY idx_${table}_composite ON ${table}(${uniqueIdx.join(', ')});\n`;
    uniqueIdx.forEach(c => html += `CREATE INDEX CONCURRENTLY idx_${table}_${c} ON ${table}(${c});\n`);
    html += `</div>`;
  } else {
    html += `<div style="font-size:.82rem;color:var(--text3)">Paste a more complex query for index suggestions.</div>`;
  }

  return html;
}

// ============================================================
// GLOSSARY
// ============================================================
