/**
 * AIRVA+ — app.js
 * Frontend interactions + simulated backend API layer
 */

'use strict';

/* ════════════════════════════════════════════════
   1. SCROLL — Navbar transparency + active states
════════════════════════════════════════════════ */
const navbar      = document.getElementById('navbar');
const backToTop   = document.getElementById('backToTop');
const sections    = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

let lastScrollY = 0;
let ticking     = false;

function onScroll() {
  const scrollY = window.scrollY;

  // Navbar style
  if (scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back-to-top visibility
  if (scrollY > 500) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }

  // Active nav link highlighting
  let currentSection = '';
  sections.forEach(section => {
    const sectionTop    = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
    }
  });
  navLinksAll.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });

  lastScrollY = scrollY;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });


/* ════════════════════════════════════════════════
   2. INTERSECTION OBSERVER — Reveal animations
════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ════════════════════════════════════════════════
   3. MOBILE NAV — Toggle
════════════════════════════════════════════════ */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (
    navLinks.classList.contains('open') &&
    !navLinks.contains(e.target) &&
    !navToggle.contains(e.target)
  ) {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});


/* ════════════════════════════════════════════════
   4. BACK TO TOP
════════════════════════════════════════════════ */
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ════════════════════════════════════════════════
   5. SMOOTH ANCHOR SCROLL (with offset for navbar)
════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ════════════════════════════════════════════════
   6. FORM — Validation + Submission (Backend layer)
════════════════════════════════════════════════ */

/**
 * Backend API simulation layer.
 * In production, replace simulateBackendPost with a real fetch call
 * to your server endpoint (e.g. POST /api/enquiries).
 *
 * Example real implementation:
 *   async function submitToBackend(payload) {
 *     const res = await fetch('/api/enquiries', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(payload)
 *     });
 *     if (!res.ok) throw new Error(await res.text());
 *     return res.json();
 *   }
 */
function simulateBackendPost(payload) {
  return new Promise((resolve, reject) => {
    console.log('[AIRVA+ Backend] Received enquiry payload:', payload);

    // Simulate network latency (1.2–2s)
    const delay = 1200 + Math.random() * 800;

    setTimeout(() => {
      // Simulate 95% success rate; force success in demo
      const success = true;
      if (success) {
        resolve({
          id: `ENQ-${Date.now()}`,
          status: 'received',
          message: 'Enquiry submitted successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        reject(new Error('Server error. Please try again.'));
      }
    }, delay);
  });
}

// ── Validators ──
const validators = {
  firstName:    v => v.trim().length >= 2  ? '' : 'Please enter your first name.',
  lastName:     v => v.trim().length >= 2  ? '' : 'Please enter your last name.',
  email:        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
  facilityType: v => v !== ''              ? '' : 'Please select your facility type.',
};

function validateField(name, value) {
  return validators[name] ? validators[name](value) : '';
}

function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (!field || !error) return;
  if (message) {
    field.classList.add('error');
    error.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
  } else {
    field.classList.remove('error');
    error.textContent = '';
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }
}

function clearFieldError(fieldId, errorId) {
  setFieldError(fieldId, errorId, '');
}

// Inline validation on blur
const inlineFields = [
  { field: 'firstName',    error: 'firstNameError'    },
  { field: 'lastName',     error: 'lastNameError'     },
  { field: 'email',        error: 'emailError'        },
  { field: 'facilityType', error: 'facilityTypeError' },
];

inlineFields.forEach(({ field, error }) => {
  const el = document.getElementById(field);
  if (!el) return;
  el.addEventListener('blur', () => {
    const msg = validateField(field, el.value);
    setFieldError(field, error, msg);
  });
  el.addEventListener('input', () => {
    if (el.classList.contains('error')) {
      const msg = validateField(field, el.value);
      setFieldError(field, error, msg);
    }
  });
});

// Form submit
const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Run all validations
  let hasErrors = false;
  inlineFields.forEach(({ field, error }) => {
    const el  = document.getElementById(field);
    const msg = validateField(field, el ? el.value : '');
    setFieldError(field, error, msg);
    if (msg) hasErrors = true;
  });

  if (hasErrors) {
    // Focus first error field
    const firstError = contactForm.querySelector('.error');
    if (firstError) firstError.focus();
    return;
  }

  // Build payload
  const formData = new FormData(contactForm);
  const payload  = {
    firstName:    formData.get('firstName')?.trim(),
    lastName:     formData.get('lastName')?.trim(),
    email:        formData.get('email')?.trim().toLowerCase(),
    facilityType: formData.get('facilityType'),
    interest:     formData.get('interest'),
    message:      formData.get('message')?.trim(),
    source:       'airvaplus.com.au/contact',
    timestamp:    new Date().toISOString(),
    userAgent:    navigator.userAgent,
  };

  // Loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  formSuccess.classList.remove('visible');

  try {
    const result = await simulateBackendPost(payload);
    console.log('[AIRVA+ Backend] Success:', result);

    // Success UI
    submitBtn.classList.remove('loading');
    contactForm.reset();
    formSuccess.classList.add('visible');

    // Scroll success into view
    setTimeout(() => {
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    // Re-enable after a delay
    setTimeout(() => {
      submitBtn.disabled = false;
    }, 5000);

  } catch (err) {
    console.error('[AIRVA+ Backend] Error:', err);
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;

    // Show error in a toast
    showToast('Something went wrong. Please try again or email us directly.');
  }
});


/* ════════════════════════════════════════════════
   7. TOAST NOTIFICATION
════════════════════════════════════════════════ */
function showToast(message, duration = 4000) {
  const existing = document.querySelector('.airva-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'airva-toast';
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');

  // Inline styles so no CSS dependency issues
  Object.assign(toast.style, {
    position:        'fixed',
    bottom:          '32px',
    left:            '50%',
    transform:       'translateX(-50%) translateY(20px)',
    background:      '#1A1A1A',
    color:           '#FFFFFF',
    border:          '1px solid rgba(255,255,255,0.12)',
    borderRadius:    '8px',
    padding:         '14px 24px',
    fontSize:        '14px',
    lineHeight:      '1.5',
    zIndex:          '9999',
    backdropFilter:  'blur(12px)',
    maxWidth:        '400px',
    textAlign:       'center',
    transition:      'opacity 0.3s, transform 0.3s',
    opacity:         '0',
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}


/* ════════════════════════════════════════════════
   8. HERO — Parallax effect (subtle)
════════════════════════════════════════════════ */
const heroOrb1 = document.querySelector('.hero-bg-orb:first-child');
const heroOrb2 = document.querySelector('.orb-2');

if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    if (heroOrb1) {
      heroOrb1.style.transform = `translate(${dx * 20}px, ${dy * 20}px)`;
    }
    if (heroOrb2) {
      heroOrb2.style.transform = `translate(${dx * -12}px, ${dy * -12}px)`;
    }
  }, { passive: true });
}


/* ════════════════════════════════════════════════
   9. PRODUCT CARDS — Hover tilt
════════════════════════════════════════════════ */
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.zIndex = '2';
  });
  card.addEventListener('mouseleave', () => {
    card.style.zIndex = '';
  });
});


/* ════════════════════════════════════════════════
   10. INIT
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Trigger initial scroll check
  onScroll();

  // Log init
  console.log('%cAIRVA+ %c— Premium Environment Optimisation', 
    'color:#0F8F5B; font-size:16px; font-weight:bold;',
    'color:#888; font-size:14px;'
  );
  console.log('%cBuilt with precision. Designed for performance.', 
    'color:#555; font-size:12px; font-style:italic;'
  );
});
