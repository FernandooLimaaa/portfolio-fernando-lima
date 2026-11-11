'use strict';
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.querySelector('.page-transition');
  const progress = document.querySelector('.site-progress');

  function closeMenu(){
    menuToggle?.setAttribute('aria-expanded','false');
    menuToggle?.setAttribute('aria-label','Abrir menu');
    mobileMenu?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (mobileMenu) mobileMenu.inert = true;
  }
  menuToggle?.addEventListener('click',()=>{
    const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded',String(isOpen));
    menuToggle.setAttribute('aria-label',isOpen?'Fechar menu':'Abrir menu');
    mobileMenu?.classList.toggle('is-open',isOpen);
    document.body.classList.toggle('menu-open',isOpen);
    if (mobileMenu) mobileMenu.inert = !isOpen;
    if(isOpen) mobileMenu?.querySelector('a')?.focus();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  document.querySelectorAll('.mobile-menu a').forEach(a=>a.addEventListener('click',closeMenu));

  // Page-to-page transition: local, internal links only. Others work natively.
  document.querySelectorAll('a[href]').forEach(a=>{
    const href = a.getAttribute('href');
    if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target || a.hasAttribute('download'))return;
    let url;
    try { url = new URL(href, location.href); } catch {return;}
    if(url.origin!==location.origin || url.pathname===location.pathname)return;
    a.addEventListener('click',e=>{
      if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||reducedMotion)return;
      e.preventDefault();
      overlay?.classList.add('is-entering');
      setTimeout(()=>{ location.href = url.href; },520);
    });
  });
  window.addEventListener('pageshow',()=>overlay?.classList.remove('is-entering'));

  const revealed = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)||reducedMotion){revealed.forEach(el=>el.classList.add('is-visible'));}
  else{
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
    },{threshold:.07,rootMargin:'0px 0px -25px 0px'});
    revealed.forEach(el=>observer.observe(el));
  }
  let scheduled=false;
  const onScroll=()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      const max=document.documentElement.scrollHeight-window.innerHeight;
      if(progress) progress.style.width=`${max>0?Math.min(100,(window.scrollY/max)*100):0}%`;
      scheduled=false;
    });
  };
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  document.querySelector('.to-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'}));
  if(!reducedMotion && window.matchMedia('(pointer:fine)').matches){
    document.addEventListener('pointermove',e=>{
      document.documentElement.style.setProperty('--mx',e.clientX+'px');
      document.documentElement.style.setProperty('--my',e.clientY+'px');
    },{passive:true});
    const art=document.getElementById('project-fan');
    if(art){
      const parent=art.closest('.landing-art');
      parent?.addEventListener('pointermove',e=>{
        const r=art.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;
        art.style.transform=`rotateY(${(x*8).toFixed(2)}deg) rotateX(${(-y*7).toFixed(2)}deg)`;
      });
      parent?.addEventListener('pointerleave',()=>{art.style.transform='';});
    }
  }
  // A different personal insight on each selectable interest.
  const thought=document.getElementById('thought-display');
  document.querySelectorAll('.interest').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.interest').forEach(b=>b.classList.toggle('is-chosen',b===btn));
    if(thought)thought.textContent=btn.dataset.thought||'';
  }));
  // Filter while retaining all of the original career detail.
  document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter').forEach(b=>{const active=b===btn;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
    const target=btn.dataset.filter;
    document.querySelectorAll('.career-entry').forEach(row=>row.hidden=target!=='all'&&row.dataset.category!==target);
  }));
  // Swipe, arrows, tabs, keyboard — four projects with actual captures.
  const viewport=document.querySelector('.project-viewport');
  if(viewport){
    const slides=[...viewport.querySelectorAll('.project-slide')];
    const tabs=[...document.querySelectorAll('.project-tab')];
    const counter=document.querySelector('.showcase-progress>span:first-child');
    const bar=document.querySelector('.track-fill');
    let active=0;
    const select=i=>{
      active=(i+slides.length)%slides.length;
      slides.forEach((s,j)=>{const on=j===active;s.classList.toggle('is-current',on);s.setAttribute('aria-hidden',String(!on)); if('inert' in s)s.inert=!on;});
      tabs.forEach((t,j)=>{const on=j===active;t.classList.toggle('is-selected',on);t.setAttribute('aria-pressed',String(on));});
      if(counter)counter.textContent=String(active+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
      if(bar)bar.style.width=`${(active+1)/slides.length*100}%`;
    };
    document.querySelector('.carousel-prev')?.addEventListener('click',()=>select(active-1));
    document.querySelector('.carousel-next')?.addEventListener('click',()=>select(active+1));
    tabs.forEach((t,i)=>t.addEventListener('click',()=>select(i)));
    viewport.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){select(active-1);e.preventDefault();}if(e.key==='ArrowRight'){select(active+1);e.preventDefault();}});
    let startX=null;
    viewport.addEventListener('touchstart',e=>{startX=e.changedTouches[0]?.screenX??null;},{passive:true});
    viewport.addEventListener('touchend',e=>{if(startX===null)return;const diff=(e.changedTouches[0]?.screenX??startX)-startX;if(Math.abs(diff)>60)select(active+(diff<0?1:-1));startX=null;},{passive:true});
    select(0);
    const hashToIndex={'#nexo':0,'#raio-x':1,'#new-couro':2,'#youlive':3};
    if(location.hash in hashToIndex)select(hashToIndex[location.hash]);
  }
  // Project screenshot galleries: thumbnail selection, arrows, and keyboard support.
  document.querySelectorAll('[data-gallery]').forEach(gallery=>{
    const thumbs=[...gallery.querySelectorAll('.gallery-thumb')];
    const screen=gallery.querySelector('.gallery-screen');
    const screenImg=screen?.querySelector('img');
    const title=gallery.querySelector('.gallery-title');
    const description=gallery.querySelector('.gallery-description');
    const count=gallery.querySelector('.gallery-current');
    let current=0;
    const set=(i,shouldScroll=true)=>{
      if(!thumbs.length)return;
      current=(i+thumbs.length)%thumbs.length;
      const button=thumbs[current];
      thumbs.forEach((b,j)=>{b.classList.toggle('is-active',j===current);b.setAttribute('aria-pressed',String(j===current));});
      if(screenImg){screenImg.src=button.dataset.src;screenImg.alt=button.dataset.title||'Captura do projeto';}
      if(screen){screen.dataset.image=button.dataset.src;screen.dataset.caption=button.dataset.title;}
      if(title)title.textContent=button.dataset.title;
      if(description)description.textContent=button.dataset.caption;
      if(count)count.textContent=String(current+1).padStart(2,'0')+' / '+String(thumbs.length).padStart(2,'0');
      if(shouldScroll) button.scrollIntoView({block:'nearest',inline:'nearest',behavior:reducedMotion?'instant':'smooth'});
    };
    thumbs.forEach((button,i)=>button.addEventListener('click',()=>set(i)));
    gallery.querySelector('.gallery-prev')?.addEventListener('click',()=>set(current-1));
    gallery.querySelector('.gallery-next')?.addEventListener('click',()=>set(current+1));
    gallery.addEventListener('keydown',e=>{if(e.target.closest('.gallery-screen'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();set(current+(e.key==='ArrowRight'?1:-1));}});
    let touchStart=null;
    gallery.querySelector('.gallery-screen-shell')?.addEventListener('touchstart',e=>{touchStart=e.changedTouches[0]?.clientX??null;},{passive:true});
    gallery.querySelector('.gallery-screen-shell')?.addEventListener('touchend',e=>{if(touchStart===null)return;const diff=e.changedTouches[0].clientX-touchStart;if(Math.abs(diff)>65)set(current+(diff<0?1:-1));touchStart=null;},{passive:true});
    set(0,false);
  });
  const dialog=document.getElementById('image-dialog');
  if(dialog){
    document.querySelectorAll('.image-expand').forEach(button=>button.addEventListener('click',()=>{
      const image=dialog.querySelector('img');const caption=dialog.querySelector('p');
      if(image){image.src=button.dataset.image||'';image.alt=button.dataset.caption||'Imagem do projeto';}
      if(caption)caption.textContent=button.dataset.caption||'';
      dialog.showModal();
    }));
    dialog.querySelector('.dialog-close')?.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  }
  document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{
    const original=btn.innerHTML;
    try{
      await navigator.clipboard.writeText(btn.dataset.copy||'');
      btn.textContent='E-MAIL COPIADO ✓';
      setTimeout(()=>{btn.innerHTML=original;},2000);
    }catch{window.location.href='mailto:'+btn.dataset.copy;}
  }));
})();
