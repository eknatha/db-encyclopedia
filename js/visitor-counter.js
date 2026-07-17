// ============================================================
// VISITOR COUNTER — nav (top right)
// Strategy: race independent <img> probes against a hard timeout.
// Pure image loads = no CORS, no API key, no fetch. First to
// paint wins; all others are abandoned. Local count always
// renders instantly so the UI is never empty or blocked.
// ============================================================
(function(){
  'use strict';

  var MOUNT_ID   = 'vc-mount';
  var TIMEOUT_MS = 6000;
  var LS_KEY     = 'db_enc_visits';
  var SITE       = 'db.eknathalabs.com';

  // Ordered by reliability. Verified live + actively maintained (hits.sh v1.5.28, Jun 2026).
  var SERVICES = [
    { name:'hits.sh',
      url:'https://hits.sh/' + SITE + '.svg?style=flat-square&label=visitors&color=4f8ef7&labelColor=0a0e1a',
      stats:'https://hits.sh/' + SITE + '/' },
    { name:'visitor-badge',
      url:'https://visitor-badge.laobi.icu/badge?page_id=eknatha.db-encyclopedia&left_text=visitors&left_color=0a0e1a&right_color=4f8ef7',
      stats:null },
    { name:'hitscounter',
      url:'https://hitscounter.dev/api/hit?url=' + encodeURIComponent('https://' + SITE) + '&label=visitors&icon=database&color=%234f8ef7',
      stats:'https://hitscounter.dev/stats?url=' + encodeURIComponent('https://' + SITE) }
  ];

  function mount(){ return document.getElementById(MOUNT_ID); }

  // ---- local visit count: always works, even fully offline ----
  function bumpLocal(){
    try{
      var n = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
      if(isNaN(n) || n < 0) n = 0;              // tolerate corrupted values
      n += 1;
      localStorage.setItem(LS_KEY, String(n));
      return n;
    }catch(e){
      return null;                               // private mode / storage disabled
    }
  }

  function renderLocal(n){
    var el = mount();
    if(!el) return;
    var txt = n === null ? 'visits —' : (n === 1 ? '1st visit' : n + ' visits');
    el.innerHTML = '<span class="vc-local" title="Your visits to this page (stored locally in your browser)">👁 ' + txt + '</span>';
  }

  function renderBadge(svc, localN){
    var el = mount();
    if(!el) return;
    var img = document.createElement('img');
    img.className = 'vc-badge';
    img.alt = 'visitors';
    img.src = svc.url;
    var title = 'Total visitors' + (localN ? ' · ' + localN + ' from you' : '');

    el.innerHTML = '';
    if(svc.stats){                       // only link where a stats page exists
      var a = document.createElement('a');
      a.href = svc.stats;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'vc-link';
      a.title = title;
      a.appendChild(img);
      el.appendChild(a);
    } else {
      img.title = title;
      el.appendChild(img);
    }
  }

  // ---- race all services; first successful paint wins ----
  function probe(localN){
    var settled = false;
    var timer = null;

    function win(svc){
      if(settled) return;
      settled = true;
      clearTimeout(timer);
      renderBadge(svc, localN);
    }

    var pending = SERVICES.length;
    function lose(){
      if(settled) return;
      pending -= 1;
      if(pending <= 0){                          // every service failed
        settled = true;
        clearTimeout(timer);
        renderLocal(localN);                     // graceful fallback, never blank
      }
    }

    SERVICES.forEach(function(svc){
      var t = new Image();
      t.onload  = function(){
        // Guard against services returning a 1x1 error pixel instead of a badge
        if(t.naturalWidth > 8) win(svc); else lose();
      };
      t.onerror = lose;
      t.src = svc.url;
    });

    // Hard ceiling: a hung request never fires onerror, so time it out.
    timer = setTimeout(function(){
      if(!settled){ settled = true; renderLocal(localN); }
    }, TIMEOUT_MS);
  }

  function init(){
    if(!mount()) return;
    var localN = bumpLocal();
    renderLocal(localN);   // paint immediately — zero layout shift, never empty
    probe(localN);         // upgrade to live badge if any service answers
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
