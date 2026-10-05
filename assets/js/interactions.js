(function () {
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Custom inverted cursor ---------- */
  function initCursor() {
    if (!canHover || reduceMotion) return;

    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);
    document.body.classList.add("has-custom-cursor");

    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    var tx = x;
    var ty = y;
    var raf = 0;
    var pressing = false;

    // Visible immediately on loader / first paint (no need to wait for move)
    if (document.querySelector("[data-loader]") || document.body.classList.contains("is-loading")) {
      dot.classList.add("is-on");
      dot.style.transform =
        "translate(" + x + "px, " + y + "px) translate(-50%, -50%)";
    }

    function render() {
      // Snap while pressing/dragging so the dot never lags behind the hand
      var ease = pressing ? 1 : 0.28;
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      dot.style.transform =
        "translate(" + x + "px, " + y + "px) translate(-50%, -50%)";
      raf = 0;
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) {
        raf = window.requestAnimationFrame(render);
      }
    }

    function askFrame() {
      if (!raf) raf = window.requestAnimationFrame(render);
    }

    function moveTo(clientX, clientY) {
      tx = clientX;
      ty = clientY;
      dot.classList.add("is-on");
      askFrame();
    }

    // Expose for GSAP Draggable (pointer can be captured during drag)
    window.__setCursorPos = moveTo;

    window.addEventListener(
      "pointermove",
      function (e) {
        moveTo(e.clientX, e.clientY);
      },
      { passive: true, capture: true }
    );

    window.addEventListener(
      "pointerdown",
      function (e) {
        pressing = true;
        dot.classList.add("is-down");
        moveTo(e.clientX, e.clientY);
      },
      { passive: true, capture: true }
    );
    window.addEventListener(
      "pointerup",
      function () {
        pressing = false;
        dot.classList.remove("is-down");
      },
      { passive: true, capture: true }
    );
    window.addEventListener(
      "pointercancel",
      function () {
        pressing = false;
        dot.classList.remove("is-down");
      },
      { passive: true, capture: true }
    );

    document.addEventListener(
      "mouseover",
      function (e) {
        var t = e.target;
        if (!(t instanceof Element)) return;
        var hit = t.closest(
          "a, button, [data-spoiler-toggle], .btn, .card, .hero__horse, .curaduria__btn, .photo, .back-top, .about-acc__trigger, .practice, input, textarea, select, summary, label"
        );
        dot.classList.toggle("is-hover", !!hit);
      },
      true
    );

    document.addEventListener("mouseleave", function () {
      dot.classList.remove("is-on");
    });
  }

  /* ---------- Top scroll glass ---------- */
  function initScrollGlass() {
    var glass = document.createElement("div");
    glass.className = "scroll-glass";
    glass.setAttribute("aria-hidden", "true");
    document.body.appendChild(glass);

    var on = false;
    function update() {
      var next = (window.scrollY || 0) > 12;
      if (next === on) return;
      on = next;
      glass.classList.toggle("is-on", on);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(function (el) {
        el.classList.add("is-inview");
      });
      return;
    }

    var targets = document.querySelectorAll(
      [
        ".card",
        ".projects .card",
        "main > section",
        ".canvas > .resumen",
        ".canvas > .research",
        ".tail > .spoiler",
        ".tail > .diseno",
        ".tail > .cta",
        ".page > .hero",
        ".page > .projects",
        ".about > section",
        ".resumen",
        ".contexto",
        ".concepto",
        ".diseno",
        ".cta",
        ".plan",
        ".mercado",
        ".entrevistas",
        ".decisiones",
        ".solucion",
        ".identidad",
        ".flows",
        ".wireframe",
        ".medium",
        ".ds",
        ".hifi",
      ].join(",")
    );

    var seen = new Set();
    var i = 0;
    targets.forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);
      if (el.closest(".canvas") && el.classList.contains("hero")) return;
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--reveal-delay", (i % 4) * 60 + "ms");
      i += 1;
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Horse X paint (home) ---------- */
  function initHorse() {
    var horse = document.querySelector("[data-horse]");
    if (!horse || !canHover) return;

    var ink = horse.querySelector(".hero__horse-ink");
    if (!ink) return;

    var rect = null;

    function measure() {
      rect = horse.getBoundingClientRect();
    }

    function onMove(e) {
      if (!rect) measure();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      horse.style.setProperty("--horse-x", x + "px");
      horse.style.setProperty("--horse-y", y + "px");
      horse.classList.add("is-painting");
    }

    function onLeave() {
      horse.classList.remove("is-painting");
    }

    horse.addEventListener("mouseenter", measure);
    horse.addEventListener("mousemove", onMove);
    horse.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", function () {
      rect = null;
    });
  }

  /* ---------- Case-study hero parallax ---------- */
  function initHeroParallax() {
    if (!canHover || reduceMotion) return;

    var heroes = document.querySelectorAll(".canvas > .hero");
    heroes.forEach(function (hero) {
      var img = hero.querySelector(".hero__art img");
      if (!img) return;
      hero.setAttribute("data-parallax", "");

      hero.addEventListener(
        "mousemove",
        function (e) {
          var r = hero.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          img.style.transform =
            "translate(" + px * 12 + "px, " + py * 8 + "px) scale(1.04)";
        },
        { passive: true }
      );

      hero.addEventListener("mouseleave", function () {
        img.style.transform = "";
      });
    });
  }

  /* ---------- Back to top (case studies, near end of page) ---------- */
  function initBackToTop() {
    var isCaseStudy = !!document.querySelector(
      ".canvas .resumen, .canvas .plan, .canvas .contexto, .canvas .spoiler"
    );
    if (!isCaseStudy) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-top";
    btn.setAttribute("aria-label", "Volver arriba");
    btn.innerHTML =
      '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
      '<path d="M8 3.2L3.4 7.8l1.2 1.2L7.15 6.45V13h1.7V6.45l2.55 2.55 1.2-1.2L8 3.2z" fill="currentColor"/>' +
      "</svg>";
    document.body.appendChild(btn);

    var footer = document.querySelector(".footer");
    var visible = false;

    function setVisible(next) {
      if (next === visible) return;
      visible = next;
      btn.classList.toggle("is-visible", visible);
    }

    function updateByScroll() {
      var doc = document.documentElement;
      var maxScroll = doc.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        setVisible(false);
        return;
      }
      // Show once the reader is in the last ~22% of the page
      setVisible(window.scrollY / maxScroll >= 0.78);
    }

    if ("IntersectionObserver" in window && footer) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) setVisible(true);
            else updateByScroll();
          });
        },
        { rootMargin: "0px 0px 0px 0px", threshold: 0.05 }
      );
      io.observe(footer);
    }

    window.addEventListener("scroll", updateByScroll, { passive: true });
    window.addEventListener("resize", updateByScroll, { passive: true });
    updateByScroll();

    btn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }

  function boot() {
    initCursor();
    initScrollGlass();
    initReveal();
    initHorse();
    initHeroParallax();
    initBackToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
