/* ReversCodes – Shared Ad Blocker Detection (weekly deferrals)
   - Detects common/advanced blockers (uBO, Brave, Malwarebytes)
   - Shows a modal only if a blocker is active
   - "Maybe Later" allowed up to 3 times per 7-day window (localStorage)
*/

(function rcAdblockCheck() {
  const MAX_DEFERRALS = 3;
  const DEFERRAL_KEY = 'adBlockDeferrals';
  const RESET_KEY = 'adBlockResetDate';
  const DEFER_UNTIL_KEY = 'adBlockDeferUntil';
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const TEN_MIN_MS = 10 * 60 * 1000;

  let detected = false;
  let adScriptBlocked = false;
  let evaluated = false;

  function getInt(key, fallback) {
    const raw = localStorage.getItem(key);
    const n = parseInt(raw || '', 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function initializeDeferralWindow() {
    const now = Date.now();
    const resetAt = Date.parse(localStorage.getItem(RESET_KEY) || '') || 0;
    if (!resetAt || now > resetAt) {
      localStorage.setItem(DEFERRAL_KEY, '0');
      localStorage.setItem(RESET_KEY, new Date(now + ONE_WEEK_MS).toISOString());
    }
  }

  function canDefer() {
    const deferrals = getInt(DEFERRAL_KEY, 0);
    const resetAt = Date.parse(localStorage.getItem(RESET_KEY) || '') || 0;
    const now = Date.now();
    if (!resetAt || now > resetAt) {
      localStorage.setItem(DEFERRAL_KEY, '0');
      localStorage.setItem(RESET_KEY, new Date(now + ONE_WEEK_MS).toISOString());
      return true;
    }
    return deferrals < MAX_DEFERRALS;
  }

  function getRemainingDeferrals() {
    const deferrals = getInt(DEFERRAL_KEY, 0);
    return Math.max(0, MAX_DEFERRALS - deferrals);
  }

  function recordDeferral() {
    const deferrals = getInt(DEFERRAL_KEY, 0) + 1;
    localStorage.setItem(DEFERRAL_KEY, String(deferrals));
    const deferUntilTs = Date.now() + TEN_MIN_MS;
    localStorage.setItem(DEFER_UNTIL_KEY, String(deferUntilTs));
    scheduleResume(deferUntilTs);
  }

  function isInDeferWindow() {
    const until = parseInt(localStorage.getItem(DEFER_UNTIL_KEY) || '0', 10) || 0;
    return Date.now() < until;
  }

  function scheduleResume(targetTs) {
    const now = Date.now();
    const ms = Math.max(0, targetTs - now);
    if (ms > 0 && ms < TEN_MIN_MS + 2000) {
      setTimeout(() => {
        evaluated = false; // allow re-evaluation
        runDetection();
      }, ms + 50);
    }
  }

  function buildModal() {
    if (document.getElementById('rc-adblock-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'rc-adblock-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.cssText = [
      'position:fixed','inset:0','z-index:10000','display:none','align-items:center','justify-content:center',
      'background:radial-gradient(1200px 600px at 50% -10%, rgba(99,102,241,0.25), transparent), rgba(0,0,0,0.65)',
      'backdrop-filter:blur(6px)'
    ].join(';');

    const box = document.createElement('div');
    box.style.cssText = [
      'max-width:540px','width:92%','background:linear-gradient(180deg,#0b1020,#0f172a)','color:#fff','border-radius:16px',
      'box-shadow:0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.25)','overflow:hidden','font-family:Inter,system-ui,Arial,sans-serif',
      'transform:scale(0.96)','opacity:0','transition:transform .18s ease, opacity .18s ease'
    ].join(';');

    const header = document.createElement('div');
    header.style.cssText = 'padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.08);background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.25))';
    header.innerHTML = '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:18px">🛡️</span><strong style="font-size:16px;letter-spacing:.2px">Ad blocker detected</strong></div>';

    const body = document.createElement('div');
    body.style.cssText = 'padding:18px 20px;line-height:1.7;font-size:14px';
    body.innerHTML = [
      '<p style="margin:0 0 8px 0">Here’s why ads matter:</p>',
      '<ul style="margin:6px 0 10px 20px;color:#e5e7eb;line-height:1.6">',
      '<li>They keep ReversCodes 100% free</li>',
      '<li>They fund daily code updates</li>',
      '<li>They support faster site improvements</li>',
      '</ul>',
      `<div id="rc-adblock-status" style="margin-top:10px;padding:10px 12px;border-radius:10px;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);color:#c7d2fe">You have <strong id="rc-deferrals-left">${getRemainingDeferrals()}</strong> of ${MAX_DEFERRALS} "Maybe Later" uses left this week.</div>`
    ].join('');

    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;padding:16px 20px;border-top:1px solid rgba(255,255,255,0.08)';

    const disableBtn = document.createElement('button');
    disableBtn.type = 'button';
    disableBtn.textContent = 'Disable Ad Blocker';
    disableBtn.style.cssText = 'background:linear-gradient(135deg,#f43f5e,#ef4444);color:#fff;border:none;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(239,68,68,0.35)';
    disableBtn.onclick = () => {
      // Show simple inline help and a refresh button
      body.innerHTML = [
        '<p>Turn off your ad blocker for this site, then click Refresh & Check.</p>',
        '<ul style="margin:8px 0 0 18px;color:#d1d5db">',
        '<li>Find your blocker icon in the browser toolbar</li>',
        '<li>Select “Pause on this site” or “Allow on this site”</li>',
        '<li>Return here and refresh</li>',
        '</ul>'
      ].join('');
      // Replace buttons with Refresh and Maybe Later (if any remaining)
      footer.innerHTML = '';
      const refreshBtn = document.createElement('button');
      refreshBtn.type = 'button';
      refreshBtn.textContent = 'Refresh & Check';
      refreshBtn.style.cssText = 'background:linear-gradient(135deg,#22c55e,#10b981);color:#fff;border:none;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(34,197,94,0.35)';
      refreshBtn.onclick = () => window.location.reload();
      footer.appendChild(refreshBtn);

      if (canDefer()) {
        const maybeBtn2 = document.createElement('button');
        maybeBtn2.type = 'button';
        maybeBtn2.textContent = 'Maybe Later';
        maybeBtn2.style.cssText = 'background:rgba(37,99,235,0.08);color:#93c5fd;border:1px solid #2563eb;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer';
        maybeBtn2.onclick = () => { recordDeferral(); hideModal(); };
        footer.appendChild(maybeBtn2);
      }
    };

    const maybeBtn = document.createElement('button');
    maybeBtn.type = 'button';
    maybeBtn.textContent = 'Maybe Later';
    maybeBtn.style.cssText = 'background:rgba(37,99,235,0.08);color:#93c5fd;border:1px solid #2563eb;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer';
    maybeBtn.onclick = () => { recordDeferral(); hideModal(); };

    footer.appendChild(disableBtn);
    if (canDefer()) footer.appendChild(maybeBtn);

    box.appendChild(header);
    box.appendChild(body);
    box.appendChild(footer);
    modal.appendChild(box);
    document.body.appendChild(modal);
  }

  function showModal() {
    buildModal();
    const el = document.getElementById('rc-adblock-modal');
    if (el) {
      el.style.display = 'flex';
      const card = el.firstElementChild;
      if (card) requestAnimationFrame(() => { card.style.transform = 'scale(1)'; card.style.opacity = '1'; });
      // lock scroll
      const html = document.documentElement;
      const body = document.body;
      html.dataset.prevOverflow = html.style.overflow || '';
      body.dataset.prevOverflow = body.style.overflow || '';
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      // update remaining counter
      const leftEl = document.getElementById('rc-deferrals-left');
      if (leftEl) leftEl.textContent = String(getRemainingDeferrals());
    }
  }

  function hideModal() {
    const el = document.getElementById('rc-adblock-modal');
    if (el) {
      const card = el.firstElementChild;
      if (card) { card.style.transform = 'scale(0.96)'; card.style.opacity = '0'; }
      setTimeout(() => { el.style.display = 'none'; }, 120);
      // restore scroll
      const html = document.documentElement;
      const body = document.body;
      html.style.overflow = html.dataset.prevOverflow || '';
      body.style.overflow = body.dataset.prevOverflow || '';
    }
  }

  function runDetection() {
    if (evaluated) return;
    evaluated = true;

    // If in a 10-minute defer window, skip and schedule resume
    if (isInDeferWindow()) {
      const until = parseInt(localStorage.getItem(DEFER_UNTIL_KEY) || '0', 10) || 0;
      scheduleResume(until);
      return;
    }

    // 1) Create bait element
    const bait = document.createElement('div');
    bait.id = 'ad-test';
    bait.className = 'adsbygoogle';
    bait.style.cssText = 'height:1px;width:1px;position:absolute;left:-9999px;top:-9999px';
    document.body.appendChild(bait);

    // 2) Try loading AdSense script (onerror indicates blocking)
    const adScript = document.createElement('script');
    adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    adScript.async = true;
    adScript.onerror = () => { adScriptBlocked = true; };
    document.head.appendChild(adScript);

    // 3) Evaluate after a brief delay
    setTimeout(() => {
      try {
        const el = document.getElementById('ad-test');
        const hidden = !el || el.offsetHeight === 0 || el.offsetParent === null;
        detected = hidden || adScriptBlocked;
      } catch (_) {
        detected = true;
      }

      // Cleanup
      try { bait.remove(); } catch (_) {}
      try { adScript.remove(); } catch (_) {}

      if (detected) {
        if (canDefer()) {
          showModal();
        } else {
          // Deferrals exhausted: show modal without Maybe Later (handled in buildModal)
          showModal();
        }
      }
    }, 1000);
  }

  function start() {
    if (!('localStorage' in window)) return; // fail-safe
    initializeDeferralWindow();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runDetection);
    } else {
      runDetection();
    }
  }

  start();
})();


