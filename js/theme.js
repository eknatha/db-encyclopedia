// ============================================================
// THEME TOGGLE — dark (default) / light
//
// The no-flash inline snippet in <head> sets data-theme before
// first paint. This module only wires up the button and keeps
// the OS preference in sync. Storage is optional: if it throws
// (private mode), theming still works for the session.
// ============================================================
(function(){
  'use strict';

  var LS_KEY = 'db_enc_theme';
  var DARK = 'dark', LIGHT = 'light';

  function store(v){
    try{ localStorage.setItem(LS_KEY, v); }catch(e){ /* private mode: session-only */ }
  }
  function read(){
    try{ return localStorage.getItem(LS_KEY); }catch(e){ return null; }
  }
  function current(){
    return document.documentElement.getAttribute('data-theme') === LIGHT ? LIGHT : DARK;
  }

  function apply(theme, persist){
    var t = theme === LIGHT ? LIGHT : DARK;
    // Dark is the default styling, so the attribute is only set for light.
    if(t === LIGHT) document.documentElement.setAttribute('data-theme', LIGHT);
    else document.documentElement.removeAttribute('data-theme');
    if(persist) store(t);
    paintButton(t);
    // Keep mobile browser chrome in step with the page
    var meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', t === LIGHT ? '#ffffff' : '#0a0e1a');
    // The visitor badge is a third-party SVG whose colours are baked into
    // the URL, so it must be re-fetched to match the new theme.
    if(typeof window.refreshVisitorBadge === 'function'){
      try{ window.refreshVisitorBadge(); }catch(e){}
    }
    return t;
  }

  function paintButton(t){
    var btn = document.getElementById('theme-toggle');
    if(!btn) return;
    var toLight = (t === DARK);           // clicking goes to the other theme
    btn.innerHTML = '<span class="tt-icon">' + (toLight ? '☀' : '☾') + '</span>';
    btn.setAttribute('aria-label', 'Switch to ' + (toLight ? 'light' : 'dark') + ' theme');
    btn.setAttribute('title', 'Switch to ' + (toLight ? 'light' : 'dark') + ' theme');
    btn.setAttribute('aria-pressed', String(t === LIGHT));
  }

  function toggle(){
    apply(current() === LIGHT ? DARK : LIGHT, true);
  }

  function init(){
    paintButton(current());
    var btn = document.getElementById('theme-toggle');
    if(btn) btn.addEventListener('click', toggle);

    // Follow OS changes only while the user hasn't made an explicit choice.
    if(window.matchMedia){
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      var onChange = function(e){ if(!read()) apply(e.matches ? LIGHT : DARK, false); };
      if(mq.addEventListener) mq.addEventListener('change', onChange);
      else if(mq.addListener) mq.addListener(onChange);   // Safari < 14
    }
  }

  window.toggleTheme = toggle;   // exposed for keyboard shortcut / console

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
