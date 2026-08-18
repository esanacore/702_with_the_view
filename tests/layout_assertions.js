// Layout assertions evaluated in the page by tests/test_layout.sh.
// Returns a JSON string; the shell side parses verdicts out of it.
(function () {
  var result = {
    photosChecked: 0,
    overflowingSlots: [],   // photo escapes its figure (the v1.0.0 caption bug)
    clippedCaptions: [],    // a caption covered by any later sibling figure
    pageOverflowX: false,   // horizontal scrollbar = layout burst its container
    lowContrast: []         // text below the WCAG AA 4.5:1 floor (v1.4.0 bug)
  };

  // --- Contrast ---------------------------------------------------------
  // A palette change once left gold links at 2.0:1 on white and a diagram
  // label at 1.04:1 on near-black. Measured here so it cannot recur.
  // Chrome reports colours in two unit systems: rgb()/rgba() uses 0-255
  // channels, while color(srgb r g b / a) uses 0-1 floats. Reading srgb
  // floats as 0-255 makes white look black, which reported a passing
  // element as a contrast failure — parse the form, don't assume one.
  function parseColor(str) {
    var nums = (str.match(/[\d.]+/g) || []).map(Number);
    if (!nums.length) return null;
    var scale = /^color\(/i.test(str) ? 255 : 1;
    return {
      r: nums[0] * scale,
      g: nums[1] * scale,
      b: nums[2] * scale,
      a: nums.length > 3 ? nums[3] : 1
    };
  }

  function luminance(c) {
    var ch = [c.r, c.g, c.b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }

  function over(fg, bg) {
    // Composite a translucent colour onto an opaque one.
    if (fg.a >= 1) return fg;
    return {
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1
    };
  }

  function ratio(fgStr, bgStr) {
    var fg = parseColor(fgStr), bg = parseColor(bgStr);
    if (!fg || !bg) return 21;
    var a = luminance(fg), b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  // The background actually painted behind an element: walk up until a
  // colour with any opacity is found, compositing translucent layers onto
  // the page background.
  function effectiveBackground(el) {
    var pageBg = parseColor(getComputedStyle(document.body).backgroundColor) ||
      { r: 255, g: 255, b: 255, a: 1 };
    for (var node = el; node && node !== document.documentElement; node = node.parentElement) {
      var parsed = parseColor(getComputedStyle(node).backgroundColor);
      if (parsed && parsed.a > 0) {
        var solid = over(parsed, pageBg);
        return "rgb(" + solid.r + "," + solid.g + "," + solid.b + ")";
      }
    }
    return getComputedStyle(document.body).backgroundColor;
  }

  [".footer a", ".section__lede a", ".contact__agent a", ".flow__label",
   ".flow__detail", ".overline", ".hero__overline", ".nav__brand em",
   ".hero__lede", ".card p", ".facts__item dd", ".section__note", ".amenities li"]
    .forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!el.textContent.trim()) return;
        var style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none") return;
        var r = ratio(style.color, effectiveBackground(el));
        if (r < 4.5) {
          result.lowContrast.push(selector + " @" + r.toFixed(2) + ":1");
        }
      });
    });

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
