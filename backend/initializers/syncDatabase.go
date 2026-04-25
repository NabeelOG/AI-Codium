package initializers

import "github.com/NabeelOG/jwt_in_go/models"

func SyncDatabase() {
	DB.AutoMigrate(&models.User{})
}
