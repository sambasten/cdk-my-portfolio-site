/* Samuel Akinwumi — portfolio behaviour. Vanilla JS, no dependencies. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Header: shrink on scroll + back-to-top ---------- */
  var header = $(".header");
  var toTop = $(".to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 24);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Mobile navigation ---------- */
  var toggle = $(".nav-toggle");
  var nav = $(".nav");
  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", closeNav); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 960) closeNav(); });
  }

  /* ---------- Active section highlight ---------- */
  var navLinks = $$(".nav a[href^='#']");
  var sections = navLinks.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var activeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (s) { activeObs.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$("[data-reveal]");
  function revealNow(el) { el.classList.add("is-visible"); el.dispatchEvent(new CustomEvent("reveal")); }
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(revealNow);
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealNow(entry.target);
        revealObs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  }

  /* ---------- Counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var duration = reduceMotion ? 0 : 1400;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = duration ? Math.min((ts - start) / duration, 1) : 1;
      var eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = prefix + Math.round(target * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    if (!el.firstChild || el.firstChild.nodeType !== 3) el.insertBefore(document.createTextNode("0"), el.firstChild);
    requestAnimationFrame(frame);
    if (suffix && !$("small", el)) {
      var s = document.createElement("small"); s.textContent = suffix; el.appendChild(s);
    }
  }
  $$("[data-count]").forEach(function (el) {
    var host = el.closest("[data-reveal]") || el;
    var fired = false;
    var run = function () { if (fired) return; fired = true; animateCount(el); };
    if (host.classList.contains("is-visible")) run(); else host.addEventListener("reveal", run, { once: true });
  });

  /* ---------- Skill meters ---------- */
  $$(".meter").forEach(function (meter) {
    var pct = Math.max(0, Math.min(100, parseFloat(meter.getAttribute("data-value")) || 0));
    var fg = $(".meter__fg", meter);
    var out = $("output", meter);
    var circumference = 2 * Math.PI * 40; // r = 40 in the SVG
    if (fg) { fg.style.strokeDasharray = circumference; fg.style.strokeDashoffset = circumference; }
    var host = meter.closest("[data-reveal]") || meter;
    var fill = function () {
      if (fg) fg.style.strokeDashoffset = circumference * (1 - pct / 100);
      if (out) {
        var duration = reduceMotion ? 0 : 1400, start = null;
        (function tick(ts) {
          if (start === null) start = ts;
          var p = duration ? Math.min((ts - start) / duration, 1) : 1;
          out.textContent = Math.round(pct * (1 - Math.pow(1 - p, 3))) + "%";
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
      }
    };
    if (host.classList.contains("is-visible")) fill(); else host.addEventListener("reveal", fill, { once: true });
  });

  /* ---------- Rotating role text ---------- */
  var rotator = $(".rotator");
  if (rotator) {
    var words = $$("span", rotator);
    var idx = 0;
    words[0].classList.add("is-in");
    if (!reduceMotion && words.length > 1) {
      setInterval(function () {
        words[idx].classList.remove("is-in");
        idx = (idx + 1) % words.length;
        words[idx].classList.add("is-in");
      }, 3200);
    }
  }

  /* ---------- Cursor-tracked card glow ---------- */
  if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    $$(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Footer year ---------- */
  var year = $("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
