(function () {
  var root = document.querySelector("[data-about-acc]");
  if (!root) return;

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  root.querySelectorAll(".about-acc__item").forEach(function (item) {
    var trigger = item.querySelector(".about-acc__trigger");
    var panel = item.querySelector(".about-acc__panel");
    if (!trigger || !panel) return;

    var inner = panel.querySelector(".about-acc__panel-inner");
    var animating = false;

    function setOpen(open) {
      if (animating) return;
      var isOpen = trigger.getAttribute("aria-expanded") === "true";
      if (open === isOpen) return;

      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      item.classList.toggle("is-open", open);

      if (reduceMotion) {
        panel.hidden = !open;
        panel.style.height = "";
        panel.style.opacity = "";
        return;
      }

      animating = true;

      if (open) {
        panel.hidden = false;
        panel.style.height = "0px";
        panel.style.opacity = "0";
        // Force layout, then expand to content height
        var target = inner ? inner.scrollHeight : panel.scrollHeight;
        requestAnimationFrame(function () {
          panel.style.height = target + "px";
          panel.style.opacity = "1";
        });
        var onEnd = function (e) {
          if (e.propertyName !== "height") return;
          panel.removeEventListener("transitionend", onEnd);
          panel.style.height = "auto";
          animating = false;
        };
        panel.addEventListener("transitionend", onEnd);
        window.setTimeout(function () {
          if (!animating) return;
          panel.style.height = "auto";
          animating = false;
        }, 520);
      } else {
        var current = panel.scrollHeight;
        panel.style.height = current + "px";
        panel.style.opacity = "1";
        requestAnimationFrame(function () {
          panel.style.height = "0px";
          panel.style.opacity = "0";
        });
        var onClose = function (e) {
          if (e.propertyName !== "height") return;
          panel.removeEventListener("transitionend", onClose);
          panel.hidden = true;
          panel.style.height = "";
          animating = false;
        };
        panel.addEventListener("transitionend", onClose);
        window.setTimeout(function () {
          if (!animating) return;
          panel.hidden = true;
          panel.style.height = "";
          animating = false;
        }, 520);
      }
    }

    trigger.addEventListener("click", function () {
      setOpen(trigger.getAttribute("aria-expanded") !== "true");
    });
  });
})();
