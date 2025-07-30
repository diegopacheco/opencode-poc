package models

import (
	"testing"
)

func TestTeamMemberModel(t *testing.T) {
	member := TeamMember{
		ID:      "test-id",
		Name:    "John Doe",
		Picture: "https://example.com/pic.jpg",
		Email:   "john@example.com",
		TeamID:  nil,
	}

	if member.ID != "test-id" {
		t.Errorf("Expected ID to be 'test-id', got %s", member.ID)
	}

	if member.Name != "John Doe" {
		t.Errorf("Expected Name to be 'John Doe', got %s", member.Name)
	}

	if member.Email != "john@example.com" {
		t.Errorf("Expected Email to be 'john@example.com', got %s", member.Email)
	}
}

func TestTeamModel(t *testing.T) {
	team := Team{
		ID:   "team-id",
		Name: "Engineering Team",
		Logo: "https://example.com/logo.png",
		Members: []TeamMember{
			{
				ID:    "member-1",
				Name:  "Alice",
				Email: "alice@example.com",
			},
		},
	}

	if team.ID != "team-id" {
		t.Errorf("Expected ID to be 'team-id', got %s", team.ID)
	}

	if team.Name != "Engineering Team" {
		t.Errorf("Expected Name to be 'Engineering Team', got %s", team.Name)
	}

	if len(team.Members) != 1 {
		t.Errorf("Expected 1 member, got %d", len(team.Members))
	}
}

func TestFeedbackModel(t *testing.T) {
	feedback := Feedback{
		ID:         "feedback-id",
		Content:    "Great work on the project!",
		TargetType: "member",
		TargetID:   "member-1",
		TargetName: "Alice",
	}

	if feedback.ID != "feedback-id" {
		t.Errorf("Expected ID to be 'feedback-id', got %s", feedback.ID)
	}

	if feedback.Content != "Great work on the project!" {
		t.Errorf("Expected Content to be 'Great work on the project!', got %s", feedback.Content)
	}

	if feedback.TargetType != "member" {
		t.Errorf("Expected TargetType to be 'member', got %s", feedback.TargetType)
	}
}
