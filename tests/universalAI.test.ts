import { describe, test, expect, jest } from '@jest/globals';
import * as functions from 'firebase-functions-test';
import { universalAI } from '../examples/universalAI';

const testEnv = functions();

describe('Universal AI Cloud Function', () => {
  
  afterAll(() => {
    testEnv.cleanup();
  });

  test('should reject unauthenticated requests', async () => {
    const wrapped = testEnv.wrap(universalAI);
    
    await expect(wrapped({
      prompt: 'Test prompt'
    }, {
      auth: null
    })).rejects.toThrow('User must be authenticated');
  });

  test('should process authenticated requests', async () => {
    const wrapped = testEnv.wrap(universalAI);
    const mockContext = {
      auth: {
        uid: 'test-user-123',
        token: { role: 'user' }
      }
    };
    
    const result = await wrapped({
      prompt: 'Create a button component',
      projectType: 'webapp'
    }, mockContext);
    
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('model');
    expect(result).toHaveProperty('usage');
  });

  test('should handle fallback when preferred model fails', async () => {
    const wrapped = testEnv.wrap(universalAI);
    
    // Mock Claude failure
    jest.spyOn(console, 'error').mockImplementation();
    
    const result = await wrapped({
      prompt: 'Complex task',
      preferredModel: 'claude'
    }, {
      auth: { uid: 'test-user', token: { role: 'user' } }
    });
    
    expect(result.success).toBe(true);
    // Should fallback to another model
    expect(['gemini', 'openai']).toContain(result.model);
  });

  test('should log AI usage to Firestore', async () => {
    const mockAdd = jest.fn().mockResolvedValue({ id: 'usage-123' });
    jest.mock('firebase-admin', () => ({
      firestore: () => ({
        collection: () => ({ add: mockAdd })
      })
    }));
    
    const wrapped = testEnv.wrap(universalAI);
    
    await wrapped({
      prompt: 'Test logging',
      projectId: 'project-123'
    }, {
      auth: { uid: 'user-123', token: { role: 'user' } }
    });
    
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        projectId: 'project-123'
      })
    );
  });
});