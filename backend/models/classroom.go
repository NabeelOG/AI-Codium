package models

import (
	"crypto/rand"
	"encoding/hex"

	"gorm.io/gorm"
)

type Classroom struct {
	gorm.Model
	Name        string `gorm:"not null"`
	Description string
	TeacherID   uint   `gorm:"not null;index"`
	TeacherName string `gorm:"not null"`
	InviteCode  string `gorm:"uniqueIndex;not null"`
	Archived    bool   `gorm:"default:false"`
}

func GenerateInviteCode() (string, error) {
	bytes := make([]byte, 3)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (c *Classroom) BeforeCreate(tx *gorm.DB) error {
	if c.InviteCode == "" {
		code, err := GenerateInviteCode()
		if err != nil {
			return err
		}
		c.InviteCode = code
	}
	return nil
}
