package main

import (
	"aicodeium/controllers"
	"aicodeium/initializers"
	"aicodeium/middleware"
	"os"

	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnv()
	initializers.ConnectDB()
	initializers.SyncDB()
}

func main() {
	router := gin.Default()

	router.Use(initializers.SetupCORS())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	auth := router.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
		auth.POST("/logout", controllers.Logout)
		auth.GET("/me", middleware.RequireAuth(), controllers.Me)
	}

	api := router.Group("/")
	api.Use(middleware.RequireAuth())
	{
		api.POST("/classrooms", controllers.CreateClassroom)
		api.GET("/classrooms", controllers.GetClassrooms)
		api.GET("/classrooms/:id", controllers.GetClassroomByID)
		api.GET("/classrooms/code/:code", controllers.GetClassroomByCode)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router.Run(":" + port)
}
