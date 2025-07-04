import { describe, test, expect } from '@jest/globals';
import * as schema from '../schemas/firestore-schema.json';

describe('Firestore Schema Validation', () => {
  
  test('users collection should have required fields', () => {
    const userFields = schema.collections.users.fields;
    
    expect(userFields).toHaveProperty('uid');
    expect(userFields).toHaveProperty('email');
    expect(userFields).toHaveProperty('role');
    expect(userFields).toHaveProperty('subscription');
    
    // Validate role enum
    expect(userFields.role).toMatch(/admin|user|guest/);
  });

  test('projects collection should support all creative types', () => {
    const projectFields = schema.collections.projects.fields;
    
    expect(projectFields.type).toContain('webapp');
    expect(projectFields.type).toContain('game');
    expect(projectFields.type).toContain('story');
    expect(projectFields.type).toContain('video');
    expect(projectFields.type).toContain('3d');
    expect(projectFields.type).toContain('presentation');
  });

  test('ai_sessions should track model usage', () => {
    const sessionFields = schema.collections.ai_sessions.fields;
    
    expect(sessionFields).toHaveProperty('model');
    expect(sessionFields).toHaveProperty('totalTokens');
    expect(sessionFields.model).toMatch(/claude|gemini|openai/);
  });

  test('templates collection should have rating system', () => {
    const templateFields = schema.collections.templates.fields;
    
    expect(templateFields).toHaveProperty('rating');
    expect(templateFields).toHaveProperty('downloads');
    expect(templateFields.rating).toBe('number');
  });

  test('all collections should have timestamps', () => {
    Object.values(schema.collections).forEach(collection => {
      expect(collection.fields).toHaveProperty('createdAt');
      expect(collection.fields.createdAt).toBe('timestamp');
    });
  });
});