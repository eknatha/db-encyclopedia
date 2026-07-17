// ============================================================
// ISOLATION LAB — transaction isolation level visualizer
// Step through classic concurrency anomalies at each level.
// ============================================================

const isoLevels = [
  {id:'ru', name:'Read Uncommitted', short:'RU', note:'PostgreSQL silently upgrades this to Read Committed — it has no dirty reads at any level.'},
  {id:'rc', name:'Read Committed',   short:'RC', note:'PostgreSQL & Oracle default. A fresh snapshot is taken per statement.'},
  {id:'rr', name:'Repeatable Read',  short:'RR', note:'MySQL/InnoDB default. In PostgreSQL this is snapshot isolation — one snapshot for the whole transaction.'},
  {id:'ser',name:'Serializable',     short:'SER',note:'PostgreSQL uses SSI: no blocking, but conflicting transactions abort with SQLSTATE 40001. Retry is mandatory.'}
];

const isoScenarios = {
  dirty: {
    name:'Dirty Read',
    icon:'💧',
    desc:'T2 reads a row that T1 has modified but not yet committed. If T1 rolls back, T2 acted on data that never existed.',
    initial:{label:'accounts', rows:[{id:1, owner:'alice', balance:100}]},
    steps:[
      {t:1, sql:'BEGIN;', note:'T1 opens a transaction.'},
      {t:2, sql:'BEGIN;', note:'T2 opens a transaction.'},
      {t:1, sql:'UPDATE accounts SET balance = 900 WHERE id = 1;', note:'T1 writes 900 but has NOT committed. The row is now dirty.', write:{id:1, balance:900, uncommitted:true}},
      {t:2, sql:'SELECT balance FROM accounts WHERE id = 1;', note:'The key moment — what does T2 see?', read:true,
        sees:{ru:'900 — the uncommitted value (DIRTY READ)', rc:'100 — the last committed value', rr:'100 — the last committed value', ser:'100 — the last committed value'},
        anomalyAt:['ru']},
      {t:1, sql:'ROLLBACK;', note:'T1 rolls back. The 900 never existed. Under RU, T2 already acted on a phantom value.', rollback:true},
      {t:2, sql:'COMMIT;', note:'T2 commits — carrying corrupted logic if it read 900.'}
    ],
    verdict:{ru:'ANOMALY — T2 read a value that was rolled back.', rc:'SAFE — MVCC only exposes committed versions.', rr:'SAFE', ser:'SAFE'}
  },

  nonrepeatable: {
    name:'Non-Repeatable Read',
    icon:'🔁',
    desc:'T1 reads the same row twice and gets different values, because T2 committed an UPDATE in between.',
    initial:{label:'products', rows:[{id:7, name:'widget', price:20}]},
    steps:[
      {t:1, sql:'BEGIN;', note:'T1 begins. Under RR/SER it takes a snapshot right here.'},
      {t:1, sql:'SELECT price FROM products WHERE id = 7;', note:'T1 reads price = 20.', read:true,
        sees:{ru:'20', rc:'20', rr:'20', ser:'20'}},
      {t:2, sql:'BEGIN; UPDATE products SET price = 35 WHERE id = 7; COMMIT;', note:'T2 changes the price and commits successfully.', write:{id:7, price:35, uncommitted:false}},
      {t:1, sql:'SELECT price FROM products WHERE id = 7;', note:'T1 re-reads the same row. Is the value stable?', read:true,
        sees:{ru:'35 — CHANGED under T1\'s feet', rc:'35 — CHANGED (new snapshot per statement)', rr:'20 — stable, T1 still sees its snapshot', ser:'20 — stable'},
        anomalyAt:['ru','rc']},
      {t:1, sql:'COMMIT;', note:'T1 commits. Under RC it computed with two different prices in one transaction.'}
    ],
    verdict:{ru:'ANOMALY — reads are not repeatable.', rc:'ANOMALY — each statement gets a new snapshot, so a re-read can differ.', rr:'SAFE — transaction-level snapshot makes reads stable.', ser:'SAFE'}
  },

  phantom: {
    name:'Phantom Read',
    icon:'👻',
    desc:'T1 runs the same range query twice and a new row appears, because T2 INSERTed a row matching the predicate.',
    initial:{label:'orders (status = pending)', rows:[{id:1, amount:50}, {id:2, amount:70}]},
    steps:[
      {t:1, sql:'BEGIN;', note:'T1 begins.'},
      {t:1, sql:"SELECT count(*) FROM orders WHERE status = 'pending';", note:'T1 counts 2 pending orders.', read:true,
        sees:{ru:'2', rc:'2', rr:'2', ser:'2'}},
      {t:2, sql:"BEGIN; INSERT INTO orders (id, status, amount) VALUES (3,'pending',90); COMMIT;", note:'T2 inserts a NEW row matching T1\'s predicate and commits.', write:{id:3, amount:90, inserted:true}},
      {t:1, sql:"SELECT count(*) FROM orders WHERE status = 'pending';", note:'T1 repeats the identical range query.', read:true,
        sees:{ru:'3 — a phantom row appeared', rc:'3 — a phantom row appeared', rr:'2 in PostgreSQL (snapshot hides it); the ANSI standard permits 3 here', ser:'2 — no phantoms, guaranteed'},
        anomalyAt:['ru','rc']},
      {t:1, sql:'COMMIT;', note:'T1 commits.'}
    ],
    verdict:{ru:'ANOMALY — phantom rows appear.', rc:'ANOMALY — the row set changed between identical queries.', rr:'SAFE in PostgreSQL (MVCC snapshot). ANSI RR permits phantoms; MySQL blocks them with gap locks.', ser:'SAFE — phantoms are prohibited by definition.'}
  },

  lostupdate: {
    name:'Lost Update',
    icon:'🕳️',
    desc:'Two transactions read-modify-write the same row. One update silently overwrites the other.',
    initial:{label:'counters', rows:[{id:1, name:'views', value:10}]},
    steps:[
      {t:1, sql:'BEGIN; SELECT value FROM counters WHERE id = 1;', note:'T1 reads 10 into application memory.', read:true, sees:{ru:'10', rc:'10', rr:'10', ser:'10'}},
      {t:2, sql:'BEGIN; SELECT value FROM counters WHERE id = 1;', note:'T2 also reads 10. Both now intend to write 11.', read:true, sees:{ru:'10', rc:'10', rr:'10', ser:'10'}},
      {t:1, sql:'UPDATE counters SET value = 11 WHERE id = 1; COMMIT;', note:'T1 writes 11 and commits.', write:{id:1, value:11, uncommitted:false}},
      {t:2, sql:'UPDATE counters SET value = 11 WHERE id = 1;', note:'T2 writes its computed 11 — but two increments happened. What does the engine do?', read:true,
        sees:{ru:'Succeeds — value = 11. One increment vanished.', rc:'Succeeds — value = 11. One increment vanished.', rr:'PostgreSQL ABORTS T2 (could not serialize access due to concurrent update)', ser:'ABORTS T2 with SQLSTATE 40001'},
        anomalyAt:['ru','rc']},
      {t:2, sql:'COMMIT;', note:'Under RU/RC the final value is 11 instead of 12 — an update was lost.'}
    ],
    verdict:{ru:'ANOMALY — one update is lost.', rc:'ANOMALY — classic read-modify-write race. Fix with SELECT ... FOR UPDATE or an atomic UPDATE ... SET value = value + 1.', rr:'SAFE — PostgreSQL aborts the second writer; you must retry.', ser:'SAFE — aborts with a serialization failure.'}
  },

  writeskew: {
    name:'Write Skew',
    icon:'⚖️',
    desc:'Two transactions read overlapping data, each checks an invariant, then each writes a DIFFERENT row. Neither write conflicts, but together they break the invariant.',
    initial:{label:'doctors_on_call (invariant: at least 1 on call)', rows:[{id:1, name:'alice', on_call:true}, {id:2, name:'bob', on_call:true}]},
    steps:[
      {t:1, sql:'BEGIN; SELECT count(*) FROM doctors WHERE on_call = true;', note:'T1 (alice going off call) counts 2. Invariant holds if she leaves.', read:true, sees:{ru:'2', rc:'2', rr:'2', ser:'2'}},
      {t:2, sql:'BEGIN; SELECT count(*) FROM doctors WHERE on_call = true;', note:'T2 (bob going off call) also counts 2. Same conclusion.', read:true, sees:{ru:'2', rc:'2', rr:'2', ser:'2'}},
      {t:1, sql:"UPDATE doctors SET on_call = false WHERE name = 'alice'; COMMIT;", note:'T1 writes row 1 and commits.', write:{id:1, on_call:false, uncommitted:false}},
      {t:2, sql:"UPDATE doctors SET on_call = false WHERE name = 'bob';", note:'T2 writes a DIFFERENT row — no row-level conflict exists.', read:true,
        sees:{ru:'Succeeds', rc:'Succeeds', rr:'Succeeds — snapshot isolation does NOT catch this', ser:'ABORTS — SSI detects the read/write dependency cycle'},
        anomalyAt:['ru','rc','rr']},
      {t:2, sql:'COMMIT;', note:'Under RR both commit and NOBODY is on call. The invariant is broken with zero row conflicts.'}
    ],
    verdict:{ru:'ANOMALY — invariant broken.', rc:'ANOMALY — invariant broken.', rr:'ANOMALY — this is the famous gap in snapshot isolation. Different rows written, so no conflict is detected.', ser:'SAFE — this is precisely what SSI predicate tracking exists to catch.'}
  }
};

