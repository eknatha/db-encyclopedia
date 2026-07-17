// ============================================================
// NAV — dropdowns, mobile menu, scroll state
// Click (not hover) to open: hover menus are hostile on touch
// and unreachable by keyboard.
// ============================================================
(function(){
  'use strict';

  function init(){
    var nav    = document.querySelector('nav');
    var burger = document.getElementById('nav-burger');
    var links  = document.getElementById('nav-links');
    var drops  = [].slice.call(document.querySelectorAll('.nav-drop'));
    if(!nav) return;

    function closeAll(except){
      drops.forEach(function(d){
        if(d === except) return;
        d.classList.remove('open');
        var b = d.querySelector('.nav-drop-btn');
        if(b) b.setAttribute('aria-expanded','false');
      });
    }

    function closeMenu(){
      if(!links) return;
      links.classList.remove('open');
      if(burger) burger.setAttribute('aria-expanded','false');
      closeAll(null);
    }

    // --- dropdowns ---
    drops.forEach(function(d){
      var btn = d.querySelector('.nav-drop-btn');
      if(!btn) return;
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var open = d.classList.contains('open');
        closeAll(d);
        d.classList.toggle('open', !open);
        btn.setAttribute('aria-expanded', String(!open));
      });
    });

    // Selecting a destination should always dismiss the menu.
    document.querySelectorAll('.nav-drop-menu a, .nav-links > li > a').forEach(function(a){
      a.addEventListener('click', closeMenu);
    });

    // --- mobile menu ---
    if(burger && links){
      burger.addEventListener('click', function(e){
        e.stopPropagation();
        var open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
        if(!open) closeAll(null);
      });
    }

    // --- dismissal ---
    document.addEventListener('click', function(e){
      if(!nav.contains(e.target)) closeMenu();
      else if(!e.target.closest('.nav-drop')) closeAll(null);
    });

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeMenu();
    });

    // Reset state when crossing the mobile breakpoint, otherwise a menu
    // left open on mobile reappears mid-bar on desktop.
    var mq = window.matchMedia ? window.matchMedia('(min-width:901px)') : null;
    if(mq){
      var onChange = function(){ closeMenu(); };
      if(mq.addEventListener) mq.addEventListener('change', onChange);
      else if(mq.addListener) mq.addListener(onChange);
    }

    // --- subtle shadow once scrolled ---
    var onScroll = function(){
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
