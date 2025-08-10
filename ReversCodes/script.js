// ReversCodes Hub - Main JavaScript File

// Performance optimizations
const requestIdleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
const cancelIdleCallback = window.cancelIdleCallback || ((id) => clearTimeout(id));

// Intersection Observer for lazy loading
const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                lazyLoadObserver.unobserve(img);
            }
        }
    });
}, {
    rootMargin: '50px 0px',
    threshold: 0.1
});

// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
            console.log('FID:', entry.processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift') {
            console.log('CLS:', entry.value);
        }
    }
});

performanceObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

// Resource hints for better performance
const preloadCriticalResources = () => {
    const criticalImages = [
        'images/RCNEWLOLGO.png',
        'images/favicon.png',
        'images/astdxlogo.png',
        'images/bloxfruits.png'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
};

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Global variables
let currentTheme = localStorage.getItem('theme') || 'light';
let comments = JSON.parse(localStorage.getItem('comments')) || [];
let submissions = JSON.parse(localStorage.getItem('submissions')) || [];
let adminAccessAttempts = 0;
let adminPassword = '';
let adminNumber = '';

// Load the shared adblock checker on every page (handles weekly 3-deferral modal)
(function loadSharedAdblockChecker() {
    try {
        const isGameCodePage = /\/roblox-codes\//.test(window.location.pathname);
        const src = isGameCodePage ? '../adblock-check.js' : 'adblock-check.js';
        if (!document.querySelector(`script[src$="adblock-check.js"]`)) {
            const s = document.createElement('script');
            s.src = src;
            s.defer = true;
            document.head.appendChild(s);
        }
    } catch (_) {
        // no-op
    }
})();

// AdBlocker Detection Variables
let adBlockerStrikes = parseInt(localStorage.getItem('adBlockerStrikes')) || 3;
let adBlockerDetected = false;
let adBlockerModalShown = false;

// New variables for 3 free entries feature
let freeEntriesUsed = parseInt(localStorage.getItem('freeEntriesUsed')) || 0;
let lastModalShownTime = parseInt(localStorage.getItem('lastModalShownTime')) || 0;
let entriesResetDate = parseInt(localStorage.getItem('entriesResetDate')) || 0;

// Check if we need to reset entries (every 2 days)
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
const TEN_MINUTES_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

// Reset entries if 2 days have passed
if (Date.now() - entriesResetDate > TWO_DAYS_MS) {
    freeEntriesUsed = 0;
    lastModalShownTime = 0;
    entriesResetDate = Date.now();
    localStorage.setItem('freeEntriesUsed', '0');
    localStorage.setItem('lastModalShownTime', '0');
    localStorage.setItem('entriesResetDate', entriesResetDate.toString());
}

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const nav = document.querySelector('.nav');
const backToTop = document.getElementById('backToTop');
const notification = document.getElementById('notification');
const notificationText = notification ? notification.querySelector('.notification-text') : null;
const notificationClose = notification ? notification.querySelector('.notification-close') : null;
const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');
// submissionsList is only used in admin modal, so we'll get it when needed

// === ROBUST ADBLOCKER DETECTION ===

// Multiple detection methods for maximum coverage
let adBlockerDetectionAttempts = 0;
const MAX_DETECTION_ATTEMPTS = 3;

// Method 1: DOM-based detection with multiple ad-like elements
function detectAdBlockerDOM() {
    console.log('DOM detection method started');
    const adElements = [
        { className: 'adsbox', content: '&nbsp;' },
        { className: 'adsbygoogle', content: '<ins class="adsbygoogle"></ins>' },
        { className: 'advertisement', content: '<div class="ad-banner">Advertisement</div>' },
        { className: 'google-ad', content: '<div class="google-ad">Google Ad</div>' }
    ];
    
    let blockedCount = 0;
    const totalElements = adElements.length;
    
    adElements.forEach((adConfig, index) => {
        const testAd = document.createElement('div');
        testAd.innerHTML = adConfig.content;
        testAd.className = adConfig.className;
        testAd.style.cssText = `
            position: absolute;
            left: -10000px;
            top: -1000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
            z-index: -9999;
        `;
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            const isBlocked = !testAd.offsetHeight || 
                             testAd.offsetHeight === 0 || 
                             testAd.style.display === 'none' ||
                             testAd.style.visibility === 'hidden' ||
                             testAd.offsetParent === null;
            
            if (isBlocked) blockedCount++;
            
            document.body.removeChild(testAd);
            
            // Check if majority of elements are blocked
            if (index === totalElements - 1 && blockedCount >= Math.ceil(totalElements * 0.7)) {
                console.log('DOM detection: Ad blocker detected!', blockedCount, 'out of', totalElements, 'elements blocked');
                adBlockerDetected = true;
                handleAdBlockerDetected();
            }
        }, 50 * (index + 1));
    });
}

// Method 2: Network failure detection for ad scripts
function detectAdBlockerNetwork() {
    const adScripts = [
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        'https://www.googletagmanager.com/gtag/js',
        'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
    ];
    
    let failedScripts = 0;
    const totalScripts = adScripts.length;
    
    adScripts.forEach((scriptSrc, index) => {
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.onerror = function() {
            failedScripts++;
            if (failedScripts >= Math.ceil(totalScripts * 0.6)) {
                adBlockerDetected = true;
                handleAdBlockerDetected();
            }
        };
        script.onload = function() {
            // Script loaded successfully, not blocked
        };
        document.head.appendChild(script);
        
        // Remove script after detection
        setTimeout(() => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }, 2000);
    });
}

// Method 3: Behavior-based detection with timing analysis
function detectAdBlockerBehavior() {
    // Create a more sophisticated ad-like element
    const sophisticatedAd = document.createElement('div');
    sophisticatedAd.innerHTML = `
        <div class="ad-container" style="width: 728px; height: 90px; background: #f0f0f0; border: 1px solid #ccc;">
            <div class="ad-content" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <span style="color: #666;">Advertisement</span>
            </div>
        </div>
    `;
    sophisticatedAd.className = 'sophisticated-ad-test';
    sophisticatedAd.style.cssText = `
        position: absolute;
        left: -10000px;
        top: -1000px;
        z-index: -9999;
    `;
    document.body.appendChild(sophisticatedAd);
    
    // Check multiple times with different delays
    const checkTimes = [100, 500, 1000, 2000];
    let checksPassed = 0;
    
    checkTimes.forEach((delay, index) => {
        setTimeout(() => {
            const adElement = sophisticatedAd.querySelector('.ad-container');
            const isBlocked = !adElement || 
                             adElement.offsetHeight === 0 || 
                             adElement.style.display === 'none' ||
                             adElement.offsetParent === null ||
                             window.getComputedStyle(adElement).display === 'none';
            
            if (!isBlocked) checksPassed++;
            
            // If most checks fail, likely blocked
            if (index === checkTimes.length - 1 && checksPassed < Math.ceil(checkTimes.length * 0.3)) {
                adBlockerDetected = true;
                handleAdBlockerDetected();
            }
        }, delay);
    });
    
    // Clean up after final check
    setTimeout(() => {
        if (sophisticatedAd.parentNode) {
            sophisticatedAd.parentNode.removeChild(sophisticatedAd);
        }
    }, 3000);
}

// Method 4: CSS-based detection
function detectAdBlockerCSS() {
    // Create a style element with ad-blocker bait
    const style = document.createElement('style');
    style.textContent = `
        .ad-bait { display: block !important; }
        .adsbygoogle { display: block !important; }
        .advertisement { display: block !important; }
    `;
    document.head.appendChild(style);
    
    // Create bait elements
    const baitElements = ['ad-bait', 'adsbygoogle', 'advertisement'];
    let blockedBait = 0;
    
    baitElements.forEach((className, index) => {
        const bait = document.createElement('div');
        bait.className = className;
        bait.style.cssText = `
            position: absolute;
            left: -10000px;
            top: -1000px;
            width: 1px;
            height: 1px;
            z-index: -9999;
        `;
        document.body.appendChild(bait);
        
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(bait);
            const isBlocked = computedStyle.display === 'none' || 
                             computedStyle.visibility === 'hidden' ||
                             bait.offsetHeight === 0;
            
            if (isBlocked) blockedBait++;
            
            document.body.removeChild(bait);
            
            if (index === baitElements.length - 1 && blockedBait >= Math.ceil(baitElements.length * 0.6)) {
                adBlockerDetected = true;
                handleAdBlockerDetected();
            }
        }, 100 * (index + 1));
    });
    
    // Remove style element
    setTimeout(() => {
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 2000);
}

