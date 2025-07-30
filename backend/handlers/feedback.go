package handlers

import (
	"coaching-backend/database"
	"coaching-backend/models"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"log"
	"net/http"
	"strings"
	"time"
)

func validateFeedback(feedback *models.Feedback) error {
	if strings.TrimSpace(feedback.Content) == "" {
		return fmt.Errorf("feedback content is required")
	}
	if len(strings.TrimSpace(feedback.Content)) < 5 {
		return fmt.Errorf("feedback must be at least 5 characters")
	}
	if len(strings.TrimSpace(feedback.Content)) > 1000 {
		return fmt.Errorf("feedback must be less than 1000 characters")
	}
	if feedback.TargetType != "team" && feedback.TargetType != "member" {
		return fmt.Errorf("target type must be either 'team' or 'member'")
	}
	if strings.TrimSpace(feedback.TargetID) == "" {
		return fmt.Errorf("target ID is required")
	}
	return nil
}

func CreateFeedback(c *gin.Context) {
	start := time.Now()
	log.Printf("CreateFeedback: Request started")

	var feedback models.Feedback
	if err := c.ShouldBindJSON(&feedback); err != nil {
		log.Printf("CreateFeedback: Invalid JSON - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Please check your input data",
		})
		return
	}

	if err := validateFeedback(&feedback); err != nil {
		log.Printf("CreateFeedback: Validation failed - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	if feedback.TargetType == "team" {
		var team models.Team
		if err := database.DB.First(&team, "id = ?", feedback.TargetID).Error; err != nil {
			log.Printf("CreateFeedback: Team not found - %v", err)
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Team not found",
				"message": "The target team does not exist",
			})
			return
		}
		feedback.TargetName = team.Name
	} else if feedback.TargetType == "member" {
		var member models.TeamMember
		if err := database.DB.First(&member, "id = ?", feedback.TargetID).Error; err != nil {
			log.Printf("CreateFeedback: Member not found - %v", err)
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Member not found",
				"message": "The target team member does not exist",
			})
			return
		}
		feedback.TargetName = member.Name
	}

	feedback.ID = uuid.New().String()
	feedback.Content = strings.TrimSpace(feedback.Content)

	if err := database.DB.Create(&feedback).Error; err != nil {
		log.Printf("CreateFeedback: Database error - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to create feedback",
		})
		return
	}

	log.Printf("CreateFeedback: Successfully created feedback %s in %v", feedback.ID, time.Since(start))
	c.JSON(http.StatusCreated, feedback)
}

func GetFeedbacks(c *gin.Context) {
	start := time.Now()
	log.Printf("GetFeedbacks: Request started")

	var feedbacks []models.Feedback

	targetType := c.Query("target_type")
	targetID := c.Query("target_id")

	query := database.DB
	if targetType != "" {
		if targetType != "team" && targetType != "member" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid parameter",
				"message": "target_type must be either 'team' or 'member'",
			})
			return
		}
		query = query.Where("target_type = ?", targetType)
	}
	if targetID != "" {
		query = query.Where("target_id = ?", targetID)
	}

	if err := query.Order("created_at DESC").Find(&feedbacks).Error; err != nil {
		log.Printf("GetFeedbacks: Database error - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to fetch feedbacks",
		})
		return
	}

	log.Printf("GetFeedbacks: Successfully fetched %d feedbacks in %v", len(feedbacks), time.Since(start))
	c.JSON(http.StatusOK, feedbacks)
}

func GetFeedback(c *gin.Context) {
	start := time.Now()
	id := c.Param("id")
	log.Printf("GetFeedback: Request started for ID %s", id)

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Feedback ID is required",
		})
		return
	}

	var feedback models.Feedback
	if err := database.DB.First(&feedback, "id = ?", id).Error; err != nil {
		log.Printf("GetFeedback: Feedback not found - %v", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Feedback not found",
			"message": "The requested feedback does not exist",
		})
		return
	}

	log.Printf("GetFeedback: Successfully fetched feedback %s in %v", id, time.Since(start))
	c.JSON(http.StatusOK, feedback)
}

func UpdateFeedback(c *gin.Context) {
	start := time.Now()
	id := c.Param("id")
	log.Printf("UpdateFeedback: Request started for ID %s", id)

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Feedback ID is required",
		})
		return
	}

	var feedback models.Feedback
	if err := database.DB.First(&feedback, "id = ?", id).Error; err != nil {
		log.Printf("UpdateFeedback: Feedback not found - %v", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Feedback not found",
			"message": "The requested feedback does not exist",
		})
		return
	}

	var updateData models.Feedback
	if err := c.ShouldBindJSON(&updateData); err != nil {
		log.Printf("UpdateFeedback: Invalid JSON - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Please check your input data",
		})
		return
	}

	if err := validateFeedback(&updateData); err != nil {
		log.Printf("UpdateFeedback: Validation failed - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	updateData.Content = strings.TrimSpace(updateData.Content)

	if err := database.DB.Model(&feedback).Updates(updateData).Error; err != nil {
		log.Printf("UpdateFeedback: Database error - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to update feedback",
		})
		return
	}

	log.Printf("UpdateFeedback: Successfully updated feedback %s in %v", id, time.Since(start))
	c.JSON(http.StatusOK, feedback)
}

func DeleteFeedback(c *gin.Context) {
	start := time.Now()
	id := c.Param("id")
	log.Printf("DeleteFeedback: Request started for ID %s", id)

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Feedback ID is required",
		})
		return
	}

	result := database.DB.Delete(&models.Feedback{}, "id = ?", id)
	if result.Error != nil {
		log.Printf("DeleteFeedback: Database error - %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to delete feedback",
		})
		return
	}

	if result.RowsAffected == 0 {
		log.Printf("DeleteFeedback: Feedback not found")
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Feedback not found",
			"message": "The requested feedback does not exist",
		})
		return
	}

	log.Printf("DeleteFeedback: Successfully deleted feedback %s in %v", id, time.Since(start))
	c.JSON(http.StatusOK, gin.H{"message": "Feedback deleted successfully"})
}
