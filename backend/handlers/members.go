package handlers

import (
	"coaching-backend/database"
	"coaching-backend/models"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"
)

func validateTeamMember(member *models.TeamMember) error {
	if strings.TrimSpace(member.Name) == "" {
		return fmt.Errorf("name is required")
	}
	if len(strings.TrimSpace(member.Name)) < 2 {
		return fmt.Errorf("name must be at least 2 characters")
	}
	if len(strings.TrimSpace(member.Name)) > 50 {
		return fmt.Errorf("name must be less than 50 characters")
	}

	if strings.TrimSpace(member.Email) == "" {
		return fmt.Errorf("email is required")
	}
	emailRegex := regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	if !emailRegex.MatchString(strings.TrimSpace(member.Email)) {
		return fmt.Errorf("invalid email format")
	}

	return nil
}

func CreateTeamMember(c *gin.Context) {
	start := time.Now()
	log.Printf("CreateTeamMember: Request started")

	var member models.TeamMember
	if err := c.ShouldBindJSON(&member); err != nil {
		log.Printf("CreateTeamMember: Invalid JSON - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Please check your input data",
		})
		return
	}

	if err := validateTeamMember(&member); err != nil {
		log.Printf("CreateTeamMember: Validation failed - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	member.ID = uuid.New().String()
	member.Name = strings.TrimSpace(member.Name)
	member.Email = strings.TrimSpace(member.Email)
	member.Picture = strings.TrimSpace(member.Picture)

	if err := database.DB.Create(&member).Error; err != nil {
		log.Printf("CreateTeamMember: Database error - %v", err)
		if strings.Contains(err.Error(), "Duplicate entry") {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "Member already exists",
				"message": "A member with this email already exists",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"message": "Failed to create team member",
			})
		}
		return
	}

	log.Printf("CreateTeamMember: Successfully created member %s in %v", member.ID, time.Since(start))
	c.JSON(http.StatusCreated, member)
}

func GetTeamMembers(c *gin.Context) {
	start := time.Now()
	log.Printf("GetTeamMembers: Request started")

	var members []models.TeamMember
	if err := database.DB.Find(&members).Error; err != nil {
		log.Printf("GetTeamMembers: Database error - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to fetch team members",
		})
		return
	}

	log.Printf("GetTeamMembers: Successfully fetched %d members in %v", len(members), time.Since(start))
	c.JSON(http.StatusOK, members)
}

func GetTeamMember(c *gin.Context) {
	start := time.Now()
	id := c.Param("id")
	log.Printf("GetTeamMember: Request started for ID %s", id)

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Member ID is required",
		})
		return
	}

	var member models.TeamMember
	if err := database.DB.First(&member, "id = ?", id).Error; err != nil {
		log.Printf("GetTeamMember: Member not found - %v", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Member not found",
			"message": "The requested team member does not exist",
		})
		return
	}

	log.Printf("GetTeamMember: Successfully fetched member %s in %v", id, time.Since(start))
	c.JSON(http.StatusOK, member)
}

func UpdateTeamMember(c *gin.Context) {
	start := time.Now()
	id := c.Param("id")
	log.Printf("UpdateTeamMember: Request started for ID %s", id)

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Member ID is required",
		})
		return
	}

	var member models.TeamMember
	if err := database.DB.First(&member, "id = ?", id).Error; err != nil {
		log.Printf("UpdateTeamMember: Member not found - %v", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Member not found",
			"message": "The requested team member does not exist",
		})
		return
	}

	var updateData models.TeamMember
	if err := c.ShouldBindJSON(&updateData); err != nil {
		log.Printf("UpdateTeamMember: Invalid JSON - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Please check your input data",
		})
		return
	}

	if err := validateTeamMember(&updateData); err != nil {
		log.Printf("UpdateTeamMember: Validation failed - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	updateData.Name = strings.TrimSpace(updateData.Name)
	updateData.Email = strings.TrimSpace(updateData.Email)
	updateData.Picture = strings.TrimSpace(updateData.Picture)

	if err := database.DB.Model(&member).Updates(updateData).Error; err != nil {
		log.Printf("UpdateTeamMember: Database error - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to update team member",
		})
		return
	}

	log.Printf("UpdateTeamMember: Successfully updated member %s in %v", id, time.Since(start))
	c.JSON(http.StatusOK, member)
}

func DeleteTeamMember(c *gin.Context) {
	start := time.Now()
	id := c.Param("id")
	log.Printf("DeleteTeamMember: Request started for ID %s", id)

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Member ID is required",
		})
		return
	}

	result := database.DB.Delete(&models.TeamMember{}, "id = ?", id)
	if result.Error != nil {
		log.Printf("DeleteTeamMember: Database error - %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to delete team member",
		})
		return
	}

	if result.RowsAffected == 0 {
		log.Printf("DeleteTeamMember: Member not found")
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Member not found",
			"message": "The requested team member does not exist",
		})
		return
	}

	log.Printf("DeleteTeamMember: Successfully deleted member %s in %v", id, time.Since(start))
	c.JSON(http.StatusOK, gin.H{"message": "Team member deleted successfully"})
}
