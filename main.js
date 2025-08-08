// Navigation toggle
document.addEventListener('DOMContentLoaded', () => {
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

  // Booking form (fake submit)
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

  // Dynamic Gallery
  const galleryGrid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const closeBtn = document.querySelector('.lightbox-close');
  let currentIndex = 0;
  let currentSet = [];

  const items = [
    {src:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80', alt:'Olas del Mediterráneo al atardecer', cat:'mar'},
    {src:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', alt:'Callejón del casco antiguo', cat:'entorno'},
    {src:'https://images.unsplash.com/photo-1505691723518-36a5ac3b2cb9?auto=format&fit=crop&w=1600&q=80', alt:'Desayuno mediterráneo', cat:'gastronomia'},
    {src:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80', alt:'Piscina con borde infinito', cat:'entorno'},
    {src:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80', alt:'Dormitorio luminoso con textiles naturales', cat:'interior'},
    {src:'https://images.unsplash.com/photo-1469796466635-455ede028aca?auto=format&fit=crop&w=1600&q=80', alt:'Café y bollería artesanal', cat:'gastronomia'},
    {src:'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1600&q=80', alt:'Sala de estar con toques en verde agua', cat:'interior'},
    {src:'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=80', alt:'Playa y sombrillas de esparto', cat:'mar'},
    {src:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80', alt:'Terraza con vistas', cat:'entorno'}
  ];

  function render(filter='todas'){
    if(!galleryGrid) return;
    galleryGrid.innerHTML = '';
    currentSet = items
      .map((it, idx)=>({...it, idx}))
      .filter(it => filter === 'todas' ? true : it.cat === filter);

    currentSet.forEach(it => {
      const card = document.createElement('figure');
      card.className = 'gallery-item';
      
      card.innerHTML = `
        <img loading="lazy" src="${it.src}" alt="${it.alt}">
        <figcaption class="caption">${it.alt}</figcaption>`;

      card.addEventListener('click', ()=> openLightbox(it.idx));
      galleryGrid.appendChild(card);
    });
  }

  function openLightbox(idx){
    currentIndex = idx;
    const it = items[currentIndex];
    if(!it) return;
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbCaption.textContent = it.alt;
    if(typeof lightbox.showModal === 'function'){
      lightbox.showModal();
    } else {
      lightbox.setAttribute('open','');
    }
  }

  function closeLightbox(){
    if(lightbox.open) lightbox.close();
  }

  function next(delta){
    currentIndex = (currentIndex + delta + items.length) % items.length;
    openLightbox(currentIndex);
  }

  prevBtn && prevBtn.addEventListener('click', ()=> next(-1));
  nextBtn && nextBtn.addEventListener('click', ()=> next(1));
  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e)=>{
    if(!lightbox.open) return;
    if(e.key==='Escape') closeLightbox();
    if(e.key==='ArrowRight') next(1);
    if(e.key==='ArrowLeft') next(-1);
  });

  // Filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn=> btn.addEventListener('click', ()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    render(btn.dataset.filter);
  }));

  // Initial render
  render();
});
