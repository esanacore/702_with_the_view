/**
 * 702 with the View — page behavior.
 *
 * Progressive enhancements only; the page reads fine with JS disabled.
 *
 *  1. Theme toggle: follows the operating system until the reader chooses,
 *     then remembers the choice (localStorage). Same behavior as
 *     gentletable.com's toggle. The pre-paint half lives inline in
 *     index.html's <head> so the page never flashes the wrong mode.
 *  2. Scroll-reveal: elements with .reveal fade in as they enter the viewport.
 *  3. Scrollspy: the nav link for the section in view gets .is-active.
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

  // ---- 2. Scroll-reveal ---------------------------------------------------
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

  // ---- 3. Scrollspy -------------------------------------------------------
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
})();
