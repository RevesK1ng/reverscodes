// === ACTIVE CODES ===
const activeCodes = [
  'VERYHIGHLIKEB',
  'ONEEIGHTYFIVELIKES',
  'FORTYFIVELIKES',
  'somanylikes',
  'AFIRSTTIME3001',
  'FREENIMBUSMOUNT'
];

// === Render active code list ===
function renderCodes(targetId, codeArray) {
  const container = document.getElementById(targetId);
  if (!container) return;

  codeArray.forEach(code => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.className = 'code';
    span.textContent = code;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(code)
        .then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy', 1500);
        })
        .catch(() => alert('Failed to copy code.'));
    });

    li.appendChild(span);
    li.appendChild(btn);
    container.appendChild(li);
  });
}

// === Fade-in animation on scroll ===
function setupFadeIn() {
  const faders = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  faders.forEach(el => observer.observe(el));
}

// === Last updated date ===
function setLastUpdated() {
  const updatedSpan = document.getElementById('lastUpdated');
  if (updatedSpan) {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    updatedSpan.textContent = formatted;
  }
}

// === Initialize everything ===
document.addEventListener('DOMContentLoaded', () => {
  renderCodes('activeCodesList', activeCodes);
  setupFadeIn();
  setLastUpdated();
});
