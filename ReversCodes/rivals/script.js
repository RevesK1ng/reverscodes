// === ENHANCED CODE DATA STRUCTURE ===
const activeCodes = [
  { code: 'COMMUNITY15', reward: 'x1 Community Wrap (Random Weapon)', expires: '', isNew: true, category: 'wrap' },
  { code: 'COMMUNITY14', reward: 'x1 Community Wrap (Random Weapon)', expires: '', isNew: false, category: 'wrap' },
  { code: 'UPDATE 12 PATCH', reward: '5 Keys (click “Enter Code” in patch notes)', expires: '', isNew: false, category: 'keys' },
  { code: '5B_VISITS_WHATTTTTT', reward: '5B Visits Finisher (All Weapons)', expires: '', isNew: false, category: 'finisher' },
  { code: 'COMMUNITY13', reward: 'x1 Community Wrap', expires: '', isNew: false, category: 'wrap' },
  { code: 'COMMUNITY12', reward: 'x1 Community Wrap', expires: '', isNew: false, category: 'wrap' },
  { code: 'COMMUNITY11', reward: 'x1 Community Wrap', expires: '', isNew: false, category: 'wrap' },
  { code: 'COMMUNITY10', reward: 'x1 Community Wrap', expires: '', isNew: false, category: 'wrap' },
  { code: 'COMMUNITY9', reward: 'x1 Community Wrap', expires: '', isNew: false, category: 'wrap' },
  { code: 'COMMUNITY8', reward: 'x1 Community Wrap', expires: '', isNew: false, category: 'wrap' },
  { code: 'THANKYOU_1BVISITS!', reward: '1B Visits Wrap (All Weapons)', expires: '', isNew: false, category: 'wrap' },
  { code: 'COMMUNITY7', reward: 'x1 Community Wrap', expires: '', isNew: false, category: 'wrap' },
  { code: 'COMMUNITY6', reward: 'x1 Community Wrap', expires: '', isNew: false, category: 'wrap' },
  { code: 'COMMUNITY5', reward: 'x1 Community Weapon Wrap', expires: '', isNew: false, category: 'wrap' },
  { code: 'COMMUNITY4', reward: 'x1 Community Weapon Wrap', expires: '', isNew: false, category: 'wrap' },
  { code: '100MVisits', reward: '100M Visits Charm (All Weapons)', expires: '', isNew: false, category: 'charm' },
  { code: 'BONUS', reward: 'x1 Key', expires: '', isNew: false, category: 'keys' }
];

// === TOAST NOTIFICATION SYSTEM ===
function showToast(message, type = 'success', duration = 3000) {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 100);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// === THEME MANAGEMENT ===
function setupTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  
  if (!themeToggle || !themeIcon) return;

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.classList.toggle('light-theme', savedTheme === 'light');
  themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';

  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    const newTheme = isLight ? 'light' : 'dark';
    
    themeIcon.textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('theme', newTheme);
    
    showToast(`Switched to ${newTheme} theme`, 'info', 2000);
  });
}

