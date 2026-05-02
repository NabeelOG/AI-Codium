package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"

	"gorm.io/gorm"
)

type StringSlice []string

func (s *StringSlice) Scan(value interface{}) error {
	if value == nil {
		*s = StringSlice{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to scan StringSlice")
	}
	return json.Unmarshal(bytes, s)
}

func (s StringSlice) Value() (driver.Value, error) {
	if len(s) == 0 {
		return "[]", nil
	}
	return json.Marshal(s)
}

type Question struct {
	gorm.Model
	ClassroomID  uint        `gorm:"not null;index" json:"classroom_id"`
	Title        string      `gorm:"not null" json:"title"`
	Description  string      `gorm:"type:text" json:"description"`
	Difficulty   string      `json:"difficulty"`
	Language     string      `json:"language"`
	Constraints  StringSlice `gorm:"type:json" json:"constraints"`
	TemplateCode string      `gorm:"type:text" json:"template_code"`
}
