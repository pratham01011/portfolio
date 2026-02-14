// Smooth scrolling for navigation and hero buttons
function setupSmoothScroll() {
  const scrollLinks = document.querySelectorAll('[data-scroll-to], .nav-links a[href^="#"]');

  scrollLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetSelector = link.getAttribute("data-scroll-to") || link.getAttribute("href");
      if (!targetSelector || !targetSelector.startsWith("#")) return;

      const target = document.querySelector(targetSelector);
      if (!target) return;

      e.preventDefault();
      const headerOffset = 72;
      const rect = target.getBoundingClientRect();
      const offsetTop = rect.top + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    });
  });
}

// Mobile nav toggle
function setupNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    navLinks.classList.toggle("open");
  });

  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "a") {
      toggle.classList.remove("active");
      navLinks.classList.remove("open");
    }
  });
}

// Cursor glow interaction
function setupCursorGlow() {
  const glow = document.querySelector(".cursor-glow");
  if (!glow) return;

  let isInside = false;

  function updatePosition(e) {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }

  window.addEventListener("pointermove", (e) => {
    updatePosition(e);
    if (!isInside) {
      isInside = true;
      glow.style.opacity = "1";
    }
  });

  window.addEventListener("pointerleave", () => {
    isInside = false;
    glow.style.opacity = "0";
  });
}

// Scroll reveal animations and skill bars
function setupScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal, .fade-in-up");
  const skillBars = document.querySelectorAll(".skill-bar");
  const filledBars = new WeakSet();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");

            if (entry.target.classList.contains("fade-in-up")) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.18,
      }
    );

    revealEls.forEach((el) => observer.observe(el));

    const skillsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const bar = entry.target;
          if (filledBars.has(bar)) return;

          const fill = bar.querySelector(".skill-bar-fill");
          const value = parseInt(bar.dataset.skill || "0", 10);
          if (!fill || !value) return;

          filledBars.add(bar);
          requestAnimationFrame(() => {
            fill.style.transition = "width 900ms cubic-bezier(0.22, 0.61, 0.36, 1)";
            fill.style.width = `${value}%`;
          });
        });
      },
      {
        threshold: 0.3,
      }
    );

    skillBars.forEach((bar) => skillsObserver.observe(bar));
  } else {
    // Fallback: show everything if IntersectionObserver is unavailable
    revealEls.forEach((el) => el.classList.add("reveal-visible"));
    skillBars.forEach((bar) => {
      const fill = bar.querySelector(".skill-bar-fill");
      const value = parseInt(bar.dataset.skill || "0", 10);
      if (fill && value) {
        fill.style.width = `${value}%`;
      }
    });
  }
}

// Simple parallax on hero visual
function setupParallax() {
  const parallaxEl = document.querySelector(".parallax-wrapper");
  if (!parallaxEl) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    parallaxEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("pointermove", (e) => {
    const rect = parallaxEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / rect.width;
    const deltaY = (e.clientY - centerY) / rect.height;

    const maxShift = 14;
    targetX = -deltaX * maxShift;
    targetY = -deltaY * maxShift;
  });
}

// Project modals
function setupProjectModals() {
  const detailButtons = document.querySelectorAll(".project-details-btn");
  const backdrops = document.querySelectorAll(".modal-backdrop");

  function openModal(projectKey) {
    const modal = document.querySelector(`.modal-backdrop[data-modal="${projectKey}"]`);
    if (!modal) return;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  detailButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const href = btn.getAttribute("href");
      // If it's an external link (not "#" or empty), allow normal navigation
      if (href && href !== "#" && !href.startsWith("#")) {
        return; // Let the browser handle the navigation
      }
      // Otherwise, prevent default and open modal
      e.preventDefault();
      const key = btn.dataset.project;
      if (!key) return;
      openModal(key);
    });
  });

  backdrops.forEach((backdrop) => {
    const closeBtn = backdrop.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => closeModal(backdrop));
    }

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    backdrops.forEach((backdrop) => {
      if (backdrop.classList.contains("active")) {
        closeModal(backdrop);
      }
    });
  });
}

// Contact form validation (frontend only)
function setupContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const nameInput = form.querySelector("#name");
  const emailInput = form.querySelector("#email");
  const messageInput = form.querySelector("#message");
  const statusEl = form.querySelector(".form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  function setError(input, message) {
    const field = input.closest(".form-field");
    if (!field) return;
    const errorEl = field.querySelector(".field-error");
    if (errorEl) errorEl.textContent = message;
    input.classList.add("field-invalid");
  }

  function clearError(input) {
    const field = input.closest(".form-field");
    if (!field) return;
    const errorEl = field.querySelector(".field-error");
    if (errorEl) errorEl.textContent = "";
    input.classList.remove("field-invalid");
  }

  function validateEmail(value) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).toLowerCase());
  }

  function validateForm() {
    let valid = true;

    if (!nameInput.value.trim()) {
      setError(nameInput, "Please enter your name.");
      valid = false;
    } else {
      clearError(nameInput);
    }

    if (!emailInput.value.trim()) {
      setError(emailInput, "Please enter your email.");
      valid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      setError(emailInput, "Please enter a valid email address.");
      valid = false;
    } else {
      clearError(emailInput);
    }

    if (!messageInput.value.trim()) {
      setError(messageInput, "Please share a short message.");
      valid = false;
    } else if (messageInput.value.trim().length < 10) {
      setError(messageInput, "Message should be at least 10 characters long.");
      valid = false;
    } else {
      clearError(messageInput);
    }

    return valid;
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    if (isLoading) {
      submitBtn.classList.add("btn-loading");
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
    }
  }

  [nameInput, emailInput, messageInput].forEach((input) => {
    input.addEventListener("input", () => {
      clearError(input);
      statusEl.textContent = "";
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    statusEl.textContent = "";

    if (!validateForm()) {
      statusEl.textContent = "Please fix the highlighted fields and try again.";
      return;
    }

    // Simulated submission
    setLoading(true);
    statusEl.textContent = "Sending message...";

    setTimeout(() => {
      setLoading(false);
      form.reset();
      statusEl.textContent =
        "Thank you for reaching out. Your message has been noted (frontend-only demo).";
    }, 1100);
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupSmoothScroll();
  setupNavToggle();
  setupCursorGlow();
  setupScrollReveal();
  setupParallax();
  setupProjectModals();
  setupContactForm();

  // Trigger hero fade in quickly
  const heroEls = document.querySelectorAll(".fade-in-up");
  heroEls.forEach((el) => {
    requestAnimationFrame(() => {
      el.classList.add("reveal-visible");
    });
  });
});