// === ENHANCED SEARCH FUNCTIONALITY ===
function setupSearch() {
  const searchInput = document.getElementById('codeSearch');
  const searchSuggestions = document.getElementById('searchSuggestions');
  
  if (!searchInput) return;

  let currentFilter = 'all';
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // Show/hide suggestions
    if (searchTerm.length > 0) {
      showSearchSuggestions(searchTerm);
    } else {
      hideSearchSuggestions();
    }
    
    filterCodes(searchTerm, currentFilter);
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.length > 0) {
      showSearchSuggestions(searchInput.value.toLowerCase());
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchSuggestions?.contains(e.target)) {
      hideSearchSuggestions();
    }
  });

  function showSearchSuggestions(searchTerm) {
    if (!searchSuggestions) return;
    
    const suggestions = [];
    
    // Add matching codes
    activeCodes.forEach(code => {
      if (code.code.toLowerCase().includes(searchTerm) || 
          code.reward.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          text: `${code.code} - ${code.reward}`,
          type: 'code'
        });
      }
    });
    
    // Add search history
    searchHistory.forEach(term => {
      if (term.toLowerCase().includes(searchTerm) && !suggestions.find(s => s.text === term)) {
        suggestions.push({
          text: term,
          type: 'history'
        });
      }
    });
    
    // Limit suggestions
    suggestions.splice(5);
    
    if (suggestions.length > 0) {
      searchSuggestions.innerHTML = suggestions.map(suggestion => 
        `<div class="search-suggestion-item" data-text="${suggestion.text}">
          ${suggestion.text} ${suggestion.type === 'history' ? '🔍' : ''}
        </div>`
      ).join('');
      
      searchSuggestions.style.display = 'block';
      
      // Add click handlers
      searchSuggestions.querySelectorAll('.search-suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          searchInput.value = item.dataset.text;
          hideSearchSuggestions();
          filterCodes(item.dataset.text.toLowerCase(), currentFilter);
          
          // Add to search history
          if (!searchHistory.includes(item.dataset.text)) {
            searchHistory.unshift(item.dataset.text);
            searchHistory.splice(10); // Keep only 10 items
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
          }
        });
      });
    } else {
      hideSearchSuggestions();
    }
  }

  function hideSearchSuggestions() {
    if (searchSuggestions) {
      searchSuggestions.style.display = 'none';
    }
  }

  function filterCodes(searchTerm, category) {
    const codeItems = document.querySelectorAll('.codes-list li');
    let visibleCount = 0;
    
      codeItems.forEach(item => {
    const codeText = item.querySelector('.code').textContent.toLowerCase();
    const rewardText = item.querySelector('.reward-info')?.textContent.toLowerCase() || '';
    const codeCategory = item.dataset.category;
    
    const matchesSearch = codeText.includes(searchTerm) || rewardText.includes(searchTerm);
      const matchesCategory = category === 'all' || codeCategory === category;
      
      if (matchesSearch && matchesCategory) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });
    
    // Show/hide empty state
    const emptyState = document.querySelector('.codes-empty-state');
    if (visibleCount === 0) {
      if (!emptyState) {
        const empty = document.createElement('div');
        empty.className = 'codes-empty-state';
        empty.innerHTML = '<p>No codes found matching your search.</p>';
        document.querySelector('.codes-list').appendChild(empty);
      }
    } else if (emptyState) {
      emptyState.remove();
    }
  }
}

// === CODE CATEGORIES ===
function setupCodeCategories() {
  const categoryButtons = document.querySelectorAll('.category-btn');
  
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.dataset.category;
      const searchTerm = document.getElementById('codeSearch')?.value.toLowerCase() || '';
      
      filterCodesByCategory(searchTerm, category);
    });
  });
}

