/* ============================================================
   DevisAI — shared runtime (vanilla)
   ============================================================ */
(function(){
  /* ---- Icon set: thin line, currentColor ---- */
  var P = {
    logo:'<path d="M5 7l7-3 7 3v6.5c0 4-3 6.7-7 8.5-4-1.8-7-4.5-7-8.5V7z"/><path d="M9.2 12.2l2 2 3.6-4"/>',
    grid:'<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>',
    plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    sparkle:'<path d="M12 3l1.8 5 5 1.8-5 1.8L12 17l-1.8-5.4L5 9.8l5-1.8L12 3z"/><path d="M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"/>',
    file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>',
    building:'<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="9" y1="7" x2="9" y2="7"/><line x1="15" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="9" y2="11"/><line x1="15" y1="11" x2="15" y2="11"/><path d="M10 21v-4h4v4"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 2.6 14H2.5a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4 7.6a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 3.6h.1A1.6 1.6 0 0 0 10 2.5a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 17 4a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1A1.6 1.6 0 0 0 21.5 10h.1a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.1 1z"/>',
    mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>',
    bell:'<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    search:'<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.7" y2="16.7"/>',
    calendar:'<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/>',
    chevR:'<polyline points="9 6 15 12 9 18"/>',
    chevL:'<polyline points="15 6 9 12 15 18"/>',
    chevD:'<polyline points="6 9 12 15 18 9"/>',
    menu:'<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    x:'<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    eye:'<path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/>',
    check:'<polyline points="4 12 10 18 20 6"/>',
    checkCircle:'<circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/>',
    arrowR:'<line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>',
    upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    filter:'<polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/>',
    dots:'<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    mail:'<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M3 6.5l9 6 9-6"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    globe:'<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
    pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.8"/>',
    lock:'<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    trend:'<polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/>',
    clock:'<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
    send:'<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    wand:'<path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8l1.4 1.4"/><path d="M17.8 6.2l1.4-1.4"/><path d="M3 21l9-9"/><path d="M12.2 6.2l-1.4-1.4"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.8"/><path d="M21 15l-5-5L5 21"/>',
    tag:'<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
    sun:'<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>'
  };
  window.DEVIS_ICONS = P;
  window.icon = function(n){ return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(P[n]||'')+'</svg>'; };

  function hydrateIcons(root){
    (root||document).querySelectorAll('[data-icon]').forEach(function(el){
      var n=el.getAttribute('data-icon'); if(P[n]){ el.innerHTML=window.icon(n); el.classList.add('ic'); el.removeAttribute('data-icon'); }
    });
  }
  window.hydrateIcons = hydrateIcons;

  /* ---- Reveal stagger ---- */
  function reveal(){
    document.querySelectorAll('.stagger').forEach(function(g){
      var base = parseInt(g.getAttribute('data-base')||'60',10);
      var step = parseInt(g.getAttribute('data-step')||'70',10);
      Array.prototype.forEach.call(g.children,function(c,i){
        c.classList.add('reveal'); c.style.setProperty('--d',(base+i*step)+'ms');
      });
    });
  }

  /* ---- Drawer ---- */
  function initDrawer(){
    var ham=document.querySelector('.hamburger');
    var scrim=document.querySelector('.drawer-scrim');
    function close(){document.body.classList.remove('drawer-open');}
    if(ham) ham.addEventListener('click',function(){document.body.classList.toggle('drawer-open');});
    if(scrim) scrim.addEventListener('click',close);
    document.querySelectorAll('.sidebar .nav a').forEach(function(a){a.addEventListener('click',close);});
    window.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  }

  /* ---- Toast ---- */
  window.toast=function(msg,ic){
    var w=document.querySelector('.toast-wrap');
    if(!w){w=document.createElement('div');w.className='toast-wrap';document.body.appendChild(w);}
    var t=document.createElement('div');t.className='toast';
    t.innerHTML='<span class="ic ic-sm">'+window.icon(ic||'check')+'</span><span>'+msg+'</span>';
    w.appendChild(t);
    setTimeout(function(){t.style.transition='opacity .4s,transform .4s';t.style.opacity='0';t.style.transform='translateY(10px)';setTimeout(function(){t.remove();},420);},2600);
  };

  /* ---- Modal helpers ---- */
  window.openModal=function(id){var m=document.getElementById(id);if(m){m.classList.add('open');document.body.style.overflow='hidden';}};
  window.closeModal=function(el){var m=el.closest?el.closest('.modal-scrim'):document.getElementById(el);if(m){m.classList.remove('open');document.body.style.overflow='';}};

  /* ---- format ---- */
  window.fcfa=function(n){return new Intl.NumberFormat('fr-FR').format(n)+' FCFA';};

  document.addEventListener('DOMContentLoaded',function(){
    hydrateIcons();
    initDrawer();
    reveal();
    // scrim click closes modal
    document.querySelectorAll('.modal-scrim').forEach(function(s){
      s.addEventListener('click',function(e){if(e.target===s)window.closeModal(s);});
    });
  });
})();
