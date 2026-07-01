package controllers

import (
	"aicodeium/initializers"
	"aicodeium/models"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func SubmitCode(c *gin.Context) {
	questionID := c.Param("id")
	studentID := c.GetUint("userID")
	studentRole := c.GetString("role")

	if studentRole != "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only students can submit code"})
		return
	}

	// Get question
	var question models.Question
	if err := initializers.DB.First(&question, questionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	// Check enrollment
	var enrollment models.Enrollment
	if err := initializers.DB.Where("classroom_id = ? AND student_id = ?", question.ClassroomID, studentID).First(&enrollment).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not enrolled"})
		return
	}

	// Get student
	var student models.User
	initializers.DB.First(&student, studentID)

	// Bind code
	var body struct {
		Code string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get LLM feedback
	feedback, err := GetLLMFeedback(question, body.Code)
	if err != nil {
		feedback = "Could not generate feedback at this time."
	}

	// Run ML classification (best-effort, never blocks)
	category, confidence := classifyCode(body.Code, question.Language, "")

	// Create submission
	submission := models.Submission{
		QuestionID:      question.ID,
		ClassroomID:     question.ClassroomID,
		StudentID:       studentID,
		StudentName:     student.Name,
		Code:            body.Code,
		Feedback:        feedback,
		ErrorCategory:   category,
		ErrorConfidence: confidence,
	}
	initializers.DB.Create(&submission)

	// Enforce max 3 submissions per student per question
	var allSubs []models.Submission
	initializers.DB.Where("question_id = ? AND student_id = ?", question.ID, studentID).
		Order("created_at DESC").
		Find(&allSubs)
	if len(allSubs) > 3 {
		for _, s := range allSubs[3:] {
			initializers.DB.Delete(&s)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Code submitted successfully",
		"feedback":   feedback,
		"submission": submission,
	})
}

// checkSyntax performs basic syntax validation before calling the ML service.
// For JS/TS: counts braces, parens, brackets and checks for unmatched quotes.
// For Python: checks for missing colons and unbalanced quotes.
func checkSyntax(code, language string) (string, float64) {
	lang := strings.ToLower(language)

	if lang == "javascript" || lang == "typescript" {
		openBraces := strings.Count(code, "{")
		closeBraces := strings.Count(code, "}")
		openParens := strings.Count(code, "(")
		closeParens := strings.Count(code, ")")
		openBrackets := strings.Count(code, "[")
		closeBrackets := strings.Count(code, "]")

		if openBraces != closeBraces || openParens != closeParens || openBrackets != closeBrackets {
			return "Syntax Error", 0.95
		}

		// Check for unmatched single/double quote pairs (simple heuristic)
		for _, q := range []string{"'", "\"", "`"} {
			if strings.Count(code, q)%2 != 0 {
				return "Syntax Error", 0.95
			}
		}
	}

	if lang == "python" {
		// Check for missing colon after def/if/for/while/class/except/else/elif/try
		lines := strings.Split(code, "\n")
		for _, line := range lines {
			trimmed := strings.TrimSpace(line)
			if strings.HasPrefix(trimmed, "def ") || strings.HasPrefix(trimmed, "if ") ||
				strings.HasPrefix(trimmed, "for ") || strings.HasPrefix(trimmed, "while ") ||
				strings.HasPrefix(trimmed, "class ") || strings.HasPrefix(trimmed, "except") ||
				strings.HasPrefix(trimmed, "else") || strings.HasPrefix(trimmed, "elif ") ||
				strings.HasPrefix(trimmed, "try") {
				if !strings.HasSuffix(strings.TrimSpace(trimmed), ":") {
					return "Syntax Error", 0.95
				}
			}
		}

		// Check for unbalanced quotes
		for _, q := range []string{"'", "\""} {
			if strings.Count(code, q)%2 != 0 {
				return "Syntax Error", 0.95
			}
		}
	}

	return "", 0.0
}

