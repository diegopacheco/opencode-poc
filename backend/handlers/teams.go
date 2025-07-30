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

func validateTeam(team *models.Team) error {
	if strings.TrimSpace(team.Name) == "" {
		return fmt.Errorf("team name is required")
	}
	if len(strings.TrimSpace(team.Name)) < 2 {
		return fmt.Errorf("team name must be at least 2 characters")
	}
	if len(strings.TrimSpace(team.Name)) > 50 {
		return fmt.Errorf("team name must be less than 50 characters")
	}
	return nil
}

func CreateTeam(c *gin.Context) {
	start := time.Now()
	log.Printf("CreateTeam: Request started")

	var team models.Team
	if err := c.ShouldBindJSON(&team); err != nil {
		log.Printf("CreateTeam: Invalid JSON - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Please check your input data",
		})
		return
	}

	if err := validateTeam(&team); err != nil {
		log.Printf("CreateTeam: Validation failed - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	team.ID = uuid.New().String()
	team.Name = strings.TrimSpace(team.Name)
	team.Logo = strings.TrimSpace(team.Logo)

	if err := database.DB.Create(&team).Error; err != nil {
		log.Printf("CreateTeam: Database error - %v", err)
		if strings.Contains(err.Error(), "Duplicate entry") {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "Team already exists",
				"message": "A team with this name already exists",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"message": "Failed to create team",
			})
		}
		return
	}

	log.Printf("CreateTeam: Successfully created team %s in %v", team.ID, time.Since(start))
	c.JSON(http.StatusCreated, team)
}

func GetTeams(c *gin.Context) {
	start := time.Now()
	log.Printf("GetTeams: Request started")

	var teams []models.Team
	if err := database.DB.Preload("Members").Find(&teams).Error; err != nil {
		log.Printf("GetTeams: Database error - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to fetch teams",
		})
		return
	}

	log.Printf("GetTeams: Successfully fetched %d teams in %v", len(teams), time.Since(start))
	c.JSON(http.StatusOK, teams)
}

func GetTeam(c *gin.Context) {
	start := time.Now()
	id := c.Param("id")
	log.Printf("GetTeam: Request started for ID %s", id)

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Team ID is required",
		})
		return
	}

	var team models.Team
	if err := database.DB.Preload("Members").First(&team, "id = ?", id).Error; err != nil {
		log.Printf("GetTeam: Team not found - %v", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Team not found",
			"message": "The requested team does not exist",
		})
		return
	}

	log.Printf("GetTeam: Successfully fetched team %s in %v", id, time.Since(start))
	c.JSON(http.StatusOK, team)
}

func UpdateTeam(c *gin.Context) {
	start := time.Now()
	id := c.Param("id")
	log.Printf("UpdateTeam: Request started for ID %s", id)

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Team ID is required",
		})
		return
	}

	var team models.Team
	if err := database.DB.First(&team, "id = ?", id).Error; err != nil {
		log.Printf("UpdateTeam: Team not found - %v", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Team not found",
			"message": "The requested team does not exist",
		})
		return
	}

	var updateData models.Team
	if err := c.ShouldBindJSON(&updateData); err != nil {
		log.Printf("UpdateTeam: Invalid JSON - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Please check your input data",
		})
		return
	}

	if err := validateTeam(&updateData); err != nil {
		log.Printf("UpdateTeam: Validation failed - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	updateData.Name = strings.TrimSpace(updateData.Name)
	updateData.Logo = strings.TrimSpace(updateData.Logo)

	if err := database.DB.Model(&team).Updates(updateData).Error; err != nil {
		log.Printf("UpdateTeam: Database error - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to update team",
		})
		return
	}

	log.Printf("UpdateTeam: Successfully updated team %s in %v", id, time.Since(start))
	c.JSON(http.StatusOK, team)
}

func DeleteTeam(c *gin.Context) {
	start := time.Now()
	id := c.Param("id")
	log.Printf("DeleteTeam: Request started for ID %s", id)

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Team ID is required",
		})
		return
	}

	result := database.DB.Delete(&models.Team{}, "id = ?", id)
	if result.Error != nil {
		log.Printf("DeleteTeam: Database error - %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to delete team",
		})
		return
	}

	if result.RowsAffected == 0 {
		log.Printf("DeleteTeam: Team not found")
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Team not found",
			"message": "The requested team does not exist",
		})
		return
	}

	log.Printf("DeleteTeam: Successfully deleted team %s in %v", id, time.Since(start))
	c.JSON(http.StatusOK, gin.H{"message": "Team deleted successfully"})
}

type AssignRequest struct {
	MemberID string `json:"member_id" binding:"required"`
	TeamID   string `json:"team_id" binding:"required"`
}

func AssignMemberToTeam(c *gin.Context) {
	start := time.Now()
	log.Printf("AssignMemberToTeam: Request started")

	var req AssignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("AssignMemberToTeam: Invalid JSON - %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Member ID and Team ID are required",
		})
		return
	}

	var member models.TeamMember
	if err := database.DB.First(&member, "id = ?", req.MemberID).Error; err != nil {
		log.Printf("AssignMemberToTeam: Member not found - %v", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Member not found",
			"message": "The requested team member does not exist",
		})
		return
	}

	var team models.Team
	if err := database.DB.First(&team, "id = ?", req.TeamID).Error; err != nil {
		log.Printf("AssignMemberToTeam: Team not found - %v", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Team not found",
			"message": "The requested team does not exist",
		})
		return
	}

	member.TeamID = &req.TeamID
	if err := database.DB.Save(&member).Error; err != nil {
		log.Printf("AssignMemberToTeam: Database error - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to assign member to team",
		})
		return
	}

	log.Printf("AssignMemberToTeam: Successfully assigned member %s to team %s in %v", req.MemberID, req.TeamID, time.Since(start))
	c.JSON(http.StatusOK, gin.H{"message": "Member assigned to team successfully"})
}

func RemoveMemberFromTeam(c *gin.Context) {
	start := time.Now()
	memberID := c.Param("memberID")
	log.Printf("RemoveMemberFromTeam: Request started for member ID %s", memberID)

	if memberID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Member ID is required",
		})
		return
	}

	var member models.TeamMember
	if err := database.DB.First(&member, "id = ?", memberID).Error; err != nil {
		log.Printf("RemoveMemberFromTeam: Member not found - %v", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Member not found",
			"message": "The requested team member does not exist",
		})
		return
	}

	member.TeamID = nil
	if err := database.DB.Save(&member).Error; err != nil {
		log.Printf("RemoveMemberFromTeam: Database error - %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to remove member from team",
		})
		return
	}

	log.Printf("RemoveMemberFromTeam: Successfully removed member %s from team in %v", memberID, time.Since(start))
	c.JSON(http.StatusOK, gin.H{"message": "Member removed from team successfully"})
}