function filterCodesByCategory(searchTerm, category) {
  const codeItems = document.querySelectorAll('.codes-list li');
  let visibleCount = 0;
  
  codeItems.forEach(item => {
    const codeText = item.querySelector('.code').textContent.toLowerCase();
    const rewardText = item.querySelector('.reward-info')?.textContent.toLowerCase() || '';
    const codeCategory = item.dataset.category;
    
    const matchesSearch = codeText.includes(searchTerm) || rewardText.includes(searchTerm);
    const matchesCategory = category === 'all' || codeCategory === category;
    
    if (matchesSearch && matchesCategory) {
      item.style.display = 'flex';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });
  
  // Show/hide empty state
  const emptyState = document.querySelector('.codes-empty-state');
  if (visibleCount === 0) {
    if (!emptyState) {
      const empty = document.createElement('div');
      empty.className = 'codes-empty-state';
      empty.innerHTML = '<p>No codes found in this category.</p>';
      document.querySelector('.codes-list').appendChild(empty);
    }
  } else if (emptyState) {
    emptyState.remove();
  }
}

// === ENHANCED CODE RENDERING ===
function renderCodes(targetId, codes) {
  const ul = document.getElementById(targetId);
  const loadingElement = document.getElementById('codesLoading');
  
  if (!ul) return;
  
  // Show loading state
  if (loadingElement) {
    loadingElement.style.display = 'flex';
  }
  
  // Simulate loading delay for better UX
  setTimeout(() => {
    ul.innerHTML = ''; // Clear existing codes
    
    codes.forEach(codeData => {
      const li = document.createElement('li');
      li.className = 'code-item';
      li.dataset.category = codeData.category;
      
      const codeSpan = document.createElement('span');
      codeSpan.className = 'code';
      codeSpan.textContent = codeData.code;
      
      const rewardInfo = document.createElement('span');
      rewardInfo.className = 'reward-info';
      rewardInfo.textContent = codeData.reward;
      
      const expiryInfo = document.createElement('span');
      expiryInfo.className = 'expiry-info';
      const daysLeft = getDaysUntilExpiry(codeData.expires);
      expiryInfo.textContent = daysLeft > 0 ? `${daysLeft} days left` : 'Expires soon!';
      expiryInfo.style.color = daysLeft <= 3 ? '#ff6b6b' : '#8b23b8';
      
      // Add favorite button
      const favoriteBtn = document.createElement('button');
      favoriteBtn.className = 'favorite-btn';
      favoriteBtn.innerHTML = '⭐';
      favoriteBtn.title = 'Add to favorites';
      favoriteBtn.addEventListener('click', () => {
        toggleFavorite(codeData.code);
        favoriteBtn.innerHTML = isFavorite(codeData.code) ? '⭐' : '☆';
        showToast(isFavorite(codeData.code) ? 'Added to favorites!' : 'Removed from favorites', 'info');
      });
      
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeData.code)
          .then(() => {
            btn.textContent = 'Copied!';
            btn.style.background = '#4CAF50';
            showToast('Code copied to clipboard!', 'success');
            setTimeout(() => {
              btn.textContent = 'Copy';
              btn.style.background = '#8b23b8';
            }, 1500);
          })
          .catch(() => {
            showToast('Failed to copy code', 'error');
          });
      });

      li.append(favoriteBtn, codeSpan, rewardInfo, expiryInfo, btn);
      ul.appendChild(li);
    });
    
    // Hide loading state
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    // Update favorite buttons
    updateFavoriteButtons();
    
  }, 800); // 800ms loading delay
}

// === FAVORITES SYSTEM ===
function toggleFavorite(code) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const index = favorites.indexOf(code);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(code);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function isFavorite(code) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  return favorites.includes(code);
}

function updateFavoriteButtons() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const codeItem = btn.closest('li');
    const codeSpan = codeItem?.querySelector('.code');
    if (codeSpan) {
      const code = codeSpan.textContent;
      btn.innerHTML = isFavorite(code) ? '⭐' : '☆';
    }
  });
}

// === COPY ALL CODES FEATURE ===
function setupCopyAll() {
  const copyAllBtn = document.getElementById('copyAllCodes');
  if (!copyAllBtn) return;
  
  copyAllBtn.addEventListener('click', () => {
    // Get only visible codes
    const visibleCodes = Array.from(document.querySelectorAll('.codes-list li'))
      .filter(li => li.style.display !== 'none')
      .map(li => li.querySelector('.code').textContent);
    
    if (visibleCodes.length === 0) {
      showToast('No codes to copy!', 'error');
      return;
    }
    
    const codes = visibleCodes.join('\n');
    navigator.clipboard.writeText(codes)
      .then(() => {
        copyAllBtn.textContent = 'All Codes Copied!';
        copyAllBtn.style.background = '#4CAF50';
        showToast(`Copied ${visibleCodes.length} codes to clipboard!`, 'success');
        setTimeout(() => {
          copyAllBtn.textContent = 'Copy All Codes';
          copyAllBtn.style.background = '#8b23b8';
        }, 2000);
      })
      .catch(() => {
        showToast('Failed to copy codes', 'error');
      });
  });
}

// === UTILITY FUNCTIONS ===
function getDaysUntilExpiry(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// === BACK TO TOP BUTTON ===
function setupBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) {
    return;
  }
  
  let ticking = false;
  
  function updateBackToTop() {
    const scrollY = window.scrollY;
    const showThreshold = 300; // Show button after scrolling 300px
    
    if (scrollY > showThreshold) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
    
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateBackToTop);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestTick, { passive: true });
  
  // Smooth scroll to top when clicked
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Show success toast
    showToast('Back to top! 🚀', 'info', 1500);
  });
  

}

