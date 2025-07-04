import { describe, test, expect, jest } from '@jest/globals';
import { AIRouter } from '../lib/ai-router';

describe('AI Router Model Selection', () => {
  let router: AIRouter;

  beforeEach(() => {
    router = new AIRouter();
    jest.clearAllMocks();
  });

  test('should route code generation tasks to Claude', async () => {
    const result = await router.selectModel({
      prompt: 'Create a React component for user authentication',
      taskType: 'code_generation'
    });
    
    expect(result.model).toBe('claude');
    expect(result.provider).toBe('anthropic');
  });

  test('should route visual design tasks to Gemini', async () => {
    const result = await router.selectModel({
      prompt: 'Design a 3D landing page with animations',
      taskType: 'visual_design'
    });
    
    expect(result.model).toBe('gemini');
    expect(result.provider).toBe('google');
  });

  test('should route debugging tasks to OpenAI', async () => {
    const result = await router.selectModel({
      prompt: 'Debug this TypeScript error in my code',
      taskType: 'debugging'
    });
    
    expect(result.model).toBe('openai');
    expect(result.provider).toBe('openai');
  });

  test('should fallback through model chain on failure', async () => {
    // Mock Claude failure
    jest.spyOn(router, 'callClaude').mockRejectedValueOnce(new Error('Claude unavailable'));
    
    const result = await router.route({
      prompt: 'Write a complex algorithm',
      preferredModel: 'claude'
    });
    
    // Should fallback to Gemini
    expect(result.model).toBe('gemini');
  });

  test('should respect user model preference when available', async () => {
    const result = await router.route({
      prompt: 'General task',
      preferredModel: 'gemini'
    });
    
    expect(result.model).toBe('gemini');
  });
});