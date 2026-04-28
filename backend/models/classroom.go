package models

import (
	"crypto/rand"
	"encoding/hex"

	"gorm.io/gorm"
)

type Classroom struct {
	gorm.Model
	Name        string `gorm:"not null" json:"name"`
	Description string `json:"description"`
	TeacherID   uint   `gorm:"not null;index" json:"teacher_id"`
	TeacherName string `gorm:"not null" json:"teacher_name"`
	InviteCode  string `gorm:"uniqueIndex;not null" json:"invite_code"`
	Archived    bool   `gorm:"default:false" json:"archived"`
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