// === SCROLL UP NAVIGATION ===
function setupScrollNavigation() {
  const scrollNav = document.getElementById('scrollNav');
  if (!scrollNav) {
    return;
  }
  
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  function updateScrollNav() {
    const currentScrollY = window.scrollY;
    const scrollThreshold = 150; // Minimum scroll before showing nav
    
    // Show nav when scrolling up and past threshold
    if (currentScrollY > scrollThreshold && currentScrollY < lastScrollY) {
      scrollNav.classList.add('show');
    } else {
      scrollNav.classList.remove('show');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateScrollNav);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestTick, { passive: true });
  
  // Add click handlers for smooth scrolling
  scrollNav.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const offset = 100; // Account for fixed nav height
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Hide nav after clicking
        setTimeout(() => {
          scrollNav.classList.remove('show');
        }, 300);
      }
    });
  });
  

}

// === FLOATING SIDEBAR ===
function setupFloatingSidebar() {
  const floatingSidebar = document.getElementById('floatingSidebar');
  
  if (!floatingSidebar) return;
  
  let isSidebarVisible = false;
  
  // Force hide the sidebar initially
  floatingSidebar.style.display = 'none';
  floatingSidebar.style.visibility = 'hidden';
  floatingSidebar.style.left = '-300px';
  
  // Only setup floating sidebar on smaller screens (iPad and below)
  if (window.innerWidth > 1024) {
    return; // Don't setup floating sidebar on desktop
  }
  
  // Show sidebar when scrolling down
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const headerHeight = 100; // Approximate header height
    
    if (scrollY > headerHeight && !isSidebarVisible) {
      floatingSidebar.style.display = 'block';
      floatingSidebar.style.visibility = 'visible';
      setTimeout(() => {
        floatingSidebar.style.left = '0';
        isSidebarVisible = true;
      }, 100);
    } else if (scrollY <= headerHeight && isSidebarVisible) {
      // Auto-hide when scrolling back to top
      floatingSidebar.style.left = '-300px';
      setTimeout(() => {
        floatingSidebar.style.display = 'none';
        floatingSidebar.style.visibility = 'hidden';
        isSidebarVisible = false;
      }, 400);
    }
  });
}

// === LAZY LOADING FOR IMAGES ===
function setupLazyLoading() {
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

// === ENHANCED FADE-IN ANIMATION ===
function setupFadeIn() {
  const faders = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  faders.forEach(el => observer.observe(el));
}

// === SMOOTH SCROLL WITH OFFSET ===
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        const offset = 80; // Account for fixed header
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// === ENHANCED NAVIGATION HIGHLIGHTING ===
function highlightNav() {
  const sections = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('.floating-nav a');
  const opts = {
    rootMargin: '-20% 0% -60% 0%',
    threshold: 0.3
  };

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, opts);

  sections.forEach(section => obs.observe(section));
}

// === SET LAST UPDATED ===
function setLastUpdated() {
  const el = document.getElementById('lastUpdated');
  if (el) {
    const today = new Date();
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    el.textContent = today.toLocaleDateString('en-US', options);
  }
}

// === CLICKABLE ELEMENTS ===
function setupClickableElements() {
  document.querySelectorAll('.clickable').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      location.reload();
    });
  });
}

