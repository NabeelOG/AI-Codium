package models

import (
	"time"

	"gorm.io/gorm"
)

type Enrollment struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	ClassroomID uint           `gorm:"not null;uniqueIndex:idx_classroom_student" json:"classroom_id"`
	StudentID   uint           `gorm:"not null;uniqueIndex:idx_classroom_student" json:"student_id"`
	StudentName string         `gorm:"not null" json:"student_name"` // Denormalized for easy display
}
