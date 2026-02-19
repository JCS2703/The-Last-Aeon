(function(){
  // Sections by ID matching new layout
  const sections = {
    'guardianes': document.getElementById('guardianes'),
    'etica': document.getElementById('etica'),
    'calendario': document.getElementById('calendario'),
    'iniciacion': document.getElementById('iniciacion'),
    'pequenas-magias': document.getElementById('pequenas-magias'),
    'proteccion': document.getElementById('proteccion'),
    'jerarquia': document.getElementById('jerarquia'),
    'simbolos': document.getElementById('simbolos')
  };

  async function loadRichContent(container){
    if (!container || container.getAttribute('data-loaded') === 'true') return;
    const src = container.getAttribute('data-src');
    if (!src) return;
    try {
      let html;
      
      // Try electronAPI first (for desktop app)
      if (window.electronAPI) {
        const result = window.electronAPI.readFile(src);
        if (result.success) {
          html = result.content;
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback to fetch (for web browser)
        const res = await fetch(src, { cache: 'no-cache' });
        if (!res.ok) throw new Error('HTTP '+res.status);
        html = await res.text();
      }
      
      container.innerHTML = html;
      container.setAttribute('data-loaded', 'true');
    } catch (e) {
      console.error('Error loading content:', e);
      container.innerHTML = '<div class="card"><h3>Error al cargar contenido</h3><p>No fue posible cargar el archivo: ' + src + '</p><p>Por favor, recarga la página.</p></div>';
    }
  }

// --- Scroll reveal (subtle) ---
function initScrollReveal(){
  const sel = ['.card', '.guardian-section', '.function-item', '.minor-guardian-item'];
  const nodes = document.querySelectorAll(sel.join(','));
  nodes.forEach(n=>n.classList.add('reveal'));
  const io = new IntersectionObserver((entries)=>{
    for (const e of entries){
      if (e.isIntersecting){
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }
  }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  nodes.forEach(n=>io.observe(n));
}

// --- Light parallax on header runes ---
function initRuneParallax(){
  const left = document.querySelector('.rune-left');
  const right = document.querySelector('.rune-right');
  if (!left || !right) return;
  let ticking = false;
  function onScroll(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(()=>{
      const y = window.scrollY || 0;
      const dy = Math.min(2, y * 0.01);
      left.style.transform = `translateY(${dy}px)`;
      right.style.transform = `translateY(${-dy}px)`;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
}

// --- Cursor trail (golden sparks) ---
function initCursorTrail(){
  const canvas = document.getElementById('cursorTrail');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const maxP = 180;
  let lastX = 0, lastY = 0, hasLast = false;

  function spawn(x,y){
    for (let i=0;i<3;i++){
      if (particles.length >= maxP) particles.shift();
      const a = Math.random()*Math.PI*2;
      const sp = 0.5 + Math.random()*0.8;
      particles.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, r: Math.random()*1.6+0.6, life: 1.0 });
    }
  }

  document.addEventListener('mousemove', (e)=>{
    const x = e.clientX, y = e.clientY;
    spawn(x,y);
    if (hasLast){
      // interpolate to avoid gaps on fast moves
      const dx = x - lastX, dy = y - lastY; const dist = Math.hypot(dx,dy);
      if (dist > 24){
        const steps = Math.min(6, Math.floor(dist/24));
        for (let i=1;i<=steps;i++) spawn(lastX + dx*i/(steps+1), lastY + dy*i/(steps+1));
      }
    }
    lastX = x; lastY = y; hasLast = true;
  }, { passive: true });

  function step(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    for (const p of particles){
      p.x += p.vx; p.y += p.vy; p.vy += 0.02; // slight fall
      p.life -= 0.015 + Math.random()*0.01;
      ctx.globalAlpha = Math.max(0, p.life)*0.8;
      ctx.fillStyle = '#d4af37';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    }
    // remove dead
    for (let i=particles.length-1;i>=0;i--) if (particles[i].life<=0) particles.splice(i,1);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// --- Background floating particles ---
function initBgParticles(){
  const canvas = document.getElementById('bgParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    particles = createParticles();
  }

  function createParticles(){
    const count = Math.min(140, Math.floor((W*H)/25000));
    const arr = [];
    for (let i=0;i<count;i++){
      arr.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: Math.random()*1.6 + 0.4,
        a: Math.random()*Math.PI*2,
        sp: 0.15 + Math.random()*0.25,
        tw: 0.5 + Math.random()*1.2,
        glow: Math.random()*0.5+0.2
      });
    }
    return arr;
  }

  function step(){
    ctx.clearRect(0,0,W,H);
    for (const p of particles){
      p.a += 0.004;
      p.x += Math.cos(p.a)*p.tw * 0.3;
      p.y -= p.sp * 0.6; // float upwards slowly
      if (p.y < -10){ p.y = H+10; p.x = Math.random()*W; }
      if (p.x < -10) p.x = W+10; if (p.x > W+10) p.x = -10;
      ctx.fillStyle = `rgba(212,175,55,${0.35+p.glow*0.4})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(step);
}

// --- Build a local index of headings (h3) in each content area ---
function buildLocalIndex(sectionEl){
  if (!sectionEl) return;
  const body = sectionEl.querySelector('.content-body');
  if (!body) return;
  // Avoid duplicates
  if (body.querySelector('.section-index')) return;
  let heads = Array.from(body.querySelectorAll('h3'));
  // Exclude 'Visual' headings (used inside symbol variants)
  heads = heads.filter(h => h.textContent.replace(/\s+/g,' ').trim().toLowerCase() !== 'visual');
  // Fallback: if not enough h3, include h2 as single-entry index
  if (heads.length < 1) heads = Array.from(body.querySelectorAll('h2'));
  if (heads.length < 1) return;

  // Add ids to headings (unique per section) to avoid collisions across sections
  const secId = sectionEl.id || 'sec';
  heads.forEach((h,i) => {
    const id = `${secId}-heading-${i}`;
    h.id = id;
  });

  const indexHtml = `
    <div class="section-index">
      <h4>Índice de esta sección</h4>
      <ul>
        ${heads.map(h => `<li><a href="#${h.id}">${h.textContent}</a></li>`).join('')}
      </ul>
    </div>
  `;
  body.insertAdjacentHTML('afterbegin', indexHtml);
}

// --- Show content section ---
function showContent(sectionId){
  const mainMenu = document.getElementById('mainMenu');
  const targetSection = sections[sectionId];
  if (!targetSection) return;
  
  // Hide all sections
  Object.values(sections).forEach(section => {
    if (section) section.classList.remove('active');
  });
  mainMenu.style.display = 'none';
  
  // Show target section
  targetSection.classList.add('active');
  
  // Load content if not already loaded
  const container = targetSection.querySelector('.rich-content');
  if (container && !container.getAttribute('data-loaded')) {
    loadRichContent(container);
  }
  
  // Build index after content loads
  setTimeout(() => buildLocalIndex(targetSection), 500);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Add floating back button
  addFloatBack();
}

// --- Show main menu ---
function showMenu(){
  // Hide all sections
  Object.values(sections).forEach(section => {
    if (section) section.classList.remove('active');
  });
  
  // Show main menu
  const mainMenu = document.getElementById('mainMenu');
  mainMenu.style.display = 'grid';
  
  // Remove floating back button
  removeFloatBack();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Floating back button ---
function addFloatBack(){
  removeFloatBack();
  const btn = document.createElement('button');
  btn.className = 'float-back';
  btn.textContent = '← Menú';
  btn.onclick = showMenu;
  document.body.appendChild(btn);
}
function removeFloatBack(){
  const existing = document.querySelector('.float-back');
  if (existing) existing.remove();
}

// --- Logo sand animation ---
function initLogoSand(){
  const canvas = document.getElementById('logoSand');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const particles = [];
  const maxP = 80;
  
  function resize(){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  
  function createParticle(){
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -Math.random() * 1.5 - 0.5,
      r: Math.random() * 2 + 1,
      life: 1.0
    };
  }
  
  function step(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add new particles
    if (particles.length < maxP && Math.random() < 0.1){
      particles.push(createParticle());
    }
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // gravity
      p.life -= 0.008;
      
      if (p.life <= 0 || p.y < -10){
        particles.splice(i, 1);
        continue;
      }
      
      ctx.globalAlpha = p.life * 0.6;
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    
    requestAnimationFrame(step);
  }
  
  requestAnimationFrame(step);
}

// --- Initialize everything when DOM is ready ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init(){
  initScrollReveal();
  initCursorTrail();
  initBgParticles();
  initLogoSand();
  initRuneParallax();
}

})();