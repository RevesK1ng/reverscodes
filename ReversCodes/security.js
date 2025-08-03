// ReversCodes Hub - Security Configuration
// This file contains security measures to protect the website

// Security Headers Configuration
const securityHeaders = {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Content Security Policy
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://pagead2.googlesyndication.com; frame-src https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self';"
};

// Rate limiting configuration
const rateLimitConfig = {
    maxRequests: 100, // Max requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again later.'
};

// Input sanitization function
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove potentially dangerous characters and scripts
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
}

// CSRF token generation
function generateCSRFToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Validate CSRF token
function validateCSRFToken(token, storedToken) {
    return token === storedToken;
}

// Rate limiting storage
const requestCounts = new Map();

// Rate limiting function
function checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = now - rateLimitConfig.windowMs;
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }
    
    const requests = requestCounts.get(ip);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    requestCounts.set(ip, validRequests);
    
    // Check if limit exceeded
    if (validRequests.length >= rateLimitConfig.maxRequests) {
        return false;
    }
    
    // Add current request
    validRequests.push(now);
    return true;
}

// IP address extraction (for client-side, this is simplified)
function getClientIP() {
    // In a real server environment, this would extract the actual IP
    // For client-side, we'll use a session-based identifier
    return sessionStorage.getItem('clientId') || generateClientId();
}

function generateClientId() {
    const clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    sessionStorage.setItem('clientId', clientId);
    return clientId;
}

// Security monitoring
const securityEvents = [];

function logSecurityEvent(event, details) {
    const securityEvent = {
        timestamp: new Date().toISOString(),
        event: event,
        details: details,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    securityEvents.push(securityEvent);
    
    // Keep only last 100 events
    if (securityEvents.length > 100) {
        securityEvents.shift();
    }
    
    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Security Event:', securityEvent);
    }
}

// Input validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateUsername(username) {
    // Allow alphanumeric characters, underscores, and hyphens, 3-20 characters
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
}

function validateComment(comment) {
    // Check for reasonable length and content
    if (!comment || comment.length < 1 || comment.length > 1000) {
        return false;
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(comment));
}

// Export functions for use in other files
window.SecurityConfig = {
    sanitizeInput,
    generateCSRFToken,
    validateCSRFToken,
    checkRateLimit,
    getClientIP,
    logSecurityEvent,
    validateEmail,
    validateUsername,
    validateComment,
    securityHeaders,
    rateLimitConfig
};

// Initialize security monitoring
document.addEventListener('DOMContentLoaded', function() {
    // Log page load
    SecurityConfig.logSecurityEvent('page_load', {
        referrer: document.referrer,
        timestamp: Date.now()
    });
    
    // Monitor for suspicious activities
    document.addEventListener('click', function(e) {
        // Log clicks on admin-related elements
        if (e.target.closest('[data-admin]') || e.target.closest('.admin')) {
            SecurityConfig.logSecurityEvent('admin_access_attempt', {
                element: e.target.tagName,
                text: e.target.textContent.substring(0, 50)
            });
        }
    });
    
    // Monitor form submissions
    document.addEventListener('submit', function(e) {
        SecurityConfig.logSecurityEvent('form_submission', {
            formId: e.target.id,
            formAction: e.target.action
        });
    });
});

console.log('Security configuration loaded successfully.'); 