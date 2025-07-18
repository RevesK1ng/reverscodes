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

// === GAME GALLERY DATA & LOGIC ===

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

// Render the Game Gallery
function renderGameGallery() {
  const gallery = document.getElementById('gamesGallery');
  if (!gallery) return;
  const searchVal = (document.getElementById('gameSearch')?.value || '').toLowerCase();
  const bookmarks = getBookmarkedGames();
  gallery.innerHTML = '';
  gamesData
    .filter(game => game.name.toLowerCase().includes(searchVal))
    .forEach(game => {
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
  // Hide all game pages
  document.querySelectorAll('.game-page').forEach(page => page.style.display = 'none');
  // Show selected game page if exists
  const page = document.getElementById(pageId);
  if (page) {
    page.style.display = 'block';
    page.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // Optionally, hide main content if needed
  // document.querySelector('.main-content').style.display = 'none';
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

// --- Main Page Game Gallery Logic ---
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
    initializeApp();
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
window.hideGeneratingIndicator = function() {
  var el = document.getElementById('generating-indicator');
  if (el) el.style.display = 'none';
};

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
