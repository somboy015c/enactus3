(function () {
  'use strict';

  // Preloader: hide as soon as the page content itself is ready, with a
  // hard cap so it never shows for more than MAX_WAIT_MS regardless of
  // how long third-party scripts/images take to finish loading.
  (function () {
    var MAX_WAIT_MS = 2500;
    var hidden = false;
    function hidePreloader() {
      if (hidden) return;
      hidden = true;
      var pre = document.getElementById('preloader');
      if (!pre) return;
      pre.style.transition = 'opacity 0.35s ease';
      pre.style.opacity = '0';
      pre.style.pointerEvents = 'none';
      setTimeout(function () { pre.style.display = 'none'; }, 350);
    }
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(hidePreloader, 150);
    });
    setTimeout(hidePreloader, MAX_WAIT_MS);
  })();

  var nav = document.getElementById('navbar');
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('nav-menu');

  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    if (menu) {
      menu.querySelectorAll('a').forEach(function (a) {
        var isDropdownToggle = a.parentElement.classList.contains('has-dropdown');
        if (isDropdownToggle) return;
        a.addEventListener('click', function () {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
      menu.querySelectorAll('.has-dropdown').forEach(function (item) {
        var link = item.querySelector(':scope > a');
        link.addEventListener('click', function (e) {
          if (window.innerWidth > 900) return;
          e.preventDefault();
          item.classList.toggle('is-open');
        });
      });
    }
  }
})();

/* ===================== Nationals countdown banner =====================
   Shown automatically only during the configured competition window. */
(function () {
  var NATIONALS_CONFIG = {
    windowStart: new Date("2026-07-13T00:00:00"),
    eventDate: new Date("2026-08-13T09:00:00"),
    windowEnd: new Date("2026-08-13T23:59:59")
  };

  var banner = document.getElementById('nationals-banner');
  if (!banner) return;
  var now = new Date();
  if (now < NATIONALS_CONFIG.windowStart || now > NATIONALS_CONFIG.windowEnd) {
    banner.style.display = 'none';
    return;
  }
  banner.style.display = 'block';
  var welcomeSection = document.getElementById('welcome-slide-section');
  if (welcomeSection) welcomeSection.style.display = 'none';

  var elDays = document.getElementById('cd-days');
  var elHours = document.getElementById('cd-hours');
  var elMins = document.getElementById('cd-mins');
  var elSecs = document.getElementById('cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    var diff = NATIONALS_CONFIG.eventDate - new Date();
    if (diff <= 0) {
      elDays.textContent = elHours.textContent = elMins.textContent = elSecs.textContent = '00';
      clearInterval(timerId);
      return;
    }
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff / 3600000) % 24);
    var mins = Math.floor((diff / 60000) % 60);
    var secs = Math.floor((diff / 1000) % 60);
    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }
  tick();
  var timerId = setInterval(tick, 1000);
})();

/* ===================== VIDEO_LIBRARY — edit to add/remove videos ===================== */
(function () {
  var VIDEO_LIBRARY = [
    { id: "m3VR1LBH69s", title: "Our Impact Story", category: "general" },
    { id: "QD3j5tIZ-O0", title: "Enactus Nigeria", category: "general" },
    { id: "4FJBj31aPBQ", title: "Enactus Nigeria", category: "general" },
    { id: "SayHFj-x6BA", title: "Enactus Nigeria", category: "general" },
    { id: "dPE6b9aEpNU", title: "Special Project", category: "special" },
    { id: "297TmHAHo2c", title: "Special Project", category: "special" }
  ];

  var player = document.getElementById('video-gallery-player');
  var thumbWrap = document.getElementById('video-gallery-thumbs');
  var tabWrap = document.getElementById('video-gallery-tabs');
  if (!player || !thumbWrap || !tabWrap) return;

  var activeCategory = 'all';
  var activeId = VIDEO_LIBRARY[0].id;

  function thumbUrl(id) {
    return 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
  }

  function renderPlayer(id, autoplay) {
    activeId = id;
    if (autoplay) {
      player.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id +
        '?autoplay=1&rel=0" title="Enactus Nigeria video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    } else {
      player.innerHTML =
        '<img class="video-gallery-poster" src="' + thumbUrl(id) + '" alt="video thumbnail">' +
        '<button type="button" class="video-play-btn" id="video-gallery-playlink" aria-label="Play video"><i class="fa fa-play" aria-hidden="true"></i></button>';
      var poster = player.querySelector('.video-gallery-poster');
      var playBtn = document.getElementById('video-gallery-playlink');
      var play = function () { renderPlayer(id, true); };
      poster.addEventListener('click', play);
      playBtn.addEventListener('click', play);
    }
    markActiveThumb();
  }

  function markActiveThumb() {
    thumbWrap.querySelectorAll('.video-thumb').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-id') === activeId);
    });
  }

  function renderThumbs() {
    thumbWrap.innerHTML = '';
    VIDEO_LIBRARY
      .filter(function (v) { return activeCategory === 'all' || v.category === activeCategory; })
      .forEach(function (v) {
        var thumb = document.createElement('div');
        thumb.className = 'video-thumb';
        thumb.setAttribute('data-id', v.id);
        thumb.innerHTML =
          '<div class="video-thumb-frame">' +
          '<img src="' + thumbUrl(v.id) + '" alt="' + v.title + '">' +
          '<span class="video-thumb-play"><i class="fa fa-play" aria-hidden="true"></i></span>' +
          '</div>' +
          '<div class="video-thumb-title">' + v.title + '</div>';
        thumb.addEventListener('click', function () { renderPlayer(v.id, true); });
        thumbWrap.appendChild(thumb);
      });
    markActiveThumb();
  }

  tabWrap.querySelectorAll('.video-tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabWrap.querySelectorAll('.video-tab-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderThumbs();
    });
  });

  renderPlayer(VIDEO_LIBRARY[0].id, false);
  renderThumbs();
})();

/* ===================== Generic slider =====================
   Drag-to-scroll + arrow buttons for video thumbs, programs and
   partner logos. Works on any ".slider" wrapper containing a
   ".slider-track" and optional [data-slider-prev]/[data-slider-next]. */
(function () {
  document.querySelectorAll('.slider').forEach(function (wrap) {
    var track = wrap.querySelector('.slider-track');
    if (!track) return;

    var prevBtn = wrap.querySelector('[data-slider-prev]');
    var nextBtn = wrap.querySelector('[data-slider-next]');
    function step() {
      var card = track.children[0];
      return card ? card.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (nextBtn) nextBtn.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });

    var isDown = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener('mousedown', function (e) {
      isDown = true; moved = false;
      startX = e.pageX; startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
    });
    window.addEventListener('mouseup', function () { isDown = false; track.classList.remove('is-dragging'); });
    track.addEventListener('mouseleave', function () { isDown = false; track.classList.remove('is-dragging'); });
    track.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    track.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });
})();

