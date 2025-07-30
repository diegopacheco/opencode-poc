package handlers

import (
	"coaching-backend/database"
	"coaching-backend/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

func CreateTeamMember(c *gin.Context) {
	var member models.TeamMember
	if err := c.ShouldBindJSON(&member); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	member.ID = uuid.New().String()
	if err := database.DB.Create(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create team member"})
		return
	}

	c.JSON(http.StatusCreated, member)
}

func GetTeamMembers(c *gin.Context) {
	var members []models.TeamMember
	if err := database.DB.Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch team members"})
		return
	}

	c.JSON(http.StatusOK, members)
}

func GetTeamMember(c *gin.Context) {
	id := c.Param("id")
	var member models.TeamMember

	if err := database.DB.First(&member, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		return
	}

	c.JSON(http.StatusOK, member)
}

func UpdateTeamMember(c *gin.Context) {
	id := c.Param("id")
	var member models.TeamMember

	if err := database.DB.First(&member, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		return
	}

	var updateData models.TeamMember
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Model(&member).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team member"})
		return
	}

	c.JSON(http.StatusOK, member)
}

func DeleteTeamMember(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.TeamMember{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete team member"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Team member deleted successfully"})
}
