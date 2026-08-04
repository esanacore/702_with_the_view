/**
 * 702 with the View — page behavior.
 *
 * Three small enhancements, all progressive: the page is fully readable with
 * JavaScript disabled.
 *
 *  1. Scroll-reveal: elements with .reveal fade in as they enter the viewport.
 *  2. Scrollspy: the nav link for the section in view gets .is-active.
 *  3. Sky toggle: the hero switches between day and dusk gradients.
 */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ---- 1. Scroll-reveal ---------------------------------------------------
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

  // ---- 2. Scrollspy -------------------------------------------------------
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

  // ---- 3. Day / dusk sky toggle ------------------------------------------
  var hero = document.getElementById("hero");
  var toggle = document.getElementById("skyToggle");

  if (hero && toggle) {
    var icon = toggle.querySelector(".hero__toggle-icon");
    var label = toggle.querySelector(".hero__toggle-label");

    toggle.addEventListener("click", function () {
      var dusk = hero.getAttribute("data-sky") === "day";
      hero.setAttribute("data-sky", dusk ? "dusk" : "day");
      icon.textContent = dusk ? "🌤️" : "🌇";
      label.textContent = dusk ? "Back to daylight" : "See it at dusk";
    });
  }
})();