// classifyCode calls the ML service to classify the error category.
// It first runs checkSyntax for fast-path syntax detection.
// On any failure (network error, timeout, bad response), returns empty strings.
func classifyCode(code, language, stderr string) (string, float64) {
	// Fast-path: local syntax check first
	if category, confidence := checkSyntax(code, language); category != "" {
		return category, confidence
	}

	// Call ML service
	mlURL := os.Getenv("ML_SERVICE_URL")
	if mlURL == "" {
		mlURL = "http://localhost:8081"
	}

	reqBody := map[string]string{
		"code":     code,
		"stderr":   stderr,
		"language": language,
	}
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", 0.0
	}

	client := &http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequest("POST", mlURL+"/classify", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", 0.0
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", 0.0
	}
	defer resp.Body.Close()

	var result struct {
		Category   string  `json:"category"`
		Confidence float64 `json:"confidence"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", 0.0
	}

	return result.Category, result.Confidence
}

func GetLLMFeedback(question models.Question, code string) (string, error) {
	apiKey := os.Getenv("DEEPSEEK_API_KEY")
	if apiKey == "" {
		return "DeepSeek API key not configured. Your code has been saved.", nil
	}

	prompt := fmt.Sprintf(`You are a coding instructor. Analyze this student's code solution and provide constructive feedback.

		Question: %s
		Description: %s

		Constraints: %v

		Student's Code:
		%s

		Provide feedback in this JSON format:
		{
		  "status": "passed" or "error" or "needs_improvement",
		  "suggestions": "Specific suggestions to improve the code",
		  "issues": "Any errors or issues found"
		}

		Keep it concise and helpful.`, question.Title, question.Description, question.Constraints, code)

	// Call DeepSeek API
	resp, err := callDeepSeek(apiKey, prompt)
	if err != nil {
		return "", err
	}

	return resp, nil
}

func callDeepSeek(apiKey, prompt string) (string, error) {
	url := "https://api.deepseek.com/v1/chat/completions"

	requestBody := map[string]interface{}{
		"model": "deepseek-chat",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"temperature": 0.7,
		"max_tokens":  500,
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	// Check for error in response
	if errMsg, ok := result["error"]; ok {
		return "", fmt.Errorf("API error: %v", errMsg)
	}

	// Extract the response content
	if choices, ok := result["choices"].([]interface{}); ok && len(choices) > 0 {
		if choice, ok := choices[0].(map[string]interface{}); ok {
			if message, ok := choice["message"].(map[string]interface{}); ok {
				if content, ok := message["content"].(string); ok {
					return content, nil
				}
			}
		}
	}

	return "", fmt.Errorf("unexpected response format from DeepSeek API")
}

func GetStudentSubmissions(c *gin.Context) {
	questionID := c.Param("id")
	studentID := c.GetUint("userID")
	studentRole := c.GetString("role")

	if studentRole != "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only students can view their submissions"})
		return
	}

	submissions := []models.Submission{}
	if err := initializers.DB.Where("question_id = ? AND student_id = ?", questionID, studentID).
		Order("created_at DESC").
		Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch submissions"})
		return
	}

	c.JSON(http.StatusOK, submissions)
}

func GetMySubmission(c *gin.Context) {
	questionID := c.Param("id")
	studentID := c.GetUint("userID")

	var submission models.Submission
	result := initializers.DB.Where("question_id = ? AND student_id = ?", questionID, studentID).
		Order("created_at DESC").
		First(&submission)

	if result.Error != nil {
		c.JSON(http.StatusOK, gin.H{"submitted": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"submitted":  true,
		"submission": submission,
	})
}

func GetClassroomMySubmissions(c *gin.Context) {
	classroomID := c.Param("id")
	studentID := c.GetUint("userID")
	studentRole := c.GetString("role")

	if studentRole != "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only students can view their submissions"})
		return
	}

	submissions := []models.Submission{}
	if err := initializers.DB.Where("classroom_id = ? AND student_id = ?", classroomID, studentID).
		Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch submissions"})
		return
	}

	c.JSON(http.StatusOK, submissions)
}

func GetQuestionSubmissions(c *gin.Context) {
	questionID := c.Param("id")
	userID := c.GetUint("userID")
	userRole := c.GetString("role")

	if userRole != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only teachers can view all submissions"})
		return
	}

	var question models.Question
	if err := initializers.DB.First(&question, questionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	var classroom models.Classroom
	if err := initializers.DB.First(&classroom, question.ClassroomID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Classroom not found"})
		return
	}

	if classroom.TeacherID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You dont own this classroom"})
		return
	}

	submissions := []models.Submission{}
	if err := initializers.DB.Where("question_id = ?", questionID).
		Order("created_at DESC").
		Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch submissions"})
		return
	}

	c.JSON(http.StatusOK, submissions)
}
