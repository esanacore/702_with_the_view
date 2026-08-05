// Layout assertions evaluated in the page by tests/test_layout.sh.
// Returns a JSON string; the shell side parses verdicts out of it.
(function () {
  var result = {
    photosChecked: 0,
    overflowingSlots: [],   // photo escapes its figure (the v1.0.0 caption bug)
    clippedCaptions: [],    // a caption covered by any later sibling figure
    pageOverflowX: false    // horizontal scrollbar = layout burst its container
  };

  document.querySelectorAll(".ph").forEach(function (fig) {
    var img = fig.querySelector("img");
    if (!img) return;
    result.photosChecked += 1;
    var f = fig.getBoundingClientRect();
    var i = img.getBoundingClientRect();
    if (i.bottom > f.bottom + 1 || i.right > f.right + 1) {
      result.overflowingSlots.push(fig.getAttribute("data-slot"));
    }
    var cap = fig.querySelector("figcaption");
    if (cap) {
      var c = cap.getBoundingClientRect();
      var mid = document.elementFromPoint(
        Math.min(c.left + 10, window.innerWidth - 1),
        Math.min(c.top + c.height / 2, window.innerHeight - 1)
      );
      // The point probe only proves clipping when the covering element is a
      // DIFFERENT figure's image; skip when the caption is off-viewport.
      if (
        mid &&
        mid.tagName === "IMG" &&
        !fig.contains(mid) &&
        c.top >= 0 &&
        c.bottom <= window.innerHeight
      ) {
        result.clippedCaptions.push(fig.getAttribute("data-slot"));
      }
    }
  });

  result.pageOverflowX =
    document.documentElement.scrollWidth > window.innerWidth + 1;

  return JSON.stringify(result);
})();
