(function () {
  var bar = document.querySelector("[data-nav-bar]");
  var nav = document.querySelector("[data-nav]");
  if (!bar || !nav) return;

  var toggle = nav.querySelector(".nav__toggle");
  var links = nav.querySelector(".nav__links");
  var lastY = window.scrollY || 0;
  var ticking = false;
  var open = false;

  function setOpen(next) {
    open = next;
    nav.classList.toggle("is-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    }
    if (open) {
      bar.classList.remove("is-hidden");
    }
  }

  function closeMenu() {
    if (open) setOpen(false);
  }

  if (toggle) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!open);
    });
  }

  if (links) {
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
  }

  document.addEventListener("click", function (e) {
    if (!open) return;
    if (!nav.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener(
    "resize",
    function () {
      if (window.innerWidth > 640) closeMenu();
    },
    { passive: true }
  );

  function onScroll() {
    var y = window.scrollY || 0;
    var delta = y - lastY;

    if (open) {
      bar.classList.remove("is-hidden");
      lastY = y;
      ticking = false;
      return;
    }

    if (y < 24) {
      bar.classList.remove("is-hidden");
    } else if (delta > 6) {
      bar.classList.add("is-hidden");
    } else if (delta < -6) {
      bar.classList.remove("is-hidden");
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
})();
