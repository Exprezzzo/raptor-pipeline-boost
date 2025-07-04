# 🔐 Firestore Schema Documentation

This folder contains the complete database structure for Raptor Pipeline Architect.

## Files in this folder:

### 📄 firestore-schema.json
Complete database schema with all collections and field types:
- **users**: User accounts with roles and subscriptions
- **projects**: Creative projects (web apps, games, stories)
- **ai_sessions**: AI conversation tracking
- **templates**: Reusable project templates

### 🔒 firestore.rules
Security rules that control who can read/write data:
- Authentication requirements
- Role-based access control
- Owner and collaborator permissions

### 🔍 firestore.indexes.json
Database indexes for optimized queries:
- Project searches by owner and date
- AI session lookups
- Template browsing by category

## Usage

These files are used by:
1. The Custom GPT for schema awareness
2. Firebase deployment for database setup
3. TypeScript type generation
4. API validation

## Schema Version

Current version: 4.1.2
Last updated: July 2025