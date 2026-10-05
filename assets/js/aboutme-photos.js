(function () {
  var root = document.querySelector("[data-photos]");
  if (!root || typeof gsap === "undefined" || typeof Draggable === "undefined") {
    return;
  }

  var photos = root.querySelectorAll(".photo");
  if (!photos.length) return;

  gsap.registerPlugin(Draggable);

  function clampPhoto(draggable) {
    var el = draggable.target;
    var rootRect = root.getBoundingClientRect();
    var elRect = el.getBoundingClientRect();

    // How far the element currently sits past each edge (positive = outside)
    var overLeft = rootRect.left - elRect.left;
    var overRight = elRect.right - rootRect.right;
    var overTop = rootRect.top - elRect.top;
    var overBottom = elRect.bottom - rootRect.bottom;

    var dx = 0;
    var dy = 0;
    if (overLeft > 0) dx += overLeft;
    if (overRight > 0) dx -= overRight;
    if (overTop > 0) dy += overTop;
    if (overBottom > 0) dy -= overBottom;

    if (dx !== 0 || dy !== 0) {
      draggable.x += dx;
      draggable.y += dy;
      draggable.update(true);
    }
  }

  var instances = Draggable.create(photos, {
    type: "x,y",
    // Hard clamp: entire photo box must stay inside the container
    bounds: root,
    edgeResistance: 1,
    zIndexBoost: true,
    cursor: "none",
    activeCursor: "none",
    onPress: function () {
      this.target.classList.add("is-dragging");
    },
    onDrag: function () {
      clampPhoto(this);
      var e = this.pointerEvent;
      if (e && typeof window.__setCursorPos === "function") {
        window.__setCursorPos(e.clientX, e.clientY);
      }
    },
    onThrowUpdate: function () {
      clampPhoto(this);
    },
    onRelease: function () {
      clampPhoto(this);
      this.target.classList.remove("is-dragging");
    },
  });

  instances.forEach(clampPhoto);
})();