// === GAME POLL FUNCTIONALITY ===
function setupGamePoll() {
  const pollForm = document.getElementById('gamePollForm');
  const otherInput = document.getElementById('otherInput');
  const otherGameInput = document.getElementById('otherGameInput');
  const pollGameImage = document.getElementById('pollGameImage');
  const removeVoteContainer = document.getElementById('removeVoteContainer');
  const removeVoteBtn = document.getElementById('removeVoteBtn');
  
  if (!pollForm) return;
  
  // Game images mapping
  const gameImages = {
    'ASTDX': 'images/astdxlogo.png',
    'AdoptMe': 'images/Adopt me.png',
    'Bloxburg': 'images/bloxburg.png',
    'Doors': 'images/doors.png',
    'TowerOfHell': 'images/towerofhell.png',
    'MurderMystery': 'images/murdermystery.png',
    'Other': 'images/Othergames.png'
  };
  
  // Check if user has already voted
  function hasVoted() {
    return localStorage.getItem('userVoted') === 'true';
  }
  
  // Mark user as voted
  function markAsVoted() {
    localStorage.setItem('userVoted', 'true');
  }
  
  // Remove user's vote
  function removeVote() {
    localStorage.removeItem('userVoted');
    localStorage.removeItem('userVoteChoice');
    showRemoveVoteButton(false);
    showToast('Vote removed! You can vote again.', 'success');
  }
  
  // Show/hide remove vote button
  function showRemoveVoteButton(show) {
    if (removeVoteContainer) {
      removeVoteContainer.style.display = show ? 'block' : 'none';
    }
  }
  
  // Update percentages next to each option
  function updatePercentages() {
    const votes = JSON.parse(localStorage.getItem('gameVotes') || '{}');
    const total = Object.values(votes).reduce((sum, count) => sum + count, 0);
    
    document.querySelectorAll('.option-percentage').forEach(element => {
      const game = element.dataset.game;
      let count = 0;
      
      if (game === 'Other') {
        // For "Other", count all votes that are not the predefined games
        const predefinedGames = ['ASTDX', 'AdoptMe', 'Bloxburg', 'Doors', 'TowerOfHell', 'MurderMystery'];
        count = Object.entries(votes).reduce((sum, [gameName, gameCount]) => {
          if (!predefinedGames.includes(gameName)) {
            return sum + gameCount;
          }
          return sum;
        }, 0);
      } else {
        count = votes[game] || 0;
      }
      
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      element.textContent = `${percentage}%`;
    });
  }
  
  // Handle radio button changes
  pollForm.addEventListener('change', (e) => {
    if (e.target.name === 'favoriteGame') {
      const selectedGame = e.target.value;
      
      // Show/hide other input
      if (selectedGame === 'Other') {
        otherInput.style.display = 'block';
        otherGameInput.focus();
      } else {
        otherInput.style.display = 'none';
        otherGameInput.value = '';
      }
      
      // Update poll image
      if (gameImages[selectedGame]) {
        pollGameImage.src = gameImages[selectedGame];
        pollGameImage.style.animation = 'fadeIn 0.5s ease';
      }
    }
  });
  
  // Handle form submission
  pollForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check if user has already voted
    if (hasVoted()) {
      showToast('You have already voted! Use the remove button to change your vote.', 'error');
      return;
    }
    
    const selectedGame = pollForm.querySelector('input[name="favoriteGame"]:checked').value;
    const otherGame = otherGameInput.value.trim();
    
    const gameChoice = selectedGame === 'Other' ? otherGame : selectedGame;
    
    if (selectedGame === 'Other' && !otherGame) {
      showToast('Please enter a game name!', 'error');
      return;
    }
    
    // Show success message
    const submitBtn = pollForm.querySelector('.poll-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Thanks for voting!';
    submitBtn.style.background = '#4CAF50';
    
    // Store vote in localStorage
    const votes = JSON.parse(localStorage.getItem('gameVotes') || '{}');
    votes[gameChoice] = (votes[gameChoice] || 0) + 1;
    localStorage.setItem('gameVotes', JSON.stringify(votes));
    
    // Mark user as voted and store their choice
    markAsVoted();
    localStorage.setItem('userVoteChoice', gameChoice);
    
    // Update percentages
    updatePercentages();
    
    // Show remove vote button
    showRemoveVoteButton(true);
    
    showToast(`Vote recorded for ${gameChoice}!`, 'success');
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = '#8b23b8';
    }, 2000);
    
    // Reset form
    setTimeout(() => {
      pollForm.reset();
      otherInput.style.display = 'none';
      pollGameImage.src = gameImages['ASTDX'];
    }, 2500);
  });
  
  // Handle remove vote button
  if (removeVoteBtn) {
    removeVoteBtn.addEventListener('click', () => {
      const userChoice = localStorage.getItem('userVoteChoice');
      if (userChoice) {
        // Remove vote from total
        const votes = JSON.parse(localStorage.getItem('gameVotes') || '{}');
        if (votes[userChoice] > 0) {
          votes[userChoice]--;
          localStorage.setItem('gameVotes', JSON.stringify(votes));
          updatePercentages();
        }
      }
      removeVote();
    });
  }
  
  // Initialize poll state
  function initializePoll() {
    updatePercentages();
    
    // Show remove vote button if user has voted
    if (hasVoted()) {
      showRemoveVoteButton(true);
    }
  }
  
  // Initialize on page load
  initializePoll();
}

