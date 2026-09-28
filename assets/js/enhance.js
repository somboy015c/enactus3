/* ============================================================
   enhance.js — progressive-enhancement polish layer.
   Purely additive: never touches the DOM hooks main.js relies on.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated stat counters ---------- */
  var counters = document.querySelectorAll('.stat-card strong[data-count]');

  function formatValue(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) {
      el.textContent = formatValue(target) + suffix;
      return;
    }
    var duration = 1200;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatValue(target * eased) + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Magnetic tilt on program cards (desktop pointer only) ---------- */
  if (fine && !reduceMotion) {
    var maxDeg = 6;
    document.querySelectorAll('.program-card.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;   // 0..1
        var py = (e.clientY - r.top) / r.height;   // 0..1
        var ry = (px - 0.5) * (maxDeg * 2);
        var rx = (0.5 - py) * (maxDeg * 2);
        card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Nav switch: sliding thumb follows hover, rests on the active page ---------- */
  (function () {
    var track = document.querySelector('.nav-links');
    var thumb = track && track.querySelector('.nav-thumb');
    if (!track || !thumb) return;

    var mobile = window.matchMedia('(max-width: 900px)');
    var items = Array.prototype.slice.call(track.children).filter(function (el) {
      return el !== thumb && (el.tagName === 'A' || el.classList.contains('has-dropdown'));
    });
    var activeLink = track.querySelector('a.is-active, a[aria-current="page"]');
    var activeItem = null;
    items.forEach(function (it) { if (it === activeLink || it.contains(activeLink)) activeItem = it; });
    var current = activeItem;

    function place(item, isActive) {
      if (!item || mobile.matches) { track.classList.remove('has-thumb'); return; }
      thumb.style.left = item.offsetLeft + 'px';
      thumb.style.top = item.offsetTop + 'px';
      thumb.style.width = item.offsetWidth + 'px';
      thumb.style.height = item.offsetHeight + 'px';
      thumb.classList.toggle('on-active', !!isActive);
      track.classList.add('has-thumb');
      current = item;
    }
    function rest() {
      if (activeItem) place(activeItem, true);
      else track.classList.remove('has-thumb');
    }

    items.forEach(function (item) {
      item.addEventListener('mouseenter', function () { place(item, item === activeItem); });
      item.addEventListener('focusin', function () { place(item, item === activeItem); });
    });
    track.addEventListener('mouseleave', rest);
    track.addEventListener('focusout', function (e) {
      if (!track.contains(e.relatedTarget)) rest();
    });

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { rest(); }, 80);
    });
    window.addEventListener('load', rest);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rest);
    rest();
  })();
})();
