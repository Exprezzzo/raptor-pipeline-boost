// Firebase type definitions for Raptor Suite

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: FirebaseTimestamp;
  lastLogin: FirebaseTimestamp;
  isActive: boolean;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due';
    expiresAt: FirebaseTimestamp;
  };
}

export interface Project {
  id: string;
  name: string;
  type: 'webapp' | 'game' | 'story' | 'video' | '3d' | 'presentation';
  description: string;
  owner: string;
  collaborators: string[];
  createdAt: FirebaseTimestamp;
  lastModified: FirebaseTimestamp;
  aiModels: Array<'claude' | 'gemini' | 'openai'>;
  status: 'draft' | 'active' | 'archived';
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    requireAuth: boolean;
  };
}

export interface AISession {
  sessionId: string;
  userId: string;
  projectId: string;
  model: 'claude' | 'gemini' | 'openai';
  messages: AIMessage[];
  totalTokens: number;
  createdAt: FirebaseTimestamp;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: FirebaseTimestamp;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  config: Record<string, any>;
  downloads: number;
  rating: number;
  createdBy: string;
}

type FirebaseTimestamp = {
  seconds: number;
  nanoseconds: number;
};

// Helper function to convert Firestore timestamp to Date
export function timestampToDate(timestamp: FirebaseTimestamp): Date {
  return new Date(timestamp.seconds * 1000);
}

// Type guards
export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

export function isProjectOwner(project: Project, userId: string): boolean {
  return project.owner === userId;
}

export function isCollaborator(project: Project, userId: string): boolean {
  return project.collaborators.includes(userId);
}

// Enums for better type safety
export enum ProjectType {
  WEBAPP = 'webapp',
  GAME = 'game',
  STORY = 'story',
  VIDEO = 'video',
  THREE_D = '3d',
  PRESENTATION = 'presentation'
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due'
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

export enum AIModel {
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  OPENAI = 'openai'
}