// === COMMENT SYSTEM ===
function setupComments() {
  const commentForm = document.getElementById('commentForm');
  const commentInput = document.getElementById('comment');
  const nicknameInput = document.getElementById('nickname');
  const charCount = document.querySelector('.char-count');
  const commentsList = document.getElementById('commentsList');
  
  if (!commentForm) return;
  
  // Load user's persistent nickname
  function loadUserNickname() {
    const savedNickname = localStorage.getItem('userNickname');
    if (savedNickname && nicknameInput) {
      nicknameInput.value = savedNickname;
      nicknameInput.disabled = true;
      nicknameInput.style.opacity = '0.7';
      nicknameInput.title = 'Your nickname is locked. Contact support to change it.';
    }
  }
  
  // Character counter
  if (commentInput && charCount) {
    commentInput.addEventListener('input', (e) => {
      const length = e.target.value.length;
      charCount.textContent = `${length}/500`;
      charCount.style.color = length > 450 ? '#ff6b6b' : '#666';
    });
  }
  
  // Load comments from server
  async function loadComments() {
    try {
      const response = await fetch('/.netlify/functions/comments');
      const data = await response.json();
      
      if (data.comments && commentsList) {
        displayComments(data.comments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      // Fallback to local storage if server is unavailable
      loadCommentsFromLocal();
    }
  }
  
  // Fallback: Load comments from local storage
  function loadCommentsFromLocal() {
    const comments = JSON.parse(localStorage.getItem('siteComments') || '[]');
    displayComments(comments);
  }
  
  // Display comments
  function displayComments(comments) {
    if (commentsList) {
      commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item" data-comment-id="${comment.id}">
          <div class="comment-header">
            <div class="comment-author-info">
              <div class="user-avatar">👤</div>
              <span class="comment-author">${escapeHtml(comment.nickname)}</span>
            </div>
            <span class="comment-date">${new Date(comment.timestamp).toLocaleDateString()}</span>
          </div>
          <div class="comment-content">${escapeHtml(comment.comment)}</div>
          <div class="comment-actions">
            <button class="reply-btn" onclick="showReplyForm('${comment.id}')">Reply</button>
          </div>
          <div class="replies-container" id="replies-${comment.id}">
            ${comment.replies ? comment.replies.map(reply => `
              <div class="reply-item">
                <div class="comment-header">
                  <div class="comment-author-info">
                    <div class="user-avatar">👤</div>
                    <span class="comment-author">${escapeHtml(reply.nickname)}</span>
                  </div>
                  <span class="comment-date">${new Date(reply.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="comment-content">${escapeHtml(reply.comment)}</div>
              </div>
            `).join('') : ''}
          </div>
          <div class="reply-form" id="reply-form-${comment.id}" style="display: none;">
            <textarea placeholder="Write your reply..." maxlength="300" class="reply-textarea"></textarea>
            <div class="reply-actions">
              <button class="reply-submit-btn" onclick="submitReply('${comment.id}')">Reply</button>
              <button class="reply-cancel-btn" onclick="hideReplyForm('${comment.id}')">Cancel</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
  
  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Handle form submission
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Confirmation dialog
    if (!confirm('Are you sure you would like to post this?')) {
      return;
    }

    const nickname = nicknameInput.value.trim();
    const comment = commentInput.value.trim();
    
    if (!nickname || !comment) {
      showToast('Please fill in all fields!', 'error');
      return;
    }
    
    if (nickname.length < 2) {
      showToast('Nickname must be at least 2 characters!', 'error');
      return;
    }
    
    if (comment.length < 5) {
      showToast('Comment must be at least 5 characters!', 'error');
      return;
    }
    
    // Store user's nickname permanently if not already stored
    if (!localStorage.getItem('userNickname')) {
      localStorage.setItem('userNickname', nickname);
      nicknameInput.disabled = true;
      nicknameInput.style.opacity = '0.7';
      nicknameInput.title = 'Your nickname is locked. Contact support to change it.';
    }
    
    try {
      // Send comment to server
      const response = await fetch('/.netlify/functions/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nickname,
          comment
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast('Comment posted successfully!', 'success');
        commentInput.value = '';
        if (charCount) charCount.textContent = '0/500';
        loadComments(); // Refresh comments
      } else {
        showToast(data.error || 'Failed to post comment', 'error');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      showToast('Failed to post comment. Please try again.', 'error');
    }
  });
  
  // Load comments and nickname on page load
  loadComments();
  loadUserNickname();
}

// Global functions for reply system
function showReplyForm(commentId) {
  const replyForm = document.getElementById(`reply-form-${commentId}`);
  if (replyForm) {
    replyForm.style.display = 'block';
    replyForm.querySelector('.reply-textarea').focus();
  }
}

function hideReplyForm(commentId) {
  const replyForm = document.getElementById(`reply-form-${commentId}`);
  if (replyForm) {
    replyForm.style.display = 'none';
    replyForm.querySelector('.reply-textarea').value = '';
  }
}

async function submitReply(commentId) {
  const replyForm = document.getElementById(`reply-form-${commentId}`);
  const replyTextarea = replyForm.querySelector('.reply-textarea');
  const replyText = replyTextarea.value.trim();
  
  if (!replyText) {
    showToast('Please enter a reply!', 'error');
    return;
  }
  
  if (replyText.length < 3) {
    showToast('Reply must be at least 3 characters!', 'error');
    return;
  }
  
  const userNickname = localStorage.getItem('userNickname');
  if (!userNickname) {
    showToast('Please set your nickname first!', 'error');
    return;
  }
  
  try {
    // Send reply to server
    const response = await fetch('/.netlify/functions/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nickname: userNickname,
        comment: replyText,
        parentId: commentId
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Reply posted successfully!', 'success');
      hideReplyForm(commentId);
      setupComments(); // Refresh comments
    } else {
      showToast(data.error || 'Failed to post reply', 'error');
    }
  } catch (error) {
    console.error('Error posting reply:', error);
    showToast('Failed to post reply. Please try again.', 'error');
  }
}

// === SERVICE WORKER FOR OFFLINE ACCESS ===
function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              showToast('New version available! Refresh to update.', 'info', 5000);
            }
          });
        });
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
}

