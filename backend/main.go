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

	// Public join preview (no auth required)
	router.GET("/join/:code", controllers.GetClassroomByCode)

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
		// Classrooms
		api.POST("/classrooms", controllers.CreateClassroom)
		api.GET("/classrooms", controllers.GetClassrooms)
		api.GET("/classrooms/:id", controllers.GetClassroomByID)
		api.GET("/classrooms/code/:code", controllers.GetClassroomByCode)

		// Enrollments
		api.POST("/join/:code", controllers.JoinClassroom)

		// Questions
		api.GET("/classrooms/:id/questions", controllers.GetClassroomQuestions)
		api.POST("/classrooms/:id/questions", controllers.CreateQuestion)
		api.GET("/questions/:id", controllers.GetQuestion)
		api.PUT("/questions/:id", controllers.UpdateQuestion)
		api.DELETE("/questions/:id", controllers.DeleteQuestion)

		// Submissions
		api.POST("/questions/:id/submit", controllers.SubmitCode)
		api.GET("/questions/:id/submissions", controllers.GetQuestionSubmissions)
		api.GET("/questions/:id/my-submissions", controllers.GetStudentSubmissions)
		api.GET("/questions/:id/my-submission", controllers.GetMySubmission)
		api.GET("/classrooms/:id/my-submissions", controllers.GetClassroomMySubmissions)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router.Run(":" + port)
}
