package models

import (
	"time"
	"gorm.io/gorm"
)

type Submission struct {
	gorm.Model
	QuestionID  uint      `gorm:"not null;index" json:"question_id"`
	ClassroomID uint      `gorm:"not null;index" json:"classroom_id"`
	StudentID   uint      `gorm:"not null;index" json:"student_id"`
	StudentName string    `gorm:"not null" json:"student_name"`
	Code        string    `gorm:"type:text" json:"code"`
	Feedback    string    `gorm:"type:text" json:"feedback"`
	SubmittedAt time.Time `json:"submitted_at"`
}
