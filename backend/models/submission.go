package models

import (
	"time"

	"gorm.io/gorm"
)

type Submission struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
	QuestionID      uint           `gorm:"not null;index" json:"question_id"`
	ClassroomID     uint           `gorm:"not null;index" json:"classroom_id"`
	StudentID       uint           `gorm:"not null;index" json:"student_id"`
	StudentName     string         `gorm:"not null" json:"student_name"`
	Code            string         `gorm:"type:text" json:"code"`
	Feedback        string         `gorm:"type:text" json:"feedback"`
	ErrorCategory   string         `json:"error_category"`
	ErrorConfidence float64        `json:"error_confidence"`
	SubmittedAt     time.Time      `json:"submitted_at"`
}

func (s *Submission) BeforeCreate(tx *gorm.DB) error {
	if s.SubmittedAt.IsZero() {
		s.SubmittedAt = time.Now()
	}
	return nil
}