// Method 5: Malwarebytes-specific detection
function detectAdBlockerMalwarebytes() {
    // Malwarebytes often blocks specific patterns and domains
    const malwarebytesBait = [
        { src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', type: 'script' },
        { src: 'https://www.googletagmanager.com/gtag/js?id=UA-123456789-1', type: 'script' },
        { src: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js', type: 'script' },
        { src: 'https://tpc.googlesyndication.com/safeframe/1-0-38/html/container.html', type: 'iframe' }
    ];
    
    let blockedBait = 0;
    const totalBait = malwarebytesBait.length;
    
    malwarebytesBait.forEach((bait, index) => {
        const element = document.createElement(bait.type);
        element.src = bait.src;
        element.style.cssText = `
            position: absolute;
            left: -10000px;
            top: -1000px;
            width: 1px;
            height: 1px;
            z-index: -9999;
        `;
        
        element.onerror = function() {
            blockedBait++;
            if (blockedBait >= Math.ceil(totalBait * 0.5)) {
                adBlockerDetected = true;
                handleAdBlockerDetected();
            }
        };
        
        element.onload = function() {
            // Successfully loaded, not blocked
        };
        
        document.body.appendChild(element);
        
        // Clean up after detection
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 3000);
    });
}

// Method 6: Mutation Observer detection
function detectAdBlockerMutationObserver() {
    // Create ad-like elements and watch for removal
    const adElements = [
        '<div class="adsbygoogle" style="display: block; width: 728px; height: 90px;"></div>',
        '<ins class="adsbygoogle" style="display: block; width: 728px; height: 90px;"></ins>',
        '<div class="advertisement" style="display: block; width: 728px; height: 90px;">Advertisement</div>'
    ];
    
    let removedElements = 0;
    const totalElements = adElements.length;
    
    // Create a container for our test elements
    const testContainer = document.createElement('div');
    testContainer.id = 'ad-blocker-test-container';
    testContainer.style.cssText = `
        position: absolute;
        left: -10000px;
        top: -1000px;
        z-index: -9999;
    `;
    document.body.appendChild(testContainer);
    
    // Add elements to container
    adElements.forEach((html, index) => {
        const element = document.createElement('div');
        element.innerHTML = html;
        element.id = `ad-test-${index}`;
        testContainer.appendChild(element);
    });
    
    // Set up mutation observer to watch for removals
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.removedNodes.forEach((node) => {
                    if (node.id && node.id.startsWith('ad-test-')) {
                        removedElements++;
                        if (removedElements >= Math.ceil(totalElements * 0.6)) {
                            adBlockerDetected = true;
                            handleAdBlockerDetected();
                            observer.disconnect();
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(testContainer, {
        childList: true,
        subtree: true
    });
    
    // Clean up after detection period
    setTimeout(() => {
        observer.disconnect();
        if (testContainer.parentNode) {
            testContainer.parentNode.removeChild(testContainer);
        }
    }, 5000);
}

// Method 7: Network fetch-based detection (covers advanced blockers, incl. Malwarebytes)
function detectAdBlockerFetch() {
    const adEndpoints = [
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
        'https://googleads.g.doubleclick.net/pagead/id',
        'https://static.doubleclick.net/instream/ad_status.js',
        'https://adservice.google.com/adsid/integrator.js?domain=reverscodes.com',
        'https://adservice.google.com/adsid/google/ui' // additional path often blocked
    ];

    let failedCount = 0;
    const total = adEndpoints.length;

    function withTimeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
        ]);
    }

    adEndpoints.forEach((url) => {
        // no-cors so we can detect hard blocking; many blockers cause fetch to reject
        withTimeout(fetch(url, { mode: 'no-cors', cache: 'no-store' }), 3000)
            .then(() => {
                // In no-cors, success does not guarantee visibility, but indicates not hard-blocked
            })
            .catch(() => {
                failedCount++;
                if (failedCount >= Math.ceil(total * 0.6)) {
                    adBlockerDetected = true;
                    handleAdBlockerDetected();
                }
            });
    });
}

// Method 8: Image beacon detection against ad domains (robust across blockers)
function detectAdBlockerImage() {
    const imgUrls = [
        'https://pagead2.googlesyndication.com/pagead/images/transparent.png',
        'https://googleads.g.doubleclick.net/pagead/blank.gif',
        'https://tpc.googlesyndication.com/simgad/12345', // generic simgad path
    ];

    let errorCount = 0;
    const total = imgUrls.length;

    imgUrls.forEach((src) => {
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        img.onload = function() {
            // loaded -> likely not blocked for this endpoint
        };
        img.onerror = function() {
            errorCount++;
            if (errorCount >= Math.ceil(total * 0.6)) {
                adBlockerDetected = true;
                handleAdBlockerDetected();
            }
        };
        img.src = src + (src.includes('?') ? '&' : '?') + 'rc_bait=' + Date.now();
        // Cleanup
        setTimeout(() => { img.onload = img.onerror = null; }, 4000);
    });
}

// Main detection function that combines all methods
function detectAdBlocker() {
    console.log('detectAdBlocker called, attempts:', adBlockerDetectionAttempts);
    if (adBlockerDetectionAttempts >= MAX_DETECTION_ATTEMPTS) {
        console.log('Max detection attempts reached');
        return; // Prevent infinite loops
    }
    
    adBlockerDetectionAttempts++;
    console.log('Starting ad blocker detection methods...');
    
    // Run all detection methods with staggered timing
    setTimeout(() => detectAdBlockerDOM(), 0);
    setTimeout(() => detectAdBlockerNetwork(), 350);
    setTimeout(() => detectAdBlockerFetch(), 700);
    setTimeout(() => detectAdBlockerBehavior(), 1050);
    setTimeout(() => detectAdBlockerCSS(), 1400);
    setTimeout(() => detectAdBlockerImage(), 1750);
    setTimeout(() => detectAdBlockerMalwarebytes(), 2100);
    setTimeout(() => detectAdBlockerMutationObserver(), 2450);
    
    // Fallback detection after all methods complete
    setTimeout(() => {
        console.log('Fallback detection check, adBlockerDetected:', adBlockerDetected);
        if (!adBlockerDetected) {
            // If no detection triggered, try one more time with different timing
            if (adBlockerDetectionAttempts < MAX_DETECTION_ATTEMPTS) {
                console.log('Retrying detection...');
                detectAdBlocker();
            }
        }
    }, 6000);
}

// Function to handle AdBlocker detection
function handleAdBlockerDetected() {
    console.log('Ad blocker detected! Free entries used:', freeEntriesUsed);
    console.log('Modal already shown:', adBlockerModalShown);
    console.log('Time since last shown:', Date.now() - lastModalShownTime);
    
    if (adBlockerModalShown) return;
    
    // Check if we're in a 10-minute cooldown period
    if (lastModalShownTime > 0 && (Date.now() - lastModalShownTime) < TEN_MINUTES_MS) {
        console.log('Still in cooldown period, not showing modal');
        return;
    }
    
    // Check if user has free entries remaining
    if (freeEntriesUsed < 3) {
        console.log('Showing ad blocker modal... Free entries remaining:', 3 - freeEntriesUsed);
        showAdBlockerModal();
    } else {
        // No free entries left, show blocking message
        console.log('No free entries left, showing blocking message...');
        showAdBlockerBlockingMessage();
    }
}

// Function to show AdBlocker modal
function showAdBlockerModal() {
    console.log('Showing ad blocker modal');
    adBlockerModalShown = true;
    lastModalShownTime = Date.now();
    localStorage.setItem('lastModalShownTime', lastModalShownTime.toString());
    
    const modal = document.getElementById('adBlockerModal');
    const strikesCount = document.getElementById('strikesCount');
    
    console.log('Modal element found:', !!modal);
    console.log('Strikes count element found:', !!strikesCount);
    
    if (modal && strikesCount) {
        strikesCount.textContent = 3 - freeEntriesUsed;
        
        // Conditionally show/hide the "Maybe Later" button
        const maybeLaterButton = modal.querySelector('.btn-secondary');
        if (maybeLaterButton) {
            if (freeEntriesUsed >= 3) {
                maybeLaterButton.style.display = 'none';
            } else {
                maybeLaterButton.style.display = 'inline-block';
            }
        }
        
        modal.classList.add('show');
        console.log('Modal show class added');
        
        // Prevent scrolling on body
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal elements not found:', { modal: !!modal, strikesCount: !!strikesCount });
    }
}

// Function to hide AdBlocker modal
function hideAdBlockerModal() {
    const modal = document.getElementById('adBlockerModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Function called when user clicks "Disable Ad Blocker"
function disableAdBlocker() {
    // Keep modal on screen but change content to show refresh button
    const modal = document.getElementById('adBlockerModal');
    const modalBody = modal.querySelector('.modal-body');
    const modalFooter = modal.querySelector('.modal-footer');
    
    // Update modal content to show refresh option
    modalBody.innerHTML = `
        <p>Thank you for supporting ReversCodes Hub! Please disable your ad blocker and then click the refresh button below to check if it was successfully disabled.</p>
        
        <div class="highlight">
            <strong>To disable your ad blocker:</strong><br>
            • Look for the ad blocker icon in your browser toolbar<br>
            • Click on it and select "Disable for this site" or similar option<br>
            • Or add this site to your ad blocker's whitelist
        </div>
        
        <p>Once you've disabled your ad blocker, click the refresh button to verify.</p>
    `;
    
    // Update footer to show refresh button
    modalFooter.innerHTML = `
        <button class="btn btn-primary" onclick="checkAdBlockerStatus()">
            🔄 Refresh & Check
        </button>
        <button class="btn btn-secondary" onclick="continueWithAdBlocker()">
            No Thanks
        </button>
    `;
    
    // Reset free entries when they attempt to disable ad blocker
    freeEntriesUsed = 0;
    lastModalShownTime = 0;
    localStorage.setItem('freeEntriesUsed', '0');
    localStorage.setItem('lastModalShownTime', '0');
}

// Function to check if ad blocker is still active after user attempts to disable it
function checkAdBlockerStatus() {
    // Reset detection state and re-run comprehensive detection
    adBlockerDetected = false;
    adBlockerDetectionAttempts = 0;
    detectAdBlocker();

    // Wait for detection methods (max ~6s); then decide based on flag
    setTimeout(() => {
        if (!adBlockerDetected) {
            hideAdBlockerModal();
            showNotification('Great! Ad blocker has been successfully disabled. Thank you for supporting ReversCodes Hub!', 'success');
            location.reload();
        } else {
            const modal = document.getElementById('adBlockerModal');
            const modalBody = modal.querySelector('.modal-body');
            
            modalBody.innerHTML = `
                <p>We still detect an ad blocker. Please make sure you've completely disabled it and try again.</p>
                
                <div class="highlight">
                    <strong>Common ad blocker locations:</strong><br>
                    • Browser toolbar (look for shield or ad blocker icons)<br>
                    • Browser extensions menu<br>
                    • Browser settings > Privacy & Security<br>
                    • Make sure to refresh the page after disabling
                </div>
                
                <p>If you're still having trouble, you can continue with limited access or contact us for help.</p>
            `;
            
            const modalFooter = modal.querySelector('.modal-footer');
            modalFooter.innerHTML = `
                <button class="btn btn-primary" onclick="checkAdBlockerStatus()">
                    🔄 Try Again
                </button>
                <button class="btn btn-secondary" onclick="continueWithAdBlocker()">
                    Continue with Limited Access
                </button>
            `;
        }
    }, 6500);
}

// Function called when user clicks "Maybe Later"
function continueWithAdBlocker() {
    freeEntriesUsed++;
    localStorage.setItem('freeEntriesUsed', freeEntriesUsed.toString());
    
    hideAdBlockerModal();
    
    if (freeEntriesUsed < 3) {
        const remainingEntries = 3 - freeEntriesUsed;
        showNotification(`You have ${remainingEntries} free entries remaining. The modal will be available again in 10 minutes.`, 'warning');
    } else {
        showAdBlockerBlockingMessage();
    }
}

// Function to show blocking message when no strikes left
function showAdBlockerBlockingMessage() {
    // Create a blocking overlay
    const blockingOverlay = document.createElement('div');
    blockingOverlay.id = 'adBlockerBlockingOverlay';
    blockingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-align: center;
        padding: 2rem;
    `;
    
    blockingOverlay.innerHTML = `
        <div style="max-width: 500px;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🛡️</div>
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">Ad Blocker Required to Disable</h2>
            <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem;">
                To continue using ReversCodes Hub, please disable your ad blocker and refresh the page. 
                Your support through ads helps keep our site free and updated!
            </p>
            <button onclick="location.reload()" style="
                background: #f59e0b;
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 0.5rem;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                Refresh Page
            </button>
        </div>
    `;
    
    document.body.appendChild(blockingOverlay);
}

// === ROBLOX GAME CODES DATA & LOGIC ===

// Game data array
const gamesData = [
  {
    id: 'bloxfruits-page',
    name: 'Blox Fruits',
    img: 'images/bloxfruits.png',
    desc: 'Master the seas with devil fruit powers in this epic adventure game',
  },
  {
    id: 'dresstoimpress-page',
    name: 'Dress to Impress',
    img: 'images/dresstoimpress.png',
    desc: 'Create stunning outfits and participate in fashion competitions',
  },
  {
    id: 'jujutsuinfinite-page',
    name: 'Jujutsu Infinite',
    img: 'images/jujutsuinfinite.png',
    desc: 'Inspired by Jujutsu Kaisen, this RPG offers unique abilities and combat',
  },
  {
    id: 'astdx-page',
    name: 'All Star Tower Defense X',
    img: 'images/astdxlogo.png',
    desc: 'Defend your base with powerful anime characters',
  },
  {
    id: 'goalbound-page',
    name: 'Goalbound',
    img: 'images/goalbound.png',
    desc: 'Soccer-inspired Roblox experience with team building and competitive matches',
  },
  {
    id: 'rivals-page',
    name: 'Rivals',
    img: 'images/rivals.png',
    desc: 'Fast-paced first-person shooter with tactical duels',
  },
  {
    id: 'animeadventures-page',
    name: 'Anime Adventures',
    img: 'images/animeadventures.png',
    desc: 'Summon anime units and defend against waves in this tower-defense RPG',
  },
  {
    id: 'fruitbattlegrounds-page',
    name: 'Fruit Battlegrounds',
    img: 'images/fruitbattlegrounds.png',
    desc: 'Spin for Devil Fruits and battle other players in this PvP brawler',
  },
  {
    id: 'shindolife-page',
    name: 'Shindo Life',
    img: 'images/shindolife.png',
    desc: 'Naruto-inspired ninja RPG with spins, RELL Coins, and bloodline rerolls',
  },
  {
    id: 'projectslayers-page',
    name: 'Project Slayers',
    img: 'images/projectslayers.png',
    desc: 'Demon Slayer-themed RPG focusing on breathing styles and demon hunts',
  },
  {
    id: 'kinglegacy-page',
    name: 'King Legacy',
    img: 'images/kinglegacy.png',
    desc: 'One Piece-themed open-world RPG—complete quests, collect gems, and upgrade',
  },
  {
    id: 'animelaststand-page',
    name: 'Anime Last Stand',
    img: 'images/animelaststand.png',
    desc: 'Deploy anime units to protect against waves in this TD/clicker game',
  },
  {
    id: 'murdermystery2-page',
    name: 'Murder Mystery 2',
    img: 'images/murdermystery2.png',
    desc: 'Classic Roblox social deduction game—trade, collect, and solve mysteries!',
  },
  {
    id: 'bladeball-page',
    name: 'Blade Ball',
    img: 'images/bladeball.png',
    desc: 'PvP arena where players fight with blade combos and spin wheels for skins',
  },
  {
    id: 'animerangersx-page',
    name: 'Anime Rangers X',
    img: 'images/AnimeRangersX.png',
    desc: 'Tower defense game with Bleach units, rerolls, and meta events. TYBW update live!',
  },
  {
    id: 'basketballzero-page',
    name: 'Basketball: Zero',
    img: 'images/basketballzero.png',
    desc: 'Fast-paced anime basketball game with flashy moves and zone mechanics',
  },
  {
    id: 'bluelockrivals-page',
    name: 'Blue Lock Rivals',
    img: 'images/bluelockrivals.png',
    desc: '5v5 soccer inspired by Blue Lock manga/anime, unlock powerful striker abilities',
  },
  {
    id: 'volleyballlegends-page',
    name: 'Volleyball Legends',
    img: 'images/volleyballlegends.png',
    desc: '6v6 anime-style volleyball sim inspired by Haikyuu!! with ability spins',
  },
  {
    id: 'basketballzero-page',
    name: 'Basketball Zero',
    img: 'images/basketballzero.png',
    desc: 'Fast-paced anime basketball game with Zone mechanics and flashy moves',
  },
  {
    id: 'arisecrossover-page',
    name: 'Arise Crossover',
    img: 'images/AriseCrossover.png',
    desc: 'Crossover game featuring characters from various anime and gaming universes',
  },
  {
    id: 'combatwarriors-page',
    name: 'Combat Warriors',
    img: 'images/combatwarriors.png',
    desc: 'PVP brawler with weapons, chaos, and aether rewards.',
  },
  {
    id: 'jujutsushenanigans-page',
    name: 'Jujutsu Shenanigans',
    img: 'images/jujutsushenanigans.png',
    desc: 'Anime brawler/roleplay with cursed techniques and parties.',
  },
  {
    id: 'projectegoist-page',
    name: 'Project Egoist',
    img: 'images/projectegoist.png',
    desc: 'Soccer anime sim—unlock ego skills, compete, and reroll!',
  },
  {
    id: 'spongebobtowerdefense-page',
    name: 'SpongeBob Tower Defense',
    img: 'images/spongebobtowerdefense.png',
    desc: 'TD game in Bikini Bottom—collect units, fight bosses.',
  },
  {
    id: 'towerdefensesimulator-page',
    name: 'Tower Defense Simulator',
    img: 'images/towerdefensesimulator.png',
    desc: 'Classic TD—defend against zombie waves, unlock skins.',
  },
  {
    id: 'animevanguards-page',
    name: 'Anime Vanguards',
    img: 'images/animevanguards.png',
    desc: 'Anime TD with evolving units, traits, and stat chips.',
  },
  {
    id: 'driving-empire-page',
    name: 'Driving Empire',
    img: 'images/drivingempire.png',
    desc: 'An expansive open-world racing game with cars, boats, and helicopters',
  },
  {
    id: 'prospecting-page',
    name: 'Prospecting',
    img: 'images/prospecting.png',
    desc: 'A tranquil treasure-hunting experience where players pan for gems and fossils',
  },
  {
    id: 'type-soul-page',
    name: 'Type Soul',
    img: 'images/typesoul.png',
    desc: 'An action RPG inspired by Bleach with Soul Reaper, Quincy, and Hollow paths',
  },
];

// Bookmarking logic
const BOOKMARK_KEY = 'bookmarkedGames';
function getBookmarkedGames() {
  return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];
}
function setBookmarkedGames(arr) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(arr));
}
function toggleBookmark(gameId) {
  let bookmarks = getBookmarkedGames();
  if (bookmarks.includes(gameId)) {
    bookmarks = bookmarks.filter(id => id !== gameId);
  } else {
    bookmarks.push(gameId);
  }
  setBookmarkedGames(bookmarks);
  renderGameGallery();
}

// Render the Roblox Game Codes
function renderGameGallery() {
  const gallery = document.getElementById('gamesGallery');
  if (!gallery) return;
  const searchVal = (document.getElementById('gameSearch')?.value || '').trim().toLowerCase();
  gallery.innerHTML = '';

  const filtered = gamesData.filter(game =>
    game.name.toLowerCase().includes(searchVal) ||
    (game.desc && game.desc.toLowerCase().includes(searchVal))
  );

  if (filtered.length === 0) {
    const msg = document.createElement('div');
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    msg.style.padding = '1rem';
    msg.style.textAlign = 'center';
    msg.style.color = 'var(--text-secondary)';
    msg.style.background = 'var(--bg-card)';
    msg.style.border = '1px solid var(--border-color)';
    msg.style.borderRadius = '0.5rem';
    msg.style.boxShadow = 'var(--shadow-light)';
    msg.innerHTML = '<strong>No games found for that name.</strong><br/>No games with that name are here. <a href="/ReversCodes/contact.html">Contact us</a> if you want us to add that game here!';
    gallery.appendChild(msg);
    return;
  }

  const bookmarks = getBookmarkedGames();
  filtered.forEach(game => {
      const card = document.createElement('div');
      card.className = 'game-card-gallery';
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${game.name}: ${game.desc}`);
      card.addEventListener('click', () => openGamePage(game.id));
      card.addEventListener('keypress', e => { if (e.key === 'Enter') openGamePage(game.id); });
      // Image
      const img = document.createElement('img');
      img.src = game.img;
      img.alt = `${game.name} logo`;
      img.className = 'game-img';
      img.loading = 'lazy';
      card.appendChild(img);
      // Title
      const title = document.createElement('div');
      title.className = 'game-title';
      title.textContent = game.name;
      card.appendChild(title);
      // Desc
      const desc = document.createElement('div');
      desc.className = 'game-desc';
      desc.textContent = game.desc;
      card.appendChild(desc);
      // Bookmark star
      const star = document.createElement('span');
      star.className = 'bookmark-star' + (bookmarks.includes(game.id) ? ' active' : '');
      star.setAttribute('role', 'button');
      star.setAttribute('tabindex', '0');
      star.setAttribute('aria-label', bookmarks.includes(game.id) ? 'Unbookmark game' : 'Bookmark game');
      star.innerHTML = bookmarks.includes(game.id) ? '★' : '☆';
      star.addEventListener('click', e => { e.stopPropagation(); toggleBookmark(game.id); });
      star.addEventListener('keypress', e => { if (e.key === 'Enter') { e.stopPropagation(); toggleBookmark(game.id); } });
      card.appendChild(star);
      // Highlight if bookmarked
      if (bookmarks.includes(game.id)) card.style.boxShadow = '0 0 0 3px var(--color-star-active, #ffd700)';
      gallery.appendChild(card);
    });
}

// Open game page/section
function openGamePage(pageId) {
  // Map page IDs to their corresponding HTML files
  const pageMappings = {
    'astdx-page': 'roblox-codes/all-star-tower-defense-x.html',
    'bloxfruits-page': 'roblox-codes/blox-fruits.html',
    'goalbound-page': 'roblox-codes/goalbound.html',
    'driving-empire-page': 'roblox-codes/driving-empire.html',
    'prospecting-page': 'roblox-codes/prospecting.html',
    'type-soul-page': 'roblox-codes/type-soul.html'
  };
  
  // All games now use separate HTML pages for consistent navigation
  if (pageMappings[pageId]) {
    window.location.href = pageMappings[pageId];
    return;
  }
  
  // Fallback for any remaining inline pages (if any)
  document.querySelectorAll('.game-page').forEach(page => page.style.display = 'none');
  const page = document.getElementById(pageId);
  if (page) {
    page.style.display = 'block';
    page.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Search bar event
const gameSearch = document.getElementById('gameSearch');
if (gameSearch) {
  gameSearch.addEventListener('input', renderGameGallery);
}

// Support scrollToSection for 'game-gallery'
function scrollToSection(sectionId) {
  if (sectionId === 'game-gallery') {
    const galleryHeader = document.querySelector('.games-gallery, #gamesGallery');
    if (galleryHeader) {
      galleryHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }
  // Fallback to default
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// See More Games button event (if not using scrollToSection inline)
const seeMoreGamesBtn = document.querySelector('.see-more-games-btn');
if (seeMoreGamesBtn) {
  seeMoreGamesBtn.addEventListener('click', () => scrollToSection('game-gallery'));
}

// Initial render
if (document.getElementById('gamesGallery')) {
  renderGameGallery();
}

// --- Main Page Roblox Game Codes Logic ---
const mainGalleryGames = [
  {
    id: 'bloxfruits-page',
    name: 'Blox Fruits',
    img: 'images/bloxfruits.png',
    desc: 'Master the seas with devil fruit powers in this epic adventure game',
  },
  {
    id: 'dresstoimpress-page',
    name: 'Dress to Impress',
    img: 'images/dresstoimpress.png',
    desc: 'Create stunning outfits and participate in fashion competitions',
  },
  {
    id: 'jujutsuinfinite-page',
    name: 'Jujutsu Infinite',
    img: 'images/jujutsuinfinite.png',
    desc: 'Inspired by Jujutsu Kaisen, this RPG offers unique abilities and combat',
  },
  {
    id: 'astdx-page',
    name: 'All Star Tower Defense X',
    img: 'images/astdxlogo.png',
    desc: 'Defend your base with powerful anime characters',
  },
  {
    id: 'goalbound-page',
    name: 'Goalbound',
    img: 'images/goalbound.png',
    desc: 'Soccer-inspired Roblox experience with team building and competitive matches',
  },
  {
    id: 'rivals-page',
    name: 'Rivals',
    img: 'images/rivals.png',
    desc: 'Fast-paced first-person shooter with tactical duels',
  },
  {
    id: 'animeadventures-page',
    name: 'Anime Adventures',
    img: 'images/animeadventures.png',
    desc: 'Summon anime units and defend against waves in this tower-defense RPG',
  },
  {
    id: 'fruitbattlegrounds-page',
    name: 'Fruit Battlegrounds',
    img: 'images/fruitbattlegrounds.png',
    desc: 'Spin for Devil Fruits and battle other players in this PvP brawler',
  },
  {
    id: 'shindolife-page',
    name: 'Shindo Life',
    img: 'images/shindolife.png',
    desc: 'Naruto-inspired ninja RPG with spins, RELL Coins, and bloodline rerolls',
  },
  {
    id: 'projectslayers-page',
    name: 'Project Slayers',
    img: 'images/projectslayers.png',
    desc: 'Demon Slayer-themed RPG focusing on breathing styles and demon hunts',
  },
  {
    id: 'kinglegacy-page',
    name: 'King Legacy',
    img: 'images/kinglegacy.png',
    desc: 'One Piece-themed open-world RPG—complete quests, collect gems, and upgrade',
  },
  {
    id: 'animelaststand-page',
    name: 'Anime Last Stand',
    img: 'images/animelaststand.png',
    desc: 'Deploy anime units to protect against waves in this TD/clicker game',
  },
  {
    id: 'murdermystery2-page',
    name: 'Murder Mystery 2',
    img: 'images/murdermystery2.png',
    desc: 'Classic Roblox social deduction game—trade, collect, and solve mysteries!',
  },
  {
    id: 'bladeball-page',
    name: 'Blade Ball',
    img: 'images/bladeball.png',
    desc: 'PvP arena where players fight with blade combos and spin wheels for skins',
  },
  {
    id: 'animerangersx-page',
    name: 'Anime Rangers X',
    img: 'images/AnimeRangersX.png',
    desc: 'Tower defense game with Bleach units, rerolls, and meta events. TYBW update live!',
  },
  {
    id: 'basketballzero-page',
    name: 'Basketball: Zero',
    img: 'images/basketballzero.png',
    desc: 'Fast-paced anime basketball game with flashy moves and zone mechanics',
  },
  {
    id: 'bluelockrivals-page',
    name: 'Blue Lock Rivals',
    img: 'images/bluelockrivals.png',
    desc: '5v5 soccer inspired by Blue Lock manga/anime, unlock powerful striker abilities',
  },
  {
    id: 'volleyballlegends-page',
    name: 'Volleyball Legends',
    img: 'images/volleyballlegends.png',
    desc: '6v6 anime-style volleyball sim inspired by Haikyuu!! with ability spins',
  },
  {
    id: 'arisecrossover-page',
    name: 'Arise Crossover',
    img: 'images/AriseCrossover.png',
    desc: 'Crossover game featuring characters from various anime and gaming universes',
  },
  {
    id: 'combatwarriors-page',
    name: 'Combat Warriors',
    img: 'images/combatwarriors.png',
    desc: 'PVP brawler with weapons, chaos, and aether rewards.',
  },
  {
    id: 'jujutsushenanigans-page',
    name: 'Jujutsu Shenanigans',
    img: 'images/jujutsushenanigans.png',
    desc: 'Anime brawler/roleplay with cursed techniques and parties.',
  },
  {
    id: 'projectegoist-page',
    name: 'Project Egoist',
    img: 'images/projectegoist.png',
    desc: 'Soccer anime sim—unlock ego skills, compete, and reroll!',
  },
  {
    id: 'spongebobtowerdefense-page',
    name: 'SpongeBob Tower Defense',
    img: 'images/spongebobtowerdefense.png',
    desc: 'TD game in Bikini Bottom—collect units, fight bosses.',
  },
  {
    id: 'towerdefensesimulator-page',
    name: 'Tower Defense Simulator',
    img: 'images/towerdefensesimulator.png',
    desc: 'Classic TD—defend against zombie waves, unlock skins.',
  },
  {
    id: 'animevanguards-page',
    name: 'Anime Vanguards',
    img: 'images/animevanguards.png',
    desc: 'Anime TD with evolving units, traits, and stat chips.',
  },
];
const MAIN_BOOKMARK_KEY = 'mainGalleryFavorites';
function getMainGalleryFavorites() {
  return JSON.parse(localStorage.getItem(MAIN_BOOKMARK_KEY)) || [];
}
function setMainGalleryFavorites(arr) {
  localStorage.setItem(MAIN_BOOKMARK_KEY, JSON.stringify(arr));
}
function toggleMainGalleryFavorite(gameId) {
  let favs = getMainGalleryFavorites();
  if (favs.includes(gameId)) {
    favs = favs.filter(id => id !== gameId);
  } else {
    favs.push(gameId);
  }
  setMainGalleryFavorites(favs);
  renderMainGamesGallery();
}
function renderMainGamesGallery() {
  const gallery = document.getElementById('mainGamesGallery');
  if (!gallery) return;
  const searchVal = (document.getElementById('gallerySearch')?.value || '').toLowerCase();
  const favs = getMainGalleryFavorites();
  // Sort: favorites first, then alpha
  let games = [...mainGalleryGames];
  games = games.filter(game => game.name.toLowerCase().includes(searchVal));
  games.sort((a, b) => {
    const aFav = favs.includes(a.id);
    const bFav = favs.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.name.localeCompare(b.name);
  });
  gallery.innerHTML = '';
  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${game.name}: ${game.desc}`);
    card.addEventListener('click', () => showGamePage(game.id));
    card.addEventListener('keypress', e => { if (e.key === 'Enter') showGamePage(game.id); });
    // Image
    const img = document.createElement('img');
    img.src = game.img;
    img.alt = `${game.name} logo`;
    img.className = 'game-logo';
    img.loading = 'lazy';
    card.appendChild(img);
    // Title
    const title = document.createElement('div');
    title.className = 'game-title';
    title.textContent = game.name;
    card.appendChild(title);
    // Desc
    const desc = document.createElement('div');
    desc.className = 'game-description';
    desc.textContent = game.desc;
    card.appendChild(desc);
    // Favorite star
    const star = document.createElement('span');
    star.className = 'bookmark-star' + (favs.includes(game.id) ? ' active' : '');
    star.setAttribute('role', 'button');
    star.setAttribute('tabindex', '0');
    star.setAttribute('aria-label', favs.includes(game.id) ? 'Unfavorite game' : 'Favorite game');
    star.innerHTML = favs.includes(game.id) ? '★' : '☆';
    star.addEventListener('click', e => { e.stopPropagation(); toggleMainGalleryFavorite(game.id); });
    star.addEventListener('keypress', e => { if (e.key === 'Enter') { e.stopPropagation(); toggleMainGalleryFavorite(game.id); } });
    card.appendChild(star);
    // Highlight if favorited
    if (favs.includes(game.id)) card.style.boxShadow = '0 0 0 3px var(--color-star-active, #ffd700)';
    gallery.appendChild(card);
  });
}
// Attach search event
const gallerySearchInput = document.getElementById('gallerySearch');
if (gallerySearchInput) {
  gallerySearchInput.addEventListener('input', renderMainGamesGallery);
}
// Initial render on page load
if (document.getElementById('mainGamesGallery')) {
  renderMainGamesGallery();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('ReversCodes Hub: Initializing...');
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Initialize all components
    initializeApp();
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart);
                console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
            }, 0);
        });
    }
    
    console.log('ReversCodes Hub: Initialization complete!');
});

// Main initialization function
function initializeApp() {
    console.log('initializeApp called on page:', window.location.pathname);
    // Legacy adblock modal disabled (handled by shared adblock-check.js)
    // Set initial theme
    setTheme(currentTheme);
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load data only if elements exist
    if (commentsList) {
        loadComments();
    }
    if (document.getElementById('submissionsList')) {
        loadSubmissions();
    }
    
    // Initialize scroll effects
    initializeScrollEffects();
    
    // Initialize lazy loading
    initializeLazyLoading();
    
    // Show welcome notification after loading screen is hidden (only if notification exists)
    if (notification) {
        setTimeout(() => {
            showNotification('Welcome to ReversCodes Hub! 🎮', 'success');
        }, 3000);
    }
    
    // Adblock detection is now centralized in adblock-check.js
    

}

// Ensure AdBlocker modal exists (auto-inject on pages that don't include it in HTML)
// Legacy ensureAdBlockerModalExists removed (handled by adblock-check.js)

// Initialize all event listeners
function initializeEventListeners() {
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Back to top button
    if (backToTop) {
        backToTop.addEventListener('click', scrollToTop);
    }
    
    // Notification close
    if (notificationClose) {
        notificationClose.addEventListener('click', hideNotification);
    }
    
    // Comment form submission
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }
    
    // Contact form submission (if exists)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (nav && mobileMenuToggle && !nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            nav.classList.remove('active');
        }
    });
    
    // Escape key to close modals and menus
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav) {
            nav.classList.remove('active');
        }
    });
    
    // Close mobile menu when clicking on navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        });
    });
}



// Theme management
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    // Update theme icon
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
    
    // Update theme icon tooltip
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    showNotification(`Switched to ${newTheme} theme!`, 'info');
}

// Mobile menu
function toggleMobileMenu() {
    nav.classList.toggle('active');
    
    // Animate hamburger menu
    const spans = mobileMenuToggle.querySelectorAll('span');
    spans.forEach((span, index) => {
        span.style.transition = 'all 0.3s ease';
        if (nav.classList.contains('active')) {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            span.style.transform = 'none';
            span.style.opacity = '1';
        }
    });
    
    // Focus management for accessibility
    if (nav.classList.contains('active')) {
        // Focus the first navigation link when menu opens
        const firstNavLink = nav.querySelector('.nav-link');
        if (firstNavLink) {
            setTimeout(() => firstNavLink.focus(), 100);
        }
    }
}

// Scroll effects with performance optimizations
function initializeScrollEffects() {
    const handleScroll = throttle(() => {
        requestAnimationFrame(() => {
            // Back to top button visibility
            if (backToTop) {
                if (window.pageYOffset > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            }
            
            // Header background on scroll
            const header = document.getElementById('header');
            if (header) {
                if (window.pageYOffset > 50) {
                    header.style.background = 'var(--bg-header)';
                    header.style.backdropFilter = 'blur(10px)';
                    header.classList.add('scrolled');
                } else {
                    header.style.background = 'transparent';
                    header.style.backdropFilter = 'none';
                    header.classList.remove('scrolled');
                }
            }
            
            // Active navigation link highlighting
            highlightActiveNavLink();
        });
    }, 16); // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Highlight active navigation link based on scroll position (optimized)
function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    const scrollY = window.pageYOffset;
    
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
            break;
        }
    }
    
    for (let i = 0; i < navLinks.length; i++) {
        const link = navLinks[i];
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
            if (!link.classList.contains('active')) {
                link.classList.add('active');
            }
        } else {
            link.classList.remove('active');
        }
    }
}

// Smooth scrolling to sections
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Close mobile menu if open
        nav.classList.remove('active');
    }
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Page refresh function
function refreshPage() {
    window.location.reload();
}

// News expansion
function expandNews(button) {
    const newsDetails = button.nextElementSibling;
    const isExpanded = newsDetails.style.display !== 'none';
    
    if (isExpanded) {
        newsDetails.style.display = 'none';
        button.textContent = 'Read More';
    } else {
        newsDetails.style.display = 'block';
        button.textContent = 'Read Less';
    }
}

// Expand individual news card
function expandNewsCard(button) {
    const newsCard = button.closest('.news-card');
    const newsDetails = newsCard.querySelector('.news-details');
    const isExpanded = newsDetails.style.display !== 'none';
    
    if (isExpanded) {
        newsDetails.style.display = 'none';
        button.textContent = 'Read More';
    } else {
        newsDetails.style.display = 'block';
        button.textContent = 'Read Less';
    }
}

// Contact form system
function handleContactSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!name || !email || !subject || !message) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address!', 'error');
        return;
    }
    
    // Create new submission
    const submission = {
        id: Date.now(),
        name: name,
        email: email,
        subject: subject,
        content: message,
        date: new Date().toISOString()
    };
    
    // Add to submissions array
    submissions.unshift(submission);
    
    // Save to localStorage
    localStorage.setItem('helpSubmissions', JSON.stringify(submissions));
    
    // Clear form
    nameInput.value = '';
    emailInput.value = '';
    subjectInput.value = '';
    messageInput.value = '';
    
    // Show success notification
    showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
}

// Comments system
function handleCommentSubmit(e) {
    e.preventDefault();
    
    // Check rate limiting
    const clientIP = SecurityConfig.getClientIP();
    if (!SecurityConfig.checkRateLimit(clientIP)) {
        showNotification('Too many requests. Please wait a moment before trying again.', 'error');
        SecurityConfig.logSecurityEvent('rate_limit_exceeded', { clientIP });
        return;
    }
    
    const emailInput = document.getElementById('commentEmail');
    const nameInput = document.getElementById('commentName');
    const textInput = document.getElementById('commentText');
    
    const email = emailInput.value.trim();
    const name = nameInput.value.trim();
    const text = textInput.value.trim();
    
    if (!email || !name || !text) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }
    
    // Security validation
    if (!SecurityConfig.validateEmail(email)) {
        showNotification('Please enter a valid email address!', 'error');
        SecurityConfig.logSecurityEvent('invalid_email_attempt', { email });
        return;
    }
    
    if (!SecurityConfig.validateUsername(name)) {
        showNotification('Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens.', 'error');
        SecurityConfig.logSecurityEvent('invalid_username_attempt', { name });
        return;
    }
    
    if (!SecurityConfig.validateComment(text)) {
        showNotification('Comment contains invalid content or is too long/short.', 'error');
        SecurityConfig.logSecurityEvent('invalid_comment_attempt', { textLength: text.length });
        return;
    }
    
    // Check if email already has a nickname
    const existingComment = comments.find(c => c.email === email);
    if (existingComment && existingComment.name !== name) {
        showNotification('This email is already registered with a different nickname!', 'error');
        return;
    }
    
    if (text.length < 10) {
        showNotification('Comment must be at least 10 characters long!', 'error');
        return;
    }
    
    // Sanitize inputs
    const sanitizedEmail = SecurityConfig.sanitizeInput(email);
    const sanitizedName = SecurityConfig.sanitizeInput(name);
    const sanitizedText = SecurityConfig.sanitizeInput(text);
    
    // Create new comment
    const comment = {
        id: Date.now(),
        email: sanitizedEmail,
        name: sanitizedName,
        text: sanitizedText,
        date: new Date().toISOString(),
        likes: 0
    };
    
    // Add to comments array
    comments.unshift(comment);
    
    // Save to localStorage
    localStorage.setItem('comments', JSON.stringify(comments));
    
    // Update display
    loadComments();
    
    // Clear form
    emailInput.value = '';
    nameInput.value = '';
    textInput.value = '';
    
    // Log successful comment
    SecurityConfig.logSecurityEvent('comment_posted', {
        commentId: comment.id,
        nameLength: sanitizedName.length,
        textLength: sanitizedText.length
    });
    
    // Show success notification
    showNotification('Comment posted successfully!', 'success');
}

function loadComments() {
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
}

function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.innerHTML = `
        <div class="comment-header">
            <span class="comment-author">${escapeHtml(comment.name)}</span>
            <span class="comment-date">${formatDate(comment.date)}</span>
        </div>
        <div class="comment-text">${escapeHtml(comment.text)}</div>
        <div class="comment-actions">
            <button onclick="likeComment(${comment.id})" class="btn btn-sm">
                👍 ${comment.likes}
            </button>
            <button onclick="deleteComment(${comment.id})" class="btn btn-sm btn-danger">
                Delete
            </button>
        </div>
    `;
    return commentDiv;
}

function likeComment(commentId) {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        comment.likes++;
        localStorage.setItem('comments', JSON.stringify(comments));
        loadComments();
    }
}

function deleteComment(commentId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        comments = comments.filter(c => c.id !== commentId);
        localStorage.setItem('comments', JSON.stringify(comments));
        loadComments();
        showNotification('Comment deleted!', 'info');
    }
}

// Admin functions
function loadSubmissions() {
    // This function is mainly for the admin modal
    // The main page doesn't have a submissions list
    console.log('Submissions loaded:', submissions.length);
}

function createSubmissionElement(submission) {
    const submissionDiv = document.createElement('div');
    submissionDiv.className = 'submission';
    submissionDiv.innerHTML = `
        <div class="submission-header">
            <span class="submission-name">${escapeHtml(submission.name)}</span>
            <span class="submission-date">${formatDate(submission.date)}</span>
        </div>
        <div class="submission-email"><strong>Email:</strong> ${escapeHtml(submission.email)}</div>
        <div class="submission-subject"><strong>Subject:</strong> ${escapeHtml(submission.subject || 'No subject')}</div>
        <div class="submission-content"><strong>Message:</strong> ${escapeHtml(submission.content)}</div>
        <div class="submission-actions">
            <button onclick="deleteSubmission(${submission.id})" class="btn btn-sm btn-danger">
                Delete
            </button>
        </div>
    `;
    return submissionDiv;
}

function deleteSubmission(submissionId) {
    if (confirm('Are you sure you want to delete this submission?')) {
        submissions = submissions.filter(s => s.id !== submissionId);
        localStorage.setItem('submissions', JSON.stringify(submissions));
        loadSubmissions();
        showNotification('Submission deleted!', 'info');
    }
}

function refreshData() {
    loadComments();
    loadModalSubmissions();
    loadModalComments();
    showNotification('Data refreshed!', 'success');
}

function exportData() {
    const data = {
        comments: comments,
        submissions: submissions,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reverscodes-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

function clearData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
        comments = [];
        submissions = [];
        localStorage.removeItem('comments');
        localStorage.removeItem('submissions');
        loadComments();
        loadSubmissions();
        showNotification('All data cleared!', 'info');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    if (!notification || !notificationText) {
        console.log(`Notification: ${message}`);
        return;
    }
    
    notificationText.textContent = message;
    notification.style.display = 'flex';
    notification.className = `notification show ${type}`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    if (!notification) return;
    
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    // Remove the notification element completely after animation
    setTimeout(() => {
        notification.style.display = 'none';
        notification.classList.remove('hide');
    }, 300);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleTheme();
    }
    
    // Escape to close mobile menu
    if (e.key === 'Escape' && nav) {
        nav.classList.remove('active');
    }
    
    // Ctrl/Cmd + Enter to submit comment form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'TEXTAREA') {
            const form = activeElement.closest('form');
            if (form && form.id === 'commentForm') {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        }
    }
    
    // Secret admin access: Ctrl + Shift + A
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        initiateAdminAccess();
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.news-card, .game-card, .comment, .submission');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Service Worker Registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Performance monitoring
window.addEventListener('load', function() {
    // Log page load time
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    
    // Track user interactions
    let interactionCount = 0;
    document.addEventListener('click', function() {
        interactionCount++;
        if (interactionCount === 1) {
            console.log('First user interaction detected');
        }
    });
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showNotification('Something went wrong. Please refresh the page.', 'error');
});

// Secret Admin Access Functions
function initiateAdminAccess() {
    adminPassword = prompt('Enter admin password:');
    if (adminPassword === 'reverscodes2024') {
        adminNumber = prompt('Enter your favorite number:');
        if (adminNumber === '7') {
            showNotification('Admin access granted! Redirecting to admin panel...', 'success');
            setTimeout(() => {
                openAdminPanel();
            }, 1500);
        } else {
            adminAccessAttempts++;
            showNotification('Incorrect number. Access denied.', 'error');
            if (adminAccessAttempts >= 3) {
                showNotification('Too many failed attempts. Please try again later.', 'error');
                setTimeout(() => {
                    adminAccessAttempts = 0;
                }, 30000);
            }
        }
    } else {
        adminAccessAttempts++;
        showNotification('Incorrect password. Access denied.', 'error');
        if (adminAccessAttempts >= 3) {
            showNotification('Too many failed attempts. Please try again later.', 'error');
            setTimeout(() => {
                adminAccessAttempts = 0;
            }, 30000);
        }
    }
}

function openAdminPanel() {
    // Create admin panel modal
    const adminModal = document.createElement('div');
    adminModal.className = 'admin-modal';
    adminModal.innerHTML = `
        <div class="admin-modal-content">
            <div class="admin-modal-header">
                <h2>Admin Panel</h2>
                <button class="admin-modal-close" onclick="closeAdminPanel()">&times;</button>
            </div>
            <div class="admin-modal-body">
                <div class="admin-section">
                    <h3>Contact Form Submissions</h3>
                    <div class="submissions-list" id="modalSubmissionsList"></div>
                </div>
                <div class="admin-section">
                    <h3>Comments</h3>
                    <div class="comments-list" id="modalCommentsList"></div>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-primary" onclick="refreshData()">Refresh Data</button>
                    <button class="btn btn-secondary" onclick="exportData()">Export Data</button>
                    <button class="btn btn-danger" onclick="clearData()">Clear All Data</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(adminModal);
    
    // Load data
    loadModalData();
}

function closeAdminPanel() {
    const adminModal = document.querySelector('.admin-modal');
    if (adminModal) {
        adminModal.remove();
    }
}

function loadModalData() {
    loadModalSubmissions();
    loadModalComments();
}

function loadModalSubmissions() {
    const submissionsList = document.getElementById('modalSubmissionsList');
    if (!submissionsList) return;
    
    submissionsList.innerHTML = '';
    
    if (submissions.length === 0) {
        submissionsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No submissions yet.</p>';
        return;
    }
    
    submissions.forEach(submission => {
        const submissionElement = createSubmissionElement(submission);
        submissionsList.appendChild(submissionElement);
    });
}

function loadModalComments() {
    const commentsList = document.getElementById('modalCommentsList');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No comments yet.</p>';
        return;
    }
    
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
}

// Lazy Loading
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Question Handling
function answerQuestion(answer) {
    // Remove selected class from all buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selected class to clicked button
    event.target.classList.add('selected');
    
    // Store answer
    localStorage.setItem('robloxQuestionAnswer', answer);
    
    // Show response based on answer
    let message = '';
    switch(answer) {
        case 'yes':
            message = 'Great! You\'ll love our latest Roblox updates! 🎮';
            break;
        case 'sometimes':
            message = 'Check back often for new codes and updates! 📱';
            break;
        case 'no':
            message = 'Maybe you\'ll find something interesting here! 😊';
            break;
    }
    
    showNotification(message, 'info');
}

// Export functions for global access
window.scrollToSection = scrollToSection;
window.refreshPage = refreshPage;
window.expandNews = expandNews;
window.likeComment = likeComment;
window.deleteComment = deleteComment;
window.deleteSubmission = deleteSubmission;
window.refreshData = refreshData;
window.exportData = exportData;
window.clearData = clearData;
window.showNotification = showNotification;
window.answerQuestion = answerQuestion;
window.closeAdminPanel = closeAdminPanel;
window.copyCode = copyCode;

// Hide Generating Indicator
function hideGeneratingIndicator() {
  var el = document.getElementById('generating-indicator');
  if (el) el.style.display = 'none';
}
window.hideGeneratingIndicator = hideGeneratingIndicator;

// Copy Code Function
function copyCode(code) {
    navigator.clipboard.writeText(code).then(function() {
        showNotification(`Code "${code}" copied to clipboard!`, 'success');
        
        // Update button text temporarily
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 1500);
    }).catch(function(err) {
        console.error('Failed to copy code: ', err);
        showNotification('Failed to copy code. Please try again.', 'error');
    });
}

// Copy all codes functionality
document.addEventListener('DOMContentLoaded', function() {
    // ASTDX Copy All
    const copyAllASTDX = document.getElementById('copyAllASTDX');
    if (copyAllASTDX) {
        copyAllASTDX.addEventListener('click', function() {
            const codes = [
                'THREEHUNDREDTHOUSANDPLAYERS',
                'THANKYOUFORSUPPORT',
                'UPD1',
                'LIKEF5',
                'VERYHIGHLIKEB',
                'ONEEIGHTYFIVELIKES',
                'FORTYFIVELIKES',
                'somanylikes',
                'AFIRSTTIME3001',
                'FREENIMBUSMOUNT'
            ];
            copyCodesToClipboard(codes, 'ASTDX codes copied to clipboard!');
        });
    }

    // Goalbound Copy All
    const copyAllGoalbound = document.getElementById('copyAllGoalbound');
    if (copyAllGoalbound) {
        copyAllGoalbound.addEventListener('click', function() {
            const codes = [
                'ITOSHI',
                'EGOSOONIPROMISE',
                'SRY4EGO',
                'IMETGEN',
                '300KLIKES',
                '200KLIKES',
                'UPDATE1SOON',
                'SRYFORBUGS',
                'RELEASE',
                'DELAYBOUND'
            ];
            copyCodesToClipboard(codes, 'Goalbound codes copied to clipboard!');
        });
    }

    // Rivals Copy All
    const copyAllRivals = document.getElementById('copyAllRivals');
    if (copyAllRivals) {
        copyAllRivals.addEventListener('click', function() {
            const codes = [
                'COMMUNITY15',
                'COMMUNITY14',
                'COMMUNITY13',
                'COMMUNITY12',
                'COMMUNITY11',
                'COMMUNITY10',
                'COMMUNITY9',
                'COMMUNITY8',
                '5B_VISITS_WHATTTTTT',
                'REWARD53',
                'REWARD52',
                'REWARD49',
                'REWARD47',
                'REWARD46',
                'roblox_rtc',
                'THANKYOU_1BVISITS!',
                'BONUS'
            ];
            copyCodesToClipboard(codes, 'Rivals codes copied to clipboard!');
        });
    }

    // Volleyball Legends Copy All
    const copyAllVolleyballLegends = document.getElementById('copyAllVolleyballLegends');
    if (copyAllVolleyballLegends) {
        copyAllVolleyballLegends.addEventListener('click', function() {
            const codes = [
                'PROTORI_100K_CLUB',
                'UPDATE_30',
                'TSH_RETURNS',
                'FREE_SLOT_HERE'
            ];
            copyCodesToClipboard(codes, 'Volleyball Legends codes copied to clipboard!');
        });
    }

    // Basketball Zero Copy All
    const copyAllBasketballZero = document.getElementById('copyAllBasketballZero');
    if (copyAllBasketballZero) {
        copyAllBasketballZero.addEventListener('click', function() {
            const codes = [
                'CYBER250K',
                'SEASON2TODAY',
                'SEASON2COSMETICS',
                'SORRY4RESTARTAGAIN',
                'DOBETTERPLS',
                'SABOTAGEISSHAMEFUL',
                'UNCLESAM',
                'VERYSRRYDELAY',
                'OIL',
                'GOODWEEKEND',
                'CHROLLODROPHOORAY',
                'LEWISAYSSORRY',
                'ZEROSUMMER',
                'RELEASE',
                'CONSOLESUCKS',
                'ONEMORECODE',
                'SWITCHERSTYLE',
                'NEWCHAPTER'
            ];
            copyCodesToClipboard(codes, 'Basketball Zero codes copied to clipboard!');
        });
    }

    // Arise Crossover Copy All
    const copyAllAriseCrossover = document.getElementById('copyAllAriseCrossover');
    if (copyAllAriseCrossover) {
        copyAllAriseCrossover.addEventListener('click', function() {
            const codes = [
                'BEASTPASS',
                '1.2MLIKES',
                'KAIJU',
                'TalentReset',
                'FryBalance',
                'EXPEDITIONS',
                'TALENTS',
                'SUMMERMINI',
                'SUMMER2',
                'SUMMER',
                'Begeta+n',
                '1.1MLIKES'
            ];
            copyCodesToClipboard(codes, 'Arise Crossover codes copied to clipboard!');
        });
    }
});

// Function to copy multiple codes to clipboard
function copyCodesToClipboard(codes, message) {
    const codesText = codes.join('\n');
    navigator.clipboard.writeText(codesText).then(function() {
        showNotification(message, 'success');
        
        // Update button text temporarily
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy codes: ', err);
        showNotification('Failed to copy codes. Please try again.', 'error');
    });
}

// Game Page Navigation Functions
function showGamePage(pageId) {
    // Hide main content
    const mainContent = document.querySelector('.main-content');
    const header = document.getElementById('header');
    const footer = document.querySelector('.footer');
    const backgroundContainer = document.querySelector('.background-container');
    
    if (mainContent) mainContent.style.display = 'none';
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (backgroundContainer) backgroundContainer.style.display = 'none';
    
    // Show game page
    const gamePage = document.getElementById(pageId);
    if (gamePage) {
        gamePage.style.display = 'block';
        gamePage.classList.add('show');
        
        // Scroll to top of game page
        gamePage.scrollTop = 0;
        
        // Update URL without page reload
        history.pushState({ page: pageId }, '', `#${pageId}`);
    }
}

function showHub() {
    // Hide all game pages
    const gamePages = document.querySelectorAll('.game-page');
    gamePages.forEach(page => {
        page.style.display = 'none';
        page.classList.remove('show');
    });
    
    // Show main content
    const mainContent = document.querySelector('.main-content');
    const header = document.getElementById('header');
    const footer = document.querySelector('.footer');
    const backgroundContainer = document.querySelector('.background-container');
    
    if (mainContent) mainContent.style.display = 'block';
    if (header) header.style.display = 'block';
    if (footer) footer.style.display = 'block';
    if (backgroundContainer) backgroundContainer.style.display = 'block';
    
    // Update URL
    history.pushState({ page: 'hub' }, '', '#home');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page && event.state.page !== 'hub') {
        showGamePage(event.state.page);
    } else {
        showHub();
    }
});

// Initialize page based on URL hash
document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash;
    if (hash && (hash === '#astdx-page' || hash === '#goalbound-page' || hash === '#rivals-page' || hash === '#arisecrossover-page')) {
        showGamePage(hash.substring(1));
    }
});

