/**
 * Lightweight navbar loader:
 * - Injects /components/navbar.html into any element with id="navbar"
 * - Applies active state based on location.pathname
 * - Handles mobile drawer open/close, focus trapping, and Escape
 */
(async function initNavbar(){
  const mount = document.getElementById('navbar');
  if(!mount) return;

  try{
    const res = await fetch('/components/navbar.html', {credentials:'same-origin'});
    const html = await res.text();
    mount.innerHTML = html;

    // Load CSS once per page
    const cssHref = '/components/navbar.css';
    if(!document.querySelector(`link[href="${cssHref}"]`)){
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
    }

    // Active link highlighting (desktop + mobile)
    const setActive = ()=>{
      const path = location.pathname.replace(/\/+$/,'') || '/';
      mount.querySelectorAll('.nv a[href]').forEach(a=>{
        const href = a.getAttribute('href');
        const norm = href?.replace(/\/+$/,'') || '';
        const isActive = (path === '/' && norm === '/') || (norm && norm !== '/' && path.endsWith(norm));
        a.classList.toggle('is-active', !!isActive);
        if(isActive) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
      });
    };
    setActive();

    // Drawer logic
    const toggle = mount.querySelector('.nv__toggle');
    const drawer = mount.querySelector('#nv-drawer');
    let lastFocus = null;

    const openDrawer = ()=>{
      lastFocus = document.activeElement;
      drawer.hidden = false;
      toggle.setAttribute('aria-expanded','true');
      // focus first link
      const first = drawer.querySelector('a, button'); first && first.focus();
      document.addEventListener('keydown', onKeydown);
      document.addEventListener('click', onOutside, {capture:true});
    };
    const closeDrawer = ()=>{
      drawer.hidden = true;
      toggle.setAttribute('aria-expanded','false');
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('click', onOutside, {capture:true});
      lastFocus && lastFocus.focus();
    };
    const onKeydown = (e)=>{
      if(e.key === 'Escape'){ closeDrawer(); }
      if(e.key === 'Tab' && !drawer.hidden){
        // simple focus trap
        const focusables = Array.from(drawer.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(el=>!el.hasAttribute('disabled'));
        const first = focusables[0], last = focusables[focusables.length-1];
        if(!focusables.length) return;
        if(e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
        else if(!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
      }
    };
    const onOutside = (e)=>{
      if(drawer.hidden) return;
      if(!drawer.contains(e.target) && !toggle.contains(e.target)){ closeDrawer(); }
    };

    toggle?.addEventListener('click', ()=>{
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeDrawer() : openDrawer();
    });

    // Re-run active state if navigation occurs without reload (optional SPA-ish)
    window.addEventListener('popstate', setActive);

  }catch(err){
    console.error('Navbar load failed', err);
  }
})();
