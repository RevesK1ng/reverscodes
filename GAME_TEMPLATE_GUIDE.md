# 🎮 ReversCodes Game Page Template Guide

## Quick Start: Creating a New Game Page

### Step 1: Copy the Template
1. Copy either `astdx.html` or `blox-fruits.html`
2. Rename it to your game (e.g., `shindo-life.html`, `adopt-me.html`)

### Step 2: Update the Head Section
Replace these key elements:

```html
<!-- Title -->
<title>YOUR GAME NAME Codes & Guides | ReversCodes</title>

<!-- Meta Description -->
<meta name="description" content="Discover YOUR GAME codes, learn to redeem them, and find the best strategies." />

<!-- Keywords -->
<meta name="keywords" content="YOUR GAME codes, Roblox, relevant keywords" />

<!-- Canonical URL -->
<link rel="canonical" href="https://reverscodes.com/your-game" />

<!-- Open Graph -->
<meta property="og:title" content="YOUR GAME Codes & Guides | ReversCodes" />
<meta property="og:description" content="Discover YOUR GAME codes, learn to redeem them, and find the best strategies." />
<meta property="og:image" content="https://reverscodes.com/images/your-game.png" />

<!-- Twitter -->
<meta property="twitter:title" content="YOUR GAME Codes & Guides | ReversCodes" />
<meta property="twitter:description" content="Discover YOUR GAME codes, learn to redeem them, and find the best strategies." />
<meta property="twitter:image" content="https://reverscodes.com/images/your-game.png" />

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "YOUR GAME Codes",
  "url": "https://reverscodes.com/your-game",
  "description": "YOUR GAME codes, guides, and tips for Roblox",
  "mainEntity": {
    "@type": "Game",
    "name": "YOUR GAME",
    "description": "Brief description of your game"
  }
}
</script>
```

### Step 3: Update the Hero Background
```html
<div class="hero-background">
  <img src="images/your-game.png" alt="YOUR GAME Background" class="hero-bg-image" />
  <div class="hero-vignette"></div>
</div>
```

### Step 4: Update the Overview Section
```html
<section class="overview fade-in">
  <h2>What is YOUR GAME?</h2>
  <p>Brief description of what the game is about.</p>
  <p>What players can redeem codes for.</p>
</section>
```

### Step 5: Update the Codes Section
Replace the codes list with your game's codes:

```html
<ul id="activeCodesList" class="codes-list">
  <li class="code-item" data-category="category1">
    <span class="code">CODE1</span>
    <span class="reward-info">Reward description</span>
    <button class="copy-btn" data-code="CODE1">Copy</button>
  </li>
  <li class="code-item" data-category="category2">
    <span class="code">CODE2</span>
    <span class="reward-info">Reward description</span>
    <button class="copy-btn" data-code="CODE2">Copy</button>
  </li>
  <!-- Add more codes as needed -->
</ul>
```

### Step 6: Update Code Categories
Change the category buttons to match your game:

```html
<div class="code-categories">
  <button class="category-btn active" data-category="all">All Codes</button>
  <button class="category-btn" data-category="category1">Category 1</button>
  <button class="category-btn" data-category="category2">Category 2</button>
  <!-- Add more categories as needed -->
</div>
```

### Step 7: Update Navigation Links
Update the scroll navigation to match your game's sections:

```html
<ul class="nav-links">
  <li><a href="#active-codes">Active Codes</a></li>
  <li><a href="#expired-codes">Expired Codes</a></li>
  <li><a href="#redeem-section">How to Redeem</a></li>
  <li><a href="#common-issues">Common Issues</a></li>
  <li><a href="#your-section">Your Section</a></li>
  <li><a href="#your-farming">Your Farming</a></li>
</ul>
```

### Step 8: Update Content Sections
Replace the content sections with game-specific information:

```html
<section id="your-section" class="content-box-purple fade-in">
  <h2>🏆 Your Section Title</h2>
  <h3>Subtitle</h3>
  <ul>
    <li>Item 1 — Description</li>
    <li>Item 2 — Description</li>
    <li>Item 3 — Description</li>
  </ul>
</section>
```

### Step 9: Update Related Content
Make sure your game appears in the related content section of other pages, and update the related content on your new page to include other games.

### Step 10: Update the Poll
Change the poll to feature your game:

```html
<div class="poll-image">
  <img src="images/your-game.png" alt="YOUR GAME" id="pollGameImage" />
</div>
```

## 🎯 URL Structure Examples

```
reverscodes.com/astdx              # All Star Tower Defense X
reverscodes.com/blox-fruits        # Blox Fruits
reverscodes.com/shindo-life        # Shindo Life
reverscodes.com/adopt-me           # Adopt Me
reverscodes.com/bloxburg           # Bloxburg
reverscodes.com/doors              # Doors
reverscodes.com/your-game          # Your New Game
```

## 📝 Checklist for New Game Pages

- [ ] Copy template file and rename
- [ ] Update all meta tags and titles
- [ ] Update hero background image
- [ ] Update overview section
- [ ] Add game-specific codes
- [ ] Update code categories
- [ ] Update navigation links
- [ ] Add game-specific content sections
- [ ] Update related content links
- [ ] Update poll section
- [ ] Add game image to images folder
- [ ] Test all links and functionality
- [ ] Update other game pages to include your new game

## 🚀 Quick Copy-Paste Template

Here's a minimal template for quick game creation:

```html
<!-- Replace these placeholders -->
YOUR GAME NAME
your-game
YOUR GAME
your-game.png
Brief description of your game
category1, category2
Your Section, Your Farming
```

## 💡 Pro Tips

1. **Keep the same structure** - This ensures consistency across all pages
2. **Use descriptive categories** - Make them relevant to your game
3. **Update regularly** - Keep codes current and add new ones
4. **Cross-link properly** - Make sure all related content sections are updated
5. **Optimize images** - Use 800x450px images for best results
6. **Test functionality** - Ensure copy buttons and search work properly

## 🎨 Customization Options

You can customize:
- **Colors**: Update CSS variables in `style.css`
- **Fonts**: Change font families in CSS
- **Layout**: Modify the grid structure
- **Animations**: Adjust transition speeds
- **Content**: Add game-specific sections as needed

This template system makes it super easy to create new game pages while maintaining the ReversCodes brand and functionality! 