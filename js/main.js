/* Yamazakura Japanese Academy — site behaviour */
(function () {
  'use strict';

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', function () { setMenu(menu.hidden); });
    window.matchMedia('(min-width: 980px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  var subToggle = document.querySelector('.mobile-services-toggle');
  if (subToggle) {
    var sub = document.getElementById(subToggle.getAttribute('aria-controls'));
    subToggle.addEventListener('click', function () {
      var open = sub.hidden;
      sub.hidden = !open;
      subToggle.setAttribute('aria-expanded', String(open));
      subToggle.querySelector('.sign').textContent = open ? '−' : '+';
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduced) {
    var vh = window.innerHeight;
    var els = Array.prototype.filter.call(document.querySelectorAll('[data-reveal]'), function (el) {
      return el.getBoundingClientRect().top > vh * 0.9;
    });
    els.forEach(function (el) { el.classList.add('reveal-init'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- FAQ: one open at a time ---------- */
  var faqs = document.querySelectorAll('.faq-list details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqs.forEach(function (other) { if (other !== d) other.open = false; });
    });
  });

  /* ---------- Gallery filter + lightbox ---------- */
  var gallery = document.querySelector('.gallery-grid');
  if (gallery) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('.g-item'));
    var filterBtns = document.querySelectorAll('.filters .chip-btn');
    var lb = document.getElementById('lightbox');
    var lbImg = lb.querySelector('img');
    var lbCat = lb.querySelector('.cat');
    var lbAlt = lb.querySelector('.lb-alt');
    var lbCount = lb.querySelector('.lb-count');
    var current = -1;
    var lastFocus = null;

    var visible = function () { return items.filter(function (i) { return !i.hidden; }); };

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.dataset.filter;
        filterBtns.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        items.forEach(function (i) { i.hidden = cat !== 'All' && i.dataset.cat !== cat; });
      });
    });

    var show = function (idx) {
      var vis = visible();
      if (!vis.length) return;
      current = (idx + vis.length) % vis.length;
      var item = vis[current];
      var img = item.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCat.textContent = item.dataset.cat;
      lbAlt.textContent = img.alt;
      lbCount.textContent = (current + 1) + ' / ' + vis.length;
    };
    var open = function (item) {
      lastFocus = item;
      show(visible().indexOf(item));
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    };
    var close = function () {
      lb.hidden = true;
      current = -1;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    items.forEach(function (item) { item.addEventListener('click', function () { open(item); }); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lb-close')) close(); });
    lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('enquiry-form');
  if (form) {
    var interestInput = form.querySelector('input[name="interest"]');
    var interestBtns = form.querySelectorAll('.interest-group .chip-btn');
    var subforms = form.querySelectorAll('.subform');
    var success = form.querySelector('.form-success');
    var submitBtn = form.querySelector('.submit-btn');

    var pickInterest = function (value) {
      interestInput.value = value;
      interestBtns.forEach(function (b) {
        var on = b.dataset.interest === value;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      subforms.forEach(function (f) {
        var on = f.dataset.for === value;
        f.hidden = !on;
        f.disabled = !on; // hidden fields are not submitted
      });
      success.hidden = true;
    };
    interestBtns.forEach(function (b) {
      b.addEventListener('click', function () { pickInterest(b.dataset.interest); });
    });
    // Links like contact.html?interest=corporate preselect the matching option
    var fromUrl = {
      language: 'Japanese Language Training',
      corporate: 'Corporate Training',
      interpretation: 'Interpretation Services'
    }[new URLSearchParams(window.location.search).get('interest')];
    if (fromUrl) interestInput.defaultValue = fromUrl;
    pickInterest(interestInput.defaultValue);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitBtn.disabled) return;
      submitBtn.disabled = true;
      submitBtn.querySelector('.spinner').hidden = false;
      submitBtn.querySelector('.label').textContent = 'Sending…';

      // TODO: connect to a form backend (e.g. Formspree, Web3Forms, Netlify Forms)
      // by posting `new FormData(form)` to its endpoint. Until then this only simulates sending.
      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.querySelector('.spinner').hidden = true;
        submitBtn.querySelector('.label').textContent = 'Send Enquiry';
        success.hidden = false;
        form.reset();
        pickInterest(interestInput.defaultValue);
        success.hidden = false;
      }, 1100);
    });
  }
})();
