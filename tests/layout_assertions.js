// Layout assertions evaluated in the page by tests/test_layout.sh.
// Returns a JSON string; the shell side parses verdicts out of it.
(function () {
  var result = {
    photosChecked: 0,
    overflowingSlots: [],   // photo escapes its figure (the v1.0.0 caption bug)
    clippedCaptions: [],    // a caption covered by any later sibling figure
    pageOverflowX: false,   // horizontal scrollbar = layout burst its container
    textNodesChecked: 0,    // how many text runs the contrast pass measured
    lowContrast: []         // text below its WCAG AA floor (v1.4.0 bug)
  };

  // --- Contrast ---------------------------------------------------------
  // A palette change once left gold links at 2.0:1 on white and a diagram
  // label at 1.04:1 on near-black. Measured here so it cannot recur.
  //
  // This pass deliberately does NOT take a hand-written list of selectors.
  // It used to, and a list only ever covers the elements someone remembered
  // to add: on this page it reached 55 of 123 text-bearing elements, missing
  // every h2/h3, all twelve figcaptions, the dt terms, and every button. The
  // sibling PicklesToys repo shipped a 1.25:1 badge through three releases
  // for exactly that reason. Walking the text nodes has no such blind spot.
  //
  // Chrome reports colours in two unit systems: rgb()/rgba() uses 0-255
  // channels, while color(srgb r g b / a) uses 0-1 floats. Reading srgb
  // floats as 0-255 makes white look black, which reported a passing
  // element as a contrast failure — parse the form, don't assume one.
  function parseColor(str) {
    if (!str || str === "transparent") return null;
    var nums = (str.match(/[\d.]+/g) || []).map(Number);
    if (nums.length < 3) return null;
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

  function ratio(fg, bg) {
    var a = luminance(fg), b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  // The colour actually painted behind an element: walk up collecting layers
  // until an opaque one is found, then composite them back down. Compositing
  // the whole stack matters where a translucent panel sits on a tinted band
  // rather than straight on the page background.
  function effectiveBackground(el) {
    var stack = [];
    for (var node = el; node; node = node.parentElement) {
      var parsed = parseColor(getComputedStyle(node).backgroundColor);
      if (parsed && parsed.a > 0) {
        stack.push(parsed);
        if (parsed.a >= 1) break;
      }
    }
    if (!stack.length) return { r: 255, g: 255, b: 255, a: 1 };
    var base = stack[stack.length - 1];
    for (var i = stack.length - 2; i >= 0; i--) base = over(stack[i], base);
    return base;
  }

  // WCAG 2.1: large text (>=24px, or >=18.66px when bold) needs 3:1; every
  // other run of text needs 4.5:1. The old flat 4.5:1 would have reported
  // display headings as failures once they were covered.
  function floorFor(style) {
    var size = parseFloat(style.fontSize);
    var weight = parseInt(style.fontWeight, 10) || 400;
    return size >= 24 || (size >= 18.66 && weight >= 700) ? 3.0 : 4.5;
  }

  function describe(el) {
    var name = el.tagName.toLowerCase();
    if (el.id) return name + "#" + el.id;
    var cls = (el.getAttribute("class") || "").trim().split(/\s+/)[0];
    return cls ? name + "." + cls : name;
  }

  function hidden(el) {
    var s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") return true;
    // The shell forces .is-visible before measuring, so anything still fully
    // transparent here is genuinely so (the lightbox, for instance).
    if (parseFloat(s.opacity) === 0) return true;
    var r = el.getBoundingClientRect();
    return r.width === 0 || r.height === 0;
  }

  var seen = {};
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      return node.nodeValue.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });

  var node;
  while ((node = walker.nextNode())) {
    var el = node.parentElement;
    if (!el || el.closest("script, style, title")) continue;
    // The lightbox is hidden until a photo is clicked; its caption has no
    // meaningful background to measure while closed.
    if (el.closest("#lightbox[hidden]")) continue;
    if (hidden(el)) continue;

    result.textNodesChecked += 1;

    var style = getComputedStyle(el);
    var fg = parseColor(style.color);
    if (!fg) continue;
    var bg = effectiveBackground(el);
    var r = ratio(over(fg, bg), bg);
    var floor = floorFor(style);

    if (r < floor) {
      var key = describe(el) + "@" + r.toFixed(2);
      if (!seen[key]) {
        seen[key] = true;
        result.lowContrast.push(
          describe(el) + " " + r.toFixed(2) + ":1 (needs " + floor + ")"
        );
      }
    }
  }

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
