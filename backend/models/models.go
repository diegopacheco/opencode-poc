package models

import (
	"gorm.io/gorm"
	"time"
)

type TeamMember struct {
	ID        string    `json:"id" gorm:"primaryKey;size:36"`
	Name      string    `json:"name" binding:"required"`
	Picture   string    `json:"picture"`
	Email     string    `json:"email" binding:"required,email" gorm:"size:255;uniqueIndex"`
	TeamID    *string   `json:"team_id" gorm:"size:36;index"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Team struct {
	ID        string       `json:"id" gorm:"primaryKey;size:36"`
	Name      string       `json:"name" binding:"required"`
	Logo      string       `json:"logo"`
	Members   []TeamMember `json:"members" gorm:"foreignKey:TeamID"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

type Feedback struct {
	ID         string    `json:"id" gorm:"primaryKey;size:36"`
	Content    string    `json:"content" binding:"required"`
	TargetType string    `json:"target_type" binding:"required,oneof=team member" gorm:"size:10;index"`
	TargetID   string    `json:"target_id" binding:"required" gorm:"size:36;index"`
	TargetName string    `json:"target_name"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&TeamMember{}, &Team{}, &Feedback{})
}