// Update navigation links to use 'game-gallery' instead of 'games'
document.querySelectorAll('a.nav-link, .hero-buttons .btn').forEach(link => {
  if (link.getAttribute('href') === '#games' || link.textContent.trim() === 'Game Codes') {
    link.setAttribute('href', '#game-gallery');
    link.onclick = function(e) { e.preventDefault(); scrollToSection('game-gallery'); };
  }
});

// Export the navigation functions
window.showGamePage = showGamePage;
window.showHub = showHub;

// Sticky/revealing header on scroll up
(function() {
  let lastScrollY = window.scrollY;
  let ticking = false;
  const header = document.getElementById('header');
  let lastDirection = 'up';
  function onScroll() {
    const currentY = window.scrollY;
    if (currentY < 0) return;
    if (currentY < 50) {
      header.style.transform = 'translateY(0)';
      header.style.boxShadow = '';
      lastDirection = 'up';
    } else if (currentY > lastScrollY) {
      // Scrolling down
      if (lastDirection !== 'down') {
        header.style.transform = 'translateY(-100%)';
        header.style.boxShadow = '';
        lastDirection = 'down';
      }
    } else {
      // Scrolling up
      if (lastDirection !== 'up') {
        header.style.transform = 'translateY(0)';
        header.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
        lastDirection = 'up';
      }
    }
    lastScrollY = currentY;
    ticking = false;
  }
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }
  if (header) {
    header.style.transition = 'transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.2s';
    window.addEventListener('scroll', requestTick);
  }
})();

