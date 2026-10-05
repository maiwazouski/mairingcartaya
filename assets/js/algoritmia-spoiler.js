(function () {
  var root = document.querySelector("[data-spoiler]");
  if (!root) return;

  var toggles = root.querySelectorAll("[data-spoiler-toggle]");
  var panel = root.querySelector(".spoiler__panel");
  if (!toggles.length || !panel) return;

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function scrollToSpoiler() {
    var top =
      root.getBoundingClientRect().top +
      (window.scrollY || window.pageYOffset) -
      24;
    window.scrollTo({
      top: top,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  function setExpandedAttrs(open) {
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].setAttribute("aria-expanded", open ? "true" : "false");
    }
    panel.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function setInert(on) {
    if ("inert" in panel) panel.inert = on;
  }

  function setOpen(open) {
    setExpandedAttrs(open);

    if (open) {
      panel.hidden = false;
      setInert(false);
      void panel.offsetHeight;
      root.classList.add("is-open");
      window.requestAnimationFrame(scrollToSpoiler);
      return;
    }

    root.classList.remove("is-open");
    setInert(true);

    var finish = function () {
      if (!root.classList.contains("is-open")) {
        panel.hidden = true;
      }
    };

    if (reduceMotion) {
      finish();
      return;
    }

    var done = false;
    var onEnd = function (e) {
      if (e.target !== panel || e.propertyName !== "grid-template-rows") return;
      done = true;
      panel.removeEventListener("transitionend", onEnd);
      finish();
    };
    panel.addEventListener("transitionend", onEnd);
    window.setTimeout(function () {
      if (!done) {
        panel.removeEventListener("transitionend", onEnd);
        finish();
      }
    }, 700);
  }

  for (var t = 0; t < toggles.length; t++) {
    toggles[t].addEventListener("click", function () {
      setOpen(!root.classList.contains("is-open"));
    });
  }

  setExpandedAttrs(false);
  setInert(true);
})();
