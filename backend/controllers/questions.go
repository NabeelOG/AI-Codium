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

func GetClassroomQuestions(c *gin.Context) {
	classroomID := c.Param("id")
	userID := c.GetUint("userID")
	userRole := c.GetString("role")

	// First, verify the clssroom exists
	var classroom models.Classroom
	if err := initializers.DB.First(&classroom, classroomID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Classroom not found",
		})
		return
	}

	if userRole == "student" {
		var enrollment models.Enrollment
		if err := initializers.DB.Where("classroom_id = ? AND student_id = ?", classroomID, userID).First(&enrollment).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "you are not enrollexd in the class",
			})
			return
		}
	} else if userRole == "teacher" {
		if classroom.TeacherID != userID {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "You dont own this classroom",
			})
			return
		}
	} else {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Invalid role",
		})
		return
	}

	var questions []models.Question
	if err := initializers.DB.Where("classroom_id = ?", classroomID).Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch questions",
		})
		return
	}
	c.JSON(http.StatusOK, questions)
}

func GetQuestion(c *gin.Context) {
	questionID := c.Param("id")

	var question models.Question
	if err := initializers.DB.First(&question, questionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Question not found",
		})
		return
	}

	c.JSON(http.StatusOK, question)
}

func UpdateQuestion(c *gin.Context) {
	questionID := c.Param("id")
	userID := c.GetUint("userID")
	userRole := c.GetString("role")

	// Only teacher can create questions
	if userRole != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Only teacher can create question",
		})
		return
	}

	// Find the question
	var question models.Question
	if err := initializers.DB.First(&question, questionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "question not found",
		})
		return
	}

	// verify teacher ows the classroom that this question belongs to
	var classroom models.Classroom
	if err := initializers.DB.First(&classroom, question.ClassroomID).Error; err != nil {
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

	// Update question fields
	question.Title = body.Title
	question.Description = body.Description
	question.Difficulty = body.Difficulty
	question.Language = body.Language
	question.Constraints = body.Constraints
	question.TemplateCode = body.TemplateCode

	if err := initializers.DB.Save(&question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update question",
		})
		return
	}

	c.JSON(http.StatusCreated, question)
}

func DeleteQuestion(c *gin.Context) {
	questionID := c.Param("id")
	userID := c.GetUint("userID")
	userRole := c.GetString("role")

	// Only teacher can create questions
	if userRole != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Only teacher can delete question",
		})
		return
	}

	// Find the question
	var question models.Question
	if err := initializers.DB.First(&question, questionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "question not found",
		})
		return
	}

	// verify teacher ows the classroom that this question belongs to
	var classroom models.Classroom
	if err := initializers.DB.First(&classroom, question.ClassroomID).Error; err != nil {
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

	// Delete the question
	if err := initializers.DB.Delete(&question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete question",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Question deleted successfully",
	})
}
