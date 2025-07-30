package handlers

import (
	"coaching-backend/database"
	"coaching-backend/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

func CreateFeedback(c *gin.Context) {
	var feedback models.Feedback
	if err := c.ShouldBindJSON(&feedback); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if feedback.TargetType == "team" {
		var team models.Team
		if err := database.DB.First(&team, "id = ?", feedback.TargetID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}
		feedback.TargetName = team.Name
	} else if feedback.TargetType == "member" {
		var member models.TeamMember
		if err := database.DB.First(&member, "id = ?", feedback.TargetID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
			return
		}
		feedback.TargetName = member.Name
	}

	feedback.ID = uuid.New().String()
	if err := database.DB.Create(&feedback).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create feedback"})
		return
	}

	c.JSON(http.StatusCreated, feedback)
}

func GetFeedbacks(c *gin.Context) {
	var feedbacks []models.Feedback

	targetType := c.Query("target_type")
	targetID := c.Query("target_id")

	query := database.DB
	if targetType != "" {
		query = query.Where("target_type = ?", targetType)
	}
	if targetID != "" {
		query = query.Where("target_id = ?", targetID)
	}

	if err := query.Order("created_at DESC").Find(&feedbacks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch feedbacks"})
		return
	}

	c.JSON(http.StatusOK, feedbacks)
}

func GetFeedback(c *gin.Context) {
	id := c.Param("id")
	var feedback models.Feedback

	if err := database.DB.First(&feedback, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Feedback not found"})
		return
	}

	c.JSON(http.StatusOK, feedback)
}

func UpdateFeedback(c *gin.Context) {
	id := c.Param("id")
	var feedback models.Feedback

	if err := database.DB.First(&feedback, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Feedback not found"})
		return
	}

	var updateData models.Feedback
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Model(&feedback).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update feedback"})
		return
	}

	c.JSON(http.StatusOK, feedback)
}

func DeleteFeedback(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Feedback{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete feedback"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Feedback deleted successfully"})
}
