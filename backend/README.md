# Coaching Backend

A REST API backend for the coaching application built with Go, Gin, and MySQL.

## Features

- Team Member management (CRUD)
- Team management (CRUD) 
- Team assignments
- Feedback system

## Prerequisites

- Go 1.21+
- MySQL 8.0+

## Quick Start

1. Set up MySQL database:
```sql
CREATE DATABASE coaching_app;
```

2. Set environment variable (optional):
```bash
export DB_DSN="root:password@tcp(localhost:3306)/coaching_app?charset=utf8mb4&parseTime=True&loc=Local"
```

3. Build and run:
```bash
./build.sh
./run.sh
```

## API Endpoints

### Team Members
- `POST /api/v1/members` - Create team member
- `GET /api/v1/members` - Get all team members
- `GET /api/v1/members/:id` - Get team member by ID
- `PUT /api/v1/members/:id` - Update team member
- `DELETE /api/v1/members/:id` - Delete team member

### Teams
- `POST /api/v1/teams` - Create team
- `GET /api/v1/teams` - Get all teams
- `GET /api/v1/teams/:id` - Get team by ID
- `PUT /api/v1/teams/:id` - Update team
- `DELETE /api/v1/teams/:id` - Delete team
- `POST /api/v1/teams/assign` - Assign member to team
- `DELETE /api/v1/teams/members/:memberID` - Remove member from team

### Feedback
- `POST /api/v1/feedbacks` - Create feedback
- `GET /api/v1/feedbacks` - Get all feedbacks
- `GET /api/v1/feedbacks/:id` - Get feedback by ID
- `PUT /api/v1/feedbacks/:id` - Update feedback
- `DELETE /api/v1/feedbacks/:id` - Delete feedback

## Health Check

- `GET /health` - Health check endpoint