const isoState = {scenario:'dirty', level:'rc', step:-1};

function initIsolationLab(){
  const host = document.getElementById('isolation-body');
  if(!host) return;
  renderIsoControls();
  renderIsoBoard();
  renderIsoMatrix();
}

function renderIsoControls(){
  const el = document.getElementById('iso-controls');
  if(!el) return;
  el.innerHTML = `
    <div class="iso-picker-group">
      <div class="iso-picker-label">Anomaly Scenario</div>
      <div class="iso-chips">
        ${Object.entries(isoScenarios).map(([k,s])=>`
          <button class="iso-chip ${isoState.scenario===k?'active':''}" onclick="setIsoScenario('${k}')">
            <span>${s.icon}</span> ${s.name}
          </button>`).join('')}
      </div>
    </div>
    <div class="iso-picker-group">
      <div class="iso-picker-label">Isolation Level</div>
      <div class="iso-chips">
        ${isoLevels.map(l=>`
          <button class="iso-chip iso-chip-level ${isoState.level===l.id?'active':''}" onclick="setIsoLevel('${l.id}')">
            ${l.name}
          </button>`).join('')}
      </div>
    </div>`;
}

function setIsoScenario(k){ isoState.scenario = k; isoState.step = -1; renderIsoControls(); renderIsoBoard(); }
function setIsoLevel(l){ isoState.level = l; isoState.step = -1; renderIsoControls(); renderIsoBoard(); }
function isoNext(){ const s = isoScenarios[isoState.scenario]; if(isoState.step < s.steps.length-1){ isoState.step++; renderIsoBoard(); } }
function isoPrev(){ if(isoState.step > -1){ isoState.step--; renderIsoBoard(); } }
function isoReset(){ isoState.step = -1; renderIsoBoard(); }
function isoRunAll(){ const s = isoScenarios[isoState.scenario]; isoState.step = s.steps.length-1; renderIsoBoard(); }

