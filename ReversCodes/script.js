// ReversCodes Hub - Main JavaScript File

// Global variables
let currentTheme = localStorage.getItem('theme') || 'light';
let comments = JSON.parse(localStorage.getItem('comments')) || [];
let submissions = JSON.parse(localStorage.getItem('submissions')) || [];
let adminAccessAttempts = 0;
let adminPassword = '';
let adminNumber = '';

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const nav = document.querySelector('.nav');
const backToTop = document.getElementById('backToTop');
const notification = document.getElementById('notification');
const notificationText = notification.querySelector('.notification-text');
const notificationClose = notification.querySelector('.notification-close');
const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');
// submissionsList is only used in admin modal, so we'll get it when needed

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Wait for window to fully load before hiding loading screen
window.addEventListener('load', function() {
    // Ensure all resources are loaded before hiding loading screen
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);
});

// Main initialization function
function initializeApp() {
    // Set initial theme
    setTheme(currentTheme);
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load data
    loadComments();
    loadSubmissions();
    
    // Initialize scroll effects
    initializeScrollEffects();
    
    // Initialize lazy loading
    initializeLazyLoading();
    
    // Show welcome notification after loading screen is hidden
    setTimeout(() => {
        showNotification('Welcome to ReversCodes Hub! 🎮', 'success');
    }, 3000);
}

// Initialize all event listeners
function initializeEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Back to top button
    backToTop.addEventListener('click', scrollToTop);
    
    // Notification close
    notificationClose.addEventListener('click', hideNotification);
    
    // Comment form submission
    commentForm.addEventListener('submit', handleCommentSubmit);
    
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
        if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            nav.classList.remove('active');
        }
    });
}

// Theme management
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    // Update theme icon
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    
    // Update theme icon tooltip
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
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
}

// Scroll effects
function initializeScrollEffects() {
    window.addEventListener('scroll', function() {
        // Back to top button visibility
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
        
        // Header background on scroll
        const header = document.getElementById('header');
        if (window.pageYOffset > 50) {
            header.style.background = 'var(--bg-header)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'transparent';
            header.style.backdropFilter = 'none';
        }
        
        // Active navigation link highlighting
        highlightActiveNavLink();
    });
}

// Highlight active navigation link based on scroll position
function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
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
    localStorage.setItem('submissions', JSON.stringify(submissions));
    
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
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address!', 'error');
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
    
    // Create new comment
    const comment = {
        id: Date.now(),
        email: email,
        name: name,
        text: text,
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
    notificationText.textContent = message;
    notification.style.display = 'flex';
    notification.className = `notification show ${type}`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
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
    if (e.key === 'Escape') {
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
    if (hash && (hash === '#astdx-page' || hash === '#goalbound-page' || hash === '#rivals-page')) {
        showGamePage(hash.substring(1));
    }
});

// Export the navigation functions
window.showGamePage = showGamePage;
window.showHub = showHub;
