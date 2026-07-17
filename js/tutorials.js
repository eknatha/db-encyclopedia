// ===== NAV + RENDER ENGINE =====
const tutNavGroups = [
  {label:'Relational (SQL)', items:[
    {id:'postgresql',icon:'🐘',name:'PostgreSQL'},
    {id:'mysql',icon:'🐬',name:'MySQL'},
    {id:'mariadb',icon:'🦭',name:'MariaDB'},
    {id:'sqlite',icon:'🪶',name:'SQLite'},
  ]},
  {label:'Document', items:[
    {id:'mongodb',icon:'🍃',name:'MongoDB'},
  ]},
  {label:'Key-Value / Cache', items:[
    {id:'redis',icon:'📦',name:'Redis'},
    {id:'dynamodb',icon:'⚙️',name:'DynamoDB'},
  ]},
  {label:'Wide-Column / OLAP', items:[
    {id:'cassandra',icon:'🪨',name:'Apache Cassandra'},
    {id:'clickhouse',icon:'⚡',name:'ClickHouse'},
  ]},
  {label:'Time Series', items:[
    {id:'timescaledb',icon:'⏱️',name:'TimescaleDB'},
    {id:'influxdb',icon:'📈',name:'InfluxDB'},
    {id:'victoria',icon:'📊',name:'VictoriaMetrics'},
  ]},
  {label:'Search Engines', items:[
    {id:'elasticsearch',icon:'🔍',name:'Elasticsearch'},
    {id:'opensearch',icon:'🔎',name:'OpenSearch'},
  ]},
  {label:'Graph', items:[
    {id:'neo4j',icon:'🕸️',name:'Neo4j'},
  ]},
  {label:'NewSQL / Distributed', items:[
    {id:'cockroachdb',icon:'🪲',name:'CockroachDB'},
  ]},
];

function buildTutNav(filter){
  const nav=document.getElementById('tut-nav');
  nav.innerHTML='';
  tutNavGroups.forEach(group=>{
    const items=filter?group.items.filter(i=>i.name.toLowerCase().includes(filter.toLowerCase())):group.items;
    if(!items.length)return;
    const g=document.createElement('div');
    g.innerHTML=`<div class="tut-nav-group-label">${group.label}</div>`;
    items.forEach(item=>{
      const d=document.createElement('div');
      d.className='tut-nav-item'+(window._activeTutorial===item.id?' active':'');
      d.innerHTML=`<span>${item.icon}</span> ${item.name}`;
      d.onclick=()=>loadTutorial(item.id);
      g.appendChild(d);
    });
    nav.appendChild(g);
  });
}

function filterTutorials(val){buildTutNav(val);}

function loadTutorial(id){
  const tut=tutorials[id];
  if(!tut)return;
  window._activeTutorial=id;
  buildTutNav(document.getElementById('tut-search')?document.getElementById('tut-search').value:'');
  const content=document.getElementById('tut-content');
  content.innerHTML=tut.content();
  content.scrollTop=0;
  const sec=document.getElementById('tutorials');
  if(sec)sec.scrollIntoView({behavior:'smooth',block:'start'});
}

function copyTutCode(btn){
  const code=btn.closest('.code-block').querySelector('.code-body').innerText;
  navigator.clipboard.writeText(code).then(()=>{
    const orig=btn.textContent;
    btn.textContent='Copied!';
    btn.style.color='var(--accent3)';
    setTimeout(()=>{btn.textContent=orig;btn.style.color='';},1500);
  });
}

buildTutNav();

// Add Tutorials link to nav
(function(){
  // Nav link declared statically in index.html.
})();





