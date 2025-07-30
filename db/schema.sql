-- Coaching Application Database Schema
-- MySQL 9 compatible schema

CREATE DATABASE IF NOT EXISTS coaching_app;
USE coaching_app;

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    picture TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    team_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_team_id (team_id)
);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedbacks (
    id VARCHAR(36) PRIMARY KEY,
    content TEXT NOT NULL,
    target_type ENUM('team', 'member') NOT NULL,
    target_id VARCHAR(36) NOT NULL,
    target_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_target (target_type, target_id),
    INDEX idx_created_at (created_at)
);

-- Add Foreign Key Constraints
ALTER TABLE team_members 
ADD CONSTRAINT fk_team_member_team 
FOREIGN KEY (team_id) REFERENCES teams(id) 
ON DELETE SET NULL;

-- Insert sample data for testing
INSERT IGNORE INTO teams (id, name, logo) VALUES 
('sample-team-1', 'Engineering Team', 'https://example.com/engineering-logo.png'),
('sample-team-2', 'Design Team', 'https://example.com/design-logo.png');

INSERT IGNORE INTO team_members (id, name, email, picture, team_id) VALUES 
('sample-member-1', 'John Doe', 'john.doe@example.com', 'https://example.com/john.jpg', 'sample-team-1'),
('sample-member-2', 'Jane Smith', 'jane.smith@example.com', 'https://example.com/jane.jpg', 'sample-team-1'),
('sample-member-3', 'Bob Wilson', 'bob.wilson@example.com', 'https://example.com/bob.jpg', 'sample-team-2');

INSERT IGNORE INTO feedbacks (id, content, target_type, target_id, target_name) VALUES 
('sample-feedback-1', 'Great work on the project delivery!', 'member', 'sample-member-1', 'John Doe'),
('sample-feedback-2', 'Excellent collaboration and communication.', 'team', 'sample-team-1', 'Engineering Team'),
('sample-feedback-3', 'Outstanding design work on the new interface.', 'member', 'sample-member-3', 'Bob Wilson');