// Function to clear cache and reload
function clearCacheAndReload() {
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          return Promise.all(
            registrations.map(registration => registration.unregister())
          );
        }).then(() => {
          location.reload();
        });
      } else {
        location.reload();
      }
    });
  } else {
    location.reload();
  }
}

// === INITIALIZE EVERYTHING ===
document.addEventListener('DOMContentLoaded', () => {

  
  // Setup theme first
  setupTheme();
  
  // Render codes with loading state
  renderCodes('activeCodesList', activeCodes);
  
  // Setup all features
  setupSearch();
  setupCodeCategories();
  setupCopyAll();
  setupFloatingSidebar();
  setupGamePoll();
  setupComments();
  setupLazyLoading();
  setupFadeIn();
  setupSmoothScroll();
  highlightNav();
  setLastUpdated();
  setupClickableElements();
  setupServiceWorker();
  setupScrollNavigation();
  setupBackToTop();
  
  // Show welcome toast
  setTimeout(() => {
    showToast('Welcome to ReversCodes! 🎮', 'info', 3000);
  }, 1000);

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R or Cmd+Shift+R to clear cache
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      if (confirm('Clear cache and reload? (Ctrl+Shift+R)')) {
        clearCacheAndReload();
      }
    }
    
    // Ctrl+Shift+A or Cmd+Shift+A to go to admin panel
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      window.location.href = '/admin.html';
    }
  });
  

});
