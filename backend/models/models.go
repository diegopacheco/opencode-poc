package models

import (
	"gorm.io/gorm"
	"time"
)

type TeamMember struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" binding:"required"`
	Picture   string    `json:"picture"`
	Email     string    `json:"email" binding:"required,email"`
	TeamID    *string   `json:"team_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Team struct {
	ID        string       `json:"id" gorm:"primaryKey"`
	Name      string       `json:"name" binding:"required"`
	Logo      string       `json:"logo"`
	Members   []TeamMember `json:"members" gorm:"foreignKey:TeamID"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

type Feedback struct {
	ID         string    `json:"id" gorm:"primaryKey"`
	Content    string    `json:"content" binding:"required"`
	TargetType string    `json:"target_type" binding:"required,oneof=team member"`
	TargetID   string    `json:"target_id" binding:"required"`
	TargetName string    `json:"target_name"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&TeamMember{}, &Team{}, &Feedback{})
}