function renderIsoBoard(){
  const host = document.getElementById('isolation-body');
  if(!host) return;
  const sc = isoScenarios[isoState.scenario];
  const lvl = isoLevels.find(l=>l.id===isoState.level);
  const done = isoState.step >= sc.steps.length-1;

  // Build per-session step lists up to current step
  const t1 = [], t2 = [];
  sc.steps.forEach((st, i)=>{
    const active = i === isoState.step;
    const past = i < isoState.step;
    if(i > isoState.step) return;
    const anomaly = st.anomalyAt && st.anomalyAt.includes(isoState.level);
    const card = `
      <div class="iso-step ${active?'iso-step-active':''} ${anomaly&&(active||past)?'iso-step-anomaly':''}">
        <div class="iso-step-num">t${i+1}</div>
        <code class="iso-step-sql">${escIso(st.sql)}</code>
        ${st.read && st.sees ? `<div class="iso-step-sees ${anomaly?'bad':'good'}">
            <span class="iso-sees-tag">${anomaly?'⚠ SEES':'✓ SEES'}</span> ${escIso(st.sees[isoState.level])}
          </div>` : ''}
        ${active ? `<div class="iso-step-note">${escIso(st.note)}</div>` : ''}
      </div>`;
    (st.t === 1 ? t1 : t2).push(card);
    // keep vertical alignment: push a spacer into the other session
    (st.t === 1 ? t2 : t1).push('<div class="iso-spacer"></div>');
  });

  const anomalyNow = done && sc.verdict[isoState.level].startsWith('ANOMALY');

  host.innerHTML = `
    <div class="iso-scenario-desc">
      <strong>${sc.icon} ${sc.name}</strong> — ${escIso(sc.desc)}
    </div>

    <div class="iso-level-note">
      <span class="iso-level-badge">${lvl.name}</span> ${escIso(lvl.note)}
    </div>

    <div class="iso-timeline">
      <div class="iso-session">
        <div class="iso-session-head iso-t1">Session T1</div>
        <div class="iso-session-body">${t1.join('') || '<div class="iso-empty">Press Step ▶ to begin</div>'}</div>
      </div>
      <div class="iso-session">
        <div class="iso-session-head iso-t2">Session T2</div>
        <div class="iso-session-body">${t2.join('') || '<div class="iso-empty">&nbsp;</div>'}</div>
      </div>
    </div>

    <div class="iso-ctrls">
      <button class="iso-btn" onclick="isoPrev()" ${isoState.step<0?'disabled':''}>◀ Back</button>
      <button class="iso-btn iso-btn-primary" onclick="isoNext()" ${done?'disabled':''}>Step ▶</button>
      <button class="iso-btn" onclick="isoRunAll()">Run All ⏭</button>
      <button class="iso-btn" onclick="isoReset()">Reset ↺</button>
      <span class="iso-progress">${Math.max(0,isoState.step+1)} / ${sc.steps.length}</span>
    </div>

    ${done ? `<div class="iso-verdict ${anomalyNow?'iso-verdict-bad':'iso-verdict-good'}">
        <div class="iso-verdict-title">${anomalyNow?'⚠ Anomaly occurred':'✓ Anomaly prevented'} at ${lvl.name}</div>
        <div class="iso-verdict-text">${escIso(sc.verdict[isoState.level])}</div>
      </div>` : ''}
  `;
}

