package main

import (
	"coaching-backend/database"
	"coaching-backend/handlers"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
	"time"
)

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:5173",
			"http://localhost:8080",
		}

		if origin != "" {
			for _, allowed := range allowedOrigins {
				if origin == allowed {
					c.Header("Access-Control-Allow-Origin", origin)
					break
				}
			}
		} else {
			c.Header("Access-Control-Allow-Origin", "*")
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func requestLoggerMiddleware() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

func securityMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Next()
	}
}

func main() {
	if os.Getenv("GIN_MODE") != "debug" {
		gin.SetMode(gin.ReleaseMode)
	}

	database.Connect()

	r := gin.New()
	r.Use(requestLoggerMiddleware())
	r.Use(gin.Recovery())
	r.Use(corsMiddleware())
	r.Use(securityMiddleware())

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
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"timestamp": time.Now().Format(time.RFC3339),
			"version":   "1.0.0",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
