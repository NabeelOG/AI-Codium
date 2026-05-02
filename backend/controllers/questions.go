package controllers

import (
	"aicodeium/initializers"
	"aicodeium/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateQuestion(c *gin.Context) {
	classroomID := c.Param("id")
	userID := c.GetUint("userID")
	userRole := c.GetString("role")

	// Only teacher can create questions
	if userRole != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Only teacher can create question",
		})
		return
	}

	// verify teacher owen this classroom
	var classroom models.Classroom
	if err := initializers.DB.First(&classroom, classroomID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "classroom not found",
		})
		return
	}

	if classroom.TeacherID != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You dont own this classroom",
		})
		return
	}

	// Bind request body
	var body struct {
		Title        string   `json:"title" binding:"required"`
		Description  string   `json:"description" binding:"required"`
		Difficulty   string   `json:"difficulty"`
		Language     string   `json:"language"`
		Constraints  []string `json:"constraints"`
		TemplateCode string   `json:"template_code"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Create question
	classroomIDUint, _ := strconv.ParseUint(classroomID, 10, 32)
	question := models.Question{
		ClassroomID:  uint(classroomIDUint),
		Title:        body.Title,
		Description:  body.Description,
		Difficulty:   body.Difficulty,
		Language:     body.Language,
		Constraints:  body.Constraints,
		TemplateCode: body.TemplateCode,
	}

	if err := initializers.DB.Create(&question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create question",
		})
		return
	}

	c.JSON(http.StatusCreated, question)
}