function renderIsoMatrix(){
  const el = document.getElementById('iso-matrix');
  if(!el) return;
  const keys = Object.keys(isoScenarios);
  el.innerHTML = `
    <table class="iso-matrix-table">
      <thead>
        <tr>
          <th>Anomaly</th>
          ${isoLevels.map(l=>`<th>${l.short}<span class="iso-th-sub">${l.name}</span></th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${keys.map(k=>{
          const sc = isoScenarios[k];
          return `<tr>
            <td class="iso-matrix-name">${sc.icon} ${sc.name}</td>
            ${isoLevels.map(l=>{
              const bad = sc.verdict[l.id].startsWith('ANOMALY');
              return `<td class="iso-cell ${bad?'iso-cell-bad':'iso-cell-good'}" title="${escIso(sc.verdict[l.id])}">${bad?'✗ possible':'✓ prevented'}</td>`;
            }).join('')}
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <div class="iso-matrix-foot">
      Behaviour shown is <strong>PostgreSQL</strong>'s. Read Uncommitted is treated as Read Committed; Repeatable Read is snapshot isolation (no phantoms, unlike the ANSI standard); Serializable uses SSI and aborts conflicting transactions with SQLSTATE <code>40001</code> — always retry.
    </div>`;
}

function escIso(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

document.addEventListener('DOMContentLoaded', initIsolationLab);
