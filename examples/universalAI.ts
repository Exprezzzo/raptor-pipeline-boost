import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { AIRouter } from '../lib/ai-router';

// Initialize Firestore
const db = getFirestore();

export const universalAI = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use AI features'
    );
  }

  const { prompt, projectType, preferredModel, projectId } = data;
  
  // Validate input
  if (!prompt || typeof prompt !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Prompt is required and must be a string'
    );
  }

  try {
    // Get user data for role-based routing
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      throw new functions.https.HttpsError(
        'not-found',
        'User profile not found'
      );
    }

    // Initialize AI Router with user context
    const router = new AIRouter({
      userRole: userData.role,
      subscription: userData.subscription.plan
    });
    
    // Route to best AI model
    const response = await router.route({
      prompt,
      projectType,
      preferredModel,
      userId: context.auth.uid,
      context: {
        projectType,
        userRole: userData.role,
        projectId
      }
    });
    
    // Create AI session record
    const sessionData = {
      sessionId: generateSessionId(),
      userId: context.auth.uid,
      projectId: projectId || null,
      model: response.model,
      messages: [
        {
          role: 'user',
          content: prompt,
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: response.content,
          timestamp: new Date()
        }
      ],
      totalTokens: response.usage.totalTokens,
      createdAt: new Date()
    };

    // Save session to Firestore
    await db.collection('ai_sessions').add(sessionData);
    
    // Update user's token usage
    await updateUserTokenUsage(context.auth.uid, response.usage.totalTokens);
    
    return {
      success: true,
      result: response.content,
      model: response.model,
      usage: response.usage,
      sessionId: sessionData.sessionId
    };
    
  } catch (error: any) {
    console.error('AI Router Error:', error);
    
    // Handle specific errors
    if (error.code === 'rate-limit-exceeded') {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'AI rate limit exceeded. Please try again later.'
      );
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'AI processing failed',
      error.message
    );
  }
});

// Helper function to generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to update user token usage
async function updateUserTokenUsage(userId: string, tokens: number): Promise<void> {
  const userRef = db.collection('users').doc(userId);
  
  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const currentUsage = userDoc.data()?.tokenUsage || 0;
    
    transaction.update(userRef, {
      tokenUsage: currentUsage + tokens,
      lastAIUsage: new Date()
    });
  });
}

// Example: List available AI models
export const listAIModels = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  return {
    models: [
      {
        id: 'claude',
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        specialties: ['Code', 'Logic', 'Analysis'],
        available: true
      },
      {
        id: 'gemini',
        name: 'Gemini Pro',
        provider: 'Google',
        specialties: ['Visual', 'Creative', 'Multimodal'],
        available: true
      },
      {
        id: 'openai',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        specialties: ['General', 'Debug', 'Documentation'],
        available: true
      }
    ]
  };
});

// Example: Get AI usage statistics
export const getAIUsageStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const { startDate, endDate } = data;
  
  // Query AI sessions for the user
  let query = db.collection('ai_sessions')
    .where('userId', '==', context.auth.uid)
    .orderBy('createdAt', 'desc')
    .limit(100);

  if (startDate) {
    query = query.where('createdAt', '>=', new Date(startDate));
  }
  
  if (endDate) {
    query = query.where('createdAt', '<=', new Date(endDate));
  }

  const sessions = await query.get();
  
  // Calculate stats
  const stats = {
    totalSessions: sessions.size,
    totalTokens: 0,
    modelUsage: {
      claude: 0,
      gemini: 0,
      openai: 0
    },
    averageTokensPerSession: 0
  };

  sessions.forEach(doc => {
    const data = doc.data();
    stats.totalTokens += data.totalTokens || 0;
    stats.modelUsage[data.model as keyof typeof stats.modelUsage]++;
  });

  if (stats.totalSessions > 0) {
    stats.averageTokensPerSession = Math.round(stats.totalTokens / stats.totalSessions);
  }

  return stats;
});