(function updateLastUpdatedBar() {
  var el = document.getElementById('lastUpdatedDate');
  if (!el) return;
  var now = new Date();
  var months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  var formatted = months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
  el.textContent = formatted;
})();

// === DROPDOWN FUNCTIONALITY ===

// Toggle trending card details
function toggleTrendingDetails(card) {
    const details = card.querySelector('.trending-details');
    const isVisible = details.style.display !== 'none';
    
    // Close all other trending details first
    document.querySelectorAll('.trending-details').forEach(detail => {
        detail.style.display = 'none';
    });
    
    // Toggle current details
    if (!isVisible) {
        details.style.display = 'block';
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.3)';
    } else {
        details.style.display = 'none';
        card.style.transform = '';
        card.style.boxShadow = '';
    }
}

// Toggle guide card details
function toggleGuideDetails(card) {
    const details = card.querySelector('.guide-details');
    const isVisible = details.style.display !== 'none';
    
    // Close all other guide details first
    document.querySelectorAll('.guide-details').forEach(detail => {
        detail.style.display = 'none';
    });
    
    // Toggle current details
    if (!isVisible) {
        details.style.display = 'block';
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.3)';
    } else {
        details.style.display = 'none';
        card.style.transform = '';
        card.style.boxShadow = '';
    }
}

