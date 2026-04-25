package initializers

import (
	"aicodeium/models"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	DB *gorm.DB
)

func ConnectDB() {
	dsn := os.Getenv("DB_URL")
	if dsn == "" {
		dsn = "postgresql://postgres:password@localhost:5432/codeclass?sslmode=disable"
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("could not connect to database:", err)
	}
}

func SyncDB() {
	DB.AutoMigrate(&models.User{})
}
