(function () {
  var loader = document.querySelector("[data-loader]");
  if (!loader) return;

  var pctEl = loader.querySelector("[data-loader-pct]");
  var horseEl = loader.querySelector(".loader__horse");
  var homeHorse = document.querySelector(".hero__horse");
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  var STORAGE_KEY = "homeLoaderSeen";

  // Show only on first home visit in this tab session, or on hard reload
  var navEntry =
    performance.getEntriesByType &&
    performance.getEntriesByType("navigation")[0];
  var isReload = navEntry
    ? navEntry.type === "reload"
    : performance.navigation && performance.navigation.type === 1;
  var seen = false;
  try {
    seen = sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch (e) {}

  if (seen && !isReload) {
    if (loader.parentNode) loader.parentNode.removeChild(loader);
    return;
  }

  document.body.classList.add("is-loading");
  if (homeHorse) homeHorse.classList.add("is-awaiting-loader");

  var progress = 0;
  var displayed = 0;
  var done = false;
  var minMs = reduceMotion ? 350 : 2100;
  var started = performance.now();
  var assetsReady = document.readyState === "complete";

  function setPct(n) {
    if (!pctEl) return;
    pctEl.textContent = Math.round(n) + "%";
  }

  function markSeen() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
  }

  function removeLoader() {
    document.body.classList.remove("is-loading");
    if (homeHorse) {
      homeHorse.classList.remove("is-awaiting-loader");
      homeHorse.classList.add("is-revealed-from-loader");
    }
    if (loader.parentNode) loader.parentNode.removeChild(loader);
  }

  function morphThenExit() {
    if (!horseEl || !homeHorse || reduceMotion) {
      loader.classList.add("is-exit");
      document.body.classList.remove("is-loading");
      if (homeHorse) {
        homeHorse.classList.remove("is-awaiting-loader");
        homeHorse.classList.add("is-revealed-from-loader");
      }
      window.setTimeout(removeLoader, 750);
      return;
    }

    // Measure before fading the white veil
    var from = horseEl.getBoundingClientRect();
    var to = homeHorse.getBoundingClientRect();
    if (!to.width || !to.height || !from.width) {
      loader.classList.add("is-exit");
      window.setTimeout(removeLoader, 750);
      return;
    }

    var scale = to.width / from.width;
    var dx =
      to.left + to.width / 2 - (from.left + from.width / 2);
    var dy =
      to.top + to.height / 2 - (from.top + from.height / 2);

    loader.classList.add("is-morphing");
    document.body.classList.remove("is-loading");

    // Double rAF so the transition kicks in
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        horseEl.style.transform =
          "translate(" + dx + "px, " + dy + "px) scale(" + scale + ")";
      });
    });

    var ended = false;
    function land() {
      if (ended) return;
      ended = true;
      // Brief overlap: reveal home horse, then drop loader
      homeHorse.classList.remove("is-awaiting-loader");
      homeHorse.classList.add("is-revealed-from-loader");
      horseEl.style.opacity = "0";
      horseEl.style.transition =
        "opacity 0.16s ease, transform 1.05s cubic-bezier(0.22, 1, 0.36, 1)";
      window.setTimeout(removeLoader, 160);
    }

    horseEl.addEventListener("transitionend", function onEnd(e) {
      if (e.propertyName !== "transform") return;
      horseEl.removeEventListener("transitionend", onEnd);
      land();
    });
    window.setTimeout(land, 1150);
  }

  function finish() {
    if (done) return;
    done = true;
    setPct(100);
    markSeen();
    morphThenExit();
  }

  function tick(now) {
    var elapsed = now - started;

    if (!assetsReady) {
      progress = Math.min(88, (elapsed / minMs) * 88);
    } else if (elapsed < minMs) {
      progress = Math.min(97, (elapsed / minMs) * 97);
    } else {
      progress = 100;
    }

    displayed += (progress - displayed) * (progress >= 100 ? 0.4 : 0.16);
    if (progress >= 100 && displayed < 100) {
      displayed = Math.min(100, displayed + 2.5);
    }
    setPct(displayed);

    if (assetsReady && elapsed >= minMs && displayed >= 99.5) {
      finish();
      return;
    }
    if (elapsed >= minMs + 1200 && assetsReady) {
      finish();
      return;
    }
    if (elapsed >= 6000) {
      finish();
      return;
    }

    window.requestAnimationFrame(tick);
  }

  window.addEventListener("load", function () {
    assetsReady = true;
  });

  window.requestAnimationFrame(function () {
    if (!reduceMotion) loader.classList.add("is-waving");
    window.requestAnimationFrame(tick);
  });
})();
