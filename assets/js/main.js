/* KUGA Inc. — common scripts */
(function(){
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveal on scroll */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); }
    });
  },{threshold:.12});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });

  /* Orb parallax (rAF throttled) */
  var orbs = Array.prototype.slice.call(document.querySelectorAll('.orb[data-p]'));
  var ticking = false;
  function onScroll(){
    if(ticking) return; ticking = true;
    requestAnimationFrame(function(){
      var y = scrollY;
      if(!reduced){
        orbs.forEach(function(o){
          o.style.transform = 'translateY(' + (y * parseFloat(o.dataset.p) * 10) + 'px)';
        });
      }
      /* nav scrolled state */
      var nav = document.querySelector('nav');
      if(nav) nav.classList.toggle('scrolled', y > 40);
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* Count-up */
  var counters = document.querySelectorAll('[data-count]');
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return; cio.unobserve(e.target);
      var el = e.target, end = +el.dataset.count, v = el.querySelector('.v');
      if(reduced){ v.textContent = end; return; }
      var t0 = performance.now(), dur = 1400;
      (function step(t){
        var p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 4);
        v.textContent = Math.round(end * ease);
        if(p < 1) requestAnimationFrame(step);
      })(t0);
    });
  },{threshold:.5});
  counters.forEach(function(c){ cio.observe(c); });

  /* Scroll-driven word reveal (.wr) */
  document.querySelectorAll('.wr').forEach(function(el){
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      if(!node.textContent.trim()) return;
      var frag = document.createDocumentFragment();
      /* split: latin words by space, CJK per character */
      node.textContent.match(/[A-Za-z0-9''.,-]+\s*|\s+|./g).forEach(function(chunk){
        if(!chunk.trim()){ frag.appendChild(document.createTextNode(chunk)); return; }
        var s = document.createElement('span');
        s.className = 'w'; s.textContent = chunk;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    var words = el.querySelectorAll('.w');
    if(reduced){ words.forEach(function(w){ w.classList.add('on'); }); return; }
    function update(){
      var r = el.getBoundingClientRect();
      var p = Math.min(Math.max((innerHeight * .82 - r.top) / (r.height + innerHeight * .28), 0), 1);
      var lit = Math.round(p * words.length);
      words.forEach(function(w, i){ w.classList.toggle('on', i < lit); });
    }
    addEventListener('scroll', function(){ requestAnimationFrame(update); }, {passive:true});
    update();
  });

  /* Mobile menu */
  var btn = document.querySelector('.menu-btn');
  if(btn){
    btn.addEventListener('click', function(){
      document.body.classList.toggle('menu-open');
    });
    document.querySelectorAll('.m-menu a').forEach(function(a){
      a.addEventListener('click', function(){ document.body.classList.remove('menu-open'); });
    });
  }
})();
