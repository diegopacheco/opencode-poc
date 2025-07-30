package main

import (
	"bytes"
	"coaching-backend/database"
	"coaching-backend/handlers"
	"coaching-backend/models"
	"encoding/json"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestAPI() (*gin.Engine, *gorm.DB) {
	gin.SetMode(gin.TestMode)

	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database")
	}

	if err := models.AutoMigrate(db); err != nil {
		panic("Failed to migrate test database")
	}

	database.DB = db

	r := gin.New()

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api/v1")
	{
		members := api.Group("/members")
		{
			members.POST("", handlers.CreateTeamMember)
			members.GET("", handlers.GetTeamMembers)
			members.GET("/:id", handlers.GetTeamMember)
			members.PUT("/:id", handlers.UpdateTeamMember)
			members.DELETE("/:id", handlers.DeleteTeamMember)
		}

		teams := api.Group("/teams")
		{
			teams.POST("", handlers.CreateTeam)
			teams.GET("", handlers.GetTeams)
			teams.GET("/:id", handlers.GetTeam)
			teams.PUT("/:id", handlers.UpdateTeam)
			teams.DELETE("/:id", handlers.DeleteTeam)
			teams.POST("/assign", handlers.AssignMemberToTeam)
			teams.DELETE("/members/:memberID", handlers.RemoveMemberFromTeam)
		}

		feedbacks := api.Group("/feedbacks")
		{
			feedbacks.POST("", handlers.CreateFeedback)
			feedbacks.GET("", handlers.GetFeedbacks)
			feedbacks.GET("/:id", handlers.GetFeedback)
			feedbacks.PUT("/:id", handlers.UpdateFeedback)
			feedbacks.DELETE("/:id", handlers.DeleteFeedback)
		}
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return r, db
}

func TestHealthEndpoint(t *testing.T) {
	router, _ := setupTestAPI()

	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "ok", response["status"])
}

func TestCORSHeaders(t *testing.T) {
	router, _ := setupTestAPI()

	req := httptest.NewRequest("OPTIONS", "/api/v1/members", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNoContent, w.Code)
	assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "GET, POST, PUT, DELETE, OPTIONS", w.Header().Get("Access-Control-Allow-Methods"))
	assert.Equal(t, "Content-Type, Authorization", w.Header().Get("Access-Control-Allow-Headers"))
}

func TestCompleteWorkflow(t *testing.T) {
	router, _ := setupTestAPI()

	member := models.TeamMember{
		Name:  "John Doe",
		Email: "john@example.com",
	}

	body, _ := json.Marshal(member)
	req := httptest.NewRequest("POST", "/api/v1/members", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var createdMember models.TeamMember
	err := json.Unmarshal(w.Body.Bytes(), &createdMember)
	assert.NoError(t, err)
	memberID := createdMember.ID

	team := models.Team{
		Name: "Engineering Team",
	}

	body, _ = json.Marshal(team)
	req = httptest.NewRequest("POST", "/api/v1/teams", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var createdTeam models.Team
	err = json.Unmarshal(w.Body.Bytes(), &createdTeam)
	assert.NoError(t, err)
	teamID := createdTeam.ID

	assignReq := handlers.AssignRequest{
		MemberID: memberID,
		TeamID:   teamID,
	}

	body, _ = json.Marshal(assignReq)
	req = httptest.NewRequest("POST", "/api/v1/teams/assign", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	feedback := models.Feedback{
		Content:    "Great work on the project!",
		TargetType: "member",
		TargetID:   memberID,
	}

	body, _ = json.Marshal(feedback)
	req = httptest.NewRequest("POST", "/api/v1/feedbacks", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var createdFeedback models.Feedback
	err = json.Unmarshal(w.Body.Bytes(), &createdFeedback)
	assert.NoError(t, err)
	assert.Equal(t, "Great work on the project!", createdFeedback.Content)
	assert.Equal(t, "John Doe", createdFeedback.TargetName)
}
