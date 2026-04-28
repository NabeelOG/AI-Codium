package models

import "gorm.io/gorm"

type Enrollment struct {
	gorm.Model
	ClassroomID uint   `gorm:"not null;uniqueIndex:idx_classroom_student"`
	StudentID   uint   `gorm:"not null;uniqueIndex:idx_classroom_student"`
	StudentName string `gorm:"not null"` // Denormalized for easy display
}
