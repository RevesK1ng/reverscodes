const { MongoClient } = require('mongodb');

// MongoDB connection (we'll use MongoDB Atlas free tier)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@cluster.mongodb.net/reverscodes?retryWrites=true&w=majority';
const DB_NAME = 'reverscodes';
const COLLECTION_NAME = 'comments';

// Admin password for authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'reverscodes2025';

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    switch (event.httpMethod) {
      case 'GET':
        return await getComments(collection, headers);
      
      case 'POST':
        return await addComment(collection, event.body, headers);
      
      case 'DELETE':
        return await deleteComment(collection, event.body, headers);
      
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Get all comments
async function getComments(collection, headers) {
  try {
    const comments = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ comments })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch comments' })
    };
  }
}

// Add a new comment
async function addComment(collection, body, headers) {
  try {
    const { nickname, comment, parentId = null } = JSON.parse(body);

    // Basic validation
    if (!nickname || !comment) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nickname and comment are required' })
      };
    }

    if (nickname.length < 2 || nickname.length > 20) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nickname must be 2-20 characters' })
      };
    }

    if (comment.length < 5 || comment.length > 500) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Comment must be 5-500 characters' })
      };
    }

    // Content moderation
    const moderation = moderateContent(comment);
    if (!moderation.allowed) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: moderation.reason })
      };
    }

    const newComment = {
      id: Date.now().toString(),
      nickname,
      comment,
      timestamp: Date.now(),
      parentId,
      replies: []
    };

    await collection.insertOne(newComment);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ success: true, comment: newComment })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to add comment' })
    };
  }
}

// Delete a comment (admin only)
async function deleteComment(collection, body, headers) {
  try {
    const { commentId, adminPassword } = JSON.parse(body);

    // Verify admin password
    if (adminPassword !== ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const result = await collection.deleteOne({ id: commentId });

    if (result.deletedCount === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Comment not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete comment' })
    };
  }
}

// Content moderation function
function moderateContent(text) {
  const bannedWords = [
    'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'crap', 'piss', 'dick', 'cock', 'pussy',
    'racist', 'racism', 'nazi', 'kkk', 'hate', 'kill', 'death', 'suicide', 'murder',
    'stupid', 'idiot', 'dumb', 'retard', 'moron', 'fool', 'loser', 'noob', 'scrub'
  ];

  const bannedPhrases = [
    'you are', 'you\'re', 'youre', 'you suck', 'you\'re stupid', 'youre stupid',
    'you\'re dumb', 'youre dumb', 'you\'re an idiot', 'youre an idiot',
    'go kill yourself', 'kill yourself', 'kys', 'kys', 'kys',
    'i hate you', 'i hate', 'i hope you die', 'hope you die'
  ];

  const beggingPatterns = [
    /please.*give.*code/i,
    /need.*code/i,
    /want.*code/i,
    /can.*you.*give/i,
    /donate.*to.*me/i,
    /give.*me.*code/i,
    /i.*need.*code/i,
    /please.*donate/i,
    /send.*me.*code/i,
    /share.*code/i
  ];

  const lowerText = text.toLowerCase();

  // Check banned words
  for (const word of bannedWords) {
    if (lowerText.includes(word)) {
      return { allowed: false, reason: 'Inappropriate language detected' };
    }
  }

  // Check banned phrases
  for (const phrase of bannedPhrases) {
    if (lowerText.includes(phrase)) {
      return { allowed: false, reason: 'Name-calling or hate speech detected' };
    }
  }

  // Check begging patterns
  for (const pattern of beggingPatterns) {
    if (pattern.test(lowerText)) {
      return { allowed: false, reason: 'Begging for codes is not allowed' };
    }
  }

  // Check excessive caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.7 && text.length > 10) {
    return { allowed: false, reason: 'Excessive caps (shouting) is not allowed' };
  }

  return { allowed: true };
} 