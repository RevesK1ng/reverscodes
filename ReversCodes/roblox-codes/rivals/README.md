# ReversCodes RIVALS Website

A comprehensive website for RIVALS (Roblox FPS) codes, guides, and community features.

## Features

- 🎮 **Active RIVALS Codes** - Real-time code updates with copy functionality
- 📱 **Responsive Design** - Works perfectly on all devices
- 🌙 **Dark/Light Theme** - User preference toggle
- 💬 **Server-Side Comments** - Real-time community comments with moderation
- 🔧 **Admin Panel** - Comment management system
- 📊 **Game Poll** - Interactive voting system
- 🔍 **Smart Search** - Find codes and rewards instantly
- ⚡ **Fast Performance** - Optimized for speed

## Server-Side Comment System

The website features a real-time comment system powered by Netlify Functions and MongoDB.

### Features:
- **Real-time comments** - All users see the same comments
- **Advanced moderation** - Automatic filtering of inappropriate content
- **Reply system** - Nested replies to comments
- **Admin control** - Easy comment management
- **Persistent nicknames** - Users get locked nicknames
- **Fallback support** - Works offline with local storage

### Setup Instructions

#### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database named `reverscodes`
4. Create a collection named `comments`
5. Get your connection string

#### 2. Netlify Environment Variables
In your Netlify dashboard, add these environment variables:
```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/reverscodes?retryWrites=true&w=majority
ADMIN_PASSWORD=reverscodes2025
```

#### 3. Deploy to Netlify
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Deploy automatically

#### 4. Admin Access
- Visit `/admin.html` on your site
- Use password: `reverscodes2025`
- Manage comments easily

## Local Development

### Prerequisites
- Node.js 18+
- Netlify CLI

### Setup
```bash
# Install dependencies
npm install

# Start local development
npm run dev

# Deploy to production
npm run deploy
```

## File Structure

```
├── index.html              # Main website
├── admin.html              # Admin panel
├── privacy.html            # Privacy policy
├── terms.html              # Terms of service
├── style.css               # Main stylesheet
├── script.js               # Main JavaScript
├── package.json            # Dependencies
├── netlify.toml           # Netlify configuration
├── netlify/
│   └── functions/
│       └── comments.js     # Server-side comment API
└── images/                 # Website images
```

## Comment System API

### Endpoints

#### GET /.netlify/functions/comments
Returns all comments
```json
{
  "comments": [
    {
      "id": "1234567890",
      "nickname": "User123",
      "comment": "Great codes!",
      "timestamp": 1640995200000,
      "parentId": null,
      "replies": []
    }
  ]
}
```

#### POST /.netlify/functions/comments
Add a new comment
```json
{
  "nickname": "User123",
  "comment": "Great codes!",
  "parentId": "1234567890"  // Optional, for replies
}
```

#### DELETE /.netlify/functions/comments
Delete a comment (admin only)
```json
{
  "commentId": "1234567890",
  "adminPassword": "reverscodes2025"
}
```

## Content Moderation

The system automatically filters:
- Inappropriate language
- Hate speech and name-calling
- Begging for codes
- Excessive caps (shouting)
- Spam patterns

## Security Features

- **CORS enabled** for cross-origin requests
- **Input validation** on all fields
- **XSS protection** with HTML escaping
- **Admin authentication** for deletions
- **Rate limiting** (can be added)

## Customization

### Changing Admin Password
Update the `ADMIN_PASSWORD` environment variable in Netlify.

### Modifying Moderation Rules
Edit the `moderateContent` function in `netlify/functions/comments.js`.

### Styling
All styles are in `style.css` with organized sections for easy customization.

## Support

For issues or questions:
- Email: reverscodes@reverscodes.com
- Check the admin panel for comment management

## License

© 2025 ReversCodes.com – All rights reserved. 