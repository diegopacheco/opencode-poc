package main

import (
	"coaching-backend/database"
	"coaching-backend/handlers"
	"github.com/gin-gonic/gin"
)

func main() {
	database.Connect()

	r := gin.Default()

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

	r.Run(":8080")
}
