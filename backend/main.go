package main

import (
	"time"

	"github.com/NabeelOG/jwt_in_go/controllers"
	"github.com/NabeelOG/jwt_in_go/initializers"
	"github.com/NabeelOG/jwt_in_go/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDb()
	initializers.SyncDatabase()
}

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	api := r.Group("/api")
	api.POST("/signup", controllers.SignUp)
	api.POST("/login", controllers.Login)
	api.GET("/validate", middleware.RequireAuth, controllers.Validate)

	r.Run()
}
