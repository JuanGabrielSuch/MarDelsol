// Mar del Sol — UI & Galería
document.addEventListener('DOMContentLoaded', () => {
  // Nav toggle
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true' || false;
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal-up');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); }
    });
  }, {threshold:.12});
  revealEls.forEach(el=>io.observe(el));

  // Gallery data (aspect hints)
  const items = [
    {id:1,  src:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', w:2400, h:1600, alt:'Olas del Mediterráneo al atardecer', cat:'mar'},
    {id:2,  src:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', w:2400, h:1600, alt:'Callejón del casco antiguo', cat:'entorno'},
    {id:3,  src:'https://images.unsplash.com/photo-1505691723518-36a5ac3b2cb9', w:2000, h:1333, alt:'Desayuno mediterráneo', cat:'gastronomia'},
    {id:4,  src:'https://images.unsplash.com/photo-1493809842364-78817add7ffb', w:2400, h:1600, alt:'Piscina con borde infinito', cat:'entorno'},
    {id:5,  src:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', w:2400, h:1600, alt:'Dormitorio luminoso con textiles naturales', cat:'interior'},
    {id:6,  src:'https://images.unsplash.com/photo-1469796466635-455ede028aca', w:2000, h:1333, alt:'Café y bollería artesanal', cat:'gastronomia'},
    {id:7,  src:'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a', w:2400, h:1600, alt:'Sala de estar con toques en verde agua', cat:'interior'},
    {id:8,  src:'https://images.unsplash.com/photo-1477587458883-47145ed94245', w:2000, h:1333, alt:'Playa y sombrillas de esparto', cat:'mar'},
    {id:9,  src:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', w:2400, h:1600, alt:'Terraza con vistas', cat:'entorno'}
  ];

  // Elements
  const chipWrap = document.getElementById('filterChips');
  const gallery = document.getElementById('galleryJustified');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const closeBtn = document.querySelector('.lightbox-close');

  let currentIdx = 0;
  let activeFilter = 'todas';
  let visible = items.slice();

  const debounce = (fn, ms=150) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };

  function countsByCat(list){
    const counts = {todas:list.length};
    list.forEach(it => { counts[it.cat] = (counts[it.cat]||0)+1; });
    return counts;
  }

  function buildChips(){
    if(!chipWrap) return;
    const counts = countsByCat(items);
    const order = ['todas','mar','interior','gastronomia','entorno'];
    chipWrap.innerHTML = '';
    order.forEach(cat => {
      const label = cat === 'todas' ? 'Todas' :
                    cat === 'mar' ? 'Mar' :
                    cat === 'interior' ? 'Interiores' :
                    cat === 'gastronomia' ? 'Gastronomía' : 'Entorno';
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.type = 'button';
      btn.dataset.filter = cat;
      btn.setAttribute('aria-pressed', String(cat===activeFilter));
      btn.textContent = label + ' · ' + (counts[cat]||0);
      btn.addEventListener('click', () => {
        activeFilter = cat;
        chipWrap.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed','false'));
        btn.setAttribute('aria-pressed','true');
        applyFilter();
      });
      chipWrap.appendChild(btn);
    });
  }

  function applyFilter(){
    visible = activeFilter === 'todas' ? items.slice() : items.filter(it => it.cat === activeFilter);
    renderJustified();
  }

  function imgUrl(base, w){
    return base + '?auto=format&fit=crop&w=' + w + '&q=80';
  }

  function renderJustified(){
    if(!gallery) return;
    gallery.innerHTML = '';
    const containerWidth = gallery.clientWidth || gallery.getBoundingClientRect().width || 1100;
    const gap = 10; // px
    const isMobile = containerWidth <= 640;
    const targetRowH = containerWidth > 900 ? 260 : containerWidth > 640 ? 220 : 240;

    let row = [];
    let rowAspectSum = 0;

    function flushRow(isLast){
      if(row.length === 0) return;
      const rowDiv = document.createElement('div');
      rowDiv.className = 'gallery-row';

      const totalAspect = rowAspectSum;
      const scale = (containerWidth - gap*(row.length-1)) / (targetRowH * totalAspect);
      const rowH = Math.round(targetRowH * (isLast && scale > 1 ? 1 : scale));

      row.forEach(it => {
        const w = Math.round(rowH * (it.w/it.h));
        const card = document.createElement('figure');
        card.className = 'gallery-card';
        card.style.width = w + 'px';
        card.style.height = rowH + 'px';
        card.innerHTML = [
          '<img loading="lazy" decoding="async"',
          '     src="' + imgUrl(it.src, Math.min(800, w)) + '"',
          '     srcset="'
             + imgUrl(it.src, 400) + ' 400w, '
             + imgUrl(it.src, 800) + ' 800w, '
             + imgUrl(it.src, 1200) + ' 1200w, '
             + imgUrl(it.src, 1600) + ' 1600w"',
          '     sizes="(max-width:640px) 95vw, (max-width:1100px) 90vw, 1000px"',
          '     alt="' + it.alt.replace(/"/g,'&quot;') + '">',
          '<figcaption class="caption">' + it.alt + '</figcaption>'
        ].join('\n');
        card.addEventListener('click', () => openLightbox(it.id));
        rowDiv.appendChild(card);
      });
      gallery.appendChild(rowDiv);
      row = [];
      rowAspectSum = 0;
    }

    visible.forEach(it => {
      const aspect = it.w/it.h;
      row.push(it);
      rowAspectSum += aspect;
      const rowWidthEstimate = targetRowH * rowAspectSum + gap*(row.length-1);
      if(isMobile){
        if(row.length >= 2 || rowWidthEstimate >= containerWidth) flushRow(false);
      } else {
        if(rowWidthEstimate >= containerWidth) flushRow(false);
      }
    });
    flushRow(true); // last row
  }

  // Lightbox
  function indexOfId(id){ return items.findIndex(x => x.id === id); }
  function openLightbox(id){
    const idx = indexOfId(id);
    if(idx < 0) return;
    currentIdx = idx;
    const it = items[currentIdx];
    lbImg.src = imgUrl(it.src, 1600);
    lbImg.alt = it.alt;
    lbCaption.textContent = it.alt;
    if(typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open','');
    location.hash = 'img-' + it.id;
    preloadNeighbors();
  }
  function closeLightbox(){
    if(lightbox.open) lightbox.close();
    if(location.hash.indexOf('#img-') === 0){
      history.replaceState(null,'',location.pathname + location.search);
    }
  }
  function move(delta){
    currentIdx = (currentIdx + delta + items.length) % items.length;
    openLightbox(items[currentIdx].id);
  }
  function preloadNeighbors(){
    [currentIdx-1, currentIdx+1].forEach(i => {
      const it = items[(i + items.length) % items.length];
      const im = new Image();
      im.src = imgUrl(it.src, 1600);
    });
  }
  prevBtn && prevBtn.addEventListener('click', ()=> move(-1));
  nextBtn && nextBtn.addEventListener('click', ()=> move(1));
  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e)=>{
    if(!lightbox.open) return;
    if(e.key==='Escape') closeLightbox();
    if(e.key==='ArrowRight') move(1);
    if(e.key==='ArrowLeft') move(-1);
  });
  // Swipe
  let startX=0, startY=0, tracking=false;
  if(lightbox){
    lightbox.addEventListener('pointerdown', (e)=>{ startX=e.clientX; startY=e.clientY; tracking=true; });
    lightbox.addEventListener('pointerup', (e)=>{
      if(!tracking) return;
      tracking=false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40){
        move(dx<0 ? 1 : -1);
      }
    });
  }
  // Deep link
  if(location.hash.indexOf('#img-') === 0){
    const id = parseInt(location.hash.replace('#img-',''), 10);
    if(!Number.isNaN(id)) setTimeout(()=>openLightbox(id), 200);
  }

  // Booking form (demo)
  const bookingForm = document.getElementById('bookingForm');
  const formMsg = document.getElementById('formMsg');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!bookingForm.checkValidity()) {
        formMsg.textContent = 'Revisa los campos y vuelve a intentarlo.';
        formMsg.style.color = '#a03';
        return;
      }
      formMsg.textContent = '¡Reserva enviada! Te contactaremos por email.';
      formMsg.style.color = '#0a5';
      bookingForm.reset();
    });
  }

  // Init
  buildChips();
  applyFilter();
  window.addEventListener('resize', debounce(renderJustified, 200));
});