// === COMMUNITY FEATURES ===

// Motivational quotes array (50 quotes for daily rotation)
const motivationalQuotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
    { text: "When one door of happiness closes, another opens.", author: "Helen Keller" },
    { text: "Always do your best. What you plant now, you will harvest later.", author: "Ralph Waldo Emerson" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
    { text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.", author: "Unknown" },
    { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
    { text: "The only way to achieve the impossible is to believe it is possible.", author: "Charles Kingsleigh" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "The best revenge is massive success.", author: "Frank Sinatra" },
    { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
    { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
    { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
    { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
    { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
    { text: "The more you praise and celebrate your life, the more there is in life to celebrate.", author: "Oprah Winfrey" },
    { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Make each day your masterpiece.", author: "John Wooden" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "The only person you should try to be better than is the person you were yesterday.", author: "Unknown" },
    { text: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
    { text: "The difference between try and triumph is just a little umph!", author: "Marvin Phillips" },
    { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
    { text: "The road to success and the road to failure are almost exactly the same.", author: "Colin R. Davis" },
    { text: "What seems to us as bitter trials are often blessings in disguise.", author: "Oscar Wilde" },
    { text: "The man who has no imagination has no wings.", author: "Muhammad Ali" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "The only way to achieve the impossible is to believe it is possible.", author: "Charles Kingsleigh" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Every expert was once a beginner.", author: "Robert T. Kiyosaki" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { text: "Success is not about being the best. It's about being better than you were yesterday.", author: "Unknown" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Your attitude determines your direction.", author: "Unknown" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "The best revenge is massive success.", author: "Frank Sinatra" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" }
];

// Quiz questions array (50 questions for daily rotation)
const quizQuestions = [
    {
        question: "What year was Roblox officially released?",
        options: ["2004", "2006", "2008", "2010"],
        correct: 1
    },
    {
        question: "What is the name of Roblox's virtual currency?",
        options: ["Robux", "Roblox Coins", "R-Cash", "Virtual Money"],
        correct: 0
    },
    {
        question: "Which of these is NOT a popular Roblox game genre?",
        options: ["Tycoon", "Adopt Me", "FPS", "Racing"],
        correct: 1
    },
    {
        question: "What does 'RTHRO' stand for in Roblox?",
        options: ["Roblox Themed Humanoid", "Realistic Humanoid", "Roblox Humanoid", "Realistic Themed Humanoid"],
        correct: 0
    },
    {
        question: "Which company owns Roblox?",
        options: ["Microsoft", "Roblox Corporation", "Epic Games", "Activision"],
        correct: 1
    },
    {
        question: "What is the most popular Roblox game of all time?",
        options: ["Adopt Me!", "Blox Fruits", "Tower of Hell", "Murder Mystery 2"],
        correct: 0
    },
    {
        question: "What programming language does Roblox use?",
        options: ["Lua", "Python", "JavaScript", "C++"],
        correct: 0
    },
    {
        question: "What is the name of Roblox's mascot?",
        options: ["Robloxian", "Roblox Guy", "Rthro", "Blocky"],
        correct: 0
    },
    {
        question: "Which of these is a popular Roblox YouTuber?",
        options: ["PewDiePie", "DanTDM", "Preston", "All of the above"],
        correct: 3
    },
    {
        question: "What is the maximum number of players in a Roblox game?",
        options: ["50", "100", "200", "Unlimited"],
        correct: 1
    },
    {
        question: "What is the name of Roblox's mobile app?",
        options: ["Roblox Mobile", "Roblox Go", "Roblox", "Roblox Play"],
        correct: 2
    },
    {
        question: "Which of these is NOT a Roblox game type?",
        options: ["Tycoon", "Simulator", "Adventure", "Battle Royale"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's premium subscription?",
        options: ["Roblox Plus", "Roblox Premium", "Roblox Pro", "Roblox Gold"],
        correct: 1
    },
    {
        question: "What is the name of Roblox's development tool?",
        options: ["Roblox Studio", "Roblox Creator", "Roblox Builder", "Roblox Maker"],
        correct: 0
    },
    {
        question: "Which of these is a popular Roblox event?",
        options: ["Egg Hunt", "Advent Calendar", "Birthday Event", "All of the above"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual world?",
        options: ["Roblox World", "Roblox Universe", "Roblox Metaverse", "Roblox Space"],
        correct: 2
    },
    {
        question: "Which of these is NOT a Roblox avatar type?",
        options: ["R6", "R15", "Rthro", "R20"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's marketplace?",
        options: ["Roblox Store", "Roblox Market", "Roblox Shop", "Roblox Mall"],
        correct: 0
    },
    {
        question: "Which of these is a popular Roblox game developer?",
        options: ["Roblox Corporation", "Epic Games", "Mojang", "Valve"],
        correct: 0
    },
    {
        question: "What is the name of Roblox's social feature?",
        options: ["Roblox Friends", "Roblox Social", "Roblox Connect", "Roblox Network"],
        correct: 0
    },
    {
        question: "Which of these is NOT a Roblox game category?",
        options: ["All Ages", "Teen", "Mature", "Adult"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual currency exchange?",
        options: ["Robux Exchange", "Roblox Exchange", "Currency Exchange", "Virtual Exchange"],
        correct: 0
    },
    {
        question: "Which of these is a popular Roblox game genre?",
        options: ["RPG", "MMO", "Simulation", "All of the above"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual world platform?",
        options: ["Roblox World", "Roblox Universe", "Roblox Metaverse", "Roblox Space"],
        correct: 2
    },
    {
        question: "Which of these is NOT a Roblox game feature?",
        options: ["Chat", "Trading", "Building", "Cooking"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual currency?",
        options: ["Robux", "Roblox Coins", "R-Cash", "Virtual Money"],
        correct: 0
    },
    {
        question: "Which of these is a popular Roblox game type?",
        options: ["Tycoon", "Simulator", "Adventure", "All of the above"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's development platform?",
        options: ["Roblox Studio", "Roblox Creator", "Roblox Builder", "Roblox Maker"],
        correct: 0
    },
    {
        question: "Which of these is NOT a Roblox game category?",
        options: ["All Ages", "Teen", "Mature", "Adult"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual world?",
        options: ["Roblox World", "Roblox Universe", "Roblox Metaverse", "Roblox Space"],
        correct: 2
    },
    {
        question: "Which of these is a popular Roblox game feature?",
        options: ["Chat", "Trading", "Building", "All of the above"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual currency exchange?",
        options: ["Robux Exchange", "Roblox Exchange", "Currency Exchange", "Virtual Exchange"],
        correct: 0
    },
    {
        question: "Which of these is NOT a Roblox game type?",
        options: ["Tycoon", "Simulator", "Adventure", "Cooking"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's social feature?",
        options: ["Roblox Friends", "Roblox Social", "Roblox Connect", "Roblox Network"],
        correct: 0
    },
    {
        question: "Which of these is a popular Roblox game developer?",
        options: ["Roblox Corporation", "Epic Games", "Mojang", "Valve"],
        correct: 0
    },
    {
        question: "What is the name of Roblox's marketplace?",
        options: ["Roblox Store", "Roblox Market", "Roblox Shop", "Roblox Mall"],
        correct: 0
    },
    {
        question: "Which of these is NOT a Roblox avatar type?",
        options: ["R6", "R15", "Rthro", "R20"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual world platform?",
        options: ["Roblox World", "Roblox Universe", "Roblox Metaverse", "Roblox Space"],
        correct: 2
    },
    {
        question: "Which of these is a popular Roblox game genre?",
        options: ["RPG", "MMO", "Simulation", "All of the above"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual currency?",
        options: ["Robux", "Roblox Coins", "R-Cash", "Virtual Money"],
        correct: 0
    },
    {
        question: "Which of these is a popular Roblox game type?",
        options: ["Tycoon", "Simulator", "Adventure", "All of the above"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's development platform?",
        options: ["Roblox Studio", "Roblox Creator", "Roblox Builder", "Roblox Maker"],
        correct: 0
    },
    {
        question: "Which of these is NOT a Roblox game category?",
        options: ["All Ages", "Teen", "Mature", "Adult"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual world?",
        options: ["Roblox World", "Roblox Universe", "Roblox Metaverse", "Roblox Space"],
        correct: 2
    },
    {
        question: "Which of these is a popular Roblox game feature?",
        options: ["Chat", "Trading", "Building", "All of the above"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual currency exchange?",
        options: ["Robux Exchange", "Roblox Exchange", "Currency Exchange", "Virtual Exchange"],
        correct: 0
    },
    {
        question: "Which of these is NOT a Roblox game type?",
        options: ["Tycoon", "Simulator", "Adventure", "Cooking"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's social feature?",
        options: ["Roblox Friends", "Roblox Social", "Roblox Connect", "Roblox Network"],
        correct: 0
    },
    {
        question: "Which of these is a popular Roblox game developer?",
        options: ["Roblox Corporation", "Epic Games", "Mojang", "Valve"],
        correct: 0
    },
    {
        question: "What is the name of Roblox's marketplace?",
        options: ["Roblox Store", "Roblox Market", "Roblox Shop", "Roblox Mall"],
        correct: 0
    },
    {
        question: "Which of these is NOT a Roblox avatar type?",
        options: ["R6", "R15", "Rthro", "R20"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual world platform?",
        options: ["Roblox World", "Roblox Universe", "Roblox Metaverse", "Roblox Space"],
        correct: 2
    },
    {
        question: "Which of these is a popular Roblox game genre?",
        options: ["RPG", "MMO", "Simulation", "All of the above"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual currency?",
        options: ["Robux", "Roblox Coins", "R-Cash", "Virtual Money"],
        correct: 0
    },
    {
        question: "Which of these is a popular Roblox game type?",
        options: ["Tycoon", "Simulator", "Adventure", "All of the above"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's development platform?",
        options: ["Roblox Studio", "Roblox Creator", "Roblox Builder", "Roblox Maker"],
        correct: 0
    },
    {
        question: "Which of these is NOT a Roblox game category?",
        options: ["All Ages", "Teen", "Mature", "Adult"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual world?",
        options: ["Roblox World", "Roblox Universe", "Roblox Metaverse", "Roblox Space"],
        correct: 2
    },
    {
        question: "Which of these is a popular Roblox game feature?",
        options: ["Chat", "Trading", "Building", "All of the above"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual currency exchange?",
        options: ["Robux Exchange", "Roblox Exchange", "Currency Exchange", "Virtual Exchange"],
        correct: 0
    },
    {
        question: "Which of these is NOT a Roblox game type?",
        options: ["Tycoon", "Simulator", "Adventure", "Cooking"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's social feature?",
        options: ["Roblox Friends", "Roblox Social", "Roblox Connect", "Roblox Network"],
        correct: 0
    },
    {
        question: "Which of these is a popular Roblox game developer?",
        options: ["Roblox Corporation", "Epic Games", "Mojang", "Valve"],
        correct: 0
    },
    {
        question: "What is the name of Roblox's marketplace?",
        options: ["Roblox Store", "Roblox Market", "Roblox Shop", "Roblox Mall"],
        correct: 0
    },
    {
        question: "Which of these is NOT a Roblox avatar type?",
        options: ["R6", "R15", "Rthro", "R20"],
        correct: 3
    },
    {
        question: "What is the name of Roblox's virtual world platform?",
        options: ["Roblox World", "Roblox Universe", "Roblox Metaverse", "Roblox Space"],
        correct: 2
    },
    {
        question: "Which of these is a popular Roblox game genre?",
        options: ["RPG", "MMO", "Simulation", "All of the above"],
        correct: 3
    }
];

// Poll questions array (50 polls for daily rotation)
const pollQuestions = [
    {
        question: "What's your favorite Roblox game genre?",
        options: ["Adventure", "Simulator", "Tycoon", "Fighting"]
    },
    {
        question: "How many hours do you play Roblox per week?",
        options: ["0-5 hours", "6-15 hours", "16-30 hours", "30+ hours"]
    },
    {
        question: "What's your favorite type of Roblox content?",
        options: ["Gaming", "Building", "Social", "Trading"]
    },
    {
        question: "Which platform do you use to play Roblox?",
        options: ["PC", "Mobile", "Tablet", "Console"]
    },
    {
        question: "What's your favorite Roblox event?",
        options: ["Egg Hunts", "Advent Calendars", "Birthday Events", "Seasonal Events"]
    },
    {
        question: "What's your favorite Roblox game?",
        options: ["Adopt Me!", "Blox Fruits", "Tower of Hell", "Murder Mystery 2"]
    },
    {
        question: "How do you prefer to play Roblox?",
        options: ["Solo", "With Friends", "Public Servers", "Private Servers"]
    },
    {
        question: "What's your favorite Roblox avatar style?",
        options: ["R6", "R15", "Rthro", "Custom"]
    },
    {
        question: "How often do you redeem codes?",
        options: ["Daily", "Weekly", "Monthly", "Never"]
    },
    {
        question: "What's your favorite Roblox game type?",
        options: ["RPG", "MMO", "Simulation", "Puzzle"]
    },
    {
        question: "How do you discover new Roblox games?",
        options: ["Popular Page", "Friends", "YouTube", "Social Media"]
    },
    {
        question: "What's your favorite Roblox feature?",
        options: ["Chat", "Trading", "Building", "Customization"]
    },
    {
        question: "How long have you been playing Roblox?",
        options: ["Less than 1 year", "1-3 years", "3-5 years", "5+ years"]
    },
    {
        question: "What's your favorite Roblox game category?",
        options: ["All Ages", "Teen", "Mature", "Family"]
    },
    {
        question: "How do you prefer to communicate in Roblox?",
        options: ["Text Chat", "Voice Chat", "Emotes", "Private Messages"]
    },
    {
        question: "What's your favorite Roblox game mode?",
        options: ["Single Player", "Multiplayer", "Co-op", "Competitive"]
    },
    {
        question: "How often do you buy Robux?",
        options: ["Never", "Rarely", "Sometimes", "Often"]
    },
    {
        question: "What's your favorite Roblox game theme?",
        options: ["Fantasy", "Sci-Fi", "Modern", "Historical"]
    },
    {
        question: "How do you prefer to play Roblox games?",
        options: ["Casual", "Competitive", "Creative", "Social"]
    },
    {
        question: "What's your favorite Roblox game mechanic?",
        options: ["Trading", "Building", "Combat", "Exploration"]
    },
    {
        question: "How often do you visit the Roblox marketplace?",
        options: ["Daily", "Weekly", "Monthly", "Never"]
    },
    {
        question: "What's your favorite Roblox game setting?",
        options: ["Urban", "Rural", "Fantasy", "Space"]
    },
    {
        question: "How do you prefer to spend your Robux?",
        options: ["Avatar Items", "Game Passes", "Developer Products", "Gifts"]
    },
    {
        question: "What's your favorite Roblox game style?",
        options: ["Realistic", "Cartoon", "Anime", "Pixel Art"]
    },
    {
        question: "How often do you create content in Roblox?",
        options: ["Never", "Rarely", "Sometimes", "Often"]
    },
    {
        question: "What's your favorite Roblox game genre?",
        options: ["Action", "Adventure", "Simulation", "Strategy"]
    },
    {
        question: "How do you prefer to play with others?",
        options: ["Random Players", "Friends Only", "Guild/Clan", "Solo"]
    },
    {
        question: "What's your favorite Roblox game feature?",
        options: ["Customization", "Trading", "Building", "Social"]
    },
    {
        question: "How often do you participate in Roblox events?",
        options: ["Never", "Rarely", "Sometimes", "Always"]
    },
    {
        question: "What's your favorite Roblox game type?",
        options: ["Tycoon", "Simulator", "RPG", "FPS"]
    },
    {
        question: "How do you prefer to learn about Roblox updates?",
        options: ["Official Blog", "Social Media", "YouTube", "Friends"]
    },
    {
        question: "What's your favorite Roblox game category?",
        options: ["Popular", "Featured", "Recommended", "New"]
    },
    {
        question: "How often do you play Roblox?",
        options: ["Daily", "Weekly", "Monthly", "Rarely"]
    },
    {
        question: "What's your favorite Roblox game mode?",
        options: ["Story Mode", "Sandbox", "Competitive", "Co-op"]
    },
    {
        question: "How do you prefer to customize your avatar?",
        options: ["Free Items", "Premium Items", "Custom Designs", "Mix of All"]
    },
    {
        question: "What's your favorite Roblox game theme?",
        options: ["Medieval", "Modern", "Futuristic", "Fantasy"]
    },
    {
        question: "How often do you trade items in Roblox?",
        options: ["Never", "Rarely", "Sometimes", "Often"]
    },
    {
        question: "What's your favorite Roblox game feature?",
        options: ["Chat System", "Trading System", "Building Tools", "Avatar Customization"]
    },
    {
        question: "How do you prefer to play Roblox games?",
        options: ["Quick Sessions", "Long Sessions", "Mixed", "Depends on Game"]
    },
    {
        question: "What's your favorite Roblox game category?",
        options: ["Action", "Adventure", "Simulation", "Strategy"]
    },
    {
        question: "How often do you visit Roblox forums/communities?",
        options: ["Never", "Rarely", "Sometimes", "Often"]
    },
    {
        question: "What's your favorite Roblox game type?",
        options: ["Tycoon", "Simulator", "RPG", "FPS"]
    },
    {
        question: "How do you prefer to spend time in Roblox?",
        options: ["Playing Games", "Socializing", "Building", "Trading"]
    },
    {
        question: "What's your favorite Roblox game feature?",
        options: ["Customization", "Trading", "Building", "Social"]
    },
    {
        question: "How often do you participate in Roblox events?",
        options: ["Never", "Rarely", "Sometimes", "Always"]
    },
    {
        question: "What's your favorite Roblox game type?",
        options: ["Tycoon", "Simulator", "RPG", "FPS"]
    },
    {
        question: "How do you prefer to learn about Roblox updates?",
        options: ["Official Blog", "Social Media", "YouTube", "Friends"]
    },
    {
        question: "What's your favorite Roblox game category?",
        options: ["Popular", "Featured", "Recommended", "New"]
    },
    {
        question: "How often do you play Roblox?",
        options: ["Daily", "Weekly", "Monthly", "Rarely"]
    },
    {
        question: "What's your favorite Roblox game mode?",
        options: ["Story Mode", "Sandbox", "Competitive", "Co-op"]
    },
    {
        question: "How do you prefer to customize your avatar?",
        options: ["Free Items", "Premium Items", "Custom Designs", "Mix of All"]
    },
    {
        question: "What's your favorite Roblox game theme?",
        options: ["Medieval", "Modern", "Futuristic", "Fantasy"]
    },
    {
        question: "How often do you trade items in Roblox?",
        options: ["Never", "Rarely", "Sometimes", "Often"]
    },
    {
        question: "What's your favorite Roblox game feature?",
        options: ["Chat System", "Trading System", "Building Tools", "Avatar Customization"]
    },
    {
        question: "How do you prefer to play Roblox games?",
        options: ["Quick Sessions", "Long Sessions", "Mixed", "Depends on Game"]
    },
    {
        question: "What's your favorite Roblox game category?",
        options: ["Action", "Adventure", "Simulation", "Strategy"]
    },
    {
        question: "How often do you visit Roblox forums/communities?",
        options: ["Never", "Rarely", "Sometimes", "Often"]
    },
    {
        question: "What's your favorite Roblox game type?",
        options: ["Tycoon", "Simulator", "RPG", "FPS"]
    },
    {
        question: "How do you prefer to spend time in Roblox?",
        options: ["Playing Games", "Socializing", "Building", "Trading"]
    },
    {
        question: "What's your favorite Roblox game feature?",
        options: ["Customization", "Trading", "Building", "Social"]
    },
    {
        question: "How often do you participate in Roblox events?",
        options: ["Never", "Rarely", "Sometimes", "Always"]
    },
    {
        question: "What's your favorite Roblox game type?",
        options: ["Tycoon", "Simulator", "RPG", "FPS"]
    },
    {
        question: "How do you prefer to learn about Roblox updates?",
        options: ["Official Blog", "Social Media", "YouTube", "Friends"]
    },
    {
        question: "What's your favorite Roblox game category?",
        options: ["Popular", "Featured", "Recommended", "New"]
    },
    {
        question: "How often do you play Roblox?",
        options: ["Daily", "Weekly", "Monthly", "Rarely"]
    },
    {
        question: "What's your favorite Roblox game mode?",
        options: ["Story Mode", "Sandbox", "Competitive", "Co-op"]
    },
    {
        question: "How do you prefer to customize your avatar?",
        options: ["Free Items", "Premium Items", "Custom Designs", "Mix of All"]
    },
    {
        question: "What's your favorite Roblox game theme?",
        options: ["Medieval", "Modern", "Futuristic", "Fantasy"]
    },
    {
        question: "How often do you trade items in Roblox?",
        options: ["Never", "Rarely", "Sometimes", "Often"]
    },
    {
        question: "What's your favorite Roblox game feature?",
        options: ["Chat System", "Trading System", "Building Tools", "Avatar Customization"]
    },
    {
        question: "How do you prefer to play Roblox games?",
        options: ["Quick Sessions", "Long Sessions", "Mixed", "Depends on Game"]
    },
    {
        question: "What's your favorite Roblox game category?",
        options: ["Action", "Adventure", "Simulation", "Strategy"]
    },
    {
        question: "How often do you visit Roblox forums/communities?",
        options: ["Never", "Rarely", "Sometimes", "Often"]
    },
    {
        question: "What's your favorite Roblox game type?",
        options: ["Tycoon", "Simulator", "RPG", "FPS"]
    },
    {
        question: "How do you prefer to spend time in Roblox?",
        options: ["Playing Games", "Socializing", "Building", "Trading"]
    }
];

// Community state variables
let currentUserNickname = localStorage.getItem('userNickname') || '';
let currentQuoteIndex = 0;
let currentPollIndex = 0;
let currentQuizIndex = 0;
let quizScore = 0;
let pollVotes = JSON.parse(localStorage.getItem('pollVotes')) || {};

// Initialize community features
function initializeCommunityFeatures() {
    if (currentUserNickname) {
        showCommunityFeatures();
    } else {
        // Add lock functionality to community cards
        addLockToCommunityCards();
    }
    loadDailyQuote();
    startPollTimer();
}

// Add lock functionality to community cards
function addLockToCommunityCards() {
    const communityCards = document.querySelectorAll('.community-card');
    
    communityCards.forEach(card => {
        // Add lock overlay
        const lockOverlay = document.createElement('div');
        lockOverlay.className = 'card-lock-overlay';
        lockOverlay.innerHTML = `
            <div class="lock-content">
                <div class="lock-icon">🔒</div>
                <p>Enter a nickname first</p>
            </div>
        `;
        
        // Add click handler
        lockOverlay.addEventListener('click', function() {
            showNotification('Please enter a nickname to unlock community features!', 'error');
            // Scroll to nickname setup
            const nicknameSetup = document.getElementById('nicknameSetup');
            if (nicknameSetup) {
                nicknameSetup.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        card.appendChild(lockOverlay);
        
        // Disable all interactive elements
        const interactiveElements = card.querySelectorAll('button, input, a');
        interactiveElements.forEach(element => {
            element.style.pointerEvents = 'none';
            element.style.opacity = '0.5';
        });
    });
}

// Set user nickname
function setNickname() {
    const nicknameInput = document.getElementById('userNickname');
    const nickname = nicknameInput.value.trim();
    
    if (nickname.length < 2) {
        showNotification('Please enter a nickname (at least 2 characters)', 'error');
        return;
    }
    
    currentUserNickname = nickname;
    localStorage.setItem('userNickname', nickname);
    showCommunityFeatures();
    showNotification(`Welcome, ${nickname}! Community features unlocked! 🎉`, 'success');
    
    // Clear input
    nicknameInput.value = '';
}

// Show community features after nickname is set
function showCommunityFeatures() {
    const nicknameSetup = document.getElementById('nicknameSetup');
    const communityFeatures = document.getElementById('communityFeatures');
    const userNicknameDisplay = document.getElementById('userNicknameDisplay');
    
    if (nicknameSetup && communityFeatures) {
        nicknameSetup.style.display = 'none';
        communityFeatures.style.display = 'block';
        
        // Update welcome message
        if (userNicknameDisplay) {
            userNicknameDisplay.textContent = currentUserNickname;
        }
        
        // Remove lock overlays
        removeLockOverlays();
        
        // Initialize all community features
        loadDailyQuote();
        loadCurrentPoll();
        loadCurrentQuiz();
        updateStats();
        initializeGameAssistant();
    }
}

// Remove lock overlays from community cards
function removeLockOverlays() {
    const lockOverlays = document.querySelectorAll('.card-lock-overlay');
    lockOverlays.forEach(overlay => {
        overlay.remove();
    });
    
    // Re-enable all interactive elements
    const interactiveElements = document.querySelectorAll('.community-card button, .community-card input, .community-card a');
    interactiveElements.forEach(element => {
        element.style.pointerEvents = 'auto';
        element.style.opacity = '1';
    });
}

// Load and display daily quote
function loadDailyQuote() {
    const quoteElement = document.getElementById('dailyQuote');
    const authorElement = document.getElementById('quoteAuthor');
    const quoteDateElement = document.getElementById('quoteDate');
    
    if (!quoteElement || !authorElement) return;
    
    // Get current time in US Central Time
    const now = new Date();
    const centralTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
    
    // Calculate days since epoch in Central Time (changes at 12 AM Central)
    const centralEpoch = new Date(centralTime.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((centralTime - centralEpoch) / (1000 * 60 * 60 * 24));
    
    // Use day of year to determine quote index
    currentQuoteIndex = dayOfYear % motivationalQuotes.length;
    
    const quote = motivationalQuotes[currentQuoteIndex];
    quoteElement.textContent = quote.text;
    authorElement.textContent = `- ${quote.author}`;
    
    // Update date display with Central Time
    if (quoteDateElement) {
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'America/Chicago'
        };
        quoteDateElement.textContent = `Quote for ${centralTime.toLocaleDateString('en-US', dateOptions)} (Central Time)`;
    }
    
    // Schedule next quote update at 12 AM Central Time
    scheduleNextQuoteUpdate();
}

// Schedule next quote update at 12 AM Central Time
function scheduleNextQuoteUpdate() {
    const now = new Date();
    const centralTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
    
    // Calculate time until next 12 AM Central
    const nextMidnight = new Date(centralTime);
    nextMidnight.setHours(24, 0, 0, 0); // Next day at 12 AM
    
    const timeUntilMidnight = nextMidnight.getTime() - centralTime.getTime();
    
    // Schedule the update
    setTimeout(() => {
        loadDailyQuote();
        // Schedule the next update (24 hours later)
        setInterval(loadDailyQuote, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
    
    // Also set up a fallback check every hour to ensure the quote is current
    setInterval(() => {
        const currentCentralTime = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Chicago"}));
        const currentDayOfYear = Math.floor((currentCentralTime - new Date(currentCentralTime.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const expectedQuoteIndex = currentDayOfYear % motivationalQuotes.length;
        
        if (currentQuoteIndex !== expectedQuoteIndex) {
            loadDailyQuote();
        }
    }, 60 * 60 * 1000); // Check every hour
}

// Refresh quote (for manual refresh)
function refreshQuote() {
    currentQuoteIndex = (currentQuoteIndex + 1) % motivationalQuotes.length;
    const quote = motivationalQuotes[currentQuoteIndex];
    
    const quoteElement = document.getElementById('dailyQuote');
    const authorElement = document.getElementById('quoteAuthor');
    
    if (quoteElement && authorElement) {
        quoteElement.textContent = quote.text;
        authorElement.textContent = `- ${quote.author}`;
    }
    
    showNotification('Quote refreshed!', 'success');
}

// Start poll timer
function startPollTimer() {
    const pollTimer = document.getElementById('pollTimer');
    const pollCountdown = document.getElementById('pollCountdown');
    
    if (!pollTimer || !pollCountdown) return;
    
    // Get last poll change time from localStorage
    const lastPollChange = localStorage.getItem('lastPollChange') || Date.now();
    const pollDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const nextPollTime = parseInt(lastPollChange) + pollDuration;
    
    function updateTimer() {
        const now = Date.now();
        const timeLeft = nextPollTime - now;
        
        if (timeLeft <= 0) {
            // Time to change poll
            changePoll();
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        pollCountdown.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Change poll question
function changePoll() {
    currentPollIndex = (currentPollIndex + 1) % pollQuestions.length;
    localStorage.setItem('lastPollChange', Date.now());
    localStorage.setItem('currentPollIndex', currentPollIndex);
    loadCurrentPoll();
    showNotification('New poll is live!', 'info');
}

// Load current poll
function loadCurrentPoll() {
    const pollQuestion = document.getElementById('pollQuestion');
    const pollOptions = document.getElementById('pollOptions');
    const pollResults = document.getElementById('pollResults');
    const pollDateElement = document.getElementById('pollDate');
    
    if (!pollQuestion || !pollOptions) return;
    
    // Get poll based on current date for consistency (changes at midnight)
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    currentPollIndex = dayOfYear % pollQuestions.length;
    
    const poll = pollQuestions[currentPollIndex];
    pollQuestion.textContent = poll.question;
    
    // Clear previous options
    pollOptions.innerHTML = '';
    
    // Add new options
    poll.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'poll-option';
        button.textContent = option;
        button.onclick = () => votePoll(index);
        pollOptions.appendChild(button);
    });
    
    // Hide results initially
    if (pollResults) {
        pollResults.style.display = 'none';
    }
    
    // Update date display
    if (pollDateElement) {
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        pollDateElement.textContent = `Poll for ${today.toLocaleDateString('en-US', dateOptions)}`;
    }
}

// Vote in poll
function votePoll(optionIndex) {
    const pollKey = `poll_${currentPollIndex}`;
    
    // Check if user already voted
    if (pollVotes[pollKey]) {
        showNotification('You have already voted in this poll!', 'error');
        return;
    }
    
    // Record vote
    pollVotes[pollKey] = optionIndex;
    localStorage.setItem('pollVotes', JSON.stringify(pollVotes));
    
    // Show results
    showPollResults();
    showNotification('Vote recorded!', 'success');
}

// Show poll results
function showPollResults() {
    const pollOptions = document.getElementById('pollOptions');
    const pollResults = document.getElementById('pollResults');
    
    if (!pollOptions || !pollResults) return;
    
    // Hide options, show results
    pollOptions.style.display = 'none';
    pollResults.style.display = 'block';
    
    // Calculate results
    const poll = pollQuestions[currentPollIndex];
    const totalVotes = poll.options.length; // Simplified for demo
    const votes = {};
    
    // Count votes (simplified - in real app this would come from server)
    poll.options.forEach((_, index) => {
        votes[index] = Math.floor(Math.random() * 20) + 5; // Random votes for demo
    });
    
    // Update result bars
    const resultBars = pollResults.querySelectorAll('.result-bar');
    resultBars.forEach((bar, index) => {
        const voteCount = votes[index] || 0;
        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
        
        const progressFill = bar.querySelector('.progress-fill');
        const voteCountElement = bar.querySelector('.vote-count');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (voteCountElement) voteCountElement.textContent = voteCount;
    });
}

// Start quiz
function startQuiz() {
    currentQuizIndex = 0;
    quizScore = 0;
    loadQuizQuestion();
    
    const startBtn = document.getElementById('startQuizBtn');
    const nextBtn = document.getElementById('nextQuizBtn');
    
    if (startBtn) startBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
}

// Load quiz question
function loadQuizQuestion() {
    const currentQuestion = document.getElementById('currentQuestion');
    const quizOptions = document.getElementById('quizOptions');
    const quizScore = document.getElementById('quizScore');
    
    if (!currentQuestion || !quizOptions || currentQuizIndex >= quizQuestions.length) {
        endQuiz();
        return;
    }
    
    const question = quizQuestions[currentQuizIndex];
    currentQuestion.textContent = question.question;
    
    // Clear previous options
    quizOptions.innerHTML = '';
    
    // Add new options
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'quiz-option';
        button.textContent = option;
        button.onclick = () => answerQuiz(index);
        quizOptions.appendChild(button);
    });
    
    // Update score display
    if (quizScore) {
        quizScore.textContent = `Score: ${quizScore}/${quizQuestions.length}`;
    }
}

// Answer quiz question
function answerQuiz(selectedIndex) {
    const question = quizQuestions[currentQuizIndex];
    const quizOptions = document.getElementById('quizOptions');
    const nextBtn = document.getElementById('nextQuizBtn');
    
    if (!quizOptions) return;
    
    // Disable all options
    const options = quizOptions.querySelectorAll('.quiz-option');
    options.forEach((option, index) => {
        option.disabled = true;
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex && index !== question.correct) {
            option.classList.add('incorrect');
        }
    });
    
    // Check if answer is correct
    if (selectedIndex === question.correct) {
        quizScore++;
        showNotification('Correct!', 'success');
    } else {
        showNotification('Incorrect!', 'error');
    }
    
    // Show next button
    if (nextBtn) nextBtn.style.display = 'block';
}

// Next quiz question
function nextQuizQuestion() {
    currentQuizIndex++;
    loadQuizQuestion();
    
    const nextBtn = document.getElementById('nextQuizBtn');
    if (nextBtn) nextBtn.style.display = 'none';
}

// End quiz
function endQuiz() {
    const currentQuestion = document.getElementById('currentQuestion');
    const quizOptions = document.getElementById('quizOptions');
    const startBtn = document.getElementById('startQuizBtn');
    const nextBtn = document.getElementById('nextQuizBtn');
    
    if (currentQuestion) currentQuestion.textContent = `Quiz completed! Your score: ${quizScore}/${quizQuestions.length}`;
    if (quizOptions) quizOptions.innerHTML = '';
    if (startBtn) startBtn.style.display = 'block';
    if (nextBtn) nextBtn.style.display = 'none';
    
    const percentage = (quizScore / quizQuestions.length) * 100;
    let message = '';
    
    if (percentage >= 80) {
        message = 'Excellent! You\'re a Roblox expert!';
    } else if (percentage >= 60) {
        message = 'Good job! You know your Roblox!';
    } else {
        message = 'Keep learning! You\'ll get better!';
    }
    
    showNotification(message, 'success');
}

// Load current quiz (daily rotation)
function loadCurrentQuiz() {
    const quizDateElement = document.getElementById('quizDate');
    
    if (quizDateElement) {
        const today = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        quizDateElement.textContent = `Quiz for ${today.toLocaleDateString('en-US', dateOptions)}`;
    }
}

// Update community stats
function updateStats() {
    const totalUsersElement = document.getElementById('totalUsers');
    const totalVotesElement = document.getElementById('totalVotes');
    const totalQuizzesElement = document.getElementById('totalQuizzes');
    const avgScoreElement = document.getElementById('avgScore');
    
    if (totalUsersElement) {
        // Simulate live stats with some randomness
        const baseUsers = 1247;
        const randomChange = Math.floor(Math.random() * 50) - 25;
        totalUsersElement.textContent = (baseUsers + randomChange).toLocaleString();
    }
    
    if (totalVotesElement) {
        const baseVotes = 8934;
        const randomChange = Math.floor(Math.random() * 200) - 100;
        totalVotesElement.textContent = (baseVotes + randomChange).toLocaleString();
    }
    
    if (totalQuizzesElement) {
        const baseQuizzes = 2156;
        const randomChange = Math.floor(Math.random() * 100) - 50;
        totalQuizzesElement.textContent = (baseQuizzes + randomChange).toLocaleString();
    }
    
    if (avgScoreElement) {
        const baseScore = 78;
        const randomChange = Math.floor(Math.random() * 10) - 5;
        avgScoreElement.textContent = `${Math.max(0, Math.min(100, baseScore + randomChange))}%`;
    }
}

// Refresh stats
function refreshStats() {
    updateStats();
    showNotification('Stats refreshed!', 'success');
}

// Initialize Game Assistant
function initializeGameAssistant() {
    const assistantMessages = document.getElementById('assistantMessages');
    if (!assistantMessages) return;
    
    // Add initial welcome message
    const initialMessage = { type: 'system', text: 'Hello! I\'m your Game Assistant. Ask me about Roblox codes, gameplay tips, or giveaways!' };
    addAssistantMessage(initialMessage.text, initialMessage.type);
}

// Add assistant message
function addAssistantMessage(text, type = 'assistant') {
    const assistantMessages = document.getElementById('assistantMessages');
    if (!assistantMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `assistant-message ${type}`;
    
    const messageText = document.createElement('span');
    messageText.className = 'message-text';
    messageText.textContent = text;
    
    messageDiv.appendChild(messageText);
    assistantMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

// Game Assistant FAQ database
const gameAssistantFAQs = {
    'how do i get robux': 'You can get Robux by purchasing them from the Roblox website, earning them through Premium payouts, or trading items. You can also earn small amounts through various games and activities.',
    'what are the best roblox games right now': 'Popular games include Blox Fruits, ASTDX, Goalbound, Rivals, Fruit Battlegrounds, and many more! Check our game gallery for the latest trending games and their codes.',
    'how do i redeem codes': 'To redeem codes, go to the game\'s official website or social media, find the codes section, and enter them in the game. Most games have a codes button in the main menu.',
    'what\'s the latest update in astdx': 'ASTDX regularly updates with new features, balance changes, and bug fixes. Check the official ASTDX Discord or social media for the most recent update information.',
    'how do i join a private server': 'To join a private server, you need a private server link from the server owner. Click the link or enter the server code in the game\'s private server section.',
    'what\'s the best way to level up fast': 'Focus on completing quests, participating in events, and using XP boosters when available. Different games have different strategies, so check our guides for specific tips!',
    'how do i enter the giveaway': 'To enter our giveaway, scroll down to the giveaway section and follow the entry instructions. Usually involves subscribing to our social media and leaving a comment.',
    'is reverscodes safe': 'Yes! ReversCodes is completely safe. We only provide legitimate game codes and information. We never ask for personal information or passwords.',
    'how often are codes updated': 'We update codes as soon as new ones are released by the games. Popular games like Blox Fruits and ASTDX get new codes regularly, so check back often!',
    'roblox codes': 'We have codes for many popular Roblox games! Check our game gallery for the latest codes for games like Blox Fruits, ASTDX, Goalbound, and more.',
    'gameplay tips': 'For gameplay tips, check our guides section! We have detailed guides for popular games with strategies, tips, and tricks to help you improve.',
    'giveaway': 'We regularly host giveaways for Robux and other prizes! Check the giveaway section on our homepage for current opportunities.',
    'private server': 'Private servers allow you to play with friends in a controlled environment. You need a private server link or code to join one.',
    'xp boost': 'XP boosts help you level up faster in games. They\'re usually available through codes, events, or in-game purchases.',
    'roblox premium': 'Roblox Premium gives you monthly Robux, trading abilities, and other exclusive features. It\'s available through the Roblox website.',
    'game updates': 'Games regularly update with new content, features, and bug fixes. Follow the official game social media for the latest news.',
    'trading': 'Trading allows you to exchange items with other players. You need Premium to trade in most games.',
    'events': 'Games host special events with exclusive rewards. Keep an eye on game announcements and our site for event information.',
    'codes not working': 'If codes aren\'t working, they might be expired or you might have already used them. Try checking the game\'s official social media for the latest codes.',
    'best games': 'Popular games include Blox Fruits, ASTDX, Goalbound, Rivals, Fruit Battlegrounds, and many more! Each has unique gameplay and features.'
};

// Send assistant message
function sendAssistantMessage() {
    const assistantInput = document.getElementById('assistantInput');
    if (!assistantInput || !assistantInput.value.trim()) return;
    
    const message = assistantInput.value.trim();
    addAssistantMessage(message, 'user');
    
    // Clear input
    assistantInput.value = '';
    
    // Process the message and find a response
    setTimeout(() => {
        const response = processAssistantMessage(message);
        addAssistantMessage(response, 'assistant');
    }, 500 + Math.random() * 1000);
}

// Process assistant message and return appropriate response
function processAssistantMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for exact matches first
    for (const [key, value] of Object.entries(gameAssistantFAQs)) {
        if (lowerMessage.includes(key)) {
            return value;
        }
    }
    
    // Check for partial matches
    if (lowerMessage.includes('robux') || lowerMessage.includes('money')) {
        return gameAssistantFAQs['how do i get robux'];
    }
    if (lowerMessage.includes('best') && lowerMessage.includes('game')) {
        return gameAssistantFAQs['what are the best roblox games right now'];
    }
    if (lowerMessage.includes('redeem') || lowerMessage.includes('code')) {
        return gameAssistantFAQs['how do i redeem codes'];
    }
    if (lowerMessage.includes('update') || lowerMessage.includes('new')) {
        return gameAssistantFAQs['game updates'];
    }
    if (lowerMessage.includes('level') || lowerMessage.includes('xp')) {
        return gameAssistantFAQs['what\'s the best way to level up fast'];
    }
    if (lowerMessage.includes('giveaway') || lowerMessage.includes('win')) {
        return gameAssistantFAQs['how do i enter the giveaway'];
    }
    if (lowerMessage.includes('safe') || lowerMessage.includes('trust')) {
        return gameAssistantFAQs['is reverscodes safe'];
    }
    
    // Default response for unrecognized questions
    return 'Sorry, I don\'t recognize that question yet. Try asking about Roblox codes, gameplay tips, or giveaways! You can also ask about getting Robux, game updates, private servers, or trading.';
}

// Initialize community features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    // Check cooldown status and log it
    if (lastModalShownTime > 0) {
        const timeSinceLastShown = Date.now() - lastModalShownTime;
        const cooldownRemaining = Math.max(0, TEN_MINUTES_MS - timeSinceLastShown);
        const minutesRemaining = Math.ceil(cooldownRemaining / (60 * 1000));
        
        console.log(`Cooldown status: ${minutesRemaining} minutes remaining until next free entry`);
        console.log(`Free entries used: ${freeEntriesUsed}/3`);
    }
    
    // Initialize the main app first
    initializeApp();
    
    // Initialize community features
    initializeCommunityFeatures();
    
    // Add event listener for assistant input (Enter key)
    const assistantInput = document.getElementById('assistantInput');
    if (assistantInput) {
        assistantInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAssistantMessage();
            }
        });
    }
    
    // Add card click animations
    addCardClickAnimations();
    
    // Update stats periodically
    setInterval(updateStats, 30000); // Update every 30 seconds
});

// Add click animations to community cards
function addCardClickAnimations() {
    const communityCards = document.querySelectorAll('.community-card');
    
    communityCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on interactive elements
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'A') {
                return;
            }
            
            // Add click animation
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });
}

// (Client-side auto-updating system removed; updates are now handled server-side by Python)







