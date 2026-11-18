/* MUSTAPHA EZZARGHANI — site behaviour (no dependencies) */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    window.matchMedia("(min-width: 1025px)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- Masonry gallery ----------
     Places each photo in the currently shortest column, in source order —
     the same algorithm Elementor's gallery widget uses. */
  var grid = document.querySelector(".gallery__grid");
  var items = grid ? Array.prototype.slice.call(grid.querySelectorAll(".gallery__item")) : [];

  function columnCount() {
    if (window.matchMedia("(max-width: 767px)").matches) return 1;
    if (window.matchMedia("(max-width: 1024px)").matches) return 2;
    return 4;
  }

  var currentCols = 0;
  function layoutMasonry() {
    var cols = columnCount();
    if (!grid || cols === currentCols) return;
    currentCols = cols;

    var columns = [], heights = [];
    for (var c = 0; c < cols; c++) {
      var col = document.createElement("div");
      col.className = "gallery__col";
      columns.push(col);
      heights.push(0);
    }
    items.forEach(function (item) {
      var img = item.querySelector("img");
      var ratio = (+img.getAttribute("height") || 1) / (+img.getAttribute("width") || 1);
      var target = heights.indexOf(Math.min.apply(null, heights));
      columns[target].appendChild(item);
      heights[target] += ratio;
    });
    grid.innerHTML = "";
    columns.forEach(function (col) { grid.appendChild(col); });
    grid.classList.add("is-masonry");
  }

  if (grid) {
    layoutMasonry();
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layoutMasonry, 120);
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  if (lb && items.length) {
    var lbImg = lb.querySelector(".lightbox__img");
    var lbCounter = lb.querySelector(".lightbox__counter");
    var index = 0, lastFocus = null, touchX = null;

    var show = function (i) {
      index = (i + items.length) % items.length;
      var a = items[index];
      lbImg.src = a.getAttribute("href");
      lbImg.alt = a.querySelector("img").alt;
      lbCounter.textContent = (index + 1) + " / " + items.length;
      // preload neighbours
      [index + 1, index - 1].forEach(function (n) {
        var pre = new Image();
        pre.src = items[(n + items.length) % items.length].getAttribute("href");
      });
    };
    var open = function (i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lb.querySelector(".lightbox__close").focus();
    };
    var close = function () {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    items.forEach(function (a, i) {
      a.addEventListener("click", function (e) { e.preventDefault(); open(i); });
    });
    lb.querySelector(".lightbox__close").addEventListener("click", close);
    lb.querySelector(".lightbox__prev").addEventListener("click", function () { show(index - 1); });
    lb.querySelector(".lightbox__next").addEventListener("click", function () { show(index + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lightbox__figure")) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "Tab") {
        // keep focus inside the dialog
        var f = lb.querySelectorAll("button");
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ---------- Contact form ----------
     If the <form> has a data-endpoint (e.g. a Formspree URL), the message is
     POSTed there. Otherwise it falls back to opening the visitor's mail app. */
  var form = document.getElementById("contact-form");
  if (form) {
    var loadedAt = Date.now();
    var status = form.querySelector(".form-status");
    var button = form.querySelector(".btn-submit");

    var setStatus = function (msg, type) {
      status.textContent = msg;
      status.className = "form-status" + (type ? " is-" + type : "");
    };
    var fieldError = function (input, msg) {
      var group = input.closest(".form-group");
      group.classList.add("has-error");
      var err = group.querySelector(".form-error");
      if (!err) {
        err = document.createElement("span");
        err.className = "form-error";
        err.id = input.id + "-error";
        group.appendChild(err);
        input.setAttribute("aria-describedby", err.id);
      }
      err.textContent = msg;
      input.setAttribute("aria-invalid", "true");
    };
    var clearErrors = function () {
      form.querySelectorAll(".has-error").forEach(function (g) { g.classList.remove("has-error"); });
      form.querySelectorAll(".form-error").forEach(function (e) { e.textContent = ""; });
      form.querySelectorAll("[aria-invalid]").forEach(function (i) { i.removeAttribute("aria-invalid"); });
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();
      setStatus("");

      if (form.querySelector(".hp-field input").value) return; // bot

      var email = form.elements.email, message = form.elements.message, ok = true;
      if (!email.value.trim()) { fieldError(email, "This field is required"); ok = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { fieldError(email, "This field must contain a valid email"); ok = false; }
      if (!message.value.trim()) { fieldError(message, "This field is required"); ok = false; }
      if (!ok) { form.querySelector("[aria-invalid]").focus(); return; }

      var first = form.elements.first_name.value.trim();
      var last = form.elements.last_name.value.trim();
      var subject = form.elements.subject.value.trim() || "Message from ezzarghani.org";
      var endpoint = form.getAttribute("data-endpoint");

      if (!endpoint) {
        var body = message.value.trim() + "\n\n— " + [first, last].filter(Boolean).join(" ") + " <" + email.value.trim() + ">";
        window.location.href = "mailto:" + form.getAttribute("data-mailto") +
          "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        setStatus("Your email app should open with the message ready to send.", "success");
        return;
      }

      var payload = {
        first_name: first,
        last_name: last,
        email: email.value.trim(),
        subject: form.elements.subject.value.trim(),
        message: message.value.trim(),
        _gotcha: form.querySelector(".hp-field input").value,
        _t: loadedAt
      };

      button.disabled = true;
      button.textContent = "Sending…";
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (res.ok && data.ok) {
              form.reset();
              loadedAt = Date.now();
              setStatus("Thank you for your message. We will get in touch with you shortly.", "success");
              return;
            }
            if (data.errors) {
              Object.keys(data.errors).forEach(function (field) {
                if (form.elements[field]) fieldError(form.elements[field], data.errors[field]);
              });
              var bad = form.querySelector("[aria-invalid]");
              if (bad) bad.focus();
              return;
            }
            throw new Error(data.error || res.status);
          });
        })
        .catch(function () {
          setStatus("Sorry, something went wrong. Please email contact@ezzarghani.org directly.", "error");
        })
        .then(function () {
          button.disabled = false;
          button.textContent = "Submit";
        });
    });
  }
})();
