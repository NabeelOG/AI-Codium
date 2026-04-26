package middleware

import (
	"aicodeium/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Authorizarion header required",
			})
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
			return
		}

		// 3. Extract token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// 4. Parse and validate
		claims, err := utils.ParseToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// 5. Set values in context for handlers to use
		c.Set("userID", uint(claims["user_id"].(float64)))
		c.Set("email", claims["email"])
		c.Set("role", claims["role"])

		// 6. Continue to the next handler
		c.Next()
	}
}
