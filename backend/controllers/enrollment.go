package controllers

import (
	"aicodeium/initializers"
	"aicodeium/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func JoinClassroom(c *gin.Context) {
	code := c.Param("code")
	// userID := c.GetString("userID")
	userID := c.GetUint("userID")
	userRole := c.GetString("role")

	if userRole != "student" {
		c.JSON(403, gin.H{"error": "Only students can join classrooms"})
		return
	}

	// find clasroom by code
	var classroom models.Classroom
	if err := initializers.DB.Where("invite_code = ?", code).First(&classroom).Error; err != nil {
		c.JSON(404, gin.H{"error": "Invalid invite code"})
		return
	}

	if classroom.Archived {
		c.JSON(http.StatusForbidden, gin.H{"error": "This class is archived"})
		return
	}

	// check if user already enrolled
	var existing models.Enrollment
	if err := initializers.DB.Where("student_id = ? AND classroom_id = ?", userID, classroom.ID).First(&existing).Error; err == nil {
		c.JSON(400, gin.H{"error": "Already enrolled in this classroom"})
		return
	}

	var user models.User
	if err := initializers.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "user not found",
		})
		return
	}

	// Create enrollment
	enrollment := models.Enrollment{
		ClassroomID: classroom.ID,
		StudentID:   uint(userID),
		StudentName: user.Name,
	}

	if err := initializers.DB.Create(&enrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join classroom"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully joined classroom",
		"classroom": gin.H{
			"id":   classroom.ID,
			"name": classroom.Name,
		},
	})
}

func GetClassroomStudents(c *gin.Context) {
	classroomID := c.Param("id")
	userID := c.GetUint("userID")
	userRole := c.GetString("role")

	if userRole != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only teachers can view student list"})
		return
	}

	var classroom models.Classroom
	if err := initializers.DB.First(&classroom, classroomID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Classroom not found"})
		return
	}

	if classroom.TeacherID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You dont own this classroom"})
		return
	}

	var enrollments []models.Enrollment
	if err := initializers.DB.Where("classroom_id = ?", classroomID).Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	c.JSON(http.StatusOK, enrollments)
}
