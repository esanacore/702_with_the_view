/**
 * 702 with the View — page behavior.
 *
 * Progressive enhancements only; the page reads fine with JS disabled.
 *
 *  1. Theme toggle: follows the operating system until the reader chooses,
 *     then remembers the choice (localStorage). Same behavior as
 *     gentletable.com's toggle. The pre-paint half lives inline in
 *     index.html's <head> so the page never flashes the wrong mode.
 *  2. Photo auto-loader: drop assets/photos/<slot>.jpg and it appears —
 *     no HTML edits (see site/assets/photos/README.md).
 *  3. Scroll-reveal: elements with .reveal fade in as they enter the viewport.
 *  4. Scrollspy: the nav link for the section in view gets .is-active.
 *  5. Lightbox: click a gallery photo to view it full-screen; arrow keys
 *     navigate, Escape closes, focus returns to the clicked photo.
 *     (The video plays on click via native controls — no scroll-linking.)
 */
(function () {
  "use strict";

  // ---- 1. Theme toggle ----------------------------------------------------
  var THEME_KEY = "702-theme";
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");
  var toggleLabel = document.getElementById("themeToggleLabel");
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try {
      var v = localStorage.getItem(THEME_KEY);
      return v === "dark" || v === "light" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function currentTheme() {
    return root.dataset.theme || (media.matches ? "dark" : "light");
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) { /* private mode — the toggle still works for this visit */ }
    }
    if (toggle && toggleLabel) {
      // The label names the mode the button switches TO.
      var next = theme === "dark" ? "Light mode" : "Dark mode";
      toggleLabel.textContent = next;
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      toggle.setAttribute("aria-label", "Switch to " + next.toLowerCase());
    }
  }

  if (toggle) {
    applyTheme(currentTheme(), false);
    toggle.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });

    // Follow the system while the reader hasn't expressed a preference, so
    // switching the OS to night mode changes the page without a reload.
    media.addEventListener("change", function () {
      if (!storedTheme()) {
        applyTheme(media.matches ? "dark" : "light", false);
      }
    });
  }

  // ---- 2. Photo auto-loader ----------------------------------------------
  // Zero-edit photo workflow: each gallery figure names its slot via
  // data-slot. If assets/photos/<slot>.jpg exists, it replaces the
  // placeholder frame; if not, the placeholder stays. Adding or upgrading
  // a photo is therefore just dropping a file with the right name and
  // pushing — no HTML changes. Alt text comes from data-alt (falling back
  // to the caption).
  document.querySelectorAll(".ph[data-slot]").forEach(function (fig) {
    var frame = fig.querySelector(".ph__frame");
    if (!frame) return;
    var slot = fig.getAttribute("data-slot");
    var caption = fig.querySelector("figcaption");
    var img = new Image();
    // No loading="lazy" here: a lazy image that is not in the DOM never
    // fetches, so the probe would silently find nothing.
    img.alt = fig.getAttribute("data-alt") ||
      (caption ? caption.textContent : "Apartment photo");
    img.onload = function () {
      frame.replaceWith(img);
    };
    // A missing photo 404s quietly and the placeholder stays put.
    img.src = "assets/photos/" + slot + ".jpg";
  });

  // ---- 3. Scroll-reveal ---------------------------------------------------
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  var revealables = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealables.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ---- 4. Scrollspy -------------------------------------------------------
  var navLinks = document.querySelectorAll(".nav__links a[href^='#']");
  var sectionsById = {};

  navLinks.forEach(function (link) {
    var section = document.querySelector(link.getAttribute("href"));
    if (section) {
      sectionsById[section.id] = link;
    }
  });

  if ("IntersectionObserver" in window) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = sectionsById[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("is-active");
            });
            link.classList.add("is-active");
          }
        });
      },
      // A narrow horizontal band across the middle of the viewport, so only
      // the section actually being read counts as "in view".
      { rootMargin: "-40% 0px -55% 0px" }
    );
    Object.keys(sectionsById).forEach(function (id) {
      spyObserver.observe(document.getElementById(id));
    });
  }

  // ---- 5. Lightbox --------------------------------------------------------
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");

  if (lightbox && lightboxImg) {
    var current = -1;
    var lastTrigger = null;

    // The photo list is computed at open time, because the auto-loader
    // fills figures asynchronously as slot files are discovered.
    function loadedPhotos() {
      // Lightbox's own <figure> is .lightbox__body, not .ph, so this can
      // never capture the lightbox image itself.
      return Array.prototype.slice.call(document.querySelectorAll(".ph img"));
    }

    function show(index) {
      var photos = loadedPhotos();
      if (!photos.length) return;
      current = (index + photos.length) % photos.length;
      var img = photos[current];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      var cap = img.closest(".ph").querySelector("figcaption");
      lightboxCaption.textContent = cap ? cap.textContent : "";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      document.getElementById("lightboxClose").focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      if (lastTrigger) lastTrigger.focus();
    }

    document.addEventListener("click", function (e) {
      var img = e.target.closest ? e.target.closest(".ph img") : null;
      if (img) {
        lastTrigger = img;
        show(loadedPhotos().indexOf(img));
        return;
      }
      if (!lightbox.hidden && e.target === lightbox) close();
    });

    document.getElementById("lightboxClose").addEventListener("click", close);
    document.getElementById("lightboxPrev").addEventListener("click", function () {
      show(current - 1);
    });
    document.getElementById("lightboxNext").addEventListener("click", function () {
      show(current + 1);
    });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
    });

    // Gallery photos are interactive now; make each one keyboard-reachable
    // as the auto-loader inserts it.
    var galleryKeyboard = new MutationObserver(function () {
      loadedPhotos().forEach(function (img) {
        if (!img.hasAttribute("tabindex")) {
          img.setAttribute("tabindex", "0");
          img.setAttribute("role", "button");
          img.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              img.click();
            }
          });
        }
      });
    });
    galleryKeyboard.observe(document.body, { childList: true, subtree: true });
  }